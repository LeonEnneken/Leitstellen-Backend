import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { scheduleJob } from 'node-schedule';

import { PrismaModule, PrismaService } from './@services/prisma.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AppGateway } from './app.gateway';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuthMiddleware } from './auth/auth.middleware';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ControlCenterModule } from './control-center/control-center.module';
import { DepartmentModule } from './department/department.module';
import { FileSheetModule } from './file-sheet/file-sheet.module';
import { GroupModule } from './group/group.module';
import { MemberModule } from './member/member.module';
import { PunishmentModule } from './punishment/punishment.module';
import { RadioCodeModule } from './radio-code/radio-code.module';
import { SettingsModule } from './settings/settings.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET
    }),
    PrismaModule,

    AdminModule,
    AuditLogModule,
    AuthModule,
    ControlCenterModule,
    DepartmentModule,
    FileSheetModule,
    GroupModule,
    MemberModule,
    PunishmentModule,
    RadioCodeModule,
    SettingsModule,
    StatisticsModule,
    UploadModule,
    UserModule,
    VehicleModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    AppGateway
  ],
})
export class AppModule implements NestModule {

  constructor(private prisma: PrismaService) {
    this.init();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/(.*)', 'user/(.*)').forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }

  private async init() {
    scheduleJob('0 3 * * *', async (fireDate) => {
      this.cleanup(fireDate);
    });

    const members = await this.prisma.member.findMany({
      where: {
        departmentId: {
          isSet: true
        }
      }
    });

    if(members.length !== 0) {
      for(let member of members) {
        await this.prisma.member.update({
          data: {
            departmentId: {
              unset: true
            },
            departmentIds: [member.departmentId]
          },
          where: {
            id: member.id
          }
        });
      }
      console.log(`Finished update user departments.. (Amount: ${members.length})`);
    }
  }

  private async cleanup(fireDate: Date) {
    
    console.log('###########################################');
    console.log('Date of reset:', fireDate);

    const users = await this.prisma.user.findMany({
      where: {
        OR: [{
          status: 'ON_DUTY'
        }, {
          status: 'OFF_DUTY'
        }, {
          status: 'AWAY_FROM_KEYBOARD'
        }]
      }
    });

    const onDuty: string[] = [];
    const offDuty: string[] = [];
    const awayFromKeyboard: string[] = [];

    await Promise.all(users.map(async (user) => {
      const name = `${user.details.firstName} ${user.details.lastName} (ID: ${user.details.id})`;

      switch(user.status) {
        case 'ON_DUTY': {
          onDuty.push(name);
          break;
        }
        case 'OFF_DUTY': {
          offDuty.push(name);
          break;
        }
        case 'AWAY_FROM_KEYBOARD': {
          awayFromKeyboard.push(name);
        }
      }

      await this.prisma.user.update({
        data: {
          status: 'OFFLINE'
        },
        where: {
          id: user.id
        }
      });

      if(user.status === 'ON_DUTY' || user.status === 'AWAY_FROM_KEYBOARD') {
        const timeTracking = await this.prisma.timeTracking.findFirst({
          where: {
            userId: user.id,
            finished: false
          }
        });

        if (timeTracking) {
          await this.prisma.timeTracking.update({
            data: {
              endDate: Date.now(),
              finished: true
            },
            where: {
              id: timeTracking.id
            }
          });
        }

        const controlCenter = await this.prisma.controlCenter.findFirst({
          where: {
            members: {
              has: user.id
            }
          }
        });
  
        if (controlCenter && controlCenter.members.includes(user.id)) {
          const oldList = [...controlCenter.members];
  
          controlCenter.members.splice(controlCenter.members.indexOf(user.id), 1);
  
          await this.prisma.controlCenter.update({
            data: {
              members: controlCenter.members
            },
            where: {
              id: controlCenter.id
            }
          });
  
          await this.prisma.auditLog.create({
            data: {
              senderId: '000000000000000000000000',
              targetId: user.id,
              type: 'CONTROL_CENTER_MEMBER_REMOVED',
              description: `Mitarbeiter aus Leitstelle entfernt. (ID: ${controlCenter.id}, Name: ${controlCenter.label})`,
              changes: [oldList.join(', '), controlCenter.members.join(', ')],
              createdAt: new Date()
            }
          });
        }
      }
    }));
    console.log('###########################################');
  }

}
