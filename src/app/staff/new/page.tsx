'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  User, 
  Save,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Hash,
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

function NewStaffContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    tel: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    isActive: true,
    comment: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期データの設定
  useEffect(() => {
    const generateStaffCode = () => {
      // 既存の担当者数をベースに次の担当者コードを生成
      const staffCount = 5; // モックデータとして5件目の想定
      return `STAFF${String(staffCount).padStart(3, '0')}`;
    };

    setFormData(prev => ({
      ...prev,
      code: generateStaffCode(),
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

    // 担当者コードのバリデーション
    if (!formData.code.trim()) {
      newErrors.code = '担当者コードは必須です';
    } else if (!/^[A-Z]{5}[0-9]{3}$/.test(formData.code.trim())) {
      newErrors.code = '担当者コードの形式が正しくありません（例：STAFF001）';
    }

    // 氏名のバリデーション
    if (!formData.name.trim()) {
      newErrors.name = '氏名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '氏名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '氏名は50文字以内で入力してください';
    }

    // メールアドレスのバリデーション
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    // 電話番号のバリデーション
    if (formData.tel && !/^[0-9-]+$/.test(formData.tel)) {
      newErrors.tel = '電話番号は数字とハイフンのみで入力してください';
    }

    // 入社日のバリデーション
    if (!formData.hireDate) {
      newErrors.hireDate = '入社日は必須です';
    } else {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (hireDate > today) {
        newErrors.hireDate = '入社日は今日以前の日付を選択してください';
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
      // 担当者データの作成
      const newStaff = await prisma.staff.create({
        data: {
          code: formData.code,
          name: formData.name,
          email: formData.email || undefined,
          tel: formData.tel || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
          hireDate: new Date(formData.hireDate),
          isActive: formData.isActive,
          comment: formData.comment || undefined,
        },
      });

      console.log('担当者を作成しました:', newStaff);
      router.push('/staff');
      
    } catch (error) {
      console.error('担当者作成エラー:', error);
      alert('担当者の登録に失敗しました。');
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
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">新規担当者登録</h1>
                <p className="text-xs text-gray-500">新しい担当者情報を登録</p>
              </div>
            </div>
            <Link
              href="/staff"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>担当者一覧に戻る</span>
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
            { label: '担当者管理', href: '/staff' },
            { label: '新規担当者登録', current: true }
          ]}
          className="mb-6"
        />
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* 基本情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 担当者コード */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    担当者コード *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="STAFF001"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                {/* 在職状況 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    在職状況
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">在職中</option>
                    <option value="false">退職済</option>
                  </select>
                </div>

                {/* 氏名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    氏名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="田中太郎"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* 入社日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    入社日 *
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
                </div>
              </div>
            </div>

            {/* 組織情報 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                組織情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 部署 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="営業部"
                  />
                </div>

                {/* 役職 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="営業担当"
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
                    placeholder="080-1234-5678"
                  />
                  {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
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
                    placeholder="tanaka@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* その他 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                その他
              </h2>
              <div>
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
                href="/staff"
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
                <span>{loading ? '登録中...' : '担当者を登録'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewStaffPage() {
  return (
    <RequireAuth>
      <NewStaffContent />
    </RequireAuth>
  );
}