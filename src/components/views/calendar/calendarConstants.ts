import { EventType, ConfirmationStatus } from '../../../types';

export interface EventTypeConfig {
  type: EventType | string;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  blockBg: string;
  blockBorder: string;
  dotColor: string;
}

export const DEFAULT_EVENT_TYPES: EventTypeConfig[] = [
  {
    type: 'Meeting',
    label: 'Meeting',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    blockBg: 'bg-indigo-100/80 hover:bg-indigo-200/90 text-indigo-950',
    blockBorder: 'border-indigo-500',
    dotColor: '#4f46e5',
  },
  {
    type: 'Appointment',
    label: 'Appointment',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    blockBg: 'bg-blue-100/80 hover:bg-blue-200/90 text-blue-950',
    blockBorder: 'border-blue-500',
    dotColor: '#2563eb',
  },
  {
    type: 'Call',
    label: 'Scheduled Call',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    blockBg: 'bg-emerald-100/80 hover:bg-emerald-200/90 text-emerald-950',
    blockBorder: 'border-emerald-500',
    dotColor: '#059669',
  },
  {
    type: 'Task',
    label: 'Task Deadline',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    blockBg: 'bg-amber-100/80 hover:bg-amber-200/90 text-amber-950',
    blockBorder: 'border-amber-500',
    dotColor: '#d97706',
  },
  {
    type: 'Customer Visit',
    label: 'Customer Visit',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    blockBg: 'bg-purple-100/80 hover:bg-purple-200/90 text-purple-950',
    blockBorder: 'border-purple-500',
    dotColor: '#7c3aed',
  },
  {
    type: 'Sales Meeting',
    label: 'Sales Pitch / Demo',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    blockBg: 'bg-teal-100/80 hover:bg-teal-200/90 text-teal-950',
    blockBorder: 'border-teal-500',
    dotColor: '#0d9488',
  },
  {
    type: 'Internal Meeting',
    label: 'Internal Sync',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    blockBg: 'bg-slate-200/90 hover:bg-slate-300 text-slate-900',
    blockBorder: 'border-slate-500',
    dotColor: '#475569',
  },
  {
    type: 'Training',
    label: 'Training / Workshop',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    blockBg: 'bg-cyan-100/80 hover:bg-cyan-200/90 text-cyan-950',
    blockBorder: 'border-cyan-500',
    dotColor: '#0891b2',
  },
  {
    type: 'Follow-up',
    label: 'Follow-up',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    blockBg: 'bg-rose-100/80 hover:bg-rose-200/90 text-rose-950',
    blockBorder: 'border-rose-500',
    dotColor: '#e11d48',
  },
  {
    type: 'Other',
    label: 'Other Activity',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
    blockBg: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    blockBorder: 'border-slate-400',
    dotColor: '#64748b',
  },
];

export const CONFIRMATION_STATUS_CONFIG: Record<
  ConfirmationStatus,
  { label: string; badge: string; dot: string }
> = {
  Confirmed: {
    label: 'Confirmed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'Not Confirmed': {
    label: 'Not Confirmed',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  Cancelled: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 line-through',
    dot: 'bg-rose-500',
  },
};

export const CALENDAR_HOURS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export function getEventTypeConfig(
  type?: EventType | string,
  customTypes: EventTypeConfig[] = []
): EventTypeConfig {
  const all = [...customTypes, ...DEFAULT_EVENT_TYPES];
  const found = all.find((c) => c.type.toLowerCase() === (type || '').toLowerCase());
  return (
    found || {
      type: type || 'Meeting',
      label: type || 'Meeting',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-200',
      blockBg: 'bg-indigo-100/90 text-indigo-950',
      blockBorder: 'border-indigo-500',
      dotColor: '#4f46e5',
    }
  );
}

export function formatTimeRange(start: string, end: string, clockMode: '12h' | '24h' = '12h'): string {
  if (clockMode === '24h') {
    return `${start} – ${end}`;
  }

  const format12 = (t: string) => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return t;
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return `${format12(start)} – ${format12(end)}`;
}

/**
 * Returns array of 7 dates for the week containing the given date
 */
export function getWeekDates(dateStr: string, startOnMonday: boolean = true): { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] {
  const current = new Date(dateStr + 'T12:00:00');
  const day = current.getDay(); // 0 is Sunday
  const diff = current.getDate() - day + (startOnMonday ? (day === 0 ? -6 : 1) : 0);

  const monday = new Date(current.setDate(diff));
  const todayIso = new Date().toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      date: d,
      dateStr: iso,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: iso === todayIso,
    });
  }

  return days;
}
