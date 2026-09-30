import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  History,
  FileDown,
} from 'lucide-react';
import {
  ExportDestination,
  ExportDelimiterType,
  ExportEncapsulationType,
  ExportRowSeparatorType,
  ExportHistoryRecord,
} from '../../../types';
import { ExportFieldDefinition } from './exportDefinitions';
import {
  generateExportOutput,
  createExportBlob,
} from './exportFormatter';

interface StepExportProcessingProps {
  entityType: string;
  entityLabel: string;
  selectedFields: ExportFieldDefinition[];
  filteredRecords: any[];
  destination: ExportDestination;
  delimiterType: ExportDelimiterType;
  customDelimiter: string;
  encapsulationType: ExportEncapsulationType;
  customEncapsulator: string;
  rowSeparatorType: ExportRowSeparatorType;
  includeHeaders: boolean;
  filtersSummary: string;
  fileName: string;
  context: { companies: any[]; contacts: any[]; users: any[] };
  onReset: () => void;
  onNavigateToHistory: () => void;
  onRecordHistory: (record: Omit<ExportHistoryRecord, 'id' | 'timestamp'>) => void;
  logAudit: (action: string, details: string) => void;
  currentUser: { id: string; name: string; role: string };
}

export const StepExportProcessing: React.FC<StepExportProcessingProps> = ({
  entityType,
  entityLabel,
  selectedFields,
  filteredRecords,
  destination,
  delimiterType,
  customDelimiter,
  encapsulationType,
  customEncapsulator,
  rowSeparatorType,
  includeHeaders,
  filtersSummary,
  fileName,
  context,
  onReset,
  onNavigateToHistory,
  onRecordHistory,
  logAudit,
  currentUser,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing export engine...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<{ blob: Blob; mimeType: string; extension: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(destination === 'browser');
  const [searchBrowserText, setSearchBrowserText] = useState('');

  // Run generation with progress steps
  useEffect(() => {
    let timer1: any;
    let timer2: any;
    let timer3: any;

    setProgress(20);
    setStatusMessage('Verifying role permissions & filtering records...');

    timer1 = setTimeout(() => {
      setProgress(55);
      setStatusMessage(`Formatting ${filteredRecords.length} records with ${delimiterType.toUpperCase()} delimiter...`);

      timer2 = setTimeout(() => {
        setProgress(85);
        setStatusMessage('Applying encapsulation and generating output stream...');

        timer3 = setTimeout(() => {
          // Actual generation
          const output = generateExportOutput(
            filteredRecords,
            {
              delimiterType,
              customDelimiter,
              encapsulationType,
              customEncapsulator,
              rowSeparatorType,
              includeHeaders,
              destination,
              fields: selectedFields,
            },
            context
          );

          setGeneratedOutput(output);
          const blobInfo = createExportBlob(output, destination, delimiterType);
          setDownloadBlob(blobInfo);

          setProgress(100);
          setStatusMessage('Export generated successfully!');
          setIsCompleted(true);

          // Handle automatic download for 'download' and 'excel' modes
          if (destination === 'download' || destination === 'excel') {
            const url = URL.createObjectURL(blobInfo.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.endsWith(`.${blobInfo.extension}`)
              ? fileName
              : `${fileName}.${blobInfo.extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // Browser destination: open viewer
            setShowBrowserModal(true);
          }

          // Record in Audit and Export History
          onRecordHistory({
            entity: entityType as any,
            entityLabel,
            filename: fileName,
            format: destination === 'excel' ? 'excel' : (delimiterType as any),
            destination,
            delimiter: delimiterType,
            encapsulation: encapsulationType,
            rowSeparator: rowSeparatorType,
            selectedFields: selectedFields.map((f) => f.key),
            includeHeaders,
            recordsCount: filteredRecords.length,
            exportedBy: currentUser.id,
            exportedByName: `${currentUser.name} (${currentUser.role})`,
            status: 'Completed',
            appliedFiltersSummary: filtersSummary || 'None',
            fileSize: blobInfo.blob.size,
          });

          logAudit(
            'DATA_EXPORTED',
            `Exported ${filteredRecords.length} ${entityLabel} records (${fileName}, Destination: ${destination}) by ${currentUser.name}`
          );
        }, 300);
      }, 300);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleDownloadAgain = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith(`.${downloadBlob.extension}`)
      ? fileName
      : `${fileName}.${downloadBlob.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyBrowser = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredBrowserLines = generatedOutput
    .split(/\r?\n/)
    .filter((l) => (searchBrowserText.trim() ? l.toLowerCase().includes(searchBrowserText.toLowerCase()) : true));

  return (
    <div className="space-y-6">
      {/* Progress & Completion Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isCompleted ? <CheckCircle2 size={26} /> : <DownloadCloud size={24} className="animate-bounce" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isCompleted ? 'Data Export Completed Successfully!' : 'Processing CRM Data Export...'}
              </h3>
              <p className="text-slate-500 mt-0.5">{statusMessage}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {isCompleted ? 'Ready' : `${progress}%`}
          </span>
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Outcome Breakdown Stats */}
        {isCompleted && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Dataset Exported</span>
              <span className="text-base font-bold text-slate-900 mt-1 block truncate">
                {entityLabel}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block">Records Written</span>
              <span className="text-2xl font-bold text-emerald-800 mt-0.5 block">
                {filteredRecords.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[11px] font-semibold text-indigo-700 block">Output File</span>
              <span className="text-xs font-mono font-bold text-indigo-900 mt-1 block truncate">
                {fileName}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">File Size</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {downloadBlob ? `${(downloadBlob.blob.size / 1024).toFixed(1)} KB` : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Specific guidance for Excel vs Browser vs Download */}
        {isCompleted && destination === 'excel' && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 flex items-start gap-3">
            <FileSpreadsheet size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-emerald-900 text-xs">
                Microsoft Excel Compatible File Downloaded
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                The exported file was created with UTF-8 BOM encoding and CRLF row breaks.
                You can double-click <strong>{fileName}</strong> to open it immediately in Microsoft Excel, Google Sheets, or Apple Numbers.
              </p>
            </div>
          </div>
        )}

        {isCompleted && destination === 'browser' && (
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Eye size={18} className="text-indigo-700 shrink-0" />
              <div>
                <div className="font-bold text-indigo-900 text-xs">
                  Export Ready for In-Browser Inspection
                </div>
                <div className="text-[11px] text-indigo-700">
                  {filteredRecords.length} records generated. View formatted rows, copy to clipboard, or search text.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBrowserModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
            >
              <Eye size={14} />
              <span>Open In-Browser Viewer</span>
            </button>
          </div>
        )}

        {/* Action Bar */}
        {isCompleted && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadAgain}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                <DownloadCloud size={14} />
                <span>Download File Again</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBrowserModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                <Eye size={14} />
                <span>View in Browser</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                <History size={14} />
                <span>View in Export History</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors"
              >
                <RotateCcw size={14} />
                <span>Start New Export</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-Browser Interactive Viewer Modal */}
      {showBrowserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Eye size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Browser Export Viewer: {fileName}</h4>
                  <div className="text-[11px] text-slate-400">
                    {filteredRecords.length} records · {selectedFields.length} columns · {delimiterType.toUpperCase()} delimiter
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBrowser}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy All'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAgain}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  <DownloadCloud size={14} />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBrowserModal(false)}
                  className="text-slate-400 hover:text-white p-1 text-base font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Filter / Search Bar */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter lines in preview stream..."
                  value={searchBrowserText}
                  onChange={(e) => setSearchBrowserText(e.target.value)}
                  className="w-full pl-9 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Displaying <strong>{filteredBrowserLines.length}</strong> lines
              </div>
            </div>

            {/* Modal Content - Code viewer */}
            <div className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-auto whitespace-pre leading-relaxed select-text">
              {filteredBrowserLines.join('\n')}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Formatted with CRLF row breaks and RFC 4180 quotation rules.
              </span>

              <button
                type="button"
                onClick={() => setShowBrowserModal(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
