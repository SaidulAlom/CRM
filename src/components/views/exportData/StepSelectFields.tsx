import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Columns,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ExportFieldDefinition } from './exportDefinitions';
import { ExportEntityType } from '../../../types';

interface StepSelectFieldsProps {
  availableFields: ExportFieldDefinition[];
  orderedFieldKeys: string[];
  selectedFieldKeys: string[];
  onToggleField: (key: string) => void;
  onSelectAll: () => void;
  onResetDefaults: () => void;
  onMoveFieldUp: (index: number) => void;
  onMoveFieldDown: (index: number) => void;
  entityType: ExportEntityType;
  onPrev: () => void;
  onNext: () => void;
  isStandardUser: boolean;
}

export const StepSelectFields: React.FC<StepSelectFieldsProps> = ({
  availableFields,
  orderedFieldKeys,
  selectedFieldKeys,
  onToggleField,
  onSelectAll,
  onResetDefaults,
  onMoveFieldUp,
  onMoveFieldDown,
  entityType,
  onPrev,
  onNext,
  isStandardUser,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Columns size={16} className="text-indigo-600" />
            <span>Step 2: Choose & Order Export Columns</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the specific attributes to include in your output file and adjust their order using the arrows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Select All Fields
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Selected vs Total Counter Bar */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-bold text-indigo-600 text-sm">
            {selectedFieldKeys.length}
          </span>
          <span className="text-slate-500">
            of {orderedFieldKeys.length} columns selected for export
          </span>
        </div>

        {selectedFieldKeys.length === 0 && (
          <span className="text-rose-600 font-bold">
            Please select at least one field to proceed.
          </span>
        )}
      </div>

      {/* Reorderable Fields List */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-3">
            <span className="w-8 text-center text-slate-400">Order</span>
            <span>Attribute / Field Name</span>
          </div>
          <div className="flex items-center gap-8 pr-2">
            <span>Category</span>
            <span>Reorder Position</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
          {orderedFieldKeys.map((key, idx) => {
            const field = availableFields.find((f) => f.key === key);
            if (!field) return null;

            const isSelected = selectedFieldKeys.includes(key);
            const isFirst = idx === 0;
            const isLast = idx === orderedFieldKeys.length - 1;

            return (
              <div
                key={key}
                className={`p-3 transition-colors flex items-center justify-between gap-3 text-xs ${
                  isSelected ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-60'
                }`}
              >
                {/* Left: Checkbox & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-8 text-center font-mono text-[11px] text-slate-400">
                    #{idx + 1}
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleField(key)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{field.label}</span>
                        {field.isSensitive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Lock size={9} />
                            <span>Confidential</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">
                        {field.description}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Right: Category Badge & Up/Down Reorder Controls */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-slate-100 text-slate-600 border border-slate-200">
                    {field.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMoveFieldUp(idx)}
                      className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move column up"
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMoveFieldDown(idx)}
                      className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move column down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          <span>Back to Data Selection</span>
        </button>

        <button
          type="button"
          disabled={selectedFieldKeys.length === 0}
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Record Filters</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
