import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/@services/prisma.service";

@Injectable()
export class StatisticsService {

  constructor(private prisma: PrismaService) {

  }

  async getCounts() {
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

    return {
      members: {
        onDuty,
        offDuty,
        awayFromKeyboard,
        offline
      }
    };
  }

  async getTrackings(startDate: number, endDate: number) {
    return await this.prisma.user.aggregateRaw({
      pipeline: [{
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
          role: 'USER',
          'member.terminated': false
        }
      }, {
        $lookup: {
          from: 'TimeTracking',
          localField: 'id',
          foreignField: 'userId',
          as: 'items'
        }
      }, {
        $addFields: {
          user: {
            id: '$details.id',
            firstName: '$details.firstName',
            lastName: '$details.lastName',
            phoneNumber: '$details.phoneNumber',
            groupId: '$member.groupId',
            departmentIds: '$member.departmentIds'
          },
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                id: {
                  $toString: '$$item._id'
                },
                controlCenterId: '$$item.controlCenterId',
                startDate: '$$item.startDate',
                endDate: '$$item.endDate',
                time: {
                  $subtract: [
                    '$$item.endDate', '$$item.startDate'
                  ]
                },
                finished: '$$item.finished'
              }
            }
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          user: 1,
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: {
                $and: [{
                  $gte: ['$$item.startDate', +startDate]
                }, {
                  $lte: ['$$item.endDate', +endDate]
                }, {
                  $eq: ['$$item.finished', true]
                }]
              }
            }
          }
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          user: 1,
          items: 1,
          totalTime: {
            $sum: '$items.time'
          }
        }
      }, {
        $sort: {
          totalTime: -1
        }
      }]
    });
  }


}