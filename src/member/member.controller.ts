import { Body, Controller, Delete, Get, Param, Patch, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { BackendMember, BackendMemberPhoneNumber, MemberBody } from './member.entity';
import { MemberService } from './member.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Member')
@Controller('member')
export class MemberController {

  constructor(private service: MemberService) {

  }

  @PermissionsAuth('MEMBERS_SHOW', 'Get all members')
  @Get()
  @ApiOkResponse({
    type: BackendMember,
    isArray: true
  })
  async getAll() {
    return this.service.getAll();
  }

  @PermissionsAuth('MEMBERS_PHONE_NUMBER_SHOW', 'Get all member phone numbers')
  @Get('phone-numbers')
  @ApiOkResponse({
    type: BackendMemberPhoneNumber,
    isArray: true
  })
  async getPhoneNumbers() {
    return this.service.getPhoneNumbers();
  }

  @PermissionsAuth('MEMBERS_MANAGE', 'Patch a member')
  @Patch(':memberId')
  @ApiOkResponse({
    type: BackendMember
  })
  async patch(@Req() req: Request, @Param('memberId') memberId: string, @Body() body: MemberBody) {
    return this.service.patch(req.user as Payload, memberId, body);
  }

  @PermissionsAuth('MEMBERS_MANAGE', 'Hire a terminated member')
  @Patch(':memberId/hire')
  @ApiOkResponse()
  async hire(@Req() req: Request, @Param('memberId') memberId: string) {
    return this.service.hire(req.user as Payload, memberId);
  }

  @PermissionsAuth('MEMBERS_MANAGE', 'Terminate a member')
  @Delete(':memberId/terminate')
  @ApiOkResponse()
  async terminate(@Req() req: Request, @Param('memberId') memberId: string) {
    return this.service.terminate(req.user as Payload, memberId);
  }

}
