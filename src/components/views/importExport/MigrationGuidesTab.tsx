import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  DownloadCloud,
  Copy,
  Info,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { MIGRATION_PRESETS, MigrationAppPreset } from './migrationPresets';
import { ImportSourceApp } from '../../../types';

interface MigrationGuidesTabProps {
  onSelectPresetForImport: (presetId: ImportSourceApp) => void;
}

export const MigrationGuidesTab: React.FC<MigrationGuidesTabProps> = ({
  onSelectPresetForImport,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<ImportSourceApp>('outlook');
  const activePreset = MIGRATION_PRESETS.find((p) => p.id === selectedAppId) || MIGRATION_PRESETS[0];

  const handleCopySample = () => {
    navigator.clipboard.writeText(activePreset.sampleData);
    alert('Sample CSV copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            CRM Migration & Contact Export Guides
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Step-by-step instructions for extracting address books, contact databases, and sales leads from
          legacy CRM platforms and modern enterprise tools into structured CSV files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Navigation: Platform Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1 text-xs">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Supported Source Systems
          </div>

          {MIGRATION_PRESETS.map((preset) => {
            const isSelected = selectedAppId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedAppId(preset.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${preset.iconBg} ${preset.iconText}`}
                  >
                    {preset.title.charAt(0)}
                  </span>
                  <div>
                    <div className="text-xs truncate">{preset.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{preset.badge}</div>
                  </div>
                </div>

                <ChevronRight size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
              </button>
            );
          })}
        </div>

        {/* Right Content: Comprehensive Guide Card */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 text-xs">
            {/* Platform Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${activePreset.iconBg} ${activePreset.iconText} shadow-xs`}
                >
                  {activePreset.title.charAt(0)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activePreset.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {activePreset.vendor}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{activePreset.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPresetForImport(activePreset.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors shrink-0"
              >
                <span>Launch Wizard with {activePreset.title}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Sequential Export Walkthrough Steps */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-indigo-600" />
                <span>Export Procedure Walkthrough</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activePreset.exportInstructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
                  >
                    <div className="font-bold text-slate-900 text-xs text-indigo-700">
                      {step.stepTitle}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {step.stepDetails}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings, Cautions & Best Practices */}
            {activePreset.cautions && activePreset.cautions.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={15} className="text-amber-700" />
                  <span>Important Migration Warnings & Field Notes</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 leading-relaxed">
                  {activePreset.cautions.map((warn, wIdx) => (
                    <li key={wIdx}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Export Data Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Sample Export Format ({activePreset.sampleFileName})
                </span>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  <Copy size={12} />
                  <span>Copy Sample CSV</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-inner">
                {activePreset.sampleData}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
