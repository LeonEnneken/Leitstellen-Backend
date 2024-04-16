import { Injectable, Module } from "@nestjs/common";
import { AuditLogType } from "@prisma/client";
import "dotenv/config";
import { PrismaModule, PrismaService } from "./prisma.service";

@Injectable()
export class AuditLogService {

  constructor(private prisma: PrismaService) {

  }

  async log(log: Log) {
    return await this.prisma.auditLog.create({
      data: {
        senderId: log.senderId,
        targetId: log.targetId || undefined,
        type: log.type,
        description: log.description,
        changes: log.changes || [],
        createdAt: new Date()        
      }
    });
  }
}

export interface Log {
  senderId: string;
  targetId?: string;
  type: AuditLogType;
  description: string;
  changes?: string[];
}

@Module({
  imports: [
    PrismaModule
  ],
  providers: [AuditLogService],
  exports: [AuditLogService]
})
export class AuditLogModule {

}
