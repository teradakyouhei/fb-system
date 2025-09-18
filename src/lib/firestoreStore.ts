import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { OrderListItem } from '@/types/orderList';

// Firestore用のOrderListItem型（Dateオブジェクトを含む）
export interface FirestoreOrderListItem extends Omit<OrderListItem, 'estimateDate' | 'orderDate' | 'deliveryDate' | 'registeredAt' | 'latestSalesSlipIssuedAt' | 'latestSyncAt' | 'estimateApprovedAt'> {
  estimateDate: Timestamp;
  orderDate: Timestamp;
  deliveryDate: Timestamp;
  registeredAt: Timestamp;
  latestSalesSlipIssuedAt: Timestamp | null;
  latestSyncAt: Timestamp | null;
  estimateApprovedAt: Timestamp | null;
}

class FirestoreOrderStore {
  private collectionName = 'orders';
  private nextOrderNumber: number = 1;

  constructor() {
    this.initializeOrderNumber();
  }

  // 次の受注番号を初期化
  private async initializeOrderNumber() {
    try {
      const ordersRef = collection(db, this.collectionName);
      const snapshot = await getDocs(ordersRef);
      
      let maxOrderNo = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const match = data.orderNo?.match(/FB2025-(\\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          maxOrderNo = Math.max(maxOrderNo, num);
        }
      });
      
      this.nextOrderNumber = maxOrderNo + 1;
    } catch (error) {
      console.error('受注番号の初期化エラー:', error);
      this.nextOrderNumber = 1;
    }
  }

  // ユニークな受注番号を生成
  generateOrderNo(): string {
    const orderNo = `FB2025-${String(this.nextOrderNumber).padStart(3, '0')}`;
    this.nextOrderNumber++;
    return orderNo;
  }

  // DateオブジェクトをTimestampに変換
  private convertToTimestamp(date: Date | null): Timestamp | null {
    return date ? Timestamp.fromDate(date) : null;
  }

  // TimestampをDateオブジェクトに変換
  private convertToDate(timestamp: Timestamp | null): Date | null {
    return timestamp ? timestamp.toDate() : null;
  }

  // OrderListItemをFirestore形式に変換
  private convertToFirestore(order: Partial<OrderListItem>): Partial<FirestoreOrderListItem> {
    const firestoreOrder: Partial<FirestoreOrderListItem> = { ...order };
    
    if (order.estimateDate) firestoreOrder.estimateDate = this.convertToTimestamp(order.estimateDate);
    if (order.orderDate) firestoreOrder.orderDate = this.convertToTimestamp(order.orderDate);
    if (order.deliveryDate) firestoreOrder.deliveryDate = this.convertToTimestamp(order.deliveryDate);
    if (order.registeredAt) firestoreOrder.registeredAt = this.convertToTimestamp(order.registeredAt);
    if (order.latestSalesSlipIssuedAt) firestoreOrder.latestSalesSlipIssuedAt = this.convertToTimestamp(order.latestSalesSlipIssuedAt);
    if (order.latestSyncAt) firestoreOrder.latestSyncAt = this.convertToTimestamp(order.latestSyncAt);
    if (order.estimateApprovedAt) firestoreOrder.estimateApprovedAt = this.convertToTimestamp(order.estimateApprovedAt);
    
    return firestoreOrder;
  }

  // Firestore形式をOrderListItemに変換
  private convertFromFirestore(firestoreOrder: FirestoreOrderListItem & { id: string }): OrderListItem {
    return {
      ...firestoreOrder,
      estimateDate: this.convertToDate(firestoreOrder.estimateDate) || new Date(),
      orderDate: this.convertToDate(firestoreOrder.orderDate) || new Date(),
      deliveryDate: this.convertToDate(firestoreOrder.deliveryDate) || new Date(),
      registeredAt: this.convertToDate(firestoreOrder.registeredAt) || new Date(),
      latestSalesSlipIssuedAt: this.convertToDate(firestoreOrder.latestSalesSlipIssuedAt),
      latestSyncAt: this.convertToDate(firestoreOrder.latestSyncAt),
      estimateApprovedAt: this.convertToDate(firestoreOrder.estimateApprovedAt),
    };
  }

  // 全受注を取得
  async getOrders(): Promise<OrderListItem[]> {
    try {
      const ordersRef = collection(db, this.collectionName);
      const q = query(ordersRef, orderBy('registeredAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreOrderListItem;
        return this.convertFromFirestore({ ...data, id: doc.id });
      });
    } catch (error) {
      console.error('受注データの取得エラー:', error);
      return [];
    }
  }

  // 受注を追加
  async addOrder(orderData: Partial<OrderListItem>): Promise<OrderListItem | null> {
    try {
      const newOrder: Partial<OrderListItem> = {
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

      const firestoreOrder = this.convertToFirestore(newOrder);
      const ordersRef = collection(db, this.collectionName);
      const docRef = await addDoc(ordersRef, firestoreOrder);
      
      return { ...newOrder, id: docRef.id } as OrderListItem;
    } catch (error) {
      console.error('受注追加エラー:', error);
      return null;
    }
  }

  // 受注を更新
  async updateOrder(id: string, updates: Partial<OrderListItem>): Promise<OrderListItem | null> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      const firestoreUpdates = this.convertToFirestore(updates);
      
      await updateDoc(orderRef, firestoreUpdates);
      
      // 更新後のデータを取得
      const updatedDoc = await getDoc(orderRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data() as FirestoreOrderListItem;
        return this.convertFromFirestore({ ...data, id: updatedDoc.id });
      }
      
      return null;
    } catch (error) {
      console.error('受注更新エラー:', error);
      return null;
    }
  }

  // 受注を削除
  async deleteOrder(id: string): Promise<boolean> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      await deleteDoc(orderRef);
      return true;
    } catch (error) {
      console.error('受注削除エラー:', error);
      return false;
    }
  }

  // 受注をIDで取得
  async getOrderById(id: string): Promise<OrderListItem | null> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(orderRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreOrderListItem;
        return this.convertFromFirestore({ ...data, id: docSnap.id });
      }
      
      return null;
    } catch (error) {
      console.error('受注取得エラー:', error);
      return null;
    }
  }

  // localStorageのデータをFirestoreに移行
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      
      const savedOrders = localStorage.getItem('orders');
      if (!savedOrders) return true; // データがない場合は成功とみなす
      
      const orders = JSON.parse(savedOrders);
      
      for (const order of orders) {
        // 日付文字列をDateオブジェクトに変換
        const processedOrder = {
          ...order,
          estimateDate: order.estimateDate ? new Date(order.estimateDate) : new Date(),
          orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : new Date(),
          registeredAt: order.registeredAt ? new Date(order.registeredAt) : new Date(),
          latestSalesSlipIssuedAt: order.latestSalesSlipIssuedAt ? new Date(order.latestSalesSlipIssuedAt) : null,
          latestSyncAt: order.latestSyncAt ? new Date(order.latestSyncAt) : null,
          estimateApprovedAt: order.estimateApprovedAt ? new Date(order.estimateApprovedAt) : null,
        };
        
        // idを除外してFirestoreに追加
        const { id: _, ...orderData } = processedOrder;
        await this.addOrder(orderData);
      }
      
      console.log(`${orders.length}件のデータをFirestoreに移行しました`);
      return true;
    } catch (error) {
      console.error('データ移行エラー:', error);
      return false;
    }
  }

  // Firestoreのデータをクリア（開発用）
  async clearAll(): Promise<boolean> {
    try {
      const ordersRef = collection(db, this.collectionName);
      const snapshot = await getDocs(ordersRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      this.nextOrderNumber = 1;
      console.log('全ての受注データを削除しました');
      return true;
    } catch (error) {
      console.error('データクリアエラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const firestoreOrderStore = new FirestoreOrderStore();