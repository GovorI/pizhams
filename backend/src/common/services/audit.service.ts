import { Injectable, Logger } from '@nestjs/common';

export enum AuditAction {
  AUTH_LOGIN = 'auth.login',
  AUTH_REGISTER = 'auth.register',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_TOKEN_REFRESH = 'auth.token_refresh',
  ADMIN_PRODUCT_CREATE = 'admin.product.create',
  ADMIN_PRODUCT_UPDATE = 'admin.product.update',
  ADMIN_PRODUCT_DELETE = 'admin.product.delete',
  ADMIN_ORDER_STATUS_CHANGE = 'admin.order.status_change',
  ADMIN_USER_ROLE_CHANGE = 'admin.user.role_change',
  ADMIN_USER_BAN = 'admin.user.ban',
  ADMIN_USER_UNBAN = 'admin.user.unban',
  ADMIN_REVIEW_MODERATE = 'admin.review.moderate',
  MEMO_CARDSET_CREATE = 'memo.cardset.create',
  MEMO_CARDSET_DELETE = 'memo.cardset.delete',
  MEMO_CARDSET_UPDATE = 'memo.cardset.update',
  MEMO_CARD_CREATE = 'memo.card.create',
  MEMO_CARD_DELETE = 'memo.card.delete',
  MEMO_GAME_CREATE = 'memo.game.create',
  MEMO_GAME_LEAVE = 'memo.game.leave',
  MEMO_IMAGE_UPLOAD = 'memo.image.upload',
  FILE_UPLOAD = 'file.upload',
  FILE_DELETE = 'file.delete',
  FORBIDDEN_ACCESS = 'security.forbidden_access',
  INVALID_TOKEN = 'security.invalid_token',
}

export interface AuditEvent {
  action: AuditAction;
  userId?: string;
  email?: string;
  role?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  log(event: AuditEvent): void {
    const timestamp = new Date().toISOString();
    const userId = event.userId || 'anonymous';
    const action = event.action;
    const details = event.details ? ` | ${JSON.stringify(event.details)}` : '';
    const ip = event.ipAddress ? ` | IP: ${event.ipAddress}` : '';

    this.logger.log(
      `📋 [${timestamp}] ${action} | User: ${userId} (${event.email || 'N/A'}) | Role: ${event.role || 'unknown'}${details}${ip}`,
    );
  }

  warn(event: AuditEvent): void {
    const timestamp = new Date().toISOString();
    const userId = event.userId || 'anonymous';
    const action = event.action;
    const details = event.details ? ` | ${JSON.stringify(event.details)}` : '';
    const ip = event.ipAddress ? ` | IP: ${event.ipAddress}` : '';

    this.logger.warn(
      `⚠️  [${timestamp}] ${action} | User: ${userId} (${event.email || 'N/A'}) | Role: ${event.role || 'unknown'}${details}${ip}`,
    );
  }

  error(event: AuditEvent, errorMessage?: string): void {
    const timestamp = new Date().toISOString();
    const userId = event.userId || 'anonymous';
    const action = event.action;
    const details = event.details ? ` | ${JSON.stringify(event.details)}` : '';
    const ip = event.ipAddress ? ` | IP: ${event.ipAddress}` : '';
    const error = errorMessage ? ` | Error: ${errorMessage}` : '';

    this.logger.error(
      `🚨 [${timestamp}] ${action} | User: ${userId} (${event.email || 'N/A'}) | Role: ${event.role || 'unknown'}${details}${ip}${error}`,
    );
  }
}
