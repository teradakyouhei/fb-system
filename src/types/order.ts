// 新規受注登録システム 51項目仕様

// 1. 基本情報セクション
export interface BasicInfo {
  orderNumber: string; // 受注NO（自動採番：西暦+担当者コード№+0000）
  projectCode: string; // 件名コード
  projectName: string; // 件名名称
  customerCode: string; // 得意先コード
  customerName: string; // 得意先名称
  propertyName: string; // 物件名
  estimateDate: Date; // 見積日
  orderDate: Date; // 受注日
  paymentDate: Date; // 支払日
  deliveryDate: Date; // 納品日
  assignedStaff: string; // 担当者
  estimateAmount: number; // 受注見積金額（総額）
  costAmount: number; // 原価金額（総額）
}

// 2. 制御・設定セクション
export interface OrderControls {
  isOrdered: boolean; // 受注
  showDetails: boolean; // 明細表示
  isRedSlip: boolean; // 赤伝（ONで全額マイナス）
  isInstructionOnly: boolean; // 指示書のみ
  instructionType: 'construction' | 'inspection' | 'training' | 'sales' | 'research' | 'outsourcing-construction' | 'outsourcing-inspection' | 'building-inspection' | 'load-test'; // 指示項目
}

// 3. 現場情報セクション
export interface SiteInfo {
  siteManager: string; // 現場担当者
  clientManager: string; // 取引先担当者
  propertyAddress: string; // 物件住所
  autolockNumber: string; // オートロック№
}

// 4. 点検情報セクション
export interface InspectionInfo {
  inspectionCycle: 'half-year' | '1-year' | '3-year' | 'new'; // 点検周期
  inspectionData: string; // 点検表データ（詳細仕様要確認）
  creationDate: Date; // 作成日
  copies: number; // 部数
  confirmation: string; // 確認
  submissionDate: Date; // 提出日
  creator: string; // 作成者
  remarks: string; // 備考
}

// 5. 内訳明細情報
export interface OrderDetail {
  no: number; // NO（連番）
  name: string; // 名称
  taxRate: number; // 税率
  productCode: string; // 品名コード
  productName: string; // 品名
  quantity: number; // 数量
  unit: string; // 単位
  unitPrice: number; // 単価
  cost: number; // 原価
  workload: number; // 歩掛
  isWiring: boolean; // 配線
  isOrdered: boolean; // 発注
  supplierCode: string; // 発注先コード
  supplierName: string; // 発注先名称
}

// 6. 工事費用セクション
export interface ConstructionCosts {
  equipmentInstallationCost: { amount: number; cost: number }; // 機器取付工事費
  wiringCost: { amount: number; cost: number }; // 配線工事費
  adjustmentTestCost: { amount: number; cost: number }; // 調整・試験費
  miscellaneousSuppliesCost: { amount: number; cost: number }; // 雑材・消耗品費
  legalWelfareCost: { amount: number; cost: number }; // 法定福利費
  transportationCost: { amount: number; cost: number }; // 交通費
  generalExpenses: { amount: number; cost: number }; // 諸経費
  wasteCollectionCost: { amount: number; cost: number }; // 廃棄物収集保管運搬費
  precisionDiscount: number; // 出精値引き
}

// メインの受注情報型
export interface Order {
  id?: string;
  basicInfo: BasicInfo;
  controls: OrderControls;
  siteInfo: SiteInfo;
  inspectionInfo: InspectionInfo;
  details: OrderDetail[];
  constructionCosts: ConstructionCosts;
  createdAt?: Date;
  updatedAt?: Date;
}

// マスターデータ型
export interface Customer {
  code: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  code: string;
}

export interface Product {
  code: string;
  name: string;
  unitPrice?: number;
  cost?: number;
  supplierCode?: string;
  supplierName?: string;
}

export interface Supplier {
  code: string;
  name: string;
}

// フォーム用の状態管理型
export interface OrderFormState {
  order: Order;
  isLoading: boolean;
  errors: Record<string, string>;
}