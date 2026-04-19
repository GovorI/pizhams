import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

@Injectable()
export class CleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CleanupService.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly authRateLimitGuard: AuthRateLimitGuard,
  ) {}

  onModuleInit() {
    // Run cleanup every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);

    this.logger.log('Cleanup service initialized - will run every 5 minutes');
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.logger.log('Cleanup service stopped');
    }
  }

  private performCleanup() {
    try {
      const beforeStats = this.authRateLimitGuard.getStats();

      this.authRateLimitGuard.cleanup();

      const afterStats = this.authRateLimitGuard.getStats();

      this.logger.log('Auth rate limit cleanup completed', {
        before: beforeStats,
        after: afterStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error during auth rate limit cleanup', error);
    }
  }

  // Manual cleanup method for testing or emergency use
  manualCleanup() {
    this.logger.log('Manual cleanup triggered');
    this.performCleanup();
  }
}
