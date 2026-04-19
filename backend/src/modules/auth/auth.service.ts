import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuditService, AuditAction } from '../../common/services/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.auditService.warn({
        action: AuditAction.AUTH_LOGIN,
        email,
        details: { reason: 'User not found' },
      });
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      this.auditService.warn({
        action: AuditAction.AUTH_LOGIN,
        email,
        userId: user.id,
        details: { reason: 'Invalid password' },
      });
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async loginUser(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    this.auditService.log({
      action: AuditAction.AUTH_LOGIN,
      userId: user.id,
      email: user.email,
      role: user.role,
      details: { success: true },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async registerUser(email: string, password: string) {
    const user = await this.usersService.create({ email, password });
    const { password: _, ...result } = user;

    const payload = { email: result.email, sub: result.id, role: result.role };

    this.auditService.log({
      action: AuditAction.AUTH_REGISTER,
      userId: user.id,
      email: user.email,
      role: user.role,
      details: { success: true },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.usersService.requestPasswordReset(email);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    return await this.usersService.resetPassword(token, newPassword);
  }

  async validateResetToken(token: string): Promise<boolean> {
    return await this.usersService.validateResetToken(token);
  }
}
