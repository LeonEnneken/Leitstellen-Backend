import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendRadioCode, RadioCodeBody } from './radio-code.entity';
import { RadioCodeService } from './radio-code.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Radio-Code')
@Controller('radio-code')
export class RadioCodeController {

  constructor(private service: RadioCodeService) {

  }

  @PermissionsAuth('RADIO_CODES_SHOW', 'Get all radio codes')
  @Get()
  @ApiOkResponse({
    type: BackendRadioCode,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('RADIO_CODES_MANAGE', 'Create a radio code')
  @Post()
  @ApiOkResponse({
    type: BackendRadioCode
  })
  async post(@Req() req: Request, @Body() body: RadioCodeBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('RADIO_CODES_MANAGE', 'Get a radio code')
  @Get(':id')
  @ApiOkResponse({
    type: BackendRadioCode
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @PermissionsAuth('RADIO_CODES_MANAGE', 'Patch a radio code')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendRadioCode
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: RadioCodeBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('RADIO_CODES_MANAGE', 'Delete a radio code')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendRadioCode
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }
}