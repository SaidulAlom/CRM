import {
  DelimiterType,
  ColumnMappingItem,
  ParsedImportRow,
  ImportPreviewStats,
  DuplicateHandlingMode,
  DuplicateMatchRule,
  Contact,
  Company,
} from '../../../types';
import { CRM_CONTACT_FIELDS, CRMFieldDefinition } from './migrationPresets';

/**
 * Robust CSV/TSV/delimited text line parser taking into account quotes and escaped characters.
 */
export function parseDelimitedText(
  rawContent: string,
  delimiterChar: string
): string[][] {
  const result: string[][] = [];
  const lines = rawContent.split(/\r?\n/);

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue; // skip blank lines

    const row: string[] = [];
    let insideQuotes = false;
    let currentField = '';

    for (let i = 0; i < rawLine.length; i++) {
      const char = rawLine[i];
      const nextChar = rawLine[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiterChar && !insideQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim());
    result.push(row);
  }

  return result;
}

/**
 * Detect most likely delimiter if not explicitly provided
 */
export function autoDetectDelimiter(sampleText: string): DelimiterType {
  const firstLines = sampleText.split(/\r?\n/).slice(0, 5).join('\n');
  const commaCount = (firstLines.match(/,/g) || []).length;
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const semiCount = (firstLines.match(/;/g) || []).length;
  const pipeCount = (firstLines.match(/\|/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount && tabCount > pipeCount) return 'tab';
  if (semiCount > commaCount && semiCount > tabCount && semiCount > pipeCount) return 'semicolon';
  if (pipeCount > commaCount && pipeCount > tabCount && pipeCount > semiCount) return 'pipe';
  return 'comma';
}

export function getDelimiterCharacter(type: DelimiterType, customChar: string = ','): string {
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
      return customChar || ',';
  }
}

/**
 * Check if the first row is likely a header row vs raw data
 */
export function detectFirstRowIsHeader(firstRow: string[]): boolean {
  if (!firstRow || firstRow.length === 0) return true;

  // If any header matches known field aliases, it's very likely a header
  const allAliases = CRM_CONTACT_FIELDS.flatMap((f) => f.aliases);
  const matches = firstRow.filter((cell) => {
    const clean = cell.toLowerCase().trim();
    return allAliases.some((alias) => clean === alias || clean.includes(alias));
  });

  // If at least one column looks like a header name, or none look like an email
  const hasEmailInHeader = firstRow.some((cell) => cell.includes('@') && cell.includes('.'));
  if (hasEmailInHeader) return false;

  return matches.length > 0 || isNaN(Number(firstRow[0]));
}

/**
 * Build automatic initial column mapping based on alias matching
 */
export function buildInitialMapping(
  headers: string[],
  firstDataRow: string[] = []
): ColumnMappingItem[] {
  const usedTargets = new Set<string>();

  return headers.map((header, idx) => {
    const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    let bestField: CRMFieldDefinition | undefined;

    // Check exact or partial alias match
    for (const field of CRM_CONTACT_FIELDS) {
      if (usedTargets.has(field.key)) continue;

      const exactMatch = field.aliases.some(
        (alias) => alias === cleanHeader || alias.replace(/ /g, '') === cleanHeader.replace(/ /g, '')
      );
      if (exactMatch) {
        bestField = field;
        break;
      }
    }

    // Secondary heuristic: substring match if not found
    if (!bestField) {
      for (const field of CRM_CONTACT_FIELDS) {
        if (usedTargets.has(field.key)) continue;

        const partialMatch = field.aliases.some((alias) => cleanHeader.includes(alias));
        if (partialMatch) {
          bestField = field;
          break;
        }
      }
    }

    if (bestField) {
      usedTargets.add(bestField.key);
    }

    return {
      sourceColumn: header || `Column ${idx + 1}`,
      targetField: bestField ? bestField.key : '__ignore__',
      sampleValue: firstDataRow[idx] || '',
      isRequired: bestField?.required,
    };
  });
}

/**
 * Find existing duplicate contact based on rule
 */
export function findDuplicateContact(
  candidate: Partial<Contact>,
  existingContacts: Contact[],
  rule: DuplicateMatchRule,
  companies: Company[]
): Contact | undefined {
  const cleanEmail = (candidate.email || '').trim().toLowerCase();
  const cleanPhone = (candidate.phone || candidate.mobile || '').replace(/[^0-9]/g, '');
  const cleanName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim().toLowerCase();

  return existingContacts.find((c) => {
    if (c.deletedAt) return false;

    if (rule === 'email') {
      if (cleanEmail && c.email.trim().toLowerCase() === cleanEmail) return true;
    } else if (rule === 'phone') {
      const cPhone = (c.phone || c.mobile || '').replace(/[^0-9]/g, '');
      if (cleanPhone && cPhone && (cPhone === cleanPhone || (cPhone.length > 7 && cleanPhone.endsWith(cPhone)))) {
        return true;
      }
    } else if (rule === 'name_and_company') {
      const cName = `${c.firstName} ${c.lastName}`.trim().toLowerCase();
      if (cName === cleanName) {
        const cComp = companies.find((comp) => comp.id === c.companyId);
        const candCompany = (candidate as any).companyName || '';
        if (candCompany && cComp && cComp.name.toLowerCase() === candCompany.toLowerCase()) {
          return true;
        }
      }
    } else if (rule === 'name_only') {
      const cName = `${c.firstName} ${c.lastName}`.trim().toLowerCase();
      if (cleanName && cName === cleanName) return true;
    }
    return false;
  });
}

/**
 * Validate and compile rows into ParsedImportRow models with stats
 */
export function evaluateImportRows(
  rows: string[][],
  mapping: ColumnMappingItem[],
  existingContacts: Contact[],
  companies: Company[],
  duplicateRule: DuplicateMatchRule,
  duplicateMode: DuplicateHandlingMode
): {
  parsedRows: ParsedImportRow[];
  stats: ImportPreviewStats;
} {
  const parsedRows: ParsedImportRow[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let missingRequiredCount = 0;
  let mappingErrorsCount = 0;

  // Verify whether required fields are mapped
  const mappedTargets = new Set(mapping.map((m) => m.targetField));
  const hasFirstName = mappedTargets.has('firstName');
  const hasLastName = mappedTargets.has('lastName');
  const hasEmail = mappedTargets.has('email');

  if (!hasFirstName || !hasLastName) {
    mappingErrorsCount++;
  }

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    const originalValues: Record<string, string> = {};
    const mappedRecord: any = {};
    const errors: string[] = [];

    mapping.forEach((colMap, colIdx) => {
      const rawVal = row[colIdx] !== undefined ? row[colIdx].trim() : '';
      originalValues[colMap.sourceColumn] = rawVal;

      if (colMap.targetField && colMap.targetField !== '__ignore__') {
        if (colMap.targetField === 'company') {
          mappedRecord.companyName = rawVal;
        } else {
          mappedRecord[colMap.targetField] = rawVal;
        }
      }
    });

    // Validations
    if (!mappedRecord.firstName || mappedRecord.firstName.trim() === '') {
      errors.push('Missing required First Name');
      missingRequiredCount++;
    }
    if (!mappedRecord.lastName || mappedRecord.lastName.trim() === '') {
      errors.push('Missing required Last Name');
      missingRequiredCount++;
    }
    if (mappedRecord.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mappedRecord.email)) {
        errors.push(`Invalid email format: "${mappedRecord.email}"`);
      }
    }

    // Check duplicate
    const duplicate = findDuplicateContact(mappedRecord, existingContacts, duplicateRule, companies);
    const isDuplicate = !!duplicate;
    if (isDuplicate) {
      duplicateCount++;
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    // Determine initial proposed action
    let action: 'insert' | 'update' | 'skip' | 'error' = 'insert';
    if (!isValid) {
      action = 'error';
    } else if (isDuplicate) {
      if (duplicateMode === 'skip') {
        action = 'skip';
      } else if (duplicateMode === 'update') {
        action = 'update';
      } else if (duplicateMode === 'create_new') {
        action = 'insert';
      } else {
        action = 'skip'; // default for ask_user until user toggles
      }
    }

    parsedRows.push({
      rowNumber,
      originalValues,
      mappedRecord,
      isValid,
      errors,
      isDuplicate,
      duplicateOfId: duplicate?.id,
      duplicateOfName: duplicate ? `${duplicate.firstName} ${duplicate.lastName} (${duplicate.email})` : undefined,
      duplicateConflictReason: duplicate
        ? `Matches existing contact on rule [${duplicateRule.replace(/_/g, ' ').toUpperCase()}]`
        : undefined,
      action,
    });
  });

  return {
    parsedRows,
    stats: {
      totalRecords: rows.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      duplicateRecords: duplicateCount,
      missingRequiredCount,
      mappingErrorsCount,
    },
  };
}
