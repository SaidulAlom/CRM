import * as XLSX from 'xlsx';

export interface ExcelColumnDefinition {
  header: string;
  key: string;
  width?: number;
  formatter?: (val: any, record: any) => any;
}

export interface ExcelExportOptions<T> {
  filename: string;
  sheetName?: string;
  records: T[];
  columns: ExcelColumnDefinition[];
}

/**
 * Exports an array of records to a formatted Microsoft Excel (.xlsx) file
 * and triggers immediate client-side download.
 */
export function exportToExcel<T extends Record<string, any>>(options: ExcelExportOptions<T>): {
  blob: Blob;
  filename: string;
  rowCount: number;
} {
  const { filename, sheetName = 'Sheet1', records, columns } = options;

  // Prepare header row
  const headerRow = columns.map((col) => col.header);

  // Prepare data rows
  const dataRows = records.map((record) => {
    return columns.map((col) => {
      const rawVal = record[col.key];
      if (col.formatter) {
        return col.formatter(rawVal, record);
      }
      if (rawVal === null || rawVal === undefined) {
        return '';
      }
      if (typeof rawVal === 'boolean') {
        return rawVal ? 'Yes' : 'No';
      }
      if (Array.isArray(rawVal)) {
        return rawVal.join(', ');
      }
      return rawVal;
    });
  });

  // Build worksheet from Array-of-Arrays (AOA)
  const aoa = [headerRow, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-fit column widths with sensible min/max
  const colWidths = columns.map((col, idx) => {
    if (col.width) return { wch: col.width };
    let maxLen = col.header.length;
    for (const row of dataRows) {
      const cellVal = row[idx];
      if (cellVal !== undefined && cellVal !== null) {
        const str = String(cellVal);
        if (str.length > maxLen) {
          maxLen = Math.min(str.length, 50); // cap max width at 50
        }
      }
    }
    return { wch: Math.max(maxLen + 3, 12) };
  });

  worksheet['!cols'] = colWidths;

  // Build workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // Excel sheet names max 31 chars

  // Generate binary XLSX buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const finalName = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;

  // Trigger download in browser
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return {
    blob,
    filename: finalName,
    rowCount: records.length,
  };
}

export interface ParsedExcelSheet {
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rows: string[][];
  rawRowsCount: number;
}

/**
 * Reads an Excel file (.xlsx, .xls) or delimited text file from a File object
 */
export async function parseExcelOrDelimitedFile(
  file: File,
  targetSheetName?: string
): Promise<ParsedExcelSheet> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('The uploaded file does not contain any readable worksheets.');
  }

  const activeSheet = targetSheetName && sheetNames.includes(targetSheetName)
    ? targetSheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[activeSheet];
  if (!worksheet) {
    throw new Error(`Worksheet "${activeSheet}" could not be loaded.`);
  }

  // Convert worksheet to 2D array with raw: false to get formatted strings
  const sheetData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
    raw: false,
  });

  if (!sheetData || sheetData.length === 0) {
    return {
      sheetNames,
      activeSheet,
      headers: [],
      rows: [],
      rawRowsCount: 0,
    };
  }

  // First non-empty row as header
  const headers = (sheetData[0] || []).map((h, i) => (h ? String(h).trim() : `Column ${i + 1}`));
  const rows = sheetData.slice(1).map((row) => {
    return headers.map((_, i) => (row[i] !== undefined && row[i] !== null ? String(row[i]).trim() : ''));
  }).filter((r) => r.some((cell) => cell.length > 0)); // filter out completely blank lines

  return {
    sheetNames,
    activeSheet,
    headers,
    rows,
    rawRowsCount: rows.length,
  };
}

/**
 * Exports an error report to Excel for any rejected or invalid rows
 */
export function exportImportErrorReport(
  errorItems: { rowNumber: number; originalData: Record<string, any>; errors: string[] }[]
): void {
  if (errorItems.length === 0) return;

  const allOriginalKeys = Array.from(
    new Set(errorItems.flatMap((item) => Object.keys(item.originalData)))
  );

  const headerRow = ['Row Number', 'Validation Errors', ...allOriginalKeys];
  const dataRows = errorItems.map((item) => {
    const errorMsg = item.errors.join('; ');
    const originalValues = allOriginalKeys.map((k) => item.originalData[k] ?? '');
    return [item.rowNumber, errorMsg, ...originalValues];
  });

  const aoa = [headerRow, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 40 },
    ...allOriginalKeys.map((k) => ({ wch: Math.max(k.length + 2, 16) })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Errors');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Import_Errors_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
