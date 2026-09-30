import React, { useState, useEffect, useMemo } from 'react';
import { User, UserPreferences, AuditLogItem, Organisation } from '../../../types';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Shield,
  Activity,
  UserCheck,
  Briefcase,
  Users,
  CheckSquare,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDateDisplay, formatTimeDisplay } from '../../../utils/profileUtils';

interface ActivityHistorySectionProps {
  targetUser: User;
  organisation: Organisation;
  auditLogs: AuditLogItem[];
  onSavePreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
  onSaveOrganisation: (updates: Partial<Organisation>) => void;
  onPurgeLogs?: (days: number) => void;
  isAdmin: boolean;
}

const RETENTION_OPTIONS = [
  { days: 7, label: 'Last 7 Days', desc: 'Short-term rolling activity log' },
  { days: 30, label: 'Last 30 Days (Default)', desc: 'Standard monthly operational history' },
  { days: 90, label: 'Last 90 Days (Quarterly)', desc: 'Quarterly compliance and target audit' },
  { days: 180, label: 'Last 6 Months', desc: 'Semi-annual historical visibility' },
  { days: 365, label: 'Last 1 Year', desc: 'Annual operational audit record' },
  { days: 99999, label: 'All Available History', desc: 'Unlimited lifetime CRM activity log' },
];

export const ActivityHistorySection: React.FC<ActivityHistorySectionProps> = ({
  targetUser,
  organisation,
  auditLogs,
  onSavePreferences,
  onSaveOrganisation,
  onPurgeLogs,
  isAdmin,
}) => {
  const currentPrefs = targetUser.preferences;

  const [activityDepth, setActivityDepth] = useState<number>(currentPrefs.activityDepth || 30);
  const [adminRetentionPolicy, setAdminRetentionPolicy] = useState<number>(
    organisation.dataRetentionPolicyDays || 0
  );

  // Search & Filtering in Viewer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'user' | 'deal' | 'task' | 'meeting' | 'system'>('all');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setActivityDepth(currentPrefs.activityDepth || 30);
    setAdminRetentionPolicy(organisation.dataRetentionPolicyDays || 0);
    setIsDirty(false);
  }, [targetUser, organisation]);

  const handleDepthChange = (days: number) => {
    setActivityDepth(days);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setActivityDepth(currentPrefs.activityDepth || 30);
    setAdminRetentionPolicy(organisation.dataRetentionPolicyDays || 0);
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Activity settings reset.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSavePreferences(targetUser.id, {
      activityDepth,
    });

    if (isAdmin) {
      onSaveOrganisation({
        dataRetentionPolicyDays: adminRetentionPolicy,
      });
    }

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Activity history depth set to ${
        activityDepth === 99999 ? 'Unlimited' : `${activityDepth} days`
      }.`,
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  const handlePurgeLogs = () => {
    if (adminRetentionPolicy <= 0) {
      alert('Please select a specific retention duration before purging historical logs.');
      return;
    }
    if (
      confirm(
        `Are you sure you want to purge audit logs older than ${adminRetentionPolicy} days? This action cannot be undone.`
      )
    ) {
      onPurgeLogs?.(adminRetentionPolicy);
      setFeedback({
        type: 'success',
        message: `Historical audit logs older than ${adminRetentionPolicy} days have been purged.`,
      });
    }
  };

  // Filter logs by depth and search query
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const cutoffMs = activityDepth === 99999 ? 0 : now - activityDepth * 24 * 60 * 60 * 1000;

    return auditLogs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      if (cutoffMs > 0 && logTime < cutoffMs) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const act = log.action.toLowerCase();
        if (selectedCategory === 'user' && !act.includes('user') && !act.includes('profile'))
          return false;
        if (selectedCategory === 'deal' && !act.includes('deal') && !act.includes('target'))
          return false;
        if (selectedCategory === 'task' && !act.includes('task')) return false;
        if (selectedCategory === 'meeting' && !act.includes('meeting') && !act.includes('event'))
          return false;
        if (selectedCategory === 'system' && !act.includes('system') && !act.includes('retention') && !act.includes('org'))
          return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          (log.actorName && log.actorName.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [auditLogs, activityDepth, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Activity History & Audit Preferences</h2>
            <p className="text-xs text-slate-500">
              Configure how much past operational history is retained and rendered throughout your CRM dashboards and record timelines.
            </p>
          </div>
        </div>

        {isDirty && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Retention Depth Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Display History Duration
              </h3>
              <p className="text-xs text-slate-500">
                Choose the timeframe of activity history loaded into your dashboards and streams
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Current: {RETENTION_OPTIONS.find((r) => r.days === activityDepth)?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RETENTION_OPTIONS.map((opt) => {
              const isSelected = activityDepth === opt.days;
              return (
                <div
                  key={opt.days}
                  onClick={() => handleDepthChange(opt.days)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                    {isSelected && <CheckCircle2 size={15} className="text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Administrator Retention Policy & Purge */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-indigo-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Company-Wide Audit Retention Policy (Admin Authority)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Governance Control
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Automated Purge Horizon
                </label>
                <select
                  value={adminRetentionPolicy}
                  onChange={(e) => {
                    setAdminRetentionPolicy(parseInt(e.target.value, 10));
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                >
                  <option value={0}>Retain Indefinitely (No automatic deletion)</option>
                  <option value={30}>Purge logs older than 30 Days</option>
                  <option value={90}>Purge logs older than 90 Days (Quarterly)</option>
                  <option value={180}>Purge logs older than 180 Days (Semi-Annual)</option>
                  <option value={365}>Purge logs older than 1 Year (Annual)</option>
                </select>
              </div>

              <div className="flex flex-col sm:items-end justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handlePurgeLogs}
                  disabled={adminRetentionPolicy <= 0}
                  className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  <span>Purge Logs Now ({adminRetentionPolicy}d+)</span>
                </button>
                <span className="text-[10px] text-slate-400 mt-1">
                  Irreversibly deletes historical log records beyond selected horizon
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons for Preferences */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            <span>Cancel / Reset</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Activity Preferences</span>
          </button>
        </div>
      </form>

      {/* Embedded Live Activity History Viewer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Activity Log Stream ({filteredLogs.length} Records)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Audit trails of logins, contact updates, deal progress, tasks, and system actions
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'user', label: 'Users & Profile' },
            { id: 'deal', label: 'Deals & Targets' },
            { id: 'task', label: 'Tasks' },
            { id: 'meeting', label: 'Meetings & Events' },
            { id: 'system', label: 'System Actions' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Logs Table / List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const datePart = log.timestamp.split('T')[0];
              const timePart = log.timestamp.includes('T')
                ? log.timestamp.split('T')[1].substring(0, 5)
                : '12:00';

              return (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shrink-0 font-mono mt-0.5">
                      {log.action}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 leading-snug">
                        {log.details}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Actor: <strong className="text-slate-700">{log.actorName || 'System'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                    <div>{formatDateDisplay(datePart, currentPrefs.dateFormat)}</div>
                    <div>{formatTimeDisplay(timePart, currentPrefs.clockMode)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No activity logs match the selected timeframe and filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
