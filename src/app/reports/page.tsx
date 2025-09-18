'use client';

import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { 
  BarChart3,
  TrendingUp,
  Package,
  FileText,
  DollarSign,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function ReportsContent() {
  const { user } = useAuth();

  const reports = [
    {
      title: '売上分析レポート',
      description: '詳細売上推移、顧客別ランキング、予測分析、担当者別実績',
      icon: TrendingUp,
      href: '/reports/sales',
      color: 'bg-green-500',
      stats: [
        { label: '今月売上', value: '¥2,450,000' },
        { label: '年間目標達成率', value: '85.6%' },
        { label: '前年同月比', value: '+18.3%' },
      ]
    },
    {
      title: '在庫レポート',
      description: '在庫状況、低在庫アラート、商品別回転率',
      icon: Package,
      href: '/reports/inventory',
      color: 'bg-blue-500',
      stats: [
        { label: '低在庫商品', value: '3件', alert: true },
        { label: '総在庫額', value: '¥1,280,000' },
      ]
    },
    {
      title: '受注状況',
      description: 'ステータス別受注、納期管理、進捗可視化',
      icon: FileText,
      href: '/reports/orders',
      color: 'bg-purple-500',
      stats: [
        { label: '未処理受注', value: '5件' },
        { label: '今月受注', value: '12件' },
      ]
    },
    {
      title: '利益分析',
      description: '商品別粗利率、得意先別収益性分析',
      icon: DollarSign,
      href: '/reports/profit',
      color: 'bg-orange-500',
      stats: [
        { label: '平均粗利率', value: '32.5%' },
        { label: '今月利益', value: '¥795,000' },
      ]
    },
  ];

  const quickStats = [
    {
      title: '総売上（今月）',
      value: '¥2,450,000',
      change: '+15%',
      changeType: 'increase' as const,
      icon: TrendingUp,
    },
    {
      title: '総受注件数',
      value: '12件',
      change: '+3件',
      changeType: 'increase' as const,
      icon: FileText,
    },
    {
      title: '活動得意先',
      value: '4社',
      change: '100%',
      changeType: 'neutral' as const,
      icon: Building2,
    },
    {
      title: '担当者数',
      value: '3名',
      change: '稼働中',
      changeType: 'neutral' as const,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">レポート・分析</h1>
                <p className="text-xs text-gray-500">業績と運営状況の分析</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <span>ダッシュボードに戻る</span>
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
            { label: 'レポート・分析', current: true }
          ]}
          className="mb-6"
        />

        {/* 概要統計 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">概要統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' :
                      stat.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* レポートメニュー */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">詳細レポート</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <Link
                  key={index}
                  href={report.href}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group block"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${report.color} p-3 rounded-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {report.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {report.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="flex items-center space-x-2">
                            {stat.alert && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <div>
                              <p className="text-xs text-gray-500">{stat.label}</p>
                              <p className={`text-sm font-semibold ${
                                stat.alert ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {stat.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RequireAuth>
      <ReportsContent />
    </RequireAuth>
  );
}