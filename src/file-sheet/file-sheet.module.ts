import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/@services/audit-log.service';
import { PrismaModule } from 'src/@services/prisma.service';
import { FileSheetController } from './file-sheet.controller';
import { FileSheetService } from './file-sheet.service';

@Module({
  imports: [
    AuditLogModule,
    PrismaModule
  ],
  providers: [
    FileSheetService
  ],
  controllers: [
    FileSheetController
  ]
})
export class FileSheetModule {
  
}