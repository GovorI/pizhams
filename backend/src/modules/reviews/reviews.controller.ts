import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать отзыв о товаре' })
  @ApiResponse({ status: 201, description: 'Отзыв создан' })
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create({
      ...createReviewDto,
      userId: req.user.id,
      userName: req.user.email,
      isApproved: false, // Требует модерации
    });
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Получить отзывы о товаре' })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProductId(productId);
  }

  @Get('average/:productId')
  @ApiOperation({ summary: 'Получить средний рейтинг товара' })
  @ApiResponse({ status: 200, description: 'Средний рейтинг' })
  getAverageRating(@Param('productId') productId: string) {
    return this.reviewsService.getAverageRating(productId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить все отзывы (admin)' })
  @ApiResponse({ status: 200, description: 'Все отзывы' })
  findAll(@Query('approved') approved?: string) {
    if (approved === 'false') {
      // Get unapproved reviews for moderation
      return this.reviewsService.findAllUnapproved();
    }
    return this.reviewsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'UUID отзыва' })
  @ApiOperation({ summary: 'Обновить отзыв (admin)' })
  @ApiResponse({ status: 200, description: 'Отзыв обновлен' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'UUID отзыва' })
  @ApiOperation({ summary: 'Удалить отзыв (admin)' })
  @ApiResponse({ status: 200, description: 'Отзыв удален' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
