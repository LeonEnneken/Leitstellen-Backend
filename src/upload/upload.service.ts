import { HttpException, Injectable } from '@nestjs/common';
import { MinioService } from 'src/@services/minio.service';
import { Payload } from 'src/auth/auth.entity';

@Injectable()
export class UploadService {

  constructor(private minioService: MinioService) {

  }

  async uploadFile(profile: Payload, file: Express.Multer.File) {
    const startDate = Date.now();

    if (file.size > (1024 * 1024 * 100))
      throw new HttpException('File to large!', 409);

    const response = await this.minioService.uploadFile(file);

    console.log((Date.now() - startDate) + 'ms', (Math.floor(file.size / 1024 / 1024)) + 'MB');

    if (response.error)
      throw new HttpException(response.error, response.errorCode);
    return response;
  }

}
