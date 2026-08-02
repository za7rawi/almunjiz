import { prisma } from "@/lib/prisma";

export const fileAttachmentSelect = {
  id: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  mimeType: true,
  fileSize: true,
  uploadedAt: true,
} as const;

export interface FileAttachmentSummary {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  fileSize: number;
  uploadedAt: Date;
}

type OrphanedFileAttachment = FileAttachmentSummary & {
  userId: string;
};

interface OrderAttachmentFields {
  id: string;
  userId: string;
  createdAt?: Date | string | null;
  attachments?: string[] | null;
  fileAttachments?: FileAttachmentSummary[] | null;
}

export type OrderWithRecoveredAttachments<T extends OrderAttachmentFields> = T & {
  fileAttachments: FileAttachmentSummary[];
  unresolvedAttachments: string[];
};

function normalizeAttachmentName(name: string) {
  return name.trim().toLowerCase();
}

function uniqueAttachmentNames(attachments?: string[] | null) {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const attachment of attachments ?? []) {
    const name = attachment.trim();
    if (!name) continue;

    const key = normalizeAttachmentName(name);
    if (!seen.has(key)) {
      seen.add(key);
      names.push(name);
    }
  }

  return names;
}

function withUnresolvedAttachments<T extends OrderAttachmentFields>(
  order: T,
  fileAttachments: FileAttachmentSummary[]
): OrderWithRecoveredAttachments<T> {
  const resolvedNames = new Set(
    fileAttachments.map((file) => normalizeAttachmentName(file.fileName))
  );
  const unresolvedAttachments = uniqueAttachmentNames(order.attachments).filter(
    (name) => !resolvedNames.has(normalizeAttachmentName(name))
  );

  return {
    ...order,
    fileAttachments,
    unresolvedAttachments,
  };
}

function pickClosestOrder<T extends OrderAttachmentFields>(
  file: FileAttachmentSummary,
  orders: T[]
) {
  if (orders.length === 1) return orders[0];

  const uploadedAt = file.uploadedAt?.getTime?.();
  if (!uploadedAt) return null;

  const candidates = orders
    .map((order) => {
      if (!order.createdAt) return null;
      const createdAt = new Date(order.createdAt).getTime();
      if (!Number.isFinite(createdAt) || createdAt < uploadedAt) return null;
      return { order, delta: createdAt - uploadedAt };
    })
    .filter((entry): entry is { order: T; delta: number } => Boolean(entry))
    .sort((a, b) => a.delta - b.delta);

  return candidates[0]?.order ?? null;
}

function stripInternalFileFields(file: OrphanedFileAttachment): FileAttachmentSummary {
  return {
    id: file.id,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
  };
}

export async function recoverFileAttachmentsForOrder<T extends OrderAttachmentFields>(
  order: T
): Promise<OrderWithRecoveredAttachments<T>> {
  const currentFiles = order.fileAttachments ?? [];
  const attachmentNames = uniqueAttachmentNames(order.attachments);
  if (attachmentNames.length === 0) {
    return withUnresolvedAttachments(order, currentFiles);
  }

  const resolvedNames = new Set(
    currentFiles.map((file) => normalizeAttachmentName(file.fileName))
  );
  const missingNames = attachmentNames.filter(
    (name) => !resolvedNames.has(normalizeAttachmentName(name))
  );

  if (missingNames.length === 0) {
    return withUnresolvedAttachments(order, currentFiles);
  }

  const recoveredFiles = await prisma.fileAttachment.findMany({
    where: {
      userId: order.userId,
      orderId: null,
      fileName: { in: missingNames },
    },
    select: fileAttachmentSelect,
    orderBy: { uploadedAt: "asc" },
  });

  if (recoveredFiles.length > 0) {
    await prisma.fileAttachment.updateMany({
      where: { id: { in: recoveredFiles.map((file) => file.id) }, orderId: null },
      data: { orderId: order.id },
    });
  }

  return withUnresolvedAttachments(order, [...currentFiles, ...recoveredFiles]);
}

export async function recoverFileAttachmentsForOrders<T extends OrderAttachmentFields>(
  orders: T[]
): Promise<OrderWithRecoveredAttachments<T>[]> {
  const ordersNeedingRecovery = orders.filter((order) => {
    const currentFiles = order.fileAttachments ?? [];
    const resolvedNames = new Set(
      currentFiles.map((file) => normalizeAttachmentName(file.fileName))
    );
    return uniqueAttachmentNames(order.attachments).some(
      (name) => !resolvedNames.has(normalizeAttachmentName(name))
    );
  });

  if (ordersNeedingRecovery.length === 0) {
    return orders.map((order) =>
      withUnresolvedAttachments(order, order.fileAttachments ?? [])
    );
  }

  const userIds = [...new Set(ordersNeedingRecovery.map((order) => order.userId))];
  const missingNames = [
    ...new Set(
      ordersNeedingRecovery.flatMap((order) => {
        const resolvedNames = new Set(
          (order.fileAttachments ?? []).map((file) =>
            normalizeAttachmentName(file.fileName)
          )
        );
        return uniqueAttachmentNames(order.attachments).filter(
          (name) => !resolvedNames.has(normalizeAttachmentName(name))
        );
      })
    ),
  ];

  const orphanedFiles = await prisma.fileAttachment.findMany({
    where: {
      userId: { in: userIds },
      orderId: null,
      fileName: { in: missingNames },
    },
    select: { ...fileAttachmentSelect, userId: true },
    orderBy: { uploadedAt: "asc" },
  });

  const ordersByUserAndName = new Map<string, T[]>();
  for (const order of ordersNeedingRecovery) {
    const currentNames = new Set(
      (order.fileAttachments ?? []).map((file) =>
        normalizeAttachmentName(file.fileName)
      )
    );

    for (const name of uniqueAttachmentNames(order.attachments)) {
      if (currentNames.has(normalizeAttachmentName(name))) continue;
      const key = `${order.userId}\u0000${normalizeAttachmentName(name)}`;
      ordersByUserAndName.set(key, [...(ordersByUserAndName.get(key) ?? []), order]);
    }
  }

  const filesByOrderId = new Map<string, FileAttachmentSummary[]>();
  for (const file of orphanedFiles) {
    const key = `${file.userId}\u0000${normalizeAttachmentName(file.fileName)}`;
    const matchingOrders = ordersByUserAndName.get(key) ?? [];
    const order = pickClosestOrder(file, matchingOrders);
    if (!order) continue;

    filesByOrderId.set(order.id, [
      ...(filesByOrderId.get(order.id) ?? []),
      stripInternalFileFields(file),
    ]);
  }

  if (filesByOrderId.size > 0) {
    await Promise.all(
      [...filesByOrderId.entries()].map(([orderId, files]) =>
        prisma.fileAttachment.updateMany({
          where: { id: { in: files.map((file) => file.id) }, orderId: null },
          data: { orderId },
        })
      )
    );
  }

  return orders.map((order) =>
    withUnresolvedAttachments(order, [
      ...(order.fileAttachments ?? []),
      ...(filesByOrderId.get(order.id) ?? []),
    ])
  );
}
