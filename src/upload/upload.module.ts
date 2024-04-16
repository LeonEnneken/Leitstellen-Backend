import { Module } from '@nestjs/common';
import { MinioModule } from 'src/@services/minio.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MinioModule
  ],
  providers: [
    UploadService
  ],
  controllers: [
    UploadController
  ]
})
export class UploadModule {
  
}
