import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id as string;

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملفات' }, { status: 400 });
    }

    const results: { id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number }[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, error: `الملف ${file.name} حجمه يتجاوز 10 ميغابايت` }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, error: `الملف ${file.name} نوعه غير مدعوم` }, { status: 400 });
      }

      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'bin';
      const pathname = `checkout/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      const record = await prisma.fileAttachment.create({
        data: {
          userId,
          fileName: file.name,
          fileUrl: blob.url,
          fileType: file.type.split('/')[0],
          mimeType: file.type,
          fileSize: file.size,
        },
      });

      results.push({
        id: record.id,
        fileName: record.fileName,
        fileUrl: record.fileUrl,
        fileType: record.fileType,
        fileSize: record.fileSize,
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    console.error('Upload files error:', e);
    return NextResponse.json({ success: false, error: 'فشل رفع الملفات' }, { status: 500 });
  }
}
