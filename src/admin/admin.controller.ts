import { Controller, Delete, Get, Param, Post, Req, UseInterceptors } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { SentryInterceptor } from "src/@interceptors/sentry.interceptor";
import { PermissionsAuth, RoleAuth } from "src/auth/auth.decorator";
import { Payload } from "src/auth/auth.entity";
import { BackendAdmin, BackendConnectedUser } from "./admin.entity";
import { AdminService } from "./admin.service";

@UseInterceptors(SentryInterceptor)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {

  constructor(private service: AdminService) {

  }

  @RoleAuth('ADMINISTRATOR', 'Add new administrator')
  @Post(':userId')
  @ApiOkResponse({
    type: BackendAdmin
  })
  async addAdmin(@Req() req: Request, @Param('userId') userId: string) {
    return this.service.addAdmin(req.user as Payload, userId);
  }

  @RoleAuth('ADMINISTRATOR', 'Delete an administrator')
  @Delete(':userId')
  @ApiOkResponse({
    type: BackendAdmin
  })
  async removeAdmin(@Req() req: Request, @Param('userId') userId: string) {
    return this.service.removeAdmin(req.user as Payload, userId);
  }

  @PermissionsAuth('ADMIN_AREA_SHOW', 'Get an admin list')
  @Get('list')
  @ApiOkResponse({
    type: BackendAdmin,
    isArray: true
  })
  async getAdmins() {
    return this.service.getAdmins();
  }

  @PermissionsAuth('ADMIN_AREA_SHOW', 'Get all connected users')
  @Get('connections')
  @ApiOkResponse({
    type: BackendConnectedUser,
    isArray: true
  })
  async getConnectedUsers() {
    return this.service.getConnectedUsers();
  }
}