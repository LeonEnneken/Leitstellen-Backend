import { Module } from "@nestjs/common";
import { AuditLogModule } from "src/@services/audit-log.service";
import { PrismaModule } from "src/@services/prisma.service";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    AdminService
  ],
  controllers: [
    AdminController
  ]
})
export class AdminModule {
  
}