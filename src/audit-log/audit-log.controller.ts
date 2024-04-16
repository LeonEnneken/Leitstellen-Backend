import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuditLogType } from '@prisma/client';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PaginationQuerys, PermissionsAuth } from 'src/auth/auth.decorator';
import { AuditLogResponse } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Audit-Log')
@Controller('audit-log')
export class AuditLogController {

  constructor(private service: AuditLogService) {

  }

  @PermissionsAuth('AUDIT_LOGS_ALL_SHOW', 'Get all logs')
  @Get()
  @PaginationQuerys()
  @ApiOkResponse({
    type: AuditLogResponse
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'types',
    type: String,
    enum: AuditLogType,
    isArray: true,
    required: false
  })
  async getAll(@Query('page') page: number, @Query('per_page') per_page: number, @Query('userId') userId?: string, @Query('types') types?: string[]) {
    return this.service.getAll(+page, +per_page, userId, types);
  }

  @PermissionsAuth('AUDIT_LOGS_USER_SHOW', 'Get all logs by userId')
  @Get('user')
  @PaginationQuerys()
  @ApiOkResponse({
    type: AuditLogResponse
  })
  async getByUserId(@Query('page') page: number, @Query('per_page') per_page: number, @Query('userId') userId: string) {
    return this.service.getByUserId(+page, +per_page, userId);
  }

  @PermissionsAuth('AUDIT_LOGS_TYPES_SHOW', 'Get all logs by types')
  @Get('type')
  @PaginationQuerys()
  @ApiOkResponse({
    type: AuditLogResponse
  })
  @ApiQuery({
    name: 'types',
    type: String,
    enum: AuditLogType,
    isArray: true
  })
  async getByTypes(@Query('page') page: number, @Query('per_page') per_page: number, @Query('types') types: string[]) {
    return this.service.getByTypes(+page, +per_page, types);
  }
  

  @PermissionsAuth('AUDIT_LOGS_SHOW', 'Get all logs for user hiring and terminating')
  @Get('hired-and-terminated')
  @PaginationQuerys()
  @ApiOkResponse({
    type: AuditLogResponse
  })
  async getHiredAndTerminated(@Query('page') page: number, @Query('per_page') per_page: number) {
    return this.service.getHiredAndTerminated(+page, +per_page);
  }

  @PermissionsAuth('AUDIT_LOGS_SHOW', 'Get all logs for user group and department patches')
  @Get('group-department-patched')
  @PaginationQuerys()
  @ApiOkResponse({
    type: AuditLogResponse
  })
  async getGroupDepartmentPatched(@Query('page') page: number, @Query('per_page') per_page: number) {
    return this.service.getGroupDepartmentPatched(+page, +per_page);
  }
}