// CSV読み込み・データ変換ユーティリティ
import Papa from 'papaparse';

export interface CSVImportResult<T = any> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
  success: boolean;
  processedCount: number;
  errorCount: number;
}

export interface CSVImportOptions {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
  transformHeaders?: boolean;
  encoding?: string;
}

// CSV解析の基本関数
export function parseCSV<T = any>(
  file: File,
  options: CSVImportOptions = {}
): Promise<CSVImportResult<T>> {
  return new Promise((resolve) => {
    const defaultOptions: Papa.ParseConfig = {
      header: options.header ?? true,
      delimiter: options.delimiter ?? ',',
      skipEmptyLines: options.skipEmptyLines ?? true,
      transformHeader: options.transformHeaders ? (header: string) => {
        // 日本語ヘッダーを英語のフィールド名に変換
        return transformJapaneseHeader(header);
      } : undefined,
      complete: (results) => {
        const errors = results.errors;
        const data = results.data as T[];
        
        resolve({
          data,
          errors,
          meta: results.meta,
          success: errors.length === 0,
          processedCount: data.length,
          errorCount: errors.length
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [error as Papa.ParseError],
          meta: {} as Papa.ParseMeta,
          success: false,
          processedCount: 0,
          errorCount: 1
        });
      }
    };

    Papa.parse(file, defaultOptions);
  });
}

// 日本語ヘッダーを英語フィールド名に変換
function transformJapaneseHeader(header: string): string {
  const headerMap: Record<string, string> = {
    // 得意先マスター
    'コード': 'code',
    '名称': 'name',
    '名称2': 'name2',
    '敬称': 'honorific',
    '郵便番号': 'postalCode',
    '住所': 'address',
    '住所2': 'address2',
    'TEL': 'tel',
    'FAX': 'fax',
    'メールアドレス': 'email',
    'メールアドレス(CC)': 'emailCc',
    '担当者名': 'contactPerson',
    '締日': 'closingDate',
    '支払日': 'paymentDate',
    'コメント': 'comment',

    // 仕入先マスター
    '仕入先コード': 'code',
    '仕入先名': 'name',

    // 商品マスター
    '商品コード': 'code',
    '商品名': 'name',
    '単位': 'unit',
    '分類': 'category',
    '歩掛': 'price',
    '仕入単価': 'purchasePrice',
    '在庫数量': 'stockQuantity',
    '仕入先': 'supplierId',

    // 担当者マスター
    '担当者コード': 'code',
    '担当者名': 'name',
    '売上・集金': 'salesCommission',
    '見積承認': 'inspectionApproval',

    // 受注管理
    '受注NO': 'orderNo',
    '得意先': 'customerId',
    '作業名': 'projectName',
    '受注日': 'orderDate',
    '納期日': 'deliveryDate',
    '売上金額': 'salesAmount',
    'ステータス': 'status',
    '担当者': 'staffId',

    // 受注明細
    '行番号': 'lineNo',
    '品名': 'productName',
    '仕様': 'specification',
    '数量': 'quantity',
    '単価': 'unitPrice',
    '金額': 'amount',
    '入庫': 'purchaseFlag',
    '入庫日': 'purchaseDate',
    '納期等': 'storageEtc',

    // 発注管理
    '発注NO': 'purchaseNo',
    '発注先': 'supplierId',
    '発注日': 'orderDate',
    '入庫日': 'deliveryDate',
    '発注金額': 'totalAmount',

    // 日程管理
    '日程日': 'scheduleDate',
    '開始時間': 'startTime',
    '終了時間': 'endTime',
    '場所': 'location',
    '作業種別': 'workType',
    '備考': 'note'
  };

  return headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
}

// データ型変換ヘルパー
export function convertDataTypes(data: any[], typeMap: Record<string, 'string' | 'number' | 'boolean' | 'date'>) {
  return data.map(row => {
    const convertedRow: any = {};
    
    for (const [key, value] of Object.entries(row)) {
      const targetType = typeMap[key];
      
      if (!targetType || value === null || value === undefined || value === '') {
        convertedRow[key] = value;
        continue;
      }

      switch (targetType) {
        case 'number':
          convertedRow[key] = parseFloat(value) || 0;
          break;
        case 'boolean':
          convertedRow[key] = value === 'true' || value === '1' || value === 'TRUE' || value === '○';
          break;
        case 'date':
          convertedRow[key] = parseDate(value);
          break;
        default:
          convertedRow[key] = String(value);
      }
    }
    
    return convertedRow;
  });
}

// 日付パース（複数フォーマット対応）
function parseDate(value: string): Date | null {
  if (!value) return null;
  
  // 日本の日付フォーマットを試行
  const formats = [
    /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/,  // YYYY-MM-DD, YYYY/MM/DD
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,      // YYYY年MM月DD日
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,  // MM-DD-YYYY, MM/DD/YYYY
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/   // MM-DD-YY, MM/DD/YY
  ];
  
  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      
      // フォーマットによって年月日を判定
      if (format === formats[0] || format === formats[1]) {
        // YYYY-MM-DD形式
        const date = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
        if (!isNaN(date.getTime())) return date;
      } else if (format === formats[2]) {
        // MM-DD-YYYY形式
        const date = new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2));
        if (!isNaN(date.getTime())) return date;
      } else if (format === formats[3]) {
        // MM-DD-YY形式（20XX年として解釈）
        const year = parseInt(part3) + 2000;
        const date = new Date(year, parseInt(part1) - 1, parseInt(part2));
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  
  // デフォルトのDate()コンストラクタで試行
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// CSV出力機能
export function exportToCSV(data: any[], filename: string, headers?: Record<string, string>) {
  const processedData = data.map(row => {
    if (!headers) return row;
    
    const processedRow: any = {};
    for (const [key, value] of Object.entries(row)) {
      const header = headers[key] || key;
      processedRow[header] = value;
    }
    return processedRow;
  });

  const csv = Papa.unparse(processedData, {
    header: true,
    delimiter: ',',
    encoding: 'utf-8'
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// バリデーション関数
export function validateCSVData(data: any[], requiredFields: string[]): {
  isValid: boolean;
  missingFields: string[];
  invalidRows: Array<{ rowIndex: number; errors: string[] }>;
} {
  const missingFields: string[] = [];
  const invalidRows: Array<{ rowIndex: number; errors: string[] }> = [];
  
  // 必須フィールドのチェック
  if (data.length > 0) {
    const firstRow = data[0];
    for (const field of requiredFields) {
      if (!(field in firstRow)) {
        missingFields.push(field);
      }
    }
  }
  
  // 各行のバリデーション
  data.forEach((row, index) => {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!row[field] || row[field] === '') {
        errors.push(`${field}が空です`);
      }
    }
    
    if (errors.length > 0) {
      invalidRows.push({ rowIndex: index, errors });
    }
  });
  
  return {
    isValid: missingFields.length === 0 && invalidRows.length === 0,
    missingFields,
    invalidRows
  };
}