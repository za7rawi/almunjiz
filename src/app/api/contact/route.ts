import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/validators";

export async function POST(request: NextRequest) {
  try {
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
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
        error: String(error),
      },
      { status: 500 }
    );
  }
}
