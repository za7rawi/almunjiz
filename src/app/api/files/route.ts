import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ALLOWED_URL_HOSTS = [
  'vercel-blob.com',
  'blob.vercel-storage.com',
  '.vercel.app',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    return ALLOWED_URL_HOSTS.some((host) => parsed.hostname.endsWith(host) || parsed.hostname === host);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const files = await prisma.fileAttachment.findMany({
      where: {
        userId,
        ...(search
          ? { fileName: { contains: search, mode: "insensitive" } }
          : {}),
      },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    const filtered =
      !type || type === "all"
        ? files
        : files.filter((f) => {
            const mime = f.fileType.toLowerCase();
            if (type === "image") return mime.startsWith("image/");
            if (type === "document")
              return (
                mime.includes("pdf") ||
                mime.includes("word") ||
                mime.includes("document") ||
                mime.includes("sheet") ||
                mime.includes("excel") ||
                mime.includes("text/plain")
              );
            return true;
          });

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في جلب الملفات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await request.json();
    const { files, orderId } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "لم يتم اختيار ملفات" },
        { status: 400 }
      );
    }

    for (const f of files) {
      if (!f.fileUrl || !isAllowedUrl(f.fileUrl)) {
        return NextResponse.json(
          { success: false, message: "رابط الملف غير صالح" },
          { status: 400 }
        );
      }
      if (!f.fileName || typeof f.fileName !== 'string' || f.fileName.length > 255) {
        return NextResponse.json(
          { success: false, message: "اسم الملف غير صالح" },
          { status: 400 }
        );
      }
    }

    const created = await prisma.fileAttachment.createMany({
      data: files.map(
        (f: {
          fileName: string;
          fileUrl: string;
          fileType: string;
          fileSize: number;
        }) => ({
          userId,
          orderId: orderId || null,
          fileName: f.fileName.substring(0, 255),
          fileUrl: f.fileUrl,
          fileType: f.fileType,
          fileSize: Math.min(f.fileSize, 10 * 1024 * 1024),
        })
      ),
    });

    return NextResponse.json({
      success: true,
      data: { count: created.count },
    });
  } catch (error) {
    console.error("Error creating file records:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في حفظ الملفات" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "معرف الملف مطلوب" },
        { status: 400 }
      );
    }

    const file = await prisma.fileAttachment.findFirst({
      where: { id, userId },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, message: "الملف غير موجود" },
        { status: 404 }
      );
    }

    if (file.storedName) {
      const { unlink } = await import("fs/promises");
      const { join } = await import("path");
      unlink(join(process.cwd(), "public", "uploads", file.storedName)).catch(() => {});
    } else if (file.fileUrl) {
      const { unlink } = await import("fs/promises");
      const { join } = await import("path");
      const urlPath = file.fileUrl.startsWith("/") ? file.fileUrl.slice(1) : file.fileUrl;
      if (urlPath.startsWith("uploads/")) {
        unlink(join(process.cwd(), "public", urlPath)).catch(() => {});
      }
    }

    await prisma.fileAttachment.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "تم حذف الملف بنجاح",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في حذف الملف" },
      { status: 500 }
    );
  }
}
