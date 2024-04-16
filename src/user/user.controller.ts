import { Body, Controller, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth, UserAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendUser, BackendUserActiveFileSheet, BackendUserSearch, SetupBody, StatusBody } from './user.entity';
import { UserService } from './user.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('User')
@Controller('user')
export class UserController {

  constructor(private service: UserService) {

  }
  
  @UserAuth('Get user information')
  @Get('me')
  @ApiOkResponse({
    type: BackendUser
  })
  async me(@Req() req: Request) {
    return this.service.me(req.user as Payload);
  }

  @UserAuth('Setup first time user information')
  @Post('setup')
  @ApiOkResponse({
    type: BackendUser
  })
  async setupUser(@Req() req: Request, @Body() body: SetupBody) {
    return this.service.setupUser(req.user as Payload, body);
  }

  @UserAuth('Change own online status')
  @Patch('status')
  @ApiOkResponse({
    type: BackendUser
  })
  async patchStatus(@Req() req: Request, @Body() body: StatusBody) {
    return this.service.patchStatus(req.user as Payload, body);
  }

  @PermissionsAuth('USER_STATUS_MANAGE', 'Change other users online status')
  @Patch('status/:userId')
  @ApiOkResponse({
    type: BackendUser
  })
  async patchStatusOther(@Req() req: Request, @Param('userId') userId: string, @Body() body: StatusBody) {
    return this.service.patchStatusOther(req.user as Payload, userId, body);
  }

  @UserAuth('Search for users')
  @Get('search/:type')
  @ApiOkResponse({
    type: BackendUserSearch,
    isArray: true
  })
  @ApiParam({
    name: 'type',
    type: String,
    enum: ['ALL', 'ON_DUTY', 'OFF_DUTY', 'AWAY_FROM_KEYBOARD', 'OFFLINE']
  })
  async searchByType(@Param('type') type: 'ALL' | 'ON_DUTY' | 'OFF_DUTY' | 'AWAY_FROM_KEYBOARD' | 'OFFLINE') {
    return this.service.searchByType(type);
  }

  @UserAuth('Get active file sheets')
  @Get('file-sheets')
  @ApiOkResponse({
    type: BackendUserActiveFileSheet,
    isArray: true
  })
  async getActiveFileSheets(@Req() req: Request) {
    return this.service.getActiveFileSheets(req.user as Payload);
  }

}
