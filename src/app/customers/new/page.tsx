'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building2, 
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

function NewCustomerContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
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

  // 初期データの設定
  useEffect(() => {
    const generateCustomerCode = () => {
      // 既存の顧客数をベースに次の得意先コードを生成
      const customerCount = 5; // モックデータとして5件目の想定
      return `CUST${String(customerCount).padStart(3, '0')}`;
    };

    setFormData(prev => ({
      ...prev,
      code: generateCustomerCode(),
    }));
  }, []);

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

    // 得意先コードのバリデーション
    if (!formData.code.trim()) {
      newErrors.code = '得意先コードは必須です';
    } else if (!/^[A-Z]{4}[0-9]{3}$/.test(formData.code.trim())) {
      newErrors.code = '得意先コードの形式が正しくありません（例：CUST001）';
    }

    // 会社名のバリデーション
    if (!formData.name.trim()) {
      newErrors.name = '会社名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '会社名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '会社名は100文字以内で入力してください';
    }

    // メールアドレスのバリデーション
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    // CCメールアドレスのバリデーション
    if (formData.emailCc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailCc)) {
      newErrors.emailCc = 'CCメールアドレスの形式が正しくありません';
    }

    // 郵便番号のバリデーション
    if (formData.postalCode && !/^\d{3}-\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '郵便番号は「123-4567」の形式で入力してください';
    }

    // 電話番号のバリデーション
    if (formData.tel && !/^[0-9-]+$/.test(formData.tel)) {
      newErrors.tel = '電話番号は数字とハイフンのみで入力してください';
    }

    // FAX番号のバリデーション
    if (formData.fax && !/^[0-9-]+$/.test(formData.fax)) {
      newErrors.fax = 'FAX番号は数字とハイフンのみで入力してください';
    }

    // 締日のバリデーション
    if (formData.closingDate) {
      const closingDay = parseInt(formData.closingDate);
      if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
        newErrors.closingDate = '締日は1〜31の数値で入力してください';
      }
    }

    // 支払日のバリデーション
    if (formData.paymentDate) {
      const paymentDay = parseInt(formData.paymentDate);
      if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
        newErrors.paymentDate = '支払日は1〜31の数値で入力してください';
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
      // 得意先データの作成
      const newCustomer = await prisma.customer.create({
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

      console.log('得意先を作成しました:', newCustomer);
      router.push('/customers');
      
    } catch (error) {
      console.error('得意先作成エラー:', error);
      alert('得意先の登録に失敗しました。');
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
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">新規得意先登録</h1>
                <p className="text-xs text-gray-500">新しい得意先情報を登録</p>
              </div>
            </div>
            <Link
              href="/customers"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>得意先一覧に戻る</span>
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
            { label: '得意先管理', href: '/customers' },
            { label: '新規得意先登録', current: true }
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
                  {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
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
                  {errors.fax && <p className="text-red-500 text-sm mt-1">{errors.fax}</p>}
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
                  {errors.closingDate && <p className="text-red-500 text-sm mt-1">{errors.closingDate}</p>}
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
                  {errors.paymentDate && <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>}
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
              <Link
                href="/customers"
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
                <span>{loading ? '登録中...' : '得意先を登録'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <RequireAuth>
      <NewCustomerContent />
    </RequireAuth>
  );
}