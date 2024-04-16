import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/@services/prisma.service";

@Injectable()
export class AuditLogService {

  constructor(private prisma: PrismaService) {

  }

  async getAll(page: number, per_page: number, userId?: string, types?: string | string[]) {
    if (userId && types)
      return this.getByUserIdAndTypes(page, per_page, userId, types);
    if (userId)
      return this.getByUserId(page, per_page, userId);
    if (types)
      return this.getByTypes(page, per_page, types);

    const count = await this.prisma.auditLog.count();

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $limit: per_page
      }, {
        $skip: per_page * page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }

  async getByUserIdAndTypes(page: number, per_page: number, userId: string, types: string | string[]) {
    const query: any[] = [{
      senderId: userId
    }, {
      targetId: userId
    }];

    if (typeof types === 'string')
      types = [types];

    types.forEach((type) => {
      query.push({ type: type });
    });

    const count = await this.prisma.auditLog.count({
      where: {
        OR: query
      }
    });

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $match: {
          $or: query
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $skip: per_page * page
      }, {
        $limit: per_page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }

  async getByUserId(page: number, per_page: number, userId: string) {
    const count = await this.prisma.auditLog.count({
      where: {
        OR: [{
          senderId: userId
        }, {
          targetId: userId
        }]
      }
    });

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $match: {
          $or: [{
            senderId: userId
          }, {
            targetId: userId
          }]
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $skip: per_page * page
      }, {
        $limit: per_page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }

  async getByTypes(page: number, per_page: number, types: string | string[]) {
    const query = [];

    if (typeof types === 'string')
      types = [types];

    types.forEach((type) => {
      query.push({ type: type });
    });

    const count = await this.prisma.auditLog.count({
      where: {
        OR: query
      }
    });

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $match: {
          $or: query
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $skip: per_page * page
      }, {
        $limit: per_page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }


  async getHiredAndTerminated(page: number, per_page: number) {
    const query: any = [{
      type: 'MEMBER_HIRED'
    }, {
      type: 'MEMBER_TERMINATED'
    }];

    const count = await this.prisma.auditLog.count({
      where: {
        OR: query
      }
    });

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $match: {
          $or: query
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $skip: per_page * page
      }, {
        $limit: per_page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }

  async getGroupDepartmentPatched(page: number, per_page: number) {
    const query: any = [{
      type: 'MEMBER_PROMOTED'
    }, {
      type: 'MEMBER_DEMOTED'
    }, {
      type: 'MEMBER_DEPARTMENT_PATCHED'
    }];

    const count = await this.prisma.auditLog.count({
      where: {
        OR: query
      }
    });

    const data = await this.prisma.auditLog.aggregateRaw({
      pipeline: [{
        $match: {
          $or: query
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $addFields: {
          id: {
            $toString: '$_id'
          },
          senderId: {
            $toObjectId: '$senderId'
          },
          targetId: {
            $toObjectId: '$targetId'
          },
          createdAt: {
            $toString: '$createdAt'
          }
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'senderId',
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
          localField: 'targetId',
          foreignField: '_id',
          as: 'target'
        }
      }, {
        $unwind: {
          path: '$target',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $addFields: {
          senderId: {
            $toString: '$senderId'
          },
          sender: '$sender.details',
          targetId: {
            $toString: '$targetId'
          },
          target: '$target.details'
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          senderId: 1,
          targetId: 1,
          sender: 1,
          target: 1,
          type: 1,
          description: 1,
          changes: 1,
          createdAt: 1
        }
      }, {
        $skip: per_page * page
      }, {
        $limit: per_page
      }]
    });

    return {
      pagination: {
        count: count,
        page: page,
        last_page: Math.ceil(count / per_page),
        per_page: per_page
      },
      data: data
    }
  }

}