'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Building2, 
  FileText, 
  ShoppingCart, 
  Calendar,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  BarChart3,
  Camera,
  CheckSquare,
  ExternalLink,
  FormInput
} from 'lucide-react';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState([
    {
      title: '総受注件数',
      value: '245',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: '今月の売上',
      value: '¥3,250,000',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: '未完了案件',
      value: '18',
      change: '-3',
      changeType: 'decrease',
    },
    {
      title: '顧客満足度',
      value: '98%',
      change: '+2%',
      changeType: 'increase',
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 統計データの取得
        // 実装は後で追加
      } catch (error) {
        console.error('統計データの取得に失敗しました:', error);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: '新規受注',
      description: '受注情報を新規登録',
      icon: FileText,
      href: '/orders/new',
      color: 'bg-blue-500',
    },
    {
      title: '受注一覧',
      description: '受注管理・検索',
      icon: Search,
      href: '/orders',
      color: 'bg-green-500',
    },
    {
      title: 'レポート・分析',
      description: '売上・在庫・収益分析',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-red-500',
    },
    {
      title: '日程管理',
      description: '作業スケジュール・ドラッグ&ドロップ対応',
      icon: Calendar,
      href: 'http://localhost:3001',
      color: 'bg-purple-500',
      external: true,
    },
    {
      title: '不良写真作成',
      description: 'フィールドスコープ写真管理',
      icon: Camera,
      href: 'https://fieldscope-pwa.firebaseapp.com',
      color: 'bg-orange-500',
      external: true,
    },
    {
      title: '見積承認',
      description: '見積承認システム',
      icon: CheckSquare,
      href: 'https://estimate-approval.firebaseapp.com',
      color: 'bg-teal-500',
      external: true,
    },
    {
      title: '帳票テンプレート',
      description: '帳票作成・管理',
      icon: FormInput,
      href: '/forms/templates',
      color: 'bg-yellow-500',
    },
  ];

  const masterActions = [
    {
      title: '得意先管理',
      description: '顧客情報の管理',
      icon: Building2,
      href: '/customers',
      color: 'bg-indigo-500',
    },
    {
      title: '担当者管理',
      description: '社内担当者情報',
      icon: Users,
      href: '/staff',
      color: 'bg-teal-500',
    },
    {
      title: '商品管理',
      description: '商品・在庫管理',
      icon: FileText,
      href: '/products',
      color: 'bg-cyan-500',
    },
    {
      title: '仕入先管理',
      description: '仕入先情報管理',
      icon: Building2,
      href: '/suppliers',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FB受注管理システム</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <GlobalSearchBar />
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Users className="h-4 w-4" />
                <span>{user?.displayName || user?.email || 'ユーザー'}</span>
              </div>
              
              <button 
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ダッシュボード概要 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード概要</h2>
          
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.title}</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' :
                    stat.changeType === 'decrease' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              
              // 外部リンクの場合
              if (action.external) {
                return (
                  <a
                    key={index}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200 text-left group block"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </a>
                );
              }

              // 内部リンクの場合
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200 text-left group block"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-105 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* マスター管理 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">マスター管理</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {masterActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200 text-left group block"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {action.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近の活動</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">新しい受注が登録されました</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">見積もりが承認されました</p>
                  <p className="text-xs text-gray-500">5時間前</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">スケジュールが更新されました</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}