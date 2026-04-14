import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private jwtService: JwtService;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    const token = authHeader?.split(' ')[1];

    if (!token) {
      this.logger.warn('No token found');
      return false;
    }

    try {
      // Create JwtService with the same secret as used in JwtStrategy
      if (!this.jwtService) {
        this.jwtService = new JwtService({
          secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
        });
      }
      
      const user = this.jwtService.verify(token);
      this.logger.log(`Decoded user role: ${user.role}`);
      
      request.user = user;
      const hasRole = requiredRoles.some((role) => user.role === role);
      
      if (!hasRole) {
        this.logger.warn(
          `User role "${user.role}" doesn't match required: ${requiredRoles.join(', ')}`,
        );
      }
      
      return hasRole;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return false;
    }
  }
}
