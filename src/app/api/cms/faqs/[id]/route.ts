import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
      return NextResponse.json(
        { success: false, data: null, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(body.question !== undefined && { question: body.question }),
        ...(body.questionEn !== undefined && { questionEn: body.questionEn }),
        ...(body.answer !== undefined && { answer: body.answer }),
        ...(body.answerEn !== undefined && { answerEn: body.answerEn }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    await prisma.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
