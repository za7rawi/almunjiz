import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST() {
  try {
    const services = await prisma.service.findMany();

    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    const results: { id: string; status: string; url?: string; error?: string }[] = [];

    for (const svc of services) {
      if (!svc.image) { skipped++; results.push({ id: svc.id, status: 'skipped' }); continue; }
      if (svc.image.startsWith('http') && !svc.image.startsWith('data:')) { skipped++; results.push({ id: svc.id, status: 'already_url' }); continue; }

      try {
        const base64Data = svc.image.includes('base64,') ? svc.image.split('base64,')[1] : svc.image;
        const mimeMatch = svc.image.match(/^data:(image\/\w+);base64,/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const ext = mime.split('/')[1] || 'png';
        const buffer = Buffer.from(base64Data, 'base64');
        const pathname = `services/${svc.id}.${ext}`;

        const blob = await put(pathname, buffer, { access: 'public', addRandomSuffix: false, contentType: mime });

        await prisma.service.update({ where: { id: svc.id }, data: { image: blob.url } });

        migrated++;
        results.push({ id: svc.id, status: 'migrated', url: blob.url });
      } catch (err) {
        failed++;
        results.push({ id: svc.id, status: 'failed', error: (err as Error).message });
      }
    }

    return NextResponse.json({
      success: true,
      data: { total: services.length, migrated, skipped, failed, results },
    });
  } catch (e) {
    console.error('Migration error:', e);
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 });
  }
}
