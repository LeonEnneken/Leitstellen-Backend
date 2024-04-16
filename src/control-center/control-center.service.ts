import { ConflictException, HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { ControlCenterBody } from "./control-center.entity";

@Injectable()
export class ControlCenterService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {
    this.init();
  }

  private async init() {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        type: 'AFK'
      }
    });

    if(model) {
      return;
    }
    model = await this.prisma.controlCenter.create({
      data: {
        label: 'AFK / AFK-Bot',
        type: 'AFK',
        hasStatus: false,
        hasVehicle: false,
        maxMembers: -1,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });
  }

  async getAll() {
    return await this.prisma.controlCenter.findMany({
      orderBy: {
        label: 'asc'
      }
    });
  }

  async post(profile: Payload, body: ControlCenterBody) {
    if(body.type === 'AFK') {
      throw new ConflictException('Type not allowed!');
    }

    const model = await this.prisma.controlCenter.create({
      data: {
        label: body.label,
        type: body.type.toUpperCase(),
        color: body.color,
        hasStatus: body.hasStatus,
        hasVehicle: body.hasVehicle,
        members: [],
        maxMembers: Number(body.maxMembers),
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_CREATED',
      description: 'Control center created!'
    });

    return model;
  }

  async get(id: string) {
    const model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);
    return model;
  }

  async patch(profile: Payload, id: string, body: ControlCenterBody) {
    if(body.type === 'AFK') {
      throw new ConflictException('Type not allowed!');
    }
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.controlCenter.update({
      data: {
        label: body.label,
        type: body.type.toUpperCase(),
        color: (body.color ? body.color : { unset: true }),
        hasStatus: body.hasStatus,
        hasVehicle: body.hasVehicle,
        maxMembers: Number(body.maxMembers),
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_PATCHED',
      description: 'Control center patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.controlCenter.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_DELETED',
      description: 'Control center deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  
  async patchMember(profile: Payload, id: string, userId: string) {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    if(model.maxMembers !== -1 && model.maxMembers <= model.members.length)
      throw new HttpException('Maximum members reached!', 500);

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if(!(user))
      throw new HttpException('User not found!', 404);

    const controlCenters = await this.prisma.controlCenter.findMany({
      where: {
        members: {
          has: userId
        }
      }
    });

    if(controlCenters) {
      for (let item of controlCenters) {
        const oldList = [...item.members];
        item.members.splice(item.members.indexOf(user.id), 1);

        let data: any = {
          members: item.members
        };

        if(item.hasVehicle && item.members.length === 0)
          data.vehicle = { unset: true };
        if(item.hasStatus && item.members.length === 0)
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

    if(model.members.includes(user.id))
      throw new HttpException('User already in control center.', 500);
    
    const oldList = [...model.members];
    model.members.push(user.id);

    model = await this.prisma.controlCenter.update({
      data: {
        members: model.members
      },
      where: {
        id: model.id
      }
    });

    const timeTrackings = await this.prisma.timeTracking.findMany({
      where: {
        userId: user.id,
        finished: false
      }
    });

    for(let item of timeTrackings) {
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

    await this.prisma.timeTracking.create({
      data: {
        userId: user.id,
        controlCenterId: model.id,
        startDate: Date.now(),
        finished: false
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'CONTROL_CENTER_MEMBER_ADDED',
      description: `Mitarbeiter zur Leitstelle hinzugefügt. (ID: ${model.id}, Label: ${model.label})`,
      changes: [oldList.join(', '), model.members.join(', ')]
    });

    return model;
  }

  async deleteMember(profile: Payload, id: string, userId: string) {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if(!(user))
      throw new HttpException('User not found!', 404);

    if(!(model.members.includes(user.id)))
      throw new HttpException('User not in control center.', 500);
    
    const oldList = [...model.members];
    model.members.splice(model.members.indexOf(user.id), 1);

    let data: any = {
      members: model.members
    };

    if(model.hasVehicle && model.members.length === 0)
      data.vehicle = { unset: true };
    if(model.hasStatus && model.members.length === 0)
      data.status = 'NOT_OCCUPIED';

    model = await this.prisma.controlCenter.update({
      data: data,
      where: {
        id: model.id
      }
    });

    const timeTrackings = await this.prisma.timeTracking.findMany({
      where: {
        userId: user.id,
        finished: false
      }
    });

    for(let item of timeTrackings) {
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

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: user.id,
      type: 'CONTROL_CENTER_MEMBER_REMOVED',
      description: `Mitarbeiter aus Leitstelle entfernt. (ID: ${model.id}, Label: ${model.label})`,
      changes: [oldList.join(', '), model.members.join(', ')]
    });

    return model;
  }


  async patchStatus(profile: Payload, id: string, status: 'ACTIVE' | 'ABSENT' | 'MEETING' | 'OFFICE' | 'NOT_OCCUPIED') {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    if(!(model.hasStatus))
      throw new HttpException('Control panel has no status!', 404);

    const oldModel = JSON.stringify(model);
  
    model = await this.prisma.controlCenter.update({
      data: {
        status: status,
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });
  
    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_PATCHED_STATUS',
      description: 'Control center patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }


  async patchVehicle(profile: Payload, id: string, vehicleId: string) {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    if(!(model.hasVehicle))
      throw new HttpException('Control panel has no vehicle!', 404);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId
      }
    });

    if(!(vehicle))
      throw new HttpException('Vehicle not found!', 404);

    const oldModel = JSON.stringify(model);
  
    model = await this.prisma.controlCenter.update({
      data: {
        vehicle: vehicleId,
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });
  
    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_PATCHED_VEHICLE',
      description: 'Control center patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async deleteVehicle(profile: Payload, id: string) {
    let model = await this.prisma.controlCenter.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    if(!(model.hasVehicle))
      throw new HttpException('Control panel has no vehicle!', 404);

    const oldModel = JSON.stringify(model);
  
    model = await this.prisma.controlCenter.update({
      data: {
        vehicle: {
          unset: true
        },
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });
  
    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'CONTROL_CENTER_PATCHED_VEHICLE',
      description: 'Control center patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async getDetailsByStatus(status: 'ON_DUTY' | 'OFF_DUTY') {
    return await this.prisma.user.aggregateRaw({
      pipeline: [{
        $match: {
          status: status
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
  }
}