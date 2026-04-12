import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

export interface DashboardStats {
  orders: {
    total: number;
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
  }>;
  topProducts: Array<{
    name: string;
    soldCount: number;
    revenue: number;
  }>;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Orders count by status
    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const orders = {
      total: 0,
      new: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };

    ordersByStatus.forEach((row) => {
      const count = parseInt(row.count, 10);
      orders.total += count;
      if (row.status) {
        orders[row.status as OrderStatus] = count;
      }
    });

    // Revenue calculations - don't filter by cancelled status (doesn't exist in enum)
    const revenueQuery = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .getRawOne();

    const todayRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt >= :today', { today })
      .getRawOne();

    const weekRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt >= :weekAgo', { weekAgo })
      .getRawOne();

    const monthRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt >= :monthStart', { monthStart })
      .getRawOne();

    const revenue = {
      total: parseFloat(revenueQuery.total) || 0,
      today: parseFloat(todayRevenue.total) || 0,
      thisWeek: parseFloat(weekRevenue.total) || 0,
      thisMonth: parseFloat(monthRevenue.total) || 0,
    };

    // Products statistics
    const productsTotal = await this.productRepository.count();
    const productsLowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock > 0')
      .andWhere('product.stock <= 5')
      .getCount();
    const productsOutOfStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock = 0')
      .getCount();

    const products = {
      total: productsTotal,
      lowStock: productsLowStock,
      outOfStock: productsOutOfStock,
    };

    // Recent orders
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .limit(5)
      .getMany();

    // Top products (by order items) - simplified version
    const topProducts: Array<{
      name: string;
      soldCount: number;
      revenue: number;
    }> = [];

    // Simple implementation without complex JSONB query
    const allOrders = await this.orderRepository.find();
    const productStats = new Map<
      string,
      { name: string; soldCount: number; revenue: number }
    >();

    allOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        const name = item.productName;
        if (!productStats.has(name)) {
          productStats.set(name, { name, soldCount: 0, revenue: 0 });
        }
        const stat = productStats.get(name)!;
        stat.soldCount += parseInt(item.quantity) || 0;
        stat.revenue +=
          (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
      });
    });

    topProducts.push(
      ...Array.from(productStats.values())
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5),
    );

    return {
      orders,
      revenue,
      products,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      topProducts,
    };
  }
}
