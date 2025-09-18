'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building2, 
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Calendar
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

function EditCustomerContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name2: '',
    honorific: '御中',
    postalCode: '',
    address: '',
    address2: '',
    tel: '',
    fax: '',
    email: '',
    emailCc: '',
    contactPerson: '',
    closingDate: '',
    paymentDate: '',
    comment: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期データの取得
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
        
        if (!customerData) {
          router.push('/customers');
          return;
        }

        setOriginalCustomer(customerData);
        
        // フォームデータの初期化
        setFormData({
          code: customerData.code,
          name: customerData.name,
          name2: customerData.name2 || '',
          honorific: customerData.honorific,
          postalCode: customerData.postalCode || '',
          address: customerData.address || '',
          address2: customerData.address2 || '',
          tel: customerData.tel || '',
          fax: customerData.fax || '',
          email: customerData.email || '',
          emailCc: customerData.emailCc || '',
          contactPerson: customerData.contactPerson || '',
          closingDate: customerData.closingDate?.toString() || '',
          paymentDate: customerData.paymentDate?.toString() || '',
          comment: customerData.comment || '',
        });

      } catch (error) {
        console.error('得意先データの取得エラー:', error);
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, router]);

  // フォーム入力の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      newErrors.code = '得意先コードは必須です';
    }
    if (!formData.name.trim()) {
      newErrors.name = '会社名は必須です';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }
    if (formData.emailCc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailCc)) {
      newErrors.emailCc = 'CCメールアドレスの形式が正しくありません';
    }
    if (formData.postalCode && !/^\d{3}-\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '郵便番号は「123-4567」の形式で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !originalCustomer) {
      return;
    }

    setSaving(true);
    try {
      // 得意先データの更新
      const updatedCustomer = await prisma.customer.update({
        where: { id: originalCustomer.id },
        data: {
          code: formData.code,
          name: formData.name,
          name2: formData.name2 || undefined,
          honorific: formData.honorific,
          postalCode: formData.postalCode || undefined,
          address: formData.address || undefined,
          address2: formData.address2 || undefined,
          tel: formData.tel || undefined,
          fax: formData.fax || undefined,
          email: formData.email || undefined,
          emailCc: formData.emailCc || undefined,
          contactPerson: formData.contactPerson || undefined,
          closingDate: formData.closingDate ? parseInt(formData.closingDate) : undefined,
          paymentDate: formData.paymentDate ? parseInt(formData.paymentDate) : undefined,
          comment: formData.comment || undefined,
        },
      });

      console.log('得意先を更新しました:', updatedCustomer);
      router.push(`/customers/${originalCustomer.id}`);
      
    } catch (error) {
      console.error('得意先更新エラー:', error);
      alert('得意先の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    const hasChanges = originalCustomer && (
      formData.code !== originalCustomer.code ||
      formData.name !== originalCustomer.name ||
      formData.name2 !== (originalCustomer.name2 || '') ||
      formData.honorific !== originalCustomer.honorific ||
      formData.postalCode !== (originalCustomer.postalCode || '') ||
      formData.address !== (originalCustomer.address || '') ||
      formData.address2 !== (originalCustomer.address2 || '') ||
      formData.tel !== (originalCustomer.tel || '') ||
      formData.fax !== (originalCustomer.fax || '') ||
      formData.email !== (originalCustomer.email || '') ||
      formData.emailCc !== (originalCustomer.emailCc || '') ||
      formData.contactPerson !== (originalCustomer.contactPerson || '') ||
      formData.closingDate !== (originalCustomer.closingDate?.toString() || '') ||
      formData.paymentDate !== (originalCustomer.paymentDate?.toString() || '') ||
      formData.comment !== (originalCustomer.comment || '')
    );

    if (hasChanges) {
      const confirmed = window.confirm('変更が保存されていません。編集を破棄してもよろしいですか？');
      if (!confirmed) return;
    }

    router.push(`/customers/${customerId}`);
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

  if (!originalCustomer) {
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
                <h1 className="text-xl font-bold text-gray-900">得意先編集</h1>
                <p className="text-xs text-gray-500">{originalCustomer.code} - {originalCustomer.name}</p>
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
            { label: '得意先管理', href: '/customers' },
            { label: `${originalCustomer.code} - ${originalCustomer.name}`, href: `/customers/${originalCustomer.id}` },
            { label: '編集', current: true }
          ]}
          className="mb-6"
        />
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 得意先コード */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    得意先コード *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CUST001"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                {/* 敬称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    敬称
                  </label>
                  <select
                    name="honorific"
                    value={formData.honorific}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="御中">御中</option>
                    <option value="様">様</option>
                    <option value="">なし</option>
                  </select>
                </div>

                {/* 会社名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    会社名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="株式会社サンプル"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* 会社名2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名（略称）
                  </label>
                  <input
                    type="text"
                    name="name2"
                    value={formData.name2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="サンプル"
                  />
                </div>
              </div>
            </div>

            {/* 連絡先情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                連絡先情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 郵便番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    郵便番号
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123-4567"
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                {/* 担当者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    担当者
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="山田太郎"
                  />
                </div>

                {/* 住所 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="東京都渋谷区サンプル1-2-3"
                  />
                </div>

                {/* 住所2 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    建物名・部屋番号
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="サンプルビル5F"
                  />
                </div>

                {/* 電話番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    電話番号
                  </label>
                  <input
                    type="text"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03-1234-5678"
                  />
                </div>

                {/* FAX番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAX番号
                  </label>
                  <input
                    type="text"
                    name="fax"
                    value={formData.fax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03-1234-5679"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sample@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* CCメールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    CCメールアドレス
                  </label>
                  <input
                    type="email"
                    name="emailCc"
                    value={formData.emailCc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="manager@example.com"
                  />
                  {errors.emailCc && <p className="text-red-500 text-sm mt-1">{errors.emailCc}</p>}
                </div>
              </div>
            </div>

            {/* 取引情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                取引情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 締日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    締日
                  </label>
                  <input
                    type="number"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                    min="1"
                    max="31"
                  />
                  <p className="text-sm text-gray-500 mt-1">毎月の締日（1〜31）</p>
                </div>

                {/* 支払日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支払日
                  </label>
                  <input
                    type="number"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                    min="1"
                    max="31"
                  />
                  <p className="text-sm text-gray-500 mt-1">毎月の支払日（1〜31）</p>
                </div>

                {/* コメント */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    コメント
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="特記事項やメモを入力してください"
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

export default function EditCustomerPage() {
  return (
    <RequireAuth>
      <EditCustomerContent />
    </RequireAuth>
  );
}