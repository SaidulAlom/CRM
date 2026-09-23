import React, { useState, useEffect } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  CustomViewModule,
  CustomViewFilters,
  CustomViewNameMatchOperator,
  SavedCustomView,
} from '../../../types';
import { MODULE_COLUMNS, ColumnDefinition } from '../../../utils/customViewUtils';
import {
  X,
  Sliders,
  Columns,
  Filter,
  Check,
  Eye,
  Globe,
  Lock,
  Star,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const CustomViewModal: React.FC = () => {
  const {
    customViewModalOpen,
    customViewModalModule,
    customViewModalEditingView,
    customViewModalPrefilledFilters,
    closeCustomViewModal,
    addSavedView,
    updateSavedView,
    userDefaultViews,
    setDefaultViewForModule,
    currentUser,
    users,
    fieldSets,
  } = useCRM();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState<CustomViewModule>('company');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  // Filters
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

  // Load initial data when modal opens
  useEffect(() => {
    if (!customViewModalOpen) return;

    if (customViewModalEditingView) {
      // Edit mode
      const v = customViewModalEditingView;
      setTitle(v.title);
      setDescription(v.description || '');
      setModule(v.module);
      setSelectedColumns(v.columns || []);
      setIsShared(!!v.isShared);

      const f = v.filters || {};
      setNameOperator(f.nameOperator || 'contains');
      setNameQuery(f.nameQuery || '');
      setStatus(f.status || 'All');
      setPriority(f.priority || 'All');
      setIndustry(f.industry || 'All');
      setCity(f.city || '');
      setEmail(f.email || '');
      setPhone(f.phone || '');
      setOwnerId(f.ownerId || 'All');
      setDateRange(f.dateRange || 'all');
      setStage(f.stage || 'All');

      const isCurrentDefault = userDefaultViews[currentUser.id]?.[v.module] === v.id;
      setSetAsDefault(isCurrentDefault);
    } else {
      // Create mode
      const mod = customViewModalModule || 'company';
      setModule(mod);
      setTitle('');
      setDescription('');

      // Set default columns for this module
      const availableCols = MODULE_COLUMNS[mod] || [];
      const defaultCols = availableCols.filter((c) => c.defaultSelected).map((c) => c.key);
      setSelectedColumns(defaultCols);
      setIsShared(currentUser.role === 'admin');
      setSetAsDefault(false);

      // Apply prefilled filters if supplied from Extended Search
      const pf = customViewModalPrefilledFilters;
      setNameOperator(pf?.nameOperator || 'contains');
      setNameQuery(pf?.nameQuery || '');
      setStatus(pf?.status || 'All');
      setPriority(pf?.priority || 'All');
      setIndustry(pf?.industry || 'All');
      setCity(pf?.city || '');
      setEmail(pf?.email || '');
      setPhone(pf?.phone || '');
      setOwnerId(pf?.ownerId || 'All');
      setDateRange(pf?.dateRange || 'all');
      setStage(pf?.stage || 'All');
    }
  }, [
    customViewModalOpen,
    customViewModalEditingView,
    customViewModalModule,
    customViewModalPrefilledFilters,
    currentUser,
    userDefaultViews,
  ]);

  if (!customViewModalOpen) return null;

  const availableColumns = MODULE_COLUMNS[module] || [];

  const handleToggleColumn = (colKey: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(colKey)) {
        if (prev.length <= 1) return prev; // At least one column required
        return prev.filter((k) => k !== colKey);
      } else {
        return [...prev, colKey];
      }
    });
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(availableColumns.map((c) => c.key));
  };

  const handleResetColumns = () => {
    setSelectedColumns(availableColumns.filter((c) => c.defaultSelected).map((c) => c.key));
  };

  const handleModuleChange = (newModule: CustomViewModule) => {
    setModule(newModule);
    const newCols = (MODULE_COLUMNS[newModule] || []).filter((c) => c.defaultSelected).map((c) => c.key);
    setSelectedColumns(newCols);
    // Reset module-specific filter values
    setStatus('All');
    setPriority('All');
    setStage('All');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const filters: CustomViewFilters = {};
    if (nameQuery.trim()) {
      filters.nameQuery = nameQuery.trim();
      filters.nameOperator = nameOperator;
    }
    if (status !== 'All') filters.status = status;
    if (priority !== 'All') filters.priority = priority;
    if (industry !== 'All') filters.industry = industry;
    if (city.trim()) filters.city = city.trim();
    if (email.trim()) filters.email = email.trim();
    if (phone.trim()) filters.phone = phone.trim();
    if (ownerId !== 'All') filters.ownerId = ownerId;
    if (dateRange !== 'all') filters.dateRange = dateRange as any;
    if (stage !== 'All') filters.stage = stage;

    let savedId = '';
    if (customViewModalEditingView) {
      updateSavedView(customViewModalEditingView.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        module,
        entity: module === 'company' ? 'company' : 'contact',
        columns: selectedColumns,
        filters,
        isShared,
      });
      savedId = customViewModalEditingView.id;
    } else {
      const created = addSavedView({
        title: title.trim(),
        description: description.trim() || undefined,
        module,
        entity: module === 'company' ? 'company' : 'contact',
        columns: selectedColumns,
        filters,
        userId: currentUser.id,
        userName: currentUser.name,
        isShared,
        isSystem: false,
      });
      savedId = created.id;
    }

    if (setAsDefault && savedId) {
      setDefaultViewForModule(module, savedId);
    } else if (!setAsDefault && customViewModalEditingView) {
      if (userDefaultViews[currentUser.id]?.[module] === customViewModalEditingView.id) {
        setDefaultViewForModule(module, null);
      }
    }

    closeCustomViewModal();
  };

  return (
    <div
      id="custom-view-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {customViewModalEditingView ? 'Edit Custom View' : 'Create Custom View'}
              </h2>
              <p className="text-xs text-slate-500">
                Personalize displayed columns and save extended filter conditions for instant access
              </p>
            </div>
          </div>
          <button
            onClick={closeCustomViewModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Basic View Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>View Title / Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Active Companies, High Priority West Coast, Inbound Tech Leads"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Module</label>
              <select
                value={module}
                onChange={(e) => handleModuleChange(e.target.value as CustomViewModule)}
                disabled={!!customViewModalEditingView}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="company">Companies</option>
                <option value="contact">Contacts</option>
                <option value="lead">Leads</option>
                <option value="customer">Customers</option>
                <option value="deal">Deals</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Filter for active clients with over 50 employees or critical priority"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Section 2: Select Fields / Columns */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Columns size={15} className="text-indigo-600" />
                <span className="font-bold text-slate-800 text-xs">Select Fields / Columns to Display</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                  {selectedColumns.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={handleResetColumns}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={11} />
                  Reset Defaults
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Pick the specific columns you want visible in the table. Selected columns will display left-to-right.
            </p>

            {/* Column Pickers Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              {availableColumns.map((col) => {
                const isSelected = selectedColumns.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => handleToggleColumn(col.key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <span className="truncate mr-1">{col.label}</span>
                    {isSelected && <Check size={13} className="shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Extended Search & Filter Conditions */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-indigo-600" />
              <span className="font-bold text-slate-800 text-xs">Search / Filter Conditions</span>
              <span className="text-slate-400 font-normal">(Optional conditions saved with this view)</span>
            </div>

            {/* Name matching parameter */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <label className="font-semibold text-slate-800 block text-xs">
                Name Matching Parameter ({module === 'company' ? 'Company Name' : module === 'deal' ? 'Deal Title' : 'Contact Name'})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={nameOperator}
                  onChange={(e) => setNameOperator(e.target.value as CustomViewNameMatchOperator)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="contains">Contains</option>
                  <option value="is">Is (Exact match)</option>
                  <option value="is_not">Is not</option>
                  <option value="starts_with">Starts with</option>
                  <option value="ends_with">Ends with</option>
                  <option value="does_not_contain">Does not contain</option>
                </select>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder={`e.g. ${module === 'company' ? 'Tech, Scale, Solutions...' : 'Marcus, Alex, Dr...'}`}
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Additional Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Status / Priority Filter */}
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
                    <option value="open">Open Pipeline</option>
                    <option value="won">Closed Won</option>
                    <option value="lost">Closed Lost</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Type / Status</label>
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

              {/* Assigned User / Owner */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assigned User (Owner)</label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
                >
                  <option value="All">All Users / Anyone</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, Boston..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Email Filter */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Contains</label>
                <input
                  type="text"
                  placeholder="e.g. @domain.com or keyword"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Phone Filter */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 555 or area code"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Created Date Range */}
              <div className="space-y-1 sm:col-span-2 md:col-span-3">
                <label className="font-semibold text-slate-700">Created Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden"
                >
                  <option value="all">All Time (No date restriction)</option>
                  <option value="today">Created Today</option>
                  <option value="7days">Created in the Last 7 Days</option>
                  <option value="30days">Created in the Last 30 Days</option>
                  <option value="90days">Created in the Last 90 Days</option>
                  <option value="this_year">Created This Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Visibility & Default Options */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-indigo-600" />
                  <span>Share view with entire team</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                />
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>Set as my default view for {module === 'company' ? 'Companies' : module === 'contact' ? 'Contacts' : module}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={closeCustomViewModal}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || selectedColumns.length === 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{customViewModalEditingView ? 'Save View Changes' : 'Save View'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
