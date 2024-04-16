import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendSettings, BackendSettingsControlCenterStatus, BackendSettingsHeaderDetails, SettingsBody, SettingsControlCenterStatusBody, SettingsHeaderDetailsBody } from './settings.entity';
import { SettingsService } from './settings.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {

  constructor(private service: SettingsService) {

  }

  @Get()
  @ApiOkResponse({
    type: BackendSettings
  })
  async get() {
    return this.service.get();
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Patch organisation settings')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendSettings
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: SettingsBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Post a new header details item')
  @Post('header-details')
  @ApiOkResponse({
    type: BackendSettingsHeaderDetails
  })
  async postHeaderDetails(@Req() req: Request, @Body() body: SettingsHeaderDetailsBody) {
    return this.service.postHeaderDetails(req.user as Payload, body);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Patch a header details item')
  @Patch('header-details/:id')
  @ApiOkResponse({
    type: BackendSettingsHeaderDetails
  })
  async patchHeaderDetails(@Req() req: Request, @Param('id') id: string, @Body() body: SettingsHeaderDetailsBody) {
    return this.service.patchHeaderDetails(req.user as Payload, id, body);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Delete a header details item')
  @Delete('header-details/:id')
  @ApiOkResponse({
    type: BackendSettingsHeaderDetails
  })
  async deleteHeaderDetails(@Req() req: Request, @Param('id') id: string) {
    return this.service.deleteHeaderDetails(req.user as Payload, id);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Create a control center status')
  @Post(':settingsId/control-center-status')
  @ApiOkResponse({
    type: BackendSettingsControlCenterStatus
  })
  async postControlCenterStatus(@Req() req: Request, @Param('settingsId') settingsId: string, @Body() body: SettingsControlCenterStatusBody) {
    return this.service.postControlCenterStatus(req.user as Payload, settingsId, body);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Patch a control center status')
  @Patch(':settingsId/control-center-status/:id')
  @ApiOkResponse({
    type: BackendSettingsControlCenterStatus
  })
  async patchControlCenterStatus(@Req() req: Request, @Param('settingsId') settingsId: string, @Param('id') id: string, @Body() body: SettingsControlCenterStatusBody) {
    return this.service.patchControlCenterStatus(req.user as Payload, settingsId, id, body);
  }

  @PermissionsAuth('SETTINGS_MANAGE', 'Delete a control center status')
  @Delete(':settingsId/control-center-status/:id')
  @ApiOkResponse({
    type: BackendSettingsControlCenterStatus
  })
  async deleteControlCenterStatus(@Req() req: Request, @Param('settingsId') settingsId: string, @Param('id') id: string) {
    return this.service.deleteControlCenterStatus(req.user as Payload, settingsId, id);
  }
}