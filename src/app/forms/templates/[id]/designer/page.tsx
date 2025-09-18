'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Type, CheckSquare, List, Calendar, Hash, Calculator, 
  Circle, AlignLeft, Save, ArrowLeft, Plus, Trash2, 
  Copy, Upload, ChevronLeft, ChevronRight, Clipboard, Move
} from 'lucide-react';

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
  id?: string;
  name: string;
  description?: string;
  pages: TemplatePage[];
}

const fieldTypes = [
  { type: 'text', label: 'テキスト', icon: Type },
  { type: 'checkbox', label: 'チェックボックス', icon: CheckSquare },
  { type: 'select', label: '選択', icon: List },
  { type: 'textarea', label: 'テキストエリア', icon: AlignLeft },
  { type: 'date', label: '日付', icon: Calendar },
  { type: 'number', label: '数値', icon: Hash },
  { type: 'calculation', label: '計算', icon: Calculator },
  { type: 'radio', label: 'ラジオボタン', icon: Circle },
];

export default function TemplateDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const isNew = templateId === 'new';

  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    pages: [{ pageNumber: 1, fields: [] }]
  });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [copiedField, setCopiedField] = useState<TemplateField | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<TemplateField | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeField, setResizeField] = useState<TemplateField | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [hoverResizeHandle, setHoverResizeHandle] = useState<string | null>(null);
  const [hoverField, setHoverField] = useState<TemplateField | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef(template);

  // グリッドスナップ
  const snapToGridPosition = (value: number, gridSize: number = 10) => {
    return snapToGrid ? Math.round(value / gridSize) * gridSize : value;
  };

  // マウス位置から境界線上かを判定し、リサイズハンドルを決定
  const getResizeHandle = (mouseX: number, mouseY: number, field: TemplateField, rect: DOMRect) => {
    const x = mouseX - rect.left - field.style.left;
    const y = mouseY - rect.top - field.style.top;
    const threshold = 8; // 境界線からの許容範囲（px）
    
    const nearLeft = x <= threshold;
    const nearRight = x >= field.style.width - threshold;
    const nearTop = y <= threshold;
    const nearBottom = y >= field.style.height - threshold;
    
    // 角
    if (nearTop && nearLeft) return 'nw';
    if (nearTop && nearRight) return 'ne';
    if (nearBottom && nearLeft) return 'sw';
    if (nearBottom && nearRight) return 'se';
    
    // 辺
    if (nearTop) return 'n';
    if (nearBottom) return 's';
    if (nearLeft) return 'w';
    if (nearRight) return 'e';
    
    return null;
  };

  // リサイズハンドルに応じたカーソルスタイルを取得
  const getResizeCursor = (handle: string | null) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'cursor-nw-resize';
      case 'ne':
      case 'sw':
        return 'cursor-ne-resize';
      case 'n':
      case 's':
        return 'cursor-ns-resize';
      case 'e':
      case 'w':
        return 'cursor-ew-resize';
      default:
        return 'cursor-grab';
    }
  };

  // フィールドIDを生成
  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // テンプレート読み込み
  useEffect(() => {
    if (!isNew) {
      fetchTemplate();
    }
  }, [templateId]);

  // templateRefを常に最新に保つ
  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/forms/templates/${templateId}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      }
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
    }
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            if (selectedField) {
              e.preventDefault();
              handleCopyField();
            }
            break;
          case 'v':
            if (copiedField) {
              e.preventDefault();
              handlePasteField();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      } else if (e.key === 'Delete' && selectedField) {
        handleDeleteField(selectedField.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedField, copiedField]);

  // フィールドのドラッグ開始
  const handleDragStart = (fieldType: string) => {
    setIsDragging(true);
    setDraggedFieldType(fieldType);
  };

  // キャンバスへのドロップ
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFieldType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newField: TemplateField = {
      id: generateFieldId(),
      fieldId: generateFieldId(),
      type: draggedFieldType as TemplateField['type'],
      label: `新しい${fieldTypes.find(ft => ft.type === draggedFieldType)?.label}`,
      style: {
        left: x,
        top: y,
        width: 200,
        height: 40,
        fontSize: 14,
        backgroundColor: 'transparent',
        color: '#000000',
        zIndex: 1000,
      }
    };

    const updatedPages = [...template.pages];
    updatedPages[currentPageIndex].fields.push(newField);
    setTemplate({ ...template, pages: updatedPages });
    setSelectedField(newField);
    setIsDragging(false);
    setDraggedFieldType(null);
  };

  // フィールド選択
  const handleSelectField = (field: TemplateField) => {
    setSelectedField(field);
  };

  // フィールド更新
  const handleUpdateField = (fieldId: string, updates: Partial<TemplateField>) => {
    const updatedPages = template.pages.map((page, idx) => {
      if (idx === currentPageIndex) {
        return {
          ...page,
          fields: page.fields.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          )
        };
      }
      return page;
    });
    setTemplate({ ...template, pages: updatedPages });
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  // フィールドマウスイベント - UPDATED
  const handleFieldMouseDown = useCallback((e: React.MouseEvent, field: TemplateField) => {
    console.log('=== Field mouse down triggered! ==='); // デバッグログ
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const resizeHandle = getResizeHandle(e.clientX, e.clientY, field, rect);
    
    console.log('ResizeHandle result:', resizeHandle); // デバッグログ
    
    if (resizeHandle) {
      // リサイズ操作
      console.log('=== STARTING RESIZE ===', resizeHandle); // デバッグログ
      setResizeField(field);
      setResizeHandle(resizeHandle);
      setResizeStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartSize({ width: field.style.width, height: field.style.height });
      setSelectedField(field);
    } else {
      // ドラッグ操作
      console.log('=== STARTING DRAG ==='); // デバッグログ
      const offsetX = e.clientX - rect.left - field.style.left;
      const offsetY = e.clientY - rect.top - field.style.top;
      
      setDraggedField(field);
      setDragOffset({ x: offsetX, y: offsetY });
      setSelectedField(field);
    }
    
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // リサイズハンドル専用のマウスダウンハンドラー
  const handleResizeHandleMouseDown = useCallback((e: React.MouseEvent, field: TemplateField, handle: string) => {
    console.log('=== RESIZE HANDLE CLICKED ===', handle); // デバッグログ
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    setResizeField(field);
    setResizeHandle(handle);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: field.style.width, height: field.style.height });
    setSelectedField(field);
  }, []);

  const handleFieldMouseMove = useCallback((e: React.MouseEvent, field: TemplateField) => {
    if (!canvasRef.current || draggedField || resizeField) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const resizeHandle = getResizeHandle(e.clientX, e.clientY, field, rect);
    
    setHoverResizeHandle(resizeHandle);
    setHoverField(field);
  }, [draggedField, resizeField]);

  const handleFieldMouseLeave = useCallback(() => {
    if (!draggedField && !resizeField) {
      setHoverResizeHandle(null);
      setHoverField(null);
    }
  }, [draggedField, resizeField]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedField || !canvasRef.current) return;
    
    console.log('=== DRAG MOUSE MOVE ===', { fieldId: draggedField.id }); // デバッグログ
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    // キャンバス境界内に制限とグリッドスナップ
    const boundedX = Math.max(0, Math.min(newX, rect.width - draggedField.style.width));
    const boundedY = Math.max(0, Math.min(newY, rect.height - draggedField.style.height));
    const snappedX = snapToGridPosition(boundedX);
    const snappedY = snapToGridPosition(boundedY);
    
    // 現在のテンプレートを使って更新
    const currentTemplate = templateRef.current;
    const updatedPages = currentTemplate.pages.map((page, idx) => {
      if (idx === currentPageIndex) {
        return {
          ...page,
          fields: page.fields.map(f => 
            f.id === draggedField.id 
              ? { ...f, style: { ...f.style, left: snappedX, top: snappedY } }
              : f
          )
        };
      }
      return page;
    });
    
    const newTemplate = { ...currentTemplate, pages: updatedPages };
    setTemplate(newTemplate);
    
    // 選択されたフィールドも更新
    setSelectedField(prev => 
      prev?.id === draggedField.id 
        ? { ...prev, style: { ...prev.style, left: snappedX, top: snappedY } }
        : prev
    );
  }, [draggedField, dragOffset, snapToGrid, currentPageIndex]);

  const handleMouseUp = useCallback(() => {
    setDraggedField(null);
    setDragOffset({ x: 0, y: 0 });
    setResizeField(null);
    setResizeHandle(null);
  }, []);


  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeField || !resizeHandle || !canvasRef.current) {
      return;
    }
    
    console.log('=== RESIZE MOUSE MOVE ===', { handle: resizeHandle, fieldId: resizeField.id }); // デバッグログ
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    let newWidth = resizeStartSize.width;
    let newHeight = resizeStartSize.height;
    let newLeft = resizeField.style.left;
    let newTop = resizeField.style.top;
    
    // リサイズハンドルに応じてサイズと位置を計算
    switch (resizeHandle) {
      case 'se': // 右下
        newWidth = Math.max(50, resizeStartSize.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.height + deltaY);
        break;
      case 'sw': // 左下
        newWidth = Math.max(50, resizeStartSize.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.height + deltaY);
        newLeft = resizeField.style.left + (resizeStartSize.width - newWidth);
        break;
      case 'ne': // 右上
        newWidth = Math.max(50, resizeStartSize.width + deltaX);
        newHeight = Math.max(20, resizeStartSize.height - deltaY);
        newTop = resizeField.style.top + (resizeStartSize.height - newHeight);
        break;
      case 'nw': // 左上
        newWidth = Math.max(50, resizeStartSize.width - deltaX);
        newHeight = Math.max(20, resizeStartSize.height - deltaY);
        newLeft = resizeField.style.left + (resizeStartSize.width - newWidth);
        newTop = resizeField.style.top + (resizeStartSize.height - newHeight);
        break;
      case 'n': // 上
        newHeight = Math.max(20, resizeStartSize.height - deltaY);
        newTop = resizeField.style.top + (resizeStartSize.height - newHeight);
        break;
      case 's': // 下
        newHeight = Math.max(20, resizeStartSize.height + deltaY);
        break;
      case 'e': // 右
        newWidth = Math.max(50, resizeStartSize.width + deltaX);
        break;
      case 'w': // 左
        newWidth = Math.max(50, resizeStartSize.width - deltaX);
        newLeft = resizeField.style.left + (resizeStartSize.width - newWidth);
        break;
    }
    
    // グリッドスナップ
    newWidth = snapToGridPosition(newWidth);
    newHeight = snapToGridPosition(newHeight);
    newLeft = snapToGridPosition(newLeft);
    newTop = snapToGridPosition(newTop);
    
    // 現在のテンプレートを使って更新
    const currentTemplate = templateRef.current;
    const updatedPages = currentTemplate.pages.map((page, idx) => {
      if (idx === currentPageIndex) {
        return {
          ...page,
          fields: page.fields.map(f => 
            f.id === resizeField.id 
              ? { 
                  ...f, 
                  style: { 
                    ...f.style, 
                    left: newLeft, 
                    top: newTop, 
                    width: newWidth, 
                    height: newHeight 
                  } 
                }
              : f
          )
        };
      }
      return page;
    });
    
    const newTemplate = { ...currentTemplate, pages: updatedPages };
    setTemplate(newTemplate);
    
    // 選択されたフィールドも更新
    setSelectedField(prev => 
      prev?.id === resizeField.id 
        ? { 
            ...prev, 
            style: { 
              ...prev.style, 
              left: newLeft, 
              top: newTop, 
              width: newWidth, 
              height: newHeight 
            } 
          }
        : prev
    );
  }, [resizeField, resizeHandle, resizeStartPos, resizeStartSize, snapToGrid, currentPageIndex]);

  // マウスイベントリスナー
  useEffect(() => {
    if (draggedField) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedField, handleMouseMove, handleMouseUp]);

  // リサイズイベントリスナー
  useEffect(() => {
    if (resizeField) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeField, handleResizeMouseMove, handleMouseUp]);

  // フィールド削除
  const handleDeleteField = (fieldId: string) => {
    const updatedPages = template.pages.map((page, idx) => {
      if (idx === currentPageIndex) {
        return {
          ...page,
          fields: page.fields.filter(field => field.id !== fieldId)
        };
      }
      return page;
    });
    setTemplate({ ...template, pages: updatedPages });
    
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  // フィールドコピー
  const handleCopyField = () => {
    if (selectedField) {
      setCopiedField(selectedField);
      // 簡単なフィードバック
      const button = document.querySelector('[title="コピー (Ctrl+C)"]');
      if (button) {
        button.classList.add('bg-green-50', 'border-green-500', 'text-green-600');
        setTimeout(() => {
          button.classList.remove('bg-green-50', 'border-green-500', 'text-green-600');
        }, 1000);
      }
    }
  };

  // フィールド貼り付け
  const handlePasteField = () => {
    if (!copiedField) return;

    const newField: TemplateField = {
      ...copiedField,
      id: generateFieldId(),
      fieldId: generateFieldId(),
      label: `${copiedField.label} (コピー)`,
      style: {
        ...copiedField.style,
        left: copiedField.style.left + 20,
        top: copiedField.style.top + 20,
      }
    };

    const updatedPages = [...template.pages];
    updatedPages[currentPageIndex].fields.push(newField);
    setTemplate({ ...template, pages: updatedPages });
    setSelectedField(newField);
  };

  // ページ追加
  const handleAddPage = () => {
    const newPage: TemplatePage = {
      pageNumber: template.pages.length + 1,
      fields: []
    };
    setTemplate({ ...template, pages: [...template.pages, newPage] });
    setCurrentPageIndex(template.pages.length);
  };

  // ページ削除
  const handleDeletePage = () => {
    if (template.pages.length <= 1) {
      alert('最後のページは削除できません');
      return;
    }
    
    const updatedPages = template.pages.filter((_, idx) => idx !== currentPageIndex);
    setTemplate({ ...template, pages: updatedPages });
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
  };

  // 背景画像アップロード
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/forms/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        const updatedPages = template.pages.map((page, idx) => {
          if (idx === currentPageIndex) {
            return { ...page, backgroundImage: url };
          }
          return page;
        });
        setTemplate({ ...template, pages: updatedPages });
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
    }
  };

  // 保存
  const handleSave = async () => {
    if (!template.name) {
      alert('テンプレート名を入力してください');
      return;
    }

    try {
      const url = isNew 
        ? '/api/forms/templates'
        : `/api/forms/templates/${templateId}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        const savedTemplate = await response.json();
        alert('保存しました');
        if (isNew) {
          router.push(`/forms/templates/${savedTemplate.id}/designer`);
        }
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const currentPage = template.pages[currentPageIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/forms/templates')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            placeholder="テンプレート名"
            className="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 hidden md:block">
            ショートカット: Ctrl+C (コピー) • Ctrl+V (ペースト) • Ctrl+S (保存) • Delete (削除)
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* サイドバー - フィールドタイプ */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-semibold mb-4">フィールドタイプ</h3>
          <div className="space-y-2">
            {fieldTypes.map(({ type, label, icon: Icon }) => (
              <div
                key={type}
                draggable
                onDragStart={() => handleDragStart(type)}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* コピー状態表示 */}
          {copiedField && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">クリップボード</h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2 text-blue-700">
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">{copiedField.label}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Ctrl+V または下のボタンでペースト
                </p>
                <button
                  onClick={handlePasteField}
                  className="w-full mt-2 p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                >
                  ペーストする
                </button>
              </div>
            </div>
          )}

          {/* ドラッグ設定 */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">ドラッグ設定</h3>
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">グリッドにスナップ (10px)</span>
            </label>
          </div>

          {/* 背景画像アップロード */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">背景画像</h3>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition">
                <Upload className="w-4 h-4" />
                <span>画像をアップロード</span>
              </div>
            </label>
          </div>
        </div>

        {/* キャンバス */}
        <div className="flex-1 flex flex-col">
          {/* ページコントロール */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                ページ {currentPageIndex + 1} / {template.pages.length}
              </span>
              <button
                onClick={() => setCurrentPageIndex(Math.min(template.pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === template.pages.length - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddPage}
                className="p-1 hover:bg-gray-100 rounded"
                title="ページ追加"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeletePage}
                className="p-1 hover:bg-gray-100 rounded text-red-600"
                title="ページ削除"
                disabled={template.pages.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* デザインエリア */}
          <div className="flex-1 p-8 overflow-auto">
            <div
              ref={canvasRef}
              className="relative bg-white rounded-lg shadow-lg mx-auto"
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundImage: currentPage.backgroundImage ? `url(${currentPage.backgroundImage})` : undefined,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {currentPage.fields.map(field => {
                const isHovering = hoverField?.id === field.id;
                const cursorClass = isHovering ? getResizeCursor(hoverResizeHandle) : 'cursor-grab';
                
                return (
                  <div
                    key={field.id}
                    className={`absolute group border-2 transition-all duration-200 ${
                      selectedField?.id === field.id 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-transparent hover:border-gray-300 hover:shadow-md'
                    } ${draggedField?.id === field.id ? 'cursor-grabbing scale-105' : cursorClass}`}
                    style={{
                      left: field.style.left,
                      top: field.style.top,
                      width: field.style.width,
                      height: field.style.height,
                      backgroundColor: field.style.backgroundColor,
                      zIndex: draggedField?.id === field.id ? 1000 : field.style.zIndex,
                    }}
                    onClick={() => handleSelectField(field)}
                    onMouseDown={(e) => handleFieldMouseDown(e, field)}
                    onMouseMove={(e) => handleFieldMouseMove(e, field)}
                    onMouseLeave={handleFieldMouseLeave}
                  >
                  {/* ドラッグハンドル */}
                  {selectedField?.id === field.id && (
                    <>
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-grab hover:bg-blue-600 transition-colors shadow-lg">
                        <Move className="w-3 h-3 text-white" />
                      </div>
                      
                      {/* 8方向リサイズハンドル */}
                      {/* 四角 */}
                      <div 
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-nw-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'nw')}
                      ></div>
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-ne-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'ne')}
                      ></div>
                      <div 
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-sw-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'sw')}
                      ></div>
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-se-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'se')}
                      ></div>
                      
                      {/* 辺 */}
                      <div 
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-n-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'n')}
                      ></div>
                      <div 
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-s-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 's')}
                      ></div>
                      <div 
                        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-w-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'w')}
                      ></div>
                      <div 
                        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors shadow-md cursor-e-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, field, 'e')}
                      ></div>
                    </>
                  )}
                  
                  <div className="p-2">
                    <div 
                      className="text-xs mb-1"
                      style={{
                        color: field.style.color || '#6b7280',
                        fontSize: (field.style.fontSize || 14) - 2,
                        fontWeight: field.style.fontWeight || 'normal'
                      }}
                    >
                      {field.label}
                    </div>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full pointer-events-none"
                        style={{ 
                          fontSize: field.style.fontSize || 14,
                          fontWeight: field.style.fontWeight || 'normal',
                          color: field.style.color || '#000000',
                          borderColor: field.style.borderColor || '#d1d5db',
                          backgroundColor: field.style.backgroundColor || '#ffffff',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderRadius: '4px',
                          padding: '4px 8px'
                        }}
                        disabled
                      />
                    )}
                    {field.type === 'checkbox' && (
                      <input 
                        type="checkbox" 
                        disabled 
                        className="pointer-events-none"
                        style={{
                          color: field.style.color || '#000000'
                        }}
                      />
                    )}
                    {field.type === 'select' && (
                      <select 
                        className="w-full pointer-events-none" 
                        disabled
                        style={{ 
                          fontSize: field.style.fontSize || 14,
                          fontWeight: field.style.fontWeight || 'normal',
                          color: field.style.color || '#000000',
                          borderColor: field.style.borderColor || '#d1d5db',
                          backgroundColor: field.style.backgroundColor || '#ffffff',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderRadius: '4px',
                          padding: '4px 8px'
                        }}
                      >
                        <option>選択してください</option>
                      </select>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* プロパティパネル */}
        {selectedField && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">フィールド設定</h3>
              <button
                onClick={() => setSelectedField(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ラベル</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              {selectedField.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-1">プレースホルダー</label>
                  <input
                    type="text"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedField.required || false}
                    onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                  />
                  <span className="text-sm">必須項目</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">幅</label>
                  <input
                    type="number"
                    value={selectedField.style.width}
                    onChange={(e) => handleUpdateField(selectedField.id, {
                      style: { ...selectedField.style, width: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">高さ</label>
                  <input
                    type="number"
                    value={selectedField.style.height}
                    onChange={(e) => handleUpdateField(selectedField.id, {
                      style: { ...selectedField.style, height: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* スタイル設定 */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">スタイル設定</h4>
                
                {/* 文字サイズ */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">文字サイズ (px)</label>
                  <input
                    type="number"
                    value={selectedField.style.fontSize || 14}
                    onChange={(e) => handleUpdateField(selectedField.id, {
                      style: { ...selectedField.style, fontSize: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded"
                    min="8"
                    max="72"
                  />
                </div>

                {/* 文字の太さ */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">文字の太さ</label>
                  <select
                    value={selectedField.style.fontWeight || 'normal'}
                    onChange={(e) => handleUpdateField(selectedField.id, {
                      style: { ...selectedField.style, fontWeight: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="normal">標準</option>
                    <option value="bold">太字</option>
                    <option value="lighter">細字</option>
                  </select>
                </div>

                {/* 文字色 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">文字色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedField.style.color || '#000000'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, color: e.target.value }
                      })}
                      className="w-12 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedField.style.color || '#000000'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, color: e.target.value }
                      })}
                      className="flex-1 p-2 border rounded text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* 枠の色 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">枠の色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedField.style.borderColor || '#d1d5db'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, borderColor: e.target.value }
                      })}
                      className="w-12 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedField.style.borderColor || '#d1d5db'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, borderColor: e.target.value }
                      })}
                      className="flex-1 p-2 border rounded text-sm"
                      placeholder="#d1d5db"
                    />
                  </div>
                </div>

                {/* 背景色 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">背景色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedField.style.backgroundColor || '#ffffff'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, backgroundColor: e.target.value }
                      })}
                      className="w-12 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedField.style.backgroundColor || '#ffffff'}
                      onChange={(e) => handleUpdateField(selectedField.id, {
                        style: { ...selectedField.style, backgroundColor: e.target.value }
                      })}
                      className="flex-1 p-2 border rounded text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyField}
                    className="flex-1 p-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                    title="コピー (Ctrl+C)"
                  >
                    <Copy className="w-4 h-4" />
                    コピー
                  </button>
                  <button
                    onClick={handlePasteField}
                    disabled={!copiedField}
                    className={`flex-1 p-2 border rounded flex items-center justify-center gap-1 ${
                      copiedField 
                        ? 'hover:bg-blue-50 border-blue-500 text-blue-600' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    title="ペースト (Ctrl+V)"
                  >
                    <Clipboard className="w-4 h-4" />
                    ペースト
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteField(selectedField.id)}
                  className="w-full p-2 border border-red-500 text-red-500 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}