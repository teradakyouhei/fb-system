'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  Building, 
  Save,
  X,
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

function EditSupplierContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSupplier, setOriginalSupplier] = useState<Supplier | null>(null);
  
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

  // 初期データの取得
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
        
        if (!supplierData) {
          router.push('/suppliers');
          return;
        }

        setOriginalSupplier(supplierData);
        
        // フォームデータの初期化
        setFormData({
          code: supplierData.code,
          name: supplierData.name,
          contactPerson: supplierData.contactPerson || '',
          tel: supplierData.tel || '',
          fax: supplierData.fax || '',
          email: supplierData.email || '',
          postalCode: supplierData.postalCode || '',
          address: supplierData.address || '',
          address2: supplierData.address2 || '',
          paymentTerms: supplierData.paymentTerms || '',
          comment: supplierData.comment || '',
          isActive: supplierData.isActive,
        });

      } catch (error) {
        console.error('仕入先データの取得エラー:', error);
        router.push('/suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId, router]);

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

    if (!formData.code.trim()) {
      newErrors.code = '仕入先コードは必須です';
    }
    if (!formData.name.trim()) {
      newErrors.name = '会社名は必須です';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
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
    
    if (!validateForm() || !originalSupplier) {
      return;
    }

    setSaving(true);
    try {
      // 仕入先データの更新
      const updatedSupplier = await prisma.supplier.update({
        where: { id: originalSupplier.id },
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

      console.log('仕入先を更新しました:', updatedSupplier);
      router.push(`/suppliers/${originalSupplier.id}`);
      
    } catch (error) {
      console.error('仕入先更新エラー:', error);
      alert('仕入先の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    const hasChanges = originalSupplier && (
      formData.code !== originalSupplier.code ||
      formData.name !== originalSupplier.name ||
      formData.contactPerson !== (originalSupplier.contactPerson || '') ||
      formData.tel !== (originalSupplier.tel || '') ||
      formData.fax !== (originalSupplier.fax || '') ||
      formData.email !== (originalSupplier.email || '') ||
      formData.postalCode !== (originalSupplier.postalCode || '') ||
      formData.address !== (originalSupplier.address || '') ||
      formData.address2 !== (originalSupplier.address2 || '') ||
      formData.paymentTerms !== (originalSupplier.paymentTerms || '') ||
      formData.comment !== (originalSupplier.comment || '') ||
      formData.isActive !== originalSupplier.isActive
    );

    if (hasChanges) {
      const confirmed = window.confirm('変更が保存されていません。編集を破棄してもよろしいですか？');
      if (!confirmed) return;
    }

    router.push(`/suppliers/${supplierId}`);
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

  if (!originalSupplier) {
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
                <h1 className="text-xl font-bold text-gray-900">仕入先編集</h1>
                <p className="text-xs text-gray-500">{originalSupplier.code} - {originalSupplier.name}</p>
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
            { label: '仕入先管理', href: '/suppliers' },
            { label: `${originalSupplier.code} - ${originalSupplier.name}`, href: `/suppliers/${originalSupplier.id}` },
            { label: '編集', current: true }
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

export default function EditSupplierPage() {
  return (
    <RequireAuth>
      <EditSupplierContent />
    </RequireAuth>
  );
}