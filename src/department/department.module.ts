import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    DepartmentService
  ],
  controllers: [
    DepartmentController
  ]
})
export class DepartmentModule {
  
}