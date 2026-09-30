import React, { useMemo } from 'react';
import { Plus, Clock, Users, MapPin, Video, CheckCircle2 } from 'lucide-react';
import { Event, User as CRMUser } from '../../../types';
import {
  CALENDAR_HOURS,
  getWeekDates,
  getEventTypeConfig,
  CONFIRMATION_STATUS_CONFIG,
  EventTypeConfig,
  formatTimeRange,
} from './calendarConstants';
import { formatTimeDisplay } from '../../../utils/profileUtils';

interface WeeklyCalendarViewProps {
  selectedDate: string;
  events: Event[];
  users: CRMUser[];
  clockMode: '12h' | '24h';
  customEventTypes: EventTypeConfig[];
  onOpenEventDetail: (event: Event) => void;
  onCreateEventSlot: (dateStr: string, timeStr: string) => void;
  onSelectDate: (dateStr: string) => void;
}

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedDate,
  events,
  users,
  clockMode,
  customEventTypes,
  onOpenEventDetail,
  onCreateEventSlot,
  onSelectDate,
}) => {
  const weekDays = useMemo(() => {
    return getWeekDates(selectedDate, true);
  }, [selectedDate]);

  // Group events by date
  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    weekDays.forEach((w) => map.set(w.dateStr, []));

    events.forEach((evt) => {
      if (evt.deletedAt) return;
      if (map.has(evt.startDate)) {
        map.get(evt.startDate)?.push(evt);
      }
    });

    return map;
  }, [events, weekDays]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      {/* 7-Day Header Strip */}
      <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/80 divide-x divide-slate-200 text-xs">
        {/* Time column header */}
        <div className="py-3 px-2 text-center font-bold text-slate-400 uppercase text-[10px] tracking-wider">
          Time Slot
        </div>

        {/* 7 Days */}
        {weekDays.map((d) => {
          const isSelected = d.dateStr === selectedDate;
          const dayEvents = eventsByDay.get(d.dateStr) || [];

          return (
            <div
              key={d.dateStr}
              onClick={() => onSelectDate(d.dateStr)}
              className={`py-3 px-2 text-center cursor-pointer transition-colors ${
                d.isToday
                  ? 'bg-indigo-50/80 text-indigo-950 font-bold'
                  : isSelected
                  ? 'bg-slate-100 font-bold text-slate-900'
                  : 'hover:bg-slate-100/60 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase">{d.dayName}</div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                    d.isToday
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-900'
                  }`}
                >
                  {d.dayNum}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                    {dayEvents.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Rows */}
      <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
        {CALENDAR_HOURS.map((hour) => {
          return (
            <div key={hour} className="grid grid-cols-8 divide-x divide-slate-100 min-h-[75px] group">
              {/* Hour Label */}
              <div className="p-2 text-right text-[11px] font-mono font-semibold text-slate-400 bg-slate-50/40 select-none">
                {formatTimeDisplay(hour, clockMode)}
              </div>

              {/* 7 Day Slot Columns */}
              {weekDays.map((d) => {
                const dayEvents = eventsByDay.get(d.dateStr) || [];
                // Events that start in this hour slot
                const matchingEvents = dayEvents.filter((evt) => {
                  const evtStartHour = evt.startTime.split(':')[0] + ':00';
                  return evtStartHour === hour;
                });

                return (
                  <div
                    key={d.dateStr}
                    onClick={() => onCreateEventSlot(d.dateStr, hour)}
                    className="p-1 relative hover:bg-indigo-50/30 transition-colors cursor-pointer flex flex-col gap-1 group/slot"
                    title={`Click to schedule at ${d.dayName} ${formatTimeDisplay(hour, clockMode)}`}
                  >
                    {/* Render matching events */}
                    {matchingEvents.map((evt) => {
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
                          className={`p-2 rounded-xl border text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs hover:scale-[1.02] cursor-pointer ${typeCfg.blockBg} ${typeCfg.blockBorder}`}
                        >
                          <div className="flex items-center justify-between gap-1 leading-tight">
                            <span className="font-extrabold truncate text-xs">{evt.title}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${confCfg.dot}`}
                              title={confCfg.label}
                            />
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 mt-1">
                            <Clock size={10} />
                            <span>{formatTimeRange(evt.startTime, evt.endTime, clockMode)}</span>
                          </div>

                          {evt.location && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-600 truncate mt-0.5">
                              <MapPin size={9} />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quick plus icon on empty slot hover */}
                    {matchingEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 pointer-events-none transition-opacity">
                        <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs text-[10px] font-bold flex items-center gap-0.5">
                          <Plus size={11} /> Add
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
