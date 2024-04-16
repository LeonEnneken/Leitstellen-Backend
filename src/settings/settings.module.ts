import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    SettingsService
  ],
  controllers: [
    SettingsController
  ]
})
export class SettingsModule {
  
}