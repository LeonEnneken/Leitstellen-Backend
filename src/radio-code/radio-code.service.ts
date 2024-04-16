import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { RadioCodeBody } from "./radio-code.entity";

@Injectable()
export class RadioCodeService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {

  }

  async getAll() {
    return await this.prisma.radioCode.findMany({
      orderBy: {
        code: 'asc'
      }
    });
  }

  async post(profile: Payload, body: RadioCodeBody) {
    const model = await this.prisma.radioCode.create({
      data: {
        type: body.type,
        code: body.code,
        description: body.description,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'RADIO_CODE_CREATED',
      description: 'Radio code created!'
    });

    return model;
  }

  async get(id: string) {
    const model = await this.prisma.radioCode.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);
    return model;
  }

  async patch(profile: Payload, id: string, body: RadioCodeBody) {
    let model = await this.prisma.radioCode.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.radioCode.update({
      data: {
        type: body.type,
        code: body.code,
        description: body.description,
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'RADIO_CODE_PATCHED',
      description: 'Radio code patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.radioCode.findFirst({
      where: {
        id: id
      }
    });

    if(!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.radioCode.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'RADIO_CODE_DELETED',
      description: 'Radio code deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }
}