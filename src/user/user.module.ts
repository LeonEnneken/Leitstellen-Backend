import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    UserService
  ],
  controllers: [
    UserController
  ]
})
export class UserModule {
  
}
