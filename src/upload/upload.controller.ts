import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SentryInterceptor } from 'src/@interceptors/sentry.interceptor';
import { PermissionsAuth } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.entity';
import { UploadService } from './upload.service';

@UseInterceptors(SentryInterceptor)
@ApiTags('Upload')
@Controller('upload')
export class UploadController {

  constructor(private service: UploadService) {

  }

  @PermissionsAuth('UPLOAD_FILE', 'Upload file to file storage')
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 1024 * 1024 * 100
    }
  }))
  async uploadFile(@Req() req: Request, @UploadedFile('file') file: Express.Multer.File) {
    return this.service.uploadFile(req.user as Payload, file);
  }

}
