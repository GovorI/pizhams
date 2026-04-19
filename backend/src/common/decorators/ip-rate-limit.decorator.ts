import { SetMetadata } from '@nestjs/common';

export const IP_RATE_LIMIT_KEY = 'ipRateLimit';
export interface IpRateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Decorator to set IP-based rate limiting configuration for a specific endpoint
 * 
 * @param config Rate limiting configuration
 * 
 * @example
 * `@IpRateLimit({ windowMs: 15 * 60 * 1000, max: 100 })`
 * // 100 requests per 15 minutes per IP
 */
export const IpRateLimit = (config: IpRateLimitConfig) =>
  SetMetadata(IP_RATE_LIMIT_KEY, config);
