import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { PunishmentController } from './punishment.controller';
import { PunishmentService } from './punishment.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    PunishmentService
  ],
  controllers: [
    PunishmentController
  ]
})
export class PunishmentModule {
  
}