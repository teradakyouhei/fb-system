'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Package, 
  ArrowLeft,
  Edit,
  Trash2,
  Hash,
  Tag,
  Box,
  DollarSign,
  Building2,
  FileText,
  ToggleLeft,
  AlertCircle,
  Clock
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

function ProductDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 商品データの取得
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
        setProduct(productData || null);
      } catch (error) {
        console.error('商品データの取得エラー:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // 商品削除
  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(`商品「${product.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await prisma.product.delete({
        where: { id: product.id },
      });

      alert('商品を削除しました');
      router.push('/products');
    } catch (error) {
      console.error('商品削除エラー:', error);
      alert('商品の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  // ステータス別の色
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 在庫レベルの色
  const getStockColor = (current: number, min?: number) => {
    if (!min) return 'text-gray-900';
    if (current <= min) return 'text-red-600';
    if (current <= min * 1.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  // 金額のフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  // 日時のフォーマット
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('ja-JP');
  };

  // 利益率の計算
  const calculateProfitRate = (unitPrice: number, costPrice?: number) => {
    if (!costPrice) return null;
    return ((unitPrice - costPrice) / unitPrice * 100).toFixed(1);
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

  if (!product) {
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
                <h1 className="text-xl font-bold text-gray-900">商品詳細</h1>
                <p className="text-xs text-gray-500">{product.code} - {product.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>編集</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? '削除中...' : '削除'}</span>
              </button>
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>一覧に戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: 'マスター管理' },
            { label: '商品管理', href: '/products' },
            { label: `${product.code} - ${product.name}`, current: true }
          ]}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">商品コード</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-gray-400" />
                    {product.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">販売状況</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(product.isActive)}`}>
                    <ToggleLeft className="w-4 h-4 mr-1" />
                    {product.isActive ? '販売中' : '販売停止'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">商品名</label>
                  <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">カテゴリー</label>
                  <p className="text-gray-900 flex items-center">
                    <Tag className="w-4 h-4 mr-1 text-gray-400" />
                    {product.category}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">単位</label>
                  <p className="text-gray-900 flex items-center">
                    <Box className="w-4 h-4 mr-1 text-gray-400" />
                    {product.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* 価格情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                価格情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">単価</label>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(product.unitPrice)}</p>
                </div>
                {product.costPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">原価</label>
                    <p className="text-gray-900">{formatPrice(product.costPrice)}</p>
                  </div>
                )}
                {product.costPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">利益率</label>
                    <p className="text-gray-900 font-medium">
                      {calculateProfitRate(product.unitPrice, product.costPrice)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 在庫情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Box className="w-5 h-5 mr-2" />
                在庫情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">現在在庫</label>
                  <div className="flex items-center">
                    <p className={`text-lg font-semibold ${getStockColor(product.stockQuantity, product.minStockLevel)}`}>
                      {product.stockQuantity} {product.unit}
                    </p>
                    {product.minStockLevel && product.stockQuantity <= product.minStockLevel && (
                      <AlertCircle className="w-5 h-5 ml-2 text-red-500" title="在庫不足" />
                    )}
                  </div>
                </div>
                {product.minStockLevel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">最小在庫レベル</label>
                    <p className="text-gray-900">{product.minStockLevel} {product.unit}</p>
                  </div>
                )}
              </div>
              {product.minStockLevel && product.stockQuantity <= product.minStockLevel && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm font-medium">在庫不足警告</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">
                    在庫が最小レベル以下です。補充をご検討ください。
                  </p>
                </div>
              )}
            </div>

            {/* 仕入先情報 */}
            {product.supplier && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  仕入先情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">仕入先名</label>
                    <p className="text-gray-900 font-semibold">{product.supplier.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">仕入先コード</label>
                    <p className="text-gray-900">{product.supplier.code}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 商品説明 */}
            {product.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  商品説明
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{product.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* 右側：追加情報 */}
          <div className="space-y-6">
            {/* システム情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                システム情報
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">作成日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(product.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">更新日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(product.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/products/${product.id}/edit`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>商品を編集</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? '削除中...' : '商品を削除'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <RequireAuth>
      <ProductDetailContent />
    </RequireAuth>
  );
}