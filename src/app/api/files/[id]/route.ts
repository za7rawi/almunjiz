import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("id");
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

    const filename = file.storedName || file.fileUrl.split("/").pop() || "file";
    const filepath = join(process.cwd(), "public", file.fileUrl);

    let fileBuffer: Buffer;
    try {
      const bytes = await readFile(filepath);
      fileBuffer = Buffer.from(bytes);
    } catch {
      return NextResponse.json(
        { success: false, error: "الملف غير موجود على الخادم" },
        { status: 404 }
      );
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
