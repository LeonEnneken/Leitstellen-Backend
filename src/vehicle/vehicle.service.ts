import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { VehicleBody } from "./vehicle.entity";

@Injectable()
export class VehicleService {

  constructor(
    private auditLog: AuditLogService,
    private prisma: PrismaService
  ) {

  }

  async getAll() {
    return await this.prisma.vehicle.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  async post(profile: Payload, body: VehicleBody) {
    const model = await this.prisma.vehicle.create({
      data: {
        name: body.name,
        licensePlate: body.licensePlate,
        groupId: body.groupId || undefined,
        departmentId: body.departmentId || undefined,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'VEHICLE_CREATED',
      description: 'Vehicle created!'
    });

    return model;
  }

  async get(id: string) {
    const model = await this.prisma.vehicle.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);
    return model;
  }

  async patch(profile: Payload, id: string, body: VehicleBody) {
    let model = await this.prisma.vehicle.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.vehicle.update({
      data: {
        name: body.name,
        licensePlate: body.licensePlate,
        groupId: body.groupId ? body.groupId : { unset: true },
        departmentId: body.departmentId ? body.departmentId : { unset: true },
        updatedAt: new Date()
      },
      where: {
        id: id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'VEHICLE_PATCHED',
      description: 'Vehicle patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async delete(profile: Payload, id: string) {
    let model = await this.prisma.vehicle.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this.prisma.vehicle.delete({
      where: {
        id: model.id
      }
    });

    await this.auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'VEHICLE_DELETED',
      description: 'Vehicle deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }
}