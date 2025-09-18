'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building, 
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Package,
  ToggleLeft
} from 'lucide-react';
import Link from 'next/link';

function NewSupplierContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    tel: '',
    fax: '',
    email: '',
    postalCode: '',
    address: '',
    address2: '',
    paymentTerms: '',
    comment: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期データの設定
  useEffect(() => {
    const generateSupplierCode = () => {
      // 既存の仕入先数をベースに次の仕入先コードを生成
      const supplierCount = 6; // モックデータとして6件目の想定
      return `SUP${String(supplierCount).padStart(3, '0')}`;
    };

    setFormData(prev => ({
      ...prev,
      code: generateSupplierCode(),
    }));
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

    // 仕入先コードのバリデーション
    if (!formData.code.trim()) {
      newErrors.code = '仕入先コードは必須です';
    } else if (!/^[A-Z]{3}[0-9]{3}$/.test(formData.code.trim())) {
      newErrors.code = '仕入先コードの形式が正しくありません（例：SUP001）';
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
      // 仕入先データの作成
      const newSupplier = await prisma.supplier.create({
        data: {
          code: formData.code,
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          tel: formData.tel || undefined,
          fax: formData.fax || undefined,
          email: formData.email || undefined,
          postalCode: formData.postalCode || undefined,
          address: formData.address || undefined,
          address2: formData.address2 || undefined,
          paymentTerms: formData.paymentTerms || undefined,
          comment: formData.comment || undefined,
          isActive: formData.isActive,
        },
      });

      console.log('仕入先を作成しました:', newSupplier);
      router.push('/suppliers');
      
    } catch (error) {
      console.error('仕入先作成エラー:', error);
      alert('仕入先の登録に失敗しました。');
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
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">新規仕入先登録</h1>
                <p className="text-xs text-gray-500">新しい仕入先情報を登録</p>
              </div>
            </div>
            <Link
              href="/suppliers"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>仕入先一覧に戻る</span>
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
            { label: '仕入先管理', href: '/suppliers' },
            { label: '新規仕入先登録', current: true }
          ]}
          className="mb-6"
        />
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 仕入先コード */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    仕入先コード *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SUP001"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                {/* 取引状況 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ToggleLeft className="w-4 h-4 inline mr-1" />
                    取引状況
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">取引中</option>
                    <option value="false">取引停止</option>
                  </select>
                </div>

                {/* 会社名 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    会社名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="防災機器株式会社"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                    placeholder="鈴木一郎"
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
                    placeholder="101-0001"
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                {/* 空のスペース */}
                <div></div>

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
                    placeholder="東京都千代田区神田神保町1-1-1"
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
                    placeholder="防災ビル3F"
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
                    placeholder="03-1111-2222"
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
                    placeholder="03-1111-2223"
                  />
                  {errors.fax && <p className="text-red-500 text-sm mt-1">{errors.fax}</p>}
                </div>

                {/* メールアドレス */}
                <div className="md:col-span-2">
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
                    placeholder="suzuki@bousai-kiki.co.jp"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* 取引情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                取引情報
              </h2>
              <div className="space-y-6">
                {/* 支払条件 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    支払条件
                  </label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="月末締め翌月末払い"
                  />
                  <p className="text-sm text-gray-500 mt-1">締日や支払日などの支払条件</p>
                </div>

                {/* コメント */}
                <div>
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
                href="/suppliers"
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
                <span>{loading ? '登録中...' : '仕入先を登録'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewSupplierPage() {
  return (
    <RequireAuth>
      <NewSupplierContent />
    </RequireAuth>
  );
}