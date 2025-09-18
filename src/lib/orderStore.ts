// 簡易的な受注データストア（本番環境では実際のデータベースを使用すること）

import { OrderListItem } from '@/types/orderList';

// 初期サンプルデータ
const initialOrders: OrderListItem[] = [
  {
    id: `order-${Date.now()}-1`,
    isOrdered: true,
    isConfirmed: true,
    isReceived: false,
    orderNo: 'FB2025-001',
    title: '消火器点検・自動火災報知設備工事',
    client: '株式会社サンプル商事',
    projectName: 'サンプル商事本社ビル',
    assignee: '田中太郎',
    estimateDate: new Date('2025-01-10'),
    orderDate: new Date('2025-01-15'),
    deliveryDate: new Date('2025-02-28'),
    registeredAt: new Date('2025-01-10 09:30:00'),
    latestSalesSlipIssuedAt: new Date('2025-01-15 14:20:00'),
    latestSyncAt: new Date('2025-01-15 14:25:00'),
    estimateApprovedAt: new Date('2025-01-12 10:15:00'),
    amount: 350000,
    registeredBy: '田中太郎',
    syncStatus: '完了'
  },
  {
    id: `order-${Date.now()}-2`,
    isOrdered: true,
    isConfirmed: false,
    isReceived: false,
    orderNo: 'FB2025-002',
    title: 'スプリンクラー設備点検業務',
    client: '東京ビル管理株式会社',
    projectName: '東京ビル西館',
    assignee: '佐藤花子',
    estimateDate: new Date('2025-01-12'),
    orderDate: new Date('2025-01-18'),
    deliveryDate: new Date('2025-02-15'),
    registeredAt: new Date('2025-01-12 11:15:00'),
    latestSalesSlipIssuedAt: null,
    latestSyncAt: new Date('2025-01-18 16:10:00'),
    estimateApprovedAt: null,
    amount: 280000,
    registeredBy: '佐藤花子',
    syncStatus: '待機中'
  },
  {
    id: `order-${Date.now()}-3`,
    isOrdered: true,
    isConfirmed: true,
    isReceived: true,
    orderNo: 'FB2025-003',
    title: '排煙設備保守点検業務',
    client: 'ABC不動産管理株式会社',
    projectName: 'ABCビル新館',
    assignee: '田中太郎',
    estimateDate: new Date('2025-01-05'),
    orderDate: new Date('2025-01-08'),
    deliveryDate: new Date('2025-01-31'),
    registeredAt: new Date('2025-01-05 13:45:00'),
    latestSalesSlipIssuedAt: new Date('2025-01-08 10:30:00'),
    latestSyncAt: new Date('2025-01-31 17:00:00'),
    estimateApprovedAt: new Date('2025-01-06'),
    amount: 320000,
    registeredBy: '田中太郎',
    syncStatus: '完了'
  },
];

class OrderStore {
  private orders: OrderListItem[] = [];
  private nextOrderNumber: number = 4; // 次の受注番号

  constructor() {
    // ローカルストレージから既存データを読み込み
    if (typeof window !== 'undefined') {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          this.orders = parsed.map((order: Record<string, unknown>) => ({
            ...order,
            estimateDate: order.estimateDate ? new Date(order.estimateDate) : null,
            orderDate: order.orderDate ? new Date(order.orderDate) : null,
            deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : null,
            registeredAt: order.registeredAt ? new Date(order.registeredAt) : null,
            latestSalesSlipIssuedAt: order.latestSalesSlipIssuedAt ? new Date(order.latestSalesSlipIssuedAt) : null,
            latestSyncAt: order.latestSyncAt ? new Date(order.latestSyncAt) : null,
            estimateApprovedAt: order.estimateApprovedAt ? new Date(order.estimateApprovedAt) : null,
          }));
          // 次の受注番号を計算
          const maxOrderNo = this.orders.reduce((max, order) => {
            const match = order.orderNo.match(/FB2025-(\d+)/);
            if (match) {
              const num = parseInt(match[1]);
              return Math.max(max, num);
            }
            return max;
          }, 0);
          this.nextOrderNumber = maxOrderNo + 1;
        } catch (e) {
          console.error('Failed to parse saved orders:', e);
          this.orders = [...initialOrders];
          this.saveToLocalStorage();
        }
      } else {
        // 初回起動時はサンプルデータを設定
        this.orders = [...initialOrders];
        this.saveToLocalStorage();
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders', JSON.stringify(this.orders));
    }
  }

  // ユニークな受注番号を生成
  generateOrderNo(): string {
    const orderNo = `FB2025-${String(this.nextOrderNumber).padStart(3, '0')}`;
    this.nextOrderNumber++;
    return orderNo;
  }

  // ユニークなIDを生成
  generateId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 全受注を取得
  getOrders(): OrderListItem[] {
    return [...this.orders];
  }

  // 受注を追加
  addOrder(orderData: Partial<OrderListItem>): OrderListItem {
    const newOrder: OrderListItem = {
      id: this.generateId(),
      orderNo: orderData.orderNo || this.generateOrderNo(),
      isOrdered: orderData.isOrdered ?? false,
      isConfirmed: orderData.isConfirmed ?? false,
      isReceived: orderData.isReceived ?? false,
      title: orderData.title || '',
      client: orderData.client || '',
      projectName: orderData.projectName || '',
      assignee: orderData.assignee || '',
      estimateDate: orderData.estimateDate || new Date(),
      orderDate: orderData.orderDate || new Date(),
      deliveryDate: orderData.deliveryDate || new Date(),
      registeredAt: new Date(),
      latestSalesSlipIssuedAt: orderData.latestSalesSlipIssuedAt || null,
      latestSyncAt: orderData.latestSyncAt || null,
      estimateApprovedAt: orderData.estimateApprovedAt || null,
      amount: orderData.amount || 0,
      registeredBy: orderData.registeredBy || '未設定',
      syncStatus: orderData.syncStatus || '未実行',
      detailData: orderData.detailData || undefined
    };

    this.orders.unshift(newOrder); // 最新を先頭に追加
    this.saveToLocalStorage();
    return newOrder;
  }

  // 受注を更新
  updateOrder(id: string, updates: Partial<OrderListItem>): OrderListItem | null {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      this.saveToLocalStorage();
      return this.orders[index];
    }
    return null;
  }

  // 受注を削除
  deleteOrder(id: string): boolean {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(order => order.id !== id);
    if (this.orders.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // 受注をIDで取得
  getOrderById(id: string): OrderListItem | null {
    return this.orders.find(order => order.id === id) || null;
  }

  // データをクリア（開発用）
  clearAll() {
    this.orders = [];
    this.nextOrderNumber = 1;
    this.saveToLocalStorage();
  }

  // サンプルデータをリセット
  resetToSample() {
    this.orders = [...initialOrders];
    this.nextOrderNumber = 4;
    this.saveToLocalStorage();
  }
}

// シングルトンインスタンス
export const orderStore = new OrderStore();