import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface AuthRateLimitConfig {
  login: { windowMs: number; max: number };
  register: { windowMs: number; max: number };
  passwordReset: { windowMs: number; max: number };
}

interface IpRecord {
  attempts: number;
  resetTime: number;
  isBlocked?: boolean;
  blockExpiry?: number;
}

@Injectable()
export class AuthRateLimitGuard {
  private readonly ipStore = new Map<string, IpRecord>();
  private readonly emailStore = new Map<string, IpRecord>();
  
  private readonly config: AuthRateLimitConfig = {
    login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
    register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const endpoint = this.getEndpointType(request);
    const clientIp = this.getClientIp(request);
    const email = this.getEmailFromRequest(request);
    
    const now = Date.now();
    
    // Check IP-based blocking
    const ipKey = `ip:${clientIp}`;
    const ipRecord = this.ipStore.get(ipKey);
    
    if (ipRecord && ipRecord.isBlocked && ipRecord.blockExpiry && now < ipRecord.blockExpiry) {
      const remainingMinutes = Math.ceil((ipRecord.blockExpiry - now) / (60 * 1000));
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `IP address temporarily blocked due to suspicious activity. Try again in ${remainingMinutes} minutes.`,
        blockExpiry: ipRecord.blockExpiry,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Check email-based rate limiting for login/register
    if (email && (endpoint === 'login' || endpoint === 'register')) {
      const emailKey = `email:${email}:${endpoint}`;
      const emailRecord = this.emailStore.get(emailKey);
      
      if (emailRecord && now < emailRecord.resetTime) {
        if (emailRecord.attempts >= this.config[endpoint].max) {
          const resetInSeconds = Math.ceil((emailRecord.resetTime - now) / 1000);
          throw new HttpException({
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Too many ${endpoint} attempts for this email. Please try again later.`,
            retryAfter: resetInSeconds,
          }, HttpStatus.TOO_MANY_REQUESTS);
        }
        emailRecord.attempts++;
      } else {
        this.emailStore.set(emailKey, {
          attempts: 1,
          resetTime: now + this.config[endpoint].windowMs,
        });
      }
    }

    // Update IP record
    this.updateIpRecord(ipKey, now, endpoint);
    
    return true;
  }

  private getEndpointType(request: Request): keyof AuthRateLimitConfig {
    const path = request.path;
    if (path.includes('/login')) return 'login';
    if (path.includes('/register')) return 'register';
    if (path.includes('/password')) return 'passwordReset';
    return 'login'; // fallback
  }

  private getEmailFromRequest(request: Request): string | null {
    if (request.body && request.body.email) {
      return request.body.email.toLowerCase().trim();
    }
    return null;
  }

  private updateIpRecord(ipKey: string, now: number, endpoint: keyof AuthRateLimitConfig): void {
    const record = this.ipStore.get(ipKey);
    
    if (!record || now > record.resetTime) {
      this.ipStore.set(ipKey, {
        attempts: 1,
        resetTime: now + this.config[endpoint].windowMs,
      });
    } else {
      record.attempts++;
      
      // Block IP if too many failed attempts across different endpoints
      if (record.attempts > 20) { // 20 attempts in any window
        record.isBlocked = true;
        record.blockExpiry = now + (60 * 60 * 1000); // Block for 1 hour
      }
    }
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

  // Method to manually block an IP (for admin use)
  blockIp(ip: string, durationMs: number = 60 * 60 * 1000): void {
    const ipKey = `ip:${ip}`;
    const now = Date.now();
    
    this.ipStore.set(ipKey, {
      attempts: 999,
      resetTime: now + durationMs,
      isBlocked: true,
      blockExpiry: now + durationMs,
    });
  }

  // Cleanup method to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.ipStore.entries()) {
      if (now > record.resetTime && (!record.isBlocked || !record.blockExpiry || now > record.blockExpiry)) {
        this.ipStore.delete(key);
      }
    }
    
    for (const [key, record] of this.emailStore.entries()) {
      if (now > record.resetTime) {
        this.emailStore.delete(key);
      }
    }
  }

  // Get statistics for monitoring
  getStats(): { totalIps: number; totalEmails: number; blockedIps: number } {
    const now = Date.now();
    let blockedIps = 0;
    
    for (const record of this.ipStore.values()) {
      if (record.isBlocked && record.blockExpiry && now < record.blockExpiry) {
        blockedIps++;
      }
    }
    
    return {
      totalIps: this.ipStore.size,
      totalEmails: this.emailStore.size,
      blockedIps,
    };
  }
}
