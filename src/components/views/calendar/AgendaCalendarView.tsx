import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Building2,
  Briefcase,
  LifeBuoy,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Event, User as CRMUser, Company, Contact } from '../../../types';
import {
  getEventTypeConfig,
  CONFIRMATION_STATUS_CONFIG,
  EventTypeConfig,
  formatTimeRange,
} from './calendarConstants';
import { formatDateDisplay } from '../../../utils/profileUtils';

interface AgendaCalendarViewProps {
  events: Event[];
  users: CRMUser[];
  companies: Company[];
  contacts: Contact[];
  clockMode: '12h' | '24h';
  customEventTypes: EventTypeConfig[];
  onOpenEventDetail: (event: Event) => void;
  onCreateEvent: () => void;
}

export const AgendaCalendarView: React.FC<AgendaCalendarViewProps> = ({
  events,
  users,
  companies,
  contacts,
  clockMode,
  customEventTypes,
  onOpenEventDetail,
  onCreateEvent,
}) => {
  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, Event[]>();
    const sorted = [...events]
      .filter((e) => !e.deletedAt)
      .sort((a, b) => {
        const timeA = `${a.startDate}T${a.startTime}`;
        const timeB = `${b.startDate}T${b.startTime}`;
        return timeA.localeCompare(timeB);
      });

    sorted.forEach((e) => {
      const list = map.get(e.startDate) || [];
      list.push(e);
      map.set(e.startDate, list);
    });

    return Array.from(map.entries()).map(([dateStr, items]) => ({
      dateStr,
      items,
    }));
  }, [events]);

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Upcoming Agenda & Activity Stream</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological master list of scheduled meetings, customer visits, calls, and internal syncs.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600">
          {events.filter((e) => !e.deletedAt).length} Total Events
        </div>
      </div>

      {groupedEvents.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Calendar size={24} />
          </div>
          <div className="font-bold text-sm text-slate-800">No events found in this timeframe</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, user filter, or event type, or schedule a new event.
          </p>
          <button
            type="button"
            onClick={onCreateEvent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Create New Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(({ dateStr, items }) => {
            const dateObj = new Date(dateStr + 'T12:00:00');
            const isToday = dateStr === todayIso;
            const formattedHeader = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={dateStr} className="space-y-3">
                {/* Date Header Anchor */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {isToday ? 'Today · ' : ''}
                    {formattedHeader}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items in this date */}
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {items.map((evt) => {
                    const typeCfg = getEventTypeConfig(evt.eventType, customEventTypes);
                    const confStatus = evt.confirmationStatus || (evt.confirmed ? 'Confirmed' : 'Pending');
                    const confCfg = CONFIRMATION_STATUS_CONFIG[confStatus] || CONFIRMATION_STATUS_CONFIG.Pending;

                    const attendeeUsers = (evt.participantIds || [])
                      .map((id) => users.find((u) => u.id === id))
                      .filter(Boolean);

                    const linkedCompany = companies.find((c) => c.id === evt.companyId);
                    const linkedContact = contacts.find((ct) => ct.id === evt.contactId);

                    return (
                      <div
                        key={evt.id}
                        onClick={() => onOpenEventDetail(evt)}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Time badge */}
                          <div className="w-20 shrink-0 text-center py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50/40 transition-colors">
                            <div className="font-mono font-bold text-xs text-slate-900">
                              {evt.startTime}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              to {evt.endTime}
                            </div>
                          </div>

                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: typeCfg.dotColor }}
                              />
                              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {evt.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeCfg.badgeBg} ${typeCfg.badgeText} ${typeCfg.badgeBorder}`}
                              >
                                {typeCfg.label}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${confCfg.badge}`}
                              >
                                {confCfg.label}
                              </span>
                            </div>

                            {/* Location & Meeting Link */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              {evt.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-slate-400" />
                                  <span>{evt.location}</span>
                                </span>
                              )}

                              {evt.meetingLink && (
                                <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                                  <Video size={12} />
                                  <span>Online Meeting Room</span>
                                </span>
                              )}

                              {linkedCompany && (
                                <span className="flex items-center gap-1 text-slate-700 font-medium">
                                  <Building2 size={12} className="text-slate-400" />
                                  <span>{linkedCompany.name}</span>
                                </span>
                              )}

                              {linkedContact && (
                                <span className="flex items-center gap-1 text-slate-700 font-medium">
                                  <Users size={12} className="text-slate-400" />
                                  <span>{linkedContact.firstName} {linkedContact.lastName}</span>
                                </span>
                              )}
                            </div>

                            {/* Attendees avatars */}
                            {attendeeUsers.length > 0 && (
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[11px] text-slate-400">Roster:</span>
                                <div className="flex -space-x-1.5">
                                  {attendeeUsers.slice(0, 5).map((u) => (
                                    <img
                                      key={u?.id}
                                      src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                      alt={u?.name}
                                      title={u?.name}
                                      className="w-5 h-5 rounded-full object-cover border border-white"
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] text-slate-600 font-medium ml-1">
                                  {attendeeUsers.map((u) => u?.name.split(' ')[0]).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEventDetail(evt);
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
