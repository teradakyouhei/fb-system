'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Package, 
  Save,
  ArrowLeft,
  Hash,
  Tag,
  Box,
  DollarSign,
  Building2,
  FileText,
  ToggleLeft
} from 'lucide-react';
import Link from 'next/link';

interface Supplier {
  id: string;
  code: string;
  name: string;
}

function NewProductContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  // 初期データの設定
  useEffect(() => {
    const generateProductCode = () => {
      // 既存の商品数をベースに次の商品コードを生成
      const productCount = 6; // モックデータとして6件目の想定
      return `PROD${String(productCount).padStart(3, '0')}`;
    };

    // 仕入先データの取得（マスター管理で作成されたデータを使用）
    const fetchSuppliers = () => {
      const suppliersData = [
        { id: 'supplier-1', code: 'SUP001', name: '防災機器株式会社' },
        { id: 'supplier-2', code: 'SUP002', name: 'セキュリティシステムズ' },
        { id: 'supplier-3', code: 'SUP003', name: '水防設備工業' },
        { id: 'supplier-4', code: 'SUP004', name: '東日本消防設備' },
        { id: 'supplier-5', code: 'SUP005', name: '安全機器工業株式会社' },
      ];
      setSuppliers(suppliersData);
    };

    setFormData(prev => ({
      ...prev,
      code: generateProductCode(),
    }));

    fetchSuppliers();
  }, []);

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

    // 商品コードのバリデーション
    if (!formData.code.trim()) {
      newErrors.code = '商品コードは必須です';
    } else if (!/^[A-Z]{4}[0-9]{3}$/.test(formData.code.trim())) {
      newErrors.code = '商品コードの形式が正しくありません（例：PROD001）';
    }

    // 商品名のバリデーション
    if (!formData.name.trim()) {
      newErrors.name = '商品名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '商品名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '商品名は100文字以内で入力してください';
    }

    // カテゴリーのバリデーション
    if (!formData.category.trim()) {
      newErrors.category = 'カテゴリーは必須です';
    }

    // 単価のバリデーション
    if (!formData.unitPrice) {
      newErrors.unitPrice = '単価は必須です';
    } else if (isNaN(Number(formData.unitPrice))) {
      newErrors.unitPrice = '単価は数値で入力してください';
    } else {
      const price = Number(formData.unitPrice);
      if (price < 0) {
        newErrors.unitPrice = '単価は0以上で入力してください';
      } else if (price > 9999999) {
        newErrors.unitPrice = '単価は9,999,999円以下で入力してください';
      }
    }

    // 原価のバリデーション
    if (formData.costPrice) {
      if (isNaN(Number(formData.costPrice))) {
        newErrors.costPrice = '原価は数値で入力してください';
      } else {
        const cost = Number(formData.costPrice);
        if (cost < 0) {
          newErrors.costPrice = '原価は0以上で入力してください';
        }
      }
    }

    // 在庫数量のバリデーション
    if (!formData.stockQuantity) {
      newErrors.stockQuantity = '在庫数量は必須です';
    } else if (isNaN(Number(formData.stockQuantity))) {
      newErrors.stockQuantity = '在庫数量は数値で入力してください';
    } else {
      const stock = Number(formData.stockQuantity);
      if (stock < 0) {
        newErrors.stockQuantity = '在庫数量は0以上で入力してください';
      }
    }

    // 最小在庫レベルのバリデーション
    if (formData.minStockLevel) {
      if (isNaN(Number(formData.minStockLevel))) {
        newErrors.minStockLevel = '最小在庫レベルは数値で入力してください';
      } else {
        const minStock = Number(formData.minStockLevel);
        if (minStock < 0) {
          newErrors.minStockLevel = '最小在庫レベルは0以上で入力してください';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 商品データの作成
      const newProduct = await prisma.product.create({
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

      console.log('商品を作成しました:', newProduct);
      router.push('/products');
      
    } catch (error) {
      console.error('商品作成エラー:', error);
      alert('商品の登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">新規商品登録</h1>
                <p className="text-xs text-gray-500">新しい商品情報を登録</p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>商品一覧に戻る</span>
            </Link>
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
            { label: '新規商品登録', current: true }
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
              <Link
                href="/products"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? '登録中...' : '商品を登録'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <RequireAuth>
      <NewProductContent />
    </RequireAuth>
  );
}