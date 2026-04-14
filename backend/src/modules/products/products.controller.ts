import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Throttle,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать новый товар (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Товар успешно создан',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Получить список товаров с фильтрацией и пагинацией',
  })
  @ApiResponse({ status: 200, description: 'Список товаров' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({
    name: 'size',
    required: false,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  findAll(@Query() filterDto: GetProductsFilterDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 200, description: 'Товар найден', type: Product })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Обновить товар (admin)' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 200, description: 'Товар обновлен', type: Product })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить товар (admin)' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 204, description: 'Товар удален' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
