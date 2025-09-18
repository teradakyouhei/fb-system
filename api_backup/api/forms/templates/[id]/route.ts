import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const template = await prisma.formTemplate.findUnique({
      where: { id: resolvedParams.id },
      include: {
        pages: {
          include: {
            fields: true
          },
          orderBy: { pageNumber: 'asc' }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 });
    }

    // フィールドのスタイルとオプションをパース
    const formattedTemplate = {
      ...template,
      pages: template.pages.map(page => ({
        ...page,
        fields: page.fields.map(field => ({
          ...field,
          style: JSON.parse(field.styleJson),
          options: field.options ? JSON.parse(field.options) : undefined,
        }))
      }))
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    return NextResponse.json({ error: 'テンプレートの取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { name, description, pages } = data;

    // 既存のページとフィールドを削除
    await prisma.formTemplatePage.deleteMany({
      where: { templateId: params.id }
    });

    // テンプレートを更新
    const template = await prisma.formTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
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
    console.error('テンプレート更新エラー:', error);
    return NextResponse.json({ error: 'テンプレートの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.formTemplate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('テンプレート削除エラー:', error);
    return NextResponse.json({ error: 'テンプレートの削除に失敗しました' }, { status: 500 });
  }
}