'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Copy, Eye, Home } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export default function FormTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/forms/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('テンプレートの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このテンプレートを削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`/api/forms/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id));
        alert('テンプレートを削除しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/forms/templates/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchTemplates();
        alert('テンプレートを複製しました');
      }
    } catch (error) {
      console.error('複製エラー:', error);
      alert('複製に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホーム
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">帳票テンプレート管理</h1>
            <p className="text-gray-600 mt-2">帳票テンプレートの作成・編集・管理</p>
          </div>
        </div>
        <Link
          href="/forms/templates/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新規作成
        </Link>
      </div>

      {/* テンプレート一覧 */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">テンプレートがありません</h3>
          <p className="text-gray-500 mb-6">新しいテンプレートを作成してください</p>
          <Link
            href="/forms/templates/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            最初のテンプレートを作成
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description || '説明なし'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>使用回数: {template.usageCount}</span>
                  <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/forms/templates/${template.id}/designer`}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    編集
                  </Link>
                  <Link
                    href={`/forms/templates/${template.id}/preview`}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    プレビュー
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    title="複製"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}