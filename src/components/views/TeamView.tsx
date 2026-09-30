import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { User, UserRole, UserStatus, Task } from '../../types';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  LayoutGrid,
  List,
  History,
  Shield,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  Calendar,
  Phone,
  PhoneCall,
  Mail,
  ChevronDown,
  ArrowUpDown,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  USER_STATUSES,
  DEPARTMENTS,
  calculateMemberStats,
  canEditUser,
} from './team/teamConstants';
import { TeamMemberCard } from './team/TeamMemberCard';
import { TeamMemberTableRow } from './team/TeamMemberTableRow';
import { TeamMemberDetailModal } from './team/TeamMemberDetailModal';
import { TeamMemberEditModal } from './team/TeamMemberEditModal';
import { AddMemberModal } from './team/AddMemberModal';
import { AssignTaskModal } from './team/AssignTaskModal';
import { TeamAuditModal } from './team/TeamAuditModal';

export const TeamView: React.FC = () => {
  const {
    users,
    currentUser,
    switchUser,
    addUser,
    updateUser,
    tasks,
    addTask,
    updateTask,
    deals,
    cases,
    events,
    openCreateMeeting,
    documents,
    directMessages,
    sendDirectMessage,
    auditLogs,
    companies,
    contacts,
    openCallConsole,
    setActiveNav,
  } = useCRM();

  // Layout View State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'available' | 'sales' | 'my_dept' | 'high_workload'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'tasks_progress' | 'tasks_count' | 'deals_count'>('name_asc');

  // Modals State
  const [detailMember, setDetailMember] = useState<User | null>(null);
  const [editMember, setEditMember] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [assignTaskMember, setAssignTaskMember] = useState<User | null>(null);
  const [callModalMember, setCallModalMember] = useState<User | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const canManageTeam = isAdmin || isManager;

  // Organization-wide aggregated statistics for KPI Banner
  const teamAggregates = useMemo(() => {
    const totalMembers = users.length;
    const activeMembers = users.filter((u) => u.active).length;

    // Status counts
    const availableCount = users.filter((u) => u.status === 'Available' || !u.status).length;
    const inMeetingCount = users.filter((u) => u.status === 'In a Meeting').length;
    const onCallCount = users.filter((u) => u.status === 'On Call').length;
    const awayCount = users.filter((u) => u.status === 'Away' || u.status === 'Out of Office').length;

    // Tasks summary
    const allTasks = tasks.filter((t) => !t.deletedAt);
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
    const totalTasks = allTasks.length;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Deals pipeline summary
    const openDeals = deals.filter((d) => !d.deletedAt && d.status === 'open');
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    // Support Cases summary
    const openCases = cases.filter((c) => !c.deletedAt && c.status !== 'Closed');

    // Meetings today
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter((e) => !e.deletedAt && e.startDate === today);

    return {
      totalMembers,
      activeMembers,
      availableCount,
      inMeetingCount,
      onCallCount,
      awayCount,
      totalTasks,
      completedTasks,
      overallCompletionRate,
      openDealsCount: openDeals.length,
      totalPipelineValue,
      openCasesCount: openCases.length,
      todayEventsCount: todayEvents.length,
    };
  }, [users, tasks, deals, cases, events]);

  // Filtered & Sorted Team Members
  const filteredMembers = useMemo(() => {
    let result = [...users];

    // Search query: name, email, jobTitle, department, skills, location
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.location && u.location.toLowerCase().includes(q)) ||
          (u.skills && u.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      result = result.filter((u) => u.department === selectedDepartment);
    }

    // Role filter
    if (selectedRole !== 'all') {
      result = result.filter((u) => u.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((u) => u.status === selectedStatus);
    }

    // Quick filter chips
    if (quickFilter === 'available') {
      result = result.filter((u) => u.status === 'Available');
    } else if (quickFilter === 'sales') {
      result = result.filter(
        (u) => u.department === 'Sales & Revenue' || u.department === 'Sales'
      );
    } else if (quickFilter === 'my_dept') {
      result = result.filter((u) => u.department === currentUser.department);
    } else if (quickFilter === 'high_workload') {
      result = result.filter((u) => {
        const userTasks = tasks.filter((t) => !t.deletedAt && t.assigneeId === u.id && t.status !== 'Completed');
        return userTasks.length >= 2;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'tasks_progress') {
        const statsA = calculateMemberStats(a, tasks, deals, cases, events);
        const statsB = calculateMemberStats(b, tasks, deals, cases, events);
        return statsB.completionRate - statsA.completionRate;
      }
      if (sortBy === 'tasks_count') {
        const countA = tasks.filter((t) => !t.deletedAt && t.assigneeId === a.id).length;
        const countB = tasks.filter((t) => !t.deletedAt && t.assigneeId === b.id).length;
        return countB - countA;
      }
      if (sortBy === 'deals_count') {
        const countA = deals.filter((d) => !d.deletedAt && d.ownerId === a.id && d.status === 'open').length;
        const countB = deals.filter((d) => !d.deletedAt && d.ownerId === b.id && d.status === 'open').length;
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [
    users,
    searchQuery,
    selectedDepartment,
    selectedRole,
    selectedStatus,
    quickFilter,
    sortBy,
    currentUser,
    tasks,
    deals,
    cases,
    events,
  ]);

  // Handlers
  const handleScheduleMeeting = (member: User) => {
    openCreateMeeting({
      contactId: undefined,
      companyId: undefined,
    });
    showToast(`Opening meeting scheduler for ${member.name}`);
  };

  const handleSendMessage = (member: User) => {
    setDetailMember(member);
    showToast(`Opening direct conversation with ${member.name}`);
  };

  const handleCallMember = (member: User) => {
    setCallModalMember(member);
  };

  const handleSaveProfile = (userId: string, updates: Partial<User>) => {
    updateUser(userId, updates);
    showToast('Team member profile updated successfully!');
    if (detailMember && detailMember.id === userId) {
      setDetailMember({ ...detailMember, ...updates });
    }
  };

  const handleAddMember = (userData: Omit<User, 'id'>) => {
    addUser(userData);
    showToast(`Welcome! Added ${userData.name} to the team roster.`);
  };

  const handleAssignTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    addTask(taskData);
    showToast(`Assigned new task "${taskData.title}"`);
  };

  const handleUpdateTaskInline = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    showToast('Task updated');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedRole('all');
    setSelectedStatus('all');
    setQuickFilter('all');
    setSortBy('name_asc');
  };

  return (
    <div id="team-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Overview</h1>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              {teamAggregates.totalMembers} Members ({teamAggregates.activeMembers} Active)
            </span>

            {/* Permission badge */}
            <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Shield size={12} className="text-slate-400" />
              <span>
                {isAdmin
                  ? 'Administrator Access'
                  : isManager
                  ? 'Manager Access'
                  : 'Standard Member Access'}
              </span>
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Top-down operational roster: track member progress, open deals, active support cases,
            presence status, and cross-team collaboration.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active User Switcher / Simulator (allows checking Admin vs Manager vs Standard) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Viewing as:</span>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
              title="Switch user to test role-based permissions"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Audit History Log button */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
            title="View audit trail of team profile changes"
          >
            <History size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          {/* Add Team Member (Admin/Manager only) */}
          {canManageTeam && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          )}

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Top-Down Team KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Team Presence */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Team Presence</span>
            <Users size={15} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {teamAggregates.availableCount}{' '}
              <span className="text-xs font-normal text-slate-500">Available</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span className="text-amber-600 font-medium">
                {teamAggregates.inMeetingCount} in mtg
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 font-medium">
                {teamAggregates.onCallCount} on call
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Overall Task Completion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Workload Execution</span>
            <CheckSquare size={15} className="text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {teamAggregates.overallCompletionRate}%
              </span>
              <span className="text-[11px] text-slate-500">
                {teamAggregates.completedTasks}/{teamAggregates.totalTasks} done
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${teamAggregates.overallCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Active Pipeline Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Commercial Pipeline</span>
            <Briefcase size={15} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              ${(teamAggregates.totalPipelineValue / 1000).toFixed(0)}k{' '}
              <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Across {teamAggregates.openDealsCount} active deals
            </p>
          </div>
        </div>

        {/* Card 4: Support Escalations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Support Desk</span>
            <LifeBuoy size={15} className="text-rose-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {teamAggregates.openCasesCount}{' '}
              <span className="text-xs font-normal text-slate-500">Open Cases</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Client SLA triage active</p>
          </div>
        </div>

        {/* Card 5: Meetings Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Engagements</span>
            <Calendar size={15} className="text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {teamAggregates.todayEventsCount}{' '}
              <span className="text-xs font-normal text-slate-500">Scheduled</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Meetings & client calls</p>
          </div>
        </div>
      </div>

      {/* Search, Filter, Sort Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, skills, location..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Filters & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="standard">Standard</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {USER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="tasks_progress">Highest Task Progress</option>
              <option value="tasks_count">Most Tasks Assigned</option>
              <option value="deals_count">Most Open Deals</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Segmented Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Quick Filters:</span>
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'available', label: `Available Now (${teamAggregates.availableCount})` },
              { id: 'sales', label: 'Sales & Revenue' },
              { id: 'my_dept', label: `My Dept (${currentUser.department || 'Operations'})` },
              { id: 'high_workload', label: 'High Workload (≥2 tasks)' },
            ].map((chip) => {
              const isSelected = quickFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setQuickFilter(chip.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-700">{filteredMembers.length}</strong> of{' '}
              {users.length} colleagues
            </span>
            {(searchQuery ||
              selectedDepartment !== 'all' ||
              selectedRole !== 'all' ||
              selectedStatus !== 'all' ||
              quickFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-indigo-600 hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Display: Grid View or Table View */}
      {filteredMembers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No team members found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No colleagues matched your current search filters. Try adjusting your query or resetting all filters.
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              currentUser={currentUser}
              tasks={tasks}
              deals={deals}
              cases={cases}
              events={events}
              onViewDetails={(m) => setDetailMember(m)}
              onEdit={(m) => setEditMember(m)}
              onScheduleMeeting={handleScheduleMeeting}
              onSendMessage={handleSendMessage}
              onCall={handleCallMember}
              onAssignTask={(m) => setAssignTaskMember(m)}
            />
          ))}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Colleague</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4">Status & Presence</th>
                  <th className="py-3 px-4">Task Progress</th>
                  <th className="py-3 px-4">Open Pipeline</th>
                  <th className="py-3 px-4">Cases</th>
                  <th className="py-3 px-4">Next Event</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <TeamMemberTableRow
                    key={member.id}
                    member={member}
                    currentUser={currentUser}
                    tasks={tasks}
                    deals={deals}
                    cases={cases}
                    events={events}
                    onViewDetails={(m) => setDetailMember(m)}
                    onEdit={(m) => setEditMember(m)}
                    onScheduleMeeting={handleScheduleMeeting}
                    onSendMessage={handleSendMessage}
                    onCall={handleCallMember}
                    onAssignTask={(m) => setAssignTaskMember(m)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Member Profile Details */}
      {detailMember && (
        <TeamMemberDetailModal
          member={detailMember}
          currentUser={currentUser}
          users={users}
          tasks={tasks}
          deals={deals}
          cases={cases}
          events={events}
          documents={documents}
          directMessages={directMessages}
          onClose={() => setDetailMember(null)}
          onEdit={(m) => {
            setDetailMember(null);
            setEditMember(m);
          }}
          onScheduleMeeting={handleScheduleMeeting}
          onAssignTask={(m) => setAssignTaskMember(m)}
          onSendDirectMessage={(recipientId, text) => {
            sendDirectMessage(recipientId, text);
            showToast('Message sent');
          }}
          onUpdateTask={handleUpdateTaskInline}
        />
      )}

      {/* MODAL 2: Edit Member Profile */}
      {editMember && (
        <TeamMemberEditModal
          member={editMember}
          currentUser={currentUser}
          onClose={() => setEditMember(null)}
          onSave={handleSaveProfile}
        />
      )}

      {/* MODAL 3: Add New Team Member (Admins/Managers) */}
      {isAddModalOpen && (
        <AddMemberModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMember}
        />
      )}

      {/* MODAL 4: Assign Task to Member */}
      {assignTaskMember && (
        <AssignTaskModal
          member={assignTaskMember}
          companies={companies}
          contacts={contacts}
          onClose={() => setAssignTaskMember(null)}
          onAddTask={handleAssignTask}
        />
      )}

      {/* MODAL 5: Audit History Log */}
      {isAuditModalOpen && (
        <TeamAuditModal
          auditLogs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      {/* MODAL 6: Direct Call Options / Confirmation */}
      {callModalMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PhoneCall size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Call {callModalMember.name}
                </h4>
                <p className="text-slate-500 font-mono">{callModalMember.phone}</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Initiate a direct dial call or copy contact phone details for dialer routing.
            </p>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${callModalMember.phone}`}
                onClick={() => setCallModalMember(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-center shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone size={13} />
                <span>Dial Now ({callModalMember.phone})</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(callModalMember.phone || '');
                  showToast('Phone number copied to clipboard');
                  setCallModalMember(null);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-center transition-colors"
              >
                Copy Phone Number
              </button>

              <button
                onClick={() => setCallModalMember(null)}
                className="w-full py-1.5 text-slate-400 hover:text-slate-600 text-center font-medium mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
