import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth, UserAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendVehicle, VehicleBody } from './vehicle.entity';
import { VehicleService } from './vehicle.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Vehicle')
@Controller('vehicle')
export class VehicleController {

  constructor(private service: VehicleService) {

  }

  @UserAuth('Get all vehicles')
  @Get()
  @ApiOkResponse({
    type: BackendVehicle,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('VEHICLES_MANAGE', 'Create a vehicle')
  @Post()
  @ApiOkResponse({
    type: BackendVehicle
  })
  async post(@Req() req: Request, @Body() body: VehicleBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('VEHICLES_MANAGE', 'Get a vehicle')
  @Get(':id')
  @ApiOkResponse({
    type: BackendVehicle
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @PermissionsAuth('VEHICLES_MANAGE', 'Patch a vehicle')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendVehicle
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: VehicleBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('VEHICLES_MANAGE', 'Delete a vehicle')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendVehicle
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }
}