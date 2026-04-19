import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRateLimitGuard } from '../../common/guards/auth-rate-limit.guard';
import { AuditService, AuditAction } from '../../common/services/audit.service';

@ApiTags('auth')
@Controller('auth')
@UseGuards(AuthRateLimitGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiResponse({ status: 429, description: 'Слишком много попыток входа' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    try {
      const result = await this.authService.loginUser(loginDto.email, loginDto.password);
      
      this.auditService.log({
        action: AuditAction.AUTH_LOGIN,
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        ipAddress: req.ip,
        details: { success: true },
      });
      
      return result;
    } catch (error) {
      this.auditService.warn({
        action: AuditAction.AUTH_LOGIN,
        email: loginDto.email,
        ipAddress: req.ip,
        details: { 
          success: false, 
          reason: error.message || 'Invalid credentials' 
        },
      });
      throw error;
    }
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  @ApiResponse({ status: 429, description: 'Слишком много попыток регистрации' })
  async register(@Body() registerDto: LoginDto, @Request() req) {
    try {
      const result = await this.authService.registerUser(
        registerDto.email,
        registerDto.password,
      );
      
      this.auditService.log({
        action: AuditAction.AUTH_REGISTER,
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        ipAddress: req.ip,
        details: { success: true },
      });
      
      return result;
    } catch (error) {
      this.auditService.warn({
        action: AuditAction.AUTH_REGISTER,
        email: registerDto.email,
        ipAddress: req.ip,
        details: { 
          success: false, 
          reason: error.message || 'Registration failed' 
        },
      });
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  async logout(@Request() req) {
    this.auditService.log({
      action: AuditAction.AUTH_LOGOUT,
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ipAddress: req.ip,
      details: { success: true },
    });
    
    // В реальном приложении здесь можно инвалидировать токен
    return { message: 'Успешный выход' };
  }

  @Post('password-reset-request')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
  @ApiOperation({ summary: 'Запрос сброса пароля' })
  @ApiResponse({ status: 200, description: 'Инструкции отправлены на email' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов' })
  async requestPasswordReset(@Body('email') email: string, @Request() req) {
    try {
      await this.authService.requestPasswordReset(email);
      
      this.auditService.log({
        action: AuditAction.AUTH_TOKEN_REFRESH, // Using existing action as placeholder
        email: email,
        ipAddress: req.ip,
        details: { action: 'password_reset_request', success: true },
      });
      
      return { message: 'Password reset instructions sent to your email' };
    } catch (error) {
      this.auditService.warn({
        action: AuditAction.AUTH_TOKEN_REFRESH,
        email: email,
        ipAddress: req.ip,
        details: { 
          action: 'password_reset_request',
          success: false, 
          reason: error.message 
        },
      });
      throw error;
    }
  }

  @Post('password-reset')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  @ApiOperation({ summary: 'Сброс пароля' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @ApiResponse({ status: 400, description: 'Неверный или просроченный токен' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
    @Request() req
  ) {
    try {
      const success = await this.authService.resetPassword(token, newPassword);
      
      if (success) {
        this.auditService.log({
          action: AuditAction.AUTH_TOKEN_REFRESH,
          ipAddress: req.ip,
          details: { action: 'password_reset', success: true },
        });
        
        return { message: 'Password reset successfully' };
      } else {
        throw new Error('Invalid or expired token');
      }
    } catch (error) {
      this.auditService.warn({
        action: AuditAction.AUTH_TOKEN_REFRESH,
        ipAddress: req.ip,
        details: { 
          action: 'password_reset',
          success: false, 
          reason: error.message 
        },
      });
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiResponse({ status: 200, description: 'Информация о пользователе' })
  async getMe(@Request() req) {
    return req.user;
  }
}
