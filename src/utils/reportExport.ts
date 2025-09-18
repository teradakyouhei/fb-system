// レポートエクスポート機能

export interface ExportData {
  title: string;
  data: any[];
  filename: string;
  type: 'csv' | 'excel' | 'pdf';
}

// CSVエクスポート
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data.length) return;

  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','), // ヘッダー行
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // カンマや改行を含む値をクォートで囲む
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // BOM付きUTF-8でエクスポート（Excel対応）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Excelファイルとしてエクスポート（実際にはCSV形式）
export function exportToExcel(data: any[], filename: string, headers?: string[]) {
  exportToCSV(data, filename, headers);
}

// PDFエクスポート（基本的なテーブル形式）
export function exportToPDF(title: string, data: any[], filename: string) {
  // 簡易PDF生成（実際の実装では jsPDF や Puppeteer を使用）
  const htmlContent = generatePDFHTML(title, data);
  
  // 印刷ダイアログを開く
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

// PDF用HTML生成
function generatePDFHTML(title: string, data: any[]): string {
  if (!data.length) return '';

  const keys = Object.keys(data[0]);
  const currentDate = new Date().toLocaleDateString('ja-JP');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .header h1 {
          color: #2d5a87;
          margin: 0;
          font-size: 24px;
        }
        .header .date {
          color: #666;
          font-size: 14px;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #2d5a87;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .number {
          text-align: right;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="date">出力日: ${currentDate}</div>
      </div>
      <table>
        <thead>
          <tr>
            ${keys.map(key => `<th>${formatColumnName(key)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${keys.map(key => {
                const value = row[key];
                const className = typeof value === 'number' && !key.includes('Date') ? 'number' : '';
                return `<td class="${className}">${formatCellValue(value)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>富士防災システム - FB-System</p>
        <p>レポート自動生成 ${currentDate}</p>
      </div>
    </body>
    </html>
  `;
}

// 列名をフォーマット
function formatColumnName(key: string): string {
  const columnNames: { [key: string]: string } = {
    rank: '順位',
    customerName: '顧客名',
    totalSales: '売上金額',
    orders: '受注件数',
    share: 'シェア(%)',
    growth: '成長率(%)',
    staffName: '担当者名',
    department: '部署',
    achievement: '達成率(%)',
    commission: '手数料',
    category: 'カテゴリー',
    sales: '売上',
    profit: '利益',
    profitRate: '利益率(%)',
    month: '月',
    target: '目標',
    predicted: '予測',
    avgOrderValue: '平均受注単価',
  };
  
  return columnNames[key] || key;
}

// セル値をフォーマット
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  // 数値の場合
  if (typeof value === 'number') {
    // 金額の場合
    if (value > 1000) {
      return `¥${value.toLocaleString()}`;
    }
    // パーセンテージなど
    return value.toLocaleString();
  }
  
  // 日付の場合
  if (value instanceof Date) {
    return value.toLocaleDateString('ja-JP');
  }
  
  return String(value);
}

// Blobをダウンロード
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 売上レポート専用エクスポート関数
export function exportSalesReport(reportData: any, format: 'csv' | 'pdf' = 'pdf') {
  const currentDate = new Date().toISOString().split('T')[0];
  const baseFilename = `売上分析レポート_${currentDate}`;

  if (format === 'csv') {
    // 複数のテーブルをCSVとしてエクスポート
    
    // 顧客別売上データ
    if (reportData.customerRanking) {
      exportToCSV(
        reportData.customerRanking,
        `${baseFilename}_顧客別売上`,
        ['rank', 'customerName', 'totalSales', 'orders', 'share', 'growth']
      );
    }

    // 担当者別実績データ
    if (reportData.staffSales) {
      exportToCSV(
        reportData.staffSales,
        `${baseFilename}_担当者別実績`,
        ['rank', 'staffName', 'department', 'totalSales', 'achievement', 'growth']
      );
    }

    // カテゴリー別売上データ  
    if (reportData.categorySales) {
      exportToCSV(
        reportData.categorySales,
        `${baseFilename}_カテゴリー別売上`,
        ['category', 'sales', 'orders', 'share', 'profit']
      );
    }

  } else if (format === 'pdf') {
    // 統合レポートとしてPDF出力
    const combinedData = [
      ...reportData.customerRanking || [],
      ...reportData.staffSales || [],
      ...reportData.categorySales || []
    ];
    
    exportToPDF('売上分析レポート', combinedData, baseFilename);
  }
}

// レポートデータの検証
export function validateReportData(data: any[]): boolean {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object';
}

// エクスポート形式の取得
export function getSupportedExportFormats(): { value: string, label: string }[] {
  return [
    { value: 'csv', label: 'CSV形式' },
    { value: 'pdf', label: 'PDF形式' },
    { value: 'excel', label: 'Excel形式' },
  ];
}