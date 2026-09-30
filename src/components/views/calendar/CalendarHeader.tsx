import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Users,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { User, ConfirmationStatus } from '../../../types';
import { DEFAULT_EVENT_TYPES, EventTypeConfig } from './calendarConstants';

interface CalendarHeaderProps {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  setViewMode: (mode: 'month' | 'week' | 'day' | 'agenda') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeUserFilter: string;
  setActiveUserFilter: (userId: string) => void;
  activeTypeFilter: string;
  setActiveTypeFilter: (type: string) => void;
  activeStatusFilter: string;
  setActiveStatusFilter: (status: string) => void;
  activeDepartmentFilter: string;
  setActiveDepartmentFilter: (dept: string) => void;
  users: User[];
  currentUser: User;
  customEventTypes: EventTypeConfig[];
  onCreateEvent: () => void;
  onOpenCustomTypesModal: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  setSearchQuery,
  activeUserFilter,
  setActiveUserFilter,
  activeTypeFilter,
  setActiveTypeFilter,
  activeStatusFilter,
  setActiveStatusFilter,
  activeDepartmentFilter,
  setActiveDepartmentFilter,
  users,
  currentUser,
  customEventTypes,
  onCreateEvent,
  onOpenCustomTypesModal,
}) => {
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const currentYear = dateObj.getFullYear();
  const currentMonthIdx = dateObj.getMonth();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const d = new Date(selectedDate + 'T12:00:00');
    d.setMonth(newMonth);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const d = new Date(selectedDate + 'T12:00:00');
    d.setFullYear(newYear);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const allTypes = [...customEventTypes, ...DEFAULT_EVENT_TYPES];

  // Distinct departments
  const departments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  ) as string[];

  const hasActiveFilters =
    searchQuery ||
    activeUserFilter !== 'all' ||
    activeTypeFilter !== 'all' ||
    activeStatusFilter !== 'all' ||
    activeDepartmentFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveUserFilter('all');
    setActiveTypeFilter('all');
    setActiveStatusFilter('all');
    setActiveDepartmentFilter('all');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Top Level: Title & Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Title & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
              title="Previous timeframe"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={onToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
            >
              Today
            </button>

            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
              title="Next timeframe"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month & Year Jump Selectors */}
          <div className="flex items-center gap-1.5">
            <select
              value={currentMonthIdx}
              onChange={handleMonthChange}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-slate-50 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={handleYearChange}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-slate-50 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer font-mono"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Direct Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 bg-slate-50 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              title="Jump to date"
            />
          </div>
        </div>

        {/* View Mode Segmented Controls & Create Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>

            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week View
            </button>

            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Schedule
            </button>

            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda / List
            </button>
          </div>

          {/* Primary Create Event Button */}
          <button
            type="button"
            onClick={onCreateEvent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Second Level: Search, Quick Perspective, and Filtering Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Quick Calendar Perspective Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveUserFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeUserFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Calendars
          </button>

          <button
            type="button"
            onClick={() => setActiveUserFilter(currentUser.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeUserFilter === currentUser.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Calendar Only
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentUser.department) {
                setActiveDepartmentFilter(currentUser.department);
                setActiveUserFilter('all');
              }
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeDepartmentFilter === currentUser.department && activeUserFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Team ({currentUser.department || 'CRM'})
          </button>
        </div>

        {/* Search & Granular Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* User Filter Dropdown */}
          <select
            value={activeUserFilter}
            onChange={(e) => setActiveUserFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">Every Member</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={activeTypeFilter}
            onChange={(e) => setActiveTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">All Event Types</option>
            {allTypes.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Confirmation Status Filter */}
          <select
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
          >
            <option value="all">All Confirmations</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Not Confirmed">Not Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Manage Event Types Button */}
          <button
            type="button"
            onClick={onOpenCustomTypesModal}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Manage custom event types"
          >
            <Tag size={14} />
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
              title="Clear all active filters"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
