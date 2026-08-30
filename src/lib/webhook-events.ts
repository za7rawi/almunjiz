import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export async function isWebhookDuplicate(
  provider: string,
  transactionId: string | null,
  payloadHash: string
): Promise<boolean> {
  const existing = await prisma.webhookEvent.findFirst({
    where: {
      provider,
      OR: [
        ...(transactionId ? [{ transactionId }] : []),
        { payloadHash },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return !!existing;
}

export async function recordWebhookEvent(
  provider: string,
  transactionId: string | null,
  rawBody: string,
  status = 'received'
): Promise<string> {
  const payloadHash = createHash('sha256').update(rawBody).digest('hex');

  const event = await prisma.webhookEvent.create({
    data: {
      provider,
      transactionId,
      payloadHash,
      status,
    },
  });

  return event.id;
}

export async function updateWebhookEventStatus(
  id: string,
  status: string
): Promise<void> {
  await prisma.webhookEvent.update({
    where: { id },
    data: { status },
  });
}
