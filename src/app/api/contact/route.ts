import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/validators";
import { contactLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const result = contactLimiter(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const validated = ContactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "بيانات غير صحيحة / Invalid data",
          error: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: validated.data,
    });

    return NextResponse.json(
      {
        success: true,
        data: contact,
        message: "تم إرسال رسالتك بنجاح / Your message has been sent successfully",
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في إرسال الرسالة / Error sending message",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, data: [] }, { status: 401 });
    }
    const role = (session.user as Record<string, unknown>).role as string;
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.json({ success: false, data: [] }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "تم جلب الرسائل بنجاح / Contacts fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الرسائل / Error fetching contacts",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
