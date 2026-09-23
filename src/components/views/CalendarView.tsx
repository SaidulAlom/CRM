import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  Mail,
  MapPin,
  PhoneCall,
  Globe,
  Play,
} from 'lucide-react';
import { ScheduleCallModal } from '../common/ScheduleCallModal';

export const CalendarView: React.FC = () => {
  const {
    events,
    calls,
    users,
    companies,
    currentUser,
    checkUserAvailability,
    openQuickCreate,
    openRecordDetail,
    openCallConsole,
    addEvent,
  } = useCRM();

  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeUserFilter, setActiveUserFilter] = useState<string>('all');
  const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);

  // Month grid calculation
  const currentYear = new Date(selectedDate).getFullYear();
  const currentMonth = new Date(selectedDate).getMonth(); // 0-indexed

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const days = [];

    // Preceding blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: '' });
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => !e.deletedAt)
      .filter((e) => {
        if (activeUserFilter === 'all') return true;
        return e.participantIds.includes(activeUserFilter) || e.ownerId === activeUserFilter;
      });
  }, [events, activeUserFilter]);

  // Day View hours: 8:00 to 18:00 (FR-8.2)
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const dayEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.startDate === selectedDate);
  }, [filteredEvents, selectedDate]);

  const handlePrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div id="calendar-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Calendar & Schedule</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              {filteredEvents.length} events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Schedule meetings with live colleague availability checks (vacation/leave & region holidays).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Day View
            </button>
          </div>

          <button
            id="schedule-call-cal-btn"
            onClick={() => setShowScheduleCallModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs"
          >
            <PhoneCall size={14} />
            <span>Schedule Call</span>
          </button>

          <button
            id="create-event-btn"
            onClick={() => openQuickCreate('event')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
          >
            Today
          </button>
        </div>

        {/* User filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Calendar:</span>
          <select
            value={activeUserFilter}
            onChange={(e) => setActiveUserFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Everyone's Schedule</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month View (FR-8.1) */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {daysInMonth.map((d, index) => {
              if (!d.day) {
                return <div key={`empty-${index}`} className="bg-slate-50/40 min-h-[100px] p-2" />;
              }

              const dayEventsList = filteredEvents.filter((e) => e.startDate === d.dateStr);
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];
              const isSelected = d.dateStr === selectedDate;

              return (
                <div
                  key={d.dateStr}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    setViewMode('day');
                  }}
                  className={`min-h-[100px] p-2 cursor-pointer transition-colors ${
                    isToday ? 'bg-indigo-50/30' : isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {d.day}
                    </span>
                    {dayEventsList.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayEventsList.length} mtg
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEventsList.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-1 rounded bg-violet-50 text-violet-900 border border-violet-200/80 text-[10px] truncate font-medium"
                      >
                        {ev.startTime} {ev.title}
                      </div>
                    ))}
                    {dayEventsList.length > 2 && (
                      <div className="text-[10px] text-slate-400 font-medium pl-1">
                        +{dayEventsList.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day View (FR-8.2: hours down left, entries positioned proportionally on right) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any open hour slot to schedule a meeting or review participants.
              </p>
            </div>
            <button
              onClick={() => openQuickCreate('event')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              + Add Slot
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {hours.map((hr) => {
              const matchingEvents = dayEvents.filter(
                (ev) => ev.startTime.startsWith(hr.slice(0, 2))
              );

              return (
                <div key={hr} className="py-3 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-16 text-right font-mono text-xs font-semibold text-slate-400 pt-1">
                    {hr}
                  </div>

                  <div className="flex-1 min-h-[44px] flex flex-col gap-2">
                    {matchingEvents.length === 0 ? (
                      <div
                        onClick={() => openQuickCreate('event')}
                        className="text-slate-300 text-xs py-1 cursor-pointer hover:text-indigo-600"
                      >
                        — Open Slot (Click to schedule meeting)
                      </div>
                    ) : (
                      matchingEvents.map((ev) => {
                        const linkedCall = calls.find((c) => c.scheduledCalendarEventId === ev.id || c.id === ev.callId);
                        const isCallEvent = ev.title.startsWith('Call:') || !!linkedCall;

                        return (
                          <div
                            key={ev.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isCallEvent
                                ? 'bg-indigo-50/90 border-indigo-200'
                                : 'bg-violet-50/80 border-violet-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                {isCallEvent && <PhoneCall size={14} className="text-indigo-600 shrink-0" />}
                                {ev.title}
                              </span>
                              <span className="font-mono text-[11px] font-semibold text-violet-700">
                                {ev.startTime} - {ev.endTime}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                              <div className="flex items-center gap-4 text-[11px] text-slate-600">
                                {ev.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-slate-400" />
                                    {ev.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users size={12} className="text-slate-400" />
                                  {ev.participantIds.length} Participants
                                </span>
                                {ev.timeZone && (
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <Globe size={11} className="text-slate-400" />
                                    {ev.timeZone.split('/')[1] || ev.timeZone}
                                  </span>
                                )}
                                {ev.emailAlert && (
                                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                    <Mail size={12} />
                                    Alerts Active
                                  </span>
                                )}
                              </div>

                              {isCallEvent && linkedCall && !linkedCall.isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => openCallConsole(linkedCall.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold shadow-2xs flex items-center gap-1 transition-colors"
                                >
                                  <Play size={11} className="fill-white" />
                                  <span>Start Call</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        isOpen={showScheduleCallModal}
        onClose={() => setShowScheduleCallModal(false)}
      />
    </div>
  );
};
