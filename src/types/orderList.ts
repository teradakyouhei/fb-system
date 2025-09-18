// 受注一覧システム - 19カラム仕様

export interface OrderListItem {
  id: string;
  
  // 状態・フラグ系 (3項目)
  isOrdered: boolean;    // 受注
  isConfirmed: boolean;  // 確定
  isReceived: boolean;   // 受領
  
  // 基本情報系 (5項目)
  orderNo: string;       // 受注NO
  title: string;         // 件名
  client: string;        // 得意先
  projectName: string;   // 物件名
  assignee: string;      // 担当者
  
  // 日付系 (7項目)
  estimateDate: Date;                    // 見積日
  orderDate: Date;                       // 受注日
  deliveryDate: Date;                    // 納品日
  registeredAt: Date;                    // 登録日時
  latestSalesSlipIssuedAt: Date | null;  // 売上伝票最新発行日時
  latestSyncAt: Date | null;             // 最新同期日時
  estimateApprovedAt: Date | null;       // 見積承認確定日
  
  // 金額・システム管理系 (3項目)
  amount: number;        // 受注・見積金額
  registeredBy: string;  // 登録ユーザー
  syncStatus: SyncStatus; // 同期
  
  // 詳細情報（編集画面で使用）
  detailData?: string; // JSON文字列として詳細情報を保存
}

export type SyncStatus = '完了' | '待機中' | 'エラー' | '未実行';

export interface OrderListFilters {
  searchTerm: string;
  statusFilter: {
    isOrdered?: boolean;
    isConfirmed?: boolean;
    isReceived?: boolean;
  };
  assigneeFilter: string;
  clientFilter: string;
  estimateDateFrom: string;
  estimateDateTo: string;
  orderDateFrom: string;
  orderDateTo: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  amountMin: string;
  amountMax: string;
  syncStatusFilter: SyncStatus | '';
}

export interface OrderListSort {
  field: keyof OrderListItem;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface BulkAction {
  type: 'delete' | 'export' | 'updateStatus';
  selectedIds: string[];
  statusUpdate?: {
    isOrdered?: boolean;
    isConfirmed?: boolean;
    isReceived?: boolean;
  };
}

// テーブル表示設定
export interface TableColumn {
  key: keyof OrderListItem;
  label: string;
  width: string;
  sortable: boolean;
  visible: boolean;
  type: 'boolean' | 'string' | 'date' | 'datetime' | 'currency' | 'status';
}

export const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'isOrdered', label: '受注', width: '60px', sortable: true, visible: true, type: 'boolean' },
  { key: 'isConfirmed', label: '確定', width: '60px', sortable: true, visible: true, type: 'boolean' },
  { key: 'isReceived', label: '受領', width: '60px', sortable: true, visible: true, type: 'boolean' },
  { key: 'orderNo', label: '受注NO', width: '120px', sortable: true, visible: true, type: 'string' },
  { key: 'title', label: '件名', width: '200px', sortable: true, visible: true, type: 'string' },
  { key: 'client', label: '得意先', width: '150px', sortable: true, visible: true, type: 'string' },
  { key: 'projectName', label: '物件名', width: '150px', sortable: true, visible: true, type: 'string' },
  { key: 'assignee', label: '担当者', width: '100px', sortable: true, visible: true, type: 'string' },
  { key: 'estimateDate', label: '見積日', width: '100px', sortable: true, visible: true, type: 'date' },
  { key: 'orderDate', label: '受注日', width: '100px', sortable: true, visible: true, type: 'date' },
  { key: 'deliveryDate', label: '納品日', width: '100px', sortable: true, visible: true, type: 'date' },
  { key: 'registeredAt', label: '登録日時', width: '130px', sortable: true, visible: true, type: 'datetime' },
  { key: 'latestSalesSlipIssuedAt', label: '売上伝票最新発行日時', width: '160px', sortable: true, visible: true, type: 'datetime' },
  { key: 'latestSyncAt', label: '最新同期日時', width: '130px', sortable: true, visible: true, type: 'datetime' },
  { key: 'estimateApprovedAt', label: '見積承認確定日', width: '130px', sortable: true, visible: true, type: 'date' },
  { key: 'amount', label: '受注・見積金額', width: '130px', sortable: true, visible: true, type: 'currency' },
  { key: 'registeredBy', label: '登録ユーザー', width: '100px', sortable: true, visible: true, type: 'string' },
  { key: 'syncStatus', label: '同期', width: '80px', sortable: true, visible: true, type: 'status' },
];

// レスポンシブ表示用の優先度設定
export const RESPONSIVE_PRIORITIES = {
  mobile: ['orderNo', 'title', 'amount', 'orderDate'],
  tablet: ['orderNo', 'title', 'client', 'assignee', 'amount', 'orderDate', 'deliveryDate'],
  desktop: 'all'
} as const;