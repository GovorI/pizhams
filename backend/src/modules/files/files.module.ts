import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import multerS3 from 'multer-s3';

@Module({
  imports: [
    S3Module,
    MulterModule.registerAsync({
      imports: [S3Module],
      useFactory: (s3Service: S3Service) => ({
        storage: multerS3({
          s3: s3Service.getClient(),
          bucket: s3Service.getBucket(),
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
