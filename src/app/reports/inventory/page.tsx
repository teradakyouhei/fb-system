'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  Package,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function InventoryReportContent() {
  const { user } = useAuth();
  
  // 在庫データ
  const inventoryData = [
    { 
      id: 'product-1',
      code: 'PROD001',
      name: 'ABC粉末消火器10型',
      category: '消火器',
      currentStock: 25,
      minStock: 10,
      unitPrice: 8500,
      totalValue: 212500,
      supplier: '防災機器株式会社',
      status: 'normal',
      turnoverRate: 4.2
    },
    { 
      id: 'product-2',
      code: 'PROD002',
      name: '自動火災報知機 感知器',
      category: '火災報知設備',
      currentStock: 50,
      minStock: 20,
      unitPrice: 12000,
      totalValue: 600000,
      supplier: 'セキュリティシステムズ',
      status: 'normal',
      turnoverRate: 3.8
    },
    { 
      id: 'product-3',
      code: 'PROD003',
      name: '誘導灯 避難口通路用',
      category: '誘導灯',
      currentStock: 8,
      minStock: 5,
      unitPrice: 15000,
      totalValue: 120000,
      supplier: '防災機器株式会社',
      status: 'low',
      turnoverRate: 2.1
    },
    { 
      id: 'product-4',
      code: 'PROD004',
      name: 'スプリンクラーヘッド 標準型',
      category: 'スプリンクラー設備',
      currentStock: 100,
      minStock: 30,
      unitPrice: 3500,
      totalValue: 350000,
      supplier: '水防設備工業',
      status: 'normal',
      turnoverRate: 6.5
    },
    { 
      id: 'product-5',
      code: 'PROD005',
      name: '非常ベル 屋内用',
      category: '警報設備',
      currentStock: 3,
      minStock: 5,
      unitPrice: 25000,
      totalValue: 75000,
      supplier: 'セキュリティシステムズ',
      status: 'critical',
      turnoverRate: 1.2
    },
  ];

  // カテゴリー別在庫データ
  const categoryData = [
    { category: '消火器', value: 212500, count: 1, color: '#3B82F6' },
    { category: '火災報知設備', value: 600000, count: 1, color: '#10B981' },
    { category: '誘導灯', value: 120000, count: 1, color: '#F59E0B' },
    { category: 'スプリンクラー設備', value: 350000, count: 1, color: '#EF4444' },
    { category: '警報設備', value: 75000, count: 1, color: '#8B5CF6' },
  ];

  // 仕入先別在庫データ
  const supplierData = [
    { name: '防災機器株式会社', value: 332500, products: 2 },
    { name: 'セキュリティシステムズ', value: 675000, products: 2 },
    { name: '水防設備工業', value: 350000, products: 1 },
  ];

  // 統計データ
  const inventoryStats = [
    {
      title: '総在庫額',
      value: '¥1,357,500',
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: Package,
    },
    {
      title: '在庫商品数',
      value: '186点',
      change: '-2点',
      changeType: 'decrease' as const,
      icon: BarChart3,
    },
    {
      title: '低在庫商品',
      value: '2件',
      change: 'アラート',
      changeType: 'alert' as const,
      icon: AlertTriangle,
    },
    {
      title: '仕入先数',
      value: '3社',
      change: '稼働中',
      changeType: 'neutral' as const,
      icon: Building2,
    },
  ];

  // 低在庫・欠品商品
  const lowStockItems = inventoryData.filter(item => item.status === 'low' || item.status === 'critical');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">在庫レポート</h1>
                <p className="text-xs text-gray-500">在庫状況と管理分析</p>
              </div>
            </div>
            <Link
              href="/reports"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>レポート一覧に戻る</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: 'ダッシュボード', href: '/dashboard' },
            { label: 'レポート・分析', href: '/reports' },
            { label: '在庫レポート', current: true }
          ]}
          className="mb-6"
        />

        {/* 在庫サマリー */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">在庫サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryStats.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        item.changeType === 'alert' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          item.changeType === 'alert' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">{item.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm ${
                      item.changeType === 'increase' ? 'text-green-600' :
                      item.changeType === 'decrease' ? 'text-red-600' :
                      item.changeType === 'alert' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 低在庫アラート */}
        {lowStockItems.length > 0 && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">在庫アラート</h3>
              </div>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">在庫: {item.currentStock}個</p>
                      <p className="text-sm text-gray-600">最小: {item.minStock}個</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* カテゴリー別在庫・仕入先別在庫 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー別在庫額</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value }) => `${category} ¥${(value / 1000).toFixed(0)}K`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`¥${Number(value).toLocaleString()}`, '在庫額']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">仕入先別在庫額</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `¥${Number(value).toLocaleString()}` : `${value}品目`,
                      name === 'value' ? '在庫額' : '商品数'
                    ]}
                  />
                  <Bar dataKey="value" fill="#3B82F6" name="在庫額" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 在庫一覧詳細 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">在庫詳細一覧</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    在庫数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    在庫額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    回転率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状況
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.code} - {item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock} / {item.minStock}
                      </div>
                      <div className="text-xs text-gray-500">現在 / 最小</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ¥{item.unitPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ¥{item.totalValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.turnoverRate > 4 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-900">{item.turnoverRate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'normal' ? 'bg-green-100 text-green-800' :
                        item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'normal' ? '正常' :
                         item.status === 'low' ? '低在庫' : '緊急'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InventoryReportPage() {
  return (
    <RequireAuth>
      <InventoryReportContent />
    </RequireAuth>
  );
}