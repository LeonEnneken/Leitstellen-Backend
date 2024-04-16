import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth, UserAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendGroup, GroupBody } from './group.entity';
import { GroupService } from './group.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Group')
@Controller('group')
export class GroupController {

  constructor(private service: GroupService) {

  }

  @UserAuth('Get all groups')
  @Get()
  @ApiOkResponse({
    type: BackendGroup,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('GROUPS_MANAGE', 'Create a group')
  @Post()
  @ApiOkResponse({
    type: BackendGroup
  })
  async post(@Req() req: Request, @Body() body: GroupBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('GROUPS_MANAGE', 'Get a group')
  @Get(':id')
  @ApiOkResponse({
    type: BackendGroup
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @PermissionsAuth('GROUPS_MANAGE', 'Patch a group')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendGroup
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: GroupBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('GROUPS_MANAGE', 'Delete a group')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendGroup
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }
}