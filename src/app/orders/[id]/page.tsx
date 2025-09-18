'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
// import { prisma } from '@/lib/prisma'; // クライアントサイドでは使用不可
import { firestoreOrderStore } from '@/lib/firestoreStore';
import { 
  Building2, 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
    tel?: string;
    email?: string;
    address?: string;
    contactPerson?: string;
  };
  projectName: string;
  orderDate: Date;
  deliveryDate: Date;
  salesAmount: number;
  status: string;
  staffId?: string;
  staff?: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

function OrderDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 受注データの取得（モックデータを使用）
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        
        // Firestoreから受注データを取得
        const orderData = await firestoreOrderStore.getOrderById(orderId);
        if (orderData) {
          // OrderListItemからOrder型に変換（必要に応じて）
          const mockOrderData: Order = {
            id: orderData.id,
            orderNo: orderData.orderNo,
            customerId: 'customer-1',
            customer: {
              id: 'customer-1',
              code: 'CUST001',
              name: orderData.client,
              tel: '03-1234-5678',
              email: 'contact@sample-corp.co.jp',
              address: '東京都千代田区丸の内1-1-1',
              contactPerson: '営業部 鈴木様'
            },
            projectName: orderData.title,
            orderDate: orderData.orderDate,
            deliveryDate: orderData.deliveryDate,
            salesAmount: orderData.amount,
            status: '受注済み',
            staffId: 'staff-1',
            staff: {
              id: 'staff-1',
              code: 'STF001',
              name: orderData.assignee
            },
            createdAt: orderData.registeredAt,
            updatedAt: orderData.latestSyncAt || orderData.registeredAt
          };
          setOrder(mockOrderData);
        } else {
          console.error('受注データが見つかりません');
          router.push('/orders');
        }
      } catch (error) {
        console.error('受注データの取得エラー:', error);
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // 受注削除
  const handleDelete = async () => {
    if (!order) return;

    const confirmed = window.confirm(`受注「${order.orderNo}」を削除してもよろしいですか？\nこの操作は取り消せません。`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const success = await firestoreOrderStore.deleteOrder(order.id);
      if (!success) {
        throw new Error('削除に失敗しました');
      }

      alert('受注を削除しました');
      router.push('/orders');
    } catch (error) {
      console.error('受注削除エラー:', error);
      alert('受注の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  // ステータス別の色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '見積中': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '受注': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '進行中': return 'bg-green-100 text-green-800 border-green-200';
      case '完了': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 金額のフォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  // 日付のフォーマット
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 日時のフォーマット
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('ja-JP');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">受注が見つかりませんでした</div>
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            受注一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">受注詳細</h1>
                <p className="text-xs text-gray-500">{order.orderNo} - {order.projectName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/orders/${order.id}/edit`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>編集</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? '削除中...' : '削除'}</span>
              </button>
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>一覧に戻る</span>
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
            { label: '受注管理', href: '/orders' },
            { label: order ? `${order.orderNo} - ${order.projectName}` : '受注詳細', current: true }
          ]}
          className="mb-6"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 受注基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                受注基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">受注番号</label>
                  <p className="text-lg font-semibold text-gray-900">{order.orderNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ステータス</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">作業名</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {order.projectName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">売上金額</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    {formatAmount(order.salesAmount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">受注日</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">納期</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(order.deliveryDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* 得意先情報 */}
            {order.customer && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  得意先情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">会社名</label>
                    <p className="text-gray-900 font-semibold">{order.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">顧客コード</label>
                    <p className="text-gray-900">{order.customer.code}</p>
                  </div>
                  {order.customer.address && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                      <p className="text-gray-900 flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-1 text-gray-400 flex-shrink-0" />
                        {order.customer.address}
                      </p>
                    </div>
                  )}
                  {order.customer.tel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {order.customer.tel}
                      </p>
                    </div>
                  )}
                  {order.customer.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {order.customer.email}
                      </p>
                    </div>
                  )}
                  {order.customer.contactPerson && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">担当者</label>
                      <p className="text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        {order.customer.contactPerson}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右側：追加情報 */}
          <div className="space-y-6">
            {/* 担当者情報 */}
            {order.staff && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  担当者
                </h3>
                <div>
                  <p className="text-gray-900 font-semibold">{order.staff.name}</p>
                  <p className="text-gray-500 text-sm">{order.staff.code}</p>
                </div>
              </div>
            )}

            {/* システム情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                システム情報
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">作成日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">更新日時</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(order.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/orders/${order.id}/edit`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>受注を編集</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? '削除中...' : '受注を削除'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <OrderDetailContent />
    </RequireAuth>
  );
}