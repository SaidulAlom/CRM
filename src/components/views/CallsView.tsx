import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  PhoneCall,
  Phone,
  PhoneForwarded,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
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
  AlertTriangle,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  CalendarCheck,
  CalendarClock,
  CheckCheck,
  MoreVertical,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { Call, CallScript, CallStatus, CallPriority, Contact, Company, User as CRMUser } from '../../types';
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
    addCall,
    updateCall,
    completeCall,
    rescheduleCall,
    deleteCall,
    addCallScript,
    deleteCallScript,
  } = useCRM();

  // Current CRM date anchor (matching system simulated time 2026-09-28)
  const today = '2026-09-28';

  // Navigation & View Mode
  const [activeViewTab, setActiveViewTab] = useState<'call_list' | 'completed_history' | 'scripts'>('call_list');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'to_be_made' | 'scheduled'>('all');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignedUserFilter, setAssignedUserFilter] = useState<string>('all');
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>('all');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showQuickAddCallModal, setShowQuickAddCallModal] = useState(false);
  const [activeCallDetail, setActiveCallDetail] = useState<Call | null>(null);
  const [activeCompleteModalCall, setActiveCompleteModalCall] = useState<Call | null>(null);
  const [activeRescheduleModalCall, setActiveRescheduleModalCall] = useState<Call | null>(null);

  // Script Builder Modal State
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptDesc, setNewScriptDesc] = useState('');
  const [newScriptElements, setNewScriptElements] = useState<
    { id: string; type: 'instruction' | 'free_text' | 'yes_no' | 'multiple_choice'; prompt: string; options?: string[] }[]
  >([
    { id: '1', type: 'instruction', prompt: 'Greet the contact warmly, state your name, company, and reason for calling.' },
    { id: '2', type: 'yes_no', prompt: 'Is the contact currently in the market or evaluating solutions?' },
    { id: '3', type: 'free_text', prompt: 'Current technical stack or pain points noted:' },
    { id: '4', type: 'multiple_choice', prompt: 'Decision timeframe:', options: ['Immediate (< 1 month)', '1-3 months', 'Exploring for next quarter', 'No current project'] },
  ]);

  // Complete Call Modal State
  const [completionOutcome, setCompletionOutcome] = useState('Connected - Interested (Follow-up Needed)');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionFollowUpDate, setCompletionFollowUpDate] = useState('');
  const [completionNextAction, setCompletionNextAction] = useState('Follow-up Call');

  // Reschedule Call Modal State
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-29');
  const [rescheduleTime, setRescheduleTime] = useState('14:00');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Quick Add Call Form State
  const [newCallContactId, setNewCallContactId] = useState('');
  const [newCallCompanyId, setNewCallCompanyId] = useState('');
  const [newCallExternalName, setNewCallExternalName] = useState('');
  const [newCallExternalPhone, setNewCallExternalPhone] = useState('');
  const [newCallSubject, setNewCallSubject] = useState('');
  const [newCallPurpose, setNewCallPurpose] = useState('');
  const [newCallPriority, setNewCallPriority] = useState<CallPriority>('High');
  const [newCallType, setNewCallType] = useState<'to_be_made' | 'scheduled'>('to_be_made');
  const [newCallDueDate, setNewCallDueDate] = useState(today);
  const [newCallTime, setNewCallTime] = useState('10:00');
  const [newCallAssignedUserId, setNewCallAssignedUserId] = useState(currentUser.id);
  const [newCallScriptId, setNewCallScriptId] = useState('');
  const [newCallNotes, setNewCallNotes] = useState('');
  const [newCallErrors, setNewCallErrors] = useState<{ [key: string]: string }>({});

  // Helper: Overdue Detection
  const isCallOverdue = (call: Call): boolean => {
    if (call.isCompleted || call.status === 'Completed' || call.status === 'Cancelled') {
      return false;
    }
    if (call.status === 'Overdue') return true;

    const targetDate = call.dueDate || call.date;
    if (!targetDate) return false;

    if (targetDate < today) {
      return true;
    }
    if (targetDate === today && call.time && call.time < '07:30') {
      return true;
    }
    return false;
  };

  // Helper: Compute dynamic status for display
  const getComputedStatus = (call: Call): CallStatus => {
    if (call.isCompleted) return 'Completed';
    if (call.status === 'Cancelled') return 'Cancelled';
    if (isCallOverdue(call)) return 'Overdue';
    if (call.status) return call.status;
    if (call.isScheduled) return 'Scheduled';
    return 'Pending';
  };

  // Helper: Find related Contact & Company objects
  const getCallContact = (call: Call): Contact | undefined => {
    return contacts.find((c) => c.id === call.contactId);
  };

  const getCallCompany = (call: Call): Company | undefined => {
    if (call.companyId) {
      return companies.find((comp) => comp.id === call.companyId);
    }
    const c = getCallContact(call);
    if (c?.companyId) {
      return companies.find((comp) => comp.id === c.companyId);
    }
    return undefined;
  };

  const getCallAssignee = (call: Call): CRMUser | undefined => {
    return users.find((u) => u.id === call.assignedUserId);
  };

  const getCallScript = (call: Call): CallScript | undefined => {
    return callScripts.find((s) => s.id === call.scriptId);
  };

  // Active (non-deleted) Calls
  const activeCalls = useMemo(() => {
    return calls.filter((c) => !c.deletedAt);
  }, [calls]);

  // Statistics Computations
  const stats = useMemo(() => {
    const toMake = activeCalls.filter((c) => !c.isCompleted && !c.isScheduled && c.status !== 'Cancelled');
    const scheduled = activeCalls.filter((c) => !c.isCompleted && c.isScheduled && c.status !== 'Cancelled');
    const dueToday = activeCalls.filter((c) => !c.isCompleted && c.status !== 'Cancelled' && (c.dueDate === today || c.date === today));
    const overdue = activeCalls.filter((c) => isCallOverdue(c));
    const completed = activeCalls.filter((c) => c.isCompleted);

    return {
      callsToBeMade: toMake.length,
      scheduledCalls: scheduled.length,
      callsDueToday: dueToday.length,
      overdueCalls: overdue.length,
      completedCalls: completed.length,
    };
  }, [activeCalls, today]);

  // Base Filtered Calls
  const filteredCalls = useMemo(() => {
    return activeCalls.filter((call) => {
      const computedStatus = getComputedStatus(call);
      const contact = getCallContact(call);
      const company = getCallCompany(call);
      const assignee = getCallAssignee(call);
      const script = getCallScript(call);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contactName = `${contact?.firstName || ''} ${contact?.lastName || ''} ${call.externalName || ''}`.toLowerCase();
        const companyName = (company?.name || '').toLowerCase();
        const phone = (contact?.phone || contact?.mobile || call.externalPhone || '').toLowerCase();
        const assigneeName = (assignee?.name || '').toLowerCase();
        const subject = (call.subject || '').toLowerCase();
        const purpose = (call.callPurpose || '').toLowerCase();
        const scriptName = (script?.name || '').toLowerCase();
        const notes = (call.notes || '').toLowerCase();

        const matches =
          contactName.includes(q) ||
          companyName.includes(q) ||
          phone.includes(q) ||
          assigneeName.includes(q) ||
          subject.includes(q) ||
          purpose.includes(q) ||
          scriptName.includes(q) ||
          notes.includes(q);

        if (!matches) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Overdue') {
          if (!isCallOverdue(call)) return false;
        } else if (computedStatus !== statusFilter) {
          return false;
        }
      }

      // Priority Filter
      if (priorityFilter !== 'all') {
        if ((call.priority || 'Medium') !== priorityFilter) return false;
      }

      // Assigned To Filter
      if (assignedUserFilter !== 'all') {
        if (assignedUserFilter === 'my_calls') {
          if (call.assignedUserId !== currentUser.id) return false;
        } else if (call.assignedUserId !== assignedUserFilter) {
          return false;
        }
      }

      // Time Period Filter
      if (timePeriodFilter !== 'all') {
        const targetDate = call.dueDate || call.date;
        if (timePeriodFilter === 'today') {
          if (targetDate !== today) return false;
        } else if (timePeriodFilter === 'upcoming') {
          if (targetDate <= today) return false;
        } else if (timePeriodFilter === 'overdue') {
          if (!isCallOverdue(call)) return false;
        } else if (timePeriodFilter === 'completed') {
          if (!call.isCompleted) return false;
        }
      }

      return true;
    });
  }, [
    activeCalls,
    searchQuery,
    statusFilter,
    priorityFilter,
    assignedUserFilter,
    timePeriodFilter,
    currentUser.id,
    today,
  ]);

  // Section A: Calls to Be Made
  const callsToBeMadeList = useMemo(() => {
    return filteredCalls
      .filter((c) => !c.isCompleted && !c.isScheduled && c.status !== 'Cancelled')
      .sort((a, b) => {
        // Overdue first, then by priority, then by due date
        const aOverdue = isCallOverdue(a);
        const bOverdue = isCallOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        const pDiff = (priorityOrder[a.priority || 'Medium'] ?? 1) - (priorityOrder[b.priority || 'Medium'] ?? 1);
        if (pDiff !== 0) return pDiff;

        return (a.dueDate || a.date).localeCompare(b.dueDate || b.date);
      });
  }, [filteredCalls]);

  // Section B: Scheduled Calls
  const scheduledCallsList = useMemo(() => {
    return filteredCalls
      .filter((c) => !c.isCompleted && c.isScheduled && c.status !== 'Cancelled')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [filteredCalls]);

  // Completed Calls History List
  const completedCallsList = useMemo(() => {
    return filteredCalls
      .filter((c) => c.isCompleted)
      .sort((a, b) => (b.updatedAt || b.date).localeCompare(a.updatedAt || a.date));
  }, [filteredCalls]);

  // Quick Action Handlers
  const handleOpenCompleteModal = (call: Call, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveCompleteModalCall(call);
    setCompletionOutcome(call.outcomeStatus && call.outcomeStatus !== 'Pending' ? call.outcomeStatus : 'Connected - Interested (Follow-up Needed)');
    setCompletionNotes(call.notes || '');
    setCompletionFollowUpDate('');
    setCompletionNextAction('Follow-up Call');
  };

  const handleConfirmCompleteCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompleteModalCall) return;

    completeCall(
      activeCompleteModalCall.id,
      completionOutcome,
      completionNotes,
      completionFollowUpDate || undefined,
      completionNextAction || undefined
    );

    setActiveCompleteModalCall(null);
  };

  const handleOpenRescheduleModal = (call: Call, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveRescheduleModalCall(call);
    setRescheduleDate(call.date || today);
    setRescheduleTime(call.time || '14:00');
    setRescheduleReason('');
  };

  const handleConfirmRescheduleCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRescheduleModalCall) return;

    rescheduleCall(activeRescheduleModalCall.id, rescheduleDate, rescheduleTime, rescheduleReason || undefined);
    setActiveRescheduleModalCall(null);
  };

  const handleCancelCall = (call: Call, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel the call "${call.subject}"?`)) {
      updateCall(call.id, { status: 'Cancelled' });
    }
  };

  // Quick Add Call Form Submit
  const handleCreateNewCall = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!newCallSubject.trim()) {
      errs.subject = 'Please enter a call subject/purpose';
    }

    if (!newCallContactId && !newCallExternalName.trim()) {
      errs.contact = 'Please select a contact or enter a recipient name';
    }

    if (Object.keys(errs).length > 0) {
      setNewCallErrors(errs);
      return;
    }

    const isScheduled = newCallType === 'scheduled';

    addCall(
      {
        subject: newCallSubject.trim(),
        callPurpose: newCallPurpose.trim() || newCallSubject.trim(),
        priority: newCallPriority,
        status: isScheduled ? 'Scheduled' : 'Pending',
        dueDate: isScheduled ? undefined : newCallDueDate,
        date: isScheduled ? newCallDueDate : newCallDueDate,
        time: newCallTime || '10:00',
        durationMinutes: 30,
        direction: 'outbound',
        outcomeStatus: isScheduled ? 'Scheduled' : 'Pending',
        companyId: newCallCompanyId || undefined,
        contactId: newCallContactId || undefined,
        externalName: newCallExternalName.trim() || undefined,
        externalPhone: newCallExternalPhone.trim() || undefined,
        assignedUserId: newCallAssignedUserId,
        notes: newCallNotes.trim() || undefined,
        scriptId: newCallScriptId || undefined,
        isScheduled,
        isCompleted: false,
      },
      true
    );

    setShowQuickAddCallModal(false);
    setNewCallSubject('');
    setNewCallPurpose('');
    setNewCallContactId('');
    setNewCallCompanyId('');
    setNewCallExternalName('');
    setNewCallExternalPhone('');
    setNewCallNotes('');
    setNewCallErrors({});
  };

  // Script Builder Form Submit
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

  // Helper Badge Colors
  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Overdue
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Scheduled
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            In Progress
          </span>
        );
      case 'No Answer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            No Answer
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Rescheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check size={11} className="text-emerald-600" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 line-through">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: CallPriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <Flame size={10} className="text-rose-600" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            Normal
          </span>
        );
    }
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
  };

  return (
    <div id="call-list-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <PhoneCall size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Call List</h1>
              <p className="text-xs text-slate-500">
                Centralized call management for actionable outreach queues, scheduled appointments, and team call dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Add Call to Queue */}
          <button
            id="quick-add-call-btn"
            onClick={() => setShowQuickAddCallModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus size={14} className="text-indigo-600" />
            <span>+ Log / Add Call</span>
          </button>

          {/* Schedule Call */}
          <button
            id="schedule-call-btn"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar size={14} />
            <span>+ Schedule Call</span>
          </button>
        </div>
      </div>

      {/* 2. Top Dynamic Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Stat 1: Calls to Be Made */}
        <div
          onClick={() => {
            setActiveViewTab('call_list');
            setSectionFilter('to_be_made');
            setStatusFilter('all');
          }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calls to Be Made</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <PhoneOutgoing size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.callsToBeMade}</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Actionable</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Pending outreach & follow-ups</p>
        </div>

        {/* Stat 2: Scheduled Calls */}
        <div
          onClick={() => {
            setActiveViewTab('call_list');
            setSectionFilter('scheduled');
            setStatusFilter('all');
          }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Calls</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <CalendarClock size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">{stats.scheduledCalls}</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Calendar Synced</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Confirmed appointment slots</p>
        </div>

        {/* Stat 3: Calls Due Today */}
        <div
          onClick={() => {
            setActiveViewTab('call_list');
            setTimePeriodFilter('today');
          }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calls Due Today</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.callsDueToday}</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Today's Focus</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Due by end of day</p>
        </div>

        {/* Stat 4: Overdue Calls */}
        <div
          onClick={() => {
            setActiveViewTab('call_list');
            setStatusFilter('Overdue');
          }}
          className="bg-white rounded-xl border border-rose-200 bg-rose-50/20 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Overdue Calls</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{stats.overdueCalls}</span>
            {stats.overdueCalls > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                Needs Attention
              </span>
            )}
          </div>
          <p className="text-[10px] text-rose-600/80 mt-1">Past scheduled/due deadline</p>
        </div>

        {/* Stat 5: Completed Calls */}
        <div
          onClick={() => {
            setActiveViewTab('completed_history');
          }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Calls</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCheck size={14} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.completedCalls}</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Logged & Closed</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Outcomes & notes recorded</p>
        </div>
      </div>

      {/* 3. Primary View Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 text-xs font-semibold gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewTab('call_list')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'call_list'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall size={14} />
            <span>Active Call List ({callsToBeMadeList.length + scheduledCallsList.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('completed_history')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'completed_history'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Completed Call History ({completedCallsList.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('scripts')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'scripts'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} />
            <span>Call Scripts & Prompts ({callScripts.length})</span>
          </button>
        </div>

        {/* Section View Selector when in call_list tab */}
        {activeViewTab === 'call_list' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSectionFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                sectionFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both Sections
            </button>
            <button
              onClick={() => setSectionFilter('to_be_made')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                sectionFilter === 'to_be_made' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              To Be Made ({callsToBeMadeList.length})
            </button>
            <button
              onClick={() => setSectionFilter('scheduled')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                sectionFilter === 'scheduled' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scheduled ({scheduledCallsList.length})
            </button>
          </div>
        )}
      </div>

      {/* 4. Search & Multi-Filter Controls Bar */}
      {activeViewTab !== 'scripts' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
              <input
                id="search-call-list-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search call list by contact, company, phone, assignee, purpose, script, notes..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Assigned To Filter (Team Call Management) */}
              <div className="relative">
                <select
                  id="filter-assigned-to"
                  value={assignedUserFilter}
                  onChange={(e) => setAssignedUserFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 pr-8"
                >
                  <option value="all">All Team Members ▼</option>
                  <option value="my_calls">My Calls Only ({currentUser.name})</option>
                  <optgroup label="Select Team Member">
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 pr-8"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Overdue">Overdue 🔴</option>
                  <option value="In Progress">In Progress</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <select
                  id="filter-priority"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 pr-8"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              {/* Time Period Filter */}
              <div className="relative">
                <select
                  id="filter-time-period"
                  value={timePeriodFilter}
                  onChange={(e) => setTimePeriodFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 pr-8"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="overdue">Overdue Only</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Reset Filters button */}
              {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assignedUserFilter !== 'all' || timePeriodFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setAssignedUserFilter('all');
                    setTimePeriodFilter('all');
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 hover:bg-slate-100 rounded-lg"
                >
                  <RefreshCw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Content: Primary Call List View */}
      {activeViewTab === 'call_list' && (
        <div className="space-y-8">
          {/* SECTION A: Calls to Be Made */}
          {(sectionFilter === 'all' || sectionFilter === 'to_be_made') && (
            <div id="calls-to-be-made-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Section Header */}
              <div className="p-4 sm:px-6 sm:py-4.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <PhoneOutgoing size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">Calls to Be Made</h2>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Pending: {callsToBeMadeList.filter((c) => !isCallOverdue(c)).length}
                      </span>
                      {callsToBeMadeList.filter((c) => isCallOverdue(c)).length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Overdue: {callsToBeMadeList.filter((c) => isCallOverdue(c)).length}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Actionable call queue requiring direct outreach from you or assigned team members.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Showing {callsToBeMadeList.length} actionable calls
                  </span>
                </div>
              </div>

              {/* Table / List View */}
              {callsToBeMadeList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckCheck size={20} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No calls to be made right now</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    All actionable calls in this queue have been completed or scheduled. Click "+ Log / Add Call" to queue up a new outreach task.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Purpose / Priority</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {callsToBeMadeList.map((call) => {
                        const contact = getCallContact(call);
                        const company = getCallCompany(call);
                        const assignee = getCallAssignee(call);
                        const script = getCallScript(call);
                        const computedStatus = getComputedStatus(call);
                        const isOverdue = computedStatus === 'Overdue';

                        const contactDisplayName = contact
                          ? `${contact.firstName} ${contact.lastName}`
                          : call.externalName || 'Unnamed Contact';

                        const phoneDisplay = contact?.phone || contact?.mobile || call.externalPhone || 'No Phone';

                        return (
                          <tr
                            key={call.id}
                            onClick={() => setActiveCallDetail(call)}
                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                              isOverdue ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            {/* Contact */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {contactDisplayName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate max-w-[150px]">
                                  <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate">
                                    {contactDisplayName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {contact?.jobTitle || contact?.type || 'Lead'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Company */}
                            <td className="py-3.5 px-4 text-slate-700">
                              <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                                <Building2 size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{company?.name || 'Independent'}</span>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <span>{phoneDisplay}</span>
                                {phoneDisplay !== 'No Phone' && (
                                  <button
                                    type="button"
                                    onClick={(e) => copyToClipboard(phoneDisplay, e)}
                                    className="text-slate-400 hover:text-slate-600 p-0.5"
                                    title="Copy phone"
                                  >
                                    <Copy size={11} />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Assigned To */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center">
                                  {(assignee?.name || 'U').substring(0, 1)}
                                </div>
                                <span className="font-medium text-slate-800 text-[11px]">
                                  {assignee?.name || 'Unassigned'}
                                </span>
                              </div>
                            </td>

                            {/* Purpose & Priority */}
                            <td className="py-3.5 px-4 max-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                {getPriorityBadge(call.priority)}
                                <span className="font-semibold text-slate-800 truncate" title={call.subject}>
                                  {call.subject}
                                </span>
                              </div>
                              {call.notes && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {call.notes}
                                </p>
                              )}
                              {script && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1">
                                  <BookOpen size={9} />
                                  {script.name}
                                </span>
                              )}
                            </td>

                            {/* Due Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold">
                                {call.dueDate === today ? (
                                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
                                    Today
                                  </span>
                                ) : isOverdue ? (
                                  <span className="text-rose-700 font-bold flex items-center gap-1">
                                    <AlertTriangle size={11} />
                                    {call.dueDate || call.date}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">{call.dueDate || call.date}</span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getStatusBadge(computedStatus)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Call Action */}
                                <button
                                  type="button"
                                  onClick={() => openCallConsole(call.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                                  title="Launch call console & live script"
                                >
                                  <Phone size={12} />
                                  <span>Call</span>
                                </button>

                                {/* Complete Action */}
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenCompleteModal(call, e)}
                                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                                  title="Mark completed & log outcome"
                                >
                                  Complete
                                </button>

                                {/* Schedule Action */}
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenRescheduleModal(call, e)}
                                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                                  title="Schedule or reschedule this call"
                                >
                                  <Calendar size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION B: Scheduled Calls */}
          {(sectionFilter === 'all' || sectionFilter === 'scheduled') && (
            <div id="scheduled-calls-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Section Header */}
              <div className="p-4 sm:px-6 sm:py-4.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold">
                    <CalendarClock size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">Scheduled Calls</h2>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Upcoming: {scheduledCallsList.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pre-scheduled calls synchronized with attendee calendars and automated reminders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>+ Schedule New Call</span>
                  </button>
                </div>
              </div>

              {/* Table / List View */}
              {scheduledCallsList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarCheck size={20} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No scheduled calls found</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    No calls are currently scheduled matching your filters. Click "+ Schedule Call" to set up a new meeting slot.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Scheduled Date</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Calendar</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scheduledCallsList.map((call) => {
                        const contact = getCallContact(call);
                        const company = getCallCompany(call);
                        const assignee = getCallAssignee(call);
                        const script = getCallScript(call);
                        const computedStatus = getComputedStatus(call);

                        const contactDisplayName = contact
                          ? `${contact.firstName} ${contact.lastName}`
                          : call.externalName || 'Unnamed Contact';

                        const phoneDisplay = contact?.phone || contact?.mobile || call.externalPhone || 'No Phone';

                        return (
                          <tr
                            key={call.id}
                            onClick={() => setActiveCallDetail(call)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          >
                            {/* Contact */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {contactDisplayName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate max-w-[150px]">
                                  <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate">
                                    {contactDisplayName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate">
                                    {phoneDisplay}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Company */}
                            <td className="py-3.5 px-4 text-slate-700">
                              <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                                <Building2 size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{company?.name || 'Independent'}</span>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                <Calendar size={13} className="text-indigo-600 shrink-0" />
                                <span>{call.date === today ? 'Today (28 Sep)' : call.date}</span>
                              </div>
                            </td>

                            {/* Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <span className="font-mono font-medium text-slate-700">{call.time || '10:00'}</span>
                                {call.durationMinutes && (
                                  <span className="text-[10px] text-slate-400">({call.durationMinutes}m)</span>
                                )}
                              </div>
                            </td>

                            {/* Assigned To */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center">
                                  {(assignee?.name || 'U').substring(0, 1)}
                                </div>
                                <span className="font-medium text-slate-800 text-[11px]">
                                  {assignee?.name || 'Unassigned'}
                                </span>
                              </div>
                            </td>

                            {/* Calendar Indicator */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CalendarCheck size={11} className="text-emerald-600" />
                                Calendar Synced
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getStatusBadge(computedStatus)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openCallConsole(call.id)}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                                  title="Launch call console & live script"
                                >
                                  <Phone size={12} />
                                  <span>Call Now</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleOpenCompleteModal(call, e)}
                                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                                  title="Mark as completed"
                                >
                                  Complete
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleOpenRescheduleModal(call, e)}
                                  className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                                  title="Reschedule call date/time"
                                >
                                  Reschedule
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleCancelCall(call, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Cancel call"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Completed Call History Tab */}
      {activeViewTab === 'completed_history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Completed Call Log & Outcomes</h2>
              <p className="text-[11px] text-slate-500">Historical record of calls finished with notes, scripts, and follow-ups.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{completedCallsList.length} Completed</span>
          </div>

          {completedCallsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No completed calls found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Date Completed</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">Notes / Summary</th>
                    <th className="py-3 px-4">Next Action</th>
                    <th className="py-3 px-4">Rep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedCallsList.map((call) => {
                    const contact = getCallContact(call);
                    const company = getCallCompany(call);
                    const assignee = getCallAssignee(call);

                    return (
                      <tr
                        key={call.id}
                        onClick={() => setActiveCallDetail(call)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {contact ? `${contact.firstName} ${contact.lastName}` : call.externalName || 'Contact'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{company?.name || 'Independent'}</td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{call.date} {call.time}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {call.outcomeStatus || 'Completed'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-600 truncate">
                          {call.outcomeNotes || call.notes || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {call.nextAction ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700">
                              {call.nextAction} {call.followUpDate ? `(${call.followUpDate})` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{assignee?.name || 'Rep'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. Call Scripts Management Tab */}
      {activeViewTab === 'scripts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Interactive Call Scripts</h2>
              <p className="text-xs text-slate-500">
                Guide reps with structured qualification prompts, questions, and objection handling during calls.
              </p>
            </div>
            <button
              onClick={() => setShowScriptModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus size={14} />
              <span>Build New Script</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callScripts.map((script) => (
              <div key={script.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{script.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{script.description}</p>
                  </div>
                  <button
                    onClick={() => deleteCallScript(script.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Delete script"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Script Prompts & Steps ({script.elements.length})
                  </span>
                  <div className="space-y-1.5">
                    {script.elements.map((el, idx) => (
                      <div key={el.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2">
                        <span className="font-mono text-slate-400 font-bold shrink-0">{idx + 1}.</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">{el.prompt}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 ml-2">
                            {el.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Call Modal (Integrated with Calendar) */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* MODAL 2: Complete Call Modal */}
      {activeCompleteModalCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Complete Call</h3>
                  <p className="text-[11px] text-slate-300">Record call outcome, summary notes, and follow-up plan.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCompleteModalCall(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCompleteCall} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Call Subject:</span>
                <p className="font-bold text-slate-900 text-xs">{activeCompleteModalCall.subject}</p>
                <p className="text-[11px] text-slate-500">
                  Recipient: {getCallContact(activeCompleteModalCall)?.firstName} {getCallContact(activeCompleteModalCall)?.lastName || activeCompleteModalCall.externalName || 'Contact'} · {getCallCompany(activeCompleteModalCall)?.name || 'Independent'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Call Outcome <span className="text-rose-500">*</span>
                </label>
                <select
                  value={completionOutcome}
                  onChange={(e) => setCompletionOutcome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Connected - Interested (Follow-up Needed)">Connected - Interested (Follow-up Needed)</option>
                  <option value="Connected - Scheduled Demo / Meeting">Connected - Scheduled Demo / Meeting</option>
                  <option value="Connected - Won / Deal Closed">Connected - Won / Deal Closed</option>
                  <option value="Connected - Not Interested">Connected - Not Interested</option>
                  <option value="Left Voicemail / Message">Left Voicemail / Message</option>
                  <option value="Gatekeeper / Reached Assistant">Gatekeeper / Reached Assistant</option>
                  <option value="Busy / Call Back Later">Busy / Call Back Later</option>
                  <option value="Wrong Number / Bad Contact">Wrong Number / Bad Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Call Discussion Notes & Action Items
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Summarize key points discussed, objections raised, client feedback, or deliverables..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Next Action
                  </label>
                  <select
                    value={completionNextAction}
                    onChange={(e) => setCompletionNextAction(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Schedule Meeting">Schedule Meeting</option>
                    <option value="Send Follow-up Email">Send Follow-up Email</option>
                    <option value="Send Proposal / Pricing">Send Proposal / Pricing</option>
                    <option value="No Further Action">No Further Action</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={completionFollowUpDate}
                    onChange={(e) => setCompletionFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCompleteModalCall(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save & Complete Call</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reschedule Call Modal */}
      {activeRescheduleModalCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="px-5 py-4 bg-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm">Reschedule Call</h3>
              </div>
              <button
                onClick={() => setActiveRescheduleModalCall(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRescheduleCall} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Call:</span>
                <p className="font-bold text-slate-900 text-xs">{activeRescheduleModalCall.subject}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Currently: {activeRescheduleModalCall.date} at {activeRescheduleModalCall.time || '10:00'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    New Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    New Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Rescheduling Reason / Notes
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Client requested postponement due to travel..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveRescheduleModalCall(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Call Details View Modal */}
      {activeCallDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{activeCallDetail.subject}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusBadge(getComputedStatus(activeCallDetail))}
                    {getPriorityBadge(activeCallDetail.priority)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveCallDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Contact & Company Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Contact / Lead
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {getCallContact(activeCallDetail)
                      ? `${getCallContact(activeCallDetail)?.firstName} ${getCallContact(activeCallDetail)?.lastName}`
                      : activeCallDetail.externalName || 'Unnamed'}
                  </div>
                  <div className="text-slate-500 mt-0.5">{getCallContact(activeCallDetail)?.jobTitle || 'Lead / Contact'}</div>
                  <div className="text-slate-600 font-mono mt-1">
                    {getCallContact(activeCallDetail)?.phone || getCallContact(activeCallDetail)?.mobile || activeCallDetail.externalPhone || 'No Phone'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Company / Account
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {getCallCompany(activeCallDetail)?.name || 'Independent Account'}
                  </div>
                  <div className="text-slate-500 mt-0.5">{getCallCompany(activeCallDetail)?.industry || 'Corporate'}</div>
                  <div className="text-slate-500 mt-1">
                    Assigned Rep: <span className="font-semibold text-slate-800">{getCallAssignee(activeCallDetail)?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Timing & Scheduling */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Date</span>
                  <span className="font-semibold text-slate-800 text-xs">{activeCallDetail.date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Time</span>
                  <span className="font-semibold text-slate-800 text-xs font-mono">{activeCallDetail.time || '10:00'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Type</span>
                  <span className="font-semibold text-slate-800 text-xs capitalize">{activeCallDetail.isScheduled ? 'Scheduled Call' : 'Call to Be Made'}</span>
                </div>
              </div>

              {/* Purpose & Notes */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Call Purpose</span>
                <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                  {activeCallDetail.callPurpose || activeCallDetail.subject}
                </p>
              </div>

              {activeCallDetail.notes && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Call Notes & Background</span>
                  <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed font-sans">
                    {activeCallDetail.notes}
                  </p>
                </div>
              )}

              {/* Script Prompts if attached */}
              {getCallScript(activeCallDetail) && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span>Attached Call Script: {getCallScript(activeCallDetail)?.name}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80">{getCallScript(activeCallDetail)?.description}</p>
                </div>
              )}

              {/* Outcome if completed */}
              {activeCallDetail.isCompleted && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Recorded Outcome:</span>
                  <p className="font-bold text-emerald-950 text-xs">{activeCallDetail.outcomeStatus}</p>
                  {activeCallDetail.outcomeNotes && (
                    <p className="text-[11px] text-emerald-900 mt-1">{activeCallDetail.outcomeNotes}</p>
                  )}
                  {activeCallDetail.nextAction && (
                    <div className="text-[11px] text-emerald-800 mt-1">
                      Next Action: <span className="font-semibold">{activeCallDetail.nextAction}</span> on {activeCallDetail.followUpDate || 'TBD'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveCallDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!activeCallDetail.isCompleted && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const c = activeCallDetail;
                        setActiveCallDetail(null);
                        handleOpenCompleteModal(c);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold"
                    >
                      Complete Call
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const c = activeCallDetail;
                        setActiveCallDetail(null);
                        openCallConsole(c.id);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Phone size={14} />
                      <span>Call Now</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Quick Add / Log Call Modal */}
      {showQuickAddCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <PhoneCall size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm">Add Call to List</h3>
              </div>
              <button
                onClick={() => setShowQuickAddCallModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewCall} className="p-5 overflow-y-auto space-y-4">
              {/* Queue Section Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Queue Section</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg text-center font-semibold">
                  <button
                    type="button"
                    onClick={() => setNewCallType('to_be_made')}
                    className={`py-1.5 rounded-md transition-all ${
                      newCallType === 'to_be_made' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Calls to Be Made (Queue)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCallType('scheduled')}
                    className={`py-1.5 rounded-md transition-all ${
                      newCallType === 'scheduled' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Scheduled Appointment
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Call Subject / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCallSubject}
                  onChange={(e) => setNewCallSubject(e.target.value)}
                  placeholder="e.g. Follow up on Enterprise RFP commercial proposal"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 ${
                    newCallErrors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {newCallErrors.subject && <p className="text-[10px] text-rose-600 mt-1">{newCallErrors.subject}</p>}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Call Purpose / Key Objective
                </label>
                <input
                  type="text"
                  value={newCallPurpose}
                  onChange={(e) => setNewCallPurpose(e.target.value)}
                  placeholder="e.g. Review pricing tiers and clarify security addendum requirements"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contact Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select CRM Contact
                </label>
                <select
                  value={newCallContactId}
                  onChange={(e) => {
                    setNewCallContactId(e.target.value);
                    const selected = contacts.find((c) => c.id === e.target.value);
                    if (selected?.companyId) {
                      setNewCallCompanyId(selected.companyId);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Existing Contact --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email}) {c.phone ? `· ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Manual External Contact */}
              {!newCallContactId && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Manual Contact Name</label>
                    <input
                      type="text"
                      value={newCallExternalName}
                      onChange={(e) => setNewCallExternalName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newCallExternalPhone}
                      onChange={(e) => setNewCallExternalPhone(e.target.value)}
                      placeholder="+91 XXXXX"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Company Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Account</label>
                <select
                  value={newCallCompanyId}
                  onChange={(e) => setNewCallCompanyId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Company (Optional) --</option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} ({comp.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newCallPriority}
                    onChange={(e) => setNewCallPriority(e.target.value as CallPriority)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Assigned User */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Team Member</label>
                  <select
                    value={newCallAssignedUserId}
                    onChange={(e) => setNewCallAssignedUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Due Date or Scheduled Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {newCallType === 'scheduled' ? 'Scheduled Date' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newCallDueDate}
                    onChange={(e) => setNewCallDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Time</label>
                  <input
                    type="time"
                    value={newCallTime}
                    onChange={(e) => setNewCallTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Call Script (Optional) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attach Call Script (Optional)</label>
                <select
                  value={newCallScriptId}
                  onChange={(e) => setNewCallScriptId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Script Attached --</option>
                  {callScripts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.elements.length} steps)
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preparation Notes</label>
                <textarea
                  rows={2}
                  value={newCallNotes}
                  onChange={(e) => setNewCallNotes(e.target.value)}
                  placeholder="Notes, background, or customer history to review before dialing..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowQuickAddCallModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Script Builder Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm">Build Interactive Call Script</h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateScript} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Script Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  placeholder="e.g. Enterprise Discovery & Objection Handling"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Script Description</label>
                <input
                  type="text"
                  value={newScriptDesc}
                  onChange={(e) => setNewScriptDesc(e.target.value)}
                  placeholder="Brief context on when reps should utilize this script..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  Script Prompts ({newScriptElements.length} steps configured)
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newScriptElements.map((el, i) => (
                    <div key={el.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-slate-400 font-bold">{i + 1}.</span>
                        <span className="font-medium text-slate-800 text-xs">{el.prompt}</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono uppercase">
                        {el.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Call Script
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
