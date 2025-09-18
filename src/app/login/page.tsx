'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // 既に認証済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // 認証チェック中はローディング表示
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // 既に認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.userId, formData.password);
      
      if (!result.success) {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーメッセージをクリア
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-white/10 p-3 rounded-full">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">FB-System</h1>
            <p className="text-blue-100 text-sm">富士防災システム受注管理</p>
          </div>

          {/* ログインフォーム */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* ユーザーID入力 */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザーID
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="admin"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* パスワード入力 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* ログインボタン */}
              <button
                type="submit"
                disabled={isLoading || !formData.userId || !formData.password}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ログイン中...
                  </div>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>

            {/* デモアカウント情報 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-2">デモアカウント</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div><strong>ユーザーID:</strong> admin</div>
                  <div><strong>パスワード:</strong> admin123</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 株式会社富士防災システム
          </p>
          <p className="text-xs text-gray-400 mt-1">
            防災・消防設備の総合管理システム
          </p>
        </div>
      </div>
    </div>
  );
}