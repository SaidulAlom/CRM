import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  FileSpreadsheet,
  Table,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
  DownloadCloud,
} from 'lucide-react';
import {
  ExportEntityType,
  ExportDestination,
  ExportDelimiterType,
  ExportEncapsulationType,
  ExportRowSeparatorType,
} from '../../../types';
import { ExportFieldDefinition } from './exportDefinitions';
import {
  generateExportOutput,
  resolveDelimiterCharacter,
  resolveRowSeparator,
} from './exportFormatter';

interface StepExportPreviewProps {
  entityType: ExportEntityType;
  entityLabel: string;
  selectedFields: ExportFieldDefinition[];
  filteredRecords: any[];
  totalRecordsCount: number;
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
  onPrev: () => void;
  onProceedToExport: () => void;
}

export const StepExportPreview: React.FC<StepExportPreviewProps> = ({
  entityType,
  entityLabel,
  selectedFields,
  filteredRecords,
  totalRecordsCount,
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
  onPrev,
  onProceedToExport,
}) => {
  const [previewTab, setPreviewTab] = useState<'grid' | 'raw'>('grid');

  // Generate sample raw text for first 5 records
  const sampleRecords = filteredRecords.slice(0, 5);
  const sampleRawText = generateExportOutput(
    sampleRecords,
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

  const delimChar = resolveDelimiterCharacter(delimiterType, customDelimiter);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Eye size={16} className="text-indigo-600" />
            <span>Step 5: Review Export Specifications & Preview</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify all parameters, field mappings, and encapsulation settings before generating the file.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <DownloadCloud size={14} />
          <span>Confirm & Start Export</span>
        </button>
      </div>

      {/* Specifications Breakdown Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Selected Table
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
            {entityLabel}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Records Count
          </span>
          <span className="text-xs font-bold text-indigo-700 mt-1 block">
            {totalRecordsCount} records
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Fields Included
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">
            {selectedFields.length} columns
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Destination
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block capitalize">
            {destination.replace('_', ' ')}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Delimiter
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 mt-1 block">
            {delimiterType === 'comma' ? 'Comma (,)' : delimiterType === 'tab' ? 'Tab (\\t)' : delimChar}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Encapsulation
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block capitalize">
            {encapsulationType}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Row Separator
          </span>
          <span className="text-xs font-bold text-slate-900 mt-1 block uppercase font-mono">
            {rowSeparatorType}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Header Row
          </span>
          <span className="text-xs font-bold text-emerald-700 mt-1 block">
            {includeHeaders ? 'Included' : 'None'}
          </span>
        </div>
      </div>

      {/* Applied Filters Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Applied Filter Summary:</span>
          <span className="text-slate-600 font-medium">{filtersSummary || 'All records without restrictions'}</span>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Target file: <strong>{fileName}</strong>
        </div>
      </div>

      {/* Interactive Sample Data Preview Box */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Preview Formatted Output</span>
            <span className="text-[11px] text-slate-500">(First 5 Sample Records)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table size={13} />
              <span>Table Grid View</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'raw'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode size={13} />
              <span>Raw Delimited Stream</span>
            </button>
          </div>
        </div>

        {previewTab === 'grid' ? (
          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold text-[10px] uppercase text-slate-400 w-12 text-center">
                    #
                  </th>
                  {selectedFields.map((f) => (
                    <th key={f.key} className="py-2.5 px-3 font-bold border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleRecords.map((rec, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] bg-slate-50/50">
                      {rIdx + 1}
                    </td>
                    {selectedFields.map((f) => (
                      <td key={f.key} className="py-2 px-3 text-slate-700 border-r border-slate-100 last:border-r-0 max-w-[200px] truncate">
                        {f.accessor(rec, context) || <span className="text-slate-300 italic">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border-t border-slate-800">
            {sampleRawText}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Configuration</span>
        </button>

        <button
          type="button"
          onClick={onProceedToExport}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <DownloadCloud size={15} />
          <span>Execute & Export {totalRecordsCount} Records</span>
        </button>
      </div>
    </div>
  );
};
