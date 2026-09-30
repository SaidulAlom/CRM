import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Columns,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ColumnMappingItem } from '../../../types';
import { CRM_CONTACT_FIELDS } from './migrationPresets';

interface StepColumnMappingProps {
  mapping: ColumnMappingItem[];
  onMappingChange: (newMapping: ColumnMappingItem[]) => void;
  onAutoMap: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepColumnMapping: React.FC<StepColumnMappingProps> = ({
  mapping,
  onMappingChange,
  onAutoMap,
  onPrev,
  onNext,
}) => {
  const handleFieldSelect = (index: number, newTarget: string) => {
    const updated = [...mapping];
    const isRequired = CRM_CONTACT_FIELDS.find((f) => f.key === newTarget)?.required;
    updated[index] = {
      ...updated[index],
      targetField: newTarget,
      isRequired,
    };
    onMappingChange(updated);
  };

  // Check required fields mapped
  const mappedKeys = new Set(mapping.map((m) => m.targetField));
  const hasFirstName = mappedKeys.has('firstName');
  const hasLastName = mappedKeys.has('lastName');
  const hasEmail = mappedKeys.has('email');

  const mappedCount = mapping.filter((m) => m.targetField && m.targetField !== '__ignore__').length;
  const ignoredCount = mapping.length - mappedCount;

  return (
    <div className="space-y-6">
      {/* Intro Header & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Columns size={16} className="text-indigo-600" />
            <span>Map Imported Columns to CRM Fields</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Match each column from your export file to the corresponding CRM contact record attribute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoMap}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Auto-Match Columns</span>
          </button>
        </div>
      </div>

      {/* Validation status of required CRM fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            hasFirstName
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-rose-50/70 border-rose-200 text-rose-800'
          }`}
        >
          {hasFirstName ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          <div>
            <div className="font-bold">First Name (Required)</div>
            <div className="text-[11px] opacity-80">
              {hasFirstName ? 'Mapped successfully' : 'Not mapped yet'}
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            hasLastName
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-rose-50/70 border-rose-200 text-rose-800'
          }`}
        >
          {hasLastName ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          <div>
            <div className="font-bold">Last Name (Required)</div>
            <div className="text-[11px] opacity-80">
              {hasLastName ? 'Mapped successfully' : 'Not mapped yet'}
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            hasEmail
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-amber-50/70 border-amber-200 text-amber-800'
          }`}
        >
          {hasEmail ? <CheckCircle2 size={16} className="shrink-0" /> : <HelpCircle size={16} className="shrink-0" />}
          <div>
            <div className="font-bold">Email Address (Recommended)</div>
            <div className="text-[11px] opacity-80">
              {hasEmail ? 'Mapped for duplicate checking' : 'Unmapped (Duplicates won\'t check email)'}
            </div>
          </div>
        </div>
      </div>

      {/* Column Mapping Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-700">
            Detected Columns ({mapping.length})
          </div>
          <div className="text-slate-500 text-[11px]">
            <span className="font-bold text-emerald-700">{mappedCount} mapped</span> ·{' '}
            <span className="text-slate-400">{ignoredCount} ignored</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold text-slate-700 w-1/4">
                  Imported Column Header
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-700 w-1/4">
                  Sample Data (Row 1)
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-700 w-1/3">
                  Map to CRM Field
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-700 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mapping.map((item, idx) => {
                const targetDef = CRM_CONTACT_FIELDS.find((f) => f.key === item.targetField);
                const isIgnored = item.targetField === '__ignore__';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isIgnored ? 'opacity-60 bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.sourceColumn}</div>
                      <div className="text-[10px] text-slate-400">Column Index {idx + 1}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div
                        className="text-slate-600 font-mono text-[11px] truncate max-w-[220px]"
                        title={item.sampleValue}
                      >
                        {item.sampleValue || <span className="text-slate-300 italic">—</span>}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.targetField}
                          onChange={(e) => handleFieldSelect(idx, e.target.value)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                            isIgnored
                              ? 'bg-slate-100 border-slate-300 text-slate-500'
                              : targetDef?.required
                              ? 'bg-indigo-50/60 border-indigo-300 text-indigo-900 font-semibold'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="__ignore__">-- Ignore / Do Not Import --</option>
                          <optgroup label="Required Fields">
                            {CRM_CONTACT_FIELDS.filter((f) => f.required).map((f) => (
                              <option key={f.key} value={f.key}>
                                ★ {f.label} (Required)
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Contact Information">
                            {CRM_CONTACT_FIELDS.filter((f) => !f.required && f.category === 'contact_info').map((f) => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Organization & Core Details">
                            {CRM_CONTACT_FIELDS.filter((f) => !f.required && (f.category === 'core' || f.category === 'organization')).map((f) => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Addresses & Notes">
                            {CRM_CONTACT_FIELDS.filter((f) => !f.required && (f.category === 'address' || f.category === 'metadata')).map((f) => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isIgnored ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                          Ignored
                        </span>
                      ) : targetDef?.required ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          Required Key
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          <span>Back to Detection</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Data Preview</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
