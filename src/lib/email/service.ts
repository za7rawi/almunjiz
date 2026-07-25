import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "المنجز <noreply@munjiz.store>";

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables");
  }
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

type SendEmailOpts = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail(
  opts: SendEmailOpts
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getClient();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    if (error) {
      console.error("[EmailService] Resend error:", error);
      return { success: false, error: error.message || "فشل إرسال البريد" };
    }

    return { success: true };
  } catch (err) {
    console.error("[EmailService] Exception:", err);
    return { success: false, error: "حدث خطأ أثناء إرسال البريد" };
  }
}

// ============================================================
// High-level senders
// ============================================================

import { otpTemplate } from "./templates/otp";
import { welcomeTemplate } from "./templates/welcome";
import { orderCreatedTemplate } from "./templates/order-created";
import { paymentSuccessTemplate } from "./templates/payment-success";
import { invoiceTemplate } from "./templates/invoice";
import { orderStatusTemplate } from "./templates/order-status";
import { orderCompletedTemplate } from "./templates/order-completed";

export async function sendOtpEmail(
  email: string,
  name: string,
  code: string
) {
  return sendEmail({
    to: email,
    subject: "رمز التحقق - المنجز",
    html: otpTemplate({ customerName: name, code }),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "مرحبًا بك في المنجز 🎉",
    html: welcomeTemplate({ customerName: name }),
  });
}

export async function sendOrderCreatedEmail(opts: {
  email: string;
  name: string;
  orderNumber: string;
  serviceName: string;
  amount: string;
  currency?: string;
}) {
  return sendEmail({
    to: opts.email,
    subject: `تم استلام طلبك بنجاح ✅ - ${opts.orderNumber}`,
    html: orderCreatedTemplate({
      customerName: opts.name,
      orderNumber: opts.orderNumber,
      serviceName: opts.serviceName,
      amount: opts.amount,
      currency: opts.currency,
    }),
  });
}

export async function sendPaymentSuccessEmail(opts: {
  email: string;
  name: string;
  transactionId: string;
  amount: string;
  currency?: string;
  orderNumber: string;
  paymentMethod?: string;
  invoicePdf?: Buffer;
}) {
  return sendEmail({
    to: opts.email,
    subject: `تم تأكيد عملية الدفع 💳 - ${opts.amount} ${opts.currency || "SAR"}`,
    html: paymentSuccessTemplate({
      customerName: opts.name,
      transactionId: opts.transactionId,
      amount: opts.amount,
      currency: opts.currency,
      orderNumber: opts.orderNumber,
      paymentMethod: opts.paymentMethod,
    }),
    attachments: opts.invoicePdf
      ? [{ filename: `invoice-${opts.orderNumber}.pdf`, content: opts.invoicePdf }]
      : undefined,
  });
}

export async function sendInvoiceEmail(opts: {
  email: string;
  name: string;
  invoiceNumber: string;
  amount: string;
  currency?: string;
  orderNumber: string;
  dueDate?: string;
  invoicePdf?: Buffer;
}) {
  return sendEmail({
    to: opts.email,
    subject: `فاتورتك الإلكترونية - ${opts.invoiceNumber}`,
    html: invoiceTemplate({
      customerName: opts.name,
      invoiceNumber: opts.invoiceNumber,
      amount: opts.amount,
      currency: opts.currency,
      orderNumber: opts.orderNumber,
      dueDate: opts.dueDate,
    }),
    attachments: opts.invoicePdf
      ? [{ filename: `invoice-${opts.invoiceNumber}.pdf`, content: opts.invoicePdf }]
      : undefined,
  });
}

export async function sendOrderStatusEmail(opts: {
  email: string;
  name: string;
  orderNumber: string;
  status: string;
  serviceName?: string;
  note?: string;
}) {
  const STATUS_SUBJECTS: Record<string, string> = {
    PENDING: "قيد الانتظار",
    UNDER_REVIEW: "قيد المراجعة",
    WAITING_CLIENT: "بانتظار العميل",
    IN_PROGRESS: "قيد التنفيذ",
    COMPLETED: "مكتمل ✅",
    DELIVERED: "تم التسليم 📦",
    CANCELLED: "ملغي",
  };
  const statusLabel = STATUS_SUBJECTS[opts.status] || opts.status;
  return sendEmail({
    to: opts.email,
    subject: `تحديث حالة طلبك - ${statusLabel}`,
    html: orderStatusTemplate({
      customerName: opts.name,
      orderNumber: opts.orderNumber,
      status: opts.status,
      serviceName: opts.serviceName,
      note: opts.note,
    }),
  });
}

export async function sendOrderCompletedEmail(opts: {
  email: string;
  name: string;
  orderNumber: string;
  serviceName: string;
}) {
  return sendEmail({
    to: opts.email,
    subject: `تم إنجاز طلبك بنجاح 🎉 - ${opts.orderNumber}`,
    html: orderCompletedTemplate({
      customerName: opts.name,
      orderNumber: opts.orderNumber,
      serviceName: opts.serviceName,
    }),
  });
}
