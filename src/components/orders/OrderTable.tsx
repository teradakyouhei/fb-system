'use client';

import { useState, useMemo } from 'react';
import { 
  OrderListItem, 
  OrderListSort, 
  TableColumn, 
  DEFAULT_COLUMNS,
  SyncStatus,
  RESPONSIVE_PRIORITIES 
} from '@/types/orderList';
import {
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

interface OrderTableProps {
  data: OrderListItem[];
  sort: OrderListSort;
  onSort: (sort: OrderListSort) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCopy: (order: OrderListItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function OrderTable({
  data,
  sort,
  onSort,
  selectedIds,
  onSelectionChange,
  onCopy,
  onDelete,
  loading = false
}: OrderTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.filter(col => col.visible).map(col => col.key)
  );

  // ソート処理
  const sortedData = useMemo(() => {
    if (!sort.field) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      // null/undefined の処理
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sort.direction === 'asc' ? -1 : 1;
      
      // 日付の処理
      if (aVal instanceof Date && bVal instanceof Date) {
        return sort.direction === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      
      // 数値の処理
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // 文字列の処理
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr < bStr) return sort.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sort]);

  // ヘッダークリック処理
  const handleHeaderClick = (field: keyof OrderListItem) => {
    if (sort.field === field) {
      onSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onSort({
        field,
        direction: 'asc'
      });
    }
  };

  // 全選択処理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(data.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  // 単一選択処理
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // セル値のフォーマット
  const formatCellValue = (column: TableColumn, value: any, item: OrderListItem) => {
    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex justify-center">
            {value ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-300" />
            )}
          </div>
        );
      
      case 'date':
        return value ? new Date(value).toLocaleDateString('ja-JP') : '-';
      
      case 'datetime':
        return value 
          ? new Date(value).toLocaleDateString('ja-JP') + ' ' + new Date(value).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
          : '-';
      
      case 'currency':
        return new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY'
        }).format(value);
      
      case 'status':
        const syncStatus = value as SyncStatus;
        const statusConfig = {
          '完了': { icon: CheckCircle, className: 'text-green-500', bgClassName: 'bg-green-50' },
          '待機中': { icon: Clock, className: 'text-yellow-500', bgClassName: 'bg-yellow-50' },
          'エラー': { icon: AlertCircle, className: 'text-red-500', bgClassName: 'bg-red-50' },
          '未実行': { icon: XCircle, className: 'text-gray-400', bgClassName: 'bg-gray-50' }
        };
        const config = statusConfig[syncStatus];
        const IconComponent = config.icon;
        
        return (
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.bgClassName}`}>
            <IconComponent className={`w-3 h-3 ${config.className}`} />
            <span className={config.className}>{syncStatus}</span>
          </div>
        );
      
      case 'string':
      default:
        // 受注NOの場合はリンクにする
        if (column.key === 'orderNo') {
          return (
            <Link 
              href={`/orders/${item.id}`}
              className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
            >
              {value}
            </Link>
          );
        }
        return <span className="truncate" title={value}>{value || '-'}</span>;
    }
  };

  // レスポンシブクラス生成
  const getResponsiveClass = (columnKey: string) => {
    const { mobile, tablet } = RESPONSIVE_PRIORITIES;
    
    if (mobile.includes(columnKey)) return 'table-cell';
    if (tablet.includes(columnKey)) return 'hidden md:table-cell';
    return 'hidden lg:table-cell';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* テーブルコンテナ */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* ヘッダー */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* 全選択チェックボックス */}
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              
              {/* 各カラムヘッダー */}
              {DEFAULT_COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${getResponsiveClass(column.key)}`}
                  style={{ minWidth: column.width }}
                  onClick={() => column.sortable && handleHeaderClick(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sort.field === column.key ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="w-3 h-3 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-blue-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {/* 操作カラム */}
              <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          
          {/* ボディ */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr 
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedIds.includes(item.id) ? 'bg-blue-50' : ''
                }`}
              >
                {/* 選択チェックボックス */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                
                {/* データセル */}
                {DEFAULT_COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
                  <td
                    key={`${item.id}-${column.key}`}
                    className={`px-4 py-3 text-sm text-gray-900 ${getResponsiveClass(column.key)}`}
                  >
                    {formatCellValue(column, item[column.key], item)}
                  </td>
                ))}
                
                {/* 操作ボタン */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      href={`/orders/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="詳細表示"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/orders/${item.id}/edit`}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onCopy(item)}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="コピー"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* データが空の場合 */}
      {sortedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          表示するデータがありません
        </div>
      )}
    </div>
  );
}