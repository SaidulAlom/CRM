import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Columns,
  Table,
  Copy,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  DelimiterType,
  ImportSourceApp,
  DuplicateHandlingMode,
  DuplicateMatchRule,
  ColumnMappingItem,
  ParsedImportRow,
  ImportHistoryRecord,
} from '../../../types';
import { StepUploadFile } from './StepUploadFile';
import { StepDetectHeaders } from './StepDetectHeaders';
import { StepColumnMapping } from './StepColumnMapping';
import { StepDataPreview } from './StepDataPreview';
import { StepDuplicateHandling } from './StepDuplicateHandling';
import { StepImportExecution } from './StepImportExecution';
import {
  parseDelimitedText,
  getDelimiterCharacter,
  detectFirstRowIsHeader,
  buildInitialMapping,
  evaluateImportRows,
} from './importUtils';
import { MIGRATION_PRESETS } from './migrationPresets';

interface ImportWizardTabProps {
  initialSourceApp?: ImportSourceApp;
  onNavigateToHistory?: () => void;
}

export const ImportWizardTab: React.FC<ImportWizardTabProps> = ({
  initialSourceApp = 'generic_csv',
  onNavigateToHistory,
}) => {
  const {
    contacts,
    companies,
    currentUser,
    defaultCompany,
    addContact,
    updateContact,
    addImportHistoryRecord,
    logAudit,
  } = useCRM();

  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Upload state
  const [sourceApp, setSourceApp] = useState<ImportSourceApp>(initialSourceApp);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [rawText, setRawText] = useState('');
  const [delimiter, setDelimiter] = useState<DelimiterType>('comma');
  const [customDelimiter, setCustomDelimiter] = useState('');

  // Step 2: Headers detection
  const [firstRowContainsHeaders, setFirstRowContainsHeaders] = useState(true);

  // Step 3: Column Mapping
  const [columnMapping, setColumnMapping] = useState<ColumnMappingItem[]>([]);

  // Step 5: Duplicate Handling
  const [duplicateMode, setDuplicateMode] = useState<DuplicateHandlingMode>('skip');
  const [duplicateRule, setDuplicateRule] = useState<DuplicateMatchRule>('email');

  // Step 6: Import execution
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportHistoryRecord | null>(null);

  // Parse raw text into 2D string matrix
  const rawParsedRows = useMemo(() => {
    if (!rawText.trim()) return [];
    const delimChar = getDelimiterCharacter(delimiter, customDelimiter);
    return parseDelimitedText(rawText, delimChar);
  }, [rawText, delimiter, customDelimiter]);

  // Headers and data rows split based on Step 2
  const headers = useMemo(() => {
    if (rawParsedRows.length === 0) return [];
    if (firstRowContainsHeaders) {
      return rawParsedRows[0];
    } else {
      return (rawParsedRows[0] || []).map((_, i) => `Column ${i + 1}`);
    }
  }, [rawParsedRows, firstRowContainsHeaders]);

  const dataRows = useMemo(() => {
    if (rawParsedRows.length === 0) return [];
    return firstRowContainsHeaders ? rawParsedRows.slice(1) : rawParsedRows;
  }, [rawParsedRows, firstRowContainsHeaders]);

  // Step 1: File loaded callback
  const handleFileLoaded = (
    name: string,
    size: number,
    text: string,
    detectedDelimiter?: DelimiterType
  ) => {
    setFileName(name);
    setFileSize(size);
    setRawText(text);
    if (detectedDelimiter) {
      setDelimiter(detectedDelimiter);
    }

    if (text.trim()) {
      const delimChar = getDelimiterCharacter(detectedDelimiter || delimiter, customDelimiter);
      const rows = parseDelimitedText(text, delimChar);
      if (rows.length > 0) {
        const isHeader = detectFirstRowIsHeader(rows[0]);
        setFirstRowContainsHeaders(isHeader);

        const currentHeaders = isHeader ? rows[0] : rows[0].map((_, i) => `Column ${i + 1}`);
        const firstDataRow = isHeader ? rows[1] || [] : rows[0] || [];
        const initialMapping = buildInitialMapping(currentHeaders, firstDataRow);
        setColumnMapping(initialMapping);
      }
    }
  };

  // Re-run auto mapping if user clicks Auto-Match
  const handleAutoMap = () => {
    if (headers.length > 0) {
      const firstDataRow = dataRows[0] || [];
      const newMapping = buildInitialMapping(headers, firstDataRow);
      setColumnMapping(newMapping);
    }
  };

  // Step 4 & 5: Evaluate parsed rows and stats
  const { parsedRows, stats } = useMemo(() => {
    return evaluateImportRows(
      dataRows,
      columnMapping,
      contacts,
      companies,
      duplicateRule,
      duplicateMode
    );
  }, [dataRows, columnMapping, contacts, companies, duplicateRule, duplicateMode]);

  // Allow custom override of duplicate row action
  const [individualRowActions, setIndividualRowActions] = useState<Record<number, 'insert' | 'update' | 'skip'>>({});

  const handleToggleRowAction = (rowNumber: number, action: 'insert' | 'update' | 'skip') => {
    setIndividualRowActions((prev) => ({
      ...prev,
      [rowNumber]: action,
    }));
  };

  const finalParsedRows = useMemo(() => {
    return parsedRows.map((r) => {
      if (individualRowActions[r.rowNumber]) {
        return {
          ...r,
          action: individualRowActions[r.rowNumber],
        };
      }
      return r;
    });
  }, [parsedRows, individualRowActions]);

  const duplicateRows = useMemo(() => {
    return finalParsedRows.filter((r) => r.isDuplicate);
  }, [finalParsedRows]);

  // Execute Import
  const handleExecuteImport = () => {
    setIsImporting(true);

    setTimeout(() => {
      try {
        let successCount = 0;
        let updatedCount = 0;
        let duplicateCount = 0;
        let failedCount = 0;
        const errorReport: { rowNumber: number; rawText: string; errors: string[] }[] = [];

        finalParsedRows.forEach((row) => {
          if (!row.isValid) {
            failedCount++;
            errorReport.push({
              rowNumber: row.rowNumber,
              rawText: Object.values(row.originalValues).join(','),
              errors: row.errors,
            });
            return;
          }

          if (row.isDuplicate) {
            duplicateCount++;
          }

          if (row.action === 'skip') {
            // Skipped
            return;
          }

          // Resolve Company if mapped
          const companyName = (row.mappedRecord as any).companyName;
          let matchedCompanyId = defaultCompany?.id || companies[0]?.id || '';
          if (companyName) {
            const foundComp = companies.find(
              (c) => c.name.toLowerCase() === companyName.toLowerCase()
            );
            if (foundComp) {
              matchedCompanyId = foundComp.id;
            }
          }

          if (row.action === 'update' && row.duplicateOfId) {
            // Update existing contact record
            updateContact(row.duplicateOfId, {
              ...row.mappedRecord,
              companyId: matchedCompanyId,
            });
            updatedCount++;
          } else {
            // Insert brand new contact
            addContact({
              firstName: row.mappedRecord.firstName || 'Imported',
              lastName: row.mappedRecord.lastName || 'Contact',
              email: row.mappedRecord.email || '',
              phone: row.mappedRecord.phone || '',
              mobile: row.mappedRecord.mobile || '',
              jobTitle: row.mappedRecord.jobTitle || 'Team Member',
              mailingAddress: row.mappedRecord.mailingAddress || '',
              shippingAddress: row.mappedRecord.shippingAddress || '',
              messagingHandle: row.mappedRecord.messagingHandle || '',
              type: (row.mappedRecord.type as any) || (sourceApp === 'salesforce_leads' ? 'lead' : 'customer'),
              companyId: matchedCompanyId,
              ownerId: currentUser.id,
              description: row.mappedRecord.description || `Imported via Migration Wizard (${sourceApp})`,
            });
            successCount++;
          }
        });

        const status: 'Completed' | 'Partially Completed' | 'Failed' =
          failedCount === 0
            ? 'Completed'
            : successCount > 0 || updatedCount > 0
            ? 'Partially Completed'
            : 'Failed';

        const historyRecord = addImportHistoryRecord({
          filename: fileName || 'contacts_import.csv',
          fileSize,
          sourceApp,
          delimiter: getDelimiterCharacter(delimiter, customDelimiter),
          importedBy: currentUser.id,
          importedByName: `${currentUser.name} (${currentUser.role})`,
          totalRecords: finalParsedRows.length,
          successCount,
          updatedCount,
          duplicateCount,
          failedCount,
          status,
          duplicateHandlingMode: duplicateMode,
          errorReport: errorReport.length > 0 ? errorReport : undefined,
        });

        logAudit(
          'CONTACTS_IMPORTED',
          `Imported ${successCount} contacts, updated ${updatedCount}, skipped/failed ${failedCount} from ${fileName} (Source: ${sourceApp})`
        );

        setImportResult(historyRecord);
      } catch (err: any) {
        alert(`Import execution error: ${err.message}`);
      } finally {
        setIsImporting(false);
      }
    }, 400);
  };

  const handleDownloadErrorReport = () => {
    if (!importResult || !importResult.errorReport) return;
    const lines = ['Row Number,Original Raw Values,Validation Errors'];
    importResult.errorReport.forEach((err) => {
      lines.push(`${err.rowNumber},"${err.rawText.replace(/"/g, '""')}","${err.errors.join('; ').replace(/"/g, '""')}"`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `import_errors_${fileName || 'contacts'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setRawText('');
    setFileName('');
    setFileSize(0);
    setImportResult(null);
    setIndividualRowActions({});
  };

  const wizardSteps = [
    { number: 1, label: 'Upload File' },
    { number: 2, label: 'Detect Headers' },
    { number: 3, label: 'Column Mapping' },
    { number: 4, label: 'Data Preview' },
    { number: 5, label: 'Duplicate Handling' },
    { number: 6, label: 'Import' },
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Step Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {wizardSteps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <React.Fragment key={s.number}>
                <div
                  onClick={() => {
                    // Only allow clicking back to already visited steps
                    if (s.number < currentStep && !importResult) {
                      setCurrentStep(s.number);
                    }
                  }}
                  className={`flex items-center gap-2 select-none cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'text-indigo-600 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 font-semibold hover:text-emerald-800'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white font-bold ring-4 ring-indigo-100 shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-100 text-slate-400 font-semibold'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : s.number}
                  </div>
                  <span className="text-xs whitespace-nowrap">{s.label}</span>
                </div>

                {idx < wizardSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 min-w-[20px] transition-colors ${
                      currentStep > s.number ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Components */}
      {currentStep === 1 && (
        <StepUploadFile
          fileName={fileName}
          fileSize={fileSize}
          rawText={rawText}
          sourceApp={sourceApp}
          delimiter={delimiter}
          customDelimiter={customDelimiter}
          onFileLoaded={handleFileLoaded}
          onSourceAppChange={(app) => setSourceApp(app)}
          onDelimiterChange={(del) => setDelimiter(del)}
          onCustomDelimiterChange={(char) => setCustomDelimiter(char)}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <StepDetectHeaders
          firstRowContainsHeaders={firstRowContainsHeaders}
          onFirstRowContainsHeadersChange={(hasH) => {
            setFirstRowContainsHeaders(hasH);
            // Recompute initial mapping
            const currentHeaders = hasH
              ? rawParsedRows[0] || []
              : (rawParsedRows[0] || []).map((_, i) => `Column ${i + 1}`);
            const firstData = hasH ? rawParsedRows[1] || [] : rawParsedRows[0] || [];
            setColumnMapping(buildInitialMapping(currentHeaders, firstData));
          }}
          rawRows={rawParsedRows}
          onPrev={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <StepColumnMapping
          mapping={columnMapping}
          onMappingChange={(newMap) => setColumnMapping(newMap)}
          onAutoMap={handleAutoMap}
          onPrev={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 4 && (
        <StepDataPreview
          stats={stats}
          parsedRows={finalParsedRows}
          onPrev={() => setCurrentStep(3)}
          onNext={() => setCurrentStep(5)}
        />
      )}

      {currentStep === 5 && (
        <StepDuplicateHandling
          duplicateMode={duplicateMode}
          duplicateRule={duplicateRule}
          onDuplicateModeChange={(mode) => setDuplicateMode(mode)}
          onDuplicateRuleChange={(rule) => setDuplicateRule(rule)}
          duplicateCount={stats.duplicateRecords}
          duplicateRows={duplicateRows}
          onToggleRowAction={handleToggleRowAction}
          onPrev={() => setCurrentStep(4)}
          onNext={() => setCurrentStep(6)}
        />
      )}

      {currentStep === 6 && (
        <StepImportExecution
          stats={stats}
          duplicateMode={duplicateMode}
          fileName={fileName}
          isImporting={isImporting}
          importResult={importResult}
          onExecuteImport={handleExecuteImport}
          onDownloadErrorReport={handleDownloadErrorReport}
          onResetWizard={handleResetWizard}
          onPrev={() => setCurrentStep(5)}
        />
      )}
    </div>
  );
};
