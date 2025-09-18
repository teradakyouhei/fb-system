import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const templates = await prisma.formTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        pages: {
          include: {
            fields: true
          }
        }
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    return NextResponse.json({ error: 'テンプレートの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, pages } = data;

    // TODO: セッションからユーザーIDを取得
    const createdBy = 'user_temp'; // 仮のユーザーID

    const template = await prisma.formTemplate.create({
      data: {
        name,
        description,
        createdBy,
        pages: {
          create: pages.map((page: any) => ({
            pageNumber: page.pageNumber,
            backgroundImage: page.backgroundImage,
            fields: {
              create: page.fields.map((field: any) => ({
                fieldId: field.fieldId,
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required || false,
                validation: field.validation,
                formula: field.formula,
                options: field.options ? JSON.stringify(field.options) : null,
                styleJson: JSON.stringify(field.style),
              }))
            }
          }))
        }
      },
      include: {
        pages: {
          include: {
            fields: true
          }
        }
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('テンプレート作成エラー:', error);
    return NextResponse.json({ error: 'テンプレートの作成に失敗しました' }, { status: 500 });
  }
}