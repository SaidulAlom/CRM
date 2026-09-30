import React, { useState, useMemo } from 'react';
import { Target, User, TargetHistoryItem } from '../../../types';
import { TargetCalculation } from './targetUtils';
import {
  History,
  Search,
  Filter,
  User as UserIcon,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface TargetAuditHistoryTabProps {
  targets: Target[];
  users: User[];
  onSelectTarget: (calc: TargetCalculation) => void;
  calculations: TargetCalculation[];
}

export const TargetAuditHistoryTab: React.FC<TargetAuditHistoryTabProps> = ({
  targets,
  users,
  onSelectTarget,
  calculations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Flatten all target history records across all targets
  const allHistory = useMemo(() => {
    const list: (TargetHistoryItem & { targetName: string; targetId: string })[] = [];

    targets.forEach((t) => {
      if (t.history && t.history.length > 0) {
        t.history.forEach((h) => {
          list.push({
            ...h,
            targetName: t.name,
            targetId: t.id,
          });
        });
      }
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [targets]);

  const filteredHistory = useMemo(() => {
    return allHistory.filter((item) => {
      if (actionFilter !== 'all' && item.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.targetName.toLowerCase().includes(q) ||
          item.actorName.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allHistory, actionFilter, searchQuery]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'value_changed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'status_changed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'members_changed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'achievement_overridden':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'notification_sent':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History size={18} className="text-indigo-600" />
            <span>Target History & Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log recording who created, modified, reallocated quotas, and adjusted status across all targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-60 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="value_changed">Target Value Changed</option>
            <option value="status_changed">Status Changed</option>
            <option value="members_changed">Members Changed</option>
            <option value="achievement_overridden">Progress Overridden</option>
            <option value="notification_sent">Reminder / Alert Sent</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 text-slate-500 text-xs">
            No audit records match your current filter criteria.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const relatedCalc = calculations.find((c) => c.target.id === item.targetId);

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 transition-colors space-y-1.5 text-xs text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getActionBadge(
                        item.action
                      )}`}
                    >
                      {item.action.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => relatedCalc && onSelectTarget(relatedCalc)}
                      className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs text-left"
                    >
                      {item.targetName}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-600 text-xs">{item.details}</p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} className="text-slate-400" />
                    <span>Logged by:</span>
                    <strong className="text-slate-600">{item.actorName}</strong>
                    <span>(ID: {item.actorId})</span>
                  </div>

                  {relatedCalc && (
                    <button
                      onClick={() => onSelectTarget(relatedCalc)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <span>View Target</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
