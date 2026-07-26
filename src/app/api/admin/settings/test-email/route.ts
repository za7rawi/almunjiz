import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email/service';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { to } = await request.json();

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: 'اختبار البريد الإلكتروني - المنجز | AL-MUNJIZ',
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #2580eb, #14b8a6); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">المنجز | AL-MUNJIZ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">اختبار إعدادات البريد الإلكتروني</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 18px;">تم إرسال هذا البريد بنجاح ✅</h2>
            <p style="color: #64748b; line-height: 1.7; margin: 0 0 12px;">
              إذا كنت ترى هذا الرسالة، فهذا يعني أن إعدادات البريد الإلكتروني تعمل بشكل صحيح.
            </p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                📧 البريد المستقبل: ${to}<br/>
                ⏰ الوقت: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Amman' })}<br/>
                🔧 الخدمة: Resend
              </p>
            </div>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 12px; margin-top: 24px;">
            هذا بريد إلكتروني تلقائي من منصة المنجز
          </p>
        </div>
      `,
    });

    await writeAuditLog({
      action: 'settings.test_email',
      resource: 'Settings',
      metadata: { to, success: result.success },
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'تم إرسال البريد بنجاح' });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'فشل إرسال البريد' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[TestEmail] Error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إرسال البريد' },
      { status: 500 }
    );
  }
}
