import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Target, User } from '../../types';
import {
  calculateTargetProgress,
  formatMetricValue,
  TargetCalculation,
  generateTargetsExport,
  triggerFileDownload,
} from './targets/targetUtils';
import { CreateEditTargetModal } from './targets/CreateEditTargetModal';
import { TargetDetailModal } from './targets/TargetDetailModal';
import { HowToAchieveTargetsModal } from './targets/HowToAchieveTargetsModal';
import { TargetMissionModal } from './targets/TargetMissionModal';
import { GoalTaskAssignmentModal } from './goals/GoalTaskAssignmentModal';
import { GoalAchievementBlockerModal } from './goals/GoalAchievementBlockerModal';
import { TaskReviewModal } from './tasks/TaskReviewModal';
import { TaskEvidenceSubmissionModal } from './tasks/TaskEvidenceSubmissionModal';
import { TeamPerformanceTab } from './targets/TeamPerformanceTab';
import { IndividualPerformanceTab } from './targets/IndividualPerformanceTab';
import { TargetReportsTab } from './targets/TargetReportsTab';
import { TargetAuditHistoryTab } from './targets/TargetAuditHistoryTab';
import confetti from 'canvas-confetti';
import {
  Target as TargetIcon,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  DollarSign,
  Package,
  LifeBuoy,
  Briefcase,
  FileSpreadsheet,
  Award,
  RefreshCw,
  Bell,
  Sliders,
  ChevronRight,
  Shield,
  Eye,
  FileText,
  Compass,
  Swords,
  Sparkles,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  CheckSquare,
  XCircle,
} from 'lucide-react';

export const TargetsView: React.FC = () => {
  const {
    targets,
    deals,
    cases,
    contacts,
    users,
    tasks,
    currentUser,
    addTarget,
    updateTarget,
    deleteTarget,
    overrideTargetProgress,
    sendTargetReminder,
    resetTargetsToDefault,
    moveDealStage,
    setActiveNav,
    addTask,
  } = useCRM();

  // Role permissions
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'individual' | 'reports' | 'history'>('dashboard');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGoalTaskModal, setShowGoalTaskModal] = useState(false);
  const [showHowToAchieveModal, setShowHowToAchieveModal] = useState(false);
  const [showTargetMissionModal, setShowTargetMissionModal] = useState(false);
  const [blockerModalCalc, setBlockerModalCalc] = useState<TargetCalculation | null>(null);
  const [reviewModalTask, setReviewModalTask] = useState<any | null>(null);
  const [submissionModalTask, setSubmissionModalTask] = useState<any | null>(null);

  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<TargetCalculation | null>(null);
  const [selectedIndividualUser, setSelectedIndividualUser] = useState<User>(currentUser);

  // Filters for Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [onlyMyTargets, setOnlyMyTargets] = useState<boolean>(!isManagerOrAdmin);

  // Auto-calculate live progress for all targets using real CRM records and linked tasks
  const targetCalculations = useMemo(() => {
    return targets.map((t) => calculateTargetProgress(t, deals, cases, contacts, users, '2026-09-28', tasks));
  }, [targets, deals, cases, contacts, users, tasks]);

  // Keep selected calculation in sync if targets change
  const currentSelectedCalculation = useMemo(() => {
    if (!selectedCalculation) return null;
    return targetCalculations.find((c) => c.target.id === selectedCalculation.target.id) || selectedCalculation;
  }, [targetCalculations, selectedCalculation]);

  // Filtered targets for dashboard
  const filteredCalculations = useMemo(() => {
    return targetCalculations.filter((c) => {
      const t = c.target;
      if (onlyMyTargets && !t.assignedUserIds.includes(currentUser.id)) return false;
      if (filterUser !== 'all' && !t.assignedUserIds.includes(filterUser)) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && c.computedStatus !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterPeriod !== 'all' && t.period !== filterPeriod) return false;
      if (filterDepartment !== 'all' && t.department !== filterDepartment) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesAssignees = users
          .filter((u) => t.assignedUserIds.includes(u.id))
          .some((u) => u.name.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAssignees) return false;
      }
      return true;
    });
  }, [
    targetCalculations,
    onlyMyTargets,
    filterUser,
    filterType,
    filterStatus,
    filterPriority,
    filterPeriod,
    filterDepartment,
    searchQuery,
    currentUser.id,
    users,
  ]);

  // High-level KPI Rollups across all active targets
  const kpiSummary = useMemo(() => {
    let totalRevenueGoal = 0;
    let totalRevenueAchieved = 0;
    let totalUnitsSold = 0;
    let totalUnitsGoal = 0;
    let totalCasesResolved = 0;
    let totalCasesGoal = 0;
    let totalDealsWon = 0;
    let totalAttainmentSum = 0;

    targetCalculations.forEach((c) => {
      totalAttainmentSum += c.percent;
      if (c.target.type === 'revenue') {
        totalRevenueGoal += c.goal;
        totalRevenueAchieved += c.actual;
      } else if (c.target.type === 'units_sold') {
        totalUnitsGoal += c.goal;
        totalUnitsSold += c.actual;
      } else if (c.target.type === 'cases_resolved') {
        totalCasesGoal += c.goal;
        totalCasesResolved += c.actual;
      } else if (c.target.type === 'deals_closed') {
        totalDealsWon += c.actual;
      }
    });

    const averageAttainment =
      targetCalculations.length > 0 ? Math.round(totalAttainmentSum / targetCalculations.length) : 0;

    const totalGoals = targetCalculations.length;
    const achievedGoals = targetCalculations.filter(
      (c) => c.computedStatus === 'Achieved' || c.computedStatus === 'Completed'
    ).length;
    const inProgressGoals = targetCalculations.filter(
      (c) =>
        c.computedStatus === 'On Track' ||
        c.computedStatus === 'At Risk' ||
        c.computedStatus === 'Active' ||
        c.computedStatus === 'Under Review'
    ).length;
    const overdueGoals = targetCalculations.filter((c) => c.computedStatus === 'Expired').length;
    const blockedGoals = targetCalculations.filter((c) => c.computedStatus === 'Blocked').length;
    const pendingReviewsCount = targetCalculations.reduce((sum, c) => sum + c.pendingReviewTasksCount, 0);

    return {
      totalGoals,
      achievedGoals,
      inProgressGoals,
      overdueGoals,
      blockedGoals,
      pendingReviewsCount,
      totalTargets: targetCalculations.length,
      activeTargets: inProgressGoals,
      totalRevenueGoal,
      totalRevenueAchieved,
      revenueAttainmentPercent: totalRevenueGoal > 0 ? Math.round((totalRevenueAchieved / totalRevenueGoal) * 100) : 0,
      totalUnitsSold,
      totalUnitsGoal,
      totalCasesResolved,
      totalCasesGoal,
      totalDealsWon,
      averageAttainment,
    };
  }, [targetCalculations]);

  // Create or Update handler
  const handleSaveTarget = (targetData: Omit<Target, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      updateTarget(existingId, targetData);
    } else {
      addTarget(targetData);
    }
  };

  const handleOpenEdit = (target: Target) => {
    setEditingTarget(target);
    setShowCreateModal(true);
  };

  const handleSelectUserForIndividual = (user: User) => {
    setSelectedIndividualUser(user);
    setActiveTab('individual');
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Achieved':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Blocked':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'On Track':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'At Risk':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Upcoming':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Expired':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: Target['type']) => {
    switch (type) {
      case 'revenue':
        return <DollarSign size={13} className="text-emerald-600" />;
      case 'units_sold':
        return <Package size={13} className="text-purple-600" />;
      case 'cases_resolved':
        return <LifeBuoy size={13} className="text-sky-600" />;
      case 'deals_closed':
        return <Briefcase size={13} className="text-indigo-600" />;
      case 'new_customers':
        return <Users size={13} className="text-amber-600" />;
      default:
        return <Award size={13} className="text-indigo-600" />;
    }
  };

  return (
    <div id="targets-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <TargetIcon size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Goal Achievement & Task Assignment System
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Rule Enforcement</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
              Role: {currentUser.role} ({currentUser.name})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Goals are achieved only when linked tasks are assigned, submitted with evidence, and verified by managers. Goals cannot be marked achieved by a button click alone.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManagerOrAdmin && (
            <button
              id="assign-goal-tasks-btn"
              onClick={() => setShowGoalTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="Create goal and assign actionable tasks with verification"
            >
              <TargetIcon size={15} />
              <span>Assign Goal Tasks</span>
            </button>
          )}

          <button
            id="launch-target-mission-btn"
            onClick={() => setShowTargetMissionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            title="Launch an interactive gamified quest to achieve target goals"
          >
            <Swords size={15} />
            <span>Target Quests</span>
            <Sparkles size={12} className="text-amber-300" />
          </button>

          <button
            id="how-to-achieve-btn"
            onClick={() => setShowHowToAchieveModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Strategic guidance & interactive quota calculator"
          >
            <Compass size={15} className="text-indigo-600" />
            <span>How to Achieve</span>
          </button>

          <button
            onClick={() => {
              const { content, filename, mimeType } = generateTargetsExport(targetCalculations, users, 'excel');
              triggerFileDownload(content, filename, mimeType);
            }}
            title="Download target reports for Excel"
            className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip: Total Goals, Achieved Goals, Goals In Progress, Overdue Goals, Blocked Goals, Pending Reviews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Goals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Goals</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TargetIcon size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{kpiSummary.totalGoals}</div>
          <div className="text-[10px] text-slate-500">Configured quotas</div>
        </div>

        {/* Achieved Goals */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-3.5 shadow-2xs space-y-1 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Achieved Goals</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Trophy size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700">{kpiSummary.achievedGoals}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">100% verified & completed</div>
        </div>

        {/* Goals In Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-700">{kpiSummary.inProgressGoals}</div>
          <div className="text-[10px] text-slate-500">Active agent execution</div>
        </div>

        {/* Overdue Goals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Goals</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700">{kpiSummary.overdueGoals}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Past target cutoff date</div>
        </div>

        {/* Blocked Goals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blocked Goals</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700">{kpiSummary.blockedGoals}</div>
          <div className="text-[10px] text-slate-500">Impediment reported</div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-2xl border border-amber-200 p-3.5 shadow-2xs space-y-1 bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Reviews</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock size={13} />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-800">{kpiSummary.pendingReviewsCount}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Awaiting manager sign-off</div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TargetIcon size={14} />
            <span>Goals Dashboard</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'dashboard' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {targetCalculations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users size={14} />
            <span>Team Attainment</span>
          </button>

          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'individual'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award size={14} />
            <span>Agent Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Attainment Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Audit & Verification Logs</span>
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (confirm('Reset all sales targets to initial seed data?')) resetTargetsToDefault();
            }}
            title="Reset targets to default"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* TAB 1: GOALS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Dashboard Filter Strip */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals, criteria, or assignees..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Agent Filter */}
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
              >
                <option value="all">All Agents</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Achieved">Achieved 🏆</option>
                <option value="Under Review">Under Review ⏳</option>
                <option value="On Track">On Track 🟢</option>
                <option value="At Risk">At Risk 🟠</option>
                <option value="Blocked">Blocked ⚠️</option>
                <option value="Upcoming">Upcoming 🔵</option>
                <option value="Expired">Expired 🔴</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="all">All Types</option>
                <option value="revenue">Revenue Target</option>
                <option value="units_sold">Units Sold</option>
                <option value="deals_closed">Deals Closed</option>
                <option value="cases_resolved">Support Cases</option>
                <option value="new_customers">New Customers</option>
                <option value="custom_kpi">Custom KPI</option>
              </select>

              {/* Period Filter */}
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="all">All Periods</option>
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Yearly</option>
              </select>

              {/* Only My Targets Toggle */}
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer ml-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={onlyMyTargets}
                  onChange={(e) => setOnlyMyTargets(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>My Assigned Goals</span>
              </label>
            </div>
          </div>

          {/* Goal Cards Grid */}
          {filteredCalculations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <TargetIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">No goals matched your filters</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria, toggling off 'My Assigned Goals', or creating a new measurable goal.
              </p>
              {isManagerOrAdmin && (
                <button
                  onClick={() => setShowGoalTaskModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Create Goal & Assign Tasks
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculations.map((calc) => {
                const {
                  target: t,
                  actual,
                  goal,
                  remaining,
                  percent,
                  computedStatus,
                  linkedTasks,
                  completedMandatoryTasksCount,
                  mandatoryTasksCount,
                  pendingReviewTasksCount,
                  blockedTasksCount,
                  isTargetAchieved,
                } = calc;
                const assignees = users.filter((u) => t.assignedUserIds.includes(u.id));

                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 text-xs transition-all flex flex-col justify-between ${
                      isTargetAchieved
                        ? 'border-emerald-300 hover:border-emerald-500 hover:shadow-emerald-500/10'
                        : computedStatus === 'Blocked'
                        ? 'border-rose-300 hover:border-rose-500'
                        : computedStatus === 'Under Review'
                        ? 'border-amber-300 hover:border-amber-500'
                        : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                              {getTypeIcon(t.type)}
                              <span>{t.type.replace('_', ' ')}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getStatusBadge(computedStatus)}`}>
                              {isTargetAchieved && <Trophy size={11} />}
                              {computedStatus === 'Under Review' && <Clock size={11} />}
                              {computedStatus === 'Blocked' && <AlertTriangle size={11} />}
                              {computedStatus}
                            </span>
                            {t.priority && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                {t.priority}
                              </span>
                            )}
                          </div>
                          <h3
                            onClick={() => setSelectedCalculation(calc)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 line-clamp-1 cursor-pointer"
                          >
                            {t.name}
                          </h3>
                        </div>

                        <span className="text-base font-extrabold text-indigo-600 shrink-0">
                          {percent}%
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-2">{t.description}</p>
                      )}

                      {/* Progress Bar Gauge */}
                      <div className="space-y-1.5 pt-1">
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTargetAchieved
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

                        <div className="flex items-center justify-between font-semibold text-[11px] text-slate-600">
                          <span>
                            Attained:{' '}
                            <strong className="text-slate-900">
                              {formatMetricValue(actual, t.type, t.currency, t.customKpiUnit)}
                            </strong>
                          </span>
                          <span>
                            Goal:{' '}
                            <strong className="text-slate-900">
                              {formatMetricValue(goal, t.type, t.currency, t.customKpiUnit)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Task Breakdown Verification Checklist Pill */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <CheckSquare size={13} className="text-indigo-600" />
                            <span>Mandatory Task Sign-offs</span>
                          </span>
                          <span
                            className={`font-bold ${
                              completedMandatoryTasksCount === mandatoryTasksCount && mandatoryTasksCount > 0
                                ? 'text-emerald-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {completedMandatoryTasksCount}/{mandatoryTasksCount} verified
                          </span>
                        </div>

                        {/* Badges for pending review & blockers */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          {pendingReviewTasksCount > 0 && (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-amber-300">
                              <Clock size={10} />
                              {pendingReviewTasksCount} awaiting review
                            </span>
                          )}

                          {blockedTasksCount > 0 && (
                            <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-rose-300">
                              <AlertTriangle size={10} />
                              {blockedTasksCount} blocked
                            </span>
                          )}

                          {isTargetAchieved && (
                            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-emerald-300">
                              <Trophy size={10} />
                              Goal criteria verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Assignees & Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {assignees.slice(0, 3).map((u) => (
                            <span
                              key={u.id}
                              title={`${u.name} (${u.role})`}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center"
                            >
                              {u.name.charAt(0)}
                            </span>
                          ))}
                        </div>
                        {assignees.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            +{assignees.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBlockerModalCalc(calc)}
                          className="px-2.5 py-1 text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 rounded-lg font-bold transition-colors flex items-center gap-1"
                          title="Inspect task completion evidence and criteria requirements"
                        >
                          <FileText size={12} />
                          <span>Criteria</span>
                        </button>

                        <button
                          onClick={() => setSelectedCalculation(calc)}
                          className="px-2.5 py-1 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-bold transition-colors flex items-center gap-0.5"
                        >
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAM ATTAINMENT */}
      {activeTab === 'team' && (
        <TeamPerformanceTab
          calculations={targetCalculations}
          users={users}
          onSelectUserForIndividualView={handleSelectUserForIndividual}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 3: AGENT PERFORMANCE */}
      {activeTab === 'individual' && (
        <IndividualPerformanceTab
          calculations={targetCalculations}
          users={users}
          selectedUser={selectedIndividualUser}
          onSelectUser={(user) => setSelectedIndividualUser(user)}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 4: ATTAINMENT REPORTS */}
      {activeTab === 'reports' && (
        <TargetReportsTab
          calculations={targetCalculations}
          users={users}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'history' && (
        <TargetAuditHistoryTab
          targets={targets}
          users={users}
          calculations={targetCalculations}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* Goal Creation & Task Assignment Modal */}
      {showGoalTaskModal && (
        <GoalTaskAssignmentModal
          onClose={() => setShowGoalTaskModal(false)}
          onGoalCreated={(goalId) => {
            const found = targetCalculations.find((c) => c.target.id === goalId);
            if (found) setSelectedCalculation(found);
          }}
        />
      )}

      {/* Modal for Inspecting Achievement Blockers & Criteria */}
      {blockerModalCalc && (
        <GoalAchievementBlockerModal
          calculation={blockerModalCalc}
          onClose={() => setBlockerModalCalc(null)}
          onOpenTaskReview={(taskId) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) setReviewModalTask(t);
          }}
          onOpenTaskSubmit={(taskId) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) setSubmissionModalTask(t);
          }}
        />
      )}

      {/* Review Modal */}
      {reviewModalTask && (
        <TaskReviewModal
          task={reviewModalTask}
          onClose={() => setReviewModalTask(null)}
        />
      )}

      {/* Submit Evidence Modal */}
      {submissionModalTask && (
        <TaskEvidenceSubmissionModal
          task={submissionModalTask}
          onClose={() => setSubmissionModalTask(null)}
        />
      )}

      {/* Create / Edit Standard Target Modal */}
      <CreateEditTargetModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTarget(null);
        }}
        onSave={handleSaveTarget}
        editingTarget={editingTarget}
        users={users}
        currentUser={currentUser}
      />

      {/* Target Deep Dive Detail Modal */}
      <TargetDetailModal
        calculation={currentSelectedCalculation}
        onClose={() => setSelectedCalculation(null)}
        onEdit={handleOpenEdit}
        onDelete={deleteTarget}
        onOverrideProgress={overrideTargetProgress}
        onSendReminder={sendTargetReminder}
        users={users}
        currentUser={currentUser}
        deals={deals}
        onMoveDealStage={moveDealStage}
        onNavigateToDeals={() => setActiveNav('deals')}
      />

      {/* Strategic How To Achieve Targets Playbook Modal */}
      <HowToAchieveTargetsModal
        isOpen={showHowToAchieveModal}
        onClose={() => setShowHowToAchieveModal(false)}
        targets={targetCalculations}
        deals={deals}
        currentUser={currentUser}
        onNavigateToDeals={() => setActiveNav('deals')}
      />

      {/* Target Mission & Gamified Quest Creator Modal */}
      {showTargetMissionModal && (
        <TargetMissionModal
          isOpen={showTargetMissionModal}
          onClose={() => setShowTargetMissionModal(false)}
          allTargets={targetCalculations}
          targetCalculation={selectedCalculation || targetCalculations[0] || null}
          deals={deals}
          users={users}
          currentUser={currentUser}
          onDeployMission={(taskData) => {
            addTask(taskData);
            setActiveNav('tasks');
          }}
        />
      )}
    </div>
  );
};
