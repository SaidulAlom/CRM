import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Filter,
  Calendar,
  UserCheck,
  Building2,
  Tag,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ExportEntityType, User, Company } from '../../../types';

export interface ExportFilterState {
  dateRangePreset: 'all' | 'today' | '7days' | '30days' | 'quarter' | 'year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  ownerId?: string;
  department?: string;
  companyId?: string;
  // Specific entity status/type
  contactType?: string;
  companyPriority?: string;
  dealStatus?: string;
  dealStage?: string;
  caseStatus?: string;
  casePriority?: string;
  taskStatus?: string;
  eventConfirmedOnly?: boolean;
}

interface StepApplyFiltersProps {
  entityType: ExportEntityType;
  filters: ExportFilterState;
  onFilterChange: (filters: ExportFilterState) => void;
  onResetFilters: () => void;
  users: User[];
  companies: Company[];
  estimatedCount: number;
  totalAvailableCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export const StepApplyFilters: React.FC<StepApplyFiltersProps> = ({
  entityType,
  filters,
  onFilterChange,
  onResetFilters,
  users,
  companies,
  estimatedCount,
  totalAvailableCount,
  onPrev,
  onNext,
}) => {
  const departments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  ) as string[];

  const handleUpdate = (patch: Partial<ExportFilterState>) => {
    onFilterChange({ ...filters, ...patch });
  };

  const percent = totalAvailableCount > 0 ? Math.round((estimatedCount / totalAvailableCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Intro Header & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Filter size={16} className="text-indigo-600" />
            <span>Step 3: Filter Target Records (Optional)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Narrow your dataset by date range, relationship status, assigned team owner, or client company.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset All Filters</span>
        </button>
      </div>

      {/* Real-Time Estimated Count Counter Badge */}
      <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            {estimatedCount}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <span>Estimated Records to Export</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                {percent}% of database
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {estimatedCount} records match your current filter parameters out of {totalAvailableCount} total in system.
            </div>
          </div>
        </div>

        {estimatedCount === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <AlertCircle size={14} />
            <span>No records match these filters. Loosen criteria to export.</span>
          </div>
        )}
      </div>

      {/* Filter Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1. Date Range Preset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <label className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-600" />
            <span>1. Date Range Filter</span>
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'quarter', label: 'This Quarter' },
              { id: 'year', label: 'This Year' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleUpdate({ dateRangePreset: p.id as any })}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                  filters.dateRangePreset === p.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdate({ dateRangePreset: 'custom' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                filters.dateRangePreset === 'custom'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              Custom Range
            </button>

            {filters.dateRangePreset === 'custom' && (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) => handleUpdate({ customStartDate: e.target.value })}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-xs w-full"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) => handleUpdate({ customEndDate: e.target.value })}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-xs w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Assigned Owner & Department */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <label className="font-bold text-slate-900 flex items-center gap-2">
            <UserCheck size={14} className="text-indigo-600" />
            <span>2. Owner & Department Filter</span>
          </label>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Assigned Team Member / Owner
              </label>
              <select
                value={filters.ownerId || 'all'}
                onChange={(e) => handleUpdate({ ownerId: e.target.value === 'all' ? undefined : e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
              >
                <option value="all">-- All Team Members & Owners --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role} · {u.department || 'Sales'})
                  </option>
                ))}
              </select>
            </div>

            {departments.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Department / Team
                </label>
                <select
                  value={filters.department || 'all'}
                  onChange={(e) => handleUpdate({ department: e.target.value === 'all' ? undefined : e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
                >
                  <option value="all">-- All Departments --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} Department
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 3. Entity Specific Status/Type Filter */}
        {(entityType === 'contacts' || entityType === 'combined') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2">
              <Tag size={14} className="text-indigo-600" />
              <span>Relationship Lifecycle Type</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Relationship Types' },
                { id: 'lead', label: 'Leads Only' },
                { id: 'customer', label: 'Customers Only' },
                { id: 'vendor', label: 'Vendors Only' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleUpdate({ contactType: t.id === 'all' ? undefined : t.id })}
                  className={`p-2 rounded-lg border text-left font-medium ${
                    (filters.contactType === t.id) || (t.id === 'all' && !filters.contactType)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {entityType === 'companies' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2">
              <Tag size={14} className="text-indigo-600" />
              <span>Account Priority Classification</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Priorities' },
                { id: 'Critical', label: 'Critical Accounts' },
                { id: 'High', label: 'High Priority' },
                { id: 'Medium', label: 'Medium & Low' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleUpdate({ companyPriority: p.id === 'all' ? undefined : p.id })}
                  className={`p-2 rounded-lg border text-left font-medium ${
                    (filters.companyPriority === p.id) || (p.id === 'all' && !filters.companyPriority)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {entityType === 'deals' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2">
              <Tag size={14} className="text-indigo-600" />
              <span>Deal Status & Pipeline Health</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Deals' },
                { id: 'open', label: 'Open Pipeline' },
                { id: 'won', label: 'Won Closed' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleUpdate({ dealStatus: s.id === 'all' ? undefined : s.id })}
                  className={`p-2 rounded-lg border text-center font-medium ${
                    (filters.dealStatus === s.id) || (s.id === 'all' && !filters.dealStatus)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {entityType === 'cases' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2">
              <Tag size={14} className="text-indigo-600" />
              <span>Case Status Filter</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Support Cases' },
                { id: 'Open', label: 'Open Tickets' },
                { id: 'In Progress', label: 'In Progress' },
                { id: 'Closed', label: 'Closed Cases' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleUpdate({ caseStatus: s.id === 'all' ? undefined : s.id })}
                  className={`p-2 rounded-lg border text-left font-medium ${
                    (filters.caseStatus === s.id) || (s.id === 'all' && !filters.caseStatus)
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Company Relationship (for contacts, deals, cases, tasks, events) */}
        {entityType !== 'companies' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={14} className="text-indigo-600" />
              <span>Filter by Associated Account</span>
            </label>

            <div>
              <select
                value={filters.companyId || 'all'}
                onChange={(e) => handleUpdate({ companyId: e.target.value === 'all' ? undefined : e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
              >
                <option value="all">-- All Companies & Accounts --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.industry || 'Account'})
                  </option>
                ))}
              </select>
            </div>
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
          <span>Back to Field Selection</span>
        </button>

        <button
          type="button"
          disabled={estimatedCount === 0}
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Output Format</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
