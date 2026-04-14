import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить изображение товара (admin)' })
  @ApiResponse({ status: 201, description: 'Изображение загружено' })
  @ApiResponse({ status: 400, description: 'Неверный формат файла' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Always use our getFileUrl() which uses R2_PUBLIC_URL, not multer-s3's S3 endpoint
    const key = (file as any).key;
    const fileUrl = this.filesService.getFileUrl(key);

    return {
      filename: key,
      originalname: file.originalname,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить несколько изображений (admin)' })
  @ApiResponse({ status: 201, description: 'Изображения загружены' })
  uploadMultipleFiles(@UploadedFile() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return files.map((file) => ({
      filename: (file as any).key,
      originalname: file.originalname,
      url: this.filesService.getFileUrl((file as any).key),
      size: file.size,
      mimetype: file.mimetype,
    }));
  }
}
