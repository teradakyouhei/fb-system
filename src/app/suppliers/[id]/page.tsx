'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building, 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Package,
  ToggleLeft,
  Clock
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

function SupplierDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 仕入先データの取得
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;

      try {
        setLoading(true);
        
        // モック実装の制限により、直接データを設定
        const mockSuppliers = [
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

        const supplierData = mockSuppliers.find(s => s.id === supplierId);
        setSupplier(supplierData || null);
      } catch (error) {
        console.error('仕入先データの取得エラー:', error);
        router.push('/suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId, router]);

  // 仕入先削除
  const handleDelete = async () => {
    if (!supplier) return;

    const confirmed = window.confirm(`仕入先「${supplier.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await prisma.supplier.delete({
        where: { id: supplier.id },
      });

      alert('仕入先を削除しました');
      router.push('/suppliers');
    } catch (error) {
      console.error('仕入先削除エラー:', error);
      alert('仕入先の削除に失敗しました');
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

  // 日時のフォーマット
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('ja-JP');
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

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">仕入先が見つかりませんでした</div>
          <Link href="/suppliers" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            仕入先一覧に戻る
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
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">仕入先詳細</h1>
                <p className="text-xs text-gray-500">{supplier.code} - {supplier.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/suppliers/${supplier.id}/edit`}
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
                href="/suppliers"
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
            { label: '仕入先管理', href: '/suppliers' },
            { label: `${supplier.code} - ${supplier.name}`, current: true }
          ]}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">仕入先コード</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-gray-400" />
                    {supplier.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">取引状況</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(supplier.isActive)}`}>
                    <ToggleLeft className="w-4 h-4 mr-1" />
                    {supplier.isActive ? '取引中' : '取引停止'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">会社名</label>
                  <p className="text-lg font-semibold text-gray-900">{supplier.name}</p>
                </div>
                {supplier.contactPerson && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">担当者</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      {supplier.contactPerson}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                連絡先情報
              </h2>
              <div className="space-y-4">
                {/* 住所 */}
                {supplier.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">
                          {supplier.postalCode && `〒${supplier.postalCode} `}
                          {supplier.address}
                        </p>
                        {supplier.address2 && (
                          <p className="text-gray-900">{supplier.address2}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 電話・FAX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.tel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {supplier.tel}
                      </p>
                    </div>
                  )}
                  {supplier.fax && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">FAX番号</label>
                      <p className="text-gray-900">{supplier.fax}</p>
                    </div>
                  )}
                </div>

                {/* メールアドレス */}
                {supplier.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="truncate">{supplier.email}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 取引情報 */}
            {supplier.paymentTerms && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  取引情報
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">支払条件</label>
                  <p className="text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-1 text-gray-400" />
                    {supplier.paymentTerms}
                  </p>
                </div>
              </div>
            )}

            {/* コメント */}
            {supplier.comment && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  コメント
                </h2>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{supplier.comment}</p>
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
                  <p className="text-gray-900 text-sm">{formatDateTime(supplier.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">更新日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(supplier.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/suppliers/${supplier.id}/edit`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>仕入先を編集</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? '削除中...' : '仕入先を削除'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SupplierDetailPage() {
  return (
    <RequireAuth>
      <SupplierDetailContent />
    </RequireAuth>
  );
}