import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  infoRow,
  statusBadge,
  ctaButton,
  divider,
} from "../base";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://munjiz.store";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  UNDER_REVIEW: "#3b82f6",
  WAITING_CLIENT: "#8b5cf6",
  IN_PROGRESS: "#2580eb",
  COMPLETED: "#10b981",
  DELIVERED: "#06b6d4",
  CANCELLED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  UNDER_REVIEW: "قيد المراجعة",
  WAITING_CLIENT: "بانتظار العميل",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export function orderStatusTemplate(opts: {
  customerName: string;
  orderNumber: string;
  status: string;
  serviceName?: string;
  note?: string;
}): string {
  const color = STATUS_COLORS[opts.status] || "#3b82f6";
  const label = STATUS_LABELS[opts.status] || opts.status;
  return baseLayout({
    title: "تم تحديث حالة طلبك",
    subtitle: "تحديث الطلب",
    preheader: `تم تحديث حالة طلبك ${opts.orderNumber} إلى: ${label}`,
    accentColor: color,
    content: `
      ${greeting(opts.customerName)}
      ${heading("📋 تم تحديث حالة طلبك")}
      ${textBlock("نود إبلاغك بأنه قد تم تحديث حالة طلبك. يرجى الاطلاع على التفاصيل أدناه.")}

      <div style="text-align:center;margin:24px 0;">
        <p style="color:#888;font-size:12px;margin-bottom:8px;">رقم الطلب: <strong style="color:#1a1a2e;">${opts.orderNumber}</strong></p>
        ${opts.serviceName ? `<p style="color:#888;font-size:12px;margin-bottom:12px;">الخدمة: <strong style="color:#1a1a2e;">${opts.serviceName}</strong></p>` : ""}
        <div style="margin-top:8px;">
          <p style="color:#888;font-size:12px;margin-bottom:6px;">الحالة الجديدة:</p>
          ${statusBadge(label, color)}
        </div>
      </div>

      ${opts.note ? `
      <div style="background:#f7f8fa;border-radius:10px;padding:16px;margin:16px 0;">
        <p style="color:#888;font-size:12px;margin:0 0 4px 0;font-weight:600;">ملاحظة من الفريق:</p>
        <p style="color:#333;font-size:14px;margin:0;line-height:1.6;">${opts.note}</p>
      </div>` : ""}

      ${ctaButton("متابعة الطلب 📋", `${SITE_URL}/dashboard/orders`)}
      ${divider()}
      ${textBlock("شكراً لاستخدامك المنجز. نحن نعمل على تقديم أفضل خدمة لك.")}
    `,
  });
}
