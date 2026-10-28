import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Task, TaskMilestone } from '../../types';
import { calculateTargetProgress } from './targets/targetUtils';
import { TargetMissionModal } from './targets/TargetMissionModal';
import { TaskEvidenceSubmissionModal } from './tasks/TaskEvidenceSubmissionModal';
import { TaskReviewModal } from './tasks/TaskReviewModal';
import { TaskBlockerModal } from './tasks/TaskBlockerModal';
import { GoalTaskAssignmentModal } from './goals/GoalTaskAssignmentModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Building2,
  Users,
  CheckCircle2,
  Trash2,
  Sliders,
  Flag,
  Swords,
  Target as TargetIcon,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
  Shield,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    companies,
    contacts,
    users,
    currentUser,
    updateTask,
    deleteTask,
    addTask,
    resumeTask,
    targets,
    deals,
    cases,
    moveDealStage,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
    setActiveNav,
  } = useCRM();

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'quests' | 'my' | 'review' | 'inprogress' | 'blocked' | 'completed' | 'overdue'
  >('all');
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showGoalTaskModal, setShowGoalTaskModal] = useState(false);
  const [submissionModalTask, setSubmissionModalTask] = useState<Task | null>(null);
  const [reviewModalTask, setReviewModalTask] = useState<Task | null>(null);
  const [blockerModalTask, setBlockerModalTask] = useState<Task | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    'task-quest-1': true,
  });
  const [victoryNotice, setVictoryNotice] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Target calculations for Mission Modal
  const targetCalculations = useMemo(() => {
    return targets.map((t) => calculateTargetProgress(t, deals, cases, contacts, users, '2026-09-28', tasks));
  }, [targets, deals, cases, contacts, users, tasks]);

  const questCount = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && (t.isTargetMission || !!t.targetId)).length;
  }, [tasks]);

  const pendingReviewCount = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && t.status === 'Under Review').length;
  }, [tasks]);

  const blockedCount = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && t.status === 'Blocked').length;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.deletedAt)
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.badgeUnlocked || '').toLowerCase().includes(q)
        );
      })
      .filter((t) => {
        if (filter === 'quests') return t.isTargetMission || !!t.targetId;
        if (filter === 'my') return t.assigneeId === currentUser.id;
        if (filter === 'review') return t.status === 'Under Review';
        if (filter === 'inprogress') return t.status === 'In Progress';
        if (filter === 'blocked') return t.status === 'Blocked';
        if (filter === 'completed') return t.status === 'Completed';
        if (filter === 'overdue') return t.status !== 'Completed' && t.deadline < today;
        return true;
      })
      .sort((a, b) => {
        // Put pending reviews and active target missions first
        if (a.status === 'Under Review' && b.status !== 'Under Review') return -1;
        if (a.status !== 'Under Review' && b.status === 'Under Review') return 1;
        if (a.isTargetMission && !b.isTargetMission) return -1;
        if (!a.isTargetMission && b.isTargetMission) return 1;
        return a.deadline.localeCompare(b.deadline);
      });
  }, [tasks, search, filter, currentUser.id, today]);

  const toggleMilestones = (taskId: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleToggleMilestone = (task: Task, milestoneId: string) => {
    if (!task.milestones || task.milestones.length === 0) return;

    const updatedMilestones: TaskMilestone[] = task.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const newPercent = Math.round((completedCount / updatedMilestones.length) * 100);
    const isCompleted = newPercent === 100;
    const newStatus = isCompleted ? 'Completed' : newPercent > 0 ? 'In Progress' : 'Pending';

    if (isCompleted && task.completionPercentage < 100) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
      setVictoryNotice(
        `🏆 Mission Accomplished! "${task.title}" is 100% complete. Claimed +${task.xpReward || 500} XP and unlocked ${task.badgeUnlocked || 'Target Champion'}!`
      );
    }

    updateTask(
      task.id,
      {
        milestones: updatedMilestones,
        completionPercentage: newPercent,
        status: newStatus,
      },
      `Milestone checked (${completedCount}/${updatedMilestones.length})`
    );
  };

  const handleMarkLinkedDealWon = (task: Task) => {
    if (!task.dealId) return;
    const deal = deals.find((d) => d.id === task.dealId);
    if (!deal) return;

    moveDealStage(task.dealId, 'won');

    // Auto mark all milestones completed
    const finishedMilestones = (task.milestones || []).map((m) => ({ ...m, completed: true }));

    updateTask(
      task.id,
      {
        completionPercentage: 100,
        status: 'Completed',
        milestones: finishedMilestones,
      },
      `Closed Deal "${deal.title}" Won to fulfill target`
    );

    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
      });
    } catch {
      // ignore
    }

    setVictoryNotice(
      `🎉 Deal "${deal.title}" Marked Won! Added $${deal.value.toLocaleString()} toward target and conquered mission!`
    );
  };

  return (
    <div id="tasks-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Victory Notification Banner */}
      {victoryNotice && (
        <div className="p-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy size={20} className="text-yellow-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                Quest Victory Alert
              </div>
              <div className="text-xs font-bold">{victoryNotice}</div>
            </div>
          </div>
          <button
            onClick={() => setVictoryNotice(null)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tasks & Activities</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredTasks.length} tasks
            </span>
            {pendingReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                <Clock size={12} className="text-amber-700" />
                {pendingReviewCount} Awaiting Review
              </span>
            )}
            {blockedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                <AlertTriangle size={12} className="text-rose-600" />
                {blockedCount} Blocked
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign, execute, and verify tasks linked to strategic goals. Evidence is required before work is approved and goal achievement is marked.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowGoalTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <TargetIcon size={15} />
              <span>Assign Goal Tasks</span>
            </button>
          )}

          {/* Launch Gamified Quest Button */}
          <button
            id="launch-target-quest-btn"
            onClick={() => setShowMissionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Swords size={15} />
            <span>Launch Target Quest</span>
            <Sparkles size={12} className="text-amber-300" />
          </button>

          <button
            id="create-task-btn"
            onClick={() => openQuickCreate('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Standard Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { id: 'all', label: 'All Tasks' },
              { id: 'my', label: 'My Tasks' },
              {
                id: 'review',
                label: `Review Queue (${pendingReviewCount})`,
                badge: pendingReviewCount > 0 ? 'bg-amber-500 text-white' : undefined,
              },
              { id: 'inprogress', label: 'In Progress' },
              {
                id: 'blocked',
                label: `Blocked (${blockedCount})`,
                badge: blockedCount > 0 ? 'bg-rose-500 text-white' : undefined,
              },
              { id: 'quests', label: `Quests (${questCount})` },
              { id: 'completed', label: 'Completed' },
              { id: 'overdue', label: 'Overdue' },
            ] as Array<{ id: string; label: string; badge?: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${tab.badge}`}>
                  ●
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, evidence, badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 w-8 text-center">★</th>
                <th className="px-4 py-3">Task & Details</th>
                <th className="px-4 py-3">Goal / Target Alignment</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status & Progress</th>
                <th className="px-4 py-3 text-right">Verification & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 space-y-2">
                    <p>No matching tasks found.</p>
                    <button
                      onClick={() => setShowGoalTaskModal(true)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-xs inline-flex items-center gap-1.5"
                    >
                      <TargetIcon size={13} />
                      <span>Create Goal & Assign Actionable Tasks</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isShortlisted = isItemShortlisted('task', t.id);
                  const company = companies.find((c) => c.id === t.companyId);
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  const target = targets.find((tar) => tar.id === t.targetId);
                  const deal = deals.find((d) => d.id === t.dealId);
                  const isOverdue = t.status !== 'Completed' && t.deadline < today;
                  const isMission = !!t.isTargetMission || !!t.targetId;
                  const isExpanded = !!expandedMilestones[t.id];
                  const hasMilestones = t.milestones && t.milestones.length > 0;
                  const completedMilestonesCount = hasMilestones ? t.milestones!.filter((m) => m.completed).length : 0;

                  const isUnderReview = t.status === 'Under Review';
                  const isBlocked = t.status === 'Blocked';
                  const isCompleted = t.status === 'Completed';

                  return (
                    <React.Fragment key={t.id}>
                      <tr
                        className={`transition-colors ${
                          isBlocked
                            ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                            : isUnderReview
                            ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                            : isMission
                            ? 'bg-gradient-to-r from-indigo-50/30 via-white to-purple-50/20 hover:bg-indigo-50/50 border-l-4 border-l-indigo-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td
                          className="px-3 py-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist({
                              type: 'task',
                              category: 'task',
                              id: t.id,
                              title: t.title,
                              subtitle: `${t.status} (${t.completionPercentage}%) · Due ${t.deadline}`,
                              referenceInfo: company?.name || `Due ${t.deadline}`,
                            });
                          }}
                        >
                          <button
                            id={`shortlist-btn-task-${t.id}`}
                            className={`p-1 rounded transition-colors ${
                              isShortlisted
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-slate-300 hover:text-amber-500'
                            }`}
                            title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                            aria-label={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                          >
                            <Flag size={14} className={isShortlisted ? 'text-amber-400 fill-amber-400' : ''} />
                          </button>
                        </td>

                        {/* Title & Badges */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {t.isMandatory !== false && target && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                  MANDATORY
                                </span>
                              )}

                              {t.requiresApproval !== false && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Shield size={10} />
                                  APPROVAL REQUIRED
                                </span>
                              )}

                              {isMission && t.isTargetMission && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-2xs">
                                  <Swords size={11} />
                                  TARGET QUEST
                                </span>
                              )}
                            </div>

                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{t.title}</span>
                            </div>

                            {t.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                            )}

                            {/* Blocker alert callout */}
                            {isBlocked && t.blockedReason && (
                              <div className="p-1.5 bg-rose-100 text-rose-900 rounded font-medium text-[11px] flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                                <span>Blocker: {t.blockedReason}</span>
                              </div>
                            )}

                            {/* Rejection revision callout */}
                            {t.rejectionReason && (
                              <div className="p-1.5 bg-amber-100 text-amber-900 rounded font-medium text-[11px] flex items-center gap-1.5">
                                <AlertCircle size={12} className="text-amber-600 shrink-0" />
                                <span>Revision Note: {t.rejectionReason}</span>
                              </div>
                            )}

                            {/* Milestones toggler */}
                            {hasMilestones && (
                              <button
                                onClick={() => toggleMilestones(t.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 pt-0.5"
                              >
                                <CheckSquare size={12} />
                                <span>
                                  Tactical Milestones ({completedMilestonesCount}/{t.milestones!.length} completed)
                                </span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Goal Alignment */}
                        <td className="px-4 py-3 text-slate-700">
                          <div className="space-y-1">
                            {target ? (
                              <div
                                onClick={() => setActiveNav('targets')}
                                className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-bold hover:underline cursor-pointer bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
                                title="Go to Targets module"
                              >
                                <TargetIcon size={11} className="text-indigo-600" />
                                <span className="truncate max-w-[150px]">{target.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">General Activity</span>
                            )}

                            {deal && (
                              <div
                                onClick={() => setActiveNav('deals')}
                                className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline cursor-pointer"
                              >
                                <Briefcase size={11} className="text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[150px]">
                                  {deal.title} (${deal.value.toLocaleString()})
                                </span>
                              </div>
                            )}

                            {company && (
                              <span
                                onClick={() => openRecordDetail('company', company.id)}
                                className="text-slate-600 hover:underline cursor-pointer font-medium text-[11px] block truncate max-w-[150px]"
                              >
                                {company.name}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold uppercase">
                              {assignee?.name?.substring(0, 2) || 'UN'}
                            </span>
                            <span>{assignee?.name || 'Unassigned'}</span>
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {t.deadline} {isOverdue && '(Overdue)'}
                          </span>
                        </td>

                        {/* Status & Progress */}
                        <td className="px-4 py-3">
                          <div className="space-y-1.5 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isUnderReview
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : isBlocked
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : t.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isUnderReview && <Clock size={10} />}
                                {isBlocked && <AlertTriangle size={10} />}
                                {isCompleted && <CheckCircle2 size={10} />}
                                {t.status}
                              </span>
                              <span className="font-bold text-slate-900">{t.completionPercentage}%</span>
                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500'
                                    : isUnderReview
                                    ? 'bg-amber-500'
                                    : isBlocked
                                    ? 'bg-rose-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${t.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Verification & Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Manager Review Action */}
                            {isUnderReview && isManagerOrAdmin && (
                              <button
                                onClick={() => setReviewModalTask(t)}
                                className="px-2.5 py-1 text-[11px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Review submitted work and approve or request revision"
                              >
                                <ShieldCheck size={12} />
                                <span>Review Work</span>
                              </button>
                            )}

                            {/* Agent Submit Evidence Action */}
                            {!isCompleted && !isUnderReview && !isBlocked && (
                              <button
                                onClick={() => setSubmissionModalTask(t)}
                                className="px-2.5 py-1 text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 font-bold transition-all flex items-center gap-1"
                                title="Submit deliverables and evidence for manager verification"
                              >
                                <FileCheck size={12} />
                                <span>Submit Evidence</span>
                              </button>
                            )}

                            {/* Report Blocker */}
                            {!isCompleted && !isBlocked && (
                              <button
                                onClick={() => setBlockerModalTask(t)}
                                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded font-semibold transition-colors"
                                title="Report an impediment blocking this task"
                              >
                                Blocker
                              </button>
                            )}

                            {/* Unblock & Resume */}
                            {isBlocked && (
                              <button
                                onClick={() => resumeTask(t.id)}
                                className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-bold transition-colors flex items-center gap-1"
                                title="Unblock task and return to In Progress"
                              >
                                <Play size={11} />
                                <span>Unblock</span>
                              </button>
                            )}

                            {/* Re-open completed */}
                            {isCompleted && isManagerOrAdmin && (
                              <button
                                onClick={() => updateTask(t.id, { completionPercentage: 0, status: 'Pending' }, 'Re-opened by manager')}
                                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold flex items-center gap-1"
                                title="Re-open task"
                              >
                                <RotateCcw size={10} />
                                <span>Re-open</span>
                              </button>
                            )}

                            {/* Delete Task */}
                            <button
                              onClick={() => {
                                if (confirm('Delete this task record?')) deleteTask(t.id);
                              }}
                              className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Interactive Milestone Checkpoints Drawer */}
                      {hasMilestones && isExpanded && (
                        <tr className="bg-indigo-950/5 border-b border-indigo-100">
                          <td colSpan={7} className="px-6 py-3">
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-3 shadow-inner">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <div className="flex items-center gap-2">
                                  <Swords size={14} className="text-amber-400" />
                                  <span>Tactical Milestone Checkpoints for "{t.title}"</span>
                                </div>
                                <span className="text-[11px] text-amber-400">
                                  {completedMilestonesCount} of {t.milestones!.length} Completed · +{t.xpReward || 500} XP
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {t.milestones!.map((m) => (
                                  <div
                                    key={m.id}
                                    onClick={() => handleToggleMilestone(t, m.id)}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                      m.completed
                                        ? 'bg-slate-800/90 border-emerald-500/50 text-emerald-300'
                                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={m.completed}
                                      onChange={() => {}}
                                      className="mt-0.5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`font-medium ${
                                          m.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                        }`}
                                      >
                                        {m.title}
                                      </div>
                                      {m.xpValue && (
                                        <span className="text-[10px] text-amber-400 font-semibold">
                                          +{m.xpValue} XP
                                        </span>
                                      )}
                                    </div>
                                    {m.completed && (
                                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                    )}
                                  </div>
                                ))}
                              </div>

                              {deal && deal.stage !== 'won' && (
                                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">
                                    Winning deal "{deal.title}" will complete all quest milestones instantly!
                                  </span>
                                  <button
                                    onClick={() => handleMarkLinkedDealWon(t)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Mark "{deal.title}" as Won & Conquer Quest</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {submissionModalTask && (
        <TaskEvidenceSubmissionModal
          task={submissionModalTask}
          onClose={() => setSubmissionModalTask(null)}
        />
      )}

      {reviewModalTask && (
        <TaskReviewModal
          task={reviewModalTask}
          onClose={() => setReviewModalTask(null)}
        />
      )}

      {blockerModalTask && (
        <TaskBlockerModal
          task={blockerModalTask}
          onClose={() => setBlockerModalTask(null)}
        />
      )}

      {showGoalTaskModal && (
        <GoalTaskAssignmentModal
          onClose={() => setShowGoalTaskModal(false)}
        />
      )}

      {/* Target Mission Creator Modal */}
      <TargetMissionModal
        isOpen={showMissionModal}
        onClose={() => setShowMissionModal(false)}
        allTargets={targetCalculations}
        targetCalculation={targetCalculations[0] || null}
        deals={deals}
        users={users}
        currentUser={currentUser}
        onDeployMission={(taskData) => {
          addTask(taskData);
          setFilter('quests');
        }}
      />
    </div>
  );
};
