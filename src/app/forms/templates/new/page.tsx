'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';

export default function NewTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/forms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          description: description.trim(),
          pages: [{ pageNumber: 1, fields: [] }]
        }),
      });

      if (response.ok) {
        const template = await response.json();
        router.push(`/forms/templates/${template.id}/designer`);
      } else {
        alert('テンプレートの作成に失敗しました');
      }
    } catch (error) {
      console.error('作成エラー:', error);
      alert('テンプレートの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.push('/forms/templates')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">新規テンプレート作成</h1>
      </div>

      {/* フォーム */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テンプレート名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="例：点検報告書、設備台帳など"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明（オプション）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このテンプレートの用途や特徴を記入してください"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">テンプレート作成のヒント</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• まずはテンプレート名と説明を入力してください</li>
                <li>• 作成後にデザイナー画面で詳細を編集できます</li>
                <li>• 背景画像をアップロードして既存の帳票をベースにできます</li>
                <li>• ドラッグ&ドロップでフィールドを配置できます</li>
                <li>• Ctrl+C/Ctrl+Vでフィールドのコピー&ペーストが可能です</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => router.push('/forms/templates')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !templateName.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    作成中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    作成してデザイナーを開く
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}