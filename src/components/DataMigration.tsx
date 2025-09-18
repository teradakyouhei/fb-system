'use client';

import { useState } from 'react';
import { firestoreOrderStore } from '@/lib/firestoreStore';
import { orderStore } from '@/lib/orderStore';
import { Database, Upload, Download, Trash2, Check, AlertTriangle } from 'lucide-react';

interface MigrationLog {
  timestamp: string;
  action: string;
  success: boolean;
  message: string;
}

export default function DataMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [stats, setStats] = useState({
    localStorageCount: 0,
    firestoreCount: 0,
    migrated: 0,
    errors: 0
  });

  const addLog = (action: string, success: boolean, message: string) => {
    const newLog: MigrationLog = {
      timestamp: new Date().toLocaleString('ja-JP'),
      action,
      success,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const checkDataStatus = async () => {
    try {
      setIsLoading(true);
      addLog('データ状況確認', true, 'データ状況の確認を開始しています...');

      // localStorageのデータ件数を確認
      const localOrders = orderStore.getOrders();
      
      // Firestoreのデータ件数を確認
      const firestoreOrders = await firestoreOrderStore.getOrders();

      setStats({
        localStorageCount: localOrders.length,
        firestoreCount: firestoreOrders.length,
        migrated: 0,
        errors: 0
      });

      addLog('データ状況確認', true, 
        `localStorage: ${localOrders.length}件, Firestore: ${firestoreOrders.length}件`);
    } catch (error) {
      addLog('データ状況確認', false, `エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateData = async () => {
    try {
      setIsLoading(true);
      addLog('データ移行', true, 'localStorageからFirestoreへのデータ移行を開始しています...');

      const success = await firestoreOrderStore.migrateFromLocalStorage();
      
      if (success) {
        addLog('データ移行', true, 'データ移行が正常に完了しました');
        await checkDataStatus(); // 移行後の状況を確認
      } else {
        addLog('データ移行', false, 'データ移行に失敗しました');
      }
    } catch (error) {
      addLog('データ移行', false, `移行エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFirestore = async () => {
    if (!window.confirm('Firestoreのすべてのデータを削除してもよろしいですか？\nこの操作は取り消せません。')) {
      return;
    }

    try {
      setIsLoading(true);
      addLog('Firestoreクリア', true, 'Firestoreのデータ削除を開始しています...');

      const success = await firestoreOrderStore.clearAll();
      
      if (success) {
        addLog('Firestoreクリア', true, 'Firestoreのデータを正常に削除しました');
        await checkDataStatus();
      } else {
        addLog('Firestoreクリア', false, 'データ削除に失敗しました');
      }
    } catch (error) {
      addLog('Firestoreクリア', false, `削除エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocalStorage = () => {
    if (!window.confirm('localStorageのすべてのデータを削除してもよろしいですか？\nこの操作は取り消せません。')) {
      return;
    }

    try {
      orderStore.clearAll();
      addLog('localStorageクリア', true, 'localStorageのデータを削除しました');
      checkDataStatus();
    } catch (error) {
      addLog('localStorageクリア', false, `削除エラー: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <Database className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">データ移行ツール</h2>
      </div>

      {/* データ状況表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">localStorage</h3>
          <div className="text-2xl font-bold text-blue-600">{stats.localStorageCount}件</div>
          <p className="text-sm text-gray-500">ローカルストレージ内のデータ</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Firestore</h3>
          <div className="text-2xl font-bold text-green-600">{stats.firestoreCount}件</div>
          <p className="text-sm text-gray-500">Firestore内のデータ</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={checkDataStatus}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database className="w-4 h-4" />
          <span>状況確認</span>
        </button>

        <button
          onClick={migrateData}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span>移行実行</span>
        </button>

        <button
          onClick={clearFirestore}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>Firestore削除</span>
        </button>

        <button
          onClick={clearLocalStorage}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>localStorage削除</span>
        </button>
      </div>

      {/* 警告メッセージ */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">注意事項</h3>
            <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
              <li>データ移行は既存のFirestoreデータに追加されます</li>
              <li>重複データが発生する可能性があります</li>
              <li>削除操作は取り消せません</li>
              <li>本番環境では十分注意して実行してください</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ログ表示 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">実行ログ</h3>
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              ログはありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <div key={index} className="p-3 flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {log.success ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.timestamp}
                      </p>
                    </div>
                    <p className={`text-sm ${log.success ? 'text-gray-600' : 'text-red-600'}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}