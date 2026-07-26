import { prisma } from './prisma';

export type AuditAction =
  | 'payment.created'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.verified'
  | 'webhook.received'
  | 'webhook.processed'
  | 'webhook.failed'
  | 'gateway.created'
  | 'gateway.updated'
  | 'gateway.deleted'
  | 'gateway.tested'
  | 'gateway.activated'
  | 'gateway.deactivated'
  | 'idempotency.duplicate_blocked'
  | 'invoice.created'
  | 'invoice.paid'
  | 'order.created'
  | 'order.updated'
  | 'order.status_changed'
  | 'order.note_added'
  | 'order.file_uploaded'
  | 'order.email_sent'
  | 'user.registered'
  | 'user.login'
  | 'settings.backup_created'
  | 'settings.test_email'
  | 'settings.password_changed'
  | 'settings.updated';

interface AuditParams {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || 'system',
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        newData: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error(`[AUDIT] Failed to write audit log for ${params.action}:`, error);
  }
}

export async function getAuditLogs(params: {
  resource?: string;
  resourceId?: string;
  action?: AuditAction;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  const { resource, resourceId, action, userId, page = 1, limit = 50 } = params;
  const where: Record<string, unknown> = {};
  if (resource) where.resource = resource;
  if (resourceId) where.resourceId = resourceId;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
