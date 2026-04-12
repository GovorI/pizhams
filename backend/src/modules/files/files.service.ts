import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../s3/s3.service';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly bucket: string;

  constructor(
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    this.bucket = this.s3Service.getBucket();
  }

  getMulterConfig() {
    const s3 = this.s3Service.getClient();

    return {
      storage: multerS3({
        s3,
        bucket: this.bucket,
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = file.originalname.split('.').pop();
          const filename = `products/${uniqueSuffix}.${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    };
  }

  getFileUrl(key: string): string {
    // key уже содержит полный путь включая products/
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
      this.logger.error(`Error deleting file from R2: ${error.message}`);
    }
  }
}
