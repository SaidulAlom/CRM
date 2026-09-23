import React, { useState, useMemo, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  Search,
  Sliders,
  DollarSign,
  Calendar,
  Building2,
  Users,
  Star,
  Flag,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Deal, SavedCustomView, CustomViewFilters } from '../../types';
import { matchesDealFilters, MODULE_COLUMNS, ColumnDefinition } from '../../utils/customViewUtils';
import { ExtendedSearchPanel } from './customViews/ExtendedSearchPanel';
import { ActiveFilterChips } from './customViews/ActiveFilterChips';

export const DealsView: React.FC = () => {
  const {
    deals,
    companies,
    contacts,
    users,
    fieldSets,
    moveDealStage,
    updateDeal,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
    getViewsForModule,
    getDefaultViewForModule,
    userDefaultViews,
    currentUser,
    openCreateCustomView,
    openManageViews,
  } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [quickSearch, setQuickSearch] = useState('');
  const [activeView, setActiveView] = useState<SavedCustomView | null>(null);
  const [extendedFilters, setExtendedFilters] = useState<CustomViewFilters>({});
  const [isExtendedSearchOpen, setIsExtendedSearchOpen] = useState(false);

  // Auto-load default custom view on initial mount or when user changes
  useEffect(() => {
    const defaultView = getDefaultViewForModule('deal');
    if (defaultView && !activeView) {
      setActiveView(defaultView);
      setExtendedFilters(defaultView.filters || {});
    }
  }, [currentUser.id, getDefaultViewForModule]);

  const availableViews = useMemo(() => {
    return getViewsForModule('deal');
  }, [getViewsForModule]);

  const handleSelectView = (view: SavedCustomView) => {
    setActiveView(view);
    setExtendedFilters(view.filters || {});
  };

  const filteredDeals = useMemo(() => {
    return deals
      .filter((d) => !d.deletedAt)
      .filter((d) => {
        if (!quickSearch.trim()) return true;
        const s = quickSearch.toLowerCase();
        return (
          d.title.toLowerCase().includes(s) ||
          d.product?.toLowerCase().includes(s) ||
          d.description?.toLowerCase().includes(s)
        );
      })
      .filter((d) => matchesDealFilters(d, extendedFilters, companies, users));
  }, [deals, quickSearch, extendedFilters, companies, users]);

  // Stage Rollups
  const stageStats = useMemo(() => {
    const stats: Record<string, { count: number; totalValue: number }> = {};
    fieldSets.dealStages.forEach((stage) => {
      stats[stage.id] = { count: 0, totalValue: 0 };
    });

    filteredDeals.forEach((d) => {
      if (stats[d.stage]) {
        stats[d.stage].count += 1;
        stats[d.stage].totalValue += d.value;
      }
    });

    return stats;
  }, [fieldSets.dealStages, filteredDeals]);

  const totalPipelineValue = useMemo(() => {
    return filteredDeals
      .filter((d) => d.status === 'open')
      .reduce((sum, d) => sum + d.value, 0);
  }, [filteredDeals]);

  // Columns for table view
  const displayColumnKeys = useMemo(() => {
    if (activeView && activeView.columns && activeView.columns.length > 0) {
      return activeView.columns;
    }
    const cols = MODULE_COLUMNS.deal || [];
    return cols.filter((c) => c.defaultSelected).map((c) => c.key);
  }, [activeView]);

  const allDealColumns = MODULE_COLUMNS.deal || [];
  const columnDefMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition>();
    allDealColumns.forEach((c) => map.set(c.key, c));
    return map;
  }, [allDealColumns]);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      moveDealStage(dealId, targetStageId);
    }
  };

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

  const renderCellContent = (deal: Deal, colKey: string) => {
    const company = companies.find((c) => c.id === deal.companyId);
    const contact = contacts.find((ct) => ct.id === deal.contactId);
    const owner = users.find((u) => u.id === deal.ownerId);
    const stageObj = fieldSets.dealStages.find((s) => s.id === deal.stage);

    switch (colKey) {
      case 'title':
        return (
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
              {deal.title}
            </div>
            {deal.product && (
              <div className="text-[11px] font-normal text-slate-400">{deal.product}</div>
            )}
          </div>
        );
      case 'company':
        return company ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              openRecordDetail('company', company.id);
            }}
            className="text-indigo-600 hover:underline cursor-pointer font-medium"
          >
            {company.name}
          </span>
        ) : (
          <span className="text-slate-400 italic">None</span>
        );
      case 'contact':
        return contact ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              openRecordDetail('contact', contact.id);
            }}
            className="text-slate-700 hover:underline cursor-pointer"
          >
            {contact.firstName} {contact.lastName}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        );
      case 'value':
        return (
          <span className="font-bold text-slate-900 font-mono">
            ${deal.value.toLocaleString()}
          </span>
        );
      case 'stage':
        return (
          <select
            value={deal.stage}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => moveDealStage(deal.id, e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-800"
          >
            {fieldSets.dealStages.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        );
      case 'status':
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              deal.status === 'won'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : deal.status === 'lost'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {deal.status}
          </span>
        );
      case 'expectedCloseDate':
        return <span className="text-slate-600">{deal.expectedCloseDate || '—'}</span>;
      case 'owner':
        return <span className="text-slate-700 font-medium">{owner?.name || 'Unassigned'}</span>;
      case 'product':
        return <span className="text-slate-700">{deal.product || '—'}</span>;
      case 'probability':
        return <span className="text-slate-600 font-medium">{stageObj?.probability || 0}%</span>;
      case 'createdAt':
        return (
          <span className="text-slate-400 text-[11px]">
            {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—'}
          </span>
        );
      default:
        return <span className="text-slate-500">—</span>;
    }
  };

  return (
    <div id="deals-view" className="p-4 md:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deals & Opportunities</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ${totalPipelineValue.toLocaleString()} Open Pipeline
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {filteredDeals.length} deals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track sales pipeline opportunities across qualification stages. Customize view columns or apply extended search criteria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid size={14} />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List"
            >
              <List size={14} />
              <span>Table</span>
            </button>
          </div>

          {/* Extended Search Toggle */}
          <button
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

          {/* Create Custom View */}
          <button
            onClick={() => openCreateCustomView('deal', extendedFilters)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Layers size={14} className="text-indigo-600" />
            <span>+ Create Custom View</span>
          </button>

          {/* Add Deal */}
          <button
            id="create-deal-btn"
            onClick={() => openQuickCreate('deal')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Extended Search Collapsible Panel */}
      <ExtendedSearchPanel
        module="deal"
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

      {/* Control Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search deals by title or product..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Select View Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 hidden sm:inline">Select View:</span>
            <select
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

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openManageViews('deal')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
          >
            <Layers size={13} />
            <span>Manage Views</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterChips
        activeView={activeView}
        filters={extendedFilters}
        searchQuery={quickSearch}
        onClearFilter={handleClearFilter}
        onResetAll={handleResetAllFilters}
        totalRecordsCount={filteredDeals.length}
      />

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
          {fieldSets.dealStages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stats = stageStats[stage.id] || { count: 0, totalValue: 0 };

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-72 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[75vh]"
              >
                {/* Stage Header */}
                <div className="pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {stage.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 font-medium">
                    <span>${stats.totalValue.toLocaleString()}</span>
                    <span>{stage.probability}% win prob.</span>
                  </div>
                </div>

                {/* Deal Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-[11px]">
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const company = companies.find((c) => c.id === deal.companyId);
                      const contact = contacts.find((ct) => ct.id === deal.contactId);
                      const owner = users.find((u) => u.id === deal.ownerId);
                      const isPinned = isItemShortlisted('deal', deal.id);

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              onClick={() => deal.companyId && openRecordDetail('company', deal.companyId)}
                              className="font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer line-clamp-1"
                            >
                              {deal.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleShortlist({
                                  type: 'deal',
                                  category: 'deal',
                                  id: deal.id,
                                  title: deal.title,
                                  subtitle: `$${deal.value.toLocaleString()} · ${stage.name}`,
                                  referenceInfo: company?.name || stage.name,
                                });
                              }}
                              className={`p-0.5 rounded transition-colors ${
                                isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                              }`}
                            >
                              <Flag size={13} className={isPinned ? 'fill-amber-400' : ''} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                            <span>${deal.value.toLocaleString()}</span>
                            {deal.product && (
                              <span className="text-[10px] font-normal px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {deal.product}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            {company && (
                              <div className="flex items-center gap-1 truncate">
                                <Building2 size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate">{company.name}</span>
                              </div>
                            )}
                            {contact && (
                              <div className="flex items-center gap-1 truncate">
                                <Users size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {contact.firstName} {contact.lastName}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>{deal.expectedCloseDate}</span>
                            <span className="font-medium text-slate-600">
                              {owner?.name.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View with Dynamic Custom View Columns */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="w-10 px-3 py-3 text-center" title="Shortlist">
                    <span className="sr-only">Shortlist</span>
                    <Flag size={12} className="mx-auto text-slate-400" />
                  </th>

                  {displayColumnKeys.map((colKey) => {
                    const colDef = columnDefMap.get(colKey);
                    return (
                      <th key={colKey} className="px-4 py-3 whitespace-nowrap">
                        {colDef?.label || colKey}
                      </th>
                    );
                  })}

                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={displayColumnKeys.length + 2}
                      className="text-center py-12 text-slate-400"
                    >
                      No matching deals found.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const isShortlisted = isItemShortlisted('deal', deal.id);
                    const company = companies.find((c) => c.id === deal.companyId);
                    const stageObj = fieldSets.dealStages.find((s) => s.id === deal.stage);

                    return (
                      <tr
                        key={deal.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => deal.companyId && openRecordDetail('company', deal.companyId)}
                      >
                        <td
                          className="px-3 py-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist({
                              type: 'deal',
                              category: 'deal',
                              id: deal.id,
                              title: deal.title,
                              subtitle: `$${deal.value.toLocaleString()} · ${stageObj?.name || 'Open'}`,
                              referenceInfo: company?.name || `${stageObj?.name || 'Deal'}`,
                            });
                          }}
                        >
                          <button
                            id={`shortlist-btn-deal-table-${deal.id}`}
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

                        {displayColumnKeys.map((colKey) => (
                          <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                            {renderCellContent(deal, colKey)}
                          </td>
                        ))}

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deal.status === 'open' && (
                              <>
                                <button
                                  onClick={() =>
                                    updateDeal(deal.id, { status: 'won' }, 'Marked as Won')
                                  }
                                  className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold transition-colors"
                                >
                                  Won
                                </button>
                                <button
                                  onClick={() =>
                                    updateDeal(deal.id, { status: 'lost' }, 'Marked as Lost')
                                  }
                                  className="px-2 py-1 text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold transition-colors"
                                >
                                  Lost
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deal.companyId && openRecordDetail('company', deal.companyId)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="View Company Details"
                            >
                              <ExternalLink size={14} />
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
      )}
    </div>
  );
};
