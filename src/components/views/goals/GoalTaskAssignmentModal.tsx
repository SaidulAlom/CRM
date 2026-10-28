import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { TargetPriority, TargetPeriod, TargetType, Task } from '../../../types';
import {
  X,
  Target,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GoalTaskAssignmentModalProps {
  onClose: () => void;
  onGoalCreated?: (goalId: string) => void;
}

interface NewTaskItem {
  id: string;
  title: string;
  assigneeId: string;
  deadline: string;
  isMandatory: boolean;
  requiresApproval: boolean;
  description: string;
}

export const GoalTaskAssignmentModal: React.FC<GoalTaskAssignmentModalProps> = ({
  onClose,
  onGoalCreated,
}) => {
  const { users, currentUser, createGoalWithTasks } = useCRM();

  // Goal Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TargetType>('revenue');
  const [goalValue, setGoalValue] = useState<number>(100000);
  const [currency, setCurrency] = useState('USD');
  const [customKpiName, setCustomKpiName] = useState('');
  const [customKpiUnit, setCustomKpiUnit] = useState('');
  const [period, setPeriod] = useState<TargetPeriod>('quarter');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [department, setDepartment] = useState('Sales & Revenue');
  const [priority, setPriority] = useState<TargetPriority>('High');
  const [successCriteria, setSuccessCriteria] = useState(
    'All mandatory verification tasks must be completed and approved by manager, and target revenue quota attained.'
  );
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([currentUser.id]);

  // Tasks Breakdown
  const [tasks, setTasks] = useState<NewTaskItem[]>([
    {
      id: `task-item-1`,
      title: 'Identify and qualify top 5 enterprise opportunities in pipeline',
      assigneeId: users[1]?.id || currentUser.id,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      isMandatory: true,
      requiresApproval: true,
      description: 'Audit CRM deals and confirm decision-maker engagement.',
    },
    {
      id: `task-item-2`,
      title: 'Conduct executive sponsor presentations & security review',
      assigneeId: users[2]?.id || currentUser.id,
      deadline: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
      isMandatory: true,
      requiresApproval: true,
      description: 'Present architecture and pricing concession terms.',
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleUserAssignment = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      if (assignedUserIds.length === 1) {
        setError('At least one team member must be assigned to the goal.');
        return;
      }
      setAssignedUserIds(assignedUserIds.filter((id) => id !== userId));
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
      setError(null);
    }
  };

  const handleAddTask = () => {
    const newTask: NewTaskItem = {
      id: `task-item-${Date.now()}`,
      title: '',
      assigneeId: assignedUserIds[0] || currentUser.id,
      deadline: endDate,
      isMandatory: true,
      requiresApproval: true,
      description: '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<NewTaskItem>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length === 1) {
      setError('A goal must contain at least one actionable task for execution.');
      return;
    }
    setTasks(tasks.filter((t) => t.id !== id));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Goal title is required.');
      return;
    }
    if (goalValue <= 0) {
      setError('Target metric value must be greater than zero.');
      return;
    }
    if (assignedUserIds.length === 0) {
      setError('Please assign at least one agent to this goal.');
      return;
    }
    // Check if tasks are filled
    const invalidTask = tasks.find((t) => !t.title.trim());
    if (invalidTask) {
      setError('Please provide a title for all assigned tasks.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { goal, tasks: createdTasks } = createGoalWithTasks(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          type,
          goalValue,
          currency,
          customKpiName: type === 'custom_kpi' ? customKpiName : undefined,
          customKpiUnit: type === 'custom_kpi' ? customKpiUnit : undefined,
          period,
          startDate,
          endDate,
          assignedUserIds,
          department,
          priority,
          status: 'Active',
          successCriteria: successCriteria.trim() || undefined,
        },
        tasks.map((t) => ({
          title: t.title.trim(),
          assigneeId: t.assigneeId,
          deadline: t.deadline,
          isMandatory: t.isMandatory,
          requiresApproval: t.requiresApproval,
          description: t.description.trim() || undefined,
          status: 'Pending',
          completionPercentage: 0,
        }))
      );

      setIsSubmitting(false);
      if (onGoalCreated) onGoalCreated(goal.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create goal and assign tasks.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Target size={22} className="text-indigo-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                Goal Achievement & Task Assignment System
              </div>
              <h2 className="text-base font-bold text-white">Create Goal & Break Down Tasks for Agents</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Goal Definition */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">1. Goal Definition & Measurable Target</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block font-bold text-slate-800">
                  Goal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Strategic Enterprise Revenue Acceleration"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block font-bold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the strategic business outcome, territory focus, or initiative context..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Metric Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TargetType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                >
                  <option value="revenue">Revenue Target ($ ARR/MRR)</option>
                  <option value="deals_closed">Deals Closed (Volume)</option>
                  <option value="units_sold">Software/Hardware Units Sold</option>
                  <option value="new_customers">New Customers Acquired</option>
                  <option value="cases_resolved">Support Tickets Resolved</option>
                  <option value="custom_kpi">Custom Measurable KPI</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Measurable Target Value <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {type === 'revenue' && (
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-24 px-2 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  )}
                  <input
                    type="number"
                    min="1"
                    value={goalValue}
                    onChange={(e) => setGoalValue(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>

              {type === 'custom_kpi' && (
                <>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Custom KPI Name</label>
                    <input
                      type="text"
                      value={customKpiName}
                      onChange={(e) => setCustomKpiName(e.target.value)}
                      placeholder="e.g. Demos Scheduled, Executive Calls"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Unit Label</label>
                    <input
                      type="text"
                      value={customKpiUnit}
                      onChange={(e) => setCustomKpiUnit(e.target.value)}
                      placeholder="e.g. demos, calls, audits"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Period & Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as TargetPeriod)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                    <option value="year">Annual</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TargetPriority)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Start & End Deadline</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block font-bold text-slate-800">Success Criteria & Definition of Done</label>
                <input
                  type="text"
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  placeholder="Explicit conditions required before the goal is declared Achieved..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Responsible Agents Selection */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Responsible Team Members & Agents ({assignedUserIds.length} assigned)
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto">
                  {users.map((u) => {
                    const isSelected = assignedUserIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => toggleUserAssignment(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] opacity-75">({u.role})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Task Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  2. Actionable Task Breakdown ({tasks.length} tasks, {tasks.filter((t) => t.isMandatory).length} mandatory)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Every goal must be linked to specific tasks assigned to responsible agents. Mandatory tasks require manager review and verified completion before this goal can be marked <strong className="text-emerald-700">Achieved</strong>.
            </p>

            <div className="space-y-3">
              {tasks.map((taskItem, index) => (
                <div
                  key={taskItem.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      Task #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(taskItem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Remove task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Task Action / Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={taskItem.title}
                        onChange={(e) => handleUpdateTask(taskItem.id, { title: e.target.value })}
                        placeholder="e.g. Schedule and conduct executive product demo"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Assignee Agent</label>
                      <select
                        value={taskItem.assigneeId}
                        onChange={(e) => handleUpdateTask(taskItem.id, { assigneeId: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Deadline</label>
                      <input
                        type="date"
                        value={taskItem.deadline}
                        onChange={(e) => handleUpdateTask(taskItem.id, { deadline: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold">
                        <input
                          type="checkbox"
                          checked={taskItem.isMandatory}
                          onChange={(e) => handleUpdateTask(taskItem.id, { isMandatory: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Mandatory for Goal Achievement</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold">
                        <input
                          type="checkbox"
                          checked={taskItem.requiresApproval}
                          onChange={(e) => handleUpdateTask(taskItem.id, { requiresApproval: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Requires Manager Sign-off</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Rules Summary Banner */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-indigo-600" />
              Automated Integrity Rules
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-900">
              <li>Creating this goal assigns the tasks to agents with initial 0% progress.</li>
              <li>A goal will NOT become Achieved simply by clicking a button.</li>
              <li>Every mandatory task must be submitted with evidence and approved by a manager.</li>
              <li>When all mandatory tasks are verified and the numerical target is fulfilled, the goal automatically transitions to Achieved.</li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Creating Goal & Tasks...' : 'Create Goal & Assign Tasks'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
