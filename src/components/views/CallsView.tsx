import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  PhoneCall,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Search,
  FileText,
  Trash2,
  Edit2,
  HelpCircle,
  User,
  Globe,
  Bell,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { CallScript } from '../../types';
import { ScheduleCallModal } from '../common/ScheduleCallModal';

export const CallsView: React.FC = () => {
  const {
    calls,
    callScripts,
    contacts,
    companies,
    users,
    currentUser,
    openCallConsole,
    openQuickCreate,
    addCallScript,
    deleteCallScript,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'queues' | 'history' | 'scripts'>('queues');
  const [search, setSearch] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Script Builder Modal State
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptDesc, setNewScriptDesc] = useState('');
  const [newScriptElements, setNewScriptElements] = useState<
    { id: string; type: 'instruction' | 'free_text' | 'yes_no' | 'multiple_choice'; prompt: string; options?: string[] }[]
  >([
    { id: '1', type: 'instruction', prompt: 'Greet the prospect, state your company name and call purpose.' },
    { id: '2', type: 'yes_no', prompt: 'Is the prospect the primary decision maker for sales tools?' },
    { id: '3', type: 'free_text', prompt: 'Current CRM or workflow solution in place:' },
    { id: '4', type: 'multiple_choice', prompt: 'Timeline to adopt new solution:', options: ['Immediate (< 1 month)', '1-3 months', 'Evaluating for next fiscal year'] },
  ]);

  const today = new Date().toISOString().split('T')[0];

  // FR-9.3: Two queues: Calls to be made now & Scheduled calls
  const immediateQueue = useMemo(() => {
    return calls.filter((c) => !c.deletedAt && !c.isCompleted && !c.isScheduled);
  }, [calls]);

  const scheduledQueue = useMemo(() => {
    return calls
      .filter((c) => !c.deletedAt && !c.isCompleted && c.isScheduled)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [calls]);

  const completedCalls = useMemo(() => {
    return calls
      .filter((c) => !c.deletedAt && c.isCompleted)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [calls]);

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScriptName.trim()) return;
    addCallScript({
      name: newScriptName.trim(),
      description: newScriptDesc.trim(),
      elements: newScriptElements,
    });
    setShowScriptModal(false);
    setNewScriptName('');
    setNewScriptDesc('');
  };

  return (
    <div id="calls-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Calls & Telephony</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {immediateQueue.length + scheduledQueue.length} pending calls
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Work immediate call lists, schedule calls with team assignment and calendar synchronization, run structured scripts with real-time timer in Call Console, and track outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="schedule-call-btn"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar size={15} />
            <span>Schedule Call</span>
          </button>
          <button
            id="create-call-btn"
            onClick={() => openQuickCreate('call')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Quick Log Call</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('queues')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'queues'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall size={14} />
          <span>Active Call Queues ({immediateQueue.length + scheduledQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Completed Call Log & Responses ({completedCalls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'scripts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={14} />
          <span>Call Scripts Builder ({callScripts.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Call Queues (FR-9.3) */}
      {activeTab === 'queues' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue A: Calls to be made now */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">
                  Calls to Be Made Now ({immediateQueue.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Immediate Priority</span>
            </div>

            {immediateQueue.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No immediate calls pending. Good job!
              </p>
            ) : (
              <div className="space-y-3">
                {immediateQueue.map((call) => {
                  const contact = contacts.find((c) => c.id === call.contactId);
                  const company = companies.find((cp) => cp.id === call.companyId);

                  return (
                    <div
                      key={call.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 flex items-center justify-between gap-3 text-xs transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {call.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{contact ? `${contact.firstName} ${contact.lastName}` : call.externalName || 'Prospect'}</span>
                          {company && <span>· {company.name}</span>}
                          <span>· {call.externalPhone || contact?.phone || 'No phone'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openCallConsole(call.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Start Call</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Queue B: Scheduled Calls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Scheduled Calls ({scheduledQueue.length})
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>+ Schedule New</span>
              </button>
            </div>

            {scheduledQueue.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-400 italic">
                  No future calls booked on the calendar.
                </p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs"
                >
                  Schedule a Call Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledQueue.map((call) => {
                  const contact = contacts.find((c) => c.id === call.contactId);
                  const company = companies.find((cp) => cp.id === call.companyId);
                  const assignee = users.find((u) => u.id === call.assignedUserId);
                  const script = callScripts.find((s) => s.id === call.scriptId);

                  return (
                    <div
                      key={call.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 bg-slate-50/50 flex flex-col gap-2.5 text-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {call.subject}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              <Calendar size={12} className="text-violet-600" />
                              {call.date} at {call.time}
                              {call.durationMinutes ? ` (${call.durationMinutes}m)` : ''}
                            </span>
                            {call.timeZone && (
                              <span className="text-[10px] text-slate-400">
                                · {call.timeZone.split('/')[1] || call.timeZone}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => openCallConsole(call.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 shrink-0"
                        >
                          <Play size={12} className="fill-white" />
                          <span>Start Call</span>
                        </button>
                      </div>

                      {/* Detail badges: Recipient, Company, Script, Assignee */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Users size={12} className="text-slate-400" />
                          {contact ? `${contact.firstName} ${contact.lastName}` : call.externalName || 'Prospect'}
                          {call.externalPhone || contact?.phone ? ` (${call.externalPhone || contact?.phone})` : ''}
                        </span>

                        {company && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Building2 size={12} className="text-slate-400" />
                            {company.name}
                          </span>
                        )}

                        {assignee && (
                          <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            <User size={10} />
                            {assignee.name}
                          </span>
                        )}

                        {script && (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            <BookOpen size={10} />
                            {script.name}
                          </span>
                        )}

                        {call.scheduledCalendarEventId && (
                          <span className="flex items-center gap-1 text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-violet-100">
                            Calendar Synced
                          </span>
                        )}
                      </div>

                      {call.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                          "{call.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* Tab 2: Completed Call Log & Reportable Responses (FR-9.6) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/50">
            <span className="font-semibold text-slate-700">
              Completed Calls Log & Script Responses
            </span>
            <span className="text-slate-400 text-[11px]">
              All responses are reportable across calls
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Call Subject</th>
                  <th className="px-4 py-3">Recipient / Lead</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Outcome Status</th>
                  <th className="px-4 py-3">Script Responses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No completed calls recorded yet.
                    </td>
                  </tr>
                ) : (
                  completedCalls.map((call) => {
                    const contact = contacts.find((c) => c.id === call.contactId);
                    const durMins = Math.floor((call.durationSeconds || 0) / 60);
                    const durSecs = (call.durationSeconds || 0) % 60;

                    return (
                      <tr key={call.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {call.subject}
                          <div className="text-[10px] text-slate-400 capitalize">{call.direction}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {contact ? `${contact.firstName} ${contact.lastName}` : call.externalName || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {call.date} {call.time}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 font-semibold">
                          {durMins}m {durSecs}s
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {call.outcomeStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {call.scriptAnswers && Object.keys(call.scriptAnswers).length > 0 ? (
                            <span className="text-[11px] text-indigo-600 font-medium">
                              {Object.keys(call.scriptAnswers).length} answers logged
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">None</span>
                          )}
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

      {/* Tab 3: Call Scripts Builder (FR-9.5) */}
      {activeTab === 'scripts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Configured Call Scripts</h3>
              <p className="text-xs text-slate-500">
                Ordered questions of type instruction text, free text answer, yes/no, or multiple choice.
              </p>
            </div>
            <button
              onClick={() => setShowScriptModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus size={14} />
              <span>Create Call Script</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callScripts.map((sc) => (
              <div key={sc.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{sc.name}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">{sc.description}</p>
                  </div>
                  {callScripts.length > 1 && (
                    <button
                      onClick={() => deleteCallScript(sc.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Script Elements ({sc.elements.length})
                  </div>
                  {sc.elements.map((el, idx) => (
                    <div key={el.id} className="p-2 rounded bg-slate-50 text-[11px] flex items-center justify-between">
                      <span className="truncate pr-2 font-medium text-slate-700">
                        {idx + 1}. {el.prompt}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-600 shrink-0 capitalize">
                        {el.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Builder Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Build New Call Script (FR-9.5)</h3>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Script Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inbound Support Qualification Script"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Standard questions for enterprise triage"
                value={newScriptDesc}
                onChange={(e) => setNewScriptDesc(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScript}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Save Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
