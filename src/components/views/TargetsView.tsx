import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Target as TargetIcon, Plus, TrendingUp, Users, Calendar, CheckCircle2, Shield } from 'lucide-react';
import { Target as TargetType } from '../../types';

export const TargetsView: React.FC = () => {
  const { targets, deals, cases, users, currentUser, addTarget } = useCRM();

  const [showAddModal, setShowAddModal] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [targetType, setTargetType] = useState<'revenue' | 'cases_resolved' | 'units_sold'>('revenue');
  const [targetPeriod, setTargetPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [targetGoal, setTargetGoal] = useState('500000');
  const [targetAssignees, setTargetAssignees] = useState<string[]>([currentUser.id]);

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Calculate live progress (FR-14.2)
  const targetCalculations = useMemo(() => {
    return targets.map((t: TargetType) => {
      let actual = 0;
      if (t.type === 'revenue') {
        const wonDeals = deals.filter(
          (d) => !d.deletedAt && d.status === 'won' && t.assignedUserIds.includes(d.ownerId)
        );
        actual = wonDeals.reduce((sum, d) => sum + d.value, 0);
      } else if (t.type === 'cases_resolved') {
        const closedCases = cases.filter(
          (c) => !c.deletedAt && c.status === 'Closed' && t.assignedUserIds.includes(c.ownerId)
        );
        actual = closedCases.length;
      } else {
        const wonDeals = deals.filter(
          (d) => !d.deletedAt && d.status === 'won' && t.assignedUserIds.includes(d.ownerId)
        );
        actual = wonDeals.length;
      }

      const percent = Math.min(Math.round((actual / t.goalValue) * 100), 100);
      return {
        ...t,
        actual,
        percent,
      };
    });
  }, [targets, deals, cases]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;
    addTarget({
      name: targetName.trim(),
      type: targetType,
      period: targetPeriod,
      goalValue: Number(targetGoal) || 100000,
      assignedUserIds: targetAssignees,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowAddModal(false);
    setTargetName('');
  };

  return (
    <div id="targets-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales & Support Targets</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Progress Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track sales revenue attainment and support case resolution quotas with auto-calculated achievement percentages (FR-14.2).
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            id="add-target-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Create Target</span>
          </button>
        )}
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targetCalculations.map((t) => {
          const assignees = users.filter((u) => t.assignedUserIds.includes(u.id));

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {t.period}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Metric: {t.type === 'revenue' ? 'Closed Won Deal Value' : t.type === 'cases_resolved' ? 'Resolved Support Tickets' : 'Units Sold'}
                  </p>
                </div>
                <span className="text-lg font-bold text-indigo-600">{t.percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${t.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-medium text-[11px] text-slate-600">
                  <span>
                    Actual:{' '}
                    <strong>
                      {t.type === 'revenue' ? `$${t.actual.toLocaleString()}` : `${t.actual} ${t.type === 'cases_resolved' ? 'cases' : 'units'}`}
                    </strong>
                  </span>
                  <span>
                    Goal:{' '}
                    <strong>
                      {t.type === 'revenue' ? `$${t.goalValue.toLocaleString()}` : `${t.goalValue} ${t.type === 'cases_resolved' ? 'cases' : 'units'}`}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Assignees */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Assigned Team:</span>
                <div className="flex items-center gap-1">
                  {assignees.map((u) => (
                    <span
                      key={u.id}
                      className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold"
                      title={u.name}
                    >
                      {u.name.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Define New Team Target (FR-14.1)</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Name *</label>
              <input
                type="text"
                required
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Q3 Strategic Expansion Quota"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Metric</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="revenue">Deal Value Won ($)</option>
                  <option value="cases_resolved">Resolved Support Cases</option>
                  <option value="units_sold">Deals Closed (Units)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Period</label>
                <select
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Annual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Goal Value</label>
              <input
                type="number"
                required
                min="1"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Assigned Colleagues</label>
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 border border-slate-200 rounded-lg bg-slate-50">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={targetAssignees.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetAssignees([...targetAssignees, u.id]);
                        } else {
                          setTargetAssignees(targetAssignees.filter((id) => id !== u.id));
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span>{u.name} ({u.role})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Save Target
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
