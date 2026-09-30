import { User, UserStatus, Task, Deal, Case, Event } from '../../../types';

export interface TeamMemberStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  openDealsCount: number;
  openDealsValue: number;
  wonDealsValue: number;
  openCasesCount: number;
  nextEvent?: Event;
}

export const USER_STATUSES: {
  value: UserStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    value: 'Available',
    label: 'Available',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700 border-emerald-200',
  },
  {
    value: 'In a Meeting',
    label: 'In a Meeting',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700 border-amber-200',
  },
  {
    value: 'On Call',
    label: 'On Call',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700 border-indigo-200',
  },
  {
    value: 'Away',
    label: 'Away',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600 border-slate-200',
  },
  {
    value: 'Out of Office',
    label: 'Out of Office',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700 border-rose-200',
  },
  {
    value: 'Busy',
    label: 'Busy',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
  },
];

export const DEPARTMENTS = [
  'Executive Management',
  'Sales & Revenue',
  'Customer Success',
  'Engineering',
  'Marketing',
  'Product & Operations',
  'Finance & Legal',
];

export const calculateMemberStats = (
  user: User,
  tasks: Task[],
  deals: Deal[],
  cases: Case[],
  events: Event[]
): TeamMemberStats => {
  const today = new Date().toISOString().split('T')[0];

  // Tasks
  const userTasks = tasks.filter((t) => !t.deletedAt && t.assigneeId === user.id);
  const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = userTasks.filter((t) => t.status === 'In Progress' || t.status === 'Not Started').length;
  const overdueTasks = userTasks.filter(
    (t) => t.status !== 'Completed' && t.deadline && t.deadline < today
  ).length;

  const completionRate =
    userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;

  // Deals
  const userDeals = deals.filter((d) => !d.deletedAt && d.ownerId === user.id);
  const openDeals = userDeals.filter((d) => d.status === 'open');
  const openDealsValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = userDeals.filter((d) => d.status === 'won');
  const wonDealsValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Cases
  const openCasesCount = cases.filter(
    (c) =>
      !c.deletedAt &&
      c.status !== 'Closed' &&
      (c.ownerId === user.id || (c.teamMemberIds && c.teamMemberIds.includes(user.id)))
  ).length;

  // Next event
  const upcomingEvents = events
    .filter(
      (e) =>
        !e.deletedAt &&
        e.startDate >= today &&
        ((e.participantIds && e.participantIds.includes(user.id)) || e.ownerId === user.id)
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.startTime.localeCompare(b.startTime));

  return {
    totalTasks: userTasks.length,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    openDealsCount: openDeals.length,
    openDealsValue,
    wonDealsValue,
    openCasesCount,
    nextEvent: upcomingEvents[0],
  };
};

export const canEditUser = (currentUser: User, targetUser: User): boolean => {
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'manager') return true;
  return currentUser.id === targetUser.id;
};
