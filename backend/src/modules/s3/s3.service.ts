import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');

    // Если R2 не настроен, используем Mock для локальной разработки
    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        '⚠️  R2 не настроен. Используйте локальные файлы для хранения.',
      );
      return;
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log('✅ Cloudflare R2 подключен');
  }

  getClient(): S3Client {
    if (!this.s3Client) {
      throw new Error(
        'S3 клиент не инициализирован. Проверьте R2 configuration.',
      );
    }
    return this.s3Client;
  }

  getBucket(): string {
    return this.configService.get<string>('R2_BUCKET') || 'pizhams';
  }

  getPublicUrl(): string {
    // Публичный URL для доступа к файлам
    // Если используется R2 Public Access Endpoint
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');
    
    if (publicUrl) {
      return publicUrl;
    }

    // Fallback: используем endpoint URL
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const bucket = this.getBucket();
    return `https://${bucket}.${accountId}.r2.cloudflarestorage.com`;
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('R2_ACCESS_KEY_ID');
  }
}
