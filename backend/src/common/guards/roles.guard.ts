import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditService, AuditAction } from '../services/audit.service';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private jwtService: JwtService;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private auditService: AuditService,
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
      this.auditService.warn({
        action: AuditAction.FORBIDDEN_ACCESS,
        details: {
          path: request.url,
          method: request.method,
          reason: 'No token provided',
        },
        ipAddress: request.ip,
      });
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
      
      request.user = user;
      const hasRole = requiredRoles.some((role) => user.role === role);
      
      if (!hasRole) {
        this.auditService.warn({
          action: AuditAction.FORBIDDEN_ACCESS,
          userId: user.sub,
          email: user.email,
          role: user.role,
          details: {
            path: request.url,
            method: request.method,
            requiredRoles,
            userRole: user.role,
            reason: 'Insufficient permissions',
          },
          ipAddress: request.ip,
        });
        return false;
      }
      
      this.logger.log(`✅ Role check passed: ${user.role} for ${request.url}`);
      return true;
    } catch (error) {
      this.auditService.error({
        action: AuditAction.INVALID_TOKEN,
        details: {
          path: request.url,
          method: request.method,
          reason: error.message,
        },
        ipAddress: request.ip,
      }, error.message);
      return false;
    }
  }
}
