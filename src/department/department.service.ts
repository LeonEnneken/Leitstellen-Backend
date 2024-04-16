import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { DepartmentBody } from "./department.entity";

@Injectable()
export class DepartmentService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {
    this.init();
  }

  private async init() {
    const department = await this.prisma.department.findFirst({
      where: {
        default: true
      }
    });

    if (department)
      return;
    await this.prisma.department.create({
      data: {
        name: 'Infanterie',
        permissions: [],
        default: true,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });
  }

  async getAll() {
    return await this.prisma.department.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  async post(profile: Payload, body: DepartmentBody) {
    const model = await this.prisma.department.create({
      data: {
        name: body.name,
        permissions: body.permissions,
        data: body.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
        default: false,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'DEPARTMENT_CREATED',
      description: 'Department created!'
    });

    return model;
  }

  async get(id: string) {
    const model = await this.prisma.department.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);
    return model;
  }

  async patch(profile: Payload, id: string, body: DepartmentBody) {
    let model = await this.prisma.department.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.department.update({
      data: {
        name: body.name,
        permissions: body.permissions,
        data: body.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'DEPARTMENT_PATCHED',
      description: 'Department patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.department.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    if (model.default)
      throw new HttpException('Default departments cant be deleted!', 409);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.department.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'DEPARTMENT_DELETED',
      description: 'Department deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }
}