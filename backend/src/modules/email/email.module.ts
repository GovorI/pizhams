import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import emailConfig from '../../config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [emailConfig],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('email.smtp.host'),
          port: configService.get<number>('email.smtp.port'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get<string>('email.smtp.user'),
            pass: configService.get<string>('email.smtp.password'),
          },
        },
        defaults: {
          from: configService.get<string>('email.from'),
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
