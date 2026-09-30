import React, { useMemo } from 'react';
import { Plus, Clock, Users, Video, MapPin } from 'lucide-react';
import { Event, Call, Task } from '../../../types';
import { getEventTypeConfig, CONFIRMATION_STATUS_CONFIG, EventTypeConfig } from './calendarConstants';
import { formatTimeDisplay } from '../../../utils/profileUtils';

interface MonthlyCalendarViewProps {
  selectedDate: string;
  events: Event[];
  calls: Call[];
  tasks: Task[];
  customEventTypes: EventTypeConfig[];
  clockMode: '12h' | '24h';
  onDateClick: (dateStr: string) => void;
  onOpenEventDetail: (event: Event) => void;
  onCreateEventOnDate: (dateStr: string) => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  selectedDate,
  events,
  calls,
  tasks,
  customEventTypes,
  clockMode,
  onDateClick,
  onOpenEventDetail,
  onCreateEventOnDate,
}) => {
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const currentYear = dateObj.getFullYear();
  const currentMonth = dateObj.getMonth();

  const todayIso = new Date().toISOString().split('T')[0];

  // Calculate day cells
  const calendarCells = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const cells = [];

    // Preceding padding days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, dateStr: '', isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // Trailing padding to fill complete 7x5 or 7x6 grid
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: '', isCurrentMonth: false });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Map events to date strings
  const eventsByDate = useMemo(() => {
    const map = new Map<string, { events: Event[]; calls: Call[]; tasks: Task[] }>();
    events.forEach((evt) => {
      if (evt.deletedAt) return;
      const list = map.get(evt.startDate) || { events: [], calls: [], tasks: [] };
      list.events.push(evt);
      map.set(evt.startDate, list);
    });

    calls.forEach((c) => {
      if (c.deletedAt) return;
      const list = map.get(c.date) || { events: [], calls: [], tasks: [] };
      list.calls.push(c);
      map.set(c.date, list);
    });

    tasks.forEach((t) => {
      if (t.deletedAt) return;
      const list = map.get(t.deadline) || { events: [], calls: [], tasks: [] };
      list.tasks.push(t);
      map.set(t.deadline, list);
    });

    return map;
  }, [events, calls, tasks]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-700 py-3">
        {WEEKDAY_NAMES.map((name, idx) => (
          <div key={idx} className={idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-800'}>
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/30">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth || !cell.dateStr) {
            return (
              <div
                key={idx}
                className="min-h-[110px] sm:min-h-[130px] p-2 bg-slate-100/30 select-none opacity-40"
              />
            );
          }

          const dayData = eventsByDate.get(cell.dateStr) || { events: [], calls: [], tasks: [] };
          const isToday = cell.dateStr === todayIso;
          const isSelected = cell.dateStr === selectedDate;
          const totalDayActivities = dayData.events.length + dayData.calls.length + dayData.tasks.length;

          return (
            <div
              key={idx}
              onClick={() => onDateClick(cell.dateStr)}
              className={`min-h-[110px] sm:min-h-[135px] p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${
                isSelected
                  ? 'bg-indigo-50/60 ring-2 ring-indigo-500/40 z-10'
                  : 'hover:bg-slate-50 bg-white'
              }`}
            >
              {/* Day Header Row */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : isSelected
                      ? 'bg-indigo-100 text-indigo-950 font-bold'
                      : 'text-slate-700 group-hover:text-slate-900'
                  }`}
                >
                  {cell.day}
                </span>

                <div className="flex items-center gap-1">
                  {totalDayActivities > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800">
                      {totalDayActivities}
                    </span>
                  )}

                  {/* Quick-add on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateEventOnDate(cell.dateStr);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Create event on ${cell.dateStr}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Day Activities List Preview */}
              <div className="mt-1.5 space-y-1 flex-1 overflow-hidden">
                {/* Events / Meetings */}
                {dayData.events.slice(0, 3).map((evt) => {
                  const typeCfg = getEventTypeConfig(evt.eventType, customEventTypes);
                  const confStatus = evt.confirmationStatus || (evt.confirmed ? 'Confirmed' : 'Pending');
                  const confCfg = CONFIRMATION_STATUS_CONFIG[confStatus] || CONFIRMATION_STATUS_CONFIG.Pending;

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEventDetail(evt);
                      }}
                      className={`px-1.5 py-1 rounded-lg border text-[11px] font-medium flex items-center justify-between gap-1 shadow-2xs hover:scale-[1.02] transition-transform ${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`}
                      title={`${evt.title} (${evt.startTime} - ${evt.endTime})`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: typeCfg.dotColor }}
                        />
                        <span className="font-mono text-[9px] text-slate-500 shrink-0">
                          {formatTimeDisplay(evt.startTime, clockMode)}
                        </span>
                        <span className="truncate font-semibold">{evt.title}</span>
                      </div>

                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${confCfg.dot}`}
                        title={confCfg.label}
                      />
                    </div>
                  );
                })}

                {/* Overflow indicator */}
                {dayData.events.length > 3 && (
                  <div className="text-[10px] font-semibold text-slate-400 pl-1">
                    +{dayData.events.length - 3} more event{dayData.events.length - 3 > 1 ? 's' : ''}...
                  </div>
                )}

                {/* Calls chip */}
                {dayData.calls.length > 0 && dayData.events.length < 3 && (
                  <div className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{dayData.calls.length} Call{dayData.calls.length > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Tasks chip */}
                {dayData.tasks.length > 0 && dayData.events.length < 2 && (
                  <div className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">{dayData.tasks.length} Task deadline{dayData.tasks.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Bottom hint for clicking */}
              <div className="text-[9px] text-slate-400 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                Inspect Day
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
