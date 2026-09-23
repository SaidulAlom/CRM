import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  Clock,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { Case, CaseNote } from '../../types';

export const CasesView: React.FC = () => {
  const {
    cases,
    companies,
    contacts,
    users,
    currentUser,
    fieldSets,
    updateCase,
    addCaseNote,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => !c.deletedAt)
      .filter((c) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return c.title.toLowerCase().includes(s) || c.problemName.toLowerCase().includes(s);
      })
      .filter((c) => {
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
        return true;
      });
  }, [cases, search, statusFilter, priorityFilter]);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || filteredCases[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeCase) return;
    addCaseNote(activeCase.id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div id="cases-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support Cases</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {filteredCases.length} tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer issues, assign primary owners and secondary team members, and record chronological notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="create-case-btn"
            onClick={() => openQuickCreate('case')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Open Case</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases by subject or problem name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            {fieldSets.caseStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Split view: Left table, right active case detail with notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cases List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="w-10 px-3 py-3 text-center" title="Shortlist">
                    <span className="sr-only">Shortlist</span>
                    <Flag size={12} className="mx-auto text-slate-400" />
                  </th>
                  <th className="px-4 py-3">Case Subject</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Primary Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No cases found.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((cs) => {
                    const isShortlisted = isItemShortlisted('case', cs.id);
                    const company = companies.find((c) => c.id === cs.companyId);
                    const owner = users.find((u) => u.id === cs.ownerId);
                    const isSelected = activeCase?.id === cs.id;

                    return (
                      <tr
                        key={cs.id}
                        onClick={() => setSelectedCaseId(cs.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td
                          className="px-3 py-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist({
                              type: 'case',
                              category: 'case',
                              id: cs.id,
                              title: cs.title,
                              subtitle: `${cs.problemName} · ${cs.priority} Priority`,
                              referenceInfo: company?.name || `${cs.status}`,
                            });
                          }}
                        >
                          <button
                            id={`shortlist-btn-case-${cs.id}`}
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
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{cs.title}</div>
                          <div className="text-[11px] font-normal text-slate-500">{cs.problemName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              cs.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : cs.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {cs.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {cs.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {company ? company.name : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {owner?.name || 'Unassigned'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Case Details & Chronological Notes Thread (FR-7.3) */}
        {activeCase && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Case Details & Notes
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white truncate">{activeCase.title}</h3>
                  <button
                    id={`shortlist-btn-case-detail-${activeCase.id}`}
                    onClick={() => {
                      const company = companies.find((c) => c.id === activeCase.companyId);
                      toggleShortlist({
                        type: 'case',
                        category: 'case',
                        id: activeCase.id,
                        title: activeCase.title,
                        subtitle: `${activeCase.problemName} · ${activeCase.priority} Priority`,
                        referenceInfo: company?.name || `${activeCase.status}`,
                      });
                    }}
                    className={`p-1 rounded transition-colors ${
                      isItemShortlisted('case', activeCase.id)
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-400 hover:text-amber-400'
                    }`}
                    title={isItemShortlisted('case', activeCase.id) ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    aria-label={isItemShortlisted('case', activeCase.id) ? 'Remove from Shortlist' : 'Add to Shortlist'}
                  >
                    <Flag
                      size={15}
                      className={isItemShortlisted('case', activeCase.id) ? 'fill-amber-400' : ''}
                    />
                  </button>
                </div>
              </div>
              <select
                value={activeCase.status}
                onChange={(e) => updateCase(activeCase.id, { status: e.target.value })}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold shrink-0"
              >
                {fieldSets.caseStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="p-4 border-b border-slate-200 space-y-2 text-xs bg-slate-50/50">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Problem Name</span>
                <span className="font-medium text-slate-800">{activeCase.problemName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Team Members</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeCase.teamMemberIds?.map((uid) => {
                    const u = users.find((usr) => usr.id === uid);
                    return (
                      <span key={uid} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px]">
                        {u?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes Thread */}
            <div className="p-4 flex-1 flex flex-col space-y-4 max-h-96">
              <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-indigo-600" />
                <span>Internal Notes ({activeCase.internalNotes?.length || 0})</span>
              </h4>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {activeCase.internalNotes && activeCase.internalNotes.length > 0 ? (
                  activeCase.internalNotes.map((n: CaseNote) => (
                    <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="text-slate-700 font-semibold">{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed">{n.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No notes recorded on this ticket yet.
                  </p>
                )}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  placeholder="Add internal troubleshooting note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Send size={13} />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
