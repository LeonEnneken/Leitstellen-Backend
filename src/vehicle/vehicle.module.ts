import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    VehicleService
  ],
  controllers: [
    VehicleController
  ]
})
export class VehicleModule {
  
}