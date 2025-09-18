'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users
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

function OrdersAnalysisContent() {
  const { user } = useAuth();
  
  // 受注状況データ
  const orderStatusData = [
    { status: '見積中', count: 2, color: '#F59E0B', value: 420000 },
    { status: '受注', count: 3, color: '#3B82F6', value: 680000 },
    { status: '進行中', count: 4, color: '#10B981', value: 890000 },
    { status: '完了', count: 3, color: '#6B7280', value: 460000 },
  ];

  // 月別受注推移
  const monthlyOrdersData = [
    { month: '2024/01', orders: 8, completed: 6, amount: 1850000 },
    { month: '2024/02', orders: 10, completed: 8, amount: 2100000 },
    { month: '2024/03', orders: 9, completed: 7, amount: 1950000 },
    { month: '2024/04', orders: 11, completed: 9, amount: 2300000 },
    { month: '2024/05', orders: 10, completed: 8, amount: 2150000 },
    { month: '2024/06', orders: 12, completed: 10, amount: 2450000 },
    { month: '2024/07', orders: 11, completed: 9, amount: 2200000 },
    { month: '2024/08', orders: 12, completed: 9, amount: 2450000 },
  ];

  // 担当者別受注状況
  const staffOrdersData = [
    { 
      name: '田中太郎', 
      orders: 6, 
      completed: 4, 
      inProgress: 2, 
      avgDays: 18,
      onTimeRate: 95 
    },
    { 
      name: '佐藤花子', 
      orders: 4, 
      completed: 3, 
      inProgress: 1, 
      avgDays: 22,
      onTimeRate: 85 
    },
    { 
      name: '山田次郎', 
      orders: 2, 
      completed: 2, 
      inProgress: 0, 
      avgDays: 25,
      onTimeRate: 75 
    },
  ];

  // 納期管理データ
  const deliveryData = [
    { 
      id: 'order-1',
      orderNo: 'ORD001', 
      customer: '株式会社サンプル商事',
      project: '消火器定期点検・交換作業',
      orderDate: '2024-08-01',
      deliveryDate: '2024-08-15',
      status: '進行中',
      daysLeft: 5,
      staff: '田中太郎'
    },
    { 
      id: 'order-2',
      orderNo: 'ORD002', 
      customer: 'テストビル管理株式会社',
      project: '自動火災報知設備工事',
      orderDate: '2024-08-05',
      deliveryDate: '2024-08-20',
      status: '進行中',
      daysLeft: 10,
      staff: '佐藤花子'
    },
    { 
      id: 'order-3',
      orderNo: 'ORD003', 
      customer: '有限会社デモマンション',
      project: 'スプリンクラー設備保守',
      orderDate: '2024-08-10',
      deliveryDate: '2024-08-12',
      status: '進行中',
      daysLeft: -2,
      staff: '田中太郎'
    },
  ];

  // 統計データ
  const orderStats = [
    {
      title: '総受注件数',
      value: '12件',
      change: '+3件',
      changeType: 'increase' as const,
      icon: FileText,
    },
    {
      title: '進行中案件',
      value: '4件',
      change: '稼働中',
      changeType: 'neutral' as const,
      icon: Clock,
    },
    {
      title: '納期遅延',
      value: '1件',
      change: 'アラート',
      changeType: 'alert' as const,
      icon: AlertCircle,
    },
    {
      title: '完了率',
      value: '75%',
      change: '+5%',
      changeType: 'increase' as const,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">受注状況分析</h1>
                <p className="text-xs text-gray-500">受注管理と進捗状況の分析</p>
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
            { label: '受注状況分析', current: true }
          ]}
          className="mb-6"
        />

        {/* 受注サマリー */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">受注サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {orderStats.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        item.changeType === 'alert' ? 'bg-red-50' : 'bg-purple-50'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          item.changeType === 'alert' ? 'text-red-600' : 'text-purple-600'
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

        {/* 納期遅延アラート */}
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">納期管理アラート</h3>
            </div>
            <div className="space-y-3">
              {deliveryData
                .filter(order => order.daysLeft < 3)
                .map((order, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      order.daysLeft < 0 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNo} - {order.project}</p>
                      <p className="text-sm text-gray-600">{order.customer} | {order.staff}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      order.daysLeft < 0 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {order.daysLeft < 0 ? `${Math.abs(order.daysLeft)}日遅延` : `残り${order.daysLeft}日`}
                    </p>
                    <p className="text-sm text-gray-600">納期: {order.deliveryDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 受注状況とトレンド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス別受注状況</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status} ${count}件`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}件 (¥${Number(props.payload.value).toLocaleString()})`,
                      '受注数'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月別受注推移</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="受注件数"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="完了件数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 担当者別実績 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">担当者別受注実績</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    受注件数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完了件数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進行中
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均処理日数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    納期遵守率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffOrdersData.map((staff, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.orders}件</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.completed}件</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.inProgress}件</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.avgDays}日</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.onTimeRate >= 90 ? 'bg-green-100 text-green-800' :
                        staff.onTimeRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {staff.onTimeRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 納期管理詳細 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">進行中案件の納期管理</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    受注番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    得意先・作業内容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    納期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    残日数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状況
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryData.map((order, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.project}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.staff}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.deliveryDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        order.daysLeft < 0 ? 'text-red-600' :
                        order.daysLeft < 3 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {order.daysLeft < 0 ? `${Math.abs(order.daysLeft)}日遅延` : `残り${order.daysLeft}日`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.daysLeft < 0 ? 'bg-red-100 text-red-800' :
                        order.daysLeft < 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.daysLeft < 0 ? '遅延' :
                         order.daysLeft < 3 ? '要注意' : '順調'}
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

export default function OrdersAnalysisPage() {
  return (
    <RequireAuth>
      <OrdersAnalysisContent />
    </RequireAuth>
  );
}