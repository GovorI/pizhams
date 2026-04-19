import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
}

interface IpRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class IpRateLimitGuard {
  private readonly ipStore = new Map<string, IpRecord>();
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const config = this.getConfig(context) || this.defaultConfig;
    
    const clientIp = this.getClientIp(request);
    const key = `${request.route?.path || request.path}:${clientIp}`;
    
    const now = Date.now();
    const record = this.ipStore.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.ipStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Increment counter
    record.count++;

    if (record.count > config.max) {
      // Rate limit exceeded
      const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
      
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: resetInSeconds,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private getConfig(context: ExecutionContext): RateLimitConfig | null {
    return this.reflector.get<RateLimitConfig>('ipRateLimit', context.getHandler());
  }

  private getClientIp(request: Request): string {
    // Try to get real IP from various headers
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const clientIp = request.headers['x-client-ip'] as string;
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    if (clientIp) {
      return clientIp;
    }
    
    return request.connection?.remoteAddress || 
           request.socket?.remoteAddress || 
           '127.0.0.1';
  }

  // Cleanup method to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.ipStore.entries()) {
      if (now > record.resetTime) {
        this.ipStore.delete(key);
      }
    }
  }
}

// Decorator for setting rate limit config
export const IpRateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata('ipRateLimit', config, descriptor.value);
    } else {
      // Class decorator
      Reflect.defineMetadata('ipRateLimit', config, target);
    }
  };
};
