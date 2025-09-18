'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  User, 
  Save,
  X,
  Hash,
  UserCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

interface Staff {
  id: string;
  code: string;
  name: string;
  salesCommission: boolean;
  inspectionApproval: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function EditStaffContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalStaff, setOriginalStaff] = useState<Staff | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    salesCommission: false,
    inspectionApproval: 'なし',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期データの取得
  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/staff/${staffId}`);
        
        if (response.ok) {
          const staff = await response.json();
          setOriginalStaff(staff);
          setFormData({
            code: staff.code || '',
            name: staff.name || '',
            salesCommission: staff.salesCommission || false,
            inspectionApproval: staff.inspectionApproval || 'なし',
            isActive: staff.isActive !== undefined ? staff.isActive : true,
          });
        } else {
          console.error('担当者データの取得に失敗');
          alert('担当者データの取得に失敗しました');
          router.push('/staff');
        }
      } catch (error) {
        console.error('担当者データ取得エラー:', error);
        alert('担当者データの取得に失敗しました');
        router.push('/staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [staffId, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = '担当者コードは必須です';
    }

    if (!formData.name.trim()) {
      newErrors.name = '担当者名は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('担当者情報を更新しました');
        router.push('/staff');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const breadcrumbItems = [
    { label: 'ホーム', href: '/dashboard' },
    { label: '担当者管理', href: '/staff' },
    { label: originalStaff?.name || '担当者編集', href: `/staff/${staffId}` },
    { label: '編集', href: '#' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">担当者データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow">
          {/* ヘッダー */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">担当者情報編集</h1>
                  <p className="text-sm text-gray-600">{originalStaff?.name}の情報を編集します</p>
                </div>
              </div>
              <Link
                href="/staff"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>キャンセル</span>
              </Link>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 担当者コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  担当者コード
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: STAFF001"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              {/* 担当者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  担当者名
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 田中太郎"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* 売上・集金権限 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  売上・集金権限
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salesCommission"
                      checked={formData.salesCommission === true}
                      onChange={() => handleInputChange('salesCommission', true)}
                      className="mr-2"
                    />
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    あり
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salesCommission"
                      checked={formData.salesCommission === false}
                      onChange={() => handleInputChange('salesCommission', false)}
                      className="mr-2"
                    />
                    <XCircle className="w-4 h-4 text-gray-400 mr-1" />
                    なし
                  </label>
                </div>
              </div>

              {/* 見積承認権限 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  見積承認権限
                </label>
                <select
                  value={formData.inspectionApproval}
                  onChange={(e) => handleInputChange('inspectionApproval', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="なし">なし</option>
                  <option value="主任">主任</option>
                  <option value="係長">係長</option>
                  <option value="課長">課長</option>
                  <option value="部長">部長</option>
                  <option value="専務">専務</option>
                  <option value="社長">社長</option>
                </select>
              </div>

              {/* 在職状況 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="w-4 h-4 inline mr-1" />
                  在職状況
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => handleInputChange('isActive', true)}
                      className="mr-2"
                    />
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    在職中
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => handleInputChange('isActive', false)}
                      className="mr-2"
                    />
                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                    退職済
                  </label>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/staff"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function EditStaffPage() {
  return (
    <RequireAuth>
      <EditStaffContent />
    </RequireAuth>
  );
}