import React, { useState, useMemo, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Event, MeetingStatus, ConfirmationStatus } from '../../types';
import { CalendarHeader } from './calendar/CalendarHeader';
import { MonthlyCalendarView } from './calendar/MonthlyCalendarView';
import { WeeklyCalendarView } from './calendar/WeeklyCalendarView';
import { DailyScheduleView } from './calendar/DailyScheduleView';
import { AgendaCalendarView } from './calendar/AgendaCalendarView';
import { DayActivitiesFlyout } from './calendar/DayActivitiesFlyout';
import { CustomEventTypeModal } from './calendar/CustomEventTypeModal';
import { EventTypeConfig, DEFAULT_EVENT_TYPES } from './calendar/calendarConstants';

export const CalendarView: React.FC = () => {
  const {
    events,
    calls,
    tasks,
    users,
    companies,
    contacts,
    currentUser,
    openCreateMeeting,
    openMeetingDetail,
    updateMeeting,
    rescheduleMeeting,
    logAudit,
  } = useCRM();

  // Primary Calendar State
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUserFilter, setActiveUserFilter] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<string>('all');

  // Modals & Flyouts
  const [inspectDateStr, setInspectDateStr] = useState<string | null>(null);
  const [isCustomTypesModalOpen, setIsCustomTypesModalOpen] = useState(false);

  // Custom Event Types state with localStorage persistence
  const [customEventTypes, setCustomEventTypes] = useState<EventTypeConfig[]>(() => {
    try {
      const saved = localStorage.getItem('crm_calendar_custom_types_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_calendar_custom_types_v1', JSON.stringify(customEventTypes));
    } catch {
      // ignore
    }
  }, [customEventTypes]);

  const clockMode = currentUser.preferences?.clockMode || '12h';

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (evt.deletedAt) return false;

      // User filter: 'all', currentUser, or specific userId
      if (activeUserFilter !== 'all') {
        const isParticipant = (evt.participantIds || []).includes(activeUserFilter);
        const isOwner = evt.ownerId === activeUserFilter;
        if (!isParticipant && !isOwner) return false;
      }

      // Department filter
      if (activeDepartmentFilter !== 'all') {
        const matchingUsersInDept = users.filter((u) => u.department === activeDepartmentFilter);
        const deptUserIds = new Set(matchingUsersInDept.map((u) => u.id));
        const hasDeptAttendee =
          deptUserIds.has(evt.ownerId) ||
          (evt.participantIds || []).some((pid) => deptUserIds.has(pid));
        if (!hasDeptAttendee) return false;
      }

      // Event Type filter
      if (activeTypeFilter !== 'all') {
        const evtType = (evt.eventType || 'Meeting').toLowerCase();
        if (evtType !== activeTypeFilter.toLowerCase()) return false;
      }

      // Confirmation Status filter
      if (activeStatusFilter !== 'all') {
        const status = evt.confirmationStatus || (evt.confirmed ? 'Confirmed' : 'Pending');
        if (status.toLowerCase() !== activeStatusFilter.toLowerCase()) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesLocation = evt.location?.toLowerCase().includes(q);
        const matchesNotes = evt.notes?.toLowerCase().includes(q);

        const company = companies.find((c) => c.id === evt.companyId);
        const matchesCompany = company?.name.toLowerCase().includes(q);

        const contact = contacts.find((ct) => ct.id === evt.contactId);
        const matchesContact =
          contact &&
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(q);

        if (!matchesTitle && !matchesLocation && !matchesNotes && !matchesCompany && !matchesContact) {
          return false;
        }
      }

      return true;
    });
  }, [
    events,
    activeUserFilter,
    activeDepartmentFilter,
    activeTypeFilter,
    activeStatusFilter,
    searchQuery,
    users,
    companies,
    contacts,
  ]);

  // Quick action: Open create event with prefilled date and time slot
  const handleCreateEventSlot = (dateStr: string, timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const endH = (h + 1) % 24;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${mStr || '00'}`;

    openCreateMeeting({
      date: dateStr,
      startTime: timeStr,
      endTime: endTimeStr,
    });
  };

  // Quick move by delta minutes
  const handleQuickReschedule = (eventId: string, deltaMinutes: number) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    try {
      const [sh, sm] = evt.startTime.split(':').map(Number);
      const [eh, em] = evt.endTime.split(':').map(Number);

      const newStartTotal = (sh * 60 + sm + deltaMinutes + 24 * 60) % (24 * 60);
      const newEndTotal = (eh * 60 + em + deltaMinutes + 24 * 60) % (24 * 60);

      const nsh = Math.floor(newStartTotal / 60);
      const nsm = newStartTotal % 60;
      const neh = Math.floor(newEndTotal / 60);
      const nem = newEndTotal % 60;

      const newStartTime = `${String(nsh).padStart(2, '0')}:${String(nsm).padStart(2, '0')}`;
      const newEndTime = `${String(neh).padStart(2, '0')}:${String(nem).padStart(2, '0')}`;

      rescheduleMeeting(
        eventId,
        evt.startDate,
        newStartTime,
        newEndTime,
        `Quickly moved by ${deltaMinutes > 0 ? `+${deltaMinutes}` : deltaMinutes} minutes`
      );
    } catch {
      // fallback
    }
  };

  // Quick duration change
  const handleQuickDurationChange = (eventId: string, newDurationMinutes: number) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    try {
      const [sh, sm] = evt.startTime.split(':').map(Number);
      const newEndTotal = (sh * 60 + sm + newDurationMinutes) % (24 * 60);
      const neh = Math.floor(newEndTotal / 60);
      const nem = newEndTotal % 60;
      const newEndTime = `${String(neh).padStart(2, '0')}:${String(nem).padStart(2, '0')}`;

      updateMeeting(
        eventId,
        {
          durationMinutes: newDurationMinutes,
          endTime: newEndTime,
        },
        true
      );
    } catch {
      // fallback
    }
  };

  // Custom Event Type Management
  const handleAddCustomType = (newType: EventTypeConfig) => {
    setCustomEventTypes((prev) => [...prev.filter((t) => t.type !== newType.type), newType]);
    logAudit('EVENT_TYPE_CREATED', `Created custom calendar event type "${newType.label}"`);
  };

  const handleDeleteCustomType = (typeName: string) => {
    setCustomEventTypes((prev) => prev.filter((t) => t.type !== typeName));
    logAudit('EVENT_TYPE_DELETED', `Removed custom calendar event type "${typeName}"`);
  };

  return (
    <div id="calendar-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Universal Calendar Header with Navigation, Segmented Views, and Filters */}
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeUserFilter={activeUserFilter}
        setActiveUserFilter={setActiveUserFilter}
        activeTypeFilter={activeTypeFilter}
        setActiveTypeFilter={setActiveTypeFilter}
        activeStatusFilter={activeStatusFilter}
        setActiveStatusFilter={setActiveStatusFilter}
        activeDepartmentFilter={activeDepartmentFilter}
        setActiveDepartmentFilter={setActiveDepartmentFilter}
        users={users}
        currentUser={currentUser}
        customEventTypes={customEventTypes}
        onCreateEvent={() => openCreateMeeting({ date: selectedDate })}
        onOpenCustomTypesModal={() => setIsCustomTypesModalOpen(true)}
      />

      {/* Main Calendar Viewport by Mode */}
      <div className="transition-all duration-150">
        {/* View Mode 1: Monthly Calendar */}
        {viewMode === 'month' && (
          <MonthlyCalendarView
            selectedDate={selectedDate}
            events={filteredEvents}
            calls={calls}
            tasks={tasks}
            customEventTypes={customEventTypes}
            clockMode={clockMode}
            onDateClick={(d) => setInspectDateStr(d)}
            onOpenEventDetail={openMeetingDetail}
            onCreateEventOnDate={(d) => openCreateMeeting({ date: d })}
          />
        )}

        {/* View Mode 2: Weekly Calendar */}
        {viewMode === 'week' && (
          <WeeklyCalendarView
            selectedDate={selectedDate}
            events={filteredEvents}
            users={users}
            clockMode={clockMode}
            customEventTypes={customEventTypes}
            onOpenEventDetail={openMeetingDetail}
            onCreateEventSlot={handleCreateEventSlot}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        )}

        {/* View Mode 3: Daily Schedule Calendar */}
        {viewMode === 'day' && (
          <DailyScheduleView
            selectedDate={selectedDate}
            events={filteredEvents}
            calls={calls}
            tasks={tasks}
            users={users}
            clockMode={clockMode}
            customEventTypes={customEventTypes}
            onOpenEventDetail={openMeetingDetail}
            onCreateEventSlot={handleCreateEventSlot}
            onQuickReschedule={handleQuickReschedule}
            onQuickDurationChange={handleQuickDurationChange}
          />
        )}

        {/* View Mode 4: Agenda / Chronological Master List */}
        {viewMode === 'agenda' && (
          <AgendaCalendarView
            events={filteredEvents}
            users={users}
            companies={companies}
            contacts={contacts}
            clockMode={clockMode}
            customEventTypes={customEventTypes}
            onOpenEventDetail={openMeetingDetail}
            onCreateEvent={() => openCreateMeeting({ date: selectedDate })}
          />
        )}
      </div>

      {/* Date Inspection Flyout Modal (When clicking date on Monthly View) */}
      <DayActivitiesFlyout
        isOpen={!!inspectDateStr}
        onClose={() => setInspectDateStr(null)}
        dateStr={inspectDateStr || ''}
        events={events}
        calls={calls}
        tasks={tasks}
        users={users}
        clockMode={clockMode}
        customEventTypes={customEventTypes}
        onCreateEvent={(d) => openCreateMeeting({ date: d })}
        onOpenDayView={(d) => {
          setSelectedDate(d);
          setViewMode('day');
        }}
        onOpenEventDetail={openMeetingDetail}
      />

      {/* Custom Event Types Configuration Modal */}
      <CustomEventTypeModal
        isOpen={isCustomTypesModalOpen}
        onClose={() => setIsCustomTypesModalOpen(false)}
        customTypes={customEventTypes}
        onAddCustomType={handleAddCustomType}
        onDeleteCustomType={handleDeleteCustomType}
      />
    </div>
  );
};
