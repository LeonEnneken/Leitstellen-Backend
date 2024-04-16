import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    MemberService
  ],
  controllers: [
    MemberController
  ]
})
export class MemberModule {
  
}
