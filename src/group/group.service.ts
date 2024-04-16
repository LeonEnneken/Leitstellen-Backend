import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { GroupBody } from "./group.entity";

@Injectable()
export class GroupService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {
    this.init();
  }

  private async init() {
    const group = await this.prisma.group.findFirst({
      where: {
        default: true
      }
    });

    if (group)
      return;
    await this.prisma.group.create({
      data: {
        uniqueId: 1,
        name: 'Dummy',
        shortName: 'Dummy',
        permissions: [],
        showInOverview: false,
        default: true,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });
  }

  async getAll() {
    return await this.prisma.group.findMany({
      orderBy: {
        uniqueId: 'desc'
      }
    });
  }

  async post(profile: Payload, body: GroupBody) {
    const model = await this.prisma.group.create({
      data: {
        uniqueId: Number(body.uniqueId),
        name: body.name,
        shortName: body.shortName,
        division: body.division || undefined,
        permissions: body.permissions,
        data: body.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
        showInOverview: body.showInOverview || false,
        default: false,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'GROUP_CREATED',
      description: 'Group created!'
    });

    return model;
  }

  async get(id: string) {
    const model = await this.prisma.group.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);
    return model;
  }

  async patch(profile: Payload, id: string, body: GroupBody) {
    let model = await this.prisma.group.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.group.update({
      data: {
        uniqueId: Number(body.uniqueId),
        name: body.name,
        shortName: body.shortName,
        division: body.division || undefined,
        permissions: body.permissions,
        data: body.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
        showInOverview: body.showInOverview || false,
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'GROUP_PATCHED',
      description: 'Group patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.group.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    if (model.default)
      throw new HttpException('Default groups cant be deleted!', 409);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.group.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'GROUP_DELETED',
      description: 'Group deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }
}