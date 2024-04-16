import { HttpException, Injectable } from "@nestjs/common";
import { AuditLogService } from "src/@services/audit-log.service";
import { PrismaService } from "src/@services/prisma.service";
import { Payload } from "src/auth/auth.entity";
import { SettingsBody, SettingsControlCenterStatusBody, SettingsHeaderDetailsBody } from "./settings.entity";

@Injectable()
export class SettingsService {

  constructor(private _auditLog: AuditLogService, private _prisma: PrismaService) {
    this.init();
  }

  private async init() {
    const model = await this._prisma.settings.findFirst();

    if (model)
      return;
    const date = new Date();

    await this._prisma.settings.create({
      data: {
        organisationName: 'Organisation',
        logoUrl: './assets/images/dummy-logo.png',
        baseUrl: 'http://localhost:4200',
        socketUrl: 'http://localhost:3000',
        loginPage: {
          title: 'Organisations-Titel',
          description: '<b>Hier könnte Ihre Werbung stehen!</b>'
        },
        options: {
          hasDutyNumber: false
        },
        controlCenterStatus: {
          createMany: {
            data: [{
              label: 'Aktiv',
              value: 'ACTIVE',
              color: 'GREEN',
              updatedAt: date,
              createdAt: date
            }, {
              label: 'Abwesend',
              value: 'ABSENT',
              color: 'AMBER',
              updatedAt: date,
              createdAt: date
            }, {
              label: 'In Besprechung',
              value: 'MEETING',
              color: 'BLUE',
              updatedAt: date,
              createdAt: date
            }, {
              label: 'Im Büro',
              value: 'OFFICE',
              color: 'BLUE',
              updatedAt: date,
              createdAt: date
            }, {
              label: 'Nicht Besetzt',
              value: 'NOT_OCCUPIED',
              color: 'RED',
              updatedAt: date,
              createdAt: date
            }]
          }
        },
        updatedAt: date,
        createdAt: date
      }
    });
  }

  async get() {
    const headerDetailsTop = await this._prisma.settingsHeaderDetails.findMany({
      where: {
        type: 'TOP'
      },
      orderBy: {
        index: 'asc'
      }
    });

    const headerDetailsBottom = await this._prisma.settingsHeaderDetails.findMany({
      where: {
        type: 'BOTTOM'
      },
      orderBy: {
        index: 'asc'
      }
    });

    const settings = await this._prisma.settings.findFirst({
      include: {
        controlCenterStatus: true
      }
    });

    settings['headerDetailsTop'] = headerDetailsTop;
    settings['headerDetailsBottom'] = headerDetailsBottom;

    return settings;
  }

  async patch(profile: Payload, id: string, body: SettingsBody) {
    let model = await this._prisma.settings.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this._prisma.settings.update({
      data: {
        organisationName: body.organisationName,
        logoUrl: body.logoUrl,
        loginPage: {
          title: body.loginPage.title,
          description: body.loginPage.description
        },
        options: {
          hasDutyNumber: body.hasDutyNumber || false
        },
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_PATCHED',
      description: 'Settings patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async postHeaderDetails(profile: Payload, body: SettingsHeaderDetailsBody) {
    const model = await this._prisma.settingsHeaderDetails.create({
      data: {
        index: +body.index,
        type: body.type,
        label: body.label,
        value: body.value,
        color: body.color,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_HEADER_DETAILS_CREATED',
      description: 'Settings header details created!'
    });

    return model;
  }

  async patchHeaderDetails(profile: Payload, id: string, body: SettingsHeaderDetailsBody) {
    let model = await this._prisma.settingsHeaderDetails.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this._prisma.settingsHeaderDetails.update({
      data: {
        index: +body.index,
        type: body.type,
        label: body.label,
        value: body.value,
        color: body.color,
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_HEADER_DETAILS_PATCHED',
      description: 'Settings header details patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async deleteHeaderDetails(profile: Payload, id: string) {
    let model = await this._prisma.settingsHeaderDetails.findFirst({
      where: {
        id: id
      }
    });

    if (!(model))
      throw new HttpException('Not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this._prisma.settingsHeaderDetails.delete({
      where: {
        id: model.id
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_HEADER_DETAILS_DELETED',
      description: 'Settings header details deleted!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async postControlCenterStatus(profile: Payload, settingsId: string, body: SettingsControlCenterStatusBody) {
    const settings = await this._prisma.settings.findFirst({
      where: {
        id: settingsId
      }
    });

    if (!(settings))
      throw new HttpException('Settings not found!', 404);

    const date = new Date();

    const model = await this._prisma.settingsControlCenterStatus.create({
      data: {
        settingsId: settings.id,
        label: body.label,
        value: body.value.replace(/ /g, '_').toUpperCase(),
        color: body.color,
        updatedAt: date,
        createdAt: date
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_CONTROL_CENTER_STATUS_CREATED',
      description: 'Settings control center status created!',
      changes: [JSON.stringify(model)]
    });

    return model;
  }

  async patchControlCenterStatus(profile: Payload, settingsId: string, id: string, body: SettingsControlCenterStatusBody) {
    const settings = await this._prisma.settings.findFirst({
      where: {
        id: settingsId
      }
    });

    if (!(settings))
      throw new HttpException('Settings not found!', 404);

    let model = await this._prisma.settingsControlCenterStatus.findFirst({
      where: {
        id: id,
        settingsId: settingsId
      }
    });

    if (!(model))
      throw new HttpException('Control center status not found!', 404);

    const oldModel = JSON.stringify(model);

    model = await this._prisma.settingsControlCenterStatus.update({
      data: {
        label: body.label,
        value: body.value.replace(/ /g, '_').toUpperCase(),
        color: body.color,
        updatedAt: new Date()
      },
      where: {
        id: model.id
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_CONTROL_CENTER_STATUS_PATCHED',
      description: 'Settings control center status patched!',
      changes: [oldModel, JSON.stringify(model)]
    });

    return model;
  }

  async deleteControlCenterStatus(profile: Payload, settingsId: string, id: string) {
    const settings = await this._prisma.settings.findFirst({
      where: {
        id: settingsId
      }
    });

    if (!(settings))
      throw new HttpException('Settings not found!', 404);

    let model = await this._prisma.settingsControlCenterStatus.findFirst({
      where: {
        id: id,
        settingsId: settingsId
      }
    });

    if (!(model))
      throw new HttpException('Control center status not found!', 404);

    if(model.value.toUpperCase() === 'NOT_OCCUPIED')
      throw new HttpException('Cant delete NOT_OCCUPIED status!', 500);

    const oldModel = JSON.stringify(model);

    model = await this._prisma.settingsControlCenterStatus.delete({
      where: {
        id: model.id
      }
    });

    await this._auditLog.log({
      senderId: profile.sub,
      targetId: model.id,
      type: 'SETTINGS_CONTROL_CENTER_STATUS_DELETED',
      description: 'Settings control center status deleted!',
      changes: [oldModel]
    });

    return model;
  }
}