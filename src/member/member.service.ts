import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from 'src/@services/audit-log.service';
import { PrismaService } from 'src/@services/prisma.service';
import { Payload } from 'src/auth/auth.entity';
import { MemberBody } from './member.entity';

@Injectable()
export class MemberService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {

  }

  async getAll() {
    return await this.prisma.member.aggregateRaw({
      pipeline: [{
        $addFields: {
          id: {
            $toString: '$_id'
          },
          userId: {
            $toObjectId: '$userId'
          },
          terminatedAt: {
            $toString: '$terminatedAt'
          },
          hiredDate: {
            $toString: '$hiredDate'
          },
          lastPromotionDate: {
            $toString: '$lastPromotionDate'
          },
          updatedAt: {
            $toString: '$updatedAt'
          },
          createdAt: {
            $toString: '$createdAt'
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
      }, {
        $addFields: {
          user: {
            id: '$user.details.id',
            firstName: '$user.details.firstName',
            lastName: '$user.details.lastName',
            phoneNumber: '$user.details.phoneNumber'
          }
        }
      }, {
        $addFields: {
          userId: {
            $toString: '$userId'
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          userId: 1,
          user: {
            id: 1,
            firstName: 1,
            lastName: 1,
            phoneNumber: 1,
            status: 1
          },
          groupId: 1,
          departmentIds: 1,
          dutyNumber: 1,
          notes: 1,
          data: 1,
          terminated: 1,
          terminatedAt: 1,
          hiredDate: 1,
          lastPromotionDate: 1,
          updatedAt: 1,
          createdAt: 1
        }
      }]
    });
  }

  async getPhoneNumbers() {
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
          avatar: '$account.avatar',
          fullName: {
            $concat: [
              '$details.firstName', ' ', '$details.lastName'
            ]
          },
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
        $match: {
          'member.terminated': false
        }
      }, {
        $project: {
          _id: 0,
          userId: 1,
          avatar: 1,
          fullName: 1,
          phoneNumber: 1
        }
      }, {
        $sort: {
          fullName: 1
        }
      }]
    });
  }

  async get(memberId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId
      }
    });

    if (!(member))
      throw new HttpException('Not found!', 404);

    const user = await this.prisma.user.findFirst({
      where: {
        id: member.userId
      }
    });

    if (user) {
      member['user'] = {
        id: user.details.id,
        firstName: user.details.firstName,
        lastName: user.details.lastName,
        phoneNumber: user.details.phoneNumber,
        status: user.status
      };
    }
    return member;
  }

  async patch(profile: Payload, memberId: string, body: MemberBody) {
    const senderUser = await this.prisma.user.findFirst({
      where: {
        id: profile.sub
      }
    });

    if (!(senderUser))
      throw new HttpException('Sender user not found!', 404);

    let member = await this.prisma.member.findFirst({
      where: {
        id: memberId
      }
    });

    if (!(member))
      throw new HttpException('Member not found!', 404);

    let user = await this.prisma.user.findFirst({
      where: {
        id: member.userId
      }
    });

    if (!(user))
      throw new HttpException('User not found!', 404);

    if (body.user) {
      const userData: any = {
        updatedAt: new Date()
      };

      if (body.user.id.trim() !== user.details.id) {
        userData.id = body.user.id.trim();
      }
      if (body.user.firstName.trim() !== user.details.firstName) {
        userData.firstName = body.user.firstName.trim();
      }
      if (body.user.lastName.trim() !== user.details.lastName) {
        userData.lastName = body.user.lastName.trim();
      }
      if (body.user.phoneNumber !== user.details.phoneNumber) {
        userData.phoneNumber = body.user.phoneNumber;
      }

      if (Object.keys(userData).length > 1) {
        const oldUser = JSON.stringify(user);

        user = await this.prisma.user.update({
          data: {
            details: {
              set: {
                id: userData.id ? userData.id : user.details.id,
                firstName: userData.firstName ? userData.firstName : user.details.firstName,
                lastName: userData.lastName ? userData.lastName : user.details.lastName,
                phoneNumber: userData.phoneNumber ? userData.phoneNumber : user.details.phoneNumber
              }
            },
            updatedAt: new Date()
          },
          where: {
            id: user.id
          }
        });

        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'USER_PATCHED_OTHER',
          description: 'User patched by other user!',
          changes: [oldUser, JSON.stringify(user)]
        });
      }
    }

    const data: any = {
      updatedAt: new Date()
    };

    if (body.groupId !== member.groupId) {
      const currentGroup = await this.prisma.group.findFirst({
        where: {
          id: member.groupId
        }
      });

      if (!(currentGroup))
        throw new HttpException('Current group not found!', 404);

      const group = await this.prisma.group.findFirst({
        where: {
          id: body.groupId
        }
      });

      if (!(group))
        throw new HttpException('New group not found!', 404);

      if (senderUser.role !== 'ADMINISTRATOR') {
        const senderMember = await this.prisma.member.findFirst({
          where: {
            userId: senderUser.id
          }
        });

        if (!(senderMember))
          throw new HttpException('Sender member not found!', 404);

        const senderGroup = await this.prisma.group.findFirst({
          where: {
            id: senderMember.groupId
          }
        });

        if (!(senderGroup))
          throw new HttpException('Sender group not found!', 404);

        if (group.uniqueId >= senderGroup.uniqueId)
          throw new HttpException('Group not allowed to change!', 500);
      }

      if (group.uniqueId !== -1 && group.uniqueId > currentGroup.uniqueId) {
        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'MEMBER_PROMOTED',
          description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) wurde zum ${group.name} befördert!`,
          changes: [currentGroup.id, group.id]
        });
      }

      if (group.uniqueId !== -1 && group.uniqueId < currentGroup.uniqueId) {
        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'MEMBER_DEMOTED',
          description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) wurde zum ${group.name} degradiert!`,
          changes: [currentGroup.id, group.id]
        });
      }

      data.groupId = group.id;

      body.lastPromotionDate = new Date();
    }

    member.departmentIds.sort((a, b) => a.localeCompare(b));
    body.departmentIds.sort((a, b) => a.localeCompare(b));

    if (JSON.stringify(body.departmentIds) !== JSON.stringify(member.departmentIds)) {
      const departmentIds: Prisma.DepartmentWhereInput[] = [];

      for(const departmentId of body.departmentIds) {
        departmentIds.push({
          id: departmentId
        });
      }

      const departments = await this.prisma.department.findMany({
        where: {
          OR: departmentIds
        }
      });
      const ids: string[] = [];

      for(const department of departments) {
        await this.auditLog.log({
          senderId: profile.sub,
          targetId: user.id,
          type: 'MEMBER_DEPARTMENT_PATCHED',
          description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) ist nun in der ${department.name} Abteilung!`,
          changes: [JSON.stringify(member.departmentIds), department.id]
        });
  
        ids.push(department.id);
      }
      data.departmentIds = ids;
    }

    if (body.dutyNumber !== member.dutyNumber) {
      data.dutyNumber = body.dutyNumber;
    }

    if (body.notes !== member.notes) {
      data.notes = body.notes;
    }

    if (body.data && JSON.stringify(body.data) !== JSON.stringify(member.data))
      data.data = JSON.parse(JSON.stringify(body.data));

    const hiredDate = new Date(member.hiredDate).getTime();
    const newHiredDate = new Date(body.hiredDate).getTime();

    if (body.hiredDate && hiredDate !== newHiredDate)
      data.hiredDate = body.hiredDate;

    const lastPromotionDate = new Date(member.lastPromotionDate).getTime();
    const newLastPromotionDate = new Date(body.lastPromotionDate).getTime();

    if (body.lastPromotionDate && lastPromotionDate !== newLastPromotionDate)
      data.lastPromotionDate = body.lastPromotionDate;

    if (Object.keys(data).length > 1) {
      const oldMember = JSON.stringify(member);

      member = await this.prisma.member.update({
        data: data,
        where: {
          id: member.id
        }
      });

      await this.auditLog.log({
        senderId: profile.sub,
        targetId: user.id,
        type: 'MEMBER_PATCHED',
        description: 'Member patched!',
        changes: [oldMember, JSON.stringify(member)]
      });
    }

    member['user'] = {
      id: user.details.id,
      firstName: user.details.firstName,
      lastName: user.details.lastName,
      phoneNumber: user.details.phoneNumber,
      status: user.status
    };

    return member;
  }

  async hire(profile: Payload, memberId: string) {
    let member = await this.prisma.member.findFirst({
      where: {
        id: memberId
      }
    });

    if (!(member))
      throw new HttpException('Not found!', 404);

    if (!(member.terminated))
      throw new HttpException('Member already hired!', 409);

    let user = await this.prisma.user.findFirst({
      where: {
        id: member.userId
      }
    });

    if (!(user))
      throw new HttpException('User not found!', 404);

    member = await this.prisma.member.update({
      data: {
        hiredDate: new Date(),
        lastPromotionDate: new Date(),
        terminated: false,
        terminatedAt: {
          unset: true
        },
        updatedAt: new Date()
      },
      where: {
        id: member.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'MEMBER_HIRED',
      description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) wurde wieder eingestellt!`
    });
    throw new HttpException('Member hired!', 200);
  }

  async terminate(profile: Payload, memberId: string) {
    let member = await this.prisma.member.findFirst({
      where: {
        id: memberId
      }
    });

    if (!(member))
      throw new HttpException('Not found!', 404);

    if (member.terminated)
      throw new HttpException('Member already terminated!', 409);

    let user = await this.prisma.user.findFirst({
      where: {
        id: member.userId
      }
    });

    if (!(user))
      throw new HttpException('User not found!', 404);

    member = await this.prisma.member.update({
      data: {
        terminated: true,
        terminatedAt: new Date(),
        updatedAt: new Date()
      },
      where: {
        id: member.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'MEMBER_TERMINATED',
      description: `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id}) wurde gekündigt!`
    });
    throw new HttpException('Member terminated!', 200);
  }
}
