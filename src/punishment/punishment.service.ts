import { HttpException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { PunishmentBody, PunishmentCategoryBody, PunishmentItemBody } from "./punishment.entity";

@Injectable()
export class PunishmentService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {
    this.init();
  }

  private async init() {
    const model = await this.prisma.punishmentCategory.findFirst();

    if (model)
      return;
    const date = new Date();

    await this.prisma.punishmentCategory.create({
      data: {
        uniqueId: 1,
        label: 'Test',
        punishments: {
          create: {
            uniqueId: 1,
            description: 'Test',
            items: {
              create: {
                stage: 1,
                strikes: 0,
                additionalPunishment: 'Nichts',
                updatedAt: date,
                createdAt: date
              }
            },
            updatedAt: date,
            createdAt: date
          }
        },
        updatedAt: date,
        createdAt: date
      }
    });
  }


  async getAll() {
    return await this.prisma.punishmentCategory.findMany({
      include: {
        punishments: {
          orderBy: {
            uniqueId: 'asc'
          },
          include: {
            items: {
              orderBy: {
                stage: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        uniqueId: 'asc'
      }
    });
  }


  async post(profile: Payload, body: PunishmentCategoryBody) {
    const date = new Date();

    const data: Prisma.PunishmentCategoryCreateInput = {
      uniqueId: +body.uniqueId,
      label: body.label,
      updatedAt: date,
      createdAt: date
    };

    if (body.punishment) {
      const punishment: Prisma.PunishmentCreateWithoutCategoryInput = {
        uniqueId: +body.punishment.uniqueId,
        description: body.punishment.description,
        updatedAt: date,
        createdAt: date
      }

      if (body.punishment.items) {
        const items: Prisma.PunishmentItemCreateManyPunishmentInput[] = [];
        
        body.punishment.items.forEach((item) => {
          items.push({
            stage: +item.stage,
            strikes: +item.strikes,
            additionalPunishment: item.additionalPunishment,
            updatedAt: date,
            createdAt: date
          });
        });

        punishment.items = {
          createMany: {
            data: items
          }
        };
      }
      data.punishments = {
        create: punishment
      };
    }

    const model = await this.prisma.punishmentCategory.create({
      data: data,
      include: {
        punishments: {
          include: {
            items: true
          }
        }
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment category created!',
      type: 'PUNISHMENT_CATEGORY_CREATED',
      changes: [JSON.stringify(model)]
    });

    await Promise.all(model.punishments.map(async (punishment) => {
      await this.auditLog.log({
        senderId: profile.sub,
        targetId: punishment.id,
        description: 'Punishment created!',
        type: 'PUNISHMENT_CREATED',
        changes: [JSON.stringify(model)]
      });

      await Promise.all(punishment.items.map(async (item) => {
        await this.auditLog.log({
          senderId: profile.sub,
          targetId: item.id,
          description: 'Punishment item created!',
          type: 'PUNISHMENT_ITEM_CREATED',
          changes: [JSON.stringify(model)]
        });
      }));
    }));

    return model;
  }

  async patch(profile: Payload, categoryId: string, body: PunishmentCategoryBody) {
    let model = await this.prisma.punishmentCategory.findFirst({
      where: {
        id: categoryId
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const date = new Date();
    const oldModel = JSON.stringify(model);

    model = await this.prisma.punishmentCategory.update({
      data: {
        uniqueId: +body.uniqueId,
        label: body.label,
        updatedAt: date
      },
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment category patched!',
      type: 'PUNISHMENT_CATEGORY_PATCHED',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, categoryId: string) {
    const model = await this.prisma.punishmentCategory.findFirst({
      where: {
        id: categoryId
      },
      include: {
        punishments: {
          include: {
            items: true
          }
        }
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const transactions: Prisma.PrismaPromise<Prisma.BatchPayload>[] = [];

    model.punishments.forEach((punishment) => {
      const transaction = this.prisma.punishmentItem.deleteMany({
        where: {
          punishmentId: punishment.id
        }
      });
      transactions.push(transaction);
    });

    const deletePunishments = this.prisma.punishment.deleteMany({
      where: {
        categoryId: model.id
      }
    });

    const deleteCategory = this.prisma.punishmentCategory.delete({
      where: {
        id: model.id
      }
    });

    await this.prisma.$transaction([...transactions, deletePunishments, deleteCategory]);

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment category deleted!',
      type: 'PUNISHMENT_CATEGORY_DELETED',
      changes: [JSON.stringify(model)]
    });

    await Promise.all(model.punishments.map(async (punishment) => {
      await this.auditLog.log({
        senderId: profile.sub,
        targetId: punishment.id,
        description: 'Punishment deleted!',
        type: 'PUNISHMENT_DELETED',
        changes: [JSON.stringify(model)]
      });

      await Promise.all(punishment.items.map(async (item) => {
        await this.auditLog.log({
          senderId: profile.sub,
          targetId: item.id,
          description: 'Punishment item deleted!',
          type: 'PUNISHMENT_ITEM_DELETED',
          changes: [JSON.stringify(model)]
        });
      }));
    }));

    return model;
  }


  async postPunishment(profile: Payload, categoryId: string, body: PunishmentBody) {
    const category = await this.prisma.punishmentCategory.findFirst({
      where: {
        id: categoryId
      }
    });

    if(!(category))
      throw new HttpException('Not found!', 404);

    const date = new Date();

    const data: Prisma.PunishmentCreateInput = {
      category: {
        connect: {
          id: category.id
        }
      },
      uniqueId: +body.uniqueId,
      description: body.description,
      updatedAt: date,
      createdAt: date
    };

    if (body.items && body.items.length !== 0) {
      const items: Prisma.PunishmentItemCreateManyPunishmentInput[] = [];

      body.items.forEach((item) => {
        items.push({
          stage: +item.stage,
          strikes: +item.strikes,
          additionalPunishment: item.additionalPunishment,
          updatedAt: date,
          createdAt: date
        });
      });

      data.items = {
        createMany: {
          data: items
        }
      };
    }

    const model = await this.prisma.punishment.create({
      data: data,
      include: {
        items: true
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment created!',
      type: 'PUNISHMENT_CREATED',
      changes: [JSON.stringify(model)]
    });

    await Promise.all(model.items.map(async (item) => {
      await this.auditLog.log({
        senderId: profile.sub,
        targetId: item.id,
        description: 'Punishment item created!',
        type: 'PUNISHMENT_ITEM_CREATED',
        changes: [JSON.stringify(model)]
      });
    }));
    return model;
  }

  async patchPunishment(profile: Payload, categoryId: string, id: string, body: PunishmentBody) {
    let model = await this.prisma.punishment.findFirst({
      where: {
        id: id,
        categoryId: categoryId
      }
    });
    
    if(!(model))
      throw new HttpException('Not found!', 404);

    const date = new Date();

    await Promise.all(body.items.map(async (item) => {
      if(item.id) {
        await this.prisma.punishmentItem.update({
          data: {
            stage: +item.stage,
            strikes: +item.strikes,
            additionalPunishment: item.additionalPunishment,
            updatedAt: date
          },
          where: {
            id: item.id
          }
        });
        return;
      }
      await this.prisma.punishmentItem.create({
        data: {
          punishment: {
            connect: {
              id: model.id
            }
          },
          stage: +item.stage,
          strikes: +item.strikes,
          additionalPunishment: item.additionalPunishment,
          updatedAt: date,
          createdAt: date
        }
      });
    }));

    const oldModel = JSON.stringify(model);

    model = await this.prisma.punishment.update({
      data: {
        uniqueId: +body.uniqueId,
        description: body.description,
        updatedAt: date
      },
      include: {
        items: true
      },
      where: {
        id: model.id
      }      
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment patched!',
      type: 'PUNISHMENT_PATCHED',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async deletePunishment(profile: Payload, categoryId: string, id: string) {
    const model = await this.prisma.punishment.findFirst({
      where: {
        id: id,
        categoryId: categoryId
      },
      include: {
        items: true
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const deleteItems = this.prisma.punishmentItem.deleteMany({
      where: {
        punishmentId: model.id
      }
    });

    const deletePunishment = this.prisma.punishment.delete({
      where: {
        id: model.id
      }
    });

    await this.prisma.$transaction([deleteItems, deletePunishment]);

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment deleted!',
      type: 'PUNISHMENT_DELETED',
      changes: [JSON.stringify(model)]
    });

    await Promise.all(model.items.map(async (item) => {
      await this.auditLog.log({
        senderId: profile.sub,
        targetId: item.id,
        description: 'Punishment item deleted!',
        type: 'PUNISHMENT_ITEM_DELETED',
        changes: [JSON.stringify(model)]
      });
    }));

    return model;
  }


  async postPunishmentItem(profile: Payload, categoryId: string, id: string, body: PunishmentItemBody) {
    const punishment = await this.prisma.punishment.findFirst({
      where: {
        id: id,
        categoryId: categoryId
      }
    });

    if(!(punishment))
      throw new HttpException('Not found!', 404);

    const date = new Date();

    const model = await this.prisma.punishmentItem.create({
      data: {
        punishment: {
          connect: {
            id: punishment.id
          }
        },
        stage: +body.stage,
        strikes: +body.strikes,
        additionalPunishment: body.additionalPunishment,
        updatedAt: date,
        createdAt: date
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment item created!',
      type: 'PUNISHMENT_ITEM_CREATED',
      changes: [JSON.stringify(model)]
    });

    return model;
  }

  async patchPunishmentItem(profile: Payload, categoryId: string, id: string, itemId: string, body: PunishmentItemBody) {
    let model = await this.prisma.punishmentItem.findFirst({
      where: {
        id: itemId,
        punishmentId: id
      },
      include: {
        punishment: true
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    if(model.punishment.categoryId !== categoryId)
      throw new HttpException('Category id not correct!', 500);

    const date = new Date();
    const oldModel = JSON.stringify(model);

    model = await this.prisma.punishmentItem.update({
      data: {
        stage: +body.stage,
        strikes: +body.strikes,
        additionalPunishment: body.additionalPunishment,
        updatedAt: date
      },
      include: {
        punishment: true
      },
      where: {
        id: model.id
      }      
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      description: 'Punishment item patched!',
      type: 'PUNISHMENT_ITEM_PATCHED',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async deletePunishmentItem(profile: Payload, categoryId: string, id: string, itemId: string) {
    let model = await this.prisma.punishmentItem.findFirst({
      where: {
        id: itemId,
        punishmentId: id
      },
      include: {
        punishment: true
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    if(model.punishment.categoryId !== categoryId)
      throw new HttpException('Category id not correct!', 500);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.punishmentItem.delete({
      where: {
        id: model.id
      },
      include: {
        punishment: true
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'PUNISHMENT_ITEM_DELETED',
      description: 'Punishment item deleted!',
      changes: [oldModel]
    });

    return model;
  }

}