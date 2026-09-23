import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  X,
  Save,
  FolderOpen,
  Trash2,
  AlertTriangle,
  Mail,
  UserCheck,
  User,
  Edit3,
  Layers,
} from 'lucide-react';

interface ShortlistActionModalsProps {
  activeModal: string | null;
  onClose: () => void;
  onActionComplete?: (message: string) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  setIsSelectionMode: (mode: boolean) => void;
}

export const ShortlistActionModals: React.FC<ShortlistActionModalsProps> = ({
  activeModal,
  onClose,
  onActionComplete,
}) => {
  const {
    shortlist,
    clearShortlist,
    savedShortlists,
    activeSavedShortlistId,
    saveCurrentShortlist,
    loadSavedShortlist,
    deleteSavedShortlist,
    shortlistOwnerId,
    setShortlistOwnerId,
    users,
    currentUser,
    contacts,
    campaigns,
    updateCompany,
    updateContact,
    updateDeal,
    updateTask,
    updateCase,
    deleteCompany,
    deleteContact,
    deleteDeal,
    deleteTask,
    deleteCase,
  } = useCRM();

  // Modal 1: Save Shortlist state
  const [saveName, setSaveName] = useState('');
  const [saveOwnerId, setSaveOwnerId] = useState(shortlistOwnerId || currentUser.id);

  // Modal 2: Update Fields state
  const [targetField, setTargetField] = useState<'priority' | 'status' | 'rating'>('priority');
  const [fieldValue, setFieldValue] = useState('High');

  // Modal 3: Campaign Subscribe state
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [newCampaignName, setNewCampaignName] = useState('');

  // Modal 4: Change Ownership state
  const [newOwnerId, setNewOwnerId] = useState(users[0]?.id || '');

  // Modal 5: Shortlist Owner state
  const [newShortlistOwnerId, setNewShortlistOwnerId] = useState(shortlistOwnerId || currentUser.id);

  if (!activeModal) return null;

  // 1. SAVE SHORTLIST
  if (activeModal === 'save') {
    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      const saved = saveCurrentShortlist(saveName || `Shortlist (${shortlist.length} records)`, saveOwnerId);
      onClose();
      if (onActionComplete) {
        onActionComplete(`Shortlist saved as "${saved.name}" successfully!`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Save size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Save Shortlist</h3>
                <p className="text-xs text-slate-500">Save current {shortlist.length} item(s) as a reusable list</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shortlist Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Q4 Priority Accounts, High-Value Leads"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shortlist Owner</label>
              <select
                value={saveOwnerId}
                onChange={(e) => setSaveOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-600" />
                Contents ({shortlist.length} items):
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {shortlist.slice(0, 5).map((item) => (
                  <li key={`${item.type}-${item.id}`} className="truncate text-[11px] text-slate-700">
                    • <span className="font-medium capitalize">[{item.type}]</span> {item.title}
                  </li>
                ))}
                {shortlist.length > 5 && (
                  <li className="text-[11px] text-slate-400 italic">...and {shortlist.length - 5} more items</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save Shortlist
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. LOAD SHORTLIST
  if (activeModal === 'load') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <FolderOpen size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Load Shortlist</h3>
                <p className="text-xs text-slate-500">Choose a saved shortlist to populate your workspace</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            {savedShortlists.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No saved shortlists found. Use "Save" to save your current shortlist first.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {savedShortlists.map((sl) => {
                  const isActive = activeSavedShortlistId === sl.id;
                  return (
                    <div
                      key={sl.id}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{sl.name}</span>
                          {isActive && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>{sl.items.length} records</span>
                          <span>•</span>
                          <span>Owner: {sl.ownerName}</span>
                          <span>•</span>
                          <span>{new Date(sl.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          loadSavedShortlist(sl.id);
                          onClose();
                          if (onActionComplete) {
                            onActionComplete(`Loaded shortlist "${sl.name}" (${sl.items.length} records)`);
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shrink-0 shadow-xs"
                      >
                        Load
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. DELETE SHORTLIST
  if (activeModal === 'delete_shortlist') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Trash2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Shortlist</h3>
                <p className="text-xs text-slate-500">Remove a saved shortlist from your library</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            {savedShortlists.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No saved shortlists found.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedShortlists.map((sl) => (
                  <div
                    key={sl.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{sl.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {sl.items.length} items · Owner: {sl.ownerName}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        deleteSavedShortlist(sl.id);
                        if (onActionComplete) {
                          onActionComplete(`Deleted shortlist "${sl.name}"`);
                        }
                      }}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. CLEAR SHORTLIST
  if (activeModal === 'clear_shortlist') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Clear Current Shortlist?</h3>
            <p className="text-xs text-slate-600 mb-4">
              This will remove all <strong className="text-slate-900">{shortlist.length} records</strong> from your active shortlist.
              Your underlying CRM database records will not be deleted.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearShortlist();
                  onClose();
                  if (onActionComplete) {
                    onActionComplete('Cleared all items from shortlist');
                  }
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Clear Shortlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. UPDATE FIELDS
  if (activeModal === 'update_fields') {
    const handleApplyUpdates = (e: React.FormEvent) => {
      e.preventDefault();
      let updateCount = 0;

      shortlist.forEach((item) => {
        if (targetField === 'priority') {
          if (item.type === 'company') {
            updateCompany(item.id, { priority: fieldValue as any });
            updateCount++;
          } else if (item.type === 'case') {
            updateCase(item.id, { priority: fieldValue as any });
            updateCount++;
          }
        } else if (targetField === 'status') {
          if (item.type === 'deal') {
            updateDeal(item.id, { stage: fieldValue });
            updateCount++;
          } else if (item.type === 'task') {
            updateTask(item.id, { status: fieldValue as any });
            updateCount++;
          } else if (item.type === 'case') {
            updateCase(item.id, { status: fieldValue });
            updateCount++;
          } else if (item.type === 'contact') {
            updateContact(item.id, { type: fieldValue as any });
            updateCount++;
          }
        } else if (targetField === 'rating') {
          if (item.type === 'company') {
            updateCompany(item.id, { customFields: { rating: fieldValue } });
            updateCount++;
          } else if (item.type === 'contact') {
            updateContact(item.id, { customFields: { rating: fieldValue } });
            updateCount++;
          }
        }
      });

      onClose();
      if (onActionComplete) {
        onActionComplete(`Updated ${targetField} to "${fieldValue}" across ${updateCount} shortlisted record(s)`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Edit3 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Fields</h3>
                <p className="text-xs text-slate-500">Bulk update attributes across {shortlist.length} shortlisted items</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleApplyUpdates} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Field</label>
              <select
                value={targetField}
                onChange={(e) => {
                  const val = e.target.value as 'priority' | 'status' | 'rating';
                  setTargetField(val);
                  if (val === 'priority') setFieldValue('High');
                  if (val === 'status') setFieldValue('In Progress');
                  if (val === 'rating') setFieldValue('Hot');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="priority">Priority (Company, Case)</option>
                <option value="status">Status / Stage (Deal, Task, Case, Contact)</option>
                <option value="rating">Rating (Hot, Warm, Cold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Value</label>
              {targetField === 'priority' && (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              )}

              {targetField === 'status' && (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="lead">Lead (Contact Type)</option>
                  <option value="customer">Customer (Contact Type)</option>
                  <option value="In Progress">In Progress (Task / Case)</option>
                  <option value="Completed">Completed (Task / Case)</option>
                  <option value="Proposal Sent">Proposal Sent (Deal Stage)</option>
                  <option value="In Negotiation">In Negotiation (Deal Stage)</option>
                  <option value="Closed Won">Closed Won (Deal Stage)</option>
                </select>
              )}

              {targetField === 'rating' && (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Apply Updates
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 6. CAMPAIGN SUBSCRIBE
  if (activeModal === 'campaign_subscribe') {
    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      const targetCampaign = campaigns.find((c) => c.id === selectedCampaignId);
      const campaignName = targetCampaign ? targetCampaign.title : newCampaignName || 'Special Outreach Campaign';

      // Subscribe all shortlisted contacts
      let contactCount = 0;
      shortlist.forEach((item) => {
        if (item.type === 'contact') {
          const contact = contacts.find((c) => c.id === item.id);
          if (contact) {
            const currentCampaigns = contact.campaignIds || [];
            if (!currentCampaigns.includes(selectedCampaignId)) {
              updateContact(item.id, {
                campaignIds: [...currentCampaigns, selectedCampaignId],
              });
              contactCount++;
            }
          }
        }
      });

      onClose();
      if (onActionComplete) {
        onActionComplete(`Subscribed ${contactCount} shortlisted contact(s) to campaign "${campaignName}"`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Campaign Subscribe</h3>
                <p className="text-xs text-slate-500">Enroll shortlisted contacts into a marketing campaign</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubscribe} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Existing Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Status: {c.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 mb-1">Target Audience:</div>
              <p>
                All contacts currently in this shortlist will be subscribed to receive scheduled outreach touchpoints.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Subscribe Records
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 7. CHANGE OWNERSHIP
  if (activeModal === 'change_ownership') {
    const handleChangeOwnership = (e: React.FormEvent) => {
      e.preventDefault();
      const targetUser = users.find((u) => u.id === newOwnerId);
      const ownerName = targetUser ? targetUser.name : 'New Owner';

      shortlist.forEach((item) => {
        if (item.type === 'company') {
          updateCompany(item.id, { ownerId: newOwnerId });
        } else if (item.type === 'contact') {
          updateContact(item.id, { ownerId: newOwnerId });
        } else if (item.type === 'deal') {
          updateDeal(item.id, { ownerId: newOwnerId });
        } else if (item.type === 'task') {
          updateTask(item.id, { assigneeId: newOwnerId });
        } else if (item.type === 'case') {
          updateCase(item.id, { ownerId: newOwnerId });
        }
      });

      onClose();
      if (onActionComplete) {
        onActionComplete(`Reassigned all ${shortlist.length} shortlisted records to ${ownerName}`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <UserCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Ownership</h3>
                <p className="text-xs text-slate-500">Bulk reassign all records in this shortlist</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleChangeOwnership} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Record Owner</label>
              <select
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <p>
                Ownership for all <strong className="text-slate-800">{shortlist.length} records</strong> (companies, contacts, deals, tasks, and cases) will be transferred to the selected user.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Change Ownership
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 8. SHORTLIST OWNER
  if (activeModal === 'shortlist_owner') {
    const currentOwnerUser = users.find((u) => u.id === shortlistOwnerId) || currentUser;

    const handleSaveShortlistOwner = (e: React.FormEvent) => {
      e.preventDefault();
      setShortlistOwnerId(newShortlistOwnerId);
      const chosen = users.find((u) => u.id === newShortlistOwnerId);
      onClose();
      if (onActionComplete) {
        onActionComplete(`Shortlist owner updated to ${chosen ? chosen.name : 'New Owner'}`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shortlist Owner</h3>
                <p className="text-xs text-slate-500">Manage who owns and administrates this shortlist</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSaveShortlistOwner} className="p-5 space-y-4">
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs">
              <div className="text-slate-600">Current Owner:</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {currentOwnerUser.name} ({currentOwnerUser.role})
              </div>
              <div className="text-slate-500 text-[11px]">{currentOwnerUser.email}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Shortlist Owner</label>
              <select
                value={newShortlistOwnerId}
                onChange={(e) => setNewShortlistOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save Shortlist Owner
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 9. DELETE RECORDS FROM CRM
  if (activeModal === 'delete_records') {
    const handleDeleteRecords = () => {
      let count = 0;
      shortlist.forEach((item) => {
        if (item.type === 'company') {
          deleteCompany(item.id);
          count++;
        } else if (item.type === 'contact') {
          deleteContact(item.id);
          count++;
        } else if (item.type === 'deal') {
          deleteDeal(item.id);
          count++;
        } else if (item.type === 'task') {
          deleteTask(item.id);
          count++;
        } else if (item.type === 'case') {
          deleteCase(item.id);
          count++;
        }
      });

      clearShortlist();
      onClose();
      if (onActionComplete) {
        onActionComplete(`Deleted ${count} record(s) from CRM and cleared the shortlist`);
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-rose-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">Delete Records from CRM</h3>
                <p className="text-xs text-rose-700">Permanent action on CRM Database</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-xs text-rose-800">
              <strong>Warning:</strong> This will delete all{' '}
              <strong>{shortlist.length} underlying CRM record(s)</strong> from your database and remove them from all views.
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {shortlist.map((item) => (
                <div key={`${item.type}-${item.id}`} className="px-3 py-2 text-xs flex items-center justify-between">
                  <span className="font-medium text-slate-800 truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRecords}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirm Delete Records
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
