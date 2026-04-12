import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import multerS3 from 'multer-s3';
import type { Request } from 'express';
import type { StorageEngine } from 'multer';

/**
 * A lazy StorageEngine wrapper that defers construction of the multer-s3
 * storage engine (and therefore the S3Client lookup) until the first file
 * upload request arrives.  By that point NestJS has already called
 * S3Service.onModuleInit(), so the client is guaranteed to be ready.
 */
class LazyS3Storage implements StorageEngine {
  private inner: StorageEngine | null = null;

  constructor(private readonly s3Service: S3Service) {}

  private getInner(): StorageEngine {
    if (!this.inner) {
      this.inner = multerS3({
        s3: this.s3Service.getClient(),
        bucket: this.s3Service.getBucket(),
        acl: 'public-read',
        metadata: (_req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = file.originalname.split('.').pop();
          const filename = `products/${uniqueSuffix}.${ext}`;
          cb(null, filename);
        },
      });
    }
    return this.inner;
  }

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File>) => void,
  ): void {
    this.getInner()._handleFile(req, file, cb);
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null) => void,
  ): void {
    this.getInner()._removeFile(req, file, cb);
  }
}

@Module({
  imports: [
    S3Module,
    MulterModule.registerAsync({
      imports: [S3Module],
      useFactory: (s3Service: S3Service) => ({
        storage: new LazyS3Storage(s3Service),
        fileFilter: (_req, file, cb) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
          }
          cb(null, true);
        },
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
      }),
      inject: [S3Service],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
