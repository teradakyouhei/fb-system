'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFilterState } from '@/hooks/useFilterState';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import { prisma } from '@/lib/prisma';
import { 
  Package, 
  Plus,
  Search,
  Eye,
  Edit,
  DollarSign,
  Hash,
  Tag,
  Box,
  FileText,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCcw,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  TrendingDown
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

function ProductsContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // フィルター状態（URL・ローカルストレージ対応）
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFiltersCount
  } = useFilterState({
    defaultFilters: {
      searchTerm: '',
      categoryFilter: '',
      supplierFilter: '',
      stockStatusFilter: '',
      activeStatusFilter: '',
      priceMin: '',
      priceMax: '',
      stockMin: '',
      stockMax: '',
    },
    storageKey: 'products-filters',
  });

  // 商品データの取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // モック実装の制限により、直接データを設定
        const productsData = [
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
        setProducts(productsData);
      } catch (error) {
        console.error('商品データの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 利用可能なカテゴリー・仕入先リストの作成
  const availableCategories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  const availableSuppliers = useMemo(() => {
    const uniqueSuppliers = products.reduce((acc, product) => {
      if (product.supplier && !acc.find(s => s.id === product.supplier!.id)) {
        acc.push(product.supplier);
      }
      return acc;
    }, [] as Array<{id: string, name: string, code: string}>);
    return uniqueSuppliers;
  }, [products]);


  // 在庫状況を判定
  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'critical';
    if (product.minStockLevel && product.stockQuantity <= product.minStockLevel) return 'low';
    return 'normal';
  };

  // フィルタリング
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // キーワード検索
      const matchesSearch = !filters.searchTerm ||
        product.code.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.supplier && product.supplier.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      // カテゴリーフィルター
      const matchesCategory = !filters.categoryFilter || product.category === filters.categoryFilter;
      
      // 仕入先フィルター
      const matchesSupplier = !filters.supplierFilter || product.supplier?.id === filters.supplierFilter;
      
      // 在庫状況フィルター
      const stockStatus = getStockStatus(product);
      const matchesStockStatus = !filters.stockStatusFilter || stockStatus === filters.stockStatusFilter;
      
      // 販売状況フィルター
      const matchesActiveStatus = !filters.activeStatusFilter || 
        (filters.activeStatusFilter === 'active' && product.isActive) ||
        (filters.activeStatusFilter === 'inactive' && !product.isActive);
      
      // 価格範囲フィルター
      const matchesPrice = (!filters.priceMin || product.unitPrice >= parseInt(filters.priceMin)) &&
                          (!filters.priceMax || product.unitPrice <= parseInt(filters.priceMax));
      
      // 在庫数範囲フィルター
      const matchesStock = (!filters.stockMin || product.stockQuantity >= parseInt(filters.stockMin)) &&
                          (!filters.stockMax || product.stockQuantity <= parseInt(filters.stockMax));
      
      return matchesSearch && matchesCategory && matchesSupplier && matchesStockStatus && 
             matchesActiveStatus && matchesPrice && matchesStock;
    });
  }, [products, filters]);

  // ステータス別の色
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 在庫レベルの色
  const getStockColor = (current: number, min?: number) => {
    if (!min) return 'text-gray-600';
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

  // 日付のフォーマット
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP');
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
                <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
                <p className="text-xs text-gray-500">商品情報の一覧・管理</p>
              </div>
            </div>
            
            {/* グローバル検索バー */}
            <div className="flex-1 max-w-lg mx-8">
              <GlobalSearchBar />
            </div>
            
            <Link
              href="/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規商品</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: 'マスター管理' },
            { label: '商品管理', current: true }
          ]}
          className="mb-6"
        />

        {/* 検索・フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          {/* 基本検索エリア */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* メイン検索 */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="商品コード、商品名、カテゴリー、仕入先で検索..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 高度検索トグル */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>高度検索</span>
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* 結果件数とクリア */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{filteredProducts.length}件 / {products.length}件</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    <span>クリア</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 高度検索エリア */}
          {showAdvancedFilters && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* カテゴリーフィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                  <select
                    value={filters.categoryFilter}
                    onChange={(e) => updateFilter('categoryFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべてのカテゴリー</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 仕入先フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">仕入先</label>
                  <select
                    value={filters.supplierFilter}
                    onChange={(e) => updateFilter('supplierFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての仕入先</option>
                    {availableSuppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 在庫状況フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">在庫状況</label>
                  <select
                    value={filters.stockStatusFilter}
                    onChange={(e) => updateFilter('stockStatusFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての在庫状況</option>
                    <option value="normal">正常在庫</option>
                    <option value="low">低在庫</option>
                    <option value="critical">欠品・緊急</option>
                  </select>
                </div>

                {/* 販売状況フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">販売状況</label>
                  <select
                    value={filters.activeStatusFilter}
                    onChange={(e) => updateFilter('activeStatusFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての販売状況</option>
                    <option value="active">販売中</option>
                    <option value="inactive">販売停止</option>
                  </select>
                </div>

                {/* 単価範囲（最小） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">単価（最小）</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter('priceMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 単価範囲（最大） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">単価（最大）</label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter('priceMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 在庫数範囲（最小） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">在庫数（最小）</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.stockMin}
                    onChange={(e) => updateFilter('stockMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 在庫数範囲（最大） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">在庫数（最大）</label>
                  <input
                    type="number"
                    placeholder="9999"
                    value={filters.stockMax}
                    onChange={(e) => updateFilter('stockMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 適用されているフィルターの表示 */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {filters.categoryFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        カテゴリー: {filters.categoryFilter}
                        <button
                          onClick={() => updateFilter('categoryFilter', '')}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.supplierFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        仕入先: {availableSuppliers.find(s => s.id === filters.supplierFilter)?.name}
                        <button
                          onClick={() => updateFilter('supplierFilter', '')}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.stockStatusFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        在庫状況: {filters.stockStatusFilter === 'normal' ? '正常在庫' : 
                                filters.stockStatusFilter === 'low' ? '低在庫' : '欠品・緊急'}
                        <button
                          onClick={() => updateFilter('stockStatusFilter', '')}
                          className="ml-2 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.activeStatusFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                        販売状況: {filters.activeStatusFilter === 'active' ? '販売中' : '販売停止'}
                        <button
                          onClick={() => updateFilter('activeStatusFilter', '')}
                          className="ml-2 hover:text-orange-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(filters.priceMin || filters.priceMax) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                        単価: ¥{filters.priceMin || '0'} ～ ¥{filters.priceMax || '∞'}
                        <button
                          onClick={() => {
                            updateFilter('priceMin', '');
                            updateFilter('priceMax', '');
                          }}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(filters.stockMin || filters.stockMax) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                        在庫数: {filters.stockMin || '0'} ～ {filters.stockMax || '∞'}個
                        <button
                          onClick={() => {
                            updateFilter('stockMin', '');
                            updateFilter('stockMax', '');
                          }}
                          className="ml-2 hover:text-yellow-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 商品一覧 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">
              {activeFiltersCount > 0 ? '条件に合う商品が見つかりませんでした' : '商品データがありません'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500">{product.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/products/${product.id}/edit`}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <div className="space-y-3">
                    {/* カテゴリー */}
                    <div className="flex items-center text-sm">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{product.category}</span>
                    </div>

                    {/* 単位・価格 */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Box className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">単位: {product.unit}</span>
                      </div>
                      <div className="flex items-center font-semibold text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {formatPrice(product.unitPrice)}
                      </div>
                    </div>

                    {/* 在庫情報 */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">在庫数量:</span>
                      <div className="flex items-center">
                        <span className={`font-medium ${getStockColor(product.stockQuantity, product.minStockLevel)}`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                        {product.minStockLevel && product.stockQuantity <= product.minStockLevel && (
                          <AlertCircle className="w-4 h-4 ml-1 text-red-500" title="在庫不足" />
                        )}
                      </div>
                    </div>

                    {/* 仕入先 */}
                    {product.supplier && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-2">仕入先:</span>
                        <span className="text-gray-600">{product.supplier.name}</span>
                      </div>
                    )}

                    {/* ステータス */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(product.isActive)}`}>
                        {product.isActive ? '販売中' : '販売停止'}
                      </span>
                    </div>

                    {/* 説明 */}
                    {product.description && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                    )}

                    {/* 更新日 */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        最終更新: {formatDate(product.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <RequireAuth>
      <ProductsContent />
    </RequireAuth>
  );
}