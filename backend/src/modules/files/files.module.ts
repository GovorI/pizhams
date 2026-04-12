import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    S3Module,
    MulterModule.registerAsync({
      imports: [S3Module],
      useFactory: (filesService: FilesService) =>
        filesService.getMulterConfig(),
      inject: [FilesService],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
