'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RequireAuth({ 
  children, 
  redirectTo = '/login' 
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">FB-System</h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>認証情報を確認中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (!isAuthenticated) {
    return null;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
}