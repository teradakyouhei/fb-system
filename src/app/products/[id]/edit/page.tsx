'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Package, 
  Save,
  X,
  Hash,
  Tag,
  Box,
  DollarSign,
  Building2,
  FileText,
  ToggleLeft
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  supplierId?: string;
  supplier?: {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
}

function EditProductContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    unit: '個',
    unitPrice: '',
    costPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    supplierId: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期データの取得
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        
        // モック実装の制限により、直接データを設定
        const mockProducts = [
          {
            id: 'product-1',
            code: 'PROD001',
            name: 'ABC粉末消火器10型',
            category: '消火器',
            unit: '本',
            unitPrice: 8500,
            costPrice: 6000,
            stockQuantity: 25,
            minStockLevel: 10,
            supplierId: 'supplier-1',
            supplier: {
              id: 'supplier-1',
              name: '防災機器株式会社',
              code: 'SUP001'
            },
            description: '一般的なABC粉末消火器、住宅・事務所用',
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-08-25'),
          },
          {
            id: 'product-2',
            code: 'PROD002',
            name: '自動火災報知機 感知器',
            category: '火災報知設備',
            unit: '個',
            unitPrice: 12000,
            costPrice: 8500,
            stockQuantity: 50,
            minStockLevel: 20,
            supplierId: 'supplier-2',
            supplier: {
              id: 'supplier-2',
              name: 'セキュリティシステムズ',
              code: 'SUP002'
            },
            description: '煙感知器、高感度タイプ',
            isActive: true,
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-08-20'),
          },
          {
            id: 'product-3',
            code: 'PROD003',
            name: '誘導灯 避難口通路用',
            category: '誘導灯',
            unit: '台',
            unitPrice: 15000,
            costPrice: 11000,
            stockQuantity: 8,
            minStockLevel: 5,
            supplierId: 'supplier-1',
            supplier: {
              id: 'supplier-1',
              name: '防災機器株式会社',
              code: 'SUP001'
            },
            description: 'LED誘導灯、省エネタイプ',
            isActive: true,
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date('2024-08-15'),
          },
          {
            id: 'product-4',
            code: 'PROD004',
            name: 'スプリンクラーヘッド 標準型',
            category: 'スプリンクラー設備',
            unit: '個',
            unitPrice: 3500,
            costPrice: 2200,
            stockQuantity: 100,
            minStockLevel: 30,
            supplierId: 'supplier-3',
            supplier: {
              id: 'supplier-3',
              name: '水防設備工業',
              code: 'SUP003'
            },
            description: '68℃作動、標準反応型',
            isActive: true,
            createdAt: new Date('2024-04-01'),
            updatedAt: new Date('2024-08-30'),
          },
          {
            id: 'product-5',
            code: 'PROD005',
            name: '非常ベル 屋内用',
            category: '警報設備',
            unit: '台',
            unitPrice: 25000,
            costPrice: 18000,
            stockQuantity: 3,
            minStockLevel: 5,
            supplierId: 'supplier-2',
            supplier: {
              id: 'supplier-2',
              name: 'セキュリティシステムズ',
              code: 'SUP002'
            },
            description: '手動式非常ベル、屋内設置用',
            isActive: false,
            createdAt: new Date('2024-05-15'),
            updatedAt: new Date('2024-07-20'),
          },
        ];

        const productData = mockProducts.find(p => p.id === productId);
        
        if (!productData) {
          router.push('/products');
          return;
        }

        setOriginalProduct(productData);
        
        // フォームデータの初期化
        setFormData({
          code: productData.code,
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          unitPrice: productData.unitPrice.toString(),
          costPrice: productData.costPrice?.toString() || '',
          stockQuantity: productData.stockQuantity.toString(),
          minStockLevel: productData.minStockLevel?.toString() || '',
          supplierId: productData.supplierId || '',
          description: productData.description || '',
          isActive: productData.isActive,
        });

        // 仕入先データの取得（マスター管理で作成されたデータを使用）
        const suppliersData = [
          { id: 'supplier-1', code: 'SUP001', name: '防災機器株式会社' },
          { id: 'supplier-2', code: 'SUP002', name: 'セキュリティシステムズ' },
          { id: 'supplier-3', code: 'SUP003', name: '水防設備工業' },
          { id: 'supplier-4', code: 'SUP004', name: '東日本消防設備' },
          { id: 'supplier-5', code: 'SUP005', name: '安全機器工業株式会社' },
        ];
        setSuppliers(suppliersData);

      } catch (error) {
        console.error('商品データの取得エラー:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // フォーム入力の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // エラーメッセージをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = '商品コードは必須です';
    }
    if (!formData.name.trim()) {
      newErrors.name = '商品名は必須です';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'カテゴリーは必須です';
    }
    if (!formData.unitPrice || isNaN(Number(formData.unitPrice))) {
      newErrors.unitPrice = '単価は数値で入力してください';
    }
    if (formData.costPrice && isNaN(Number(formData.costPrice))) {
      newErrors.costPrice = '原価は数値で入力してください';
    }
    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity))) {
      newErrors.stockQuantity = '在庫数量は数値で入力してください';
    }
    if (formData.minStockLevel && isNaN(Number(formData.minStockLevel))) {
      newErrors.minStockLevel = '最小在庫レベルは数値で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !originalProduct) {
      return;
    }

    setSaving(true);
    try {
      // 商品データの更新
      const updatedProduct = await prisma.product.update({
        where: { id: originalProduct.id },
        data: {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          unitPrice: parseInt(formData.unitPrice),
          costPrice: formData.costPrice ? parseInt(formData.costPrice) : undefined,
          stockQuantity: parseInt(formData.stockQuantity),
          minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : undefined,
          supplierId: formData.supplierId || undefined,
          description: formData.description || undefined,
          isActive: formData.isActive,
        },
      });

      console.log('商品を更新しました:', updatedProduct);
      router.push(`/products/${originalProduct.id}`);
      
    } catch (error) {
      console.error('商品更新エラー:', error);
      alert('商品の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    const hasChanges = originalProduct && (
      formData.code !== originalProduct.code ||
      formData.name !== originalProduct.name ||
      formData.category !== originalProduct.category ||
      formData.unit !== originalProduct.unit ||
      formData.unitPrice !== originalProduct.unitPrice.toString() ||
      formData.costPrice !== (originalProduct.costPrice?.toString() || '') ||
      formData.stockQuantity !== originalProduct.stockQuantity.toString() ||
      formData.minStockLevel !== (originalProduct.minStockLevel?.toString() || '') ||
      formData.supplierId !== (originalProduct.supplierId || '') ||
      formData.description !== (originalProduct.description || '') ||
      formData.isActive !== originalProduct.isActive
    );

    if (hasChanges) {
      const confirmed = window.confirm('変更が保存されていません。編集を破棄してもよろしいですか？');
      if (!confirmed) return;
    }

    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!originalProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">商品が見つかりませんでした</div>
          <Link href="/products" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            商品一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">商品編集</h1>
                <p className="text-xs text-gray-500">{originalProduct.code} - {originalProduct.name}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>キャンセル</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: 'マスター管理' },
            { label: '商品管理', href: '/products' },
            { label: `${originalProduct.code} - ${originalProduct.name}`, href: `/products/${originalProduct.id}` },
            { label: '編集', current: true }
          ]}
          className="mb-6"
        />
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 商品コード */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    商品コード *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PROD001"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                {/* 販売状況 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ToggleLeft className="w-4 h-4 inline mr-1" />
                    販売状況
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">販売中</option>
                    <option value="false">販売停止</option>
                  </select>
                </div>

                {/* 商品名 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    商品名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC粉末消火器10型"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* カテゴリー */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    カテゴリー *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="消火器"
                  />
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                {/* 単位 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Box className="w-4 h-4 inline mr-1" />
                    単位 *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="個">個</option>
                    <option value="本">本</option>
                    <option value="台">台</option>
                    <option value="セット">セット</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 価格情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                価格情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 単価 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    単価 *
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8500"
                    min="0"
                  />
                  {errors.unitPrice && <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>}
                  <p className="text-sm text-gray-500 mt-1">販売単価（円）</p>
                </div>

                {/* 原価 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    原価
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6000"
                    min="0"
                  />
                  {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>}
                  <p className="text-sm text-gray-500 mt-1">仕入原価（円）</p>
                </div>
              </div>
            </div>

            {/* 在庫情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Box className="w-5 h-5 mr-2" />
                在庫情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 在庫数量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    在庫数量 *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                    min="0"
                  />
                  {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>}
                  <p className="text-sm text-gray-500 mt-1">現在の在庫数</p>
                </div>

                {/* 最小在庫レベル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小在庫レベル
                  </label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                    min="0"
                  />
                  {errors.minStockLevel && <p className="text-red-500 text-sm mt-1">{errors.minStockLevel}</p>}
                  <p className="text-sm text-gray-500 mt-1">在庫アラートレベル</p>
                </div>
              </div>
            </div>

            {/* その他情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                その他情報
              </h2>
              <div className="space-y-6">
                {/* 仕入先 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    仕入先
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">仕入先を選択してください</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 商品説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    商品説明
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="商品の詳細説明を入力してください"
                  />
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '更新中...' : '変更を保存'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <RequireAuth>
      <EditProductContent />
    </RequireAuth>
  );
}