import React, { useState, useMemo, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Contact, SavedCustomView, CustomViewFilters } from '../../types';
import { matchesContactFilters, MODULE_COLUMNS, ColumnDefinition } from '../../utils/customViewUtils';
import { ExtendedSearchPanel } from './customViews/ExtendedSearchPanel';
import { ActiveFilterChips } from './customViews/ActiveFilterChips';
import {
  Users,
  Plus,
  Search,
  Sliders,
  Flag,
  ExternalLink,
  TrendingUp,
  Mail,
  Building2,
  Trash2,
  Layers,
  X,
  UploadCloud,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    companies,
    campaigns,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
    deleteContact,
    convertContactToDeal,
    updateContact,
    users,
    getViewsForModule,
    getDefaultViewForModule,
    userDefaultViews,
    currentUser,
    openCreateCustomView,
    openManageViews,
    setActiveNav,
  } = useCRM();

  // Custom View & Extended Search State
  const [activeView, setActiveView] = useState<SavedCustomView | null>(null);
  const [extendedFilters, setExtendedFilters] = useState<CustomViewFilters>({});
  const [isExtendedSearchOpen, setIsExtendedSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [assignCampaignModalContact, setAssignCampaignModalContact] = useState<string | null>(null);

  // Auto-load default custom view on initial mount or when user changes
  useEffect(() => {
    const defaultView = getDefaultViewForModule('contact');
    if (defaultView && !activeView) {
      setActiveView(defaultView);
      setExtendedFilters(defaultView.filters || {});
    }
  }, [currentUser.id, getDefaultViewForModule]);

  const availableViews = useMemo(() => {
    return getViewsForModule('contact');
  }, [getViewsForModule]);

  const handleSelectView = (view: SavedCustomView) => {
    setActiveView(view);
    setExtendedFilters(view.filters || {});
  };

  const handleAssignToCampaign = (contactId: string) => {
    if (!selectedCampaignId) return;
    const ct = contacts.find((c) => c.id === contactId);
    if (ct) {
      const current = ct.campaignIds || [];
      if (!current.includes(selectedCampaignId)) {
        updateContact(contactId, { campaignIds: [...current, selectedCampaignId] });
      }
    }
    setAssignCampaignModalContact(null);
    alert('Contact added to email campaign successfully!');
  };

  // Filter contacts matching custom view + extended search + quick search
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => !c.deletedAt)
      .filter((c) => {
        if (!quickSearch.trim()) return true;
        const s = quickSearch.toLowerCase();
        const full = `${c.firstName} ${c.lastName}`.toLowerCase();
        return (
          full.includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.jobTitle?.toLowerCase().includes(s) ||
          c.phone?.includes(s) ||
          c.mobile?.includes(s) ||
          c.mailingAddress?.toLowerCase().includes(s)
        );
      })
      .filter((c) => matchesContactFilters(c, extendedFilters, companies, users));
  }, [contacts, quickSearch, extendedFilters, companies, users]);

  // Determine columns to display
  const displayColumnKeys = useMemo(() => {
    if (activeView && activeView.columns && activeView.columns.length > 0) {
      return activeView.columns;
    }
    const cols = MODULE_COLUMNS.contact || [];
    return cols.filter((c) => c.defaultSelected).map((c) => c.key);
  }, [activeView]);

  const allContactColumns = MODULE_COLUMNS.contact || [];
  const columnDefMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition>();
    allContactColumns.forEach((c) => map.set(c.key, c));
    return map;
  }, [allContactColumns]);

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

  const renderCellContent = (contact: Contact, colKey: string) => {
    const company = companies.find((cp) => cp.id === contact.companyId);
    const owner = users.find((u) => u.id === contact.ownerId);

    switch (colKey) {
      case 'name':
        return (
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
              {contact.firstName} {contact.lastName}
            </div>
            {contact.jobTitle && (
              <div className="text-[11px] font-normal text-slate-400 truncate">
                {contact.jobTitle}
              </div>
            )}
          </div>
        );
      case 'company':
        return company ? (
          <span
            className="text-indigo-600 hover:underline font-medium"
            onClick={(e) => {
              e.stopPropagation();
              openRecordDetail('company', company.id);
            }}
          >
            {company.name}
          </span>
        ) : (
          <span className="text-slate-400 italic">None</span>
        );
      case 'type':
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              contact.type === 'lead'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : contact.type === 'customer'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {contact.type}
          </span>
        );
      case 'jobTitle':
        return <span className="text-slate-700">{contact.jobTitle || '—'}</span>;
      case 'email':
        return <span className="text-slate-700 text-[11px]">{contact.email || '—'}</span>;
      case 'phone':
        return <span className="text-slate-600 font-mono text-[11px]">{contact.phone || contact.mobile || '—'}</span>;
      case 'city':
        return <span className="text-slate-600">{contact.mailingAddress || '—'}</span>;
      case 'owner':
        return <span className="text-slate-700 font-medium">{owner?.name || 'Unassigned'}</span>;
      case 'status':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
            {contact.type || 'Active'}
          </span>
        );
      case 'lifecycleStage':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 capitalize">
            {contact.type}
          </span>
        );
      case 'createdAt':
        return (
          <span className="text-slate-400 text-[11px]">
            {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '—'}
          </span>
        );
      default:
        return <span className="text-slate-500">—</span>;
    }
  };

  return (
    <div id="contacts-view" className="p-4 md:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contacts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {filteredContacts.length} people
            </span>
            {activeView && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                View: {activeView.title}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Individual contacts, leads, customers, and decision makers. Create custom views and execute extended multi-criteria searches.
          </p>
        </div>

        {/* Primary Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Extended Search Toggle Button */}
          <button
            id="contacts-extended-search-toggle-btn"
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

          {/* Create Custom View Button */}
          <button
            id="contacts-create-custom-view-btn"
            onClick={() => openCreateCustomView('contact', extendedFilters)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Layers size={14} className="text-indigo-600" />
            <span>+ Create Custom View</span>
          </button>

          {/* Import & Migrate Contacts Button */}
          <button
            id="contacts-import-migrate-btn"
            onClick={() => setActiveNav('import_export')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-indigo-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            title="Import contacts from Outlook, Palm, Act!, GoldMine, Salesforce, or CSV"
          >
            <UploadCloud size={14} className="text-indigo-600" />
            <span>Import & Migrate</span>
          </button>

          {/* Quick Create Contact */}
          <button
            id="create-contact-btn"
            onClick={() => openQuickCreate('contact')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Extended Search Collapsible Panel */}
      <ExtendedSearchPanel
        module="contact"
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
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts by name, email, job title..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Select View Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 hidden sm:inline">Select View:</span>
            <select
              id="contacts-view-dropdown"
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
            onClick={() => openManageViews('contact')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
          >
            <Layers size={13} />
            <span>Manage Views</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges / Chips */}
      <ActiveFilterChips
        activeView={activeView}
        filters={extendedFilters}
        searchQuery={quickSearch}
        onClearFilter={handleClearFilter}
        onResetAll={handleResetAllFilters}
        totalRecordsCount={filteredContacts.length}
      />

      {/* Dynamic Results Table */}
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
              {filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayColumnKeys.length + 2}
                    className="text-center py-12 text-slate-400 space-y-2"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Search size={16} />
                    </div>
                    <p className="font-semibold text-slate-600">No matching contacts found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting or resetting your Extended Search parameters.
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
                filteredContacts.map((c) => {
                  const isShortlisted = isItemShortlisted('contact', c.id);
                  const company = companies.find((cp) => cp.id === c.companyId);
                  const cat = c.type === 'lead' ? 'lead' : c.type === 'customer' ? 'customer' : 'contact';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Shortlist */}
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist({
                            type: 'contact',
                            category: cat,
                            id: c.id,
                            title: `${c.firstName} ${c.lastName}`,
                            subtitle: `${c.jobTitle || (c.type === 'lead' ? 'Lead' : 'Contact')} · ${
                              company?.name || 'Independent'
                            }`,
                            referenceInfo: company?.name || (c.type === 'lead' ? 'Lead' : 'Customer'),
                          });
                        }}
                      >
                        <button
                          id={`shortlist-btn-contact-${c.id}`}
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
                          onClick={() => openRecordDetail('contact', c.id)}
                        >
                          {renderCellContent(c, colKey)}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              convertContactToDeal(c.id, {
                                title: `${c.firstName} ${c.lastName} - Initial Pipeline Deal`,
                                value: 45000,
                                stage: 'lead',
                              });
                              alert(`Created new pipeline deal for ${c.firstName} ${c.lastName}!`);
                            }}
                            className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1 font-medium transition-colors"
                            title="Convert contact to pipeline deal"
                          >
                            <TrendingUp size={12} />
                            <span>Deal</span>
                          </button>

                          <button
                            onClick={() => setAssignCampaignModalContact(c.id)}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded hover:bg-slate-100"
                            title="Assign to Email Campaign"
                          >
                            <Mail size={14} />
                          </button>

                          <button
                            onClick={() => openRecordDetail('contact', c.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="View Contact Details"
                          >
                            <ExternalLink size={14} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete ${c.firstName} ${c.lastName}?`)) {
                                deleteContact(c.id);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Contact"
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

      {/* Assign Campaign Modal */}
      {assignCampaignModalContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add to Email Campaign</h3>
              <button
                onClick={() => setAssignCampaignModalContact(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-700 block">Select Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">-- Choose Campaign --</option>
                {campaigns.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.title} ({cp.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignCampaignModalContact(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={!selectedCampaignId}
                onClick={() => handleAssignToCampaign(assignCampaignModalContact)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
