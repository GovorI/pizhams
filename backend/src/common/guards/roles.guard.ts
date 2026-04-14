import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
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
    this.logger.log(`Auth header: ${authHeader?.substring(0, 30)}...`);
    
    const token = authHeader?.split(' ')[1];

    if (!token) {
      this.logger.warn('No token found');
      return false;
    }

    try {
      const jwtService = this.moduleRef.get(JwtService, { strict: false });
      const user = jwtService.verify(token);
      this.logger.log(`Decoded user: ${JSON.stringify(user)}`);
      
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
