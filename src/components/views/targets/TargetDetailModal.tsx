import React, { useState } from 'react';
import { Target, User } from '../../../types';
import { TargetCalculation, formatMetricValue, triggerFileDownload, generateTargetsExport } from './targetUtils';
import {
  X,
  Target as TargetIcon,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Bell,
  Download,
  Shield,
  FileText,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface TargetDetailModalProps {
  calculation: TargetCalculation | null;
  onClose: () => void;
  onEdit: (target: Target) => void;
  onDelete: (targetId: string) => void;
  onOverrideProgress: (targetId: string, manualValue: number, status?: Target['status'], note?: string) => void;
  onSendReminder: (targetId: string, customMessage?: string) => void;
  users: User[];
  currentUser: User;
}

export const TargetDetailModal: React.FC<TargetDetailModalProps> = ({
  calculation,
  onClose,
  onEdit,
  onDelete,
  onOverrideProgress,
  onSendReminder,
  users,
  currentUser,
}) => {
  if (!calculation) return null;

  const { target, actual, goal, remaining, percent, computedStatus, memberContributions, contributingRecords } =
    calculation;

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'records' | 'history'>('overview');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideValue, setOverrideValue] = useState(String(actual));
  const [overrideStatus, setOverrideStatus] = useState<Target['status']>(computedStatus);
  const [overrideNote, setOverrideNote] = useState('');

  const [showReminderPrompt, setShowReminderPrompt] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderSentNotice, setReminderSentNotice] = useState(false);

  // Status color styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'On Track':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'At Risk':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Upcoming':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Expired':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    onOverrideProgress(target.id, Number(overrideValue) || 0, overrideStatus, overrideNote);
    setShowOverrideModal(false);
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendReminder(target.id, reminderMessage.trim() || undefined);
    setShowReminderPrompt(false);
    setReminderSentNotice(true);
    setTimeout(() => setReminderSentNotice(false), 4000);
  };

  const handleExportSingle = () => {
    const { content, filename, mimeType } = generateTargetsExport([calculation], users, 'csv');
    triggerFileDownload(content, filename, mimeType);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {target.type.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(computedStatus)}`}>
                {computedStatus}
              </span>
              {target.priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(target.priority)}`}>
                  {target.priority} Priority
                </span>
              )}
              <span className="text-slate-400 text-xs">
                {target.department || 'All Departments'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{target.name}</h2>
            {target.description && (
              <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl">{target.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSingle}
              title="Export target data to CSV"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download size={16} />
            </button>

            {isManagerOrAdmin && (
              <>
                <button
                  onClick={() => onEdit(target)}
                  title="Edit Target"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete target "${target.name}"?`)) {
                      onDelete(target.id);
                      onClose();
                    }
                  }}
                  title="Delete Target"
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Reminder confirmation notification banner */}
        {reminderSentNotice && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Target progress notifications and reminders sent to assigned team members!</span>
            </div>
            <button onClick={() => setReminderSentNotice(false)} className="text-emerald-600 hover:text-emerald-800 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Primary Progress & Metric Stats Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Goal Target
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {formatMetricValue(goal, target.type, target.currency, target.customKpiUnit)}
            </div>
            <div className="text-[10px] text-slate-500">
              Period: {target.period.toUpperCase()} ({target.startDate} to {target.endDate})
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Current Achieved
            </span>
            <div className="text-base sm:text-lg font-bold text-indigo-600">
              {formatMetricValue(actual, target.type, target.currency, target.customKpiUnit)}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">
              {percent}% of quota completed
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Remaining Target
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-700">
              {formatMetricValue(remaining, target.type, target.currency, target.customKpiUnit)}
            </div>
            <div className="text-[10px] text-slate-500">
              {remaining === 0 ? 'Quota Fulfilled!' : 'To reach target'}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Time Remaining
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {calculation.timeRemainingDays} Days
            </div>
            <div className="text-[10px] text-slate-500">
              {calculation.elapsedDays} of {calculation.totalDays} days elapsed ({calculation.elapsedPercent}%)
            </div>
          </div>
        </div>

        {/* Progress Bar Gauge */}
        <div className="px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">Quota Attainment Gauge</span>
            <span className="font-bold text-indigo-600 text-sm">{percent}%</span>
          </div>
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent >= 100
                  ? 'bg-emerald-500'
                  : percent >= 70
                  ? 'bg-indigo-600'
                  : percent >= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'contributions'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Team Contributions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
                {memberContributions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Contributing CRM Records</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-[10px] text-indigo-700 font-bold">
                {contributingRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Target Audit History</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
                {target.history?.length || 0}
              </span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 py-2">
            {isManagerOrAdmin && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Sliders size={13} />
                <span>Override Status / Value</span>
              </button>
            )}
            <button
              onClick={() => setShowReminderPrompt(true)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Bell size={13} />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Target Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Target Type:</span>
                  <div className="font-bold text-slate-800 text-xs capitalize mt-0.5">
                    {target.type.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Timeframe Period:</span>
                  <div className="font-bold text-slate-800 text-xs capitalize mt-0.5">
                    {target.period} ({target.startDate} to {target.endDate})
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Department / Team:</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {target.department || 'All Organization Teams'}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Created Date:</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {target.createdAt?.split('T')[0]}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Assigned Colleagues:</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {target.assignedUserIds.length} Members
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Current Pacing Status:</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${computedStatus === 'Completed' ? 'bg-emerald-500' : computedStatus === 'On Track' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                    <span>{computedStatus}</span>
                  </div>
                </div>
              </div>

              {/* Pacing Analysis Info Box */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span>Automated Pacing & Achievement Intelligence</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Based on current progress ({percent}% achieved with {calculation.elapsedPercent}% of timeframe elapsed),
                  the target is currently evaluated as{' '}
                  <strong className="text-slate-900">{computedStatus}</strong>.
                  {percent >= 100
                    ? ' Full quota milestone has been surpassed! Great job.'
                    : computedStatus === 'On Track'
                    ? ' The team is on schedule to reach or exceed the target before deadline.'
                    : computedStatus === 'At Risk'
                    ? ' Achievement pace is trailing behind the elapsed time. Consider team follow-ups or coaching.'
                    : ' Active target in progression.'}
                </p>
              </div>

              {/* Assigned Members Quick Previews */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Assigned Team Members ({memberContributions.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memberContributions.map((m) => (
                    <div
                      key={m.user.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{m.user.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {m.user.jobTitle || m.user.role} · {m.user.department}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 text-xs">
                          {formatMetricValue(m.actual, target.type, target.currency, target.customKpiUnit)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {m.percent}% quota share
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contributions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Individual Member Contributions</h4>
                  <p className="text-xs text-slate-500">
                    Breakdown of actual results contributed toward the {formatMetricValue(goal, target.type, target.currency)} goal.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                {memberContributions.map((m) => (
                  <div key={m.user.id} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{m.user.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {m.user.jobTitle || m.user.role} · {m.user.department} · {m.recordsCount} contributing activities
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 text-sm">
                          {formatMetricValue(m.actual, target.type, target.currency, target.customKpiUnit)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Target Share: {formatMetricValue(m.shareGoal, target.type, target.currency, target.customKpiUnit)}
                        </div>
                      </div>
                    </div>

                    {/* Member Attainment Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Individual Attainment:</span>
                        <span className="font-bold text-slate-800">{m.percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, m.percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Linked CRM Activities ({contributingRecords.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Real deals, resolved customer cases, and converted accounts that contributed to this target's live progress.
                </p>
              </div>

              {contributingRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-semibold text-slate-700 text-xs">No CRM activities logged in this timeframe yet</div>
                  <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                    Deals marked as 'Won' or Support Cases marked as 'Resolved' within the target's date range and owned by assigned reps will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="p-3">Record Title</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Metric Contribution</th>
                        <th className="p-3">Owner / Rep</th>
                        <th className="p-3">Close / Resolution Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contributingRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{rec.title}</td>
                          <td className="p-3 capitalize text-slate-600">{rec.type}</td>
                          <td className="p-3 font-bold text-indigo-600">{rec.formattedValue}</td>
                          <td className="p-3 text-slate-700">{rec.ownerName}</td>
                          <td className="p-3 text-slate-500">{rec.date}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Target Audit Log & Change History</h4>
                <p className="text-xs text-slate-500">
                  Comprehensive audit trail of target creations, status modifications, quota changes, and alerts.
                </p>
              </div>

              {(!target.history || target.history.length === 0) ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No historical modifications recorded yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {target.history.map((h) => (
                    <div key={h.id} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                            {h.action.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-800">{h.actorName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-0.5">{h.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Target ID: <code className="font-mono text-slate-700">{target.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Manual Override Sub-Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleApplyOverride}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Manual Override Target Progress</h3>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Authorized managers and administrators can manually correct progress values or override target status with an audit record.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Achievement Value Override ({target.customKpiUnit || (target.type === 'revenue' ? target.currency : 'Units')})
              </label>
              <input
                type="number"
                required
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Override</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason / Audit Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Explain the business reason for this override..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Apply Override
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Send Reminder Sub-Modal */}
      {showReminderPrompt && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendReminderSubmit}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Broadcast Target Reminder</h3>
              <button
                type="button"
                onClick={() => setShowReminderPrompt(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Send an in-app notification to all {target.assignedUserIds.length} assigned team members regarding target pacing and upcoming deadlines.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Custom Reminder Note (Optional)
              </label>
              <textarea
                rows={3}
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder={`Reminder: We have achieved ${percent}% of our ${target.name} quota with ${calculation.timeRemainingDays} days remaining...`}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowReminderPrompt(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Bell size={13} />
                <span>Send Notifications</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
