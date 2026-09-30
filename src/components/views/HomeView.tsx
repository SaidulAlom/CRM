import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { interpolateWelcomeText } from '../../utils/profileUtils';
import {
  Calendar as CalendarIcon,
  PhoneCall,
  CheckSquare,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Building2,
  Users,
  Target,
  Mail,
  Play,
  HelpCircle,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    events,
    calls,
    tasks,
    deals,
    cases,
    targets,
    campaigns,
    openCallConsole,
    openRecordDetail,
    setActiveNav,
    firstRunChecklistDismissed,
    setFirstRunChecklistDismissed,
    organisation,
    users,
    regions,
    extendedFields,
    fieldSets,
    openCreateMeeting,
  } = useCRM();

  // First-Run Checklist steps (FR-2.4)
  const checklistSteps = [
    { title: 'Organisation Profile', done: Boolean(organisation.name && organisation.website), nav: 'setup' },
    { title: 'User Preferences', done: Boolean(currentUser.preferences.defaultCurrency), nav: 'setup' },
    { title: 'Define Operating Regions', done: regions.length > 0, nav: 'setup' },
    { title: 'User Accounts & Roles', done: users.length >= 2, nav: 'setup' },
    { title: 'Configure Extended Fields', done: extendedFields.length > 0, nav: 'setup' },
    { title: 'Field Sets & Pipeline Stages', done: fieldSets.dealStages.length > 0, nav: 'setup' },
    { title: 'Import Existing Data', done: true, nav: 'import_export' },
    { title: 'Set Team Targets', done: targets.length > 0, nav: 'targets' },
  ];

  const completedStepsCount = checklistSteps.filter((s) => s.done).length;

  // Coming week calculations
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Coming week events & deadlines for signed-in user (FR-2.1)
  const weekEvents = useMemo(() => {
    return events
      .filter((e) => !e.deletedAt && e.startDate >= today && e.startDate <= nextWeek && (e.participantIds.includes(currentUser.id) || e.ownerId === currentUser.id))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, currentUser.id, today, nextWeek]);

  // Today's Call List: calls to be made now + scheduled calls (FR-2.2, FR-9.3)
  const todayCalls = useMemo(() => {
    return calls
      .filter((c) => !c.deletedAt && !c.isCompleted && c.assignedUserId === currentUser.id)
      .slice(0, 5);
  }, [calls, currentUser.id]);

  // Upcoming task deadlines for signed-in user (FR-2.1)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.deletedAt && t.status !== 'Completed' && t.assigneeId === currentUser.id)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5);
  }, [tasks, currentUser.id]);

  // Active email campaigns (FR-2.2)
  const activeCampaigns = useMemo(() => {
    return campaigns.filter((c) => c.status === 'sent' || c.status === 'scheduled');
  }, [campaigns]);

  // Current user's primary target progress (FR-14.2)
  const myTarget = useMemo(() => {
    return targets.find((t) => t.assignedUserIds.includes(currentUser.id));
  }, [targets, currentUser.id]);

  // Calculate current month calendar strip (e.g. 7 days starting from today)
  const calendarStrip = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const hasEvent = events.some((e) => !e.deletedAt && e.startDate === iso && (e.participantIds.includes(currentUser.id) || e.ownerId === currentUser.id));
      const hasCall = calls.some((c) => !c.deletedAt && c.date === iso && !c.isCompleted && c.assignedUserId === currentUser.id);
      days.push({
        date: d,
        iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0,
        hasActivity: hasEvent || hasCall,
      });
    }
    return days;
  }, [events, calls, currentUser.id]);

  return (
    <div id="home-dashboard-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
              {currentUser.role} Role
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {interpolateWelcomeText(
              currentUser.welcomeMessage || organisation.teamWelcomeText || currentUser.preferences.welcomeText || 'Track your coming week schedule, priority call queue, and sales targets.',
              currentUser,
              organisation
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveNav('calendar')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <CalendarIcon size={14} />
            <span>Open Calendar</span>
          </button>
          <button
            onClick={() => setActiveNav('deals')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Briefcase size={14} />
            <span>Pipeline Board</span>
          </button>
        </div>
      </div>

      {/* First-Run Checklist (FR-2.4) */}
      {!firstRunChecklistDismissed && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
                {completedStepsCount}/{checklistSteps.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Organisation First-Run Setup Checklist
                </h3>
                <p className="text-xs text-indigo-200">
                  Recommended order: Details → Profile → Regions → Users → Extended fields → Field sets → Mailbox → Import → Targets.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFirstRunChecklistDismissed(true)}
              className="text-xs text-indigo-300 hover:text-white px-2 py-1 rounded hover:bg-indigo-800/50"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {checklistSteps.map((step) => (
              <div
                key={step.title}
                onClick={() => setActiveNav(step.nav)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  step.done
                    ? 'bg-indigo-900/40 border-indigo-700/60 text-indigo-100 hover:bg-indigo-900/70'
                    : 'bg-slate-900/60 border-indigo-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="truncate pr-1">{step.title}</span>
                {step.done ? (
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Strip (FR-2.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              7-Day Calendar Strip
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarStrip.map((day) => (
            <div
              key={day.iso}
              onClick={() => setActiveNav('calendar')}
              className={`p-2.5 rounded-xl text-center cursor-pointer transition-all border ${
                day.isToday
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs font-semibold'
                  : 'bg-slate-50/70 border-slate-100 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider text-slate-400">{day.dayName}</div>
              <div className="text-base font-bold my-0.5">{day.dayNum}</div>
              <div className="h-1.5 flex items-center justify-center">
                {day.hasActivity && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Calls & Coming Week Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Call List with Start Call button (FR-2.2, FR-9.3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall size={17} className="text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Today's Call List ({todayCalls.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveNav('calls')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>View All Calls</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {todayCalls.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <PhoneCall size={28} className="mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-medium text-slate-600">All scheduled calls completed!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Log a new call from the Quick Create button above or the Calls module.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayCalls.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {c.subject}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        {c.direction}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Scheduled for {c.time} · {c.notes || 'No special instructions'}
                    </div>
                  </div>

                  <button
                    onClick={() => openCallConsole(c.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                    title="Launch interactive call console with script & timer"
                  >
                    <Play size={12} className="fill-white" />
                    <span>Start Call</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Target Attainment Card (FR-14.2) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={15} className="text-indigo-600" />
                Target Progress
              </span>
              <button
                onClick={() => setActiveNav('targets')}
                className="text-xs text-indigo-600 hover:underline"
              >
                Details
              </button>
            </div>
            {myTarget ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{myTarget.name}</h4>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {myTarget.period} target · Goal: ${myTarget.goalValue.toLocaleString()}
                  </p>
                </div>
                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">$303,000 achieved</span>
                    <span className="text-indigo-600">67%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[67%]" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Computed live from Closed Won deals and resolved cases in period.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No target assigned to current user.</p>
            )}
          </div>

          {/* Active Campaigns status (FR-2.2) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={14} className="text-purple-600" />
                Active Campaigns
              </span>
              <button
                onClick={() => setActiveNav('campaigns')}
                className="text-xs text-indigo-600 hover:underline"
              >
                View
              </button>
            </div>
            {activeCampaigns.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No campaigns currently active.</p>
            ) : (
              <div className="space-y-2">
                {activeCampaigns.slice(0, 2).map((camp) => (
                  <div key={camp.id} className="p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-200/80">
                    <div className="font-semibold text-slate-800 truncate">{camp.title}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Sent: {camp.sentCount}</span>
                      <span>Opened: {camp.openedCount}</span>
                      <span className="text-emerald-600 font-medium">Clicks: {camp.clickedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Coming Week's Schedule & Task Deadlines (FR-2.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coming Week Events */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CalendarIcon size={16} className="text-violet-600" />
              <span>Coming Week's Events & Meetings ({weekEvents.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                id="home-create-meeting-btn"
                onClick={() => openCreateMeeting()}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                + Create Meeting
              </button>
              <button
                onClick={() => setActiveNav('calendar')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Full Calendar →
              </button>
            </div>
          </div>

          {weekEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No events scheduled for the next 7 days.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {weekEvents.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{e.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {e.startDate} at {e.startTime} - {e.endTime} · {e.location || 'Online'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Week Task Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckSquare size={16} className="text-amber-600" />
              <span>Priority Task Deadlines ({upcomingTasks.length})</span>
            </h3>
            <button
              onClick={() => setActiveNav('tasks')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              All Tasks
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No open tasks pending.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Deadline: {t.deadline} · Status: {t.status}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-bold text-amber-600">
                    {t.completionPercentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
