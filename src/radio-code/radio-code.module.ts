import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { RadioCodeController } from './radio-code.controller';
import { RadioCodeService } from './radio-code.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    RadioCodeService
  ],
  controllers: [
    RadioCodeController
  ]
})
export class RadioCodeModule {
  
}