import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from '../s3/s3.module';
import { MemoFilesService } from './services/files.service';

@Module({
  imports: [S3Module, ConfigModule],
  providers: [MemoFilesService],
  exports: [MemoFilesService],
})
export class MemoFilesModule {}
