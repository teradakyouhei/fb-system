'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  DollarSign,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Building2,
  Package,
  Users,
  PieChart as PieChartIcon
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

function ProfitAnalysisContent() {
  const { user } = useAuth();
  
  // 月別利益データ
  const monthlyProfitData = [
    { month: '2024/01', revenue: 1850000, cost: 1295000, profit: 555000, margin: 30.0 },
    { month: '2024/02', revenue: 2100000, cost: 1470000, profit: 630000, margin: 30.0 },
    { month: '2024/03', revenue: 1950000, cost: 1365000, profit: 585000, margin: 30.0 },
    { month: '2024/04', revenue: 2300000, cost: 1610000, profit: 690000, margin: 30.0 },
    { month: '2024/05', revenue: 2150000, cost: 1505000, profit: 645000, margin: 30.0 },
    { month: '2024/06', revenue: 2450000, cost: 1715000, profit: 735000, margin: 30.0 },
    { month: '2024/07', revenue: 2200000, cost: 1540000, profit: 660000, margin: 30.0 },
    { month: '2024/08', revenue: 2450000, cost: 1655000, profit: 795000, margin: 32.4 },
  ];

  // 商品別利益分析
  const productProfitData = [
    { 
      name: 'ABC粉末消火器10型',
      revenue: 680000,
      cost: 480000,
      profit: 200000,
      margin: 29.4,
      units: 80,
      category: '消火器'
    },
    { 
      name: '自動火災報知機 感知器',
      revenue: 720000,
      cost: 510000,
      profit: 210000,
      margin: 29.2,
      units: 60,
      category: '火災報知設備'
    },
    { 
      name: '誘導灯 避難口通路用',
      revenue: 450000,
      cost: 330000,
      profit: 120000,
      margin: 26.7,
      units: 30,
      category: '誘導灯'
    },
    { 
      name: 'スプリンクラーヘッド',
      revenue: 350000,
      cost: 220000,
      profit: 130000,
      margin: 37.1,
      units: 100,
      category: 'スプリンクラー設備'
    },
    { 
      name: '非常ベル 屋内用',
      revenue: 250000,
      cost: 180000,
      profit: 70000,
      margin: 28.0,
      units: 10,
      category: '警報設備'
    },
  ];

  // 得意先別収益性
  const customerProfitData = [
    { 
      name: '株式会社サンプル商事',
      revenue: 850000,
      cost: 595000,
      profit: 255000,
      margin: 30.0,
      orders: 4,
      avgOrderValue: 212500
    },
    { 
      name: 'テストビル管理株式会社',
      revenue: 720000,
      cost: 504000,
      profit: 216000,
      margin: 30.0,
      orders: 3,
      avgOrderValue: 240000
    },
    { 
      name: '有限会社デモマンション',
      revenue: 550000,
      cost: 330000,
      profit: 220000,
      margin: 40.0,
      orders: 3,
      avgOrderValue: 183333
    },
    { 
      name: '東京防災設備株式会社',
      revenue: 330000,
      cost: 231000,
      profit: 99000,
      margin: 30.0,
      orders: 2,
      avgOrderValue: 165000
    },
  ];

  // カテゴリー別利益
  const categoryProfitData = [
    { category: '消火器', profit: 200000, margin: 29.4, color: '#3B82F6' },
    { category: '火災報知設備', profit: 210000, margin: 29.2, color: '#10B981' },
    { category: '誘導灯', profit: 120000, margin: 26.7, color: '#F59E0B' },
    { category: 'スプリンクラー設備', profit: 130000, margin: 37.1, color: '#EF4444' },
    { category: '警報設備', profit: 70000, margin: 28.0, color: '#8B5CF6' },
  ];

  // 統計データ
  const profitStats = [
    {
      title: '今月利益',
      value: '¥795,000',
      change: '+20%',
      changeType: 'increase' as const,
      icon: DollarSign,
    },
    {
      title: '利益率',
      value: '32.4%',
      change: '+2.4%',
      changeType: 'increase' as const,
      icon: TrendingUp,
    },
    {
      title: '最高利益商品',
      value: 'スプリンクラー',
      change: '37.1%',
      changeType: 'increase' as const,
      icon: Package,
    },
    {
      title: '最高利益得意先',
      value: 'デモマンション',
      change: '40.0%',
      changeType: 'increase' as const,
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">利益分析</h1>
                <p className="text-xs text-gray-500">収益性と利益構造の詳細分析</p>
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
            { label: '利益分析', current: true }
          ]}
          className="mb-6"
        />

        {/* 利益サマリー */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">利益サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profitStats.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <IconComponent className="w-6 h-6 text-orange-600" />
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

        {/* 月別利益推移 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月別利益推移</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    yAxisId="profit"
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    yAxisId="margin"
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'profit' ? `¥${Number(value).toLocaleString()}` :
                      name === 'margin' ? `${Number(value).toFixed(1)}%` :
                      `¥${Number(value).toLocaleString()}`,
                      name === 'profit' ? '利益' :
                      name === 'margin' ? '利益率' :
                      name === 'revenue' ? '売上' : '原価'
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="profit"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="売上"
                  />
                  <Line 
                    yAxisId="profit"
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="原価"
                  />
                  <Line 
                    yAxisId="profit"
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="利益"
                  />
                  <Line 
                    yAxisId="margin"
                    type="monotone" 
                    dataKey="margin" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="利益率"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* カテゴリー別利益・商品別利益率 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー別利益構成</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryProfitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, margin }) => `${category} ${margin.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="profit"
                  >
                    {categoryProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `¥${Number(value).toLocaleString()} (${props.payload.margin.toFixed(1)}%)`,
                      '利益'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">商品別利益率</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productProfitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, '利益率']}
                  />
                  <Bar 
                    dataKey="margin" 
                    fill="#F59E0B"
                    name="利益率"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 商品別利益詳細 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">商品別利益詳細</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    売上
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    原価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利益
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利益率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    販売数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productProfitData.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ¥{product.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ¥{product.cost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ¥{product.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.margin > 35 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : product.margin > 30 ? (
                          <TrendingUp className="w-4 h-4 text-yellow-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-semibold ${
                          product.margin > 35 ? 'text-green-600' :
                          product.margin > 30 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {product.margin.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.units}個</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 得意先別収益性 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">得意先別収益性分析</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    得意先名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    売上
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利益
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利益率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    受注件数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均受注額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerProfitData.map((customer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-8 h-8 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ¥{customer.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ¥{customer.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.margin > 35 ? 'bg-green-100 text-green-800' :
                        customer.margin > 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {customer.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.orders}件</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ¥{Math.round(customer.avgOrderValue).toLocaleString()}
                      </div>
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

export default function ProfitAnalysisPage() {
  return (
    <RequireAuth>
      <ProfitAnalysisContent />
    </RequireAuth>
  );
}