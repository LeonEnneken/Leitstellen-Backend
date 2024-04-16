import { Injectable } from "@nestjs/common";
import { HttpException } from "@nestjs/common/exceptions";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { FileSheetPatchBody, FileSheetPostBody } from "./file-sheet.entity";

@Injectable()
export class FileSheetService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {

  }

  async getStrikes() {
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate.getTime() - (1000 * 60 * 60 * 24 * 30));

    return this.prisma.fileSheet.aggregateRaw({
      pipeline: [{
        $match: {
          approved: true,
          canceled: false,
          $expr: {
            $and: [{
              $gte: [
                '$createdAt', {
                  $dateFromString: {
                    dateString: lastMonthDate.toISOString()
                  }
                }
              ]
            }, {
              $lte: [
                '$createdAt', {
                  $dateFromString: {
                    dateString: currentDate.toISOString()
                  }
                }
              ]
            }]
          }
        }
      }, {
        $addFields: {
          targetId: {
            $toObjectId: '$targetId'
          },
          punishment: {
            id: {
              $toString: '$_id'
            },
            title: '$title',
            strikes: '$strikes',
            additionalPuniishment: '$additionalPunishment',
            createdAt: {
              $toString: '$createdAt'
            }
          }
        }
      }, {
        $group: {
          _id: '$targetId',
          items: {
            $push: '$punishment'
          },
          strikes: {
            $sum: '$strikes'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }, {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          'user.id': {
            $toString: '$user._id'
          }
        }
      }, {
        $lookup: {
          from: 'Member',
          localField: 'user.id',
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
          id: {
            $toString: '$_id'
          },
          target: {
            id: '$user.details.id',
            firstName: '$user.details.firstName',
            lastName: '$user.details.lastName',
            groupId: '$member.groupId',
            departmentIds: '$member.departmentIds',
            terminated: '$member.terminated'
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          target: 1,
          strikes: 1,
          items: 1
        }
      }, {
        $match: {
          strikes: {
            $ne: 0
          }
        }
      }, {
        $sort: {
          strikes: -1
        }
      }]
    });
  }

  async getAll(type: 'NOT_APPROVED' | 'APPROVED' | 'FINISHED') {
    let match: any;

    switch (type) {
      case 'NOT_APPROVED': {
        match = {
          approved: false
        };
        break;
      }
      case 'APPROVED': {
        match = {
          approved: true,
          additionalPunishmentFinished: false,
          canceled: false
        };
        break;
      }
      case 'FINISHED': {
        match = {
          approved: true,
          $or: [{
            additionalPunishmentFinished: true
          }, {
            canceled: true
          }]
        };
        break;
      }
      default: {
        throw new HttpException('Type not exists!', 500);
      }
    }

    return this.prisma.fileSheet.aggregateRaw({
      pipeline: [{
        $match: match
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          sender: {
            $toObjectId: '$senderId'
          },
          target: {
            $toObjectId: '$targetId'
          },
          punishment: {
            $toObjectId: '$punishmentId'
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
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      }, {
        $unwind: {
          path: '$sender',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'target',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'Member',
          localField: 'targetId',
          foreignField: 'userId',
          as: 'targetMember'
        }
      }, {
        $unwind: {
          path: '$targetMember',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          sender: '$sender.details',
          target: '$target.details'
        }
      }, {
        $addFields: {
          target: {
            groupId: '$targetMember.groupId',
            departmentIds: '$targetMember.departmentIds',
            terminated: '$targetMember.terminated'
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          sender: 1,
          targetId: 1,
          target: 1,
          punishmentId: 1,
          title: 1,
          strikes: 1,
          additionalPunishment: 1,
          notes: 1,
          attachments: 1,
          additionalPunishmentFinished: 1,
          approved: 1,
          canceled: 1,
          updatedAt: 1,
          createdAt: 1
        }
      }
      ]
    });
  }

  async post(profile: Payload, body: FileSheetPostBody) {
    const target = await this.prisma.user.findFirst({
      where: {
        id: body.targetId
      }
    });

    if (!(target))
      throw new HttpException('Target user not found!', 404);

    const punishment = await this.prisma.punishment.findFirst({
      where: {
        id: body.punishmentId
      },
      include: {
        category: true
      }
    });

    if (!(punishment))
      throw new HttpException('Punishment not found!', 404);

    const date = new Date();

    const model = await this.prisma.fileSheet.create({
      data: {
        senderId: profile.sub,
        targetId: target.id,
        punishmentId: punishment.id,
        title: `§ ${punishment.category.uniqueId}.${punishment.uniqueId}. ${punishment.description}`,
        strikes: +body.strikes,
        additionalPunishment: body.additionalPunishment,
        notes: body.notes,
        attachments: body.attachments,
        additionalPunishmentFinished: false,
        approved: false,
        canceled: false,
        updatedAt: date,
        createdAt: date
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'FILE_SHEET_CREATED',
      description: 'File sheet created!',
      changes: [JSON.stringify(model)]
    });

    return model;
  }

  async patch(profile: Payload, id: string, body: FileSheetPatchBody) {
    let model = await this.prisma.fileSheet.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.fileSheet.update({
      data: {
        strikes: +body.strikes,
        additionalPunishment: body.additionalPunishment,
        notes: body.notes,
        attachments: body.attachments,
        additionalPunishmentFinished: body.additionalPunishmentFinished,
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'FILE_SHEET_PATCHED',
      description: 'File sheet patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.fileSheet.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    model = await this.prisma.fileSheet.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'FILE_SHEET_DELETED',
      description: 'File sheet deleted!',
      changes: [JSON.stringify(model)]
    });

    return model;
  }

  async approve(profile: Payload, id: string) {
    let model = await this.prisma.fileSheet.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.fileSheet.update({
      data: {
        approved: true,
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'FILE_SHEET_APPROVED',
      description: 'File sheet approved!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async cancel(profile: Payload, id: string) {
    let model = await this.prisma.fileSheet.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.fileSheet.update({
      data: {
        canceled: true,
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'FILE_SHEET_CANCELED',
      description: 'File sheet canceled!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }
}