import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm') || '';

    let where: any = {};

    // 検索条件
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { code: { contains: searchTerm } },
      ];
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: [
        { code: 'asc' }
      ]
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('担当者データ取得エラー:', error);
    return NextResponse.json({ error: '担当者データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code, name, salesCommission, inspectionApproval } = data;

    const staff = await prisma.staff.create({
      data: {
        code,
        name,
        salesCommission: salesCommission || false,
        inspectionApproval: inspectionApproval || 'なし',
      }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('担当者作成エラー:', error);
    return NextResponse.json({ error: '担当者の作成に失敗しました' }, { status: 500 });
  }
}