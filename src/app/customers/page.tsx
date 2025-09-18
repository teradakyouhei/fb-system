'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFilterState } from '@/hooks/useFilterState';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import { prisma } from '@/lib/prisma';
import { 
  Building2, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCcw,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  code: string;
  name: string;
  name2?: string;
  honorific: string;
  postalCode?: string;
  address?: string;
  address2?: string;
  tel?: string;
  fax?: string;
  email?: string;
  emailCc?: string;
  contactPerson?: string;
  closingDate?: number;
  paymentDate?: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

function CustomersContent() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      prefectureFilter: '',
      closingDateFilter: '',
      paymentDateFilter: '',
      contactPersonFilter: '',
    },
    storageKey: 'customers-filters',
  });

  // 得意先データの取得
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // モック実装の制限により、直接データを設定
        const customersData = [
          {
            id: 'customer-1',
            code: 'CUST001',
            name: '株式会社サンプル商事',
            name2: '',
            honorific: '御中',
            postalCode: '123-4567',
            address: '東京都渋谷区サンプル1-2-3',
            address2: '',
            tel: '03-1234-5678',
            fax: '03-1234-5679',
            email: 'sample@example.com',
            emailCc: '',
            contactPerson: '佐藤花子',
            closingDate: 25,
            paymentDate: 10,
            comment: 'メイン取引先',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-08-25'),
          },
          {
            id: 'customer-2',
            code: 'CUST002',
            name: 'テストビル管理株式会社',
            name2: '',
            honorific: '御中',
            postalCode: '456-7890',
            address: '神奈川県横浜市港北区テスト2-3-4',
            address2: '',
            tel: '045-2345-6789',
            fax: '045-2345-6790',
            email: 'info@testbuild.com',
            emailCc: 'manager@testbuild.com',
            contactPerson: '山田次郎',
            closingDate: 31,
            paymentDate: 15,
            comment: '定期点検契約先',
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date('2024-08-20'),
          },
          {
            id: 'customer-3',
            code: 'CUST003',
            name: '有限会社デモマンション',
            name2: '',
            honorific: '御中',
            postalCode: '789-0123',
            address: '大阪府大阪市中央区デモ3-4-5',
            address2: '',
            tel: '06-3456-7890',
            fax: '06-3456-7891',
            email: 'contact@demo-mansion.co.jp',
            emailCc: '',
            contactPerson: '高橋三郎',
            closingDate: 20,
            paymentDate: 25,
            comment: '新築マンション管理',
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date('2024-08-15'),
          },
          {
            id: 'customer-4',
            code: 'CUST004',
            name: '東京防災設備株式会社',
            name2: '東京防災',
            honorific: '御中',
            postalCode: '100-0001',
            address: '東京都千代田区千代田1-1-1',
            address2: 'オフィスビル5F',
            tel: '03-9999-0001',
            fax: '03-9999-0002',
            email: 'sales@tokyo-bousai.co.jp',
            emailCc: 'support@tokyo-bousai.co.jp',
            contactPerson: '田中一郎',
            closingDate: 25,
            paymentDate: 30,
            comment: '大口顧客・VIP対応',
            createdAt: new Date('2024-04-01'),
            updatedAt: new Date('2024-08-30'),
          },
        ];
        setCustomers(customersData);
      } catch (error) {
        console.error('得意先データの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // 利用可能な都道府県リストの作成
  const availablePrefectures = useMemo(() => {
    const prefectures = customers.map(c => {
      if (c.address) {
        const match = c.address.match(/^(.{2,3}[都道府県])/); 
        return match ? match[1] : null;
      }
      return null;
    }).filter(Boolean) as string[];
    return [...new Set(prefectures)].sort();
  }, [customers]);

  // 利用可能な担当者リストの作成
  const availableContactPersons = useMemo(() => {
    const contacts = customers.map(c => c.contactPerson).filter(Boolean) as string[];
    return [...new Set(contacts)].sort();
  }, [customers]);


  // フィルタリング
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // キーワード検索
      const matchesSearch = !filters.searchTerm ||
        String(customer.code).toLowerCase().includes(String(filters.searchTerm).toLowerCase()) ||
        String(customer.name).toLowerCase().includes(String(filters.searchTerm).toLowerCase()) ||
        (customer.contactPerson && customer.contactPerson.toLowerCase().includes(String(filters.searchTerm).toLowerCase())) ||
        (customer.address && customer.address.toLowerCase().includes(String(filters.searchTerm).toLowerCase())) ||
        (customer.tel && customer.tel.includes(String(filters.searchTerm))) ||
        (customer.email && customer.email.toLowerCase().includes(String(filters.searchTerm).toLowerCase()));
      
      // 都道府県フィルター
      const matchesPrefecture = !filters.prefectureFilter || 
        (customer.address && customer.address.includes(String(filters.prefectureFilter)));
      
      // 締日フィルター
      const matchesClosingDate = !filters.closingDateFilter || 
        customer.closingDate?.toString() === filters.closingDateFilter;
      
      // 支払日フィルター
      const matchesPaymentDate = !filters.paymentDateFilter || 
        customer.paymentDate?.toString() === filters.paymentDateFilter;
      
      // 担当者フィルター
      const matchesContactPerson = !filters.contactPersonFilter || 
        customer.contactPerson === filters.contactPersonFilter;
      
      return matchesSearch && matchesPrefecture && matchesClosingDate && 
             matchesPaymentDate && matchesContactPerson;
    });
  }, [customers, filters]);

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
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">得意先管理</h1>
                <p className="text-xs text-gray-500">顧客情報の一覧・管理</p>
              </div>
            </div>
            
            {/* グローバル検索バー */}
            <div className="flex-1 max-w-lg mx-8">
              <GlobalSearchBar />
            </div>
            
            <Link
              href="/customers/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規得意先</span>
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
            { label: '得意先管理', current: true }
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
                  placeholder="得意先コード、会社名、担当者名、住所、電話番号、メールアドレスで検索..."
                  value={String(filters.searchTerm || '')}
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
                  <span>{filteredCustomers.length}件 / {customers.length}件</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 都道府県フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
                  <select
                    value={String(filters.prefectureFilter || '')}
                    onChange={(e) => updateFilter('prefectureFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての都道府県</option>
                    {availablePrefectures.map(prefecture => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 担当者フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">担当者</label>
                  <select
                    value={String(filters.contactPersonFilter || '')}
                    onChange={(e) => updateFilter('contactPersonFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての担当者</option>
                    {availableContactPersons.map(person => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 締日フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">締日</label>
                  <select
                    value={String(filters.closingDateFilter || '')}
                    onChange={(e) => updateFilter('closingDateFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての締日</option>
                    <option value="20">20日</option>
                    <option value="25">25日</option>
                    <option value="31">末日</option>
                  </select>
                </div>

                {/* 支払日フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">支払日</label>
                  <select
                    value={String(filters.paymentDateFilter || '')}
                    onChange={(e) => updateFilter('paymentDateFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての支払日</option>
                    <option value="10">10日</option>
                    <option value="15">15日</option>
                    <option value="25">25日</option>
                    <option value="30">30日</option>
                  </select>
                </div>
              </div>

              {/* 適用されているフィルターの表示 */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {filters.prefectureFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        都道府県: {filters.prefectureFilter}
                        <button
                          onClick={() => updateFilter('prefectureFilter', '')}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.contactPersonFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        担当者: {filters.contactPersonFilter}
                        <button
                          onClick={() => updateFilter('contactPersonFilter', '')}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.closingDateFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        締日: {filters.closingDateFilter}日
                        <button
                          onClick={() => updateFilter('closingDateFilter', '')}
                          className="ml-2 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.paymentDateFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                        支払日: {filters.paymentDateFilter}日
                        <button
                          onClick={() => updateFilter('paymentDateFilter', '')}
                          className="ml-2 hover:text-orange-600"
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

        {/* 得意先一覧 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">
              {activeFiltersCount > 0 ? '条件に合う得意先が見つかりませんでした' : '得意先データがありません'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/customers/${customer.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {customer.name}
                      </Link>
                      {customer.name2 && (
                        <p className="text-sm text-gray-600">({customer.name2})</p>
                      )}
                      <p className="text-sm text-gray-500">{customer.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/customers/${customer.id}/edit`}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <div className="space-y-3">
                    {/* 住所 */}
                    {customer.address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600">
                            {customer.postalCode && `〒${customer.postalCode} `}
                            {customer.address}
                          </span>
                          {customer.address2 && (
                            <span className="block text-gray-600">{customer.address2}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 電話番号 */}
                    {customer.tel && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{customer.tel}</span>
                        {customer.fax && (
                          <span className="text-gray-500 ml-2">FAX: {customer.fax}</span>
                        )}
                      </div>
                    )}

                    {/* メールアドレス */}
                    {customer.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 truncate">{customer.email}</span>
                      </div>
                    )}

                    {/* 担当者 */}
                    {customer.contactPerson && (
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{customer.contactPerson}</span>
                      </div>
                    )}

                    {/* 締日・支払日 */}
                    {(customer.closingDate || customer.paymentDate) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span>
                          {customer.closingDate && `締日: ${customer.closingDate}日`}
                          {customer.closingDate && customer.paymentDate && ' / '}
                          {customer.paymentDate && `支払日: ${customer.paymentDate}日`}
                        </span>
                      </div>
                    )}

                    {/* コメント */}
                    {customer.comment && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{customer.comment}</p>
                      </div>
                    )}

                    {/* 更新日 */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        最終更新: {formatDate(customer.updatedAt)}
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

export default function CustomersPage() {
  return (
    <RequireAuth>
      <CustomersContent />
    </RequireAuth>
  );
}