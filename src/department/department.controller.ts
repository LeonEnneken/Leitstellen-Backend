import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth, UserAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendDepartment, DepartmentBody } from './department.entity';
import { DepartmentService } from './department.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Department')
@Controller('department')
export class DepartmentController {

  constructor(private service: DepartmentService) {

  }

  @UserAuth('Get all departments')
  @Get()
  @ApiOkResponse({
    type: BackendDepartment,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('DEPARTMENTS_MANAGE', 'Create a department')
  @Post()
  @ApiOkResponse({
    type: BackendDepartment
  })
  async post(@Req() req: Request, @Body() body: DepartmentBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('DEPARTMENTS_MANAGE', 'Get a department')
  @Get(':id')
  @ApiOkResponse({
    type: BackendDepartment
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @PermissionsAuth('DEPARTMENTS_MANAGE', 'Patch a department')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendDepartment
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: DepartmentBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('DEPARTMENTS_MANAGE', 'Delete a department')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendDepartment
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }
}