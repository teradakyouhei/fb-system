'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  TrendingUp,
  ArrowLeft,
  Calendar,
  Users,
  Package,
  Building2,
  Download,
  Filter,
  Eye,
  DollarSign,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { exportSalesReport } from '@/utils/reportExport';
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
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

function SalesAnalysisContent() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('月次');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // 売上統計サマリー
  const salesStats = [
    {
      title: '今月の売上',
      value: '¥2,450,000',
      change: '+15.2%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      comparison: '前月比',
    },
    {
      title: '年間売上目標',
      value: '85.6%',
      change: '¥25,680,000 / ¥30,000,000',
      changeType: 'increase' as const,
      icon: Target,
      comparison: '達成率',
    },
    {
      title: '平均受注単価',
      value: '¥204,167',
      change: '+8.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      comparison: '前月比',
    },
    {
      title: '売上成長率',
      value: '+18.3%',
      change: '前年同月比',
      changeType: 'increase' as const,
      icon: TrendingUp,
      comparison: 'YoY成長',
    },
  ];

  // 月次売上推移データ (2024年)
  const monthlySalesData = [
    { 
      month: '1月', 
      sales: 1850000, 
      orders: 9, 
      avgOrderValue: 205556,
      target: 2500000,
      profit: 555000,
      profitRate: 30,
      previousYear: 1650000
    },
    { 
      month: '2月', 
      sales: 2100000, 
      orders: 10, 
      avgOrderValue: 210000,
      target: 2500000,
      profit: 630000,
      profitRate: 30,
      previousYear: 1800000
    },
    { 
      month: '3月', 
      sales: 1950000, 
      orders: 9, 
      avgOrderValue: 216667,
      target: 2500000,
      profit: 585000,
      profitRate: 30,
      previousYear: 1750000
    },
    { 
      month: '4月', 
      sales: 2300000, 
      orders: 11, 
      avgOrderValue: 209091,
      target: 2500000,
      profit: 690000,
      profitRate: 30,
      previousYear: 1900000
    },
    { 
      month: '5月', 
      sales: 2150000, 
      orders: 10, 
      avgOrderValue: 215000,
      target: 2500000,
      profit: 645000,
      profitRate: 30,
      previousYear: 1850000
    },
    { 
      month: '6月', 
      sales: 2450000, 
      orders: 12, 
      avgOrderValue: 204167,
      target: 2500000,
      profit: 735000,
      profitRate: 30,
      previousYear: 2000000
    },
    { 
      month: '7月', 
      sales: 2200000, 
      orders: 11, 
      avgOrderValue: 200000,
      target: 2500000,
      profit: 660000,
      profitRate: 30,
      previousYear: 1950000
    },
    { 
      month: '8月', 
      sales: 2450000, 
      orders: 12, 
      avgOrderValue: 204167,
      target: 2500000,
      profit: 735000,
      profitRate: 30,
      previousYear: 2070000
    },
  ];

  // 顧客別売上ランキング
  const customerSalesRanking = [
    {
      rank: 1,
      customerId: 'customer-1',
      customerName: '株式会社サンプル商事',
      totalSales: 4800000,
      orders: 8,
      avgOrderValue: 600000,
      share: 23.5,
      growth: 15.2,
      lastOrderDate: '2024-08-25',
      category: 'VIP顧客',
    },
    {
      rank: 2,
      customerId: 'customer-4',
      customerName: '東京防災設備株式会社',
      totalSales: 3600000,
      orders: 6,
      avgOrderValue: 600000,
      share: 17.6,
      growth: 22.1,
      lastOrderDate: '2024-08-30',
      category: 'VIP顧客',
    },
    {
      rank: 3,
      customerId: 'customer-2',
      customerName: 'テストビル管理株式会社',
      totalSales: 3200000,
      orders: 7,
      avgOrderValue: 457143,
      share: 15.7,
      growth: 8.9,
      lastOrderDate: '2024-08-20',
      category: 'A級顧客',
    },
    {
      rank: 4,
      customerId: 'customer-3',
      customerName: '有限会社デモマンション',
      totalSales: 2400000,
      orders: 5,
      avgOrderValue: 480000,
      share: 11.8,
      growth: -2.1,
      lastOrderDate: '2024-08-15',
      category: 'A級顧客',
    },
  ];

  // 商品カテゴリー別売上
  const categorySalesData = [
    {
      category: '消火器',
      sales: 6800000,
      orders: 15,
      share: 33.3,
      avgPrice: 453333,
      profit: 2040000,
      profitRate: 30,
      color: '#FF6B6B',
    },
    {
      category: '火災報知設備',
      sales: 4800000,
      orders: 10,
      share: 23.5,
      avgPrice: 480000,
      profit: 1440000,
      profitRate: 30,
      color: '#4ECDC4',
    },
    {
      category: 'スプリンクラー設備',
      sales: 3600000,
      orders: 8,
      share: 17.6,
      avgPrice: 450000,
      profit: 1080000,
      profitRate: 30,
      color: '#45B7D1',
    },
    {
      category: '誘導灯',
      sales: 2800000,
      orders: 12,
      share: 13.7,
      avgPrice: 233333,
      profit: 840000,
      profitRate: 30,
      color: '#96CEB4',
    },
    {
      category: '警報設備',
      sales: 2400000,
      orders: 6,
      share: 11.8,
      avgPrice: 400000,
      profit: 720000,
      profitRate: 30,
      color: '#FFEAA7',
    },
  ];

  // 担当者別売上実績
  const staffSalesData = [
    {
      staffId: 'staff-1',
      staffName: '田中太郎',
      department: '営業部',
      totalSales: 8400000,
      orders: 18,
      avgOrderValue: 466667,
      target: 10000000,
      achievement: 84,
      growth: 12.5,
      commission: 168000,
      rank: 1,
    },
    {
      staffId: 'staff-2',
      staffName: '佐藤花子',
      department: '技術部',
      totalSales: 6200000,
      orders: 14,
      avgOrderValue: 442857,
      target: 8000000,
      achievement: 77.5,
      growth: 18.9,
      commission: 124000,
      rank: 2,
    },
    {
      staffId: 'staff-3',
      staffName: '山田次郎',
      department: '管理部',
      totalSales: 5800000,
      orders: 10,
      avgOrderValue: 580000,
      target: 7000000,
      achievement: 82.9,
      growth: 6.2,
      commission: 116000,
      rank: 3,
    },
  ];

  // 売上予測データ (残り4ヶ月)
  const salesForecastData = [
    { month: '9月', predicted: 2300000, conservative: 2100000, optimistic: 2500000, target: 2500000 },
    { month: '10月', predicted: 2400000, conservative: 2200000, optimistic: 2600000, target: 2500000 },
    { month: '11月', predicted: 2600000, conservative: 2400000, optimistic: 2800000, target: 2500000 },
    { month: '12月', predicted: 2800000, conservative: 2600000, optimistic: 3000000, target: 2500000 },
  ];

  // 年間目標達成予測
  const currentTotalSales = monthlySalesData.reduce((sum, month) => sum + month.sales, 0);
  const forecastTotalSales = salesForecastData.reduce((sum, month) => sum + month.predicted, 0);
  const projectedAnnualSales = currentTotalSales + forecastTotalSales;
  const annualTarget = 30000000;

  // データ処理
  const totalCurrentSales = useMemo(() => {
    return monthlySalesData.reduce((sum, month) => sum + month.sales, 0);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  // レポートエクスポート処理
  const handleExportReport = () => {
    const reportData = {
      customerRanking: customerSalesRanking,
      staffSales: staffSalesData,
      categorySales: categorySalesData,
      monthlySales: monthlySalesData,
    };

    // PDF形式でエクスポート
    exportSalesReport(reportData, 'pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">売上分析レポート</h1>
                <p className="text-xs text-gray-500">売上実績・予測・顧客分析</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleExportReport()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>レポート出力</span>
              </button>
              <Link
                href="/reports"
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>レポート一覧</span>
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
            { label: 'ダッシュボード', href: '/dashboard' },
            { label: 'レポート・分析', href: '/reports' },
            { label: '売上分析レポート', current: true }
          ]}
          className="mb-6"
        />

        {/* 期間選択 */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">分析期間:</span>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="月次">月次分析</option>
                <option value="四半期">四半期分析</option>
                <option value="年次">年次分析</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={2024}>2024年</option>
                <option value={2023}>2023年</option>
                <option value={2022}>2022年</option>
              </select>
            </div>
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{showDetailedView ? '簡易表示' : '詳細表示'}</span>
              {showDetailedView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 売上サマリー */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">売上サマリー ({selectedYear}年)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesStats.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-50">
                        <IconComponent className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.comparison}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{item.value}</p>
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

        {/* 年間目標達成予測 */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-800">年間目標達成予測</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">現在の売上実績</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentTotalSales)}</p>
              <p className="text-sm text-gray-500">8ヶ月間の累計</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">年間予測売上</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(projectedAnnualSales)}</p>
              <p className="text-sm text-gray-500">残り4ヶ月の予測含む</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">目標達成率予測</p>
              <p className={`text-2xl font-bold ${projectedAnnualSales >= annualTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                {((projectedAnnualSales / annualTarget) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">目標: {formatCurrency(annualTarget)}</p>
            </div>
          </div>
        </div>

        {/* 売上推移とトレンド */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月次売上推移と前年比較</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? formatCurrency(value) : value,
                      name === 'sales' ? '今年売上' :
                      name === 'previousYear' ? '前年売上' :
                      name === 'target' ? '目標売上' : name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="target" fill="#E5E7EB" name="目標売上" />
                  <Bar yAxisId="left" dataKey="sales" fill="#10B981" name="今年売上" />
                  <Line yAxisId="left" type="monotone" dataKey="previousYear" stroke="#6B7280" strokeWidth={2} name="前年売上" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">売上予測 (残り4ヶ月)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Legend />
                  <Area type="monotone" dataKey="optimistic" stackId="1" stroke="#34D399" fill="#34D399" fillOpacity={0.3} name="楽観予測" />
                  <Area type="monotone" dataKey="predicted" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="標準予測" />
                  <Area type="monotone" dataKey="conservative" stackId="3" stroke="#059669" fill="#059669" fillOpacity={0.8} name="保守予測" />
                  <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" name="目標" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 顧客別売上分析 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">顧客別売上分析</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">売上ランキング TOP4</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">売上金額</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受注件数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">シェア</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成長率</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerSalesRanking.map((customer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                              customer.rank === 1 ? 'bg-yellow-500' :
                              customer.rank === 2 ? 'bg-gray-400' :
                              customer.rank === 3 ? 'bg-yellow-600' :
                              'bg-gray-300'
                            }`}>
                              {customer.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                          <div className="text-sm text-gray-500">{customer.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSales)}</div>
                          <div className="text-sm text-gray-500">平均: {formatCurrency(customer.avgOrderValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.orders}件</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.share}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            customer.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {customer.growth >= 0 ? '+' : ''}{customer.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">顧客構成</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSalesRanking}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ customerName, share }) => `${share}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="share"
                    >
                      {customerSalesRanking.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          index === 0 ? '#10B981' :
                          index === 1 ? '#3B82F6' :
                          index === 2 ? '#F59E0B' :
                          '#6B7280'
                        } />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'シェア']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {customerSalesRanking.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-600 truncate">{customer.customerName.split('株式会社')[0]}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{customer.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 商品カテゴリー別売上分析 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">商品カテゴリー別売上</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '売上']} />
                  <Legend />
                  <Bar dataKey="sales" fill="#10B981" name="売上金額" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー売上詳細</h3>
            <div className="space-y-4">
              {categorySalesData.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-gray-900">{category.category}</h4>
                    <span className="text-sm font-medium text-green-600">{category.share}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">売上金額</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(category.sales)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">受注件数</p>
                      <p className="font-semibold text-gray-900">{category.orders}件</p>
                    </div>
                    <div>
                      <p className="text-gray-600">平均単価</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(category.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">粗利益</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(category.profit)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${category.share}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 担当者別売上実績 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">担当者別売上実績</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">売上実績</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目標達成率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受注件数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均受注単価</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成長率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手数料</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffSalesData.map((staff, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                        staff.rank === 1 ? 'bg-yellow-500' :
                        staff.rank === 2 ? 'bg-gray-400' :
                        'bg-yellow-600'
                      }`}>
                        {staff.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{staff.staffName}</div>
                          <div className="text-sm text-gray-500">{staff.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(staff.totalSales)}</div>
                      <div className="text-sm text-gray-500">目標: {formatCurrency(staff.target)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              staff.achievement >= 90 ? 'bg-green-500' :
                              staff.achievement >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min(staff.achievement, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-semibold ${
                          staff.achievement >= 90 ? 'text-green-600' :
                          staff.achievement >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {staff.achievement}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.orders}件</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(staff.avgOrderValue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        staff.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {staff.growth >= 0 ? '+' : ''}{staff.growth}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(staff.commission)}</div>
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

export default function SalesAnalysisPage() {
  return (
    <RequireAuth>
      <SalesAnalysisContent />
    </RequireAuth>
  );
}