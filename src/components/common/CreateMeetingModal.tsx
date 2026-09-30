import React, { useState, useEffect, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  X,
  Building2,
  User,
  Briefcase,
  LifeBuoy,
  FileText,
  Search,
  ArrowRight,
  ShieldAlert,
  Bell,
  Check,
  ChevronRight,
  Sparkles,
  Bookmark,
  BookmarkPlus,
  LayoutTemplate,
  Layers,
  Trash2,
  RotateCcw,
  Plus,
  Info,
} from 'lucide-react';
import { Event, User as CRMUser, MeetingStatus, MeetingLocationType, MeetingTemplate } from '../../types';
import { BrandLogo } from './BrandLogo';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMeeting?: Event | null;
  prefill?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    companyId?: string;
    contactId?: string;
    dealId?: string;
    caseId?: string;
    leadId?: string;
  };
}

const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const MEETING_STATUS_OPTIONS: MeetingStatus[] = [
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
  'Rescheduled',
];

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  editingMeeting,
  prefill,
}) => {
  const {
    users,
    currentUser,
    companies,
    contacts,
    deals,
    cases,
    createMeeting,
    updateMeeting,
    checkUserAvailability,
    defaultCompany,
    meetingTemplates,
    saveMeetingTemplate,
    deleteMeetingTemplate,
    resetMeetingTemplates,
  } = useCRM();

  // Active step or current values
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [locationType, setLocationType] = useState<MeetingLocationType>('office');
  const [location, setLocation] = useState('Executive Conference Room A');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/apex-sync');
  const [agenda, setAgenda] = useState('');
  const [organizerId, setOrganizerId] = useState(currentUser.id);
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>('Scheduled');
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);

  // Attendees: IDs of selected attendees (excluding organizer from left panel, organizer automatically included)
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [checkedAvailableUserIds, setCheckedAvailableUserIds] = useState<string[]>([]);
  const [activeInspectedUserId, setActiveInspectedUserId] = useState<string | null>(null);

  // CRM Record Association
  const [associationType, setAssociationType] = useState<
    'none' | 'company' | 'contact' | 'lead' | 'customer' | 'deal' | 'case'
  >('none');
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Conflict override
  const [overrideConflicts, setOverrideConflicts] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Search filter for available team members
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');

  // Meeting Templates State
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [templateBannerMessage, setTemplateBannerMessage] = useState<{
    name: string;
    duration: number;
  } | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');

  // Save Template Form State
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateCategory, setSaveTemplateCategory] = useState<
    'team' | 'sales' | 'engineering' | 'leadership' | 'client' | 'custom'
  >('custom');
  const [saveTemplateDescription, setSaveTemplateDescription] = useState('');
  const [saveTemplateDuration, setSaveTemplateDuration] = useState<number>(30);
  const [saveTemplateTitle, setSaveTemplateTitle] = useState('');
  const [saveTemplateAgenda, setSaveTemplateAgenda] = useState('');
  const [saveTemplateErrors, setSaveTemplateErrors] = useState<{ [key: string]: string }>({});

  // Populate form on open or editingMeeting change
  useEffect(() => {
    if (!isOpen) return;

    if (editingMeeting) {
      setTitle(editingMeeting.title || '');
      setDate(editingMeeting.startDate || tomorrowStr);
      setStartTime(editingMeeting.startTime || '10:00');
      setEndTime(editingMeeting.endTime || '11:00');
      setLocationType(editingMeeting.locationType || 'office');
      setLocation(editingMeeting.location || '');
      setMeetingLink(editingMeeting.meetingLink || '');
      setAgenda(editingMeeting.agenda || editingMeeting.notes || '');
      setOrganizerId(editingMeeting.ownerId || currentUser.id);
      setMeetingStatus(editingMeeting.meetingStatus || 'Scheduled');
      setReminderMinutes(editingMeeting.reminderMinutes ?? 15);
      setSelectedAttendeeIds(editingMeeting.participantIds || []);

      if (editingMeeting.companyId) {
        setAssociationType('company');
        setSelectedCompanyId(editingMeeting.companyId);
      } else if (editingMeeting.dealId) {
        setAssociationType('deal');
        setSelectedDealId(editingMeeting.dealId);
      } else if (editingMeeting.caseId) {
        setAssociationType('case');
        setSelectedCaseId(editingMeeting.caseId);
      } else if (editingMeeting.contactId) {
        const c = contacts.find((item) => item.id === editingMeeting.contactId);
        if (c?.type === 'lead') {
          setAssociationType('lead');
          setSelectedLeadId(c.id);
        } else if (c?.type === 'customer') {
          setAssociationType('customer');
          setSelectedContactId(c.id);
        } else {
          setAssociationType('contact');
          setSelectedContactId(editingMeeting.contactId);
        }
      } else {
        setAssociationType('none');
      }
    } else {
      // Default new meeting
      setTitle('Weekly Sales Meeting');
      const initialDate = prefill?.date || tomorrowStr;
      setDate(initialDate);
      setStartTime(prefill?.startTime || '10:00');
      setEndTime(prefill?.endTime || '11:00');
      setLocationType('office');
      setLocation('Office / Main Boardroom');
      setMeetingLink('https://meet.google.com/apex-team-sync');
      setAgenda('1. Pipeline review and deals status\n2. Key blockers and solution blueprints\n3. Client deliverables this week');
      setOrganizerId(currentUser.id);
      setMeetingStatus('Scheduled');
      setReminderMinutes(15);
      setOverrideConflicts(false);

      // Prepopulate attendee list with 2 default colleagues if available
      const initialAttendees = users
        .filter((u) => u.id !== currentUser.id && u.active)
        .slice(0, 2)
        .map((u) => u.id);
      setSelectedAttendeeIds(initialAttendees);

      // Prefill CRM record associations
      if (prefill?.companyId) {
        setAssociationType('company');
        setSelectedCompanyId(prefill.companyId);
      } else if (prefill?.dealId) {
        setAssociationType('deal');
        setSelectedDealId(prefill.dealId);
      } else if (prefill?.caseId) {
        setAssociationType('case');
        setSelectedCaseId(prefill.caseId);
      } else if (prefill?.contactId) {
        setAssociationType('contact');
        setSelectedContactId(prefill.contactId);
      } else if (defaultCompany) {
        setSelectedCompanyId(defaultCompany.id);
      }
    }

    setCheckedAvailableUserIds([]);
    setErrors({});
  }, [isOpen, editingMeeting, prefill, currentUser.id, defaultCompany]);

  // Compute duration in minutes based on start and end time
  const currentDurationMinutes = useMemo(() => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const diff = eh * 60 + em - (sh * 60 + sm);
      return diff > 0 ? diff : 60;
    } catch {
      return 60;
    }
  }, [startTime, endTime]);

  // Apply duration preset
  const handleApplyDuration = (minutes: number) => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const totalMinutes = sh * 60 + sm + minutes;
      const eh = Math.floor(totalMinutes / 60) % 24;
      const em = totalMinutes % 60;
      setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
    } catch (e) {
      console.warn('Failed to calculate end time', e);
    }
  };

  // Apply a template to automatically populate title, agenda, duration & location
  const handleLoadTemplate = (template: MeetingTemplate) => {
    setTitle(template.title);
    setAgenda(template.agenda);

    if (template.durationMinutes) {
      try {
        const [sh, sm] = startTime.split(':').map(Number);
        const totalMinutes = sh * 60 + sm + template.durationMinutes;
        const eh = Math.floor(totalMinutes / 60) % 24;
        const em = totalMinutes % 60;
        setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
      } catch (e) {
        console.warn('Failed to calculate end time for template', e);
      }
    }

    if (template.locationType) {
      setLocationType(template.locationType);
    }
    if (template.location !== undefined) {
      setLocation(template.location);
    }
    if (template.meetingLink !== undefined) {
      setMeetingLink(template.meetingLink);
    }
    if (template.reminderMinutes !== undefined) {
      setReminderMinutes(template.reminderMinutes);
    }

    setActiveTemplateId(template.id);
    setTemplateBannerMessage({
      name: template.name,
      duration: template.durationMinutes,
    });
    setIsTemplatesModalOpen(false);
  };

  // Open Save Template dialog pre-populated with current values
  const handleOpenSaveTemplateModal = () => {
    setSaveTemplateName(title ? `${title} Format` : 'Custom Meeting Format');
    setSaveTemplateCategory('custom');
    setSaveTemplateDescription(`Custom meeting template based on ${title || 'general discussion'}.`);
    setSaveTemplateTitle(title || 'New Meeting');
    setSaveTemplateAgenda(agenda || '');
    setSaveTemplateDuration(currentDurationMinutes || 30);
    setSaveTemplateErrors({});
    setIsSaveTemplateModalOpen(true);
  };

  // Confirm saving new template
  const handleConfirmSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};
    if (!saveTemplateName.trim()) {
      errs.name = 'Please provide a name for this template';
    }
    if (!saveTemplateTitle.trim()) {
      errs.title = 'Please provide a default title';
    }
    if (!saveTemplateAgenda.trim()) {
      errs.agenda = 'Please provide an agenda format';
    }
    if (Object.keys(errs).length > 0) {
      setSaveTemplateErrors(errs);
      return;
    }

    const saved = saveMeetingTemplate({
      name: saveTemplateName.trim(),
      category: saveTemplateCategory,
      description: saveTemplateDescription.trim(),
      title: saveTemplateTitle.trim(),
      agenda: saveTemplateAgenda.trim(),
      durationMinutes: saveTemplateDuration,
      locationType,
      location,
      meetingLink,
      reminderMinutes,
      isDefault: false,
    });

    setActiveTemplateId(saved.id);
    setTemplateBannerMessage({
      name: saved.name,
      duration: saved.durationMinutes,
    });
    setIsSaveTemplateModalOpen(false);
  };

  // Delete a custom template
  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMeetingTemplate(templateId);
    if (activeTemplateId === templateId) {
      setActiveTemplateId(null);
    }
  };

  // Active template reference
  const activeTemplate = useMemo(() => {
    return meetingTemplates.find((t) => t.id === activeTemplateId) || null;
  }, [meetingTemplates, activeTemplateId]);

  // Filtered templates for library browser
  const filteredTemplates = useMemo(() => {
    return meetingTemplates.filter((t) => {
      const matchesCategory =
        selectedTemplateCategory === 'all' ||
        (selectedTemplateCategory === 'custom' ? !t.isDefault : t.category === selectedTemplateCategory);
      const matchesSearch =
        templateSearchQuery === '' ||
        t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.agenda.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(templateSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [meetingTemplates, selectedTemplateCategory, templateSearchQuery]);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'team':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sales':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'client':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'leadership':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'engineering':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  // Helper to get attendee role / department label
  const getUserRoleDepartment = (user: CRMUser) => {
    if (user.jobTitle && user.department) return `${user.jobTitle} · ${user.department}`;
    if (user.jobTitle) return user.jobTitle;
    if (user.department) return `${user.role} · ${user.department}`;
    return user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Sales Manager' : 'Sales Executive';
  };

  // Check real-time availability for all users
  const userAvailabilityMap = useMemo(() => {
    const map = new Map<string, { available: boolean; status: 'free' | 'busy' | 'unavailable'; reason?: string; conflictingEvent?: any }>();
    users.forEach((u) => {
      const res = checkUserAvailability(u.id, date, startTime, endTime, editingMeeting?.id);
      map.set(u.id, res);
    });
    return map;
  }, [users, date, startTime, endTime, checkUserAvailability, editingMeeting?.id]);

  // Available users (all active users not in selectedAttendeeIds and not organizer)
  const availableUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.active &&
        !selectedAttendeeIds.includes(u.id) &&
        (attendeeSearchQuery === '' ||
          u.name.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(attendeeSearchQuery.toLowerCase())) ||
          (u.department && u.department.toLowerCase().includes(attendeeSearchQuery.toLowerCase())))
    );
  }, [users, selectedAttendeeIds, attendeeSearchQuery]);

  // Selected attendees list
  const selectedAttendees = useMemo(() => {
    return selectedAttendeeIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is CRMUser => Boolean(u));
  }, [selectedAttendeeIds, users]);

  // Attendees with conflicts
  const conflictedAttendees = useMemo(() => {
    return selectedAttendees.filter((u) => {
      const avail = userAvailabilityMap.get(u.id);
      return avail && !avail.available;
    });
  }, [selectedAttendees, userAvailabilityMap]);

  // Handle adding checked users to selected panel
  const handleAddCheckedUsers = () => {
    if (checkedAvailableUserIds.length === 0) return;
    setSelectedAttendeeIds((prev) => Array.from(new Set([...prev, ...checkedAvailableUserIds])));
    if (checkedAvailableUserIds[0]) {
      setActiveInspectedUserId(checkedAvailableUserIds[0]);
    }
    setCheckedAvailableUserIds([]);
  };

  // Handle single user click or quick add
  const handleAddSingleUser = (userId: string) => {
    setSelectedAttendeeIds((prev) => Array.from(new Set([...prev, userId])));
    setActiveInspectedUserId(userId);
    setCheckedAvailableUserIds((prev) => prev.filter((id) => id !== userId));
  };

  // Handle removing an attendee
  const handleRemoveAttendee = (userId: string) => {
    setSelectedAttendeeIds((prev) => prev.filter((id) => id !== userId));
    if (activeInspectedUserId === userId) {
      setActiveInspectedUserId(null);
    }
  };

  // Toggle user checkbox in available panel
  const toggleAvailableUserCheck = (userId: string) => {
    setCheckedAvailableUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    setActiveInspectedUserId(userId);
  };

  // Inspected user object for "Availability Information" pane
  const inspectedUser = useMemo(() => {
    if (activeInspectedUserId) {
      return users.find((u) => u.id === activeInspectedUserId);
    }
    // Default to first selected attendee or first available user
    if (selectedAttendees.length > 0) {
      return selectedAttendees[0];
    }
    if (availableUsers.length > 0) {
      return availableUsers[0];
    }
    return currentUser;
  }, [activeInspectedUserId, users, selectedAttendees, availableUsers, currentUser]);

  const inspectedAvailability = inspectedUser ? userAvailabilityMap.get(inspectedUser.id) : null;

  // Quick slot suggestion: shift to next available hour slot where everyone is free
  const handleSuggestNextSlot = () => {
    try {
      const [sh] = startTime.split(':').map(Number);
      const nextHour = (sh + 1) % 24;
      const endHour = (nextHour + 1) % 24;
      const newStart = `${String(nextHour).padStart(2, '0')}:00`;
      const newEnd = `${String(endHour).padStart(2, '0')}:00`;
      setStartTime(newStart);
      setEndTime(newEnd);
      setOverrideConflicts(false);
    } catch {
      setStartTime('14:00');
      setEndTime('15:00');
    }
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Meeting Name / Title is required.';
    }
    if (!date) {
      newErrors.date = 'Meeting date is required.';
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required.';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required.';
    } else if (startTime >= endTime) {
      newErrors.endTime = 'End time must be later than start time.';
    }

    if (conflictedAttendees.length > 0 && !overrideConflicts) {
      newErrors.conflicts = `${conflictedAttendees.length} selected attendee(s) have scheduling conflicts. Check the override box or adjust meeting time.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Determine linked records
    const finalCompanyId =
      associationType === 'company'
        ? selectedCompanyId
        : associationType === 'deal'
        ? deals.find((d) => d.id === selectedDealId)?.companyId
        : associationType === 'case'
        ? cases.find((c) => c.id === selectedCaseId)?.companyId
        : selectedCompanyId || undefined;

    const finalContactId =
      associationType === 'contact' || associationType === 'customer'
        ? selectedContactId
        : associationType === 'lead'
        ? selectedLeadId
        : undefined;

    const finalDealId = associationType === 'deal' ? selectedDealId : undefined;
    const finalCaseId = associationType === 'case' ? selectedCaseId : undefined;
    const finalLeadId = associationType === 'lead' ? selectedLeadId : undefined;

    const meetingPayload = {
      title: title.trim(),
      startDate: date,
      endDate: date,
      startTime,
      endTime,
      durationMinutes: currentDurationMinutes,
      reminderMinutes,
      location: location.trim(),
      locationType,
      meetingLink: meetingLink.trim(),
      agenda: agenda.trim(),
      notes: agenda.trim(),
      ownerId: organizerId,
      participantIds: Array.from(new Set([organizerId, ...selectedAttendeeIds])),
      confirmed: true,
      emailAlert: true,
      isMeeting: true,
      meetingStatus,
      companyId: finalCompanyId,
      contactId: finalContactId,
      dealId: finalDealId,
      caseId: finalCaseId,
      leadId: finalLeadId,
    };

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, meetingPayload, true);
    } else {
      createMeeting(meetingPayload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="create-meeting-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="create-meeting-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{editingMeeting ? 'Edit Event & Attendees' : 'Create Event / Meeting'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Calendar Module
                </span>
              </h2>
              <p className="text-[11px] text-indigo-200/90">
                Schedule synchronized events with real-time participant availability, conflict detection, and email alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Conflict Warning Alert if any attendee is busy */}
          {conflictedAttendees.length > 0 && (
            <div
              id="meeting-conflict-alert-banner"
              className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2.5 animate-in fade-in-50 duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={17} />
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">
                      Scheduling Conflict Detected ({conflictedAttendees.length} Busy Participant
                      {conflictedAttendees.length > 1 ? 's' : ''})
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      The following selected team members have conflicting engagements during{' '}
                      <span className="font-semibold">{startTime} – {endTime}</span> on{' '}
                      <span className="font-semibold">{date}</span>:
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {conflictedAttendees.map((u) => {
                        const status = userAvailabilityMap.get(u.id);
                        return (
                          <li key={u.id} className="flex items-center gap-1.5 text-[11px] font-medium text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="font-bold">{u.name}</span> — {status?.reason || 'Busy with another event'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSuggestNextSlot}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                >
                  <Clock size={12} />
                  <span>Suggest Next Slot</span>
                </button>
              </div>

              {/* Conflict override toggle */}
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overrideConflicts}
                    onChange={(e) => setOverrideConflicts(e.target.checked)}
                    className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-semibold text-amber-900">
                    Override conflicts and double-book anyway (Organizer Permission)
                  </span>
                </label>
                <span className="text-[10px] text-amber-700">
                  Meeting will be created on their calendar with conflict notice.
                </span>
              </div>
            </div>
          )}

          {/* Section 1: Meeting Details */}
          <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" />
                Meeting Details
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Step 1 of 3</span>
            </div>

            {/* Meeting Templates Feature Bar */}
            <div
              id="meeting-templates-bar"
              className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/70 border border-indigo-200/90 rounded-xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-indigo-300/40">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-indigo-950">Meeting Templates</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        ⚡ Quick Formats
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800/80">
                      Load standard formats to auto-populate title, agenda, and duration — or save your current setup.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id="browse-meeting-templates-btn"
                    type="button"
                    onClick={() => setIsTemplatesModalOpen(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <LayoutTemplate size={13} />
                    <span>Browse All ({meetingTemplates.length}) ▾</span>
                  </button>

                  <button
                    id="save-meeting-template-btn"
                    type="button"
                    onClick={handleOpenSaveTemplateModal}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Save current title, agenda, and duration as a reusable template"
                  >
                    <BookmarkPlus size={13} />
                    <span>Save as Template</span>
                  </button>
                </div>
              </div>

              {/* Quick Template Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-indigo-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70 mr-1 flex items-center gap-1">
                  <Layers size={11} />
                  Common Formats:
                </span>
                {meetingTemplates.slice(0, 6).map((tmpl) => {
                  const isCurrent = activeTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleLoadTemplate(tmpl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-indigo-700 text-white shadow-xs ring-2 ring-indigo-400'
                          : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100/70 hover:border-indigo-300'
                      }`}
                      title={`Load "${tmpl.name}": ${tmpl.durationMinutes} min, prefilled agenda and title`}
                    >
                      <span>⚡ {tmpl.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          isCurrent ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-50 text-indigo-700 font-semibold'
                        }`}
                      >
                        {tmpl.durationMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active template notification or custom message */}
              {templateBannerMessage && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>
                      Applied template <strong>"{templateBannerMessage.name}"</strong> — Title, agenda, and{' '}
                      <strong>{templateBannerMessage.duration}m</strong> duration automatically configured.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTemplateBannerMessage(null)}
                    className="text-emerald-600 hover:text-emerald-800 text-[10px] font-semibold p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Meeting Name / Title */}
              <div className="md:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Meeting Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-name-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Sales Meeting, Q3 Pipeline Alignment"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                    errors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-red-600 mt-1">{errors.title}</p>}
              </div>

              {/* Meeting Status */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Meeting Status
                </label>
                <select
                  value={meetingStatus}
                  onChange={(e) => setMeetingStatus(e.target.value as MeetingStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {MEETING_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="meeting-date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Start Time */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="meeting-start-time-input"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* End Time */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="meeting-end-time-input"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500 ${
                      errors.endTime ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.endTime && <p className="text-[10px] text-red-600 mt-1">{errors.endTime}</p>}
              </div>

              {/* Duration Helper Presets */}
              <div className="md:col-span-12 flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[11px] font-medium text-slate-500">Quick Duration:</span>
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleApplyDuration(preset.minutes)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      currentDurationMinutes === preset.minutes
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 ml-auto">
                  Calculated Duration: {currentDurationMinutes} mins
                </span>
              </div>

              {/* Location Type Selector */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Location Type
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 text-[11px] font-medium">
                  {(['office', 'online', 'custom'] as MeetingLocationType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLocationType(t)}
                      className={`py-1 rounded capitalize text-center transition-all ${
                        locationType === t
                          ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location / Physical Room */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Location / Room
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Office / Room 4B or Hybrid"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Meeting Link URL */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Meeting Link <span className="text-slate-400 font-normal">(Google Meet / Zoom URL)</span>
                </label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Organizer & Reminder */}
              <div className="md:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Organizer <span className="text-slate-400 font-normal">(Host)</span>
                </label>
                <select
                  value={organizerId}
                  onChange={(e) => setOrganizerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) {u.id === currentUser.id ? '— You' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  In-App Reminder
                </label>
                <div className="relative">
                  <Bell size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {REMINDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Agenda */}
              <div className="md:col-span-12">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Description / Agenda
                  </label>
                  <div className="flex items-center gap-2">
                    {activeTemplate && (
                      <button
                        type="button"
                        onClick={() => setAgenda(activeTemplate.agenda)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        title="Reload original agenda format from active template"
                      >
                        <RotateCcw size={10} />
                        <span>Reset to "{activeTemplate.name}" Format</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTemplatesModalOpen(true)}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                    >
                      <LayoutTemplate size={10} />
                      <span>Choose Template</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Outline key discussion topics, deliverables, and agenda items..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Team Members (Two-Panel Attendee Selection with Real-Time Availability) */}
          <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-600" />
                  Team Members & Live Availability
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select attendees from the left panel and click <strong>Add →</strong>. Availability is verified automatically for{' '}
                  <span className="font-mono text-slate-700">{startTime} – {endTime}</span>.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Step 2 of 3</span>
            </div>

            {/* Two-Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Panel: Available Team Members */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[320px]">
                <div className="p-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70 rounded-t-xl">
                  <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Available Team Members ({availableUsers.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Select to add</span>
                </div>

                {/* Filter search */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={attendeeSearchQuery}
                      onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                      placeholder="Search colleagues..."
                      className="w-full pl-8 pr-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white"
                    />
                  </div>
                </div>

                {/* Members list */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                  {availableUsers.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      All eligible team members added or none match filter.
                    </div>
                  ) : (
                    availableUsers.map((u) => {
                      const avail = userAvailabilityMap.get(u.id);
                      const isChecked = checkedAvailableUserIds.includes(u.id);
                      const isInspected = inspectedUser?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          onClick={() => setActiveInspectedUserId(u.id)}
                          className={`p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isInspected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleAvailableUserCheck(u.id);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-slate-900 truncate">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{getUserRoleDepartment(u)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {avail?.available ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Busy
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSingleUser(u.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Add directly"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer with Add Button */}
                <div className="p-2 border-t border-slate-100 bg-slate-50/70 rounded-b-xl flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {checkedAvailableUserIds.length} checked
                  </span>
                  <button
                    id="add-attendees-btn"
                    type="button"
                    onClick={handleAddCheckedUsers}
                    disabled={checkedAvailableUserIds.length === 0}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <span>Add →</span>
                  </button>
                </div>
              </div>

              {/* Middle Transfer Controls (Desktop) */}
              <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleAddCheckedUsers}
                  disabled={checkedAvailableUserIds.length === 0}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 shadow-2xs transition-all"
                  title="Move checked to Attendees"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Panel: Selected Attendees */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[320px]">
                <div className="p-2.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70 rounded-t-xl">
                  <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Selected Attendees ({selectedAttendees.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Calendar synchronization</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                  {/* Organizer row always displayed */}
                  {users
                    .filter((u) => u.id === organizerId)
                    .map((host) => {
                      const avail = userAvailabilityMap.get(host.id);
                      return (
                        <div
                          key={`host-${host.id}`}
                          onClick={() => setActiveInspectedUserId(host.id)}
                          className="p-2 rounded-lg flex items-center justify-between gap-2 bg-indigo-50/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={host.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={host.name}
                              className="w-7 h-7 rounded-full object-cover border border-indigo-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                                {host.name}
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                                  Organizer
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{getUserRoleDepartment(host)}</p>
                            </div>
                          </div>

                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {avail?.available ? 'Available' : 'Organizer'}
                          </span>
                        </div>
                      );
                    })}

                  {selectedAttendees.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      No attendees selected yet. Pick colleagues from the left panel and click Add →.
                    </div>
                  ) : (
                    selectedAttendees.map((u) => {
                      const avail = userAvailabilityMap.get(u.id);
                      const isInspected = inspectedUser?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          onClick={() => setActiveInspectedUserId(u.id)}
                          className={`p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isInspected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                          } ${!avail?.available ? 'bg-rose-50/40' : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-slate-900 truncate">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{getUserRoleDepartment(u)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {avail?.available ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Busy
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAttendee(u.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove attendee"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/70 rounded-b-xl flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>{selectedAttendees.length + 1} Total Calendar Participants</span>
                  {conflictedAttendees.length > 0 && (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle size={11} /> {conflictedAttendees.length} Busy
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4/5 Availability Information Inspector Pane */}
            {inspectedUser && (
              <div
                id="attendee-availability-info-pane"
                className="mt-3 bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Availability Information
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Time: {date} @ {startTime} – {endTime}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={inspectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={inspectedUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        {inspectedUser.name}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({getUserRoleDepartment(inspectedUser)})
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-slate-600">Status:</span>
                        {inspectedAvailability?.available ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            🟢 Available
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                            🔴 Busy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-right sm:max-w-md">
                    {inspectedAvailability?.available ? (
                      <p className="text-[11px] font-medium text-emerald-800 flex items-center justify-end gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        No conflicting events found.
                      </p>
                    ) : (
                      <div className="space-y-0.5 text-left sm:text-right">
                        <p className="text-[11px] font-bold text-red-700">
                          {inspectedAvailability?.reason || 'Conflict detected during this hour'}
                        </p>
                        {inspectedAvailability?.conflictingEvent && (
                          <p className="text-[10px] text-slate-500 font-mono">
                            Event: "{inspectedAvailability.conflictingEvent.title}" (
                            {inspectedAvailability.conflictingEvent.startTime} –{' '}
                            {inspectedAvailability.conflictingEvent.endTime})
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: CRM Record Association */}
          <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 size={14} className="text-indigo-600" />
                  CRM Record Association
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optionally link this meeting to an existing Company, Contact, Lead, Customer, Deal, or Support Case.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Step 3 of 3</span>
            </div>

            {/* Association Category Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl border border-slate-300/80">
              {[
                { id: 'none', label: 'No Link' },
                { id: 'company', label: 'Company' },
                { id: 'contact', label: 'Contact' },
                { id: 'lead', label: 'Lead' },
                { id: 'customer', label: 'Customer' },
                { id: 'deal', label: 'Deal' },
                { id: 'case', label: 'Support Case' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAssociationType(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    associationType === tab.id
                      ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Searchable record selection input */}
            {associationType !== 'none' && (
              <div className="space-y-3 pt-1">
                {/* Company select */}
                {associationType === 'company' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Company
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Company --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} · {c.industry} ({c.priority} Priority)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contact select */}
                {associationType === 'contact' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Contact
                    </label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Contact --</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} · {c.email} ({c.jobTitle || c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Lead select */}
                {associationType === 'lead' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Lead Contact
                    </label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Lead --</option>
                      {contacts
                        .filter((c) => c.type === 'lead')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} · {c.email} ({c.jobTitle || 'Lead'})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Customer select */}
                {associationType === 'customer' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Customer Contact
                    </label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Customer --</option>
                      {contacts
                        .filter((c) => c.type === 'customer')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} · {c.email} ({c.jobTitle || 'Customer'})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Deal select */}
                {associationType === 'deal' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Opportunity / Deal
                    </label>
                    <select
                      value={selectedDealId}
                      onChange={(e) => setSelectedDealId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Deal --</option>
                      {deals.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title} · ${d.value.toLocaleString()} ({d.stage})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Case select */}
                {associationType === 'case' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Support Case
                    </label>
                    <select
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">-- Choose Support Case --</option>
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} · {c.problemName} ({c.priority} Priority - {c.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation errors summary if any */}
          {errors.conflicts && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <ShieldAlert size={15} />
              {errors.conflicts}
            </p>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                id="submit-create-meeting-btn"
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>{editingMeeting ? 'Save Meeting Changes' : 'Create Meeting'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal 1: Browse All Meeting Templates Library */}
        {isTemplatesModalOpen && (
          <div
            id="meeting-templates-browser-backdrop"
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-3 sm:p-4 animate-in fade-in duration-150"
          >
            <div
              id="meeting-templates-browser-modal"
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden text-xs text-slate-800"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
                    <LayoutTemplate size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Meeting Templates Library
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {meetingTemplates.length} Available
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Select a standard format to auto-populate the meeting title, agenda, and default duration.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplatesModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Toolbar & Search */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      placeholder="Search templates by name, title, or agenda content..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    {templateSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTemplateSearchQuery('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplatesModalOpen(false);
                      handleOpenSaveTemplateModal();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                  >
                    <Plus size={13} />
                    <span>Save Current as New Template</span>
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Templates', count: meetingTemplates.length },
                    { id: 'team', label: 'Team Syncs', count: meetingTemplates.filter((t) => t.category === 'team').length },
                    { id: 'sales', label: 'Sales & Deals', count: meetingTemplates.filter((t) => t.category === 'sales').length },
                    { id: 'client', label: 'Clients & Kickoffs', count: meetingTemplates.filter((t) => t.category === 'client').length },
                    { id: 'leadership', label: 'Leadership & 1:1', count: meetingTemplates.filter((t) => t.category === 'leadership').length },
                    { id: 'custom', label: 'Custom Saved', count: meetingTemplates.filter((t) => !t.isDefault).length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedTemplateCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        selectedTemplateCategory === cat.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <LayoutTemplate size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-xs">No matching templates found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Try adjusting your search query or category filter.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateSearchQuery('');
                        setSelectedTemplateCategory('all');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => {
                      const isCurrent = activeTemplateId === template.id;
                      return (
                        <div
                          key={template.id}
                          className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                            isCurrent
                              ? 'border-indigo-500 ring-2 ring-indigo-400/50 bg-indigo-50/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-slate-900">{template.name}</h4>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                                      template.category
                                    )}`}
                                  >
                                    {template.category}
                                  </span>
                                  {!template.isDefault && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                    {template.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px] font-bold flex items-center gap-1">
                                  <Clock size={10} />
                                  {template.durationMinutes}m
                                </span>
                                {!template.isDefault && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete custom template"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Default Title Preview */}
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Meeting Title:
                              </span>
                              <p className="text-[11px] font-medium text-slate-800">{template.title}</p>
                            </div>

                            {/* Agenda Preview */}
                            <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Default Agenda:
                              </span>
                              <pre className="text-[10px] text-slate-700 font-sans whitespace-pre-wrap leading-relaxed line-clamp-4">
                                {template.agenda}
                              </pre>
                            </div>

                            {/* Location / Link Info */}
                            {(template.location || template.meetingLink) && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                {template.locationType === 'online' ? <LinkIcon size={11} /> : <MapPin size={11} />}
                                <span className="truncate">{template.location || template.meetingLink}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Action */}
                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            {isCurrent ? (
                              <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                                <Check size={13} /> Active Template
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Click to apply to form</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleLoadTemplate(template)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                                isCurrent
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  : 'bg-slate-900 hover:bg-indigo-600 text-white'
                              }`}
                            >
                              <span>Apply Template</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={resetMeetingTemplates}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                  title="Restore initial system templates"
                >
                  <RotateCcw size={12} />
                  <span>Reset to Standard Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTemplatesModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Save Current Configuration as New Template */}
        {isSaveTemplateModalOpen && (
          <div
            id="save-meeting-template-modal-backdrop"
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-2xs p-3 sm:p-4 animate-in fade-in duration-150"
          >
            <div
              id="save-meeting-template-modal"
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-xs text-slate-800"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
                    <BookmarkPlus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Save as Meeting Template</h3>
                    <p className="text-[11px] text-indigo-200">
                      Save this title, duration, and agenda format as a reusable template for your team.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirmSaveTemplate} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    placeholder="e.g. Weekly Sync, Client Discovery, Team Retro"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 ${
                      saveTemplateErrors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {saveTemplateErrors.name && (
                    <p className="text-[10px] text-red-600 mt-1">{saveTemplateErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={saveTemplateCategory}
                      onChange={(e) => setSaveTemplateCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="team">Team & Internal</option>
                      <option value="sales">Sales & Deals</option>
                      <option value="client">Client & Kickoff</option>
                      <option value="leadership">Leadership & 1:1</option>
                      <option value="engineering">Engineering & RFC</option>
                      <option value="custom">Custom Format</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Default Duration
                    </label>
                    <select
                      value={saveTemplateDuration}
                      onChange={(e) => setSaveTemplateDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes (1 hour)</option>
                      <option value={90}>90 minutes (1.5 hours)</option>
                      <option value={120}>120 minutes (2 hours)</option>
                    </select>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Short Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={saveTemplateDescription}
                    onChange={(e) => setSaveTemplateDescription(e.target.value)}
                    placeholder="Brief summary of when to use this template format..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Title to save */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Default Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={saveTemplateTitle}
                    onChange={(e) => setSaveTemplateTitle(e.target.value)}
                    placeholder="e.g. Weekly Team Sync: Deliverables & Roadblocks"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 ${
                      saveTemplateErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {saveTemplateErrors.title && (
                    <p className="text-[10px] text-red-600 mt-1">{saveTemplateErrors.title}</p>
                  )}
                </div>

                {/* Agenda Format to save */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Default Agenda Format <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={saveTemplateAgenda}
                    onChange={(e) => setSaveTemplateAgenda(e.target.value)}
                    placeholder="List standard discussion items, bullet points, or time allocations..."
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-sans ${
                      saveTemplateErrors.agenda ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {saveTemplateErrors.agenda && (
                    <p className="text-[10px] text-red-600 mt-1">{saveTemplateErrors.agenda}</p>
                  )}
                </div>

                {/* Dialog Footer Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsSaveTemplateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    id="confirm-save-template-btn"
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    <span>Save & Apply Template</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
