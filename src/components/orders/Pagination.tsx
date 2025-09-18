'use client';

import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
      {/* モバイル表示 */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>

      {/* デスクトップ表示 */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {/* 表示件数選択 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">表示件数:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10件</option>
              <option value={25}>25件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>
          </div>

          {/* 件数表示 */}
          <p className="text-sm text-gray-700">
            {startItem}-{endItem}件 / 全{totalItems}件
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {/* 最初のページ */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="最初のページ"
          >
            <ChevronsLeft className="h-5 w-5" />
          </button>

          {/* 前のページ */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="前のページ"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* ページ番号 */}
          <div className="flex space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-3 py-2 text-sm text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              
              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* 次のページ */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="次のページ"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* 最後のページ */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="最後のページ"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}