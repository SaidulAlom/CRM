import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Flag,
  X,
  Building2,
  Users,
  Target,
  UserCheck,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  Search,
  ChevronRight,
  ExternalLink,
  Trash2,
  ChevronDown,
  Check,
  CheckSquare2,
  Square,
  AlertCircle,
  Download,
} from 'lucide-react';
import { ShortlistCategory } from '../../types';
import { ShortlistActionModals } from '../common/ShortlistActionModals';

export const ShortlistSidebar: React.FC = () => {
  const {
    isShortlistOpen,
    setIsShortlistOpen,
    shortlist,
    toggleShortlist,
    removeFromShortlist,
    openRecordDetail,
    setActiveNav,
    currentUser,
    savedShortlists,
    activeSavedShortlistId,
  } = useCRM();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownValue, setDropdownValue] = useState<string>('select_action');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Counts by category
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: shortlist.length,
      company: 0,
      contact: 0,
      lead: 0,
      customer: 0,
      deal: 0,
      task: 0,
      case: 0,
    };
    shortlist.forEach((item) => {
      const cat = item.category || item.type;
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [shortlist]);

  // Filtered list
  const filteredShortlist = useMemo(() => {
    return shortlist.filter((item) => {
      const cat = item.category || item.type;
      const matchesCat =
        selectedCategory === 'all' ||
        cat === selectedCategory ||
        (selectedCategory === 'contact' && (cat === 'lead' || cat === 'customer' || cat === 'contact'));

      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.referenceInfo && item.referenceInfo.toLowerCase().includes(q))
      );
    });
  }, [shortlist, selectedCategory, searchQuery]);

  const activeSavedShortlist = useMemo(() => {
    return savedShortlists.find((sl) => sl.id === activeSavedShortlistId);
  }, [savedShortlists, activeSavedShortlistId]);

  if (!isShortlistOpen) return null;

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  const handleExportCSV = () => {
    if (shortlist.length === 0) {
      showNotification('Shortlist is empty. Nothing to export.');
      return;
    }
    const headers = ['Record ID', 'Type', 'Category', 'Title', 'Subtitle', 'Reference Info', 'Added Date'];
    const rows = shortlist.map((item) => [
      `"${item.id}"`,
      `"${item.type}"`,
      `"${item.category || item.type}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.subtitle || '').replace(/"/g, '""')}"`,
      `"${(item.referenceInfo || '').replace(/"/g, '""')}"`,
      `"${item.addedAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shortlist-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${shortlist.length} records to CSV successfully.`);
  };

  const handleActionSelect = (action: string) => {
    setDropdownValue('select_action');

    switch (action) {
      case 'save':
        setActiveModal('save');
        break;
      case 'load':
        setActiveModal('load');
        break;
      case 'delete_shortlist':
        setActiveModal('delete_shortlist');
        break;
      case 'clear_shortlist':
        setActiveModal('clear_shortlist');
        break;
      case 'remove_from_list':
        if (selectedIds.length > 0) {
          // Remove selected items immediately
          let removedCount = 0;
          selectedIds.forEach((compoundId) => {
            const [type, id] = compoundId.split(':');
            if (type && id) {
              removeFromShortlist(type, id);
              removedCount++;
            }
          });
          setSelectedIds([]);
          setIsSelectionMode(false);
          showNotification(`Removed ${removedCount} item(s) from shortlist`);
        } else {
          setIsSelectionMode(true);
          showNotification('Select items using checkboxes below, then click "Remove Selected"');
        }
        break;
      case 'update_fields':
        setActiveModal('update_fields');
        break;
      case 'export':
        handleExportCSV();
        break;
      case 'campaign_subscribe':
        setActiveModal('campaign_subscribe');
        break;
      case 'change_ownership':
        setActiveModal('change_ownership');
        break;
      case 'shortlist_owner':
        setActiveModal('shortlist_owner');
        break;
      case 'delete_records':
        setActiveModal('delete_records');
        break;
      default:
        break;
    }
  };

  const handleToggleSelectCard = (compoundId: string) => {
    setSelectedIds((prev) =>
      prev.includes(compoundId) ? prev.filter((id) => id !== compoundId) : [...prev, compoundId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredShortlist.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShortlist.map((it) => `${it.type}:${it.id}`));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((compoundId) => {
      const [type, id] = compoundId.split(':');
      if (type && id) {
        removeFromShortlist(type, id);
      }
    });
    showNotification(`Removed ${selectedIds.length} item(s) from shortlist`);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const getCategoryBadge = (item: { type: string; category?: ShortlistCategory }) => {
    const cat = item.category || item.type;
    switch (cat) {
      case 'company':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 size={10} />
            Company
          </span>
        );
      case 'lead':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Target size={10} />
            Lead
          </span>
        );
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck size={10} />
            Customer
          </span>
        );
      case 'contact':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Users size={10} />
            Contact
          </span>
        );
      case 'deal':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Briefcase size={10} />
            Deal
          </span>
        );
      case 'task':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <CheckSquare size={10} />
            Task
          </span>
        );
      case 'case':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <LifeBuoy size={10} />
            Case
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            {item.type}
          </span>
        );
    }
  };

  const handleItemClick = (item: { type: string; id: string; category?: ShortlistCategory }) => {
    if (item.type === 'company') {
      openRecordDetail('company', item.id);
      setActiveNav('companies');
    } else if (item.type === 'contact') {
      openRecordDetail('contact', item.id);
      setActiveNav('contacts');
    } else if (item.type === 'deal') {
      setActiveNav('deals');
    } else if (item.type === 'task') {
      setActiveNav('tasks');
    } else if (item.type === 'case') {
      setActiveNav('cases');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 md:hidden"
        onClick={() => setIsShortlistOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="shortlist-panel"
        aria-label="Shortlist Navigation Panel"
        className="fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full shadow-xl md:shadow-none transition-all duration-200 ease-in-out"
      >
        {/* Panel Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-500 shadow-2xs">
                <Flag size={15} className="fill-amber-400 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 tracking-tight leading-none">
                  Shortlist
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {shortlist.length} {shortlist.length === 1 ? 'record' : 'records'}
                  </span>
                  {activeSavedShortlist && (
                    <span
                      className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold truncate max-w-[130px]"
                      title={activeSavedShortlist.name}
                    >
                      • {activeSavedShortlist.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              id="close-shortlist-panel-btn"
              onClick={() => setIsShortlistOpen(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
              title="Hide Shortlist panel"
              aria-label="Hide Shortlist"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Dropdown requested by user */}
          <div className="relative mt-2">
            <label htmlFor="shortlist-actions-select" className="sr-only">
              Shortlist Actions
            </label>
            <select
              id="shortlist-actions-select"
              value={dropdownValue}
              onChange={(e) => handleActionSelect(e.target.value)}
              className="w-full bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 rounded px-2.5 py-1.5 text-xs font-semibold shadow-2xs focus:outline-none cursor-pointer appearance-none pr-8 transition-colors"
            >
              <option value="select_action">Select action</option>
              <option value="save">Save</option>
              <option value="load">Load</option>
              <option value="delete_shortlist">Delete Shortlist</option>
              <option value="clear_shortlist">Clear Shortlist</option>
              <option value="remove_from_list">Remove from list</option>
              <option value="update_fields">Update Fields</option>
              <option value="export">Export</option>
              <option value="campaign_subscribe">Campaign Subscribe</option>
              <option value="change_ownership">Change Ownership</option>
              <option value="shortlist_owner">Shortlist Owner</option>
              <option value="delete_records">Delete Records</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <ChevronDown size={14} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Feedback notification toast banner */}
        {feedbackMessage && (
          <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-indigo-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Check size={13} className="text-indigo-600 shrink-0" />
              <span className="truncate">{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="p-0.5 text-indigo-400 hover:text-indigo-700 ml-1 shrink-0"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Selection mode top bar (when Remove from list or bulk actions are active) */}
        {isSelectionMode && (
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={filteredShortlist.length > 0 && selectedIds.length === filteredShortlist.length}
                onChange={handleSelectAll}
                className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <span>
                All ({selectedIds.length}/{filteredShortlist.length})
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
              >
                Remove ({selectedIds.length})
              </button>
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="px-2 py-1 text-slate-600 hover:bg-amber-100 rounded text-[11px] font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Search inside Shortlist */}
        <div className="p-3 border-b border-slate-100 bg-white shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="shortlist-search-input"
              type="text"
              placeholder="Search shortlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({shortlist.length})
            </button>

            {counts.company > 0 && (
              <button
                onClick={() => setSelectedCategory('company')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'company'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 size={11} />
                Companies ({counts.company})
              </button>
            )}

            {(counts.contact > 0 || counts.lead > 0 || counts.customer > 0) && (
              <button
                onClick={() => setSelectedCategory('contact')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'contact'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users size={11} />
                Contacts ({counts.contact + counts.lead + counts.customer})
              </button>
            )}

            {counts.lead > 0 && (
              <button
                onClick={() => setSelectedCategory('lead')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'lead'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Target size={11} />
                Leads ({counts.lead})
              </button>
            )}

            {counts.customer > 0 && (
              <button
                onClick={() => setSelectedCategory('customer')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'customer'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserCheck size={11} />
                Customers ({counts.customer})
              </button>
            )}

            {counts.deal > 0 && (
              <button
                onClick={() => setSelectedCategory('deal')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'deal'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Briefcase size={11} />
                Deals ({counts.deal})
              </button>
            )}

            {counts.task > 0 && (
              <button
                onClick={() => setSelectedCategory('task')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'task'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckSquare size={11} />
                Tasks ({counts.task})
              </button>
            )}
          </div>
        </div>

        {/* Shortlist Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {shortlist.length === 0 ? (
            /* Explicit empty state required by spec */
            <div id="shortlist-empty-state" className="text-center py-12 px-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
                <Flag size={22} className="stroke-1.5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                No items in your shortlist.
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[220px] mx-auto leading-relaxed">
                Click the <Flag size={12} className="inline text-amber-500 fill-amber-400 mx-0.5" /> Flag icon on any company, contact, lead, customer, or deal to save it here for instant access.
              </p>
            </div>
          ) : filteredShortlist.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-400">
              <Search size={20} className="mx-auto mb-2 opacity-60" />
              <p className="text-xs font-medium text-slate-700">No matching items</p>
              <p className="text-[11px] text-slate-400 mt-1">
                No records matched your search or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2.5 text-xs text-indigo-600 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredShortlist.map((item) => {
              const compoundId = `${item.type}:${item.id}`;
              const isSelected = selectedIds.includes(compoundId);
              return (
                <div
                  key={compoundId}
                  id={`shortlist-card-${item.type}-${item.id}`}
                  className={`group relative bg-white rounded-lg border p-2.5 transition-all flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300'
                      : 'border-slate-200 hover:border-amber-300 hover:shadow-xs hover:bg-slate-50/50'
                  }`}
                >
                  {isSelectionMode && (
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectCard(compoundId)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        title="Select this item"
                        aria-label={`Select ${item.title}`}
                      />
                    </div>
                  )}

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (isSelectionMode) {
                        handleToggleSelectCard(compoundId);
                      } else {
                        handleItemClick(item);
                      }
                    }}
                    title={isSelectionMode ? 'Click to toggle selection' : 'Click to view details'}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {getCategoryBadge(item)}
                      {item.referenceInfo && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          • {item.referenceInfo}
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-xs text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </div>

                    {item.subtitle && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Right actions: Remove button & direct open link */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      id={`remove-shortlist-${item.type}-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromShortlist(item.type, item.id);
                        showNotification(`Removed "${item.title}" from shortlist`);
                      }}
                      className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Remove from Shortlist"
                      aria-label="Remove from Shortlist"
                    >
                      <Flag size={14} className="fill-amber-400 text-amber-500" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      className="p-1 rounded text-slate-300 group-hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Navigate to item details"
                      aria-label="Navigate to details"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/90 shrink-0 text-xs text-slate-500 flex items-center justify-between">
          <span className="truncate text-[11px]">
            Active User: <strong className="text-slate-700">{currentUser.name}</strong>
          </span>
          {shortlist.length > 0 && (
            <button
              onClick={() => setActiveModal('clear_shortlist')}
              className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 font-medium"
              title="Clear all shortlisted items"
            >
              <Trash2 size={11} />
              Clear
            </button>
          )}
        </div>
      </aside>

      {/* Modal overlays for all actions in the dropdown */}
      <ShortlistActionModals
        activeModal={activeModal}
        onClose={() => {
          setActiveModal(null);
          setDropdownValue('select_action');
        }}
        onActionComplete={(msg) => {
          showNotification(msg);
        }}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        setIsSelectionMode={setIsSelectionMode}
      />
    </>
  );
};
