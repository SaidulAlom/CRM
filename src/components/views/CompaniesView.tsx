import React, { useState, useMemo, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Company, SavedCustomView, CustomViewFilters } from '../../types';
import { matchesCompanyFilters, MODULE_COLUMNS, ColumnDefinition } from '../../utils/customViewUtils';
import { ExtendedSearchPanel } from './customViews/ExtendedSearchPanel';
import { ActiveFilterChips } from './customViews/ActiveFilterChips';
import {
  Plus,
  Search,
  Sliders,
  ExternalLink,
  Trash2,
  BookmarkCheck,
  Flag,
  Layers,
  Star,
  Globe,
  Lock,
  ChevronDown,
} from 'lucide-react';

export const CompaniesView: React.FC = () => {
  const {
    companies,
    defaultCompany,
    setDefaultCompanyId,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
    deleteCompany,
    fieldSets,
    users,
    getViewsForModule,
    getDefaultViewForModule,
    userDefaultViews,
    currentUser,
    openCreateCustomView,
    openManageViews,
  } = useCRM();

  // Custom View & Extended Search State
  const [activeView, setActiveView] = useState<SavedCustomView | null>(null);
  const [extendedFilters, setExtendedFilters] = useState<CustomViewFilters>({});
  const [isExtendedSearchOpen, setIsExtendedSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  // Auto-load default custom view on initial mount or when user changes
  useEffect(() => {
    const defaultView = getDefaultViewForModule('company');
    if (defaultView && !activeView) {
      setActiveView(defaultView);
      setExtendedFilters(defaultView.filters || {});
    }
  }, [currentUser.id, getDefaultViewForModule]);

  const availableViews = useMemo(() => {
    return getViewsForModule('company');
  }, [getViewsForModule]);

  // Handle selecting a custom view
  const handleSelectView = (view: SavedCustomView) => {
    setActiveView(view);
    setExtendedFilters(view.filters || {});
  };

  // Filter companies matching custom view + extended search + quick search
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => !c.deletedAt)
      .filter((c) => {
        // Quick search across common fields
        if (!quickSearch.trim()) return true;
        const q = quickSearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.website?.toLowerCase().includes(q)
        );
      })
      .filter((c) => matchesCompanyFilters(c, extendedFilters, users));
  }, [companies, quickSearch, extendedFilters, users]);

  // Determine which columns to display dynamically
  const displayColumnKeys = useMemo(() => {
    if (activeView && activeView.columns && activeView.columns.length > 0) {
      return activeView.columns;
    }
    // Default fallback columns
    const companyCols = MODULE_COLUMNS.company || [];
    return companyCols.filter((c) => c.defaultSelected).map((c) => c.key);
  }, [activeView]);

  const allCompanyColumns = MODULE_COLUMNS.company || [];
  const columnDefMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition>();
    allCompanyColumns.forEach((c) => map.set(c.key, c));
    return map;
  }, [allCompanyColumns]);

  // Clear single filter chip
  const handleClearFilter = (key: keyof CustomViewFilters | 'search') => {
    if (key === 'search') {
      setQuickSearch('');
    } else {
      setExtendedFilters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleResetAllFilters = () => {
    setQuickSearch('');
    setExtendedFilters({});
  };

  // Render a cell based on column key
  const renderCellContent = (company: Company, colKey: string) => {
    const owner = users.find((u) => u.id === company.ownerId);

    switch (colKey) {
      case 'name':
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 group-hover:text-indigo-600">
              {company.name}
            </span>
            {company.isDefault && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                Default
              </span>
            )}
          </div>
        );
      case 'industry':
        return <span className="text-slate-600">{company.industry || '—'}</span>;
      case 'priority':
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              company.priority === 'Critical'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : company.priority === 'High'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {company.priority || 'Normal'}
          </span>
        );
      case 'owner':
        return <span className="text-slate-700 font-medium">{owner?.name || 'Unassigned'}</span>;
      case 'phone':
        return <span className="text-slate-600 font-mono text-[11px]">{company.phone || '—'}</span>;
      case 'email':
        return <span className="text-slate-600 text-[11px] truncate">{company.email || '—'}</span>;
      case 'city':
        return <span className="text-slate-600">{company.city || company.address || company.billingAddress || '—'}</span>;
      case 'employees':
        return <span className="text-slate-700 font-medium">{company.employeeCount ? company.employeeCount.toLocaleString() : '—'}</span>;
      case 'annualRevenue':
        return (
          <span className="text-emerald-700 font-semibold font-mono text-[11px]">
            {company.annualRevenue ? `$${(company.annualRevenue / 1000000).toFixed(1)}M` : '—'}
          </span>
        );
      case 'website':
        return (
          <span className="text-indigo-600 truncate text-[11px]">
            {company.website || '—'}
          </span>
        );
      case 'createdAt':
        return (
          <span className="text-slate-400 text-[11px]">
            {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}
          </span>
        );
      default:
        return <span className="text-slate-500">—</span>;
    }
  };

  return (
    <div id="companies-view" className="p-4 md:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Companies</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {filteredCompanies.length} records
            </span>
            {activeView && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                View: {activeView.title}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accounts and client organisations. Create personalized views and perform extended multi-field search.
          </p>
        </div>

        {/* Primary Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Extended Search Toggle Button (FR-2 requirement) */}
          <button
            id="extended-search-toggle-btn"
            onClick={() => setIsExtendedSearchOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
              isExtendedSearchOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50/70 hover:border-indigo-300'
            }`}
          >
            <Sliders size={14} />
            <span>{isExtendedSearchOpen ? 'Hide Extended Search' : 'Extended Search'}</span>
          </button>

          {/* Create Custom View Button (FR-1 requirement) */}
          <button
            id="create-custom-view-btn"
            onClick={() => openCreateCustomView('company', extendedFilters)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Layers size={14} className="text-indigo-600" />
            <span>+ Create Custom View</span>
          </button>

          {/* Quick Create Company Button */}
          <button
            id="create-company-btn"
            onClick={() => openQuickCreate('company')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Default Company Notice */}
      {defaultCompany && (
        <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={16} className="text-indigo-600 shrink-0" />
            <span>
              <strong>Default Company:</strong>{' '}
              <span
                className="underline font-semibold cursor-pointer"
                onClick={() => openRecordDetail('company', defaultCompany.id)}
              >
                {defaultCompany.name}
              </span>
              . New contacts, deals, tasks, and cases will automatically pre-fill this company.
            </span>
          </div>
          <button
            onClick={() => setDefaultCompanyId(null)}
            className="text-[11px] text-indigo-700 hover:text-indigo-900 font-medium ml-4 underline"
          >
            Clear Default
          </button>
        </div>
      )}

      {/* Extended Search Collapsible Panel (FR-2 & FR-3) */}
      <ExtendedSearchPanel
        module="company"
        activeView={activeView}
        onSelectView={handleSelectView}
        filters={extendedFilters}
        onApplyFilters={(filters) => {
          setExtendedFilters(filters);
        }}
        onResetFilters={handleResetAllFilters}
        isOpen={isExtendedSearchOpen}
        onClose={() => setIsExtendedSearchOpen(false)}
      />

      {/* Control Toolbar: Quick Search + Select Custom View Dropdown + Manage Views */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        {/* Left Controls: Search & Custom View Selector */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies by name, website..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Select View: [ Active Companies ▼ ] (FR-7 UI requirement) */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 hidden sm:inline">Select View:</span>
            <select
              id="companies-view-dropdown"
              value={activeView?.id || ''}
              onChange={(e) => {
                const found = availableViews.find((v) => v.id === e.target.value);
                if (found) handleSelectView(found);
              }}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-semibold text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden"
            >
              {availableViews.map((v) => {
                const isDefault = userDefaultViews[currentUser.id]?.[v.module] === v.id;
                return (
                  <option key={v.id} value={v.id}>
                    {v.title} {isDefault ? '★' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Right Controls: Manage Views Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openManageViews('company')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
          >
            <Layers size={13} />
            <span>Manage Views</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges / Chips (FR-7 UI requirement) */}
      <ActiveFilterChips
        activeView={activeView}
        filters={extendedFilters}
        searchQuery={quickSearch}
        onClearFilter={handleClearFilter}
        onResetAll={handleResetAllFilters}
        totalRecordsCount={filteredCompanies.length}
      />

      {/* Dynamic Results Table (Displays ONLY the selected fields/columns) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                {/* Fixed Shortlist column on the far left */}
                <th className="w-10 px-3 py-3 text-center" title="Shortlist">
                  <span className="sr-only">Shortlist</span>
                  <Flag size={12} className="mx-auto text-slate-400" />
                </th>

                {/* Dynamically Rendered Columns based on custom view */}
                {displayColumnKeys.map((colKey) => {
                  const colDef = columnDefMap.get(colKey);
                  return (
                    <th key={colKey} className="px-4 py-3 whitespace-nowrap">
                      {colDef?.label || colKey}
                    </th>
                  );
                })}

                {/* Fixed Actions column on the far right */}
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayColumnKeys.length + 2}
                    className="text-center py-12 text-slate-400 space-y-2"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Search size={16} />
                    </div>
                    <p className="font-semibold text-slate-600">No matching companies found</p>
                    <p className="text-[11px] text-slate-400">
                      Try loosening your Extended Search conditions or clear the filters.
                    </p>
                    <button
                      onClick={handleResetAllFilters}
                      className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const isShortlisted = isItemShortlisted('company', c.id);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Shortlist Flag */}
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist({
                            type: 'company',
                            category: 'company',
                            id: c.id,
                            title: c.name,
                            subtitle: `${c.industry || 'Company'} · ${c.priority || 'Normal'} Priority`,
                            referenceInfo: c.annualRevenue
                              ? `$${(c.annualRevenue / 1000000).toFixed(1)}M Rev`
                              : c.industry,
                          });
                        }}
                      >
                        <button
                          id={`shortlist-btn-company-${c.id}`}
                          className={`p-1 rounded transition-colors ${
                            isShortlisted
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-amber-500'
                          }`}
                          title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                          aria-label={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                        >
                          <Flag
                            size={14}
                            className={isShortlisted ? 'text-amber-400 fill-amber-400' : ''}
                          />
                        </button>
                      </td>

                      {/* Dynamic Cells */}
                      {displayColumnKeys.map((colKey) => (
                        <td
                          key={colKey}
                          className="px-4 py-3 whitespace-nowrap"
                          onClick={() => openRecordDetail('company', c.id)}
                        >
                          {renderCellContent(c, colKey)}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.isDefault ? (
                            <button
                              onClick={() => setDefaultCompanyId(null)}
                              className="px-2 py-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-rose-50 hover:text-rose-700 rounded font-semibold transition-colors"
                              title="Clear Default Company"
                            >
                              Clear Default
                            </button>
                          ) : (
                            <button
                              onClick={() => setDefaultCompanyId(c.id)}
                              className="px-2 py-1 text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded"
                              title="Set as Default Company (pre-fills on new records)"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            onClick={() => openRecordDetail('company', c.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Open full company record"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Archive ${c.name}?`)) {
                                deleteCompany(c.id);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Company"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
