import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard';
import { AuditService, AuditAction } from '../services/audit.service';

@ApiTags('Admin Security')
@Controller('admin/security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminSecurityController {
  constructor(
    private readonly authRateLimitGuard: AuthRateLimitGuard,
    private readonly auditService: AuditService,
  ) {}

  @Get('rate-limit/stats')
  @ApiOperation({ summary: 'Get rate limiting statistics' })
  @ApiResponse({ status: 200, description: 'Rate limiting statistics' })
  getRateLimitStats() {
    const stats = this.authRateLimitGuard.getStats();
    
    this.auditService.log({
      action: AuditAction.ADMIN_USER_ROLE_CHANGE, // Using existing action as placeholder
      details: { action: 'rate_limit_stats_view', stats },
    });

    return {
      message: 'Rate limiting statistics',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('rate-limit/block-ip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block an IP address' })
  @ApiResponse({ status: 200, description: 'IP blocked successfully' })
  blockIp(
    @Body('ip') ip: string,
    @Body('durationMinutes') durationMinutes: number = 60,
    @Body('reason') reason: string = 'Administrative block',
  ) {
    const durationMs = durationMinutes * 60 * 1000;
    this.authRateLimitGuard.blockIp(ip, durationMs);
    
    this.auditService.log({
      action: AuditAction.ADMIN_USER_BAN, // Using existing action
      details: { 
        action: 'ip_block',
        ip,
        durationMinutes,
        reason,
        blockExpiry: new Date(Date.now() + durationMs).toISOString(),
      },
    });

    return {
      message: 'IP blocked successfully',
      data: {
        ip,
        durationMinutes,
        reason,
        blockExpiry: new Date(Date.now() + durationMs).toISOString(),
      },
    };
  }

  @Post('rate-limit/cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger manual cleanup of rate limit records' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  triggerCleanup() {
    this.authRateLimitGuard.cleanup();
    
    const stats = this.authRateLimitGuard.getStats();
    
    this.auditService.log({
      action: AuditAction.ADMIN_USER_ROLE_CHANGE,
      details: { 
        action: 'manual_cleanup',
        stats,
      },
    });

    return {
      message: 'Rate limit cleanup completed',
      data: {
        stats,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('audit/recent')
  @ApiOperation({ summary: 'Get recent audit logs (simplified)' })
  @ApiResponse({ status: 200, description: 'Recent audit logs' })
  getRecentAuditLogs(@Query('limit') limit: number = 50) {
    // This is a simplified version - in production you'd want to store audit logs in a database
    // For now, we'll return a placeholder response
    
    this.auditService.log({
      action: AuditAction.ADMIN_USER_ROLE_CHANGE,
      details: { action: 'audit_logs_view', limit },
    });

    return {
      message: 'Recent audit logs',
      data: {
        note: 'In production, implement database storage for audit logs',
        limit,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
