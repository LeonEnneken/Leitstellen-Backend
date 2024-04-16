import { Injectable, Module } from "@nestjs/common";
import { randomBytes } from "crypto";
import "dotenv/config";
import { getType } from "mime-database";
import { Client } from "minio";
import { PrismaModule, PrismaService } from "./prisma.service";

@Injectable()
export class MinioService {

  private client: Client;

  constructor(private prisma: PrismaService) {
    this.init();
  }

  private async init() {
    this.client = new Client({
      endPoint: process.env.MINIO_HOST,
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });

    const buckets = await this.client.listBuckets();
  }

  async uploadFile(file: Express.Multer.File): Promise<MinioFile> {
    const type = getType(file.mimetype);

    if (!(type))
      return { error: 'Mime type not found!', errorCode: 404 };
    if (!(type.extensions[0]))
      return { error: 'Mime type extensions not found!', errorCode: 404 };

    const { MINIO_PUBLIC_URL, MINIO_BUCKET } = process.env;

    const fileName = `${randomBytes(12).toString('hex')}.${type.extensions[0]}`;

    await this.client.putObject(MINIO_BUCKET, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });

    const uri = `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${fileName}`;

    return {
      uri: uri,
      fileName: fileName,
      size: file.size
    };
  }

}

export interface MinioFile {
  error?: string;
  errorCode?: number;
  uri?: string;
  fileName?: string;
  size?: number;
}

@Module({
  imports: [
    PrismaModule
  ],
  providers: [MinioService],
  exports: [MinioService]
})
export class MinioModule {

}
