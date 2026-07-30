import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { basename, join } from "path";

function resolveStoredFilePath(fileUrl: string, storedName?: string | null) {
  const normalizedUrl = fileUrl.replace(/\\/g, "/");
  const fileName = storedName || basename(normalizedUrl);
  if (!fileName || fileName === "." || fileName === "..") return null;

  if (normalizedUrl.includes("/data/uploads/") || normalizedUrl.startsWith("data/uploads/")) {
    return join(process.cwd(), "data", "uploads", fileName);
  }

  if (normalizedUrl.includes("/uploads/") || normalizedUrl.startsWith("uploads/")) {
    return join(process.cwd(), "public", "uploads", fileName);
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role as string;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);

    const { id: fileId } = await context.params;
    const { searchParams } = new URL(request.url);
    const inline = searchParams.get("inline") === "true";

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "معرف الملف مطلوب" },
        { status: 400 }
      );
    }

    const file = await prisma.fileAttachment.findUnique({
      where: { id: fileId },
      include: {
        order: { select: { userId: true } },
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "الملف غير موجود" },
        { status: 404 }
      );
    }

    const isOwner = file.userId === userId;
    const isOrderOwner = file.order?.userId === userId;

    if (!isAdmin && !isOwner && !isOrderOwner) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بتحميل هذا الملف" },
        { status: 403 }
      );
    }

    let fileBuffer: Buffer | null = null;

    if (file.data) {
      fileBuffer = Buffer.from(file.data);
    } else {
      const filepath = resolveStoredFilePath(file.fileUrl, file.storedName);
      if (!filepath) {
        return NextResponse.json(
          { success: false, error: "Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„ØªØ­Ù…ÙŠÙ„" },
          { status: 404 }
        );
      }

      try {
        const bytes = await readFile(filepath);
        fileBuffer = Buffer.from(bytes);
      } catch {
        return NextResponse.json(
          { success: false, error: "الملف غير موجود على الخادم" },
          { status: 404 }
        );
      }
    }

    const contentType = file.mimeType || file.fileType || "application/octet-stream";
    const contentDisposition = inline ? `inline; filename="${encodeURIComponent(file.fileName)}"` : `attachment; filename="${encodeURIComponent(file.fileName)}"`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في تحميل الملف" },
      { status: 500 }
    );
  }
}
