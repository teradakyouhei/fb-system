import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: params.id }
    });

    if (!staff) {
      return NextResponse.json({ error: '担当者が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('担当者詳細取得エラー:', error);
    return NextResponse.json({ error: '担当者詳細の取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { code, name, salesCommission, inspectionApproval, isActive } = data;

    // 他の担当者で同じコードが使用されていないかチェック
    const existingStaff = await prisma.staff.findFirst({
      where: {
        code,
        NOT: { id: params.id }
      }
    });

    if (existingStaff) {
      return NextResponse.json({ error: 'この担当者コードは既に使用されています' }, { status: 400 });
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        code,
        name,
        salesCommission: salesCommission || false,
        inspectionApproval: inspectionApproval || 'なし',
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('担当者更新エラー:', error);
    return NextResponse.json({ error: '担当者の更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 担当者が受注に関連付けられているかチェック
    const relatedOrders = await prisma.order.findFirst({
      where: { staffId: params.id }
    });

    if (relatedOrders) {
      return NextResponse.json({ error: 'この担当者は受注に関連付けられているため削除できません' }, { status: 400 });
    }

    await prisma.staff.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: '担当者を削除しました' });
  } catch (error) {
    console.error('担当者削除エラー:', error);
    return NextResponse.json({ error: '担当者の削除に失敗しました' }, { status: 500 });
  }
}