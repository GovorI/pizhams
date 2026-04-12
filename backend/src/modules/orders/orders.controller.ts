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
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
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
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
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

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  @ApiOperation({ summary: 'Экспорт заказов в CSV (admin)' })
  @ApiResponse({ status: 200, description: 'CSV файл с заказами' })
  async exportToCsv(@Res() res: Response): Promise<any> {
    const orders = await this.ordersService.findAll();

    // CSV Header
    const csvHeader = 'ID,Клиент,Email,Телефон,Адрес,Сумма,Статус,Дата\n';

    // CSV Rows
    const csvRows = orders
      .map((order) => {
        const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          order.id.slice(0, 8),
          escapeCsv(order.customerName),
          escapeCsv(order.customerEmail),
          escapeCsv(order.customerPhone),
          escapeCsv(order.customerAddress),
          order.total,
          order.status,
          new Date(order.createdAt).toISOString(),
        ].join(',');
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.send(csv);
    return res;
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
