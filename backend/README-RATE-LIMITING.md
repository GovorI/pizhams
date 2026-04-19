# IP-Based Rate Limiting Implementation

## Overview

This document describes the IP-based rate limiting implementation for the Pizhams backend API, providing enhanced security for authentication endpoints and general API protection.

## Features

### 🔐 Auth-Specific Rate Limiting

The `AuthRateLimitGuard` provides specialized protection for authentication endpoints:

- **Login**: 5 attempts per 15 minutes per IP + email combination
- **Register**: 3 attempts per hour per IP + email combination  
- **Password Reset**: 3 requests per 15 minutes per IP + email combination
- **Automatic IP Blocking**: IPs with 20+ failed attempts are blocked for 1 hour

### 🛡️ General IP Rate Limiting

The `IpRateLimitGuard` provides general API protection:

- **Default**: 100 requests per 15 minutes per IP per endpoint
- **Configurable**: Custom limits per endpoint using decorators
- **Memory Efficient**: Automatic cleanup to prevent memory leaks

### 📊 Monitoring & Administration

Admin endpoints for monitoring and management:

- `GET /admin/security/rate-limit/stats` - View rate limiting statistics
- `POST /admin/security/rate-limit/block-ip` - Manually block an IP
- `POST /admin/security/rate-limit/cleanup` - Trigger manual cleanup
- `GET /admin/security/audit/recent` - View recent audit logs

## Implementation Details

### Core Components

#### AuthRateLimitGuard
```typescript
// Applied globally to all auth endpoints
@UseGuards(AuthRateLimitGuard)
export class AuthController {
  // All auth methods are protected
}
```

#### IpRateLimitGuard (Optional)
```typescript
// Can be applied to any endpoint
@UseGuards(IpRateLimitGuard)
@IpRateLimit({ windowMs: 60000, max: 30 })
@Get('sensitive-endpoint')
sensitiveEndpoint() {
  // Custom rate limiting
}
```

### Configuration

#### Environment Variables
```bash
# No additional env vars needed - uses in-memory storage
# For production, consider Redis implementation
```

#### Rate Limit Configurations
```typescript
// Auth endpoints (built-in)
const authLimits = {
  login: { windowMs: 15 * 60 * 1000, max: 5 },
  register: { windowMs: 60 * 60 * 1000, max: 3 },
  passwordReset: { windowMs: 15 * 60 * 1000, max: 3 },
};

// General endpoints (configurable)
@IpRateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
})
```

## API Endpoints

### Authentication Endpoints (Protected)

All auth endpoints have enhanced rate limiting:

- `POST /api/auth/login` - 5 attempts per 15 min
- `POST /api/auth/register` - 3 attempts per hour  
- `POST /api/auth/password-reset-request` - 3 requests per 15 min
- `POST /api/auth/password-reset` - 5 attempts per 15 min

### Admin Endpoints

For monitoring and management:

```bash
# Get rate limiting statistics
GET /api/admin/security/rate-limit/stats

# Block an IP address
POST /api/admin/security/rate-limit/block-ip
{
  "ip": "192.168.1.100",
  "durationMinutes": 60,
  "reason": "Suspicious activity"
}

# Manual cleanup
POST /api/admin/security/rate-limit/cleanup
```

## Security Features

### IP Detection
- Supports proxy headers (`X-Forwarded-For`, `X-Real-IP`, `X-Client-IP`)
- Fallback to connection remote address
- Handles IPv4 and IPv6

### Memory Management
- Automatic cleanup every 5 minutes via `CleanupService`
- Manual cleanup available via admin endpoint
- Efficient storage using Maps

### Audit Logging
All rate limiting events are logged with:
- IP address
- Email (for auth endpoints)
- Action performed
- Success/failure status
- Timestamp

## Response Format

### Rate Limited Response
```json
{
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

### IP Blocked Response
```json
{
  "statusCode": 429,
  "message": "IP address temporarily blocked due to suspicious activity. Try again in 60 minutes.",
  "blockExpiry": 1640995200000
}
```

## Production Considerations

### Scaling
- Current implementation uses in-memory storage
- For multiple server instances, consider Redis implementation
- Use sticky sessions or distributed storage

### Monitoring
- Monitor cleanup service performance
- Track blocked IPs and patterns
- Set up alerts for unusual activity

### Performance
- Memory usage grows with unique IPs
- Cleanup interval can be adjusted (default: 5 minutes)
- Consider TTL-based storage for large deployments

## Testing

### Unit Tests
```typescript
// Test rate limiting behavior
describe('AuthRateLimitGuard', () => {
  it('should allow requests within limits', async () => {
    // Test implementation
  });
  
  it('should block requests exceeding limits', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// Test with real HTTP requests
describe('Auth Controller Rate Limiting', () => {
  it('should enforce rate limits on login', async () => {
    // Make multiple requests and verify blocking
  });
});
```

## Future Enhancements

1. **Redis Integration**: For distributed rate limiting
2. **Dynamic Configuration**: Runtime configuration updates
3. **Advanced Patterns**: Detect and block sophisticated attacks
4. **Geographic Blocking**: Country/region-based restrictions
5. **User-based Limits**: Per-user rate limiting in addition to IP

## Troubleshooting

### Common Issues

1. **Memory Usage**: High memory with many unique IPs
   - Solution: Reduce cleanup interval or implement Redis

2. **False Positives**: Legitimate users blocked
   - Solution: Adjust limits or implement whitelist

3. **Proxy Detection**: Incorrect IP detection
   - Solution: Configure proper proxy headers

### Debug Information

Enable debug logging to see rate limiting activity:

```typescript
// In your main.ts
const logger = new Logger('RateLimit');
logger.log('Rate limiting statistics:', stats);
```
