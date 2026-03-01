import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан', type: Order })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    // Add userId from authenticated user
    const orderWithUser = {
      ...createOrderDto,
      userId: req.user.id,
    };
    return await this.ordersService.create(orderWithUser);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить мои заказы' })
  @ApiResponse({ status: 200, description: 'Список заказов пользователя' })
  async findMyOrders(@Request() req): Promise<Order[]> {
    return await this.ordersService.findByUserId(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список заказов (admin)' })
  @ApiResponse({ status: 200, description: 'Список заказов' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить заказ по ID (admin)' })
  @ApiParam({ name: 'id', description: 'UUID заказа' })
  @ApiResponse({ status: 200, description: 'Заказ найден', type: Order })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Обновить статус заказа (admin)' })
  @ApiParam({ name: 'id', description: 'UUID заказа' })
  @ApiResponse({ status: 200, description: 'Статус обновлен', type: Order })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, status);
  }
}
