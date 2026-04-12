import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../s3/s3.service';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';
import type { StorageEngine } from 'multer';

/**
 * A lazy StorageEngine wrapper that defers construction of the multer-s3
 * storage engine (and therefore the S3Client lookup) until the first file
 * upload request arrives. By that point NestJS has already called
 * S3Service.onModuleInit(), so the client is guaranteed to be ready.
 */
class LazyS3Storage implements StorageEngine {
  private inner: StorageEngine | null = null;

  constructor(
    private readonly s3Service: S3Service,
    private readonly bucket: string,
    private readonly keyPrefix: string,
  ) {}

  private getInner(): StorageEngine {
    if (!this.inner) {
      this.inner = multerS3({
        s3: this.s3Service.getClient(),
        bucket: this.bucket,
        acl: 'public-read',
        metadata: (_req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (_req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = file.originalname.split('.').pop();
          const filename = `${this.keyPrefix}/${uniqueSuffix}.${ext}`;
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

@Injectable()
export class MemoFilesService {
  private readonly logger = new Logger(MemoFilesService.name);
  private readonly bucket: string;

  constructor(
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    this.bucket = this.s3Service.getBucket();
  }

  getMulterOptions(setId: string) {
    const s3 = this.s3Service.getClient();

    return {
      storage: multerS3({
        s3,
        bucket: this.bucket,
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname, setId });
        },
        key: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = file.originalname.split('.').pop();
          const filename = `memo/${setId}/${uniqueSuffix}.${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.match(/^image\/(png|jpeg|webp|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only PNG, JPEG, WEBP, and GIF images are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  getPhotosMulterOptions() {
    return {
      storage: new LazyS3Storage(this.s3Service, this.bucket, 'memo/photos'),
      fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.match(/^image\/(png|jpeg|webp|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only PNG, JPEG, WEBP, and GIF images are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  getFileUrl(key: string): string {
    return this.s3Service.getPublicUrl() + '/' + key;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const s3 = this.s3Service.getClient();
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await s3.send(command);
      this.logger.log(`File deleted from R2: ${key}`);
    } catch (error) {
      // File might not exist, ignore
      this.logger.warn(
        `Could not delete file from R2: ${key}, error: ${error.message}`,
      );
    }
  }
}
