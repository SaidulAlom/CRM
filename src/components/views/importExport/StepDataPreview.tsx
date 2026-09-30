import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Users,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import { ParsedImportRow, ImportPreviewStats } from '../../../types';

interface StepDataPreviewProps {
  stats: ImportPreviewStats;
  parsedRows: ParsedImportRow[];
  onPrev: () => void;
  onNext: () => void;
}

export const StepDataPreview: React.FC<StepDataPreviewProps> = ({
  stats,
  parsedRows,
  onPrev,
  onNext,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = parsedRows.filter((row) => {
    // Tab filter
    if (filterMode === 'valid' && !row.isValid) return false;
    if (filterMode === 'invalid' && row.isValid) return false;
    if (filterMode === 'duplicate' && !row.isDuplicate) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = `${row.mappedRecord.firstName || ''} ${row.mappedRecord.lastName || ''}`.toLowerCase();
      const email = (row.mappedRecord.email || '').toLowerCase();
      const company = ((row.mappedRecord as any).companyName || '').toLowerCase();
      return name.includes(q) || email.includes(q) || company.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Preview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Records
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalRecords}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Rows in file</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Valid Records
          </div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{stats.validRecords}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Ready to import</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
            Invalid Records
          </div>
          <div className="text-xl font-bold text-rose-800 mt-1">{stats.invalidRecords}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Validation errors</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Duplicates
          </div>
          <div className="text-xl font-bold text-amber-800 mt-1">{stats.duplicateRecords}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Already in CRM</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Missing Required
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">{stats.missingRequiredCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Name missing</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Mapping Errors
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">{stats.mappingErrorsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Missing key field</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All Records (${parsedRows.length})` },
            { id: 'valid', label: `Valid (${stats.validRecords})` },
            { id: 'invalid', label: `Errors (${stats.invalidRecords})` },
            { id: 'duplicate', label: `Duplicates (${stats.duplicateRecords})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                filterMode === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search preview records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Records Preview Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Row</th>
                <th className="py-2.5 px-3 font-semibold">Contact Name</th>
                <th className="py-2.5 px-3 font-semibold">Email</th>
                <th className="py-2.5 px-3 font-semibold">Phone</th>
                <th className="py-2.5 px-3 font-semibold">Company / Org</th>
                <th className="py-2.5 px-3 font-semibold">Designation</th>
                <th className="py-2.5 px-3 font-semibold">Validation & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No preview records found matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !row.isValid
                        ? 'bg-rose-50/30'
                        : row.isDuplicate
                        ? 'bg-amber-50/30'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-[11px] font-mono text-slate-400 text-center">
                      #{row.rowNumber}
                    </td>

                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900">
                        {row.mappedRecord.firstName || row.mappedRecord.lastName ? (
                          `${row.mappedRecord.firstName || ''} ${row.mappedRecord.lastName || ''}`.trim()
                        ) : (
                          <span className="text-rose-600 font-semibold">[Missing Name]</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-slate-700 font-mono text-[11px] truncate max-w-[180px]">
                        {row.mappedRecord.email || <span className="text-slate-300 italic">—</span>}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-slate-600 text-[11px]">
                        {row.mappedRecord.phone || row.mappedRecord.mobile || (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-slate-800 font-medium truncate max-w-[140px]">
                        {(row.mappedRecord as any).companyName || (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-slate-600 truncate max-w-[140px]">
                        {row.mappedRecord.jobTitle || (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="space-y-1">
                        {!row.isValid ? (
                          <div className="flex flex-col gap-0.5">
                            {row.errors.map((err, errIdx) => (
                              <span
                                key={errIdx}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                              >
                                <AlertCircle size={11} className="shrink-0" />
                                <span>{err}</span>
                              </span>
                            ))}
                          </div>
                        ) : row.isDuplicate ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle size={11} className="shrink-0" />
                              <span>Duplicate of: {row.duplicateOfName || 'Existing Contact'}</span>
                            </span>
                            <span className="text-[10px] text-amber-700">
                              {row.duplicateConflictReason}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Valid Contact</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
          <span>Back to Mapping</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Duplicate Handling</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
