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
import { TeamPerformanceTab } from './targets/TeamPerformanceTab';
import { IndividualPerformanceTab } from './targets/IndividualPerformanceTab';
import { TargetReportsTab } from './targets/TargetReportsTab';
import { TargetAuditHistoryTab } from './targets/TargetAuditHistoryTab';
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
} from 'lucide-react';

export const TargetsView: React.FC = () => {
  const {
    targets,
    deals,
    cases,
    contacts,
    users,
    currentUser,
    addTarget,
    updateTarget,
    deleteTarget,
    overrideTargetProgress,
    sendTargetReminder,
    resetTargetsToDefault,
  } = useCRM();

  // Role permissions
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'individual' | 'reports' | 'history'>('dashboard');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<TargetCalculation | null>(null);
  const [selectedIndividualUser, setSelectedIndividualUser] = useState<User>(currentUser);

  // Filters for Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [onlyMyTargets, setOnlyMyTargets] = useState<boolean>(!isManagerOrAdmin);

  // Auto-calculate live progress for all targets using real CRM records
  const targetCalculations = useMemo(() => {
    return targets.map((t) => calculateTargetProgress(t, deals, cases, contacts, users, '2026-09-28'));
  }, [targets, deals, cases, contacts, users]);

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
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && c.computedStatus !== filterStatus) return false;
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
  }, [targetCalculations, onlyMyTargets, filterType, filterStatus, filterPeriod, filterDepartment, searchQuery, currentUser.id, users]);

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

    return {
      totalTargets: targetCalculations.length,
      activeTargets: targetCalculations.filter((c) => c.computedStatus !== 'Completed' && c.computedStatus !== 'Expired').length,
      completedTargets: targetCalculations.filter((c) => c.computedStatus === 'Completed').length,
      onTrackTargets: targetCalculations.filter((c) => c.computedStatus === 'On Track').length,
      atRiskTargets: targetCalculations.filter((c) => c.computedStatus === 'At Risk').length,
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
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
        return <TargetIcon size={13} className="text-indigo-600" />;
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
              Sales Targets & Performance Tracking
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live CRM Calculation</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
              Role: {currentUser.role} ({currentUser.name})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Define, assign, monitor, and evaluate measurable targets for sales and customer-service teams with automatic progress tracking calculated from won deals, customer cases, and converted clients.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {isManagerOrAdmin ? (
            <button
              id="create-target-btn"
              onClick={() => {
                setEditingTarget(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus size={15} />
              <span>Create Target</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <Shield size={14} className="text-slate-400" />
              <span>Standard Rep (Quota Viewer)</span>
            </div>
          )}

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

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Active Targets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Targets
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TargetIcon size={14} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{kpiSummary.activeTargets}</div>
          <div className="text-[10px] text-slate-500">
            {kpiSummary.completedTargets} completed · {kpiSummary.totalTargets} total
          </div>
        </div>

        {/* Total Revenue Attainment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Revenue Achieved
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${kpiSummary.totalRevenueAchieved.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            {kpiSummary.revenueAttainmentPercent}% of ${kpiSummary.totalRevenueGoal.toLocaleString()} quota
          </div>
        </div>

        {/* Units Sold Quota */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Units Sold
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package size={14} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {kpiSummary.totalUnitsSold} Sold
          </div>
          <div className="text-[10px] text-slate-500">
            Goal: {kpiSummary.totalUnitsGoal} unit packages
          </div>
        </div>

        {/* Customer Support Cases */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Support Cases
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <LifeBuoy size={14} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {kpiSummary.totalCasesResolved} Cases
          </div>
          <div className="text-[10px] text-slate-500">
            Goal: {kpiSummary.totalCasesGoal} tickets resolved
          </div>
        </div>

        {/* Team Attainment Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pacing Attainment
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={14} />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {kpiSummary.averageAttainment}%
          </div>
          <div className="text-[10px] text-slate-500">
            {kpiSummary.onTrackTargets} On Track · {kpiSummary.atRiskTargets} At Risk
          </div>
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
            <span>Targets Dashboard</span>
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
            <span>Team Performance</span>
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
            <span>Individual Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp size={14} />
            <span>Target Reports & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock size={14} />
            <span>Target History & Audit</span>
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (confirm('Reset targets to factory default seed data?')) {
                resetTargetsToDefault();
              }
            }}
            title="Reset Targets to Factory Defaults"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* TAB 1: TARGETS DASHBOARD */}
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
                placeholder="Search targets or assignees..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
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

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>

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
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer ml-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={onlyMyTargets}
                  onChange={(e) => setOnlyMyTargets(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>My Assigned Quotas</span>
              </label>
            </div>
          </div>

          {/* Target Cards Grid */}
          {filteredCalculations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <TargetIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">No targets matched your filters</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria, toggling off 'My Assigned Quotas', or creating a new measurable sales target.
              </p>
              {isManagerOrAdmin && (
                <button
                  onClick={() => {
                    setEditingTarget(null);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Create New Target
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculations.map((calc) => {
                const { target: t, actual, goal, remaining, percent, computedStatus, memberContributions } = calc;
                const assignees = users.filter((u) => t.assignedUserIds.includes(u.id));

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedCalculation(calc)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(computedStatus)}`}>
                              {computedStatus}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 line-clamp-1">
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

                        <div className="flex items-center justify-between font-semibold text-[11px] text-slate-600">
                          <span>
                            Achieved:{' '}
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

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Remaining: {formatMetricValue(remaining, t.type, t.currency, t.customKpiUnit)}</span>
                          <span>{calc.timeRemainingDays} days remaining</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Assignees & Quick Action */}
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

                      <span className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAM PERFORMANCE */}
      {activeTab === 'team' && (
        <TeamPerformanceTab
          calculations={targetCalculations}
          users={users}
          onSelectUserForIndividualView={handleSelectUserForIndividual}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 3: INDIVIDUAL PERFORMANCE */}
      {activeTab === 'individual' && (
        <IndividualPerformanceTab
          calculations={targetCalculations}
          users={users}
          selectedUser={selectedIndividualUser}
          onSelectUser={setSelectedIndividualUser}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 4: TARGET REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <TargetReportsTab
          calculations={targetCalculations}
          users={users}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
        />
      )}

      {/* TAB 5: TARGET AUDIT HISTORY */}
      {activeTab === 'history' && (
        <TargetAuditHistoryTab
          targets={targets}
          users={users}
          onSelectTarget={(calc) => setSelectedCalculation(calc)}
          calculations={targetCalculations}
        />
      )}

      {/* Create / Edit Target Modal */}
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
      />
    </div>
  );
};
