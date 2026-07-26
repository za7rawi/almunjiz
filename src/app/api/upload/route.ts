import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { UPLOAD_LIMITS } from "@/config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
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

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

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
      const ext = file.name.split(".").pop();
      const storedName = `${randomUUID()}.${ext}`;
      const filepath = join(uploadDir, storedName);

      await writeFile(filepath, buffer);

      const fileUrl = `/uploads/${storedName}`;

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
      { success: false, data: null, message: "حدث خطأ في رفع الملفات", error: String(error) },
      { status: 500 }
    );
  }
}
