'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building2, 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Calendar,
  Clock
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

function CustomerDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 得意先データの取得
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        
        // モック実装の制限により、直接データを設定
        const mockCustomers = [
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

        const customerData = mockCustomers.find(c => c.id === customerId);
        setCustomer(customerData || null);
      } catch (error) {
        console.error('得意先データの取得エラー:', error);
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, router]);

  // 得意先削除
  const handleDelete = async () => {
    if (!customer) return;

    const confirmed = window.confirm(`得意先「${customer.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await prisma.customer.delete({
        where: { id: customer.id },
      });

      alert('得意先を削除しました');
      router.push('/customers');
    } catch (error) {
      console.error('得意先削除エラー:', error);
      alert('得意先の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">得意先が見つかりませんでした</div>
          <Link href="/customers" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            得意先一覧に戻る
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
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">得意先詳細</h1>
                <p className="text-xs text-gray-500">{customer.code} - {customer.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/customers/${customer.id}/edit`}
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
                href="/customers"
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
            { label: '得意先管理', href: '/customers' },
            { label: `${customer.code} - ${customer.name}`, current: true }
          ]}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">得意先コード</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-gray-400" />
                    {customer.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">敬称</label>
                  <p className="text-gray-900">{customer.honorific}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">会社名</label>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                  {customer.name2 && (
                    <p className="text-gray-600 text-sm">略称: {customer.name2}</p>
                  )}
                </div>
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
                {customer.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">
                          {customer.postalCode && `〒${customer.postalCode} `}
                          {customer.address}
                        </p>
                        {customer.address2 && (
                          <p className="text-gray-900">{customer.address2}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 電話・FAX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.tel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.tel}
                      </p>
                    </div>
                  )}
                  {customer.fax && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">FAX番号</label>
                      <p className="text-gray-900">{customer.fax}</p>
                    </div>
                  )}
                </div>

                {/* メールアドレス */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </p>
                    </div>
                  )}
                  {customer.emailCc && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">CCメールアドレス</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="truncate">{customer.emailCc}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* 担当者 */}
                {customer.contactPerson && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">担当者</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      {customer.contactPerson}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 取引情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                取引情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.closingDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">締日</label>
                    <p className="text-gray-900">毎月 {customer.closingDate}日</p>
                  </div>
                )}
                {customer.paymentDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">支払日</label>
                    <p className="text-gray-900">毎月 {customer.paymentDate}日</p>
                  </div>
                )}
                {customer.comment && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">コメント</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-900 flex items-start">
                        <FileText className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                        {customer.comment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  <p className="text-gray-900 text-sm">{formatDateTime(customer.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">更新日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(customer.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/customers/${customer.id}/edit`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>得意先を編集</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? '削除中...' : '得意先を削除'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <RequireAuth>
      <CustomerDetailContent />
    </RequireAuth>
  );
}