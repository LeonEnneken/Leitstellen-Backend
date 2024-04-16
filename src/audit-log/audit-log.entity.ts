import { ApiProperty } from "@nestjs/swagger";
import { AuditLogType } from "@prisma/client";
import { Pagination } from "src/app.entity";

export class BackendAuditLogUser {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  phoneNumber: string;
}

export class BackendAuditLog {

  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  senderId: string;

  @ApiProperty({ type: BackendAuditLogUser })
  sender: BackendAuditLogUser;

  @ApiProperty({ type: String, required: false })
  targetId?: string;

  @ApiProperty({ type: BackendAuditLogUser, required: false })
  target?: BackendAuditLogUser;

  @ApiProperty({ type: String, enum: AuditLogType })
  type: AuditLogType;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String, isArray: true })
  changes: string[];

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class AuditLogResponse {

  @ApiProperty({ type: Pagination })
  pagination: Pagination;

  @ApiProperty({ type: BackendAuditLog, isArray: true })
  data: BackendAuditLog[];
}