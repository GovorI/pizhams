import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class IpRateLimitInterceptor implements NestInterceptor {
  private readonly ipStore = new Map<string, { count: number; resetTime: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const key = `${request.path}:${clientIp}`;
    
    const now = Date.now();
    const record = this.ipStore.get(key);

    // Default limits: 100 requests per 15 minutes per IP per endpoint
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 100;

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.ipStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next.handle();
    }

    // Increment counter
    record.count++;

    if (record.count > maxRequests) {
      const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
      
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: resetInSeconds,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }

  private getClientIp(request: Request): string {
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
