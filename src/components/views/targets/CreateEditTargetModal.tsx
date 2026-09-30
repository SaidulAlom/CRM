import React, { useState, useEffect, useMemo } from 'react';
import { Target, TargetType, TargetPeriod, TargetPriority, TargetStatus, User } from '../../../types';
import {
  X,
  Target as TargetIcon,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Bell,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface CreateEditTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetData: Omit<Target, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTarget?: Target | null;
  users: User[];
  currentUser: User;
}

export const CreateEditTargetModal: React.FC<CreateEditTargetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTarget,
  users,
  currentUser,
}) => {
  if (!isOpen) return null;

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Form states
  const [name, setName] = useState(editingTarget?.name || '');
  const [description, setDescription] = useState(editingTarget?.description || '');
  const [type, setType] = useState<TargetType>(editingTarget?.type || 'revenue');
  const [customKpiName, setCustomKpiName] = useState(editingTarget?.customKpiName || '');
  const [customKpiUnit, setCustomKpiUnit] = useState(editingTarget?.customKpiUnit || '');
  const [goalValue, setGoalValue] = useState<string>(
    editingTarget?.goalValue !== undefined ? String(editingTarget.goalValue) : '500000'
  );
  const [currency, setCurrency] = useState(editingTarget?.currency || 'USD');
  const [period, setPeriod] = useState<TargetPeriod>(editingTarget?.period || 'quarter');
  const [startDate, setStartDate] = useState(
    editingTarget?.startDate || '2026-07-01'
  );
  const [endDate, setEndDate] = useState(
    editingTarget?.endDate || '2026-09-30'
  );
  const [department, setDepartment] = useState(
    editingTarget?.department || (currentUser.department || 'Sales & Revenue')
  );
  const [priority, setPriority] = useState<TargetPriority>(editingTarget?.priority || 'High');
  const [status, setStatus] = useState<TargetStatus>(editingTarget?.status || 'Active');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    editingTarget?.assignedUserIds || [currentUser.id]
  );

  // Notification toggles
  const [notifyAssignment, setNotifyAssignment] = useState(
    editingTarget?.notificationsConfig?.onAssignment ?? true
  );
  const [notifyMilestone, setNotifyMilestone] = useState(
    editingTarget?.notificationsConfig?.onMilestone ?? true
  );
  const [notifyDeadline, setNotifyDeadline] = useState(
    editingTarget?.notificationsConfig?.onApproachingDeadline ?? true
  );
  const [notifyFallingBehind, setNotifyFallingBehind] = useState(
    editingTarget?.notificationsConfig?.onFallingBehind ?? true
  );

  // Search & member filtering
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDepartmentFilter, setMemberDepartmentFilter] = useState('all');

  // Timeframe presets helper
  const applyTimeframePreset = (preset: 'month' | 'next_month' | 'quarter' | 'next_quarter' | 'year' | 'custom') => {
    const today = new Date('2026-09-28');
    const y = today.getFullYear();

    if (preset === 'month') {
      setPeriod('month');
      setStartDate(`${y}-09-01`);
      setEndDate(`${y}-09-30`);
    } else if (preset === 'next_month') {
      setPeriod('month');
      setStartDate(`${y}-10-01`);
      setEndDate(`${y}-10-31`);
    } else if (preset === 'quarter') {
      setPeriod('quarter');
      setStartDate(`${y}-07-01`);
      setEndDate(`${y}-09-30`);
    } else if (preset === 'next_quarter') {
      setPeriod('quarter');
      setStartDate(`${y}-10-01`);
      setEndDate(`${y}-12-31`);
    } else if (preset === 'year') {
      setPeriod('year');
      setStartDate(`${y}-01-01`);
      setEndDate(`${y}-12-31`);
    } else {
      setPeriod('custom');
    }
  };

  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (memberDepartmentFilter !== 'all' && u.department !== memberDepartmentFilter) return false;
      if (memberSearch.trim()) {
        const q = memberSearch.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, memberDepartmentFilter, memberSearch]);

  const handleSelectAllMembers = () => {
    const allFilteredIds = filteredUsers.map((u) => u.id);
    const combined = Array.from(new Set([...assignedUserIds, ...allFilteredIds]));
    setAssignedUserIds(combined);
  };

  const handleDeselectAllMembers = () => {
    const allFilteredIds = new Set(filteredUsers.map((u) => u.id));
    setAssignedUserIds(assignedUserIds.filter((id) => !allFilteredIds.has(id)));
  };

  const toggleMember = (uid: string) => {
    if (assignedUserIds.includes(uid)) {
      setAssignedUserIds(assignedUserIds.filter((id) => id !== uid));
    } else {
      setAssignedUserIds([...assignedUserIds, uid]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (assignedUserIds.length === 0) {
      alert('Please assign at least one team member to this target.');
      return;
    }

    const numericGoal = Number(goalValue) || 1;

    onSave(
      {
        name: name.trim(),
        description: description.trim(),
        type,
        customKpiName: type === 'custom_kpi' ? customKpiName.trim() : undefined,
        customKpiUnit: type === 'custom_kpi' ? customKpiUnit.trim() : undefined,
        goalValue: numericGoal,
        currency,
        period,
        startDate,
        endDate,
        department,
        priority,
        status,
        assignedUserIds,
        notificationsConfig: {
          onAssignment: notifyAssignment,
          onMilestone: notifyMilestone,
          onApproachingDeadline: notifyDeadline,
          onFallingBehind: notifyFallingBehind,
        },
      },
      editingTarget?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <TargetIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingTarget ? 'Edit Target & Quota' : 'Define Measurable Sales Target'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure goals, assignment rosters, timeframe periods, and automated CRM tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Section 1: Target Identity & Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Target Identity & Measurable Type
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 Strategic Revenue Expansion or Software Units Quota"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Description & Strategic Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the business motivation, compensation quota parameters, or team objective..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Type / Metric <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TargetType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="revenue">Revenue Target (Total Closed Deal Value)</option>
                  <option value="units_sold">Units Sold (Products / Licenses Count)</option>
                  <option value="deals_closed">Deals Closed (Closed Won Deals)</option>
                  <option value="cases_resolved">Customer Support Cases (Resolved Tickets)</option>
                  <option value="new_customers">New Customers (Converted Accounts)</option>
                  <option value="custom_kpi">Custom Measurable KPI (Custom Score / Index)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Value (Goal) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {type === 'revenue' && (
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-xs"
                    >
                      <option value="USD">$ USD</option>
                      <option value="INR">₹ INR</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  )}
                  <input
                    type="number"
                    required
                    min="1"
                    value={goalValue}
                    onChange={(e) => setGoalValue(e.target.value)}
                    placeholder="e.g. 500000"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {type === 'custom_kpi' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Custom KPI Metric Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customKpiName}
                      onChange={(e) => setCustomKpiName(e.target.value)}
                      placeholder="e.g. Client NPS Score, SLA %"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Measurement Unit
                    </label>
                    <input
                      type="text"
                      value={customKpiUnit}
                      onChange={(e) => setCustomKpiUnit(e.target.value)}
                      placeholder="e.g. points, %, ratings"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Timeframe & Department */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Timeframe Period & Department
              </h3>
            </div>

            {/* Quick timeframe preset buttons */}
            <div>
              <span className="block font-semibold text-slate-700 mb-1.5">
                Quick Timeframe Presets
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTimeframePreset('month')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    period === 'month' && startDate === '2026-09-01'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Current Month (Sept 2026)
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeframePreset('quarter')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    period === 'quarter' && startDate === '2026-07-01'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Q3 2026 (Jul - Sep)
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeframePreset('next_quarter')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    period === 'quarter' && startDate === '2026-10-01'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Q4 2026 (Oct - Dec)
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeframePreset('year')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    period === 'year'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Full Year 2026
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Period Category</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as TargetPeriod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Team</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="All Teams">All Organization Teams</option>
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TargetPriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TargetStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="Draft">Draft</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Completed">Completed</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Assign Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                  3
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Assign Team Members ({assignedUserIds.length} Selected)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllMembers}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Selected members pills */}
            {assignedUserIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {assignedUserIds.map((uid) => {
                  const u = users.find((item) => item.id === uid);
                  if (!u) return null;
                  return (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs shadow-2xs font-medium"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </span>
                      <span>{u.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(uid)}
                        className="text-slate-400 hover:text-rose-500 ml-0.5"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Member search and department filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search colleagues by name, email, or role..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <select
                value={memberDepartmentFilter}
                onChange={(e) => setMemberDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="all">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Members multi-select checklist */}
            <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredUsers.map((u) => {
                const isChecked = assignedUserIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isChecked ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMember(u.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {u.jobTitle || u.role} · {u.department || 'General'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                      {u.role}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Automated Notifications */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" />
              <h4 className="font-bold text-slate-800 text-xs">Automated Target Notifications</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAssignment}
                  onChange={(e) => setNotifyAssignment(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Notify colleagues on target assignment</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyMilestone}
                  onChange={(e) => setNotifyMilestone(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Send alerts on progress milestones (25%, 50%, 75%, 100%)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDeadline}
                  onChange={(e) => setNotifyDeadline(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Reminder when deadline is approaching (within 7 days)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyFallingBehind}
                  onChange={(e) => setNotifyFallingBehind(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Alert team when target is marked "At Risk"</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Target achievements automatically calculate from linked Deals & Cases.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={15} />
                <span>{editingTarget ? 'Update Target' : 'Create & Assign Target'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
