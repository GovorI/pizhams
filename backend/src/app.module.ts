import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig, appConfig, authConfig } from './config';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { FilesModule } from './modules/files/files.module';
import { EmailModule } from './modules/email/email.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MemoModule } from './modules/memo/memo.module';
import { S3Module } from './modules/s3/s3.module';
import { AdminSecurityController } from './common/controllers/admin.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 30, // 30 requests per minute (default for all endpoints)
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, authConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('app.nodeEnv') === 'development',
      }),
    }),
    S3Module,
    ProductsModule,
    OrdersModule,
    AuthModule,
    FilesModule,
    EmailModule,
    StatisticsModule,
    ReviewsModule,
    MemoModule,
  ],
  controllers: [AppController, AdminSecurityController],
  providers: [AppService],
})
export class AppModule {}
