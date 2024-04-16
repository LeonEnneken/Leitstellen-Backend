import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendControlCenter, BackendControlCenterMember, ControlCenterBody } from './control-center.entity';
import { ControlCenterService } from './control-center.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Control-Center')
@Controller('control-center')
export class ControlCenterController {

  constructor(private service: ControlCenterService) {

  }

  @PermissionsAuth('CONTROL_CENTERS_SHOW', 'Get all control centers')
  @Get()
  @ApiOkResponse({
    type: BackendControlCenter,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Create a control center')
  @Post()
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async post(@Req() req: Request, @Body() body: ControlCenterBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Get a control center')
  @Get(':id')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Patch a control center')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: ControlCenterBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Delete a control center')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }


  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Add an user to a control center')
  @Patch(':id/member/:userId')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async patchMember(@Req() req: Request, @Param('id') id: string, @Param('userId') userId: string) {
    return this.service.patchMember(req.user as Payload, id, userId);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Remove an user from a control center')
  @Delete(':id/member/:userId')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async deleteMember(@Req() req: Request, @Param('id') id: string, @Param('userId') userId: string) {
    return this.service.deleteMember(req.user as Payload, id, userId);
  }
  

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Patch a control center status')
  @Patch(':id/status/:status')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async patchStatus(@Req() req: Request, @Param('id') id: string, @Param('status') status: 'ACTIVE' | 'ABSENT' | 'MEETING' | 'OFFICE' | 'NOT_OCCUPIED') {
    return this.service.patchStatus(req.user as Payload, id, status);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Patch a control center vehicle')
  @Patch(':id/vehicle/:vehicleId')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async patchVehicle(@Req() req: Request, @Param('id') id: string, @Param('vehicleId') vehicleId: string) {
    return this.service.patchVehicle(req.user as Payload, id, vehicleId);
  }

  @PermissionsAuth('CONTROL_CENTERS_MANAGE', 'Delete a control center vehicle')
  @Delete(':id/vehicle')
  @ApiOkResponse({
    type: BackendControlCenter
  })
  async deleteVehicle(@Req() req: Request, @Param('id') id: string) {
    return this.service.deleteVehicle(req.user as Payload, id);
  }

  @PermissionsAuth('CONTROL_CENTERS_SHOW', 'Get current details by status')
  @Get('status/:status')
  @ApiOkResponse({
    type: BackendControlCenterMember,
    isArray: true
  })
  async getDetailsByStatus(@Param('status') status: 'ON_DUTY' | 'OFF_DUTY') {
    return this.service.getDetailsByStatus(status);
  }
}