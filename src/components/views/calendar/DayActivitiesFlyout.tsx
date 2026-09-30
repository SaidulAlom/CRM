import React from 'react';
import { X, Plus, Calendar, Clock, MapPin, Users, Video, ChevronRight, CheckCircle2, PhoneCall, CheckSquare } from 'lucide-react';
import { Event, Call, Task, User as CRMUser } from '../../../types';
import { getEventTypeConfig, CONFIRMATION_STATUS_CONFIG, formatTimeRange, EventTypeConfig } from './calendarConstants';
import { formatDateDisplay } from '../../../utils/profileUtils';

interface DayActivitiesFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  events: Event[];
  calls: Call[];
  tasks: Task[];
  users: CRMUser[];
  clockMode: '12h' | '24h';
  customEventTypes: EventTypeConfig[];
  onCreateEvent: (dateStr: string) => void;
  onOpenDayView: (dateStr: string) => void;
  onOpenEventDetail: (event: Event) => void;
}

export const DayActivitiesFlyout: React.FC<DayActivitiesFlyoutProps> = ({
  isOpen,
  onClose,
  dateStr,
  events,
  calls,
  tasks,
  users,
  clockMode,
  customEventTypes,
  onCreateEvent,
  onOpenDayView,
  onOpenEventDetail,
}) => {
  if (!isOpen || !dateStr) return null;

  const dayEvents = events.filter((e) => e.startDate === dateStr && !e.deletedAt);
  const dayCalls = calls.filter((c) => c.date === dateStr && !c.deletedAt);
  const dayTasks = tasks.filter((t) => t.deadline === dateStr && !t.deletedAt);
  const totalCount = dayEvents.length + dayCalls.length + dayTasks.length;

  const dateObj = new Date(dateStr + 'T12:00:00');
  const formattedDay = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-xs text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs font-bold">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{formattedDay}</h3>
              <p className="text-[11px] text-slate-300">
                {totalCount} scheduled activit{totalCount === 1 ? 'y' : 'ies'} on this date
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateEvent(dateStr);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Create Event on This Date</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDayView(dateStr);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Open Detailed Day Calendar</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {totalCount === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar size={22} />
              </div>
              <div className="text-slate-600 font-semibold text-xs">
                No events or activities scheduled for {formattedDay}.
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Click "Create Event on This Date" to book a client meeting, internal team sync, or follow-up activity.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Scheduled Events / Meetings */}
              {dayEvents.map((evt) => {
                const typeCfg = getEventTypeConfig(evt.eventType, customEventTypes);
                const confStatus = evt.confirmationStatus || (evt.confirmed ? 'Confirmed' : 'Pending');
                const confCfg = CONFIRMATION_STATUS_CONFIG[confStatus] || CONFIRMATION_STATUS_CONFIG.Pending;

                const attendeeUsers = (evt.participantIds || [])
                  .map((id) => users.find((u) => u.id === id))
                  .filter(Boolean);

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      onOpenEventDetail(evt);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: typeCfg.dotColor }}
                          />
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {evt.title}
                          </h4>
                          <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`}>
                            {typeCfg.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-0.5">
                          <span className="flex items-center gap-1 font-mono text-slate-700">
                            <Clock size={12} className="text-slate-400" />
                            {formatTimeRange(evt.startTime, evt.endTime, clockMode)}
                          </span>

                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" />
                              <span className="truncate max-w-[180px]">{evt.location}</span>
                            </span>
                          )}

                          {evt.meetingLink && (
                            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                              <Video size={11} />
                              Online Link
                            </span>
                          )}
                        </div>

                        {/* Attendees row */}
                        {attendeeUsers.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <span className="text-[10px] text-slate-400">Attendees:</span>
                            <div className="flex -space-x-1.5">
                              {attendeeUsers.slice(0, 4).map((u) => (
                                <img
                                  key={u?.id}
                                  src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                  alt={u?.name}
                                  title={u?.name}
                                  className="w-4 h-4 rounded-full object-cover border border-white"
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold ml-1">
                              {attendeeUsers.map((u) => u?.name.split(' ')[0]).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${confCfg.badge}`}>
                          {confCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Scheduled Calls */}
              {dayCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <PhoneCall size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{call.subject}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Call Time: {formatTimeRange(call.time, call.time, clockMode)} • Status: {call.status}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Phone Call
                  </span>
                </div>
              ))}

              {/* Scheduled Tasks */}
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <CheckSquare size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-[10px] text-slate-500">
                        Progress: {task.completionPercentage}% • Status: {task.status}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Task Deadline
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
