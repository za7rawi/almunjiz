import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UPLOAD_LIMITS } from "@/config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "غير مصرح / Unauthorized",
          error: null,
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "لم يتم اختيار ملفات / No files selected",
          error: null,
        },
        { status: 400 }
      );
    }

    if (files.length > UPLOAD_LIMITS.maxFiles) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: `الحد الأقصى هو ${UPLOAD_LIMITS.maxFiles} ملفات / Maximum is ${UPLOAD_LIMITS.maxFiles} files`,
          error: null,
        },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: { name: string; url: string; size: number; type: string }[] = [];

    for (const file of files) {
      if (file.size > UPLOAD_LIMITS.maxFileSize) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: `الملف ${file.name} يتجاوز الحد الأقصى للحجم / File ${file.name} exceeds maximum size`,
            error: null,
          },
          { status: 400 }
        );
      }

      const allTypes = [
        ...UPLOAD_LIMITS.allowedImageTypes,
        ...UPLOAD_LIMITS.allowedDocumentTypes,
      ];

      if (!allTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: `نوع الملف ${file.name} غير مدعوم / File type ${file.name} is not supported`,
            error: null,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop();
      const filename = `${randomUUID()}.${ext}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      uploadedFiles.push({
        name: file.name,
        url: `/uploads/${filename}`,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: uploadedFiles,
        message: "تم رفع الملفات بنجاح / Files uploaded successfully",
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في رفع الملفات / Error uploading files",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
