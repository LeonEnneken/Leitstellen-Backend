import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { ControlCenterController } from './control-center.controller';
import { ControlCenterService } from './control-center.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    ControlCenterService
  ],
  controllers: [
    ControlCenterController
  ]
})
export class ControlCenterModule {
  
}