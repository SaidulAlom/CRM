import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Calendar,
  Clock,
  User,
  Users,
  Building2,
  Phone,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Globe,
  PlusCircle,
  BookOpen,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillContactId?: string;
  prefillCompanyId?: string;
}

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT/BST) - London' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris/Berlin' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - New Delhi' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT) - Singapore' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export const ScheduleCallModal: React.FC<ScheduleCallModalProps> = ({
  isOpen,
  onClose,
  prefillContactId,
  prefillCompanyId,
}) => {
  const {
    contacts,
    companies,
    users,
    currentUser,
    callScripts,
    fieldSets,
    addCall,
    checkUserAvailability,
    defaultCompany,
  } = useCRM();

  // Mode: Lookup existing contact/company vs. manual entry
  const [recipientMode, setRecipientMode] = useState<'crm' | 'manual'>(
    prefillContactId ? 'crm' : 'crm'
  );

  // Form Fields
  const [subject, setSubject] = useState('');
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  
  // Date & Time
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [callDate, setCallDate] = useState(tomorrowStr);
  const [callTime, setCallTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  );

  // Scheduling checkbox (core requirement)
  const [scheduleOnCalendar, setScheduleOnCalendar] = useState(true);

  // Reminder notification
  const [reminderMinutes, setReminderMinutes] = useState(15);

  // Script selection
  const [selectedScriptId, setSelectedScriptId] = useState<string>(
    callScripts[0]?.id || ''
  );

  // Assigned team member
  const [assignedUserId, setAssignedUserId] = useState<string>(currentUser.id);

  // CRM Record Lookup
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    prefillCompanyId || defaultCompany?.id || ''
  );
  const [selectedContactId, setSelectedContactId] = useState<string>(
    prefillContactId || ''
  );

  // Manual Contact Entry fields
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [createContactFromManual, setCreateContactFromManual] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Validation / Feedback error
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successScheduled, setSuccessScheduled] = useState(false);

  // Filter contacts by selected company if chosen
  const filteredContacts = useMemo(() => {
    const list = contacts.filter((c) => !c.deletedAt);
    if (!selectedCompanyId) return list;
    return list.filter((c) => c.companyId === selectedCompanyId);
  }, [contacts, selectedCompanyId]);

  // When a contact is selected, auto-populate company and phone if empty
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        if (contact.companyId && !selectedCompanyId) {
          setSelectedCompanyId(contact.companyId);
        }
        if (!subject) {
          setSubject(`Follow-up Call with ${contact.firstName} ${contact.lastName}`);
        }
      }
    }
  };

  // Calculate calculated end time
  const calculatedEndTime = useMemo(() => {
    if (!callTime) return '';
    const [h, m] = callTime.split(':').map((v) => Number(v) || 0);
    const totalMinutes = h * 60 + m + Number(durationMinutes);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  }, [callTime, durationMinutes]);

  // Check availability of assigned user
  const availabilityStatus = useMemo(() => {
    if (!callDate || !callTime || !assignedUserId) return null;
    return checkUserAvailability(assignedUserId, callDate, callTime, calculatedEndTime || '11:00');
  }, [assignedUserId, callDate, callTime, calculatedEndTime, checkUserAvailability]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!subject.trim()) {
      setValidationError('Please enter a call subject.');
      return;
    }

    if (!callDate) {
      setValidationError('Please select a valid date for the call.');
      return;
    }

    // Past date/time validation (prevent accidental scheduling in past)
    const scheduledDateTime = new Date(`${callDate}T${callTime || '00:00'}:00`);
    const now = new Date();
    // allow 2 minute grace period for current time
    if (scheduleOnCalendar && scheduledDateTime.getTime() < now.getTime() - 2 * 60 * 1000) {
      setValidationError('Scheduled call cannot be in the past. Please choose a future date and time.');
      return;
    }

    let contactIdToSave: string | undefined = undefined;
    let companyIdToSave: string | undefined = undefined;
    let extName: string | undefined = undefined;
    let extPhone: string | undefined = undefined;

    if (recipientMode === 'crm') {
      contactIdToSave = selectedContactId || undefined;
      companyIdToSave = selectedCompanyId || undefined;
      const foundContact = contacts.find((c) => c.id === selectedContactId);
      if (foundContact) {
        extName = `${foundContact.firstName} ${foundContact.lastName}`;
        extPhone = foundContact.phone || undefined;
      }
    } else {
      extName = manualName.trim() || undefined;
      extPhone = manualPhone.trim() || undefined;
      if (manualCompany.trim()) {
        const existingComp = companies.find(
          (c) => c.name.toLowerCase() === manualCompany.trim().toLowerCase()
        );
        companyIdToSave = existingComp?.id;
      }
    }

    try {
      addCall(
        {
          subject: subject.trim(),
          date: callDate,
          time: callTime,
          durationMinutes: Number(durationMinutes),
          timeZone,
          reminderMinutes: Number(reminderMinutes),
          direction,
          outcomeStatus: 'Scheduled',
          companyId: companyIdToSave,
          contactId: contactIdToSave,
          externalName: extName,
          externalPhone: extPhone,
          assignedUserId,
          scriptId: selectedScriptId || undefined,
          notes: notes.trim() || undefined,
          isScheduled: scheduleOnCalendar,
          isCompleted: false,
        },
        recipientMode === 'manual' && createContactFromManual
      );

      setSuccessScheduled(true);
      setTimeout(() => {
        setSuccessScheduled(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setValidationError(err.message || 'An error occurred while scheduling the call.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="schedule-call-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-in fade-in-50 duration-150"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Schedule a Call
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Calls & Calendar
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Plan future phone conversations, assign owners, select call scripts, and sync to My Calendar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {successScheduled ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Call Scheduled Successfully!</h3>
            <p className="text-xs text-slate-600">
              {scheduleOnCalendar
                ? 'The call has been added to your Active Call Queues and an event was created on your Calendar.'
                : 'The call has been saved in your Call Queue.'}
            </p>
          </div>
        ) : (
          /* Main Form Body */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Validation Alert */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Call Subject & Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Call Subject / Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Discovery call regarding enterprise pipeline"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="outbound">Outbound (We Call)</option>
                    <option value="inbound">Inbound (Expected Call)</option>
                  </select>
                </div>
              </div>

              {/* Calendar Sync Checkbox Card (Primary User Requirement) */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="schedule-calendar-event-sync"
                  checked={scheduleOnCalendar}
                  onChange={(e) => setScheduleOnCalendar(e.target.checked)}
                  className="mt-0.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="schedule-calendar-event-sync"
                  className="text-xs text-slate-800 cursor-pointer select-none leading-relaxed"
                >
                  <span className="font-bold text-indigo-950 block">
                    Schedule this call for the date below and create an event entry for it in My Calendar
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Automatically blocks the selected time slot on your calendar and alerts team participants.
                  </span>
                </label>
              </div>

              {/* Date, Start Time, Duration & End Time */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Clock size={14} className="text-violet-600" />
                    Date, Time & Duration
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Duration calculates end time automatically
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Call Date *</label>
                    <input
                      type="date"
                      required
                      value={callDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCallDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Duration</label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes (1 hr)</option>
                      <option value={90}>90 minutes (1.5 hr)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Calculated End Time</label>
                    <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                      {calculatedEndTime || '--:--'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Globe size={13} className="text-slate-500" />
                      Time Zone
                    </label>
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Bell size={13} className="text-slate-500" />
                      Reminder Notification
                    </label>
                    <select
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>No reminder</option>
                      <option value={5}>5 minutes before</option>
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                </div>

                {/* Team member availability banner */}
                {availabilityStatus && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-[11px] flex items-center justify-between border ${
                      availabilityStatus.available
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {availabilityStatus.available ? (
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={13} className="text-amber-600" />
                      )}
                      <span>
                        {availabilityStatus.available
                          ? 'Assigned team member is available during this time slot.'
                          : `Availability notice: ${availabilityStatus.reason || 'User may be busy or on leave.'}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment & Call Script */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-slate-500" />
                    Assigned Team Member *
                  </label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <BookOpen size={13} className="text-slate-500" />
                    Call Script (Predefined Guidance)
                  </label>
                  <select
                    value={selectedScriptId}
                    onChange={(e) => setSelectedScriptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Script / Freeform Call</option>
                    {callScripts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.elements.length} prompts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipient Lookup: CRM Record vs Manual Entry */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Contact & Client Association
                    </span>
                  </div>

                  {/* Mode switcher */}
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRecipientMode('crm')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        recipientMode === 'crm'
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Lookup Existing Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode('manual')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        recipientMode === 'manual'
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                {recipientMode === 'crm' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Building2 size={13} className="text-slate-500" />
                        Client / Company
                      </label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => {
                          setSelectedCompanyId(e.target.value);
                          setSelectedContactId('');
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Company / Client...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.industry ? `(${c.industry})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <User size={13} className="text-slate-500" />
                        Contact Person
                      </label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => handleContactSelect(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Contact...</option>
                        {filteredContacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} {c.phone ? `(${c.phone})` : `(${c.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Contact Name *</label>
                        <input
                          type="text"
                          required={recipientMode === 'manual'}
                          placeholder="e.g. Alex Morgan"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Company / Organization</label>
                        <input
                          type="text"
                          placeholder="e.g. Pinnacle Ventures"
                          value={manualCompany}
                          onChange={(e) => setManualCompany(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 019-2834"
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="create-contact-from-manual-cb"
                        checked={createContactFromManual}
                        onChange={(e) => setCreateContactFromManual(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="create-contact-from-manual-cb"
                        className="text-[11px] text-slate-700 cursor-pointer"
                      >
                        Automatically save "{manualName || 'this person'}" as a new contact in CRM
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Notes & Agenda */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText size={13} className="text-slate-500" />
                  Call Notes & Preparation Points
                </label>
                <textarea
                  rows={3}
                  placeholder="Key questions to ask, background context, proposal numbers, or client goals..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Scheduled calls appear in <strong className="text-slate-700 font-semibold">Active Call Queues</strong> & My Calendar.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-schedule-call-btn"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Calendar size={14} />
                  <span>Confirm Schedule Call</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
