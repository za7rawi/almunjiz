export interface PrintInvoiceData {
  invoiceNumber: string;
  orderNumber?: string;
  customer: string;
  email: string;
  phone?: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  notes?: string;
  dueDate: string;
  date: string;
  status: string;
  companyNameAr?: string;
  companyNameEn?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
}

const statusLabels: Record<string, string> = {
  paid: 'مدفوعة',
  pending: 'معلقة',
  overdue: 'متأخرة',
  cancelled: 'ملغاة',
};

const statusColors: Record<string, string> = {
  paid: '#10b981',
  pending: '#f59e0b',
  overdue: '#ef4444',
  cancelled: '#6b7280',
};

export async function printInvoice(data: PrintInvoiceData) {
  const companyNameAr = data.companyNameAr || 'المنجز';
  const companyNameEn = data.companyNameEn || 'AL-MUNJIZ';
  const companyPhone = data.companyPhone || '+962 79 103 8472';
  const companyEmail = data.companyEmail || 'info@munjiz.store';
  const companyAddress = data.companyAddress || 'المملكة الأردنية الهاشمية - عمان';
  const statusLabel = statusLabels[data.status] || data.status;
  const statusColor = statusColors[data.status] || '#6b7280';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://munjiz.store';
  const trackUrl = `${siteUrl}/track-order?order=${data.orderNumber || data.invoiceNumber}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackUrl)}&format=png&margin=8`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة ${data.invoiceNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Cairo', 'Inter', sans-serif;
      background: #f0f2f5;
      color: #1a1a2e;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-wrapper {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: #fff;
      position: relative;
      overflow: hidden;
    }

    @media print {
      body { background: #fff; }
      .invoice-wrapper {
        margin: 0;
        box-shadow: none;
        width: 100%;
        min-height: 100vh;
      }
      .no-print { display: none !important; }
    }

    .print-btn {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      padding: 14px 40px;
      background: linear-gradient(135deg, #2580eb 0%, #14b8a6 100%);
      color: #fff;
      border: none;
      border-radius: 14px;
      font-family: 'Cairo', sans-serif;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(37,128,235,0.35);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .print-btn:hover {
      transform: translateX(-50%) translateY(-2px);
      box-shadow: 0 12px 40px rgba(37,128,235,0.45);
    }
    .print-btn svg { width: 20px; height: 20px; }

    .close-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      width: 44px;
      height: 44px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.2s;
    }
    .close-btn:hover { background: #fef2f2; border-color: #fca5a5; }

    /* === HEADER === */
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 36px 44px 32px;
      color: #fff;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2580eb, #14b8a6, #7c3aed, #2580eb);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 72px;
      height: 72px;
      background: rgba(255,255,255,0.12);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }
    .brand-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 6px;
    }
    .brand-text h1 {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1px;
      line-height: 1.2;
    }
    .brand-text .en-name {
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      font-family: 'Inter', sans-serif;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .brand-text .tagline {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      margin-top: 2px;
    }

    .invoice-badge {
      text-align: left;
    }
    .invoice-badge .label {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
    }
    .invoice-badge .number {
      font-size: 22px;
      font-weight: 800;
      font-family: 'Inter', monospace;
      color: #14b8a6;
      letter-spacing: 1px;
    }

    .header-meta {
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }

    .meta-block {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 14px 18px;
      flex: 1;
      backdrop-filter: blur(8px);
    }
    .meta-block .meta-label {
      font-size: 10px;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .meta-block .meta-value {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }

    /* === BODY === */
    .body {
      padding: 36px 44px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #2580eb;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: 'Inter', sans-serif;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 18px;
      background: linear-gradient(180deg, #2580eb, #14b8a6);
      border-radius: 2px;
    }

    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .party-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px 22px;
    }
    .party-card h3 {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: 'Inter', sans-serif;
      margin-bottom: 12px;
    }
    .party-card .name {
      font-size: 18px;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .party-card .detail {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .party-card .detail svg {
      width: 14px;
      height: 14px;
      vertical-align: middle;
      margin-inline-end: 6px;
      color: #94a3b8;
    }

    /* === TABLE === */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 28px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .items-table thead th {
      background: #1a1a2e;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Inter', sans-serif;
      padding: 14px 18px;
      text-align: right;
    }
    .items-table thead th:last-child {
      text-align: left;
    }
    .items-table tbody td {
      padding: 16px 18px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .items-table tbody td:last-child {
      text-align: left;
      font-weight: 700;
      font-family: 'Inter', monospace;
      font-size: 15px;
      color: #1a1a2e;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .items-table tbody tr:hover {
      background: #f8fafc;
    }

    .service-cell {
      font-weight: 600;
      color: #2580eb;
    }

    /* === TOTALS === */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-box {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      font-size: 14px;
      color: #64748b;
    }
    .totals-row .label { font-weight: 500; }
    .totals-row .value { font-family: 'Inter', monospace; font-weight: 600; color: #334155; }

    .totals-divider {
      height: 1px;
      background: #e2e8f0;
    }
    .totals-row.total {
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: #fff;
      padding: 16px 20px;
      font-size: 18px;
    }
    .totals-row.total .label { font-weight: 700; color: rgba(255,255,255,0.8); }
    .totals-row.total .value { font-weight: 900; color: #14b8a6; font-size: 20px; }

    /* === STATUS === */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: ${statusColor};
      background: ${statusColor}15;
      border: 1.5px solid ${statusColor}30;
    }
    .status-badge .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${statusColor};
    }

    /* === NOTES === */
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 32px;
    }
    .notes-box .notes-label {
      font-size: 11px;
      font-weight: 700;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Inter', sans-serif;
      margin-bottom: 6px;
    }
    .notes-box .notes-text {
      font-size: 13px;
      color: #78350f;
      line-height: 1.6;
    }

    /* === FOOTER === */
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 44px;
      margin-top: auto;
    }
    .footer-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .footer-brand {
      font-size: 18px;
      font-weight: 800;
      color: #1a1a2e;
    }
    .footer-brand span {
      color: #2580eb;
    }

    .footer-contact {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #64748b;
    }
    .footer-contact .item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-contact .item svg {
      width: 14px;
      height: 14px;
      color: #94a3b8;
    }

    .footer-bottom {
      text-align: center;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-bottom p {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(0,0,0,0.018);
      pointer-events: none;
      white-space: nowrap;
      font-family: 'Cairo', sans-serif;
      letter-spacing: 20px;
    }

    @media print {
      .invoice-wrapper { margin: 0; border: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    طباعة الفاتورة
  </button>
  <button class="close-btn no-print" onclick="window.close()">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>

  <div class="invoice-wrapper">
    <div class="watermark">${companyNameAr}</div>

    <!-- HEADER -->
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-logo">
            <img src="/logo.jpg" alt="${companyNameAr}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=&quot;font-size:28px;font-weight:900;color:#14b8a6&quot;>${companyNameAr.charAt(0)}</div>'">
          </div>
          <div class="brand-text">
            <h1>${companyNameAr}</h1>
            <div class="en-name">${companyNameEn}</div>
            <div class="tagline">منصة الخدمات المتكاملة</div>
          </div>
        </div>
        <div class="invoice-badge">
          <div class="label">Tax Invoice / فاتورة ضريبية</div>
          <div class="number">${data.invoiceNumber}</div>
        </div>
      </div>
      <div class="header-meta">
        <div class="meta-block">
          <div class="meta-label">تاريخ الإصدار</div>
          <div class="meta-value">${data.date}</div>
        </div>
        <div class="meta-block">
          <div class="meta-label">تاريخ الاستحقاق</div>
          <div class="meta-value">${data.dueDate}</div>
        </div>
        <div class="meta-block">
          <div class="meta-label">الحالة</div>
          <div class="meta-value">
            <span class="status-badge">
              <span class="dot"></span>
              ${statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="body">
      <div class="parties">
        <div class="party-card">
          <h3>المورد / Seller</h3>
          <div class="name">${companyNameAr}</div>
          <div class="detail">${companyNameEn}</div>
          <div class="detail">${companyAddress}</div>
          <div class="detail">هاتف: ${companyPhone}</div>
          <div class="detail">بريد: ${companyEmail}</div>
        </div>
        <div class="party-card">
          <h3>العميل / Customer</h3>
          <div class="name">${data.customer}</div>
          <div class="detail">${data.email}</div>
          ${data.phone ? `<div class="detail">هاتف: ${data.phone}</div>` : ''}
          <div class="detail">رقم الطلب: ${data.orderNumber || data.invoiceNumber}</div>
          <div class="detail">رقم الفاتورة: ${data.invoiceNumber}</div>
          <div class="detail">تاريخ الطلب: ${data.date}</div>
        </div>
      </div>

      <div class="section-title">تفاصيل الخدمة</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الخدمة / Service</th>
            <th>الوصف</th>
            <th style="text-align:left">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td class="service-cell">${data.service}</td>
            <td>${data.service} - ${companyNameAr}</td>
            <td>${data.amount.toFixed(2)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-box">
          ${data.amount !== data.total ? `
          <div class="totals-row">
            <span class="label">المبلغ</span>
            <span class="value">${data.amount.toFixed(2)} ر.س</span>
          </div>
          <div class="totals-divider"></div>
          ${data.tax > 0 ? `
          <div class="totals-row">
            <span class="label">الضريبة (15%)</span>
            <span class="value">${data.tax.toFixed(2)} ر.س</span>
          </div>
          <div class="totals-divider"></div>
          ` : ''}
          ` : ''}
          <div class="totals-row total">
            <span class="label">الإجمالي</span>
            <span class="value">${data.total.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      <!-- QR Code Section -->
      <div style="display:flex;justify-content:center;margin-bottom:32px;">
        <div style="text-align:center;padding:16px 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <img src="${qrApiUrl}" width="120" height="120" alt="QR Code" style="border-radius:8px;" />
          <p style="font-size:10px;color:#94a3b8;margin-top:8px;font-family:'Inter',sans-serif;letter-spacing:1px;">امسح للطلب / Scan to Track</p>
          <p style="font-size:9px;color:#94a3b8;margin-top:2px;font-family:'Inter',sans-serif;word-break:break-all;">${trackUrl}</p>
        </div>
      </div>

      ${data.notes ? `
      <div class="notes-box">
        <div class="notes-label">ملاحظات / Notes</div>
        <div class="notes-text">${data.notes}</div>
      </div>
      ` : ''}
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-top">
        <div class="footer-brand"><span>${companyNameAr}</span> | ${companyNameEn}</div>
        <div class="footer-contact">
          <div class="item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${companyPhone}
          </div>
          <div class="item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            ${companyEmail}
          </div>
        </div>
      </div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <p style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">الشروط والأحكام / Terms & Conditions</p>
        <p style="font-size:11px;color:#78350f;line-height:1.6;">
          1. هذه الفاتورة صادرة من ${companyNameAr} المعتمدة من الجهات المختصة.<br>
          2. جميع المبالغ شاملة للخدمات المقدمة وليست قابلة للاسترداد إلا وفقاً لسياسات الشركة.<br>
          3. يحق لـ ${companyNameAr} تعليق أو إلغاء الخدمة في حالة عدم الالتزام بالشروط.<br>
          4. هذه الفاتورة إلكترونية ولا تحتاج إلى توقيع أو ختم.
        </p>
      </div>
      <div class="footer-bottom">
        <p>شكراً لاختياركم ${companyNameAr}. هذه الفاتورة صادرة من نظام ${companyNameAr} الإلكتروني.</p>
        <p>Thank you for choosing ${companyNameEn}. This invoice was issued by the ${companyNameEn} electronic system.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
