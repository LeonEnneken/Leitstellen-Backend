import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/@services/prisma.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    AuditLogService
  ],
  controllers: [
    AuditLogController
  ]
})
export class AuditLogModule {
  
}