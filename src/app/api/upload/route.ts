import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { UPLOAD_LIMITS } from "@/config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { uploadLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limiterResult = uploadLimiter(ip);
    if (!limiterResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limiterResult.resetMs / 1000)) } }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, data: null, message: "غير مصرح", error: null },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const orderId = formData.get("orderId") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, data: null, message: "لم يتم اختيار ملفات", error: null },
        { status: 400 }
      );
    }

    if (files.length > UPLOAD_LIMITS.maxFiles) {
      return NextResponse.json(
        { success: false, data: null, message: `الحد الأقصى ${UPLOAD_LIMITS.maxFiles} ملفات`, error: null },
        { status: 400 }
      );
    }

    let uploadDir: string | null = null;
    try {
      uploadDir = join(process.cwd(), "data", "uploads");
      await mkdir(uploadDir, { recursive: true });
    } catch {
      uploadDir = null;
    }

    const uploadedFiles: {
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }[] = [];

    for (const file of files) {
      if (file.size > UPLOAD_LIMITS.maxFileSize) {
        return NextResponse.json(
          { success: false, data: null, message: `الملف ${file.name} يتجاوز الحد الأقصى`, error: null },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (UPLOAD_LIMITS.blockedExtensions.includes(ext)) {
        return NextResponse.json(
          { success: false, data: null, message: `امتداد الملف .${ext} غير مسموح`, error: null },
          { status: 400 }
        );
      }

      const allTypes = [
        ...UPLOAD_LIMITS.allowedImageTypes,
        ...UPLOAD_LIMITS.allowedDocumentTypes,
      ];

      if (!allTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, data: null, message: `نوع الملف ${file.name} غير مدعوم`, error: null },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const magicBytes: Record<string, number[]> = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46],
        'application/pdf': [0x25, 0x50, 0x44, 0x46],
      };

      if (magicBytes[file.type]) {
        const expected = magicBytes[file.type];
        const actual = Array.from(buffer.slice(0, expected.length));
        const matches = expected.every((byte, i) => actual[i] === byte);
        if (!matches) {
          return NextResponse.json(
            { success: false, data: null, message: `الملف ${file.name} لا يتطابق مع نوعه`, error: null },
            { status: 400 }
          );
        }
      }

      const safeExt = ext.replace(/[^a-z0-9]/g, "");
      const storedName = `${randomUUID()}.${safeExt}`;
      const fileUrl = `/data/uploads/${storedName}`;

      if (uploadDir) {
        try {
          const filepath = join(uploadDir, storedName);
          await writeFile(filepath, buffer);
        } catch {
          console.warn("[Upload] Could not write file to disk (read-only filesystem?)");
        }
      }

      const record = await prisma.fileAttachment.create({
        data: {
          userId,
          orderId: orderId || null,
          fileName: file.name,
          storedName,
          fileUrl,
          fileType: file.type,
          mimeType: file.type,
          fileSize: file.size,
          data: buffer,
        },
      });

      uploadedFiles.push({
        id: record.id,
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type,
      });

      await writeAuditLog({
        action: 'order.file_uploaded',
        resource: 'file',
        resourceId: record.id,
        userId,
        metadata: { fileName: file.name, fileSize: file.size, fileType: file.type, orderId: orderId || null },
      });
    }

    return NextResponse.json(
      { success: true, data: uploadedFiles, message: "تم رفع الملفات بنجاح", error: null },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { success: false, data: null, message: "حدث خطأ في رفع الملفات", error: 'Internal server error' },
      { status: 500 }
    );
  }
}
