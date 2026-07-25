export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  tax: number;
  total: number;
  discount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  internalNotes?: string;
  attachments: string[];
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  service?: { id: string; name: string; nameEn: string; price: number; description?: string; descriptionEn?: string };
  timeline?: { id: string; status: string; description: string; createdAt: string }[];
  invoice?: { id: string; invoiceNumber: string; subtotal: number; tax: number; discount: number; total: number; status: string; dueDate?: string; paidAt?: string };
  payments?: { id: string; transactionId: string; status: string; method: string; amount: number; paymentMethod?: string }[];
  gateway?: { id: string; name: string; slug: string };
  fileAttachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    mimeType?: string;
    fileSize: number;
    uploadedAt: string;
  }[];
}
