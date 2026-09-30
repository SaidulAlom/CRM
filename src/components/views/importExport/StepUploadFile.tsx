import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';
import { DelimiterType, ImportSourceApp } from '../../../types';
import { MIGRATION_PRESETS } from './migrationPresets';
import { autoDetectDelimiter } from './importUtils';

interface StepUploadFileProps {
  fileName: string;
  fileSize: number;
  rawText: string;
  sourceApp: ImportSourceApp;
  delimiter: DelimiterType;
  customDelimiter: string;
  onFileLoaded: (name: string, size: number, text: string, detectedDelimiter?: DelimiterType) => void;
  onSourceAppChange: (app: ImportSourceApp) => void;
  onDelimiterChange: (delimiter: DelimiterType) => void;
  onCustomDelimiterChange: (char: string) => void;
  onNext: () => void;
}

export const StepUploadFile: React.FC<StepUploadFileProps> = ({
  fileName,
  fileSize,
  rawText,
  sourceApp,
  delimiter,
  customDelimiter,
  onFileLoaded,
  onSourceAppChange,
  onDelimiterChange,
  onCustomDelimiterChange,
  onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const selectedPreset = MIGRATION_PRESETS.find((p) => p.id === sourceApp) || MIGRATION_PRESETS[0];

  const handleFile = (file: File) => {
    setFileError(null);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10 MB maximum upload limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setFileError('The selected file appears to be empty or unreadable.');
        return;
      }
      const detected = autoDetectDelimiter(content);
      onFileLoaded(file.name, file.size, content, detected);
    };
    reader.onerror = () => {
      setFileError('Failed to read file contents from disk.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (presetId: ImportSourceApp) => {
    const preset = MIGRATION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onSourceAppChange(presetId);
      onFileLoaded(
        preset.sampleFileName,
        new Blob([preset.sampleData]).size,
        preset.sampleData,
        'comma'
      );
      setFileError(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const lineCount = rawText ? rawText.split(/\r?\n/).filter((l) => l.trim()).length : 0;

  return (
    <div className="space-y-6">
      {/* Preset Source Application Quick Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Database size={14} className="text-indigo-600" />
            <span>Select Source Application or CRM Format</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Optimizes column detection & matching rules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {MIGRATION_PRESETS.map((preset) => {
            const isSelected = sourceApp === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSourceAppChange(preset.id);
                  if (rawText && preset.id !== 'custom') {
                    // keep raw text if loaded
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${preset.iconBg} ${preset.iconText}`}
                    >
                      {preset.title.charAt(0)}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 truncate" title={preset.title}>
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{preset.vendor}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop File Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/80 scale-[1.005]'
                : rawText
                ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv,.tab"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                rawText ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {rawText ? <FileSpreadsheet size={24} /> : <UploadCloud size={24} />}
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-900">
                {rawText ? 'File loaded ready for mapping' : 'Drop your contact export file here'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports CSV (comma separated), TSV (tab delimited), or custom delimited files (max 10MB)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-semibold text-indigo-600 shadow-2xs">
                Browse workstation...
              </span>
            </div>
          </div>

          {fileError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Loaded File Summary Card */}
          {rawText && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{fileName || 'contacts_import.csv'}</span>
                    <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded font-semibold text-[10px]">
                      Verified Structure
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    {formatFileSize(fileSize || new Blob([rawText]).size)} · {lineCount} total lines detected
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileLoaded('', 0, '');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Clear & Choose Another File
              </button>
            </div>
          )}
        </div>

        {/* Delimiter & Sample Helper Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>File Format & Delimiter</span>
            </h4>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-600">Delimiter Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'comma', label: 'Comma (,)' },
                  { id: 'tab', label: 'Tab (\\t)' },
                  { id: 'semicolon', label: 'Semicolon (;)' },
                  { id: 'pipe', label: 'Pipe (|)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onDelimiterChange(item.id as DelimiterType)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      delimiter === item.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom Delimiter
              </label>
              <input
                type="text"
                maxLength={3}
                placeholder="e.g. ~ or ^"
                value={customDelimiter}
                onChange={(e) => {
                  onCustomDelimiterChange(e.target.value);
                  onDelimiterChange('custom');
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Need test data?</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample(sourceApp)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Load {selectedPreset.title} Sample
                </button>
              </div>
            </div>
          </div>

          {/* Quick Migration Tip */}
          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 text-[11px] text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-indigo-800">
              <Info size={13} />
              <span>{selectedPreset.title} Migration Tip</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {selectedPreset.description} You can also review step-by-step export walkthroughs in the Migration Guide tab.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-2 border-t border-slate-200">
        <button
          type="button"
          disabled={!rawText.trim()}
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Header Detection</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
