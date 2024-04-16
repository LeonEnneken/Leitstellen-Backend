import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from 'src/@services/audit-log.service';
import { PrismaService } from 'src/@services/prisma.service';
import { Payload } from 'src/auth/auth.entity';
import { SetupBody, StatusBody } from './user.entity';

@Injectable()
export class UserService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService) {

  }

  async me(profile: Payload) {
    if (!(profile))
      throw new UnauthorizedException();

    const user = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      },
      select: {
        id: true,
        account: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true
          }
        },
        details: true,
        role: true,
        status: true,
        updatedAt: true,
        createdAt: true
      }
    });

    const member = await this.prisma.member.findFirst({
      where: {
        userId: user.id
      }
    });

    const permissions: string[] = [];

    if (member) {
      user['hiredDate'] = member.hiredDate;
      user['lastPromotionDate'] = member.lastPromotionDate;
      user['data'] = member.data;

      if(member.dutyNumber)
        user['dutyNumber'] = member.dutyNumber;

      const group = await this.prisma.group.findFirst({
        where: {
          id: member.groupId
        }
      });

      if (group) {
        permissions.push(...group.permissions);

        user['group'] = {
          id: group.id,
          uniqueId: group.uniqueId,
          name: group.name
        };
      }

      const departmentIds: Prisma.DepartmentWhereInput[] = [];

      for(const departmentId of member.departmentIds) {
        departmentIds.push({
          id: departmentId
        });
      }

      const departments = await this.prisma.department.findMany({
        where: {
          OR: departmentIds
        }
      });

      for(const department of departments) {
        permissions.push(...department.permissions);
      }

      user['permissions'] = [...new Set(permissions)];
    }
    return user;
  }

  async setupUser(profile: Payload, body: SetupBody) {
    if (!(profile))
      throw new UnauthorizedException();

    let user = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      }
    });

    if (!(user))
      throw new UnauthorizedException();

    if (!(user.details)) {
      const phone = body.phoneNumber.replace(/-/g, '');
      const phoneNumber = `${phone.substring(0, 2)}-${phone.substring(2, 4)}-${phone.substring(4, 7)}`;

      user = await this.prisma.user.update({
        data: {
          details: {
            id: body.id.trim(),
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            phoneNumber: phoneNumber.trim()
          },
          updatedAt: new Date()
        },
        where: {
          id: user.id
        }
      });

      const group = await this.prisma.group.findFirst({
        where: {
          default: true
        }
      });

      if (!(group))
        throw new HttpException('Group not found!', 404);

      const department = await this.prisma.department.findFirst({
        where: {
          default: true
        }
      });

      if (!(department))
        throw new HttpException('Department not found!', 404);

      const currentMember = await this.prisma.member.findFirst({
        where: {
          userId: user.id
        }
      });

      if (!(currentMember)) {
        await this.prisma.member.create({
          data: {
            userId: user.id,
            groupId: group.id,
            departmentIds: [department.id],
            hiredDate: new Date(),
            lastPromotionDate: new Date(),
            terminated: false,
            updatedAt: new Date(),
            createdAt: new Date()
          }
        });
      }

      await this.auditLog.log({
        senderId: profile.sub,
        type: 'MEMBER_HIRED',
        description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) wurde eingestellt!`
      });

      //await this.elastic.updateUser(user);

      return user;
    }
    throw new HttpException('Not Modified!', 304);
  }

  async patchStatus(profile: Payload, body: StatusBody) {
    if (!(profile))
      throw new UnauthorizedException();

    const user = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      }
    });

    if (!(user))
      throw new HttpException('User not found!', 404);

    const updated = await this.prisma.user.update({
      data: {
        status: body.status
      },
      where: {
        id: user.id
      },
      select: {
        id: true,
        account: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true
          }
        },
        details: true,
        role: true,
        status: true,
        updatedAt: true,
        createdAt: true
      }
    });

    await this.auditLog.log({
      senderId: user.id,
      type: 'USER_STATUS',
      description: `Changed status to ${body.status}`,
      changes: [user.status, updated.status]
    });

    if (body.status !== 'ON_DUTY') {
      const controlCenters = await this.prisma.controlCenter.findMany({
        where: {
          members: {
            has: user.id
          }
        }
      });

      if (controlCenters) {
        for (let item of controlCenters) {
          const oldList = [...item.members];
          item.members.splice(item.members.indexOf(user.id), 1);

          let data: any = {
            members: item.members
          };

          if (item.hasVehicle && item.members.length === 0)
            data.vehicle = { unset: true };
          if (item.hasStatus && item.members.length === 0)
            data.status = 'NOT_OCCUPIED';

          await this.prisma.controlCenter.update({
            data: data,
            where: {
              id: item.id
            }
          });

          await this.auditLog.log({
            senderId: profile.sub,
            targetId: user.id,
            type: 'CONTROL_CENTER_MEMBER_REMOVED',
            description: `Mitarbeiter aus Leitstelle entfernt. (ID: ${item.id}, Label: ${item.label})`,
            changes: [oldList.join(', '), item.members.join(', ')]
          });
        }
      }

      const timeTrackings = await this.prisma.timeTracking.findMany({
        where: {
          userId: user.id,
          finished: false
        }
      });

      for (let item of timeTrackings) {
        await this.prisma.timeTracking.update({
          data: {
            endDate: Date.now(),
            finished: true
          },
          where: {
            id: item.id
          }
        });
      }
    }
    
    if(body.status === 'AWAY_FROM_KEYBOARD') {
      let controlCenter = await this.prisma.controlCenter.findFirst({
        where: {
          type: 'AFK'
        }
      });

      if(controlCenter) {
        const oldList = [...controlCenter.members];
        controlCenter.members.push(user.id);
    
        controlCenter = await this.prisma.controlCenter.update({
          data: {
            members: controlCenter.members
          },
          where: {
            id: controlCenter.id
          }
        });

        await this.prisma.timeTracking.create({
          data: {
            userId: user.id,
            controlCenterId: controlCenter.id,
            startDate: Date.now(),
            finished: false
          }
        });

        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'CONTROL_CENTER_MEMBER_ADDED',
          description: `Mitarbeiter zur Leitstelle hinzugefügt. (ID: ${controlCenter.id}, Label: ${controlCenter.label})`,
          changes: [oldList.join(', '), controlCenter.members.join(', ')]
        });
      }
    }

    return updated;
  }

  async patchStatusOther(profile: Payload, userId: string, body: StatusBody) {
    if (!(profile))
      throw new UnauthorizedException();

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!(user))
      throw new HttpException('User not found!', 404);

    const updated = await this.prisma.user.update({
      data: {
        status: body.status
      },
      where: {
        id: user.id
      },
      select: {
        id: true,
        account: {
          select: {
            id: true,
            username: true,
            discriminator: true,
            avatar: true
          }
        },
        details: true,
        role: true,
        status: true,
        updatedAt: true,
        createdAt: true
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'USER_STATUS_OTHER',
      description: `Changed status to ${body.status}`,
      changes: [user.status, updated.status]
    });

    if (body.status !== 'ON_DUTY') {
      const controlCenters = await this.prisma.controlCenter.findMany({
        where: {
          members: {
            has: user.id
          }
        }
      });

      if (controlCenters) {
        for (let item of controlCenters) {
          const oldList = [...item.members];
          item.members.splice(item.members.indexOf(user.id), 1);

          let data: any = {
            members: item.members
          };

          if (item.hasVehicle && item.members.length === 0)
            data.vehicle = { unset: true };
          if (item.hasStatus && item.members.length === 0)
            data.status = 'NOT_OCCUPIED';

          await this.prisma.controlCenter.update({
            data: data,
            where: {
              id: item.id
            }
          });

          await this.auditLog.log({
            senderId: profile.sub,
            targetId: user.id,
            type: 'CONTROL_CENTER_MEMBER_REMOVED',
            description: `Mitarbeiter aus Leitstelle entfernt. (ID: ${item.id}, Label: ${item.label})`,
            changes: [oldList.join(', '), item.members.join(', ')]
          });
        }
      }

      const timeTrackings = await this.prisma.timeTracking.findMany({
        where: {
          userId: user.id,
          finished: false
        }
      });

      for (let item of timeTrackings) {
        await this.prisma.timeTracking.update({
          data: {
            endDate: Date.now(),
            finished: true
          },
          where: {
            id: item.id
          }
        });
      }
    }

    if(body.status === 'AWAY_FROM_KEYBOARD') {
      let controlCenter = await this.prisma.controlCenter.findFirst({
        where: {
          type: 'AFK'
        }
      });

      if(controlCenter) {
        const oldList = [...controlCenter.members];
        controlCenter.members.push(user.id);
    
        controlCenter = await this.prisma.controlCenter.update({
          data: {
            members: controlCenter.members
          },
          where: {
            id: controlCenter.id
          }
        });

        await this.prisma.timeTracking.create({
          data: {
            userId: user.id,
            controlCenterId: controlCenter.id,
            startDate: Date.now(),
            finished: false
          }
        });

        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'CONTROL_CENTER_MEMBER_ADDED',
          description: `Mitarbeiter zur Leitstelle hinzugefügt. (ID: ${controlCenter.id}, Label: ${controlCenter.label})`,
          changes: [oldList.join(', '), controlCenter.members.join(', ')]
        });
      }
    }

    return updated;
  }

  async searchByType(type: 'ALL' | 'ON_DUTY' | 'OFF_DUTY' | 'AWAY_FROM_KEYBOARD' | 'OFFLINE') {
    if (type === 'ALL') {
      return this.prisma.user.aggregateRaw({
        pipeline: [{
          $match: {
            role: 'USER',
            details: {
              $exists: true
            }
          }
        }, {
          $addFields: {
            id: {
              $toString: '$_id'
            },
            userId: '$details.id',
            firstName: '$details.firstName',
            lastName: '$details.lastName',
            phoneNumber: '$details.phoneNumber'
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
          $addFields: {
            groupId: '$member.groupId',
            departmentIds: '$member.departmentIds'
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
            departmentIds: 1
          }
        }]
      });
    }
    return this.prisma.user.aggregateRaw({
      pipeline: [{
        $match: {
          details: {
            $exists: true
          },
          status: type
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          userId: '$details.id',
          firstName: '$details.firstName',
          lastName: '$details.lastName',
          phoneNumber: '$details.phoneNumber'
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
        $addFields: {
          groupId: '$member.groupId',
          departmentIds: '$member.departmentIds'
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
          departmentIds: 1
        }
      }]
    });
  }

  async getActiveFileSheets(profile: Payload) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      }
    });

    if(!(user))
      throw new HttpException('Not found!', 404);

    return await this.prisma.fileSheet.findMany({
      where: {
        targetId: user.id,
        approved: true,
        additionalPunishmentFinished: false,
        canceled: false
      },
      select: {
        id: true,
        title: true,
        strikes: true,
        additionalPunishment: true,
        createdAt: true
      }
    });
  }

  /*
  async searchUserById(id: string) {
    const response = this.elastic.searchUserById(id);

    if (!(response))
      throw new HttpException('User not found!', 404);
    return response;
  }

  async searchUser(keyword: string) {
    return this.elastic.searchUser(keyword);
  }*/
}
