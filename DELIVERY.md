# AL-MUNJIZ — حزمة التسليم النهائية

## 1. ملخص المشروع
منصة المنجز (AL-MUNJIZ) لتقديم خدمات التأشيرات والسفر والأعمال والاستشارات، مع لوحة تحكم إدارية كاملة وواجهة عامة ثنائية اللغة (عربي/إنجليزي).

- **المستودع:** https://github.com/za7rawi/almunjiz
- **الموقع (Domain):** https://munjiz.store
- **النشر:** Vercel (Production)
- **قاعدة البيانات:** Supabase (PostgreSQL 17.6) — المنطقة: `ap-southeast-2`

## 2. بيانات دخول الأدمن
| الحقل | القيمة |
|---|---|
| البريد | `admin@gmail.com` |
| كلمة المرور | `Admin@Munjiz2026!` |
| الرابط | `https://munjiz.store/admin` |

> **مهم:** غيّر كلمة المرور فوراً بعد أول استخدام. كلمة المرور مشفرة في قاعدة البيانات (bcrypt) ولا توجد نسخة نصية صريحة سوى في `prisma/seed-admin.ts`.

## 3. المتغيرات البيئية (Environment Variables)
تُخزَّن في إعدادات Vercel → Project → Settings → Environment Variables (Production). لا تشارك القيم الفعلية أبداً.

| المتغير | الغرض | إلزامي |
|---|---|---|
| `DATABASE_URL` | اتصال PostgreSQL (Supabase) | نعم |
| `NEXTAUTH_SECRET` | توقيع جلسات NextAuth | نعم |
| `NEXTAUTH_URL` | رابط الموقع للجلسات | نعم |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع للعميل | نعم |
| `NEXT_PUBLIC_API_URL` | عنوان API للعميل | نعم |
| `GOOGLE_CLIENT_ID` | OAuth تسجيل دخول جوجل | نعم |
| `GOOGLE_CLIENT_SECRET` | سر OAuth جوجل | نعم |
| `RESEND_API_KEY` | إرسال البريد (كود OTP) | نعم |
| `FROM_EMAIL` | البريد المرسل منه | نعم |
| `PAYMENT_ENCRYPTION_KEY` | تشفير بيانات الدفع (64 حرف hex) | نعم |
| `BLOB_READ_WRITE_TOKEN` | تخزين الصور (Vercel Blob) | نعم |

> لإعادة سحب قيم Vercel محلياً: `npx vercel env pull --environment=production --yes`

## 4. التشغيل محلياً
```bash
npm install
npm run prisma:generate   # توليد Prisma Client
npx vercel env pull --environment=production --yes   # جلب المتغيرات إلى .env.pullback
# انسخها إلى .env.local (أو استخدم .env.pullback مباشرة)
npx prisma db push        # مزامنة المخطط (اختياري)
npm run dev               # http://localhost:3000
```

## 5. النشر على Vercel
```bash
npx vercel --prod --yes
```
أو من لوحة Vercel: Import Project → ربط بمستودع GitHub → اضبط المتغيرات البيئية → Deploy.

بعد كل نشر: تأكد من `npx prisma generate` في خطوات البناء (Build Command):
`prisma generate && next build` — وإلا سيحدث خطأ عند توليد الصفحات.

## 6. النسخة الاحتياطية لقاعدة البيانات
توجد في مجلد `backup/`:
- `schema.sql` — مخطط الجداول (DDL)
- `data.sql` — البيانات (INSERT) بترتيب يعتمد على العلاقات (FK-safe)

### طريقة الاستعادة
```bash
# شرط توفر عميل psql
psql "DATABASE_URL_CONNECTION_STRING" -f backup/schema.sql
psql "DATABASE_URL_CONNECTION_STRING" -f backup/data.sql
```
البيانات تغطّي: 11 مستخدم، 18 خدمة، 3 بانرات، 6 أسئلة شائعة، 4 بوابات دفع، 1 كوبون (`WELCOME10`)، 6 طلبات، 6 فواتير، 6 مرفقات، وإعدادات الموقع.

### إعادة توليد النسخة الاحتياطية
```bash
# المخطط
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o backup/schema.sql
# البيانات (يتطلب pg + DATABASE_URL)
$env:DATABASE_URL="<connection>" ; node backup/dump-data.js
```

## 7. ملاحظات إضافية
- نظام الأدمن يستخدم دور `SUPER_ADMIN` في جدول `users` مع التحقق عبر NextAuth + كوكي `almunjiz-role`.
- الصور المرفوعة تُخزَّن في Vercel Blob وليس في قاعدة البيانات.
- نسخة المخطط `schema.sql` مضمونة التطابق مع Supabase الحالية (تم التحقق منها باختبار استعادة كاملة على قاعدة جديدة).
