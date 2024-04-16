import { ArgumentsHost, CanActivate, Catch, ExecutionContext, Injectable, UseFilters, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { JsonWebTokenError } from "jsonwebtoken";
import { Observable } from "rxjs";
import { Server, Socket } from "socket.io";
import { PrismaService } from "./@services/prisma.service";


@Injectable()
export class AppGuard implements CanActivate {

  constructor(private jwtService: JwtService) {

  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.handshake.headers;

    try {
      if (!(authorization))
        return false;
      const verify = this.jwtService.verify(authorization, {
        secret: process.env.SECRET
      });

      if (!(verify))
        return false;
      request.user = verify;
      return true;
    } catch (e) {
      return false;
    }
  }
}

@Catch()
export class ExceptionsFilter extends BaseWsExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof JsonWebTokenError) {
      console.log(exception);

      const client = host.getArgs()[0];
      client.disconnect();
      return;
    }
    super.catch(exception, host);
  }
}

@WebSocketGateway({
  cors: {
    origin: '*',
    allowedHeaders: [
      'Authorization'
    ]
  }
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService, private jwtService: JwtService) {
    this.init();
  }

  private async init() {
    setInterval(() => {
      if (this.server.sockets.sockets.size === 0)
        return;
      this.sendStatistics();
      this.sendMembers('ON_DUTY');
      this.sendMembers('OFF_DUTY');
      this.sendMembers('AWAY_FROM_KEYBOARD');
      this.sendControlCenterDetails();
    }, 1000 * 5);
  }

  @UseGuards(AppGuard)
  @UseFilters(ExceptionsFilter)
  async handleConnection(client: Socket, ...args: any[]) {
    console.log('GLOBAL >> Connected:', client.id);

    const { authorization } = client.conn.request.headers;

    try {
      if (!(authorization)) {
        client.disconnect();
        return;
      }
      const verify = this.jwtService.verify(authorization, {
        secret: process.env.SECRET
      });

      if (!(verify)) {
        client.disconnect();
        return;
      }
      await this.prisma.socketConnection.upsert({
        create: {
          userId: verify.sub,
          socketId: client.id,
          createdAt: new Date()
        },
        update: {
          socketId: client.id,
          createdAt: new Date()
        },
        where: {
          userId: verify.sub
        }
      });
    } catch (e) {

    }
  }

  @UseGuards(AppGuard)
  @UseFilters(ExceptionsFilter)
  async handleDisconnect(client: Socket) {
    console.log('GLOBAL >> Disconnected:', client.id);

    const model = await this.prisma.socketConnection.findFirst({
      where: {
        socketId: client.id
      }
    });

    if (!(model))
      return;
    await this.prisma.socketConnection.delete({
      where: {
        id: model.id
      }
    });
  }

  @UseGuards(AppGuard)
  @UseFilters(ExceptionsFilter)
  @SubscribeMessage('request-details')
  async handleDetails(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.sendControlCenterDetails();
  }

  private async sendStatistics() {
    const members: any = await this.prisma.member.aggregateRaw({
      pipeline: [{
        $match: {
          terminated: false
        }
      }, {
        $addFields: {
          userId: {
            $toObjectId: '$userId'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      }, {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          'user.role': 'USER'
        }
      }]
    });

    const onDuty = members.filter((x) => x.user?.status === 'ON_DUTY').length;
    const offDuty = members.filter((x) => x.user?.status === 'OFF_DUTY').length;
    const awayFromKeyboard = members.filter((x) => x.user?.status === 'AWAY_FROM_KEYBOARD').length;
    const offline = members.filter((x) => x.user?.status === 'OFFLINE').length;

    const response = {
      members: {
        onDuty,
        offDuty,
        awayFromKeyboard,
        offline
      }
    };

    this.server.emit('statistics', JSON.stringify(response));
  }

  private async sendMembers(type: 'ON_DUTY' | 'OFF_DUTY' | 'AWAY_FROM_KEYBOARD') {
    const members = await this.prisma.user.aggregateRaw({
      pipeline: [{
        $match: {
          status: type
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          }
        }
      }, {
        $lookup: {
          from: 'Member',
          localField: 'id',
          foreignField: 'userId',
          as: 'member'
        }
      }, {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          member: {
            $exists: true
          },
          'member.terminated': false
        }
      }, {
        $lookup: {
          from: 'ControlCenter',
          localField: 'id',
          foreignField: 'members',
          as: 'controlCenter'
        }
      }, {
        $unwind: {
          path: '$controlCenter',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          'member.groupId': {
            $toObjectId: '$member.groupId'
          }
        }
      }, {
        $lookup: {
          from: 'Group',
          localField: 'member.groupId',
          foreignField: '_id',
          as: 'group'
        }
      }, {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $sort: {
          'group.uniqueId': -1
        }
      }, {
        $addFields: {
          'member.groupId': {
            $toString: '$member.groupId'
          }
        }
      }, {
        $addFields: {
          userId: '$details.id',
          firstName: '$details.firstName',
          lastName: '$details.lastName',
          phoneNumber: '$details.phoneNumber',
          groupId: '$member.groupId',
          departmentIds: '$member.departmentIds',
          dutyNumber: '$member.dutyNumber',
          controlCenter: {
            id: {
              $toString: '$controlCenter._id'
            }
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          userId: 1,
          firstName: 1,
          lastName: 1,
          phoneNumber: 1,
          groupId: 1,
          departmentIds: 1,
          dutyNumber: 1,
          controlCenter: {
            id: 1,
            label: 1,
            type: 1
          }
        }
      }]
    });

    this.server.emit(type, JSON.stringify(members));
  }

  private async sendControlCenterDetails() {
    const response = await this.prisma.controlCenter.aggregateRaw({
      pipeline: [{
        $unwind: {
          path: '$members'
        }
      }, {
        $lookup: {
          from: 'Member',
          localField: 'members',
          foreignField: 'userId',
          as: 'tmpMember'
        }
      }, {
        $unwind: {
          path: '$tmpMember'
        }
      }, {
        $addFields: {
          memberId: {
            $toObjectId: '$members'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'memberId',
          foreignField: '_id',
          as: 'user'
        }
      }, {
        $unwind: {
          path: '$user'
        }
      }, {
        $addFields: {
          member: {
            id: {
              $toString: '$memberId'
            },
            userId: '$user.details.id',
            firstName: '$user.details.firstName',
            lastName: '$user.details.lastName',
            phoneNumber: '$user.details.phoneNumber',
            group: '$tmpMember.group',
            department: '$tmpMember.department'
          }
        }
      }, {
        $group: {
          _id: '$_id',
          type: {
            $first: '$type'
          },
          status: {
            $first: '$status'
          },
          vehicle: {
            $first: '$vehicle'
          },
          members: {
            $push: '$member'
          }
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          type: 1,
          status: 1,
          vehicle: 1,
          members: 1
        }
      }]
    });

    this.server.emit('control-center-details', JSON.stringify(response));
  }
}