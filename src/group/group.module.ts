import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    GroupService
  ],
  controllers: [
    GroupController
  ]
})
export class GroupModule {
  
}