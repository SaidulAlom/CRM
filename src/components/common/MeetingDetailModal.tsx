import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  Edit3,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Briefcase,
  LifeBuoy,
  FileText,
  X,
  Bell,
  Check,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Event, MeetingStatus } from '../../types';
import { BrandLogo } from './BrandLogo';

interface MeetingDetailModalProps {
  meeting: Event | null;
  onClose: () => void;
  onEdit: (meeting: Event) => void;
}

const OUTCOME_OPTIONS = [
  'Successful - Next Steps Defined',
  'Follow-up Proposal Requested',
  'Contract Terms In Review',
  'Client Rescheduled',
  'Stakeholder No-Show',
  'Completed - Routine Sync',
];

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  onClose,
  onEdit,
}) => {
  const {
    users,
    companies,
    contacts,
    deals,
    cases,
    currentUser,
    cancelMeeting,
    rescheduleMeeting,
    recordMeetingOutcome,
    updateMeeting,
    openRecordDetail,
    setActiveNav,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'reschedule' | 'outcome'>(
    'details'
  );

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [currentNotes, setCurrentNotes] = useState(meeting?.notes || '');

  // Outcome state
  const [selectedOutcome, setSelectedOutcome] = useState(
    meeting?.meetingOutcome || OUTCOME_OPTIONS[0]
  );
  const [outcomeNotes, setOutcomeNotes] = useState(meeting?.outcomeNotes || '');
  const [outcomeSaved, setOutcomeSaved] = useState(false);

  // Reschedule state
  const [newDate, setNewDate] = useState(meeting?.startDate || '');
  const [newStart, setNewStart] = useState(meeting?.startTime || '10:00');
  const [newEnd, setNewEnd] = useState(meeting?.endTime || '11:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Cancel state
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!meeting) return null;

  const organizer = users.find((u) => u.id === meeting.ownerId);
  const participants = (meeting.participantIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  const linkedCompany = meeting.companyId ? companies.find((c) => c.id === meeting.companyId) : null;
  const linkedContact = meeting.contactId ? contacts.find((c) => c.id === meeting.contactId) : null;
  const linkedDeal = meeting.dealId ? deals.find((d) => d.id === meeting.dealId) : null;
  const linkedCase = meeting.caseId ? cases.find((c) => c.id === meeting.caseId) : null;

  const handleSaveNotes = () => {
    if (!newNoteText.trim()) return;
    const updated = currentNotes
      ? `${currentNotes}\n\n[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} by ${currentUser.name}]:\n${newNoteText.trim()}`
      : `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} by ${currentUser.name}]:\n${newNoteText.trim()}`;

    setCurrentNotes(updated);
    updateMeeting(meeting.id, { notes: updated, agenda: updated }, false);
    setNewNoteText('');
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    recordMeetingOutcome(meeting.id, selectedOutcome, outcomeNotes);
    setOutcomeSaved(true);
    setTimeout(() => setOutcomeSaved(false), 3000);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    rescheduleMeeting(meeting.id, newDate, newStart, newEnd, rescheduleReason);
    setRescheduleSuccess(true);
    setTimeout(() => {
      setRescheduleSuccess(false);
      onClose();
    }, 1500);
  };

  const handleConfirmCancel = () => {
    cancelMeeting(meeting.id, cancelReason);
    setShowCancelPrompt(false);
    onClose();
  };

  const getStatusBadge = (status?: MeetingStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Rescheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div
      id="meeting-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="meeting-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-xs text-slate-800"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <BrandLogo size="md" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                    meeting.meetingStatus
                  )}`}
                >
                  {meeting.meetingStatus || 'Scheduled'}
                </span>
                {meeting.reminderMinutes && (
                  <span className="flex items-center gap-1 text-[11px] text-indigo-200">
                    <Bell size={12} />
                    Reminder: {meeting.reminderMinutes}m before
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{meeting.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-300 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <CalendarIcon size={13} className="text-indigo-400" />
                  {new Date(meeting.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-indigo-200 font-semibold">
                  <Clock size={13} className="text-indigo-400" />
                  {meeting.startTime} – {meeting.endTime}
                </span>
                {meeting.location && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin size={13} className="text-indigo-400" />
                    {meeting.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar & Tabs */}
        <div className="px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'details'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Details & Attendees
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Notes & Agenda
            </button>
            <button
              onClick={() => setActiveTab('outcome')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'outcome'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Record Outcome
            </button>
            <button
              onClick={() => setActiveTab('reschedule')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'reschedule'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reschedule
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(meeting);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 text-xs shadow-2xs"
            >
              <Edit3 size={13} className="text-indigo-600" />
              <span>Edit Full Meeting</span>
            </button>

            {meeting.meetingStatus !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => setShowCancelPrompt(true)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold flex items-center gap-1.5 text-xs shadow-2xs"
              >
                <XCircle size={13} />
                <span>Cancel Meeting</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Details & Attendees */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Online meeting URL banner if exists */}
            {meeting.meetingLink && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <ExternalLink size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Virtual Video Room
                    </span>
                    <p className="text-xs font-mono font-medium text-slate-900 truncate max-w-md">
                      {meeting.meetingLink}
                    </p>
                  </div>
                </div>
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Join Meeting</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Attendees Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-600" />
                Meeting Participants ({participants.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map((u) => {
                  const isHost = u?.id === meeting.ownerId;
                  return (
                    <div
                      key={u?.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 truncate flex items-center gap-1.5">
                            {u?.name}
                            {isHost && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                                Host
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {u?.jobTitle || u?.role} · {u?.department || 'Apex Global'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Attending
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CRM Record Associations */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600" />
                Linked CRM Records
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkedCompany && (
                  <div
                    onClick={() => {
                      onClose();
                      openRecordDetail('company', linkedCompany.id);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <Building2 size={18} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</span>
                      <p className="font-bold text-xs text-slate-900 truncate">{linkedCompany.name}</p>
                      <p className="text-[10px] text-slate-500">{linkedCompany.industry}</p>
                    </div>
                  </div>
                )}

                {linkedContact && (
                  <div
                    onClick={() => {
                      onClose();
                      openRecordDetail('contact', linkedContact.id);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <Users size={18} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Contact / {linkedContact.type}
                      </span>
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {linkedContact.firstName} {linkedContact.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500">{linkedContact.email}</p>
                    </div>
                  </div>
                )}

                {linkedDeal && (
                  <div
                    onClick={() => {
                      onClose();
                      setActiveNav('deals');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <Briefcase size={18} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunity</span>
                      <p className="font-bold text-xs text-slate-900 truncate">{linkedDeal.title}</p>
                      <p className="text-[10px] text-slate-500">
                        ${linkedDeal.value.toLocaleString()} · Stage: {linkedDeal.stage}
                      </p>
                    </div>
                  </div>
                )}

                {linkedCase && (
                  <div
                    onClick={() => {
                      onClose();
                      setActiveNav('cases');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <LifeBuoy size={18} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Case</span>
                      <p className="font-bold text-xs text-slate-900 truncate">{linkedCase.title}</p>
                      <p className="text-[10px] text-slate-500">{linkedCase.problemName}</p>
                    </div>
                  </div>
                )}

                {!linkedCompany && !linkedContact && !linkedDeal && !linkedCase && (
                  <div className="col-span-2 p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                    No specific CRM company or contact linked to this meeting.
                  </div>
                )}
              </div>
            </div>

            {/* Description / Agenda view */}
            {meeting.agenda && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-600" />
                  Agenda & Description
                </h3>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {meeting.agenda}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Notes & Agenda */}
        {activeTab === 'notes' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Meeting Discussion Notes & Log
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Record real-time notes and action items during or after the meeting.
              </p>
            </div>

            {/* Existing Notes Display */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[120px] max-h-[220px] overflow-y-auto text-xs whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
              {currentNotes || <span className="italic text-slate-400">No notes recorded yet.</span>}
            </div>

            {/* Add new note entry */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                Append New Note / Action Item
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type note or agreed next steps..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Send size={13} />
                  <span>Append Note</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Record Outcome */}
        {activeTab === 'outcome' && (
          <form onSubmit={handleSaveOutcome} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Record Meeting Outcome
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Log the results of the meeting to update sales progress and notify colleagues.
              </p>
            </div>

            {outcomeSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Meeting outcome recorded successfully and status set to Completed!
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Outcome Status
              </label>
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                {OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Outcome Summary & Next Deliverables
              </label>
              <textarea
                rows={4}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Detail agreed deliverables, decision makers involved, and next milestones..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 size={15} />
                <span>Save Meeting Outcome</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Reschedule */}
        {activeTab === 'reschedule' && (
          <form onSubmit={handleConfirmReschedule} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Reschedule Meeting
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Moving this meeting will update attendee calendars and dispatch in-app notifications.
              </p>
            </div>

            {rescheduleSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Meeting rescheduled! Calendars updated and notifications sent.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Start Time</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">New End Time</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reason for Rescheduling (Optional)
              </label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Client requested 30 minute postponement due to board review"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw size={14} />
                <span>Confirm Reschedule & Notify</span>
              </button>
            </div>
          </form>
        )}

        {/* Cancellation Confirmation Prompt Overlay */}
        {showCancelPrompt && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 text-rose-900 space-y-3 animate-in fade-in-50 duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-900">Are you sure you want to cancel this meeting?</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  This will mark the meeting as Cancelled, remove scheduling blocks for all {participants.length} attendees, and dispatch cancellation notifications.
                </p>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason to share with attendees..."
                className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Keep Meeting
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Meeting ID: <span className="font-mono text-slate-700">{meeting.id}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
