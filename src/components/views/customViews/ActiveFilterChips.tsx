import React from 'react';
import { SavedCustomView, CustomViewFilters } from '../../../types';
import { Filter, X, RotateCcw, Tag } from 'lucide-react';

interface ActiveFilterChipsProps {
  activeView: SavedCustomView | null;
  filters: CustomViewFilters;
  searchQuery?: string;
  onClearFilter: (key: keyof CustomViewFilters | 'search') => void;
  onResetAll: () => void;
  totalRecordsCount: number;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  activeView,
  filters,
  searchQuery,
  onClearFilter,
  onResetAll,
  totalRecordsCount,
}) => {
  const chips: { label: string; key: keyof CustomViewFilters | 'search' }[] = [];

  if (searchQuery && searchQuery.trim()) {
    chips.push({ label: `Search: "${searchQuery}"`, key: 'search' });
  }

  if (filters.nameQuery && filters.nameQuery.trim()) {
    const op = filters.nameOperator || 'contains';
    const opLabel =
      op === 'contains'
        ? 'Contains'
        : op === 'is'
        ? 'Is'
        : op === 'is_not'
        ? 'Is not'
        : op === 'starts_with'
        ? 'Starts with'
        : op === 'ends_with'
        ? 'Ends with'
        : 'Does not contain';
    chips.push({ label: `Name: ${opLabel} "${filters.nameQuery}"`, key: 'nameQuery' });
  }

  if (filters.status && filters.status !== 'All') {
    chips.push({ label: `Status: ${filters.status}`, key: 'status' });
  }

  if (filters.priority && filters.priority !== 'All') {
    chips.push({ label: `Priority: ${filters.priority}`, key: 'priority' });
  }

  if (filters.industry && filters.industry !== 'All') {
    chips.push({ label: `Industry: ${filters.industry}`, key: 'industry' });
  }

  if (filters.city && filters.city.trim()) {
    chips.push({ label: `City: ${filters.city}`, key: 'city' });
  }

  if (filters.email && filters.email.trim()) {
    chips.push({ label: `Email: ${filters.email}`, key: 'email' });
  }

  if (filters.phone && filters.phone.trim()) {
    chips.push({ label: `Phone: ${filters.phone}`, key: 'phone' });
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const rangeLabel =
      filters.dateRange === 'today'
        ? 'Today'
        : filters.dateRange === '7days'
        ? 'Last 7 Days'
        : filters.dateRange === '30days'
        ? 'Last 30 Days'
        : filters.dateRange === '90days'
        ? 'Last 90 Days'
        : 'This Year';
    chips.push({ label: `Date: ${rangeLabel}`, key: 'dateRange' });
  }

  if (chips.length === 0 && !activeView) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs py-1">
      <div className="flex items-center gap-1 text-slate-500 font-medium">
        <Filter size={12} className="text-indigo-600" />
        <span>Filters:</span>
      </div>

      {activeView && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-900 font-medium text-xs shadow-2xs">
          <Tag size={11} className="text-indigo-600" />
          <span>View: <strong>{activeView.title}</strong></span>
        </span>
      )}

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs shadow-2xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onClearFilter(chip.key)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {chips.length > 0 && (
        <button
          type="button"
          onClick={onResetAll}
          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium ml-1 flex items-center gap-1"
        >
          <RotateCcw size={11} />
          <span>Reset All</span>
        </button>
      )}

      <span className="text-[11px] text-slate-400 ml-auto">
        Found {totalRecordsCount} matching {totalRecordsCount === 1 ? 'record' : 'records'}
      </span>
    </div>
  );
};
