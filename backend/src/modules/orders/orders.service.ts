import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly emailService: EmailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const items = createOrderDto.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    }));

    const total = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      ...createOrderDto,
      items,
      total,
      status: OrderStatus.NEW,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Send confirmation email
    await this.emailService.sendOrderConfirmation({
      to: createOrderDto.customerEmail,
      orderId: savedOrder.id,
      customerName: createOrderDto.customerName,
      items: savedOrder.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      total: savedOrder.total,
      address: createOrderDto.customerAddress,
    });

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);

    order.status = status;
    return await this.orderRepository.save(order);
  }
}
