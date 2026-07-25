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
  createdAt: string;
  updatedAt: string;
  service?: { id: string; name: string; nameEn: string; price: number };
  timeline?: { id: string; status: string; description: string; createdAt: string }[];
  invoice?: { invoiceNumber: string };
  payments?: { id: string; transactionId: string; status: string; provider: string }[];
}
