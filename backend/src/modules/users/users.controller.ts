import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  async register(@Body() createUserDto: CreateUserDto): Promise<{ user: Partial<User> }> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return { user: result };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiResponse({ status: 200, description: 'Информация о пользователе' })
  async getMe(@Request() req): Promise<Partial<User>> {
    return req.user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  @ApiResponse({ status: 409, description: 'Email уже используется' })
  async updateProfile(
    @Request() req,
    @Body('email') email?: string,
  ): Promise<Partial<User>> {
    const user = await this.usersService.updateProfile(req.user.id, email);
    const { password, ...result } = user;
    return result;
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  @ApiResponse({ status: 400, description: 'Неверный текущий пароль' })
  async changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(req.user.id, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запрос на сброс пароля' })
  @ApiResponse({ status: 200, description: 'Email отправлен если пользователь существует' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.requestPasswordReset(forgotPasswordDto.email);
    // Always return success to prevent email enumeration
    return { message: 'Если пользователь с таким email существует, вы получите инструкцию по сбросу пароля' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сброс пароля по токену' })
  @ApiResponse({ status: 200, description: 'Пароль успешно сброшен' })
  @ApiResponse({ status: 400, description: 'Неверный или истекший токен' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const success = await this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    if (!success) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { message: 'Пароль успешно сброшен' };
  }

  @Get('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверка токена сброса пароля' })
  @ApiResponse({ status: 200, description: 'Токен валиден' })
  @ApiResponse({ status: 400, description: 'Неверный или истекший токен' })
  async validateResetToken(
    @Body('token') token: string,
  ): Promise<{ valid: boolean }> {
    const isValid = await this.usersService.validateResetToken(token);
    return { valid: isValid };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список всех пользователей (admin)' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiOperation({ summary: 'Изменить роль пользователя (admin)' })
  @ApiResponse({ status: 200, description: 'Роль изменена' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
  ): Promise<User> {
    return await this.usersService.updateRole(id, role);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiOperation({ summary: 'Заблокировать пользователя (admin)' })
  @ApiResponse({ status: 200, description: 'Пользователь заблокирован' })
  async ban(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.ban(id);
  }

  @Post(':id/unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiOperation({ summary: 'Разблокировать пользователя (admin)' })
  @ApiResponse({ status: 200, description: 'Пользователь разблокирован' })
  async unban(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.unban(id);
  }
}
