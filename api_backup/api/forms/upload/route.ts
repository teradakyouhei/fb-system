import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
    }

    // ファイルの検証
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 });
    }

    // ファイルサイズの検証 (10MB制限)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // アップロードディレクトリを作成
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合のエラーは無視
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const fileName = `template_${timestamp}_${randomString}${extension}`;
    
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 公開URLを生成
    const publicUrl = `/uploads/templates/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 });
  }
}