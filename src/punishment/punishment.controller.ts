import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendPunishment, BackendPunishmentCategory, BackendPunishmentItem, PunishmentBody, PunishmentCategoryBody, PunishmentItemBody } from './punishment.entity';
import { PunishmentService } from './punishment.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Punishment')
@Controller('punishment')
export class PunishmentController {

  constructor(private service: PunishmentService) {

  }

  @PermissionsAuth('PUNISHMENTS_SHOW', 'Get all punishment categories (with childrens)')
  @Get()
  @ApiOkResponse({
    type: BackendPunishmentCategory,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Post a new punishment category (with childrens)')
  @Post()
  @ApiOkResponse({
    type: BackendPunishmentCategory
  })
  async post(@Req() req: Request, @Body() body: PunishmentCategoryBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Patch a punishment category')
  @Patch(':categoryId')
  @ApiOkResponse({
    type: BackendPunishmentCategory
  })
  async patch(@Req() req: Request, @Param('categoryId') categoryId: string, @Body() body: PunishmentCategoryBody) {
    return this.service.patch(req.user as Payload, categoryId, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Delete a punishment category (with childrens)')
  @Delete(':categoryId')
  @ApiOkResponse({
    type: BackendPunishmentCategory
  })
  async delete(@Req() req: Request, @Param('categoryId') categoryId: string) {
    return this.service.delete(req.user as Payload, categoryId);
  }

  
  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Post a new punishment (with childrens)')
  @Post(':categoryId')
  @ApiOkResponse({
    type: BackendPunishment
  })
  async postPunishment(@Req() req: Request, @Param('categoryId') categoryId: string, @Body() body: PunishmentBody) {
    return this.service.postPunishment(req.user as Payload, categoryId, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Patch a punishment')
  @Patch(':categoryId/:id')
  @ApiOkResponse({
    type: BackendPunishment
  })
  async patchPunishment(@Req() req: Request, @Param('categoryId') categoryId: string, @Param('id') id: string, @Body() body: PunishmentBody) {
    return this.service.patchPunishment(req.user as Payload, categoryId, id, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Delete a punishment')
  @Delete(':categoryId/:id')
  @ApiOkResponse({
    type: BackendPunishment
  })
  async deletePunishment(@Req() req: Request, @Param('categoryId') categoryId: string, @Param('id') id: string) {
    return this.service.deletePunishment(req.user as Payload, categoryId, id);
  }


  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Post a new punishment item')
  @Post(':categoryId/:id')
  @ApiOkResponse({
    type: BackendPunishmentItem
  })
  async postPunishmentItem(@Req() req: Request, @Param('categoryId') categoryId: string, @Param('id') id: string, @Body() body: PunishmentItemBody) {
    return this.service.postPunishmentItem(req.user as Payload, categoryId, id, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Patch a punishment item')
  @Patch(':categoryId/:id/:itemId')
  @ApiOkResponse({
    type: BackendPunishmentItem
  })
  async patchPunishmentItem(@Req() req: Request, @Param('categoryId') categoryId: string, @Param('id') id: string, @Param('itemId') itemId: string, @Body() body: PunishmentItemBody) {
    return this.service.patchPunishmentItem(req.user as Payload, categoryId, id, itemId, body);
  }

  @PermissionsAuth('PUNISHMENTS_MANAGE', 'Delete a punishment item')
  @Delete(':categoryId/:id/:itemId')
  @ApiOkResponse({
    type: BackendPunishmentItem
  })
  async deletePunishmentItem(@Req() req: Request, @Param('categoryId') categoryId: string, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.deletePunishmentItem(req.user as Payload, categoryId, id, itemId);
  }

}