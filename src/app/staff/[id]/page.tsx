'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { 
  User, 
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Hash,
  FileText,
  Calendar,
  UserCheck,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Staff {
  id: string;
  code: string;
  name: string;
  email?: string;
  tel?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  isActive: boolean;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

function StaffDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 担当者データの取得
  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) return;

      try {
        setLoading(true);
        
        // モック実装の制限により、直接データを設定
        const mockStaff = [
          {
            id: 'staff-1',
            code: 'STAFF001',
            name: '田中太郎',
            email: 'tanaka@company.com',
            tel: '080-1234-5678',
            department: '営業部',
            position: '営業担当',
            hireDate: new Date('2020-04-01'),
            isActive: true,
            comment: 'メイン営業担当者',
            createdAt: new Date('2020-04-01'),
            updatedAt: new Date('2024-08-30'),
          },
          {
            id: 'staff-2',
            code: 'STAFF002',
            name: '佐藤花子',
            email: 'sato@company.com',
            tel: '080-2345-6789',
            department: '技術部',
            position: '技術者',
            hireDate: new Date('2021-07-15'),
            isActive: true,
            comment: '防災設備専門',
            createdAt: new Date('2021-07-15'),
            updatedAt: new Date('2024-08-25'),
          },
          {
            id: 'staff-3',
            code: 'STAFF003',
            name: '山田次郎',
            email: 'yamada@company.com',
            tel: '080-3456-7890',
            department: '管理部',
            position: '事務',
            hireDate: new Date('2019-10-01'),
            isActive: true,
            comment: '経理・総務担当',
            createdAt: new Date('2019-10-01'),
            updatedAt: new Date('2024-08-20'),
          },
          {
            id: 'staff-4',
            code: 'STAFF004',
            name: '高橋三郎',
            email: '',
            tel: '080-4567-8901',
            department: '営業部',
            position: 'アシスタント',
            hireDate: new Date('2023-01-16'),
            isActive: false,
            comment: '退職済み',
            createdAt: new Date('2023-01-16'),
            updatedAt: new Date('2024-03-31'),
          },
        ];

        const staffData = mockStaff.find(s => s.id === staffId);
        setStaff(staffData || null);
      } catch (error) {
        console.error('担当者データの取得エラー:', error);
        router.push('/staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [staffId, router]);

  // 担当者削除
  const handleDelete = async () => {
    if (!staff) return;

    const confirmed = window.confirm(`担当者「${staff.name}」を削除してもよろしいですか？\nこの操作は取り消せません。`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await prisma.staff.delete({
        where: { id: staff.id },
      });

      alert('担当者を削除しました');
      router.push('/staff');
    } catch (error) {
      console.error('担当者削除エラー:', error);
      alert('担当者の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  // 在職状況別の色
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 日付のフォーマット
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
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

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">担当者が見つかりませんでした</div>
          <Link href="/staff" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            担当者一覧に戻る
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
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">担当者詳細</h1>
                <p className="text-xs text-gray-500">{staff.code} - {staff.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/staff/${staff.id}/edit`}
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
                href="/staff"
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
            { label: '担当者管理', href: '/staff' },
            { label: `${staff.code} - ${staff.name}`, current: true }
          ]}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">担当者コード</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-gray-400" />
                    {staff.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">在職状況</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(staff.isActive)}`}>
                    {staff.isActive ? '在職中' : '退職済'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">氏名</label>
                  <p className="text-lg font-semibold text-gray-900">{staff.name}</p>
                </div>
                {staff.hireDate && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">入社日</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(staff.hireDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 組織情報 */}
            {(staff.department || staff.position) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  組織情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {staff.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">部署</label>
                      <p className="text-gray-900">{staff.department}</p>
                    </div>
                  )}
                  {staff.position && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">役職</label>
                      <p className="text-gray-900">{staff.position}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 連絡先情報 */}
            {(staff.tel || staff.email) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  連絡先情報
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.tel && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                        <p className="text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {staff.tel}
                        </p>
                      </div>
                    )}
                    {staff.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                        <p className="text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="truncate">{staff.email}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* コメント */}
            {staff.comment && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  コメント
                </h2>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{staff.comment}</p>
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
                  <p className="text-gray-900 text-sm">{formatDateTime(staff.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">更新日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(staff.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/staff/${staff.id}/edit`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>担当者を編集</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? '削除中...' : '担当者を削除'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StaffDetailPage() {
  return (
    <RequireAuth>
      <StaffDetailContent />
    </RequireAuth>
  );
}