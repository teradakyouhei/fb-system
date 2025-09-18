'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building, 
  Plus,
  Search,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  tel?: string;
  fax?: string;
  email?: string;
  postalCode?: string;
  address?: string;
  address2?: string;
  paymentTerms?: string;
  comment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function SuppliersContent() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 仕入先データの取得
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        // モック実装の制限により、直接データを設定
        const suppliersData = [
          {
            id: 'supplier-1',
            code: 'SUP001',
            name: '防災機器株式会社',
            contactPerson: '鈴木一郎',
            tel: '03-1111-2222',
            fax: '03-1111-2223',
            email: 'suzuki@bousai-kiki.co.jp',
            postalCode: '101-0001',
            address: '東京都千代田区神田神保町1-1-1',
            address2: '防災ビル3F',
            paymentTerms: '月末締め翌月末払い',
            comment: 'メイン仕入先・消火器専門',
            isActive: true,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-08-25'),
          },
          {
            id: 'supplier-2',
            code: 'SUP002',
            name: 'セキュリティシステムズ株式会社',
            contactPerson: '田中花子',
            tel: '06-3333-4444',
            fax: '06-3333-4445',
            email: 'tanaka@security-sys.co.jp',
            postalCode: '541-0041',
            address: '大阪府大阪市中央区北浜2-2-2',
            address2: 'セキュリティタワー10F',
            paymentTerms: '25日締め翌月10日払い',
            comment: '火災報知設備・警報設備専門',
            isActive: true,
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-08-20'),
          },
          {
            id: 'supplier-3',
            code: 'SUP003',
            name: '水防設備工業株式会社',
            contactPerson: '山田次郎',
            tel: '045-5555-6666',
            fax: '045-5555-6667',
            email: 'yamada@suibou-setsubi.co.jp',
            postalCode: '220-0011',
            address: '神奈川県横浜市西区高島3-3-3',
            address2: '',
            paymentTerms: '15日締め当月末払い',
            comment: 'スプリンクラー設備専門',
            isActive: true,
            createdAt: new Date('2024-03-20'),
            updatedAt: new Date('2024-08-15'),
          },
          {
            id: 'supplier-4',
            code: 'SUP004',
            name: '照明設備販売株式会社',
            contactPerson: '高橋三郎',
            tel: '052-7777-8888',
            fax: '052-7777-8889',
            email: 'takahashi@shoumei-setsubi.co.jp',
            postalCode: '460-0008',
            address: '愛知県名古屋市中区栄4-4-4',
            address2: '照明ビル5F',
            paymentTerms: '月末締め翌々月10日払い',
            comment: '誘導灯・非常照明専門',
            isActive: true,
            createdAt: new Date('2024-04-25'),
            updatedAt: new Date('2024-08-10'),
          },
          {
            id: 'supplier-5',
            code: 'SUP005',
            name: '旧式設備商事株式会社',
            contactPerson: '佐藤四郎',
            tel: '092-9999-0000',
            fax: '',
            email: '',
            postalCode: '810-0001',
            address: '福岡県福岡市中央区天神5-5-5',
            address2: '',
            paymentTerms: '',
            comment: '取引停止中',
            isActive: false,
            createdAt: new Date('2023-12-01'),
            updatedAt: new Date('2024-06-30'),
          },
        ];
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('仕入先データの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // フィルタリング
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchTerm.toLowerCase();
    return (
      supplier.code.toLowerCase().includes(searchLower) ||
      supplier.name.toLowerCase().includes(searchLower) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchLower)) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchLower)) ||
      (supplier.tel && supplier.tel.includes(searchTerm)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchLower))
    );
  });

  // ステータス別の色
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
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
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">仕入先管理</h1>
                <p className="text-xs text-gray-500">仕入先情報の一覧・管理</p>
              </div>
            </div>
            <Link
              href="/suppliers/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規仕入先</span>
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
            { label: '仕入先管理', current: true }
          ]}
          className="mb-6"
        />

        {/* 検索・フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 検索 */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="仕入先コード、会社名、担当者名、住所、電話番号、メールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 件数表示 */}
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-1" />
              <span>全{filteredSuppliers.length}件の仕入先</span>
            </div>
          </div>
        </div>

        {/* 仕入先一覧 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">
              {searchTerm ? '条件に合う仕入先が見つかりませんでした' : '仕入先データがありません'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/suppliers/${supplier.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {supplier.name}
                      </Link>
                      <p className="text-sm text-gray-500">{supplier.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/suppliers/${supplier.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/suppliers/${supplier.id}/edit`}
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
                    {supplier.address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="text-gray-600">
                            {supplier.postalCode && `〒${supplier.postalCode} `}
                            {supplier.address}
                          </span>
                          {supplier.address2 && (
                            <span className="block text-gray-600">{supplier.address2}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 電話番号 */}
                    {supplier.tel && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{supplier.tel}</span>
                        {supplier.fax && (
                          <span className="text-gray-500 ml-2">FAX: {supplier.fax}</span>
                        )}
                      </div>
                    )}

                    {/* メールアドレス */}
                    {supplier.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 truncate">{supplier.email}</span>
                      </div>
                    )}

                    {/* 担当者 */}
                    {supplier.contactPerson && (
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{supplier.contactPerson}</span>
                      </div>
                    )}

                    {/* 支払条件 */}
                    {supplier.paymentTerms && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{supplier.paymentTerms}</span>
                      </div>
                    )}

                    {/* ステータス */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(supplier.isActive)}`}>
                        {supplier.isActive ? '取引中' : '取引停止'}
                      </span>
                    </div>

                    {/* コメント */}
                    {supplier.comment && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{supplier.comment}</p>
                      </div>
                    )}

                    {/* 更新日 */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        最終更新: {formatDate(supplier.updatedAt)}
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

export default function SuppliersPage() {
  return (
    <RequireAuth>
      <SuppliersContent />
    </RequireAuth>
  );
}