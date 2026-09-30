import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Settings,
  DownloadCloud,
  Eye,
  FileSpreadsheet,
  Quote,
  AlignLeft,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  ExportDestination,
  ExportDelimiterType,
  ExportEncapsulationType,
  ExportRowSeparatorType,
} from '../../../types';

interface StepConfigureFormatProps {
  destination: ExportDestination;
  onDestinationChange: (dest: ExportDestination) => void;
  delimiterType: ExportDelimiterType;
  onDelimiterChange: (del: ExportDelimiterType) => void;
  customDelimiter: string;
  onCustomDelimiterChange: (char: string) => void;
  encapsulationType: ExportEncapsulationType;
  onEncapsulationChange: (enc: ExportEncapsulationType) => void;
  customEncapsulator: string;
  onCustomEncapsulatorChange: (char: string) => void;
  rowSeparatorType: ExportRowSeparatorType;
  onRowSeparatorChange: (sep: ExportRowSeparatorType) => void;
  includeHeaders: boolean;
  onIncludeHeadersChange: (val: boolean) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepConfigureFormat: React.FC<StepConfigureFormatProps> = ({
  destination,
  onDestinationChange,
  delimiterType,
  onDelimiterChange,
  customDelimiter,
  onCustomDelimiterChange,
  encapsulationType,
  onEncapsulationChange,
  customEncapsulator,
  onCustomEncapsulatorChange,
  rowSeparatorType,
  onRowSeparatorChange,
  includeHeaders,
  onIncludeHeadersChange,
  fileName,
  onFileNameChange,
  onPrev,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Settings size={16} className="text-indigo-600" />
          <span>Step 4: Configure Output Format & Delimiters</span>
        </h3>
        <p className="text-xs text-slate-500">
          Configure how data is encapsulated, separated, formatted, and delivered to your workstation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Destination Cards */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider block">
              1. Export Destination
            </label>

            <div className="space-y-2.5">
              {[
                {
                  id: 'download',
                  title: 'Download File',
                  desc: 'Save structured file (.csv, .tsv, .txt) directly to local disk.',
                  icon: DownloadCloud,
                  badge: 'Standard',
                },
                {
                  id: 'excel',
                  title: 'Open in Microsoft Excel',
                  desc: 'Generate Excel-compatible file with UTF-8 BOM encoding for seamless launch.',
                  icon: FileSpreadsheet,
                  badge: 'Recommended',
                },
                {
                  id: 'browser',
                  title: 'Display in Browser',
                  desc: 'Inspect formatted export directly inside an interactive viewer with copy & search.',
                  icon: Eye,
                  badge: 'Preview Only',
                },
              ].map((item) => {
                const isSelected = destination === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onDestinationChange(item.id as ExportDestination);
                      // If user selects Excel, set comma and CRLF for standard Excel compatibility
                      if (item.id === 'excel') {
                        onDelimiterChange('comma');
                        onRowSeparatorChange('crlf');
                        onEncapsulationChange('double');
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target File Name Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
            <label className="font-bold text-slate-900 block">Output File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="e.g. crm_export_data.csv"
            />
            <span className="text-[10px] text-slate-400 block">
              Default extension automatically synced with format.
            </span>
          </div>
        </div>

        {/* Middle Column: Delimiter & Encapsulation */}
        <div className="space-y-4">
          {/* Delimiter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider block">
              2. Field Delimiter
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'comma', label: 'Comma (,)', desc: 'Standard CSV' },
                { id: 'tab', label: 'Tab (\\t)', desc: 'Excel / TSV' },
                { id: 'semicolon', label: 'Semicolon (;)', desc: 'European locale' },
                { id: 'pipe', label: 'Pipe (|)', desc: 'Data warehouse' },
                { id: 'custom', label: 'Custom Delimiter', desc: 'User specified' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDelimiterChange(d.id as ExportDelimiterType)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    delimiterType === d.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-semibold">{d.label}</div>
                  <div className="text-[10px] text-slate-400">{d.desc}</div>
                </button>
              ))}
            </div>

            {delimiterType === 'custom' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Delimiter Character
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customDelimiter}
                  onChange={(e) => onCustomDelimiterChange(e.target.value)}
                  placeholder="e.g. ~ or ^"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Record Encapsulation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Quote size={13} className="text-indigo-600" />
              <span>3. Record Encapsulation</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'double', label: 'Double Quotes (")', desc: 'RFC 4180 (Default)' },
                { id: 'single', label: 'Single Quotes (\')', desc: 'SQL / Script standard' },
                { id: 'none', label: 'None', desc: 'No field quotes' },
                { id: 'custom', label: 'Custom Character', desc: 'User specified' },
              ].map((enc) => (
                <button
                  key={enc.id}
                  type="button"
                  onClick={() => onEncapsulationChange(enc.id as ExportEncapsulationType)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    encapsulationType === enc.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-semibold">{enc.label}</div>
                  <div className="text-[10px] text-slate-400">{enc.desc}</div>
                </button>
              ))}
            </div>

            {encapsulationType === 'custom' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Encapsulator Character
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={customEncapsulator}
                  onChange={(e) => onCustomEncapsulatorChange(e.target.value)}
                  placeholder="e.g. ~ or %"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Row Separator & Headers */}
        <div className="space-y-4">
          {/* Row Separator */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft size={13} className="text-indigo-600" />
              <span>4. Row / Record Separator</span>
            </label>

            <div className="space-y-2">
              {[
                {
                  id: 'crlf',
                  label: 'CRLF (\\r\\n) — Carriage Return + Line Feed',
                  desc: 'Default for Windows, Microsoft Excel, and Office apps.',
                  badge: 'Standard',
                },
                {
                  id: 'lf',
                  label: 'LF (\\n) — Line Feed Only',
                  desc: 'Standard for Linux, macOS, and cloud services.',
                  badge: 'Unix/Mac',
                },
                {
                  id: 'cr',
                  label: 'CR (\\r) — Carriage Return Only',
                  desc: 'Legacy classic Mac spreadsheet format.',
                  badge: 'Legacy',
                },
              ].map((sep) => (
                <button
                  key={sep.id}
                  type="button"
                  onClick={() => onRowSeparatorChange(sep.id as ExportRowSeparatorType)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                    rowSeparatorType === sep.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{sep.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {sep.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sep.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Header Row Toggle */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
            <label className="font-bold text-slate-900 block">5. Header Names</label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => onIncludeHeadersChange(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="font-semibold text-slate-700">
                Include column field names as first row header
              </span>
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Recommended for spreadsheet and analytical tools to map data columns automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Filters</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Preview</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
