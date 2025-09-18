import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const status = searchParams.get('status');

    let where: any = {};
    if (templateId) where.templateId = templateId;
    if (status) where.status = status;

    const formData = await prisma.formData.findMany({
      where,
      include: {
        template: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(formData);
  } catch (error) {
    console.error('フォームデータ取得エラー:', error);
    return NextResponse.json({ error: 'フォームデータの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { templateId, orderId, customerId, dataJson, status } = data;

    // TODO: セッションからユーザーIDを取得
    const submittedBy = status === 'submitted' ? 'user_temp' : null;

    const formData = await prisma.formData.create({
      data: {
        templateId,
        orderId,
        customerId,
        dataJson,
        status,
        submittedBy,
        submittedAt: status === 'submitted' ? new Date() : null,
      },
      include: {
        template: true
      }
    });

    // 使用回数をインクリメント
    if (status === 'submitted') {
      await prisma.formTemplate.update({
        where: { id: templateId },
        data: {
          usageCount: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json(formData);
  } catch (error) {
    console.error('フォームデータ保存エラー:', error);
    return NextResponse.json({ error: 'フォームデータの保存に失敗しました' }, { status: 500 });
  }
}