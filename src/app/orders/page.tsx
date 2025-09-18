'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import OrderTable from '@/components/orders/OrderTable';
import Pagination from '@/components/orders/Pagination';
import { firestoreOrderStore } from '@/lib/firestoreStore';
import { 
  OrderListItem, 
  OrderListFilters, 
  OrderListSort,
  PaginationConfig,
  DEFAULT_COLUMNS,
  SyncStatus
} from '@/types/orderList';
import { 
  Building2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  RefreshCcw,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<OrderListSort>({ field: 'registeredAt', direction: 'desc' });
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0
  });
  
  // フィルター状態
  const [filters, setFilters] = useState<OrderListFilters>({
    searchTerm: '',
    statusFilter: { isOrdered: undefined, isConfirmed: undefined, isReceived: undefined },
    assigneeFilter: '',
    clientFilter: '',
    estimateDateFrom: '',
    estimateDateTo: '',
    orderDateFrom: '',
    orderDateTo: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    amountMin: '',
    amountMax: '',
    syncStatusFilter: ''
  });

  // 受注データの取得
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // 初回起動時にlocalStorageからFirestoreへの移行をチェック
        const firestoreOrders = await firestoreOrderStore.getOrders();
        if (firestoreOrders.length === 0) {
          // Firestoreにデータがない場合、localStorageから移行
          const migrationSuccess = await firestoreOrderStore.migrateFromLocalStorage();
          if (migrationSuccess) {
            console.log('localStorageからFirestoreへのデータ移行が完了しました');
            // 移行後のデータを取得
            const migratedOrders = await firestoreOrderStore.getOrders();
            setOrders(migratedOrders);
            setPagination(prev => ({ ...prev, totalItems: migratedOrders.length }));
          } else {
            setOrders([]);
            setPagination(prev => ({ ...prev, totalItems: 0 }));
          }
        } else {
          // Firestoreにデータがある場合はそのまま使用
          setOrders(firestoreOrders);
          setPagination(prev => ({ ...prev, totalItems: firestoreOrders.length }));
        }
      } catch (error) {
        console.error('受注データの取得エラー:', error);
        setOrders([]);
        setPagination(prev => ({ ...prev, totalItems: 0 }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 利用可能な得意先・担当者リストの作成
  const availableClients = useMemo(() => {
    const uniqueClients = [...new Set(orders.map(order => order.client))];
    return uniqueClients.filter(Boolean);
  }, [orders]);

  const availableAssignees = useMemo(() => {
    const uniqueAssignees = [...new Set(orders.map(order => order.assignee))];
    return uniqueAssignees.filter(Boolean);
  }, [orders]);

  const availableSyncStatuses: SyncStatus[] = ['完了', '待機中', 'エラー', '未実行'];

  // フィルタリングとページネーション
  const { filteredOrders, paginatedOrders, totalPages } = useMemo(() => {
    const filtered = orders.filter(order => {
      // キーワード検索
      const matchesSearch = !filters.searchTerm || 
        order.orderNo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.client.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.projectName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.assignee.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // ステータスフィルター
      const matchesStatus = 
        (filters.statusFilter.isOrdered === undefined || order.isOrdered === filters.statusFilter.isOrdered) &&
        (filters.statusFilter.isConfirmed === undefined || order.isConfirmed === filters.statusFilter.isConfirmed) &&
        (filters.statusFilter.isReceived === undefined || order.isReceived === filters.statusFilter.isReceived);
      
      // 得意先フィルター
      const matchesClient = !filters.clientFilter || order.client === filters.clientFilter;
      
      // 担当者フィルター
      const matchesAssignee = !filters.assigneeFilter || order.assignee === filters.assigneeFilter;
      
      // 見積日範囲フィルター
      const matchesEstimateDate = (!filters.estimateDateFrom || new Date(order.estimateDate) >= new Date(filters.estimateDateFrom)) &&
                                  (!filters.estimateDateTo || new Date(order.estimateDate) <= new Date(filters.estimateDateTo));
      
      // 受注日範囲フィルター
      const matchesOrderDate = (!filters.orderDateFrom || new Date(order.orderDate) >= new Date(filters.orderDateFrom)) &&
                              (!filters.orderDateTo || new Date(order.orderDate) <= new Date(filters.orderDateTo));
      
      // 納期範囲フィルター
      const matchesDeliveryDate = (!filters.deliveryDateFrom || new Date(order.deliveryDate) >= new Date(filters.deliveryDateFrom)) &&
                                 (!filters.deliveryDateTo || new Date(order.deliveryDate) <= new Date(filters.deliveryDateTo));
      
      // 金額範囲フィルター
      const matchesAmount = (!filters.amountMin || order.amount >= parseInt(filters.amountMin)) &&
                           (!filters.amountMax || order.amount <= parseInt(filters.amountMax));
      
      // 同期ステータスフィルター
      const matchesSyncStatus = !filters.syncStatusFilter || order.syncStatus === filters.syncStatusFilter;
      
      return matchesSearch && matchesStatus && matchesClient && matchesAssignee && 
             matchesEstimateDate && matchesOrderDate && matchesDeliveryDate && 
             matchesAmount && matchesSyncStatus;
    });

    // ページネーション
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);

    return {
      filteredOrders: filtered,
      paginatedOrders: paginated,
      totalPages
    };
  }, [orders, filters, pagination.currentPage, pagination.itemsPerPage]);

  // ハンドラー関数
  const handleSort = (newSort: OrderListSort) => {
    setSort(newSort);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleCopy = (order: OrderListItem) => {
    // コピー処理の実装
    console.log('コピー:', order);
  };

  const handleDelete = (id: string) => {
    // 削除処理の実装
    console.log('削除:', id);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      console.log('一括削除:', selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExport = () => {
    console.log('エクスポート:', filteredOrders);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 // ページサイズ変更時は最初のページに戻る
    }));
  };

  const updateFilter = (key: keyof OrderListFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: { isOrdered: undefined, isConfirmed: undefined, isReceived: undefined },
      assigneeFilter: '',
      clientFilter: '',
      estimateDateFrom: '',
      estimateDateTo: '',
      orderDateFrom: '',
      orderDateTo: '',
      deliveryDateFrom: '',
      deliveryDateTo: '',
      amountMin: '',
      amountMax: '',
      syncStatusFilter: ''
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.statusFilter.isOrdered !== undefined) count++;
    if (filters.statusFilter.isConfirmed !== undefined) count++;
    if (filters.statusFilter.isReceived !== undefined) count++;
    if (filters.assigneeFilter) count++;
    if (filters.clientFilter) count++;
    if (filters.estimateDateFrom || filters.estimateDateTo) count++;
    if (filters.orderDateFrom || filters.orderDateTo) count++;
    if (filters.deliveryDateFrom || filters.deliveryDateTo) count++;
    if (filters.amountMin || filters.amountMax) count++;
    if (filters.syncStatusFilter) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">受注管理</h1>
                <p className="text-xs text-gray-500">受注情報の一覧・管理</p>
              </div>
            </div>
            
            {/* グローバル検索バー */}
            <div className="flex-1 max-w-lg mx-8">
              <GlobalSearchBar />
            </div>
            
            <Link
              href="/orders/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規受注</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ - 19カラム対応で幅を最大化 */}
      <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: '受注管理', current: true }
          ]}
          className="mb-6"
        />
        
        {/* 検索・フィルター・操作バー */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          {/* 基本検索エリア */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* メイン検索 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="受注NO、件名、得意先、物件名、担当者で検索..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* アクションボタン群 */}
              <div className="flex items-center space-x-2">
                {/* 高度検索トグル */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">高度検索</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* 一括削除 */}
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">削除 ({selectedIds.length})</span>
                  </button>
                )}

                {/* エクスポート */}
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">エクスポート</span>
                </button>

                {/* インポート */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">インポート</span>
                </button>
              </div>
            </div>

            {/* 結果件数とクリア */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-1" />
                <span>{filteredOrders.length}件 / {orders.length}件</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RefreshCcw className="w-3 h-3" />
                  <span>フィルターをクリア</span>
                </button>
              )}
            </div>
          </div>

          {/* 高度検索エリア */}
          {showAdvancedFilters && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {/* ステータスフィルター */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ステータス</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilter.isOrdered === true}
                        onChange={(e) => updateFilter('statusFilter', { 
                          ...filters.statusFilter, 
                          isOrdered: e.target.checked ? true : undefined 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">受注</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilter.isConfirmed === true}
                        onChange={(e) => updateFilter('statusFilter', { 
                          ...filters.statusFilter, 
                          isConfirmed: e.target.checked ? true : undefined 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">確定</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statusFilter.isReceived === true}
                        onChange={(e) => updateFilter('statusFilter', { 
                          ...filters.statusFilter, 
                          isReceived: e.target.checked ? true : undefined 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">受領</span>
                    </label>
                  </div>
                </div>

                {/* 得意先フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">得意先</label>
                  <select
                    value={filters.clientFilter}
                    onChange={(e) => updateFilter('clientFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">すべての得意先</option>
                    {availableClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>

                {/* 担当者フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">担当者</label>
                  <select
                    value={filters.assigneeFilter}
                    onChange={(e) => updateFilter('assigneeFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">すべての担当者</option>
                    {availableAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>

                {/* 同期ステータス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">同期ステータス</label>
                  <select
                    value={filters.syncStatusFilter}
                    onChange={(e) => updateFilter('syncStatusFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">すべて</option>
                    {availableSyncStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* 見積日範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">見積日（開始）</label>
                  <input
                    type="date"
                    value={filters.estimateDateFrom}
                    onChange={(e) => updateFilter('estimateDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">見積日（終了）</label>
                  <input
                    type="date"
                    value={filters.estimateDateTo}
                    onChange={(e) => updateFilter('estimateDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* 受注日範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受注日（開始）</label>
                  <input
                    type="date"
                    value={filters.orderDateFrom}
                    onChange={(e) => updateFilter('orderDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受注日（終了）</label>
                  <input
                    type="date"
                    value={filters.orderDateTo}
                    onChange={(e) => updateFilter('orderDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* 納期範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">納期（開始）</label>
                  <input
                    type="date"
                    value={filters.deliveryDateFrom}
                    onChange={(e) => updateFilter('deliveryDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">納期（終了）</label>
                  <input
                    type="date"
                    value={filters.deliveryDateTo}
                    onChange={(e) => updateFilter('deliveryDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* 金額範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金額（最小）</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.amountMin}
                    onChange={(e) => updateFilter('amountMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金額（最大）</label>
                  <input
                    type="number"
                    placeholder="999999999"
                    value={filters.amountMax}
                    onChange={(e) => updateFilter('amountMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* 適用されているフィルターの表示 */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {filters.statusFilter.isOrdered && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        受注
                        <button
                          onClick={() => updateFilter('statusFilter', { ...filters.statusFilter, isOrdered: undefined })}
                          className="ml-2 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.statusFilter.isConfirmed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        確定
                        <button
                          onClick={() => updateFilter('statusFilter', { ...filters.statusFilter, isConfirmed: undefined })}
                          className="ml-2 hover:text-green-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.statusFilter.isReceived && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        受領
                        <button
                          onClick={() => updateFilter('statusFilter', { ...filters.statusFilter, isReceived: undefined })}
                          className="ml-2 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.clientFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                        得意先: {filters.clientFilter}
                        <button
                          onClick={() => updateFilter('clientFilter', '')}
                          className="ml-2 hover:text-orange-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.assigneeFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                        担当者: {filters.assigneeFilter}
                        <button
                          onClick={() => updateFilter('assigneeFilter', '')}
                          className="ml-2 hover:text-pink-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.syncStatusFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                        同期: {filters.syncStatusFilter}
                        <button
                          onClick={() => updateFilter('syncStatusFilter', '')}
                          className="ml-2 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* デバッグ表示 - 強制リロード確認 */}
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
          <h3 className="font-bold text-red-800">🚨 【緊急】新19カラムシステム実装確認 - {new Date().toLocaleTimeString()}</h3>
          <p className="text-red-700">データ件数: {filteredOrders.length}件</p>
          <p className="text-red-700">表示件数: {paginatedOrders.length}件</p>
          <p className="text-red-700">最新データ: {filteredOrders[filteredOrders.length - 1]?.title}</p>
          <p className="text-red-700">現在時刻: {new Date().toLocaleString('ja-JP')}</p>
          <div className="mt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🔄 強制リロード
            </button>
          </div>
        </div>

        {/* 19カラム受注一覧テーブル（横スクロール対応版） */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* テーブルヘッダー */}
          <div className="overflow-x-auto" style={{minWidth: '100%'}}>
            <table className="table-fixed" style={{minWidth: '3600px'}}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500">選択</th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500">受注</th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500">確定</th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500">受領</th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500">受注NO</th>
                  <th style={{width: '300px'}} className="px-2 py-3 text-left text-xs font-medium text-gray-500">件名</th>
                  <th style={{width: '200px'}} className="px-2 py-3 text-left text-xs font-medium text-gray-500">得意先</th>
                  <th style={{width: '200px'}} className="px-2 py-3 text-left text-xs font-medium text-gray-500">物件名</th>
                  <th style={{width: '120px'}} className="px-2 py-3 text-left text-xs font-medium text-gray-500">担当者</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500">見積日</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500">受注日</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500">納品日</th>
                  <th className="w-36 px-2 py-3 text-left text-xs font-medium text-gray-500">登録日時</th>
                  <th className="w-40 px-2 py-3 text-left text-xs font-medium text-gray-500">売上伝票最新発行</th>
                  <th className="w-36 px-2 py-3 text-left text-xs font-medium text-gray-500">最新同期日時</th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500">見積承認確定日</th>
                  <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500">金額</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500">登録ユーザー</th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500">同期ステータス</th>
                  <th className="w-32 px-2 py-3 text-center text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="w-12 px-2 py-3 text-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    </td>
                    <td className="w-16 px-2 py-3 text-center">
                      {order.isOrdered ? <span className="text-green-600 text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="w-16 px-2 py-3 text-center">
                      {order.isConfirmed ? <span className="text-green-600 text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="w-16 px-2 py-3 text-center">
                      {order.isReceived ? <span className="text-green-600 text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="w-32 px-2 py-3 text-xs text-gray-900 font-mono">{order.orderNo}</td>
                    <td style={{width: '300px'}} className="px-2 py-3 text-xs text-gray-900" title={order.title}>
                      <div className="whitespace-normal break-words">{order.title}</div>
                    </td>
                    <td style={{width: '200px'}} className="px-2 py-3 text-xs text-gray-900" title={order.client}>
                      <div className="whitespace-normal break-words">{order.client}</div>
                    </td>
                    <td style={{width: '200px'}} className="px-2 py-3 text-xs text-gray-900" title={order.projectName}>
                      <div className="whitespace-normal break-words">{order.projectName}</div>
                    </td>
                    <td style={{width: '120px'}} className="px-2 py-3 text-xs text-gray-900">
                      <div className="whitespace-normal break-words">{order.assignee}</div>
                    </td>
                    <td className="w-24 px-2 py-3 text-xs text-gray-900">{order.estimateDate.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</td>
                    <td className="w-24 px-2 py-3 text-xs text-gray-900">{order.orderDate.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</td>
                    <td className="w-24 px-2 py-3 text-xs text-gray-900">{order.deliveryDate.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</td>
                    <td className="w-36 px-2 py-3 text-xs text-gray-900">
                      <div>{order.registeredAt.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</div>
                      <div className="text-gray-500">{order.registeredAt.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}</div>
                    </td>
                    <td className="w-40 px-2 py-3 text-xs text-gray-900">
                      {order.latestSalesSlipIssuedAt ? (
                        <div>
                          <div>{order.latestSalesSlipIssuedAt.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</div>
                          <div className="text-gray-500">{order.latestSalesSlipIssuedAt.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="w-36 px-2 py-3 text-xs text-gray-900">
                      {order.latestSyncAt ? (
                        <div>
                          <div>{order.latestSyncAt.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'})}</div>
                          <div className="text-gray-500">{order.latestSyncAt.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="w-32 px-2 py-3 text-xs text-gray-900">
                      {order.estimateApprovedAt ? order.estimateApprovedAt.toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'}) : '-'}
                    </td>
                    <td className="w-32 px-2 py-3 text-xs text-gray-900 font-mono">
                      <div>¥{order.amount.toLocaleString()}</div>
                    </td>
                    <td className="w-24 px-2 py-3 text-xs text-gray-900 truncate">{order.registeredBy}</td>
                    <td className="w-24 px-2 py-3">
                      <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${
                        order.syncStatus === '完了' ? 'bg-green-100 text-green-800' :
                        order.syncStatus === '待機中' ? 'bg-yellow-100 text-yellow-800' :
                        order.syncStatus === 'エラー' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.syncStatus}
                      </span>
                    </td>
                    <td className="w-32 px-2 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Link 
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 p-1 text-sm" 
                          title="詳細表示"
                        >
                          👁
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/edit`}
                          className="text-green-600 hover:text-green-800 p-1 text-sm" 
                          title="編集"
                        >
                          ✏️
                        </Link>
                        <button className="text-purple-600 hover:text-purple-800 p-1 text-sm" title="コピー">📋</button>
                        <button className="text-red-600 hover:text-red-800 p-1 text-sm" title="削除">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* ページネーション */}
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              {filteredOrders.length}件中 {paginatedOrders.length}件表示
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={pagination.itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10件</option>
                <option value={25}>25件</option>
                <option value={50}>50件</option>
              </select>
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                前
              </button>
              <span className="text-sm">{pagination.currentPage} / {totalPages}</span>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                次
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}