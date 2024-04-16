import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendFileSheet, FileSheetPatchBody, FileSheetPostBody, FileSheetStrikesResponse } from './file-sheet.entity';
import { FileSheetService } from './file-sheet.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('File-Sheet')
@Controller('file-sheet')
export class FileSheetController {

  constructor(private service: FileSheetService) {

  }

  @PermissionsAuth('FILE_SHEETS_SHOW', 'Get all current strikes')
  @Get('strikes')
  @ApiOkResponse({
    type: FileSheetStrikesResponse,
    isArray: true
  })
  async getStrikes() {
    return this.service.getStrikes();
  }

  @PermissionsAuth('FILE_SHEETS_SHOW', 'Get all file sheets by type')
  @Get(':type')
  @ApiOkResponse({
    type: BackendFileSheet,
    isArray: true
  })
  @ApiParam({
    name: 'type',
    type: String,
    enum: ['NOT_APPROVED', 'APPROVED', 'FINISHED']
  })
  async getAll(@Param('type') type: 'NOT_APPROVED' | 'APPROVED' | 'FINISHED') {
    return this.service.getAll(type);
  }

  @PermissionsAuth('FILE_SHEETS_MANAGE', 'Post a new file sheet')
  @Post()
  @ApiOkResponse({
    type: BackendFileSheet
  })
  async post(@Req() req: Request, @Body() body: FileSheetPostBody) {
    return this.service.post(req.user as Payload, body);
  }

  @PermissionsAuth('FILE_SHEETS_MANAGE', 'Patch a file sheet')
  @Patch(':id')
  @ApiOkResponse({
    type: BackendFileSheet
  })
  async patch(@Req() req: Request, @Param('id') id: string, @Body() body: FileSheetPatchBody) {
    return this.service.patch(req.user as Payload, id, body);
  }

  @PermissionsAuth('FILE_SHEETS_MANAGE', 'Delete a file sheet')
  @Delete(':id')
  @ApiOkResponse({
    type: BackendFileSheet
  })
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.service.delete(req.user as Payload, id);
  }

  @PermissionsAuth('FILE_SHEET_APPROVE', 'Approve a file sheet')
  @Patch(':id/approve')
  @ApiOkResponse({
    type: BackendFileSheet
  })
  async approve(@Req() req: Request, @Param('id') id: string) {
    return this.service.approve(req.user as Payload, id);
  }

  @PermissionsAuth('FILE_SHEETS_MANAGE', 'Cancel a file sheet')
  @Patch(':id/cancel')
  @ApiOkResponse({
    type: BackendFileSheet
  })
  async cancel(@Req() req: Request, @Param('id') id: string) {
    return this.service.cancel(req.user as Payload, id);
  }

}