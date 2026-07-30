import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'نوع الملف غير مدعوم. يرجى رفع صور فقط (JPEG, PNG, WebP, GIF)' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'حجم الملف يتجاوز 5 ميغابايت' }, { status: 400 });
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const pathname = `services/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      data: { url: blob.url },
    });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ success: false, error: 'فشل رفع الملف' }, { status: 500 });
  }
}
