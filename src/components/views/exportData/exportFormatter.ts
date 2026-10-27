import * as XLSX from 'xlsx';
import {
  ExportDelimiterType,
  ExportEncapsulationType,
  ExportRowSeparatorType,
  ExportDestination,
} from '../../../types';
import { ExportFieldDefinition } from './exportDefinitions';

export interface ExportFormattingOptions {
  delimiterType: ExportDelimiterType;
  customDelimiter: string;
  encapsulationType: ExportEncapsulationType;
  customEncapsulator: string;
  rowSeparatorType: ExportRowSeparatorType;
  includeHeaders: boolean;
  destination: ExportDestination;
  fields: ExportFieldDefinition[];
}

export function resolveDelimiterCharacter(
  type: ExportDelimiterType,
  custom: string = ','
): string {
  switch (type) {
    case 'comma':
      return ',';
    case 'tab':
      return '\t';
    case 'semicolon':
      return ';';
    case 'pipe':
      return '|';
    case 'custom':
      return custom || ',';
  }
}

export function resolveRowSeparator(type: ExportRowSeparatorType): string {
  switch (type) {
    case 'crlf':
      return '\r\n';
    case 'lf':
      return '\n';
    case 'cr':
      return '\r';
  }
}

/**
 * Escapes and encapsulates an individual field value based on the chosen encapsulation style.
 */
export function formatFieldValue(
  rawVal: any,
  encapsulation: ExportEncapsulationType,
  customEncapsulator: string = '"',
  delimiterChar: string
): string {
  if (rawVal === null || rawVal === undefined) return '';

  const str = String(rawVal);

  switch (encapsulation) {
    case 'double': {
      // Standard RFC 4180 CSV: encapsulate with " and double internal quotes
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    case 'single': {
      const escaped = str.replace(/'/g, "''");
      return `'${escaped}'`;
    }
    case 'custom': {
      const enc = customEncapsulator || '"';
      const regex = new RegExp(enc.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      const escaped = str.replace(regex, `${enc}${enc}`);
      return `${enc}${escaped}${enc}`;
    }
    case 'none': {
      // If no encapsulation is selected, replace delimiters and newlines to preserve tabular integrity
      return str.replace(new RegExp(delimiterChar.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), ' ').replace(/[\r\n]+/g, ' ');
    }
  }
}

/**
 * Formats a list of records into the full output string with headers and row separators.
 */
export function generateExportOutput(
  records: any[],
  options: ExportFormattingOptions,
  context: { companies: any[]; contacts: any[]; users: any[] }
): string {
  const delim = resolveDelimiterCharacter(options.delimiterType, options.customDelimiter);
  const rowSep = resolveRowSeparator(options.rowSeparatorType);
  const enc = options.encapsulationType;
  const customEnc = options.customEncapsulator;

  const lines: string[] = [];

  // 1. Header row
  if (options.includeHeaders) {
    const headerCells = options.fields.map((field) =>
      formatFieldValue(field.label, enc, customEnc, delim)
    );
    lines.push(headerCells.join(delim));
  }

  // 2. Data rows
  for (const record of records) {
    const rowCells = options.fields.map((field) => {
      try {
        const val = field.accessor(record, context);
        return formatFieldValue(val, enc, customEnc, delim);
      } catch {
        return '';
      }
    });
    lines.push(rowCells.join(delim));
  }

  return lines.join(rowSep);
}

/**
 * Creates a downloadable Blob with proper UTF-8 BOM encoding or XLSX binary for Microsoft Excel.
 */
export function createExportBlob(
  content: string,
  destination: ExportDestination,
  delimiterType: ExportDelimiterType,
  records?: any[],
  fields?: ExportFieldDefinition[],
  context?: { companies: any[]; contacts: any[]; users: any[] }
): { blob: Blob; mimeType: string; extension: string } {
  // If destination is Excel and records are provided, generate true .xlsx binary workbook
  if (destination === 'excel' && records && fields && fields.length > 0) {
    const headers = fields.map((f) => f.label);
    const dataRows = records.map((record) => {
      return fields.map((field) => {
        try {
          const val = field.accessor(record, context || { companies: [], contacts: [], users: [] });
          return val === null || val === undefined ? '' : val;
        } catch {
          return '';
        }
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const colWidths = fields.map((f, i) => {
      let maxLen = f.label.length;
      dataRows.forEach((r) => {
        const str = String(r[i] ?? '');
        if (str.length > maxLen) maxLen = Math.min(str.length, 50);
      });
      return { wch: Math.max(maxLen + 3, 12) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return {
      blob,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
    };
  }

  // Add UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 CSVs automatically without broken characters
  const bomPrefix = '\uFEFF';
  const fullContent = bomPrefix + content;

  let mimeType = 'text/csv;charset=utf-8;';
  let extension = 'csv';

  if (destination === 'excel') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    extension = 'xlsx';
  } else if (delimiterType === 'tab') {
    mimeType = 'text/tab-separated-values;charset=utf-8;';
    extension = 'tsv';
  } else if (delimiterType === 'semicolon' || delimiterType === 'pipe' || delimiterType === 'custom') {
    mimeType = 'text/plain;charset=utf-8;';
    extension = 'txt';
  }

  const blob = new Blob([fullContent], { type: mimeType });
  return { blob, mimeType, extension };
}
