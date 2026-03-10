import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MemoFilesService {
  private uploadsDir: string;

  constructor(private configService: ConfigService) {
    this.uploadsDir = join(process.cwd(), 'uploads', 'memo');

    // Create uploads directory if it doesn't exist
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  getMulterOptions(setId: string) {
    const uploadDir = join(this.uploadsDir, setId);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = file.originalname.split('.').pop();
          cb(null, `${uniqueSuffix}.${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.match(/^image\/(png|jpeg|webp|gif)$/)) {
          return cb(new BadRequestException('Only PNG, JPEG, WEBP, and GIF images are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  getFileUrl(filename: string, setId: string): string {
    const appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
    return `${appUrl}/uploads/memo/${setId}/${filename}`;
  }

  async deleteFile(filename: string, setId: string): Promise<void> {
    const fs = await import('fs/promises');
    const filePath = join(this.uploadsDir, setId, filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore
    }
  }
}
