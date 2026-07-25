import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['question', 'questionEn', 'answer', 'answerEn'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        questionEn: body.questionEn,
        answer: body.answer,
        answerEn: body.answerEn,
        category: body.category || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
