'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RequireAuth from '@/components/RequireAuth';
import Breadcrumb from '@/components/Breadcrumb';
import { firestoreOrderStore } from '@/lib/firestoreStore';
import { Order, BasicInfo, OrderControls, SiteInfo, InspectionInfo, OrderDetail, ConstructionCosts } from '@/types/order';
import { 
  Building2, 
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  FileText,
  MapPin,
  Plus,
  Minus,
  Info,
  Settings,
  CheckSquare,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface Staff {
  id: string;
  code: string;
  name: string;
}

function NewOrderContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // 51項目仕様に基づく初期データ
  const [order, setOrder] = useState<Order>({
    basicInfo: {
      orderNumber: '', // 自動採番
      projectCode: '',
      projectName: '',
      customerCode: '',
      customerName: '',
      propertyName: '',
      estimateDate: new Date(),
      orderDate: new Date(),
      paymentDate: new Date(),
      deliveryDate: new Date(),
      assignedStaff: '',
      estimateAmount: 0,
      costAmount: 0
    },
    controls: {
      isOrdered: false,
      showDetails: true,
      isRedSlip: false,
      isInstructionOnly: false,
      instructionType: 'construction'
    },
    siteInfo: {
      siteManager: '',
      clientManager: '',
      propertyAddress: '',
      autolockNumber: ''
    },
    inspectionInfo: {
      inspectionCycle: 'half-year',
      inspectionData: '',
      creationDate: new Date(),
      copies: 1,
      confirmation: '',
      submissionDate: new Date(),
      creator: '',
      remarks: ''
    },
    details: [
      {
        no: 1,
        name: '',
        taxRate: 10,
        productCode: '',
        productName: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        cost: 0,
        workload: 0,
        isWiring: false,
        isOrdered: false,
        supplierCode: '',
        supplierName: ''
      }
    ],
    constructionCosts: {
      equipmentInstallationCost: { amount: 0, cost: 0 },
      wiringCost: { amount: 0, cost: 0 },
      adjustmentTestCost: { amount: 0, cost: 0 },
      miscellaneousSuppliesCost: { amount: 0, cost: 0 },
      legalWelfareCost: { amount: 0, cost: 0 },
      transportationCost: { amount: 0, cost: 0 },
      generalExpenses: { amount: 0, cost: 0 },
      wasteCollectionCost: { amount: 0, cost: 0 },
      precisionDiscount: 0
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 基本情報の更新
  const updateBasicInfo = (field: keyof BasicInfo, value: any) => {
    setOrder(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  // 制御・設定の更新
  const updateControls = (field: keyof OrderControls, value: any) => {
    setOrder(prev => ({
      ...prev,
      controls: {
        ...prev.controls,
        [field]: value
      }
    }));
  };

  // 現場情報の更新
  const updateSiteInfo = (field: keyof SiteInfo, value: any) => {
    setOrder(prev => ({
      ...prev,
      siteInfo: {
        ...prev.siteInfo,
        [field]: value
      }
    }));
  };

  // 点検情報の更新
  const updateInspectionInfo = (field: keyof InspectionInfo, value: any) => {
    setOrder(prev => ({
      ...prev,
      inspectionInfo: {
        ...prev.inspectionInfo,
        [field]: value
      }
    }));
  };

  // 工事費用の更新
  const updateConstructionCosts = (field: keyof ConstructionCosts, value: any) => {
    setOrder(prev => ({
      ...prev,
      constructionCosts: {
        ...prev.constructionCosts,
        [field]: value
      }
    }));
  };

  // 明細行の追加
  const addDetailRow = () => {
    const newRow: OrderDetail = {
      no: order.details.length + 1,
      name: '',
      taxRate: 10,
      productCode: '',
      productName: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      cost: 0,
      workload: 0,
      isWiring: false,
      isOrdered: false,
      supplierCode: '',
      supplierName: ''
    };
    setOrder(prev => ({
      ...prev,
      details: [...prev.details, newRow]
    }));
  };

  // 明細行の削除
  const removeDetailRow = (index: number) => {
    if (order.details.length > 1) {
      setOrder(prev => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index)
      }));
    }
  };

  // 明細行の更新
  const updateDetailRow = (index: number, field: keyof OrderDetail, value: any) => {
    setOrder(prev => ({
      ...prev,
      details: prev.details.map((detail, i) => 
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  // Excel出力機能 - UPDATED
  const exportToExcel = () => {
    const data: (string | number)[][] = [];
    
    // 基本情報を縦並びで配列に追加
    data.push(['=== 基本情報 ===']);
    data.push(['受注番号', order.basicInfo.orderNumber || '']);
    data.push(['工事コード', order.basicInfo.projectCode || '']);
    data.push(['工事件名', order.basicInfo.projectName || '']);
    data.push(['得意先コード', order.basicInfo.customerCode || '']);
    data.push(['得意先名', order.basicInfo.customerName || '']);
    data.push(['直請担当者', order.basicInfo.mainContactPerson || '']);
    data.push(['営業担当者コード', order.basicInfo.salesStaffCode || '']);
    data.push(['営業担当者名', order.basicInfo.salesStaffName || '']);
    data.push(['現場管理者コード', order.basicInfo.siteManagerCode || '']);
    data.push(['現場管理者名', order.basicInfo.siteManagerName || '']);
    data.push(['受注金額', order.basicInfo.orderAmount || 0]);
    data.push(['受注日', order.basicInfo.orderDate || '']);
    data.push(['工期開始日', order.basicInfo.workStartDate || '']);
    data.push(['工期終了日', order.basicInfo.workEndDate || '']);
    
    // 現場情報
    data.push(['=== 現場情報 ===']);
    data.push(['現場名称', order.siteInfo.siteName || '']);
    data.push(['現場住所', order.siteInfo.siteAddress || '']);
    data.push(['現場連絡先', order.siteInfo.siteContact || '']);
    data.push(['建物種別', order.siteInfo.buildingType || '']);
    data.push(['延床面積', order.siteInfo.totalFloorArea || '']);
    data.push(['階数', order.siteInfo.floors || '']);
    data.push(['竣工年', order.siteInfo.completionYear || '']);
    
    // 点検情報
    data.push(['=== 点検情報 ===']);
    data.push(['点検種別', order.inspectionInfo.inspectionType || '']);
    data.push(['点検周期', order.inspectionInfo.inspectionCycle || '']);
    data.push(['前回点検日', order.inspectionInfo.lastInspectionDate || '']);
    data.push(['次回点検日', order.inspectionInfo.nextInspectionDate || '']);
    data.push(['点検者名', order.inspectionInfo.inspectorName || '']);
    data.push(['点検結果', order.inspectionInfo.inspectionResult || '']);
    data.push(['備考', order.inspectionInfo.remarks || '']);
    
    // 受注管理
    data.push(['=== 受注管理 ===']);
    data.push(['受注区分', order.orderControls.orderCategory || '']);
    data.push(['工事区分', order.orderControls.workCategory || '']);
    data.push(['請求書発行日', order.orderControls.invoiceIssueDate || '']);
    data.push(['入金予定日', order.orderControls.paymentDueDate || '']);
    data.push(['入金確認日', order.orderControls.paymentConfirmDate || '']);
    data.push(['工事完了日', order.orderControls.workCompletionDate || '']);
    data.push(['検収日', order.orderControls.acceptanceDate || '']);
    data.push(['保証期間', order.orderControls.warrantyPeriod || '']);
    data.push(['受注状況', order.orderControls.orderStatus || '']);
    
    // 工事費用
    data.push(['=== 工事費用 ===']);
    data.push(['材料費', order.constructionCosts.materialCost || 0]);
    data.push(['労務費', order.constructionCosts.laborCost || 0]);
    data.push(['外注費', order.constructionCosts.subcontractCost || 0]);
    data.push(['経費', order.constructionCosts.expense || 0]);
    data.push(['利益', order.constructionCosts.profit || 0]);
    data.push(['消費税', order.constructionCosts.tax || 0]);
    data.push(['合計金額', order.constructionCosts.totalAmount || 0]);
    
    // 明細情報
    data.push(['=== 明細情報 ===']);
    order.details.forEach((detail, index) => {
      data.push([`明細${index + 1}: 項目名`, detail.name || '']);
      data.push([`明細${index + 1}: 商品コード`, detail.productCode || '']);
      data.push([`明細${index + 1}: 商品名`, detail.productName || '']);
      data.push([`明細${index + 1}: 数量`, detail.quantity || 0]);
      data.push([`明細${index + 1}: 単位`, detail.unit || '']);
      data.push([`明細${index + 1}: 単価`, detail.unitPrice || 0]);
      data.push([`明細${index + 1}: 金額`, detail.cost || 0]);
      data.push([`明細${index + 1}: 工数`, detail.workload || 0]);
      data.push([`明細${index + 1}: 配線工事`, detail.isWiring ? 'あり' : 'なし']);
      data.push([`明細${index + 1}: 発注済み`, detail.isOrdered ? 'はい' : 'いいえ']);
      data.push([`明細${index + 1}: 仕入先コード`, detail.supplierCode || '']);
      data.push([`明細${index + 1}: 仕入先名`, detail.supplierName || '']);
    });
    
    // ワークシートとワークブックを作成
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '受注データ');
    
    // ファイル名を生成（受注番号 + 日時）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `受注データ_${order.basicInfo.orderNumber || 'NEW'}_${timestamp}.xlsx`;
    
    // ファイルダウンロード
    XLSX.writeFile(workbook, filename);
  };

  // 初期データの取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 得意先データ
        const allCustomers = [
          { id: 'customer-1', code: 'CUST001', name: '株式会社サンプル商事' },
          { id: 'customer-2', code: 'CUST002', name: 'テストビル管理株式会社' },
          { id: 'customer-3', code: 'CUST003', name: '有限会社デモマンション' },
          { id: 'customer-4', code: 'CUST004', name: '東京防災設備株式会社' },
        ];
        setCustomers(allCustomers);

        // 担当者データ
        const allStaff = [
          { id: 'staff-1', code: 'STAFF001', name: '田中太郎' },
          { id: 'staff-2', code: 'STAFF002', name: '佐藤花子' },
          { id: 'staff-3', code: 'STAFF003', name: '山田次郎' },
        ];
        setStaffList(allStaff);

        // 受注番号の自動生成（ユニークな番号を生成）
        const orderNumber = orderStore.generateOrderNo();
        updateBasicInfo('orderNumber', orderNumber);

      } catch (error) {
        console.error('初期データの取得エラー:', error);
      }
    };

    fetchInitialData();
  }, []);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 赤伝処理
      let processedOrder = { ...order };
      if (order.controls.isRedSlip) {
        // 赤伝ONの場合、全ての金額をマイナスにする
        processedOrder.basicInfo.estimateAmount = -Math.abs(order.basicInfo.estimateAmount);
        processedOrder.basicInfo.costAmount = -Math.abs(order.basicInfo.costAmount);
        processedOrder.details = order.details.map(detail => ({
          ...detail,
          unitPrice: -Math.abs(detail.unitPrice),
          cost: -Math.abs(detail.cost)
        }));
      }

      // Firestoreに保存
      const newOrder = await firestoreOrderStore.addOrder({
        orderNo: processedOrder.basicInfo.orderNumber,
        title: processedOrder.basicInfo.projectName,
        client: processedOrder.basicInfo.customerName,
        projectName: processedOrder.basicInfo.projectName,
        assignee: processedOrder.basicInfo.assignedStaff,
        estimateDate: processedOrder.basicInfo.estimateDate ? new Date(processedOrder.basicInfo.estimateDate) : new Date(),
        orderDate: processedOrder.basicInfo.orderDate ? new Date(processedOrder.basicInfo.orderDate) : new Date(),
        deliveryDate: processedOrder.basicInfo.deliveryDate ? new Date(processedOrder.basicInfo.deliveryDate) : new Date(),
        amount: processedOrder.basicInfo.estimateAmount,
        isOrdered: processedOrder.controls.isOrdered,
        isConfirmed: false,
        isReceived: false,
        registeredBy: '田中太郎', // TODO: 実際のユーザー名を使用
        syncStatus: '未実行',
        detailData: JSON.stringify(processedOrder) // 詳細情報をJSON文字列として保存
      });
      
      console.log('受注登録完了:', newOrder);
      alert('受注登録が完了しました！');
      router.push('/orders');
      
    } catch (error) {
      console.error('受注作成エラー:', error);
      alert('受注の登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">新規受注登録</h1>
                <p className="text-xs text-gray-500">51項目対応受注システム</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ダッシュボードに戻る</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb 
          items={[
            { label: 'ダッシュボード', href: '/dashboard' },
            { label: '新規受注登録', current: true }
          ]}
          className="mb-6"
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. 基本情報セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">1. 基本情報 (13項目)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 受注NO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">受注NO</label>
                <input
                  type="text"
                  value={order.basicInfo.orderNumber}
                  onChange={(e) => updateBasicInfo('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="自動採番: 2025-11-0001"
                  disabled
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              </div>

              {/* 件名コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">件名コード</label>
                <input
                  type="text"
                  value={order.basicInfo.projectCode}
                  onChange={(e) => updateBasicInfo('projectCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="コード番号"
                />
              </div>

              {/* 件名名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">件名名称</label>
                <input
                  type="text"
                  value={order.basicInfo.projectName}
                  onChange={(e) => updateBasicInfo('projectName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="件名を入力"
                />
              </div>

              {/* 得意先コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">得意先コード</label>
                <select
                  value={order.basicInfo.customerCode}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.code === e.target.value);
                    updateBasicInfo('customerCode', e.target.value);
                    updateBasicInfo('customerName', selectedCustomer?.name || '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.code}>
                      {customer.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* 得意先名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">得意先名称</label>
                <input
                  type="text"
                  value={order.basicInfo.customerName}
                  onChange={(e) => updateBasicInfo('customerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="得意先名称"
                />
              </div>

              {/* 物件名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">物件名</label>
                <input
                  type="text"
                  value={order.basicInfo.propertyName}
                  onChange={(e) => updateBasicInfo('propertyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="物件名を入力"
                />
              </div>

              {/* 見積日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">見積日</label>
                <input
                  type="date"
                  value={order.basicInfo.estimateDate.toISOString().split('T')[0]}
                  onChange={(e) => updateBasicInfo('estimateDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 受注日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">受注日</label>
                <input
                  type="date"
                  value={order.basicInfo.orderDate.toISOString().split('T')[0]}
                  onChange={(e) => updateBasicInfo('orderDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 支払日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">支払日</label>
                <input
                  type="date"
                  value={order.basicInfo.paymentDate.toISOString().split('T')[0]}
                  onChange={(e) => updateBasicInfo('paymentDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 納品日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">納品日</label>
                <input
                  type="date"
                  value={order.basicInfo.deliveryDate.toISOString().split('T')[0]}
                  onChange={(e) => updateBasicInfo('deliveryDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 担当者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">担当者</label>
                <select
                  value={order.basicInfo.assignedStaff}
                  onChange={(e) => updateBasicInfo('assignedStaff', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} ({staff.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 受注見積金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">受注見積金額（総額）</label>
                <input
                  type="number"
                  value={order.basicInfo.estimateAmount}
                  onChange={(e) => updateBasicInfo('estimateAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              {/* 原価金額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">原価金額（総額）</label>
                <input
                  type="number"
                  value={order.basicInfo.costAmount}
                  onChange={(e) => updateBasicInfo('costAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* 2. 制御・設定セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">2. 制御・設定 (5項目)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* トグルボタン群 */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOrdered"
                    checked={order.controls.isOrdered}
                    onChange={(e) => updateControls('isOrdered', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isOrdered" className="ml-2 block text-sm text-gray-900">
                    受注
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showDetails"
                    checked={order.controls.showDetails}
                    onChange={(e) => updateControls('showDetails', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showDetails" className="ml-2 block text-sm text-gray-900">
                    明細表示
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRedSlip"
                    checked={order.controls.isRedSlip}
                    onChange={(e) => updateControls('isRedSlip', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRedSlip" className="ml-2 block text-sm text-red-900">
                    赤伝（ONで全額マイナス）
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isInstructionOnly"
                    checked={order.controls.isInstructionOnly}
                    onChange={(e) => updateControls('isInstructionOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isInstructionOnly" className="ml-2 block text-sm text-gray-900">
                    指示書のみ
                  </label>
                </div>
              </div>

              {/* 指示項目 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指示項目</label>
                <select
                  value={order.controls.instructionType}
                  onChange={(e) => updateControls('instructionType', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="construction">工事</option>
                  <option value="inspection">点検</option>
                  <option value="training">訓練</option>
                  <option value="sales">物販</option>
                  <option value="research">調査</option>
                  <option value="outsourcing-construction">外注（工事）</option>
                  <option value="outsourcing-inspection">外注（点検）</option>
                  <option value="building-inspection">建築検査</option>
                  <option value="load-test">負荷試験</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. 現場情報セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">3. 現場情報 (4項目)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">現場担当者</label>
                <input
                  type="text"
                  value={order.siteInfo.siteManager}
                  onChange={(e) => updateSiteInfo('siteManager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="現場担当者名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">取引先担当者</label>
                <input
                  type="text"
                  value={order.siteInfo.clientManager}
                  onChange={(e) => updateSiteInfo('clientManager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="取引先担当者名"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">物件住所</label>
                <input
                  type="text"
                  value={order.siteInfo.propertyAddress}
                  onChange={(e) => updateSiteInfo('propertyAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="物件の住所"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">オートロック№</label>
                <input
                  type="text"
                  value={order.siteInfo.autolockNumber}
                  onChange={(e) => updateSiteInfo('autolockNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="オートロック番号"
                />
              </div>
            </div>
          </div>

          {/* 4. 点検情報セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <CheckSquare className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">4. 点検情報 (8項目)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">点検周期</label>
                <select
                  value={order.inspectionInfo.inspectionCycle}
                  onChange={(e) => updateInspectionInfo('inspectionCycle', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="half-year">半年</option>
                  <option value="1-year">1年</option>
                  <option value="3-year">3年</option>
                  <option value="new">新規</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作成日</label>
                <input
                  type="date"
                  value={order.inspectionInfo.creationDate.toISOString().split('T')[0]}
                  onChange={(e) => updateInspectionInfo('creationDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">部数</label>
                <input
                  type="number"
                  value={order.inspectionInfo.copies}
                  onChange={(e) => updateInspectionInfo('copies', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">確認</label>
                <input
                  type="text"
                  value={order.inspectionInfo.confirmation}
                  onChange={(e) => updateInspectionInfo('confirmation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="確認者"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">提出日</label>
                <input
                  type="date"
                  value={order.inspectionInfo.submissionDate.toISOString().split('T')[0]}
                  onChange={(e) => updateInspectionInfo('submissionDate', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作成者</label>
                <input
                  type="text"
                  value={order.inspectionInfo.creator}
                  onChange={(e) => updateInspectionInfo('creator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="作成者名"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={order.inspectionInfo.remarks}
                  onChange={(e) => updateInspectionInfo('remarks', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="備考を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">点検表データ</label>
                <textarea
                  value={order.inspectionInfo.inspectionData}
                  onChange={(e) => updateInspectionInfo('inspectionData', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="点検表データ（詳細仕様要確認）"
                />
              </div>
            </div>
          </div>

          {/* 5. 内訳明細情報セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">5. 内訳明細情報 (14項目×行数)</h2>
              </div>
              <button
                type="button"
                onClick={addDetailRow}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>明細追加</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">NO</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">名称</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">品名コード</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">品名</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">数量</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">単位</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">単価</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">原価</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">税率%</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">歩掛</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">配線</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">発注</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">発注先コード</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">発注先名称</th>
                    <th className="border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {order.details.map((detail, index) => (
                    <tr key={index} className="bg-white">
                      <td className="border border-gray-300 px-2 py-2">
                        <span className="text-sm">{detail.no}</span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.name}
                          onChange={(e) => updateDetailRow(index, 'name', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="名称"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.productCode}
                          onChange={(e) => updateDetailRow(index, 'productCode', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="コード"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.productName}
                          onChange={(e) => updateDetailRow(index, 'productName', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="品名"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={detail.quantity}
                          onChange={(e) => updateDetailRow(index, 'quantity', Number(e.target.value))}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.unit}
                          onChange={(e) => updateDetailRow(index, 'unit', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="単位"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={detail.unitPrice}
                          onChange={(e) => updateDetailRow(index, 'unitPrice', Number(e.target.value))}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={detail.cost}
                          onChange={(e) => updateDetailRow(index, 'cost', Number(e.target.value))}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={detail.taxRate}
                          onChange={(e) => updateDetailRow(index, 'taxRate', Number(e.target.value))}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={detail.workload}
                          onChange={(e) => updateDetailRow(index, 'workload', Number(e.target.value))}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          min="0"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={detail.isWiring}
                          onChange={(e) => updateDetailRow(index, 'isWiring', e.target.checked)}
                          className="h-3 w-3"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={detail.isOrdered}
                          onChange={(e) => updateDetailRow(index, 'isOrdered', e.target.checked)}
                          className="h-3 w-3"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.supplierCode}
                          onChange={(e) => updateDetailRow(index, 'supplierCode', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="発注先コード"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={detail.supplierName}
                          onChange={(e) => updateDetailRow(index, 'supplierName', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded"
                          placeholder="発注先名称"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          disabled={order.details.length === 1}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. 工事費用セクション */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Calculator className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">6. 工事費用 (9項目)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 機器取付工事費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">機器取付工事費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.equipmentInstallationCost.amount}
                      onChange={(e) => updateConstructionCosts('equipmentInstallationCost', {
                        ...order.constructionCosts.equipmentInstallationCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.equipmentInstallationCost.cost}
                      onChange={(e) => updateConstructionCosts('equipmentInstallationCost', {
                        ...order.constructionCosts.equipmentInstallationCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 配線工事費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">配線工事費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.wiringCost.amount}
                      onChange={(e) => updateConstructionCosts('wiringCost', {
                        ...order.constructionCosts.wiringCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.wiringCost.cost}
                      onChange={(e) => updateConstructionCosts('wiringCost', {
                        ...order.constructionCosts.wiringCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 調整・試験費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">調整・試験費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.adjustmentTestCost.amount}
                      onChange={(e) => updateConstructionCosts('adjustmentTestCost', {
                        ...order.constructionCosts.adjustmentTestCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.adjustmentTestCost.cost}
                      onChange={(e) => updateConstructionCosts('adjustmentTestCost', {
                        ...order.constructionCosts.adjustmentTestCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 雑材・消耗品費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">雑材・消耗品費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.miscellaneousSuppliesCost.amount}
                      onChange={(e) => updateConstructionCosts('miscellaneousSuppliesCost', {
                        ...order.constructionCosts.miscellaneousSuppliesCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.miscellaneousSuppliesCost.cost}
                      onChange={(e) => updateConstructionCosts('miscellaneousSuppliesCost', {
                        ...order.constructionCosts.miscellaneousSuppliesCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 法定福利費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">法定福利費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.legalWelfareCost.amount}
                      onChange={(e) => updateConstructionCosts('legalWelfareCost', {
                        ...order.constructionCosts.legalWelfareCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.legalWelfareCost.cost}
                      onChange={(e) => updateConstructionCosts('legalWelfareCost', {
                        ...order.constructionCosts.legalWelfareCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 交通費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">交通費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.transportationCost.amount}
                      onChange={(e) => updateConstructionCosts('transportationCost', {
                        ...order.constructionCosts.transportationCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.transportationCost.cost}
                      onChange={(e) => updateConstructionCosts('transportationCost', {
                        ...order.constructionCosts.transportationCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 諸経費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">諸経費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.generalExpenses.amount}
                      onChange={(e) => updateConstructionCosts('generalExpenses', {
                        ...order.constructionCosts.generalExpenses,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.generalExpenses.cost}
                      onChange={(e) => updateConstructionCosts('generalExpenses', {
                        ...order.constructionCosts.generalExpenses,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 廃棄物収集保管運搬費 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">廃棄物収集保管運搬費</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">金額</label>
                    <input
                      type="number"
                      value={order.constructionCosts.wasteCollectionCost.amount}
                      onChange={(e) => updateConstructionCosts('wasteCollectionCost', {
                        ...order.constructionCosts.wasteCollectionCost,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">原価</label>
                    <input
                      type="number"
                      value={order.constructionCosts.wasteCollectionCost.cost}
                      onChange={(e) => updateConstructionCosts('wasteCollectionCost', {
                        ...order.constructionCosts.wasteCollectionCost,
                        cost: Number(e.target.value)
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 出精値引き */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">出精値引き</label>
                <input
                  type="number"
                  value={order.constructionCosts.precisionDiscount}
                  onChange={(e) => updateConstructionCosts('precisionDiscount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Excel出力</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? '登録中...' : '受注を登録'}</span>
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <RequireAuth>
      <NewOrderContent />
    </RequireAuth>
  );
}