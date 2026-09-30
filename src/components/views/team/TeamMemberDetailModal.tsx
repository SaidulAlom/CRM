import React, { useState, useMemo } from 'react';
import {
  User,
  Task,
  Deal,
  Case,
  Event,
  DocumentFile,
  DirectMessage,
} from '../../../types';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  Calendar,
  FileText,
  MessageSquare,
  Edit2,
  Check,
  Copy,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import {
  USER_STATUSES,
  calculateMemberStats,
  canEditUser,
} from './teamConstants';

interface TeamMemberDetailModalProps {
  member: User;
  currentUser: User;
  users: User[];
  tasks: Task[];
  deals: Deal[];
  cases: Case[];
  events: Event[];
  documents: DocumentFile[];
  directMessages: DirectMessage[];
  onClose: () => void;
  onEdit: (member: User) => void;
  onScheduleMeeting: (member: User) => void;
  onAssignTask: (member: User) => void;
  onSendDirectMessage: (recipientId: string, text: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({
  member,
  currentUser,
  users,
  tasks,
  deals,
  cases,
  events,
  documents,
  directMessages,
  onClose,
  onEdit,
  onScheduleMeeting,
  onAssignTask,
  onSendDirectMessage,
  onUpdateTask,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'deals' | 'cases' | 'calendar' | 'messages'
  >('overview');

  const [messageInput, setMessageInput] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'in_progress' | 'completed' | 'overdue'>('all');

  const isEditable = canEditUser(currentUser, member);
  const isSelf = currentUser.id === member.id;

  const stats = calculateMemberStats(member, tasks, deals, cases, events);
  const statusInfo =
    USER_STATUSES.find((s) => s.value === member.status) || USER_STATUSES[0];

  const manager = member.managerId
    ? users.find((u) => u.id === member.managerId)
    : undefined;

  // Direct messages with this member
  const conversation = useMemo(() => {
    return directMessages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.recipientId === member.id) ||
          (m.senderId === member.id && m.recipientId === currentUser.id)
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [directMessages, currentUser.id, member.id]);

  // Tasks for this member
  const memberTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const userTasks = tasks.filter((t) => !t.deletedAt && t.assigneeId === member.id);

    if (taskFilter === 'completed') {
      return userTasks.filter((t) => t.status === 'Completed');
    }
    if (taskFilter === 'in_progress') {
      return userTasks.filter((t) => t.status !== 'Completed');
    }
    if (taskFilter === 'overdue') {
      return userTasks.filter((t) => t.status !== 'Completed' && t.deadline && t.deadline < today);
    }
    return userTasks;
  }, [tasks, member.id, taskFilter]);

  // Deals for this member
  const memberDeals = useMemo(() => {
    return deals.filter((d) => !d.deletedAt && d.ownerId === member.id);
  }, [deals, member.id]);

  // Cases for this member
  const memberCases = useMemo(() => {
    return cases.filter(
      (c) =>
        !c.deletedAt &&
        (c.ownerId === member.id || (c.teamMemberIds && c.teamMemberIds.includes(member.id)))
    );
  }, [cases, member.id]);

  // Events for this member
  const memberEvents = useMemo(() => {
    return events
      .filter(
        (e) =>
          !e.deletedAt &&
          ((e.participantIds && e.participantIds.includes(member.id)) || e.ownerId === member.id)
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.startTime.localeCompare(b.startTime));
  }, [events, member.id]);

  // Documents
  const memberDocs = useMemo(() => {
    return documents.filter((d) => d.uploadedBy === member.name || d.uploadedBy === member.email);
  }, [documents, member]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(member.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    if (member.phone) {
      navigator.clipboard.writeText(member.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendDirectMessage(member.id, messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-slate-900 ${statusInfo.dotColor}`}
                  title={`Status: ${statusInfo.label}`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">{member.name}</h2>
                  {isSelf && (
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-900/60 border border-indigo-700/60 px-2 py-0.5 rounded">
                      Current User
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${statusInfo.badgeBg} ${statusInfo.badgeText}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <p className="text-slate-300 text-xs mt-1">
                  {member.jobTitle || 'Team Member'} · {member.department || 'Operations'}
                </p>

                {member.statusMessage && (
                  <p className="text-slate-400 text-xs italic mt-1">
                    "{member.statusMessage}"
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {isEditable && (
                <button
                  onClick={() => onEdit(member)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              )}

              <button
                onClick={() => onScheduleMeeting(member)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Calendar size={13} />
                <span>Book Meeting</span>
              </button>
            </div>
          </div>

          {/* Quick Contact & Presence Row */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4 flex-wrap text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              <span>{member.email}</span>
              <button
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-white ml-1"
                title="Copy email"
              >
                {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>

            {member.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>{member.phone}</span>
                <button
                  onClick={handleCopyPhone}
                  className="text-slate-400 hover:text-white ml-1"
                  title="Copy phone"
                >
                  {copiedPhone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            )}

            {member.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{member.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              <span>
                Hours: {member.preferences.workingDayStart || '09:00'} -{' '}
                {member.preferences.workingDayEnd || '17:00'} ({member.preferences.timeZone})
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Profile', icon: UserCheck },
            { id: 'tasks', label: `Tasks (${stats.totalTasks})`, icon: CheckSquare },
            { id: 'deals', label: `Pipeline (${memberDeals.length})`, icon: Briefcase },
            { id: 'cases', label: `Cases (${memberCases.length})`, icon: LifeBuoy },
            { id: 'calendar', label: `Events (${memberEvents.length})`, icon: Calendar },
            { id: 'messages', label: `Messages (${conversation.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">
                    Task Execution
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {stats.completionRate}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {stats.completedTasks} of {stats.totalTasks} completed
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">
                    Open Deals
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {stats.openDealsCount}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    ${stats.openDealsValue.toLocaleString()} active value
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">
                    Support Cases
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {stats.openCasesCount}
                  </div>
                  <span className="text-[11px] text-slate-500">Open service tickets</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">
                    System Role
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5 capitalize flex items-center gap-1">
                    <Shield size={16} className="text-indigo-600" />
                    {member.role}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {member.role === 'admin'
                      ? 'Full admin access'
                      : member.role === 'manager'
                      ? 'Team supervisor'
                      : 'Standard colleague'}
                  </span>
                </div>
              </div>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Bio & Skills */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs mb-1.5">
                      Professional Background
                    </h4>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                      {member.bio ||
                        `${member.name} serves as ${member.jobTitle || 'Team Member'} in the ${
                          member.department || 'Operations'
                        } department at Apex Global Solutions.`}
                    </p>
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs mb-1.5">
                        Skills & Domain Expertise
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {member.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-200/70"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Operational Details */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="font-semibold text-slate-900 text-xs pb-1 border-b border-slate-200">
                    Operational Information
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Department
                      </span>
                      <span className="font-medium text-slate-800">
                        {member.department || 'Operations'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Reporting Line / Manager
                      </span>
                      <span className="font-medium text-slate-800">
                        {manager ? manager.name : 'Executive / Direct'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Joined Date
                      </span>
                      <span className="font-medium text-slate-800">
                        {member.joinedDate || '2023-01-15'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Account Currency
                      </span>
                      <span className="font-medium text-slate-800">
                        {member.preferences.defaultCurrency || 'USD'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Time Zone
                      </span>
                      <span className="font-medium text-slate-800">
                        {member.preferences.timeZone}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Activity Status
                      </span>
                      <span
                        className={`font-semibold ${
                          member.active ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {member.active ? 'Active Employee' : 'Deactivated'}
                      </span>
                    </div>
                  </div>

                  {memberDocs.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                        Authored Documents ({memberDocs.length})
                      </span>
                      <div className="space-y-1">
                        {memberDocs.slice(0, 3).map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between text-[11px] text-slate-600"
                          >
                            <span className="truncate flex items-center gap-1">
                              <FileText size={11} className="text-indigo-600 shrink-0" />
                              <span className="truncate">{doc.title}</span>
                            </span>
                            <span className="text-slate-400 text-[10px]">v{doc.version}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & PROGRESS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'in_progress', 'completed', 'overdue'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        taskFilter === filter
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {filter === 'all'
                        ? `All (${stats.totalTasks})`
                        : filter === 'in_progress'
                        ? `In Progress (${stats.inProgressTasks})`
                        : filter === 'completed'
                        ? `Completed (${stats.completedTasks})`
                        : `Overdue (${stats.overdueTasks})`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onAssignTask(member)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition-colors self-start sm:self-auto shrink-0"
                >
                  <Plus size={13} />
                  <span>Assign Task</span>
                </button>
              </div>

              {/* Tasks List */}
              {memberTasks.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckSquare size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">No tasks found matching this filter.</p>
                  <button
                    onClick={() => onAssignTask(member)}
                    className="mt-3 text-indigo-600 hover:underline font-semibold text-xs"
                  >
                    + Assign a task to {member.name}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';
                    const isOverdue =
                      !isCompleted &&
                      task.deadline &&
                      task.deadline < new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-slate-50/60 border-slate-200 opacity-80'
                            : isOverdue
                            ? 'bg-rose-50/40 border-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={(e) => {
                                onUpdateTask(task.id, {
                                  status: e.target.checked ? 'Completed' : 'In Progress',
                                  completionPercentage: e.target.checked ? 100 : 50,
                                });
                              }}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                            />
                            <div className="min-w-0">
                              <h5
                                className={`font-semibold text-slate-900 text-xs ${
                                  isCompleted ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {task.title}
                              </h5>
                              {task.description && (
                                <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                <span>Due: {task.deadline}</span>
                                {isOverdue && (
                                  <span className="text-rose-600 font-semibold">· Overdue</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isOverdue
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {task.status} ({task.completionPercentage || 0}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress slider / bar */}
                        {!isCompleted && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Progress:</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${task.completionPercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-700">
                              {task.completionPercentage || 0}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Pipeline Managed by {member.name}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Total {memberDeals.length} deals in commercial lifecycle
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Pipeline
                  </span>
                  <span className="text-sm font-bold text-indigo-700">
                    ${stats.openDealsValue.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {memberDeals.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">No deals currently assigned to this colleague.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <h5 className="font-semibold text-slate-900 truncate">{deal.title}</h5>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">
                          {deal.product} · Expected: {deal.expectedCloseDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            deal.status === 'won'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : deal.status === 'lost'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {deal.stage}
                        </span>

                        <span className="font-bold text-slate-900 text-xs">
                          ${(deal.value || 0).toLocaleString()} {deal.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CASES */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Support Cases & Customer Triage
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Cases assigned or co-handled by {member.name}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-xs">
                  {memberCases.length} total cases
                </span>
              </div>

              {memberCases.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <LifeBuoy size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">No open cases assigned to this member.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberCases.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-semibold text-slate-900 truncate">{c.title}</h5>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : c.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{c.problemName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CALENDAR / EVENTS */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">
                    Upcoming Meetings & Scheduled Engagements
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Events involving {member.name}
                  </p>
                </div>

                <button
                  onClick={() => onScheduleMeeting(member)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus size={13} />
                  <span>Book Meeting</span>
                </button>
              </div>

              {memberEvents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Calendar size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">No upcoming meetings scheduled for this colleague.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <h5 className="font-semibold text-slate-900 truncate">{evt.title}</h5>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">
                          {evt.startDate} at {evt.startTime || '09:00'} · Duration:{' '}
                          {evt.durationMinutes || 30} mins
                        </p>
                        {evt.location && (
                          <span className="text-slate-400 text-[10px] block mt-0.5 truncate">
                            📍 {evt.location}
                          </span>
                        )}
                      </div>

                      <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px] shrink-0 border border-indigo-200">
                        {evt.meetingStatus || 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DIRECT MESSAGING */}
          {activeTab === 'messages' && (
            <div className="flex flex-col h-[400px]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                {conversation.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No message history with {member.name} yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Send a message below to start an internal collaboration thread.
                    </p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isFromMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isFromMe ? 'You' : msg.senderName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isFromMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Send direct message to ${member.name}...`}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px]">
            Viewing member ID: <code className="text-slate-700 font-mono">{member.id}</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
