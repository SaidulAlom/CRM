import React, { useMemo } from 'react';
import {
  Clock,
  Plus,
  Users,
  MapPin,
  Video,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  MoveRight,
  ArrowUpDown,
  MoreVertical,
  Briefcase,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Event, Call, Task, User as CRMUser } from '../../../types';
import {
  CALENDAR_HOURS,
  getEventTypeConfig,
  CONFIRMATION_STATUS_CONFIG,
  EventTypeConfig,
  formatTimeRange,
} from './calendarConstants';
import { formatTimeDisplay } from '../../../utils/profileUtils';

interface DailyScheduleViewProps {
  selectedDate: string;
  events: Event[];
  calls: Call[];
  tasks: Task[];
  users: CRMUser[];
  clockMode: '12h' | '24h';
  customEventTypes: EventTypeConfig[];
  onOpenEventDetail: (event: Event) => void;
  onCreateEventSlot: (dateStr: string, timeStr: string) => void;
  onQuickReschedule: (eventId: string, deltaMinutes: number) => void;
  onQuickDurationChange: (eventId: string, newDurationMinutes: number) => void;
}

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({
  selectedDate,
  events,
  calls,
  tasks,
  users,
  clockMode,
  customEventTypes,
  onOpenEventDetail,
  onCreateEventSlot,
  onQuickReschedule,
  onQuickDurationChange,
}) => {
  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.startDate === selectedDate && !e.deletedAt)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate]);

  const dayCalls = useMemo(() => {
    return calls.filter((c) => c.date === selectedDate && !c.deletedAt);
  }, [calls, selectedDate]);

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => t.deadline === selectedDate && !t.deletedAt);
  }, [tasks, selectedDate]);

  const dateObj = new Date(selectedDate + 'T12:00:00');
  const formattedDayTitle = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0">
      {/* Daily Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-indigo-400/20">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">{formattedDayTitle}</h3>
            <p className="text-xs text-slate-300">
              {dayEvents.length} events, {dayCalls.length} calls, {dayTasks.length} task deadlines scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCreateEventSlot(selectedDate, '09:00')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Add Event Today</span>
          </button>
        </div>
      </div>

      {/* Hourly Timeline Grid */}
      <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
        {CALENDAR_HOURS.map((hour) => {
          const matchingEvents = dayEvents.filter((e) => {
            const h = e.startTime.split(':')[0] + ':00';
            return h === hour;
          });

          return (
            <div
              key={hour}
              className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 min-h-[90px] group/hour hover:bg-slate-50/50 transition-colors"
            >
              {/* Hour Column (Left) */}
              <div className="w-28 shrink-0 p-3 bg-slate-50/50 flex flex-col justify-between text-right select-none">
                <span className="font-mono font-bold text-xs text-slate-700">
                  {formatTimeDisplay(hour, clockMode)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatTimeDisplay(hour.replace(':00', ':30'), clockMode)}
                </span>
              </div>

              {/* Event Activities & Slot Column (Right) */}
              <div
                onClick={() => onCreateEventSlot(selectedDate, hour)}
                className="flex-1 p-2.5 relative flex flex-col gap-2.5 cursor-pointer min-h-[90px]"
              >
                {/* Event Cards */}
                {matchingEvents.map((evt) => {
                  const typeCfg = getEventTypeConfig(evt.eventType, customEventTypes);
                  const confStatus = evt.confirmationStatus || (evt.confirmed ? 'Confirmed' : 'Pending');
                  const confCfg = CONFIRMATION_STATUS_CONFIG[confStatus] || CONFIRMATION_STATUS_CONFIG.Pending;

                  const attendees = (evt.participantIds || [])
                    .map((id) => users.find((u) => u.id === id))
                    .filter(Boolean);

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEventDetail(evt);
                      }}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all space-y-3 cursor-pointer"
                    >
                      {/* Title & Status Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: typeCfg.dotColor }}
                          />
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {evt.title}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`}>
                            {typeCfg.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${confCfg.badge}`}>
                            {confCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Time, Location & Record Relationship */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 font-mono text-slate-900 font-bold">
                          <Clock size={13} className="text-indigo-600" />
                          {formatTimeRange(evt.startTime, evt.endTime, clockMode)} ({evt.durationMinutes || 60}m)
                        </span>

                        {evt.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{evt.location}</span>
                          </span>
                        )}

                        {evt.meetingLink && (
                          <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                            <Video size={13} />
                            <span>Online Video Room</span>
                          </span>
                        )}

                        {evt.companyId && (
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Building2 size={13} className="text-slate-400" />
                            <span>Associated Client</span>
                          </span>
                        )}
                      </div>

                      {/* Attendees Avatars & Reschedule Quick Controls */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Attendee Roster */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Roster:</span>
                          <div className="flex -space-x-1.5">
                            {attendees.map((u) => (
                              <img
                                key={u?.id}
                                src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={u?.name}
                                title={u?.name}
                                className="w-5 h-5 rounded-full object-cover border border-white"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-600 font-semibold">
                            {attendees.map((u) => u?.name.split(' ')[0]).join(', ')}
                          </span>
                        </div>

                        {/* Quick Reschedule & Duration Adjust buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5"
                        >
                          <span className="text-[10px] text-slate-400 mr-1">Quick Move:</span>
                          <button
                            type="button"
                            onClick={() => onQuickReschedule(evt.id, -60)}
                            className="px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition-colors"
                            title="Move 1 hour earlier"
                          >
                            -1h
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickReschedule(evt.id, 60)}
                            className="px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition-colors"
                            title="Move 1 hour later"
                          >
                            +1h
                          </button>

                          <span className="text-[10px] text-slate-400 mx-1">Duration:</span>
                          {[30, 45, 60, 90].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => onQuickDurationChange(evt.id, dur)}
                              className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold transition-colors ${
                                evt.durationMinutes === dur
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {dur}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slot placeholder */}
                {matchingEvents.length === 0 && (
                  <div className="h-full flex items-center text-slate-300 text-xs italic opacity-0 group-hover/hour:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1">
                      <Plus size={12} /> Click to schedule at {formatTimeDisplay(hour, clockMode)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
