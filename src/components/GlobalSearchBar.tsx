'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, FileText, Building2, Package, User, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'order' | 'customer' | 'product' | 'staff';
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
}

interface GlobalSearchBarProps {
  className?: string;
}

export default function GlobalSearchBar({ className = '' }: GlobalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // モックデータ
  const mockData: SearchResult[] = [
    // 受注データ
    { id: 'order-1', type: 'order', title: '消火器点検作業', subtitle: 'ORD001', description: '株式会社サンプル商事', href: '/orders/order-1' },
    { id: 'order-2', type: 'order', title: '自動火災報知設備工事', subtitle: 'ORD002', description: 'テストビル管理', href: '/orders/order-2' },
    { id: 'order-3', type: 'order', title: 'スプリンクラー設備保守', subtitle: 'ORD003', description: 'デモマンション', href: '/orders/order-3' },
    
    // 得意先データ
    { id: 'customer-1', type: 'customer', title: '株式会社サンプル商事', subtitle: 'CUST001', description: '東京都渋谷区', href: '/customers/customer-1' },
    { id: 'customer-2', type: 'customer', title: 'テストビル管理株式会社', subtitle: 'CUST002', description: '神奈川県横浜市', href: '/customers/customer-2' },
    { id: 'customer-3', type: 'customer', title: '有限会社デモマンション', subtitle: 'CUST003', description: '大阪府大阪市', href: '/customers/customer-3' },
    
    // 商品データ
    { id: 'product-1', type: 'product', title: 'ABC粉末消火器10型', subtitle: 'PROD001', description: '消火器 - ¥8,500', href: '/products/product-1' },
    { id: 'product-2', type: 'product', title: '自動火災報知機 感知器', subtitle: 'PROD002', description: '火災報知設備 - ¥12,000', href: '/products/product-2' },
    { id: 'product-3', type: 'product', title: '誘導灯 避難口通路用', subtitle: 'PROD003', description: '誘導灯 - ¥15,000', href: '/products/product-3' },
    
    // 担当者データ
    { id: 'staff-1', type: 'staff', title: '田中太郎', subtitle: 'STAFF001', description: '営業部 - 営業担当', href: '/staff/staff-1' },
    { id: 'staff-2', type: 'staff', title: '佐藤花子', subtitle: 'STAFF002', description: '技術部 - 技術者', href: '/staff/staff-2' },
    { id: 'staff-3', type: 'staff', title: '山田次郎', subtitle: 'STAFF003', description: '管理部 - 事務', href: '/staff/staff-3' },
  ];

  // 検索実行
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // モックデータから検索（実際の実装では API コール）
    const filteredResults = mockData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    });

    // タイプ別に制限して返す（各タイプ最大3件）
    const limitedResults: SearchResult[] = [];
    const typeCount: { [key: string]: number } = {};

    filteredResults.forEach(result => {
      if (!typeCount[result.type]) typeCount[result.type] = 0;
      if (typeCount[result.type] < 3) {
        limitedResults.push(result);
        typeCount[result.type]++;
      }
    });

    setResults(limitedResults);
    setLoading(false);
  };

  // 検索クエリが変更されたときの処理（デバウンス）
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // アイコンの取得
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'customer': return <Building2 className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'staff': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // タイプの日本語名取得
  const getTypeName = (type: string) => {
    switch (type) {
      case 'order': return '受注';
      case 'customer': return '得意先';
      case 'product': return '商品';
      case 'staff': return '担当者';
      default: return '';
    }
  };

  // 検索結果のクリック
  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  // 検索のクリア
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 検索入力エリア */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="受注、得意先、商品、担当者を検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              検索中...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 text-gray-400">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {getTypeName(result.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{result.subtitle}</span>
                      {result.description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{result.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="p-4 text-center text-gray-500">
              「{query}」に一致する項目が見つかりませんでした
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}