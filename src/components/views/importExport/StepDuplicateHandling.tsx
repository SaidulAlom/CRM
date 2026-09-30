import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Sliders,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { DuplicateHandlingMode, DuplicateMatchRule, ParsedImportRow } from '../../../types';

interface StepDuplicateHandlingProps {
  duplicateMode: DuplicateHandlingMode;
  duplicateRule: DuplicateMatchRule;
  onDuplicateModeChange: (mode: DuplicateHandlingMode) => void;
  onDuplicateRuleChange: (rule: DuplicateMatchRule) => void;
  duplicateCount: number;
  duplicateRows: ParsedImportRow[];
  onToggleRowAction?: (rowNumber: number, action: 'insert' | 'update' | 'skip') => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepDuplicateHandling: React.FC<StepDuplicateHandlingProps> = ({
  duplicateMode,
  duplicateRule,
  onDuplicateModeChange,
  onDuplicateRuleChange,
  duplicateCount,
  duplicateRows,
  onToggleRowAction,
  onPrev,
  onNext,
}) => {
  const modes: {
    id: DuplicateHandlingMode;
    title: string;
    description: string;
    icon: any;
    badge: string;
  }[] = [
    {
      id: 'skip',
      title: 'Skip duplicate records',
      description: 'Existing CRM contacts are preserved untouched. Duplicate records in the file will not be imported.',
      icon: CheckCircle2,
      badge: 'Safest',
    },
    {
      id: 'update',
      title: 'Update existing contacts',
      description: 'Merge and overwrite existing contact fields with updated telephone numbers, titles, and address data from the imported file.',
      icon: RefreshCw,
      badge: 'Recommended',
    },
    {
      id: 'create_new',
      title: 'Create new records anyway',
      description: 'Bypass duplicate checks and create brand new contact entries regardless of matching email, phone, or name.',
      icon: PlusCircle,
      badge: 'Permissive',
    },
    {
      id: 'ask_user',
      title: 'Ask me for each duplicate record',
      description: 'Review each conflicting contact individually and manually choose whether to skip, update, or create a new contact.',
      icon: HelpCircle,
      badge: 'Interactive',
    },
  ];

  const rules: {
    id: DuplicateMatchRule;
    title: string;
    description: string;
  }[] = [
    {
      id: 'email',
      title: 'Email Address (Standard)',
      description: 'Matches contact by exact primary email address (case-insensitive).',
    },
    {
      id: 'phone',
      title: 'Phone Number',
      description: 'Matches contact by direct work phone or mobile cellular digits.',
    },
    {
      id: 'name_and_company',
      title: 'Name & Company Combination',
      description: 'Matches contact if both full name and employer company correspond.',
    },
    {
      id: 'name_only',
      title: 'Full Name Only',
      description: 'Matches contact by first and last name regardless of email address.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Copy size={16} className="text-indigo-600" />
          <span>Configurable Duplicate Resolution</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose how the CRM handles records in your import file that match contacts already stored in the system.
        </p>
      </div>

      {/* Matching Rules Configuration */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders size={14} className="text-indigo-600" />
          <span>Duplicate Matching Rule</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {rules.map((rule) => {
            const isSelected = duplicateRule === rule.id;
            return (
              <button
                key={rule.id}
                type="button"
                onClick={() => onDuplicateRuleChange(rule.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{rule.title}</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duplicate Handling Strategy Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Duplicate Handling Action
          </label>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {duplicateCount} duplicate records detected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {modes.map((mode) => {
            const isSelected = duplicateMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onDuplicateModeChange(mode.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">{mode.title}</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Duplicate Resolution Review (For ask_user mode or review) */}
      {duplicateMode === 'ask_user' && duplicateRows.length > 0 && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-600" />
              <span>Review Individual Duplicate Records ({duplicateRows.length})</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Customize action per row
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {duplicateRows.map((row) => (
              <div
                key={row.rowNumber}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    Row #{row.rowNumber}: {row.mappedRecord.firstName} {row.mappedRecord.lastName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {row.mappedRecord.email || row.mappedRecord.phone} · Conflicts with: {row.duplicateOfName}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['skip', 'update', 'insert'] as const).map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => onToggleRowAction && onToggleRowAction(row.rowNumber, act)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        row.action === act
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {act === 'insert' ? 'Create New' : act}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Preview</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Final Confirmation</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
