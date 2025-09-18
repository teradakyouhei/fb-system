'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFilterState } from '@/hooks/useFilterState';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import { prisma } from '@/lib/prisma';
import { 
  User, 
  Plus,
  Search,
  Eye,
  Edit,
  Phone,
  Mail,
  Briefcase,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCcw,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';

interface Staff {
  id: string;
  code: string;
  name: string;
  salesCommission: boolean;
  inspectionApproval: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function StaffContent() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // フィルター状態（URL・ローカルストレージ対応）
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFiltersCount
  } = useFilterState({
    defaultFilters: {
      searchTerm: '',
      inspectionApprovalFilter: '',
      salesCommissionFilter: '',
    },
    storageKey: 'staff-filters',
  });

  // 担当者データの取得
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/staff?searchTerm=${encodeURIComponent(filters.searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          // Date型に変換
          const staffData = data.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }));
          setStaff(staffData);
        } else {
          console.error('担当者データの取得に失敗しました');
        }
      } catch (error) {
        console.error('担当者データの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [filters.searchTerm]);

  // 利用可能な見積承認リストの作成
  const availableApprovals = useMemo(() => {
    const approvals = staff.map(s => s.inspectionApproval).filter(Boolean) as string[];
    return [...new Set(approvals)].sort();
  }, [staff]);


  // フィルタリング
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      // キーワード検索（APIで処理済みなのでサーバー側フィルター）
      const matchesSearch = true;
      
      // 見積承認フィルター
      const matchesApproval = !filters.inspectionApprovalFilter || member.inspectionApproval === filters.inspectionApprovalFilter;
      
      // 売上・集金フィルター
      const matchesSalesCommission = !filters.salesCommissionFilter || 
        (filters.salesCommissionFilter === 'true' && member.salesCommission) ||
        (filters.salesCommissionFilter === 'false' && !member.salesCommission);
      
      return matchesSearch && matchesApproval && matchesSalesCommission;
    });
  }, [staff, filters]);

  // 在職状況別の色
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
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">担当者管理</h1>
                <p className="text-xs text-gray-500">担当者情報の一覧・管理</p>
              </div>
            </div>
            
            {/* グローバル検索バー */}
            <div className="flex-1 max-w-lg mx-8">
              <GlobalSearchBar />
            </div>
            
            <Link
              href="/staff/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規担当者</span>
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
            { label: '担当者管理', current: true }
          ]}
          className="mb-6"
        />

        {/* 検索・フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          {/* 基本検索エリア */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* メイン検索 */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="担当者コード、氏名、部署、役職、電話番号、メールアドレスで検索..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 高度検索トグル */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>高度検索</span>
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* 結果件数とクリア */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{filteredStaff.length}件 / {staff.length}件</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    <span>クリア</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 高度検索エリア */}
          {showAdvancedFilters && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 部署フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
                  <select
                    value={filters.departmentFilter}
                    onChange={(e) => updateFilter('departmentFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての部署</option>
                    {availableDepartments.map(department => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 役職フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
                  <select
                    value={filters.positionFilter}
                    onChange={(e) => updateFilter('positionFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての役職</option>
                    {availablePositions.map(position => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 在職状況フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">在職状況</label>
                  <select
                    value={filters.statusFilter}
                    onChange={(e) => updateFilter('statusFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">すべての在職状況</option>
                    <option value="active">在職中</option>
                    <option value="inactive">退職済</option>
                  </select>
                </div>
              </div>

              {/* 適用されているフィルターの表示 */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {filters.departmentFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        部署: {filters.departmentFilter}
                        <button
                          onClick={() => updateFilter('departmentFilter', '')}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.positionFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        役職: {filters.positionFilter}
                        <button
                          onClick={() => updateFilter('positionFilter', '')}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.statusFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        在職状況: {filters.statusFilter === 'active' ? '在職中' : '退職済'}
                        <button
                          onClick={() => updateFilter('statusFilter', '')}
                          className="ml-2 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 担当者一覧 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">
              {activeFiltersCount > 0 ? '条件に合う担当者が見つかりませんでした' : '担当者データがありません'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/staff/${member.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {member.name}
                      </Link>
                      <p className="text-sm text-gray-500">{member.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/staff/${member.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/staff/${member.id}/edit`}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <div className="space-y-3">
                    {/* 部署・役職 */}
                    {(member.department || member.position) && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">
                          {member.department && member.position
                            ? `${member.department} - ${member.position}`
                            : member.department || member.position
                          }
                        </span>
                      </div>
                    )}

                    {/* 電話番号 */}
                    {member.tel && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{member.tel}</span>
                      </div>
                    )}

                    {/* メールアドレス */}
                    {member.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 truncate">{member.email}</span>
                      </div>
                    )}

                    {/* 入社日 */}
                    {member.hireDate && (
                      <div className="flex items-center text-sm text-gray-500">
                        <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                        <span>入社日: {formatDate(member.hireDate)}</span>
                      </div>
                    )}

                    {/* 在職状況 */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(member.isActive)}`}>
                        {member.isActive ? '在職中' : '退職済'}
                      </span>
                    </div>

                    {/* コメント */}
                    {member.comment && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{member.comment}</p>
                      </div>
                    )}

                    {/* 更新日 */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        最終更新: {formatDate(member.updatedAt)}
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

export default function StaffPage() {
  return (
    <RequireAuth>
      <StaffContent />
    </RequireAuth>
  );
}