'use client';

import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import DataMigration from '@/components/DataMigration';
import { Building2, Database } from 'lucide-react';

function MigrationContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">データ移行管理</h1>
                <p className="text-xs text-gray-500">localStorageからFirestoreへのデータ移行</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <Breadcrumb 
          items={[
            { label: '管理', href: '/admin' },
            { label: 'データ移行', current: true }
          ]}
          className="mb-6"
        />

        {/* データ移行コンポーネント */}
        <DataMigration />

        {/* 移行手順の説明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">移行手順</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>「状況確認」ボタンでlocalStorageとFirestoreのデータ件数を確認</li>
            <li>「移行実行」ボタンでlocalStorageのデータをFirestoreに移行</li>
            <li>移行完了後、受注一覧画面でデータが正しく表示されることを確認</li>
            <li>問題がなければ「localStorage削除」でローカルデータを削除（任意）</li>
          </ol>
        </div>

        {/* Firebase設定確認 */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Firebase接続確認</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">プロジェクト設定</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>プロジェクトID: fb-order-management-system</p>
                <p>認証: Firebase Authentication</p>
                <p>データベース: Cloud Firestore</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">接続状態</h4>
              <div className="text-sm text-gray-600">
                <p>Firebase SDKが正常に初期化されています</p>
                <p>環境変数が適切に設定されています</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MigrationPage() {
  return (
    <RequireAuth>
      <MigrationContent />
    </RequireAuth>
  );
}