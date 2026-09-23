import React, { useState, useEffect } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  CustomViewModule,
  CustomViewFilters,
  CustomViewNameMatchOperator,
  SavedCustomView,
} from '../../../types';
import {
  Search,
  Filter,
  Sliders,
  RotateCcw,
  Check,
  Plus,
  Layers,
  ChevronDown,
  Globe,
  Lock,
  Star,
  Sparkles,
  BookmarkPlus,
  X,
} from 'lucide-react';

interface ExtendedSearchPanelProps {
  module: CustomViewModule;
  activeView: SavedCustomView | null;
  onSelectView: (view: SavedCustomView) => void;
  filters: CustomViewFilters;
  onApplyFilters: (filters: CustomViewFilters) => void;
  onResetFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ExtendedSearchPanel: React.FC<ExtendedSearchPanelProps> = ({
  module,
  activeView,
  onSelectView,
  filters,
  onApplyFilters,
  onResetFilters,
  isOpen,
  onClose,
}) => {
  const {
    getViewsForModule,
    openCreateCustomView,
    openManageViews,
    userDefaultViews,
    currentUser,
    users,
    fieldSets,
  } = useCRM();

  // Local state for extended search form
  const [nameOperator, setNameOperator] = useState<CustomViewNameMatchOperator>('contains');
  const [nameQuery, setNameQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerId, setOwnerId] = useState('All');
  const [dateRange, setDateRange] = useState<string>('all');
  const [stage, setStage] = useState('All');

  // Sync with incoming filters or active view
  useEffect(() => {
    setNameOperator(filters.nameOperator || 'contains');
    setNameQuery(filters.nameQuery || '');
    setStatus(filters.status || 'All');
    setPriority(filters.priority || 'All');
    setIndustry(filters.industry || 'All');
    setCity(filters.city || '');
    setEmail(filters.email || '');
    setPhone(filters.phone || '');
    setOwnerId(filters.ownerId || 'All');
    setDateRange(filters.dateRange || 'all');
    setStage(filters.stage || 'All');
  }, [filters, isOpen]);

  const availableViews = getViewsForModule(module);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const applied: CustomViewFilters = {};
    if (nameQuery.trim()) {
      applied.nameQuery = nameQuery.trim();
      applied.nameOperator = nameOperator;
    }
    if (status !== 'All') applied.status = status;
    if (priority !== 'All') applied.priority = priority;
    if (industry !== 'All') applied.industry = industry;
    if (city.trim()) applied.city = city.trim();
    if (email.trim()) applied.email = email.trim();
    if (phone.trim()) applied.phone = phone.trim();
    if (ownerId !== 'All') applied.ownerId = ownerId;
    if (dateRange !== 'all') applied.dateRange = dateRange as any;
    if (stage !== 'All') applied.stage = stage;

    onApplyFilters(applied);
  };

  const handleClear = () => {
    setNameOperator('contains');
    setNameQuery('');
    setStatus('All');
    setPriority('All');
    setIndustry('All');
    setCity('');
    setEmail('');
    setPhone('');
    setOwnerId('All');
    setDateRange('all');
    setStage('All');
    onResetFilters();
  };

  const handleSaveAsCustomView = () => {
    const currentFilters: CustomViewFilters = {
      nameQuery: nameQuery.trim() || undefined,
      nameOperator,
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      industry: industry !== 'All' ? industry : undefined,
      city: city.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      ownerId: ownerId !== 'All' ? ownerId : undefined,
      dateRange: (dateRange !== 'all' ? dateRange : undefined) as any,
      stage: stage !== 'All' ? stage : undefined,
    };
    openCreateCustomView(module, currentFilters);
  };

  if (!isOpen) return null;

  return (
    <div
      id="extended-search-panel"
      className="bg-white rounded-2xl border border-indigo-200/80 shadow-md p-5 space-y-5 animate-in slide-in-from-top-2 duration-150"
    >
      {/* Top Bar: View Selector Dropdown & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sliders size={15} className="text-indigo-600" />
            <span>Select Custom View:</span>
          </div>

          {/* Custom View Dropdown (FR-2 requirement) */}
          <div className="relative min-w-[240px]">
            <select
              id="select-custom-view-dropdown"
              value={activeView?.id || ''}
              onChange={(e) => {
                const found = availableViews.find((v) => v.id === e.target.value);
                if (found) onSelectView(found);
              }}
              className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="" disabled>
                Select Custom View ▼
              </option>
              {availableViews.map((v) => {
                const isDefault = userDefaultViews[currentUser.id]?.[v.module] === v.id;
                return (
                  <option key={v.id} value={v.id}>
                    {v.title} {isDefault ? '★ (Default)' : ''} {v.isSystem ? '• System' : v.isShared ? '• Team' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {activeView && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Showing <strong>{activeView.columns.length} columns</strong>
            </span>
          )}
        </div>

        {/* View Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAsCustomView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-lg text-xs font-semibold transition-colors"
          >
            <BookmarkPlus size={13} />
            <span>Save as Custom View</span>
          </button>

          <button
            type="button"
            onClick={() => openManageViews(module)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Layers size={13} />
            <span>Manage Views</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close Extended Search"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Extended Search Parameters Form */}
      <form onSubmit={handleApply} className="space-y-4 text-xs">
        {/* Name Matching Section */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          <label className="font-bold text-slate-800 block text-xs mb-2">
            Name Matching Parameter ({module === 'company' ? 'Company Name' : module === 'deal' ? 'Deal Title' : 'Person Name'})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select
              value={nameOperator}
              onChange={(e) => setNameOperator(e.target.value as CustomViewNameMatchOperator)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="contains">Contains</option>
              <option value="is">Is (Exact)</option>
              <option value="is_not">Is not</option>
              <option value="starts_with">Starts with</option>
              <option value="ends_with">Ends with</option>
              <option value="does_not_contain">Does not contain</option>
            </select>
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder={`Search query (e.g. ${module === 'company' ? 'Acme, Tech, Global' : 'Marcus, Sarah'})`}
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Status Filter */}
          {module === 'company' ? (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          ) : module === 'deal' ? (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Deal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="open">Open</option>
                <option value="won">Closed Won</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Contact Status / Type</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Types</option>
                <option value="lead">Leads</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Industry Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Industries</option>
              {fieldSets.industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned User */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Assigned User</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="All">Anyone / All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">City / Location</label>
            <input
              type="text"
              placeholder="Filter by city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Email Contains</label>
            <input
              type="text"
              placeholder="e.g. domain.com..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Phone</label>
            <input
              type="text"
              placeholder="Digits or area code..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-slate-700">Created Date</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw size={13} />
            <span>Clear / Reset Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Check size={14} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
