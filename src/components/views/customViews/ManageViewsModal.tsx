import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { SavedCustomView, CustomViewModule } from '../../../types';
import {
  X,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Star,
  Globe,
  Lock,
  Columns,
  Check,
  Filter,
  AlertTriangle,
  Building2,
  Users,
  Briefcase,
  Layers,
} from 'lucide-react';

interface ManageViewsModalProps {
  onApplyView?: (view: SavedCustomView) => void;
}

export const ManageViewsModal: React.FC<ManageViewsModalProps> = ({ onApplyView }) => {
  const {
    manageViewsModalOpen,
    manageViewsModalModule,
    closeManageViews,
    savedViews,
    deleteSavedView,
    duplicateSavedView,
    updateSavedView,
    userDefaultViews,
    setDefaultViewForModule,
    openCreateCustomView,
    openEditCustomView,
    currentUser,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<CustomViewModule | 'all'>(
    manageViewsModalModule || 'all'
  );
  const [deleteConfirmView, setDeleteConfirmView] = useState<SavedCustomView | null>(null);
  const [renameViewId, setRenameViewId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  if (!manageViewsModalOpen) return null;

  // Filter views for display according to tab
  const displayViews = savedViews.filter((v) => {
    if (activeTab !== 'all') {
      const vMod = v.module.toLowerCase();
      const tMod = activeTab.toLowerCase();
      const matches =
        vMod === tMod ||
        (tMod === 'contact' && (vMod === 'lead' || vMod === 'customer')) ||
        (tMod === 'lead' && vMod === 'contact') ||
        (tMod === 'customer' && vMod === 'contact');
      if (!matches) return false;
    }

    // Role-based visibility:
    if (currentUser.role === 'admin') return true;
    if (v.isSystem || v.isShared) return true;
    return v.userId === currentUser.id;
  });

  const handleStartRename = (view: SavedCustomView) => {
    setRenameViewId(view.id);
    setRenameTitle(view.title);
  };

  const handleSaveRename = (id: string) => {
    if (renameTitle.trim()) {
      updateSavedView(id, { title: renameTitle.trim() });
    }
    setRenameViewId(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmView) {
      deleteSavedView(deleteConfirmView.id);
      setDeleteConfirmView(null);
    }
  };

  const handleToggleDefault = (view: SavedCustomView) => {
    const currentDefault = userDefaultViews[currentUser.id]?.[view.module];
    if (currentDefault === view.id) {
      setDefaultViewForModule(view.module, null);
    } else {
      setDefaultViewForModule(view.module, view.id);
    }
  };

  return (
    <div
      id="manage-views-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Custom Views</h2>
              <p className="text-xs text-slate-500">
                Create, customize, duplicate, and set defaults for your saved data presentations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeManageViews();
                const targetMod = activeTab === 'all' ? 'company' : activeTab;
                openCreateCustomView(targetMod);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Create New View</span>
            </button>
            <button
              onClick={closeManageViews}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-white text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Views ({savedViews.length})
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={13} />
            <span>Companies</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={13} />
            <span>Contacts & Leads</span>
          </button>
          <button
            onClick={() => setActiveTab('deal')}
            className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'deal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase size={13} />
            <span>Deals</span>
          </button>
        </div>

        {/* View List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {displayViews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Layers size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No custom views found in this category</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Create a personalized view to customize the columns and filter criteria displayed on your CRM screens.
              </p>
              <button
                onClick={() => {
                  closeManageViews();
                  const targetMod = activeTab === 'all' ? 'company' : activeTab;
                  openCreateCustomView(targetMod);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus size={13} />
                <span>Create View</span>
              </button>
            </div>
          ) : (
            displayViews.map((view) => {
              const isDefault = userDefaultViews[currentUser.id]?.[view.module] === view.id;
              const isOwner = view.userId === currentUser.id;
              const canEditOrDelete = !view.isSystem && (isOwner || currentUser.role === 'admin');

              return (
                <div
                  key={view.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {renameViewId === view.id ? (
                        <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                          <input
                            type="text"
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            className="px-2.5 py-1 border border-indigo-500 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden w-full"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(view.id);
                              if (e.key === 'Escape') setRenameViewId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveRename(view.id)}
                            className="p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setRenameViewId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">{view.title}</span>
                          {canEditOrDelete && (
                            <button
                              onClick={() => handleStartRename(view)}
                              title="Rename view"
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <Edit2 size={12} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Module Badge */}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {view.module}
                      </span>

                      {/* Scope Badge */}
                      {view.isSystem ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          System Standard
                        </span>
                      ) : view.isShared ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          <Globe size={10} />
                          Shared with Team
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <Lock size={10} />
                          Private to Me
                        </span>
                      )}

                      {/* Default View Badge */}
                      {isDefault && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          My Default
                        </span>
                      )}
                    </div>

                    {/* Columns Preview & Filter Summary */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Columns size={12} className="text-slate-400 shrink-0" />
                        <span>{view.columns.length} columns displayed</span>
                      </div>

                      {/* Filters count / tags */}
                      {view.filters && Object.keys(view.filters).length > 0 && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Filter size={12} className="text-indigo-500 shrink-0" />
                          <span>
                            {view.filters.nameQuery ? `Name matches "${view.filters.nameQuery}", ` : ''}
                            {view.filters.status ? `Status: ${view.filters.status}, ` : ''}
                            {view.filters.priority ? `Priority: ${view.filters.priority}, ` : ''}
                            {view.filters.industry ? `Industry: ${view.filters.industry}` : ''}
                          </span>
                        </div>
                      )}

                      <span className="text-slate-400">
                        Created by {view.userName || (view.isSystem ? 'System' : 'User')}
                      </span>
                    </div>

                    {view.description && (
                      <p className="text-[11px] text-slate-500 italic">{view.description}</p>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Apply View */}
                    {onApplyView && (
                      <button
                        onClick={() => {
                          onApplyView(view);
                          closeManageViews();
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Apply View
                      </button>
                    )}

                    {/* Set/Unset Default */}
                    <button
                      onClick={() => handleToggleDefault(view)}
                      title={isDefault ? 'Remove as default view' : 'Set as my default view for this module'}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isDefault
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:text-amber-600 hover:border-amber-300'
                      }`}
                    >
                      <Star size={14} className={isDefault ? 'fill-amber-500 text-amber-500' : ''} />
                    </button>

                    {/* Duplicate View */}
                    <button
                      onClick={() => duplicateSavedView(view.id)}
                      title="Duplicate this view"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Edit View */}
                    {canEditOrDelete && (
                      <button
                        onClick={() => {
                          closeManageViews();
                          openEditCustomView(view);
                        }}
                        title="Edit view settings and filters"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}

                    {/* Delete View */}
                    {canEditOrDelete && (
                      <button
                        onClick={() => setDeleteConfirmView(view)}
                        title="Delete this view"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total Views: <strong>{displayViews.length}</strong>
          </span>
          <button
            onClick={closeManageViews}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Confirmation Sub-Modal (Mandatory Requirement 5) */}
      {deleteConfirmView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Custom View</h3>
                <p className="text-xs text-slate-500">Permanent action confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the custom view{' '}
              <strong className="text-slate-900 font-semibold">"{deleteConfirmView.title}"</strong>?
              {deleteConfirmView.isShared && ' This view is shared and will also be removed for your team members.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmView(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Permanently Delete View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
