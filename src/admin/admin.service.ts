import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";

@Injectable()
export class AdminService {

  constructor(private auditLog: AuditLogService, private prisma: PrismaService) {

  }

  async addAdmin(profile: Payload, userId: string) {
    let user = await this.prisma.user.findFirst({
      where: {
        id: userId
      },
      select: {
        id: true,
        role: true,
        details: true,
        updatedAt: true,
        createdAt: true
      }
    });

    if(!(user))
      throw new HttpException('User not found!', 404);

    const oldModel = JSON.stringify(user);

    user = await this.prisma.user.update({
      data: {
        role: 'ADMINISTRATOR',
        updatedAt: new Date()
      },
      where: {
        id: user.id
      },
      select: {
        id: true,
        role: true,
        details: true,
        updatedAt: true,
        createdAt: true
      }
    });

    await this.prisma.auditLog.deleteMany({
      where: {
        OR: [{
          targetId: user.id,
          type: 'MEMBER_HIRED'
        }, {
          targetId: user.id,
          type: 'MEMBER_TERMINATED'
        }, {
          targetId: user.id,
          type: 'MEMBER_PROMOTED'
        }, {
          targetId: user.id,
          type: 'MEMBER_DEMOTED'
        }, {
          targetId: user.id,
          type: 'MEMBER_DEPARTMENT_PATCHED'
        }]
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'ADMIN_ADDED',
      description: 'Added new administrator!',
      changes: [oldModel, JSON.stringify(user)]
    });

    return user;
  }

  async removeAdmin(profile: Payload, userId: string) {
    let user = await this.prisma.user.findFirst({
      where: {
        id: userId
      },
      select: {
        id: true,
        role: true,
        details: true,
        updatedAt: true,
        createdAt: true
      }
    });

    if(!(user))
      throw new HttpException('User not found!', 404);

    const oldModel = JSON.stringify(user);

    user = await this.prisma.user.update({
      data: {
        role: 'USER',
        updatedAt: new Date()
      },
      where: {
        id: user.id
      },
      select: {
        id: true,
        role: true,
        details: true,
        updatedAt: true,
        createdAt: true
      }
    });

    await this.prisma.auditLog.deleteMany({
      where: {
        OR: [{
          targetId: user.id,
          type: 'MEMBER_HIRED'
        }, {
          targetId: user.id,
          type: 'MEMBER_TERMINATED'
        }, {
          targetId: user.id,
          type: 'MEMBER_PROMOTED'
        }, {
          targetId: user.id,
          type: 'MEMBER_DEMOTED'
        }, {
          targetId: user.id,
          type: 'MEMBER_DEPARTMENT_PATCHED'
        }]
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'ADMIN_REMOVED',
      description: 'Remove administrator!',
      changes: [oldModel, JSON.stringify(user)]
    });

    return user;
  }

  async getConnectedUsers() {
    return await this.prisma.socketConnection.aggregateRaw({
      pipeline: [{
        $addFields: {
          id: {
            $toString: '$_id'
          },
          targetId: {
            $toObjectId: '$userId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'targetId',
          foreignField: '_id',
          as: 'tmpUser'
        }
      }, {
        $unwind: {
          path: '$tmpUser',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'Member',
          localField: 'userId',
          foreignField: 'userId',
          as: 'member'
        }
      }, {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          user: {
            id: '$tmpUser.details.id',
            firstName: '$tmpUser.details.firstName',
            lastName: '$tmpUser.details.lastName',
            phoneNumber: '$tmpUser.details.phoneNumber',
            role: '$tmpUser.role',
            status: '$tmpUser.status',
            groupId: '$member.groupId',
            departmentIds: '$member.departmentIds',
            terminated: '$member.terminated'
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          userId: 1,
          socketId: 1,
          user: 1,
          createdAt: 1
        }
      }, {
        $sort: {
          createdAt: 1
        }
      }]
    });
  }

  async getAdmins() {
    return await this.prisma.user.findMany({
      where: {
        id: {
          not: '000000000000000000000000'
        },
        role: 'ADMINISTRATOR'
      },
      select: {
        id: true,
        details: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        details: {
          id: 'asc'
        }
      }
    })
  }

}