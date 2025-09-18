'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Calculator } from 'lucide-react';

interface FieldStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  backgroundColor: string;
  color: string;
  zIndex: number;
  borderColor?: string;
  fontWeight?: string;
}

interface TemplateField {
  id: string;
  fieldId: string;
  type: 'text' | 'checkbox' | 'select' | 'textarea' | 'date' | 'number' | 'calculation' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: string;
  formula?: string;
  options?: string[];
  style: FieldStyle;
}

interface TemplatePage {
  pageNumber: number;
  backgroundImage?: string;
  fields: TemplateField[];
}

interface Template {
  id: string;
  name: string;
  description?: string;
  pages: TemplatePage[];
}

export default function FormInputPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/forms/templates/${templateId}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      }
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィールド値の更新
  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // 計算フィールドの再計算
    calculateFormulas(newFormData);
  };

  // 計算式の処理
  const calculateFormulas = (data: Record<string, any>) => {
    if (!template) return;

    template.pages.forEach(page => {
      page.fields.forEach(field => {
        if (field.type === 'calculation' && field.formula) {
          try {
            // 簡単な四則演算の計算
            let formula = field.formula;
            
            // フィールド参照を値に置換
            Object.keys(data).forEach(key => {
              const value = data[key] || 0;
              formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
            });
            
            // 基本的な数学関数の処理
            formula = formula.replace(/\bsum\((.*?)\)/g, (match, expr) => {
              const values = expr.split(',').map((v: string) => parseFloat(v.trim()) || 0);
              return values.reduce((sum: number, val: number) => sum + val, 0).toString();
            });
            
            // 計算実行（eval は危険ですが、デモ用として使用）
            const result = eval(formula);
            if (!isNaN(result)) {
              setFormData(prev => ({ ...prev, [field.fieldId]: result }));
            }
          } catch (error) {
            console.error('計算エラー:', error);
          }
        }
      });
    });
  };

  // フォーム保存
  const handleSave = async (status: 'draft' | 'submitted' = 'draft') => {
    if (!template) return;

    setSaving(true);
    try {
      const response = await fetch('/api/forms/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          dataJson: JSON.stringify(formData),
          status,
        }),
      });

      if (response.ok) {
        alert(status === 'draft' ? '下書き保存しました' : '提出しました');
        if (status === 'submitted') {
          router.push('/forms/templates');
        }
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // フィールドのレンダリング
  const renderField = (field: TemplateField) => {
    const value = formData[field.fieldId] || '';
    
    const fieldStyle = {
      position: 'absolute' as const,
      left: field.style.left,
      top: field.style.top,
      width: field.style.width,
      height: field.style.height,
      fontSize: field.style.fontSize,
      backgroundColor: field.style.backgroundColor === 'transparent' ? 'rgba(255,255,255,0.8)' : field.style.backgroundColor,
      color: field.style.color,
      zIndex: field.style.zIndex,
      border: field.style.borderColor ? `1px solid ${field.style.borderColor}` : '1px solid #d1d5db',
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            key={field.id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={fieldStyle}
            className="px-2 py-1 rounded"
          />
        );

      case 'textarea':
        return (
          <textarea
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            style={fieldStyle}
            className="px-2 py-1 rounded resize-none"
          />
        );

      case 'number':
      case 'calculation':
        return (
          <input
            key={field.id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldId, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.type === 'calculation'}
            style={fieldStyle}
            className={`px-2 py-1 rounded ${field.type === 'calculation' ? 'bg-gray-100' : ''}`}
          />
        );

      case 'date':
        return (
          <input
            key={field.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            required={field.required}
            style={fieldStyle}
            className="px-2 py-1 rounded"
          />
        );

      case 'checkbox':
        return (
          <label key={field.id} style={fieldStyle} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.fieldId, e.target.checked)}
              required={field.required}
              className="mr-2"
            />
            <span>{field.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            required={field.required}
            style={fieldStyle}
            className="px-2 py-1 rounded"
          >
            <option value="">選択してください</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div key={field.id} style={fieldStyle} className="flex flex-col">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center mb-1 cursor-pointer">
                <input
                  type="radio"
                  name={field.fieldId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                  required={field.required}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">テンプレートが見つかりません</h1>
          <button
            onClick={() => router.push('/forms/templates')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            テンプレート一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const currentPage = template.pages[currentPageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/forms/templates')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{template.name} - 入力</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            下書き保存
          </button>
          <button
            onClick={() => handleSave('submitted')}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            提出
          </button>
        </div>
      </div>

      {/* ページナビゲーション */}
      {template.pages.length > 1 && (
        <div className="bg-white border-b px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            {template.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                className={`px-3 py-1 rounded ${
                  index === currentPageIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ページ {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* フォーム */}
      <div className="flex-1 p-8">
        <div
          className="relative bg-white rounded-lg shadow-lg mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm',
            backgroundImage: currentPage.backgroundImage ? `url(${currentPage.backgroundImage})` : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {currentPage.fields.map(field => renderField(field))}
        </div>
      </div>
    </div>
  );
}