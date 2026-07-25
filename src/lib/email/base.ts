const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://munjiz.store";
const LOGO_URL = `${SITE_URL}/logo.jpg`;
const YEAR = new Date().getFullYear();

export function baseLayout(opts: {
  title: string;
  subtitle?: string;
  preheader?: string;
  content: string;
  accentColor?: string;
}): string {
  const accent = opts.accentColor || "#2580eb";
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${opts.title}</title>
  ${opts.preheader ? `<meta name="x-apple-disable-message-reformatting"><style>.preheader{display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;mso-hide:all;}</style><span class="preheader">${opts.preheader}</span>` : ""}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f0f2f5; font-family: 'Noto Kufi Arabic', 'Segoe UI', Tahoma, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 !important; }
      .inner { padding: 24px 16px !important; }
      .header { padding: 28px 16px !important; }
      .otp-code { font-size: 36px !important; letter-spacing: 8px !important; padding: 16px 12px !important; }
      .info-row { flex-direction: column !important; }
      .info-label, .info-value { text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="480" class="container" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td class="header" style="background:linear-gradient(135deg,${accent},#14b8a6);padding:36px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="المنجز AL-MUNJIZ" width="64" height="64" style="border-radius:14px;margin-bottom:14px;display:inline-block;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px 0;letter-spacing:0.5px;">المنجز AL-MUNJIZ</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;font-weight:400;">${opts.subtitle || "خدمات إلكترونية احترافية"}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="inner" style="padding:36px 32px;">
              ${opts.content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #eef0f2;padding:24px 32px;text-align:center;">
              <p style="color:#999;font-size:11px;margin:0 0 8px 0;">فريق المنجز للخدمات الإلكترونية</p>
              <a href="${SITE_URL}" style="color:${accent};font-size:12px;font-weight:600;text-decoration:none;">${SITE_URL}</a>
              <p style="color:#bbb;font-size:10px;margin:12px 0 0 0;">© ${YEAR} المنجز AL-MUNJIZ. جميع الحقوق محفوظة.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function textBlock(text: string): string {
  return `<p style="color:#333;font-size:15px;line-height:1.8;margin:0 0 16px 0;font-weight:400;">${text}</p>`;
}

export function greeting(name: string): string {
  return `<p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 20px 0;">مرحبًا <strong style="color:#1a1a2e;">${name}</strong>،</p>`;
}

export function heading(text: string, color?: string): string {
  return `<h2 style="color:${color || "#1a1a2e"};font-size:18px;font-weight:700;margin:0 0 16px 0;text-align:center;">${text}</h2>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #eef0f2;margin:20px 0;" />`;
}

export function infoRow(label: string, value: string, accent?: string): string {
  const c = accent || "#2580eb";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td class="info-label" style="padding:12px 16px;background:#f7f8fa;border-radius:8px 0 0 8px;width:120px;text-align:right;vertical-align:middle;">
        <span style="color:#888;font-size:13px;font-weight:600;">${label}</span>
      </td>
      <td class="info-value" style="padding:12px 16px;background:#f7f8fa;border-radius:0 8px 8px 0;text-align:left;vertical-align:middle;">
        <span style="color:#1a1a2e;font-size:15px;font-weight:700;direction:ltr;display:inline-block;">${value}</span>
      </td>
    </tr>
  </table>`;
}

export function otpBox(code: string): string {
  return `
  <div style="text-align:center;margin:24px 0;">
    <p style="color:#888;font-size:13px;margin-bottom:12px;font-weight:600;">رمز التحقق الخاص بك هو:</p>
    <div style="display:inline-block;background:linear-gradient(135deg,#f0f7ff,#eef5ff);border:2px solid #2580eb;border-radius:14px;padding:18px 32px;">
      <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#2580eb;font-family:'Courier New',monospace;direction:ltr;">${code}</span>
    </div>
    <p style="color:#f59e0b;font-size:12px;margin-top:14px;font-weight:600;">⏰ هذا الرمز صالح لمدة 5 دقائق فقط</p>
    <p style="color:#999;font-size:11px;margin-top:6px;">لا تشاركه مع أي شخص آخر</p>
  </div>`;
}

export function ctaButton(text: string, url: string, accent?: string): string {
  const c = accent || "#2580eb";
  return `
  <div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${c};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;box-shadow:0 4px 12px ${c}33;">${text}</a>
  </div>`;
}

export function statusBadge(text: string, color: string): string {
  return `<div style="display:inline-block;background:${color}15;color:${color};border:1px solid ${color}30;border-radius:8px;padding:8px 20px;font-size:14px;font-weight:700;text-align:center;">${text}</div>`;
}

export function footerNote(): string {
  return `
  <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #eef0f2;">
    <p style="color:#999;font-size:11px;margin:0;">إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
  </div>`;
}
