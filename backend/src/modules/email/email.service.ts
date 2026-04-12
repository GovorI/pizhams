import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface OrderConfirmationData {
  to: string;
  orderId: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  address: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌙 Pizhams</h1>
            <p>Подтверждение заказа</p>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${data.customerName}</strong>!</p>
            <p>Ваш заказ успешно оформлен. Мы скоро свяжемся с вами для подтверждения доставки.</p>
            
            <div class="order-details">
              <h3>Детали заказа #${data.orderId.slice(0, 8)}</h3>
              ${data.items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.productName}</strong><br>
                  Количество: ${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽
                </div>
              `,
                )
                .join('')}
              <div class="total">Итого: ${data.total} ₽</div>
            </div>
            
            <p><strong>Адрес доставки:</strong><br>${data.address}</p>
            
            <p>Если у вас возникли вопросы, пожалуйста, ответьте на это письмо.</p>
          </div>
          <div class="footer">
            <p>© 2026 Pizhams. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: `Подтверждение заказа #${data.orderId.slice(0, 8)}`,
        html,
      });

      this.logger.log(`Order confirmation email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.to}: ${error.message}`);
      // Don't throw error - email failure shouldn't break order creation
    }
  }

  async sendWelcomeEmail(email: string, customerName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #6f42c1; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌙 Pizhams</h1>
            <p>Добро пожаловать!</p>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${customerName}</strong>!</p>
            <p>Спасибо за регистрацию в нашем магазине. Теперь вы можете совершать покупки и отслеживать заказы.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:5173/" class="button">Перейти в каталог</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Pizhams. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Добро пожаловать в Pizhams!',
        html,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
      );
    }
  }

  async sendPasswordReset(
    email: string,
    customerName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌙 Pizhams</h1>
            <p>Сброс пароля</p>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${customerName}</strong>!</p>
            <p>Вы запросили сброс пароля. Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">🔑 Сбросить пароль</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Важно:</strong>
              <ul>
                <li>Ссылка действительна в течение 1 часа</li>
                <li>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо</li>
                <li>Ваш текущий пароль останется действительным</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Pizhams. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Сброс пароля - Pizhams',
        html,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
    }
  }
}
