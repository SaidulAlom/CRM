import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  X,
  Building2,
  Users,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  PhoneCall,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  UserCheck,
  FileText,
} from 'lucide-react';

export const QuickCreateModal: React.FC = () => {
  const {
    quickCreateOpen,
    quickCreateType,
    quickCreatePrefillCompanyId,
    closeQuickCreate,
    defaultCompany,
    setDefaultCompanyId,
    companies,
    contacts,
    users,
    currentUser,
    callScripts,
    fieldSets,
    addCompany,
    addContact,
    addDeal,
    addTask,
    addCase,
    addCall,
    addEvent,
    checkUserAvailability,
    openRecordDetail,
    openDuplicateMerge,
    setActiveNav,
  } = useCRM();

  // Company Form States
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState(fieldSets.industries[0] || 'Enterprise Technology');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyCountry, setCompanyCountry] = useState('United States');
  const [companyPriority, setCompanyPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [makeDefaultAfterCreate, setMakeDefaultAfterCreate] = useState(false);

  // Contact / Lead Form States
  const [contactFirst, setContactFirst] = useState('');
  const [contactLast, setContactLast] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompanyId, setContactCompanyId] = useState('');
  const [contactType, setContactType] = useState<'lead' | 'customer' | 'vendor' | 'other'>('lead');

  // Deal Form States
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompanyId, setDealCompanyId] = useState('');
  const [dealContactId, setDealContactId] = useState('');
  const [dealValue, setDealValue] = useState('50000');
  const [dealProduct, setDealProduct] = useState(fieldSets.products[0] || '');
  const [dealStage, setDealStage] = useState(fieldSets.dealStages[0]?.id || 'lead');

  // Task Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [taskCompanyId, setTaskCompanyId] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState(currentUser.id);

  // Case Form States
  const [caseTitle, setCaseTitle] = useState('');
  const [caseProblem, setCaseProblem] = useState('');
  const [caseCompanyId, setCaseCompanyId] = useState('');
  const [casePriority, setCasePriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  // Call Form States
  const [callSubject, setCallSubject] = useState('');
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState('14:00');
  const [callDurationMinutes, setCallDurationMinutes] = useState(30);
  const [callTimeZone, setCallTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  );
  const [callDirection, setCallDirection] = useState<'inbound' | 'outbound'>('outbound');
  const [callCompanyId, setCallCompanyId] = useState('');
  const [callContactId, setCallContactId] = useState('');
  const [callExtName, setCallExtName] = useState('');
  const [callExtPhone, setCallExtPhone] = useState('');
  const [callAssignedUserId, setCallAssignedUserId] = useState(currentUser.id);
  const [callScriptId, setCallScriptId] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [callScheduleOnCalendar, setCallScheduleOnCalendar] = useState(true);
  const [callCreateContact, setCallCreateContact] = useState(false);

  // Event / Appointment Form States
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:00');
  const [eventParticipants, setEventParticipants] = useState<string[]>([currentUser.id]);
  const [eventCompanyId, setEventCompanyId] = useState('');
  const [eventLocation, setEventLocation] = useState('Video Conference');

  // Note Form States
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCompanyId, setNoteCompanyId] = useState('');

  // Success Feedback
  const [createdFeedback, setCreatedFeedback] = useState<{
    id: string;
    type: 'company' | 'contact' | 'deal' | 'task' | 'case' | 'call' | 'event';
    title: string;
  } | null>(null);

  // Sync default company whenever modal opens or switches context
  useEffect(() => {
    if (quickCreateOpen) {
      const targetCompanyId = quickCreatePrefillCompanyId || defaultCompany?.id || '';
      setContactCompanyId(targetCompanyId);
      setDealCompanyId(targetCompanyId);
      setTaskCompanyId(targetCompanyId);
      setCaseCompanyId(targetCompanyId);
      setCallCompanyId(targetCompanyId);
      setEventCompanyId(targetCompanyId);
      setNoteCompanyId(targetCompanyId);
      setMakeDefaultAfterCreate(false);
      setCreatedFeedback(null);

      // Default type adjustment
      if (quickCreateType === 'lead') {
        setContactType('lead');
      }
    }
  }, [quickCreateOpen, quickCreateType, quickCreatePrefillCompanyId, defaultCompany]);

  if (!quickCreateOpen || !quickCreateType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quickCreateType === 'company') {
      if (!companyName.trim()) return;
      const comp = addCompany({
        name: companyName.trim(),
        industry: companyIndustry,
        phone: companyPhone.trim() || undefined,
        email: companyEmail.trim() || undefined,
        address: companyAddress.trim() || undefined,
        city: companyCity.trim() || undefined,
        state: companyState.trim() || undefined,
        country: companyCountry.trim() || undefined,
        priority: companyPriority,
        ownerId: currentUser.id,
      });

      if (makeDefaultAfterCreate) {
        setDefaultCompanyId(comp.id);
      }

      setCreatedFeedback({ id: comp.id, type: 'company', title: comp.name });
    } else if (quickCreateType === 'contact' || quickCreateType === 'lead') {
      if (!contactFirst.trim() || !contactEmail.trim()) return;
      const res = addContact({
        firstName: contactFirst.trim(),
        lastName: contactLast.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        companyId: contactCompanyId || undefined,
        type: quickCreateType === 'lead' ? 'lead' : contactType,
        ownerId: currentUser.id,
      });

      if (res.duplicateOf) {
        openDuplicateMerge(res.contact, res.duplicateOf);
        closeQuickCreate();
        return;
      }
      setCreatedFeedback({
        id: res.contact.id,
        type: 'contact',
        title: `${res.contact.firstName} ${res.contact.lastName}`,
      });
    } else if (quickCreateType === 'deal') {
      if (!dealTitle.trim()) return;
      const deal = addDeal({
        title: dealTitle.trim(),
        companyId: dealCompanyId || undefined,
        contactId: dealContactId || undefined,
        value: Number(dealValue) || 10000,
        currency: 'USD',
        product: dealProduct,
        stage: dealStage,
        status: 'open',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ownerId: currentUser.id,
      });
      setCreatedFeedback({ id: deal.id, type: 'deal', title: deal.title });
    } else if (quickCreateType === 'task') {
      if (!taskTitle.trim()) return;
      const task = addTask({
        title: taskTitle.trim(),
        deadline: taskDeadline,
        status: 'Not Started',
        completionPercentage: 0,
        assigneeId: taskAssigneeId,
        companyId: taskCompanyId || undefined,
      });
      setCreatedFeedback({ id: task.id, type: 'task', title: task.title });
    } else if (quickCreateType === 'case') {
      if (!caseTitle.trim()) return;
      const c = addCase({
        title: caseTitle.trim(),
        problemName: caseProblem || caseTitle.trim(),
        status: fieldSets.caseStatuses[0] || 'New',
        priority: casePriority,
        ownerId: currentUser.id,
        companyId: caseCompanyId || undefined,
        teamMemberIds: [currentUser.id],
      });
      setCreatedFeedback({ id: c.id, type: 'case', title: c.title });
    } else if (quickCreateType === 'call') {
      if (!callSubject.trim()) return;
      const call = addCall(
        {
          subject: callSubject.trim(),
          date: callDate,
          time: callTime,
          durationMinutes: Number(callDurationMinutes),
          timeZone: callTimeZone,
          direction: callDirection,
          outcomeStatus: callScheduleOnCalendar ? 'Scheduled' : 'Pending',
          companyId: callCompanyId || undefined,
          contactId: callContactId || undefined,
          externalName: callExtName.trim() || undefined,
          externalPhone: callExtPhone.trim() || undefined,
          assignedUserId: callAssignedUserId || currentUser.id,
          scriptId: callScriptId || undefined,
          notes: callNotes.trim() || undefined,
          isScheduled: callScheduleOnCalendar,
          isCompleted: false,
        },
        callCreateContact
      );
      setCreatedFeedback({ id: call.id, type: 'call', title: call.subject });
    } else if (quickCreateType === 'event' || quickCreateType === 'appointment') {
      if (!eventTitle.trim()) return;
      const evt = addEvent({
        title: eventTitle.trim(),
        startDate: eventStartDate,
        startTime: eventStartTime,
        endDate: eventStartDate,
        endTime: eventEndTime,
        participantIds: eventParticipants,
        confirmed: true,
        companyId: eventCompanyId || undefined,
        location: eventLocation,
        emailAlert: true,
        ownerId: currentUser.id,
      });
      setCreatedFeedback({ id: evt.id, type: 'event', title: evt.title });
    } else if (quickCreateType === 'note') {
      if (!noteTitle.trim()) return;
      const taskNote = addTask({
        title: `Note: ${noteTitle.trim()}`,
        deadline: new Date().toISOString().split('T')[0],
        status: 'Completed',
        completionPercentage: 100,
        assigneeId: currentUser.id,
        companyId: noteCompanyId || undefined,
      });
      setCreatedFeedback({ id: taskNote.id, type: 'task', title: noteTitle });
    }
  };

  const renderCompanySelector = (
    value: string,
    onChange: (val: string) => void,
    id = 'company-select',
    label = 'Associated Company'
  ) => {
    const isDefaultSelected = Boolean(defaultCompany && value === defaultCompany.id);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block font-medium text-slate-700">
            {label}
          </label>
          {isDefaultSelected && (
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-1.5 py-0.2 rounded-full flex items-center gap-1">
              <Star size={10} className="fill-indigo-600 text-indigo-600" />
              Default Company
            </span>
          )}
        </div>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="">No Company</option>
          {companies.filter((c) => !c.deletedAt).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {defaultCompany?.id === c.id ? '★ (Your Default)' : ''}
            </option>
          ))}
        </select>
        {isDefaultSelected && (
          <p className="text-[10px] text-slate-500">
            Auto-associated with your active default company. You can change this to another company or "No Company" before saving.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50 duration-100">
      <div
        id="quick-create-dialog"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {quickCreateType === 'company' && <Building2 className="text-blue-600" size={18} />}
            {quickCreateType === 'contact' && <Users className="text-emerald-600" size={18} />}
            {quickCreateType === 'lead' && <UserCheck className="text-teal-600" size={18} />}
            {quickCreateType === 'deal' && <Briefcase className="text-indigo-600" size={18} />}
            {quickCreateType === 'task' && <CheckSquare className="text-amber-600" size={18} />}
            {quickCreateType === 'case' && <LifeBuoy className="text-rose-600" size={18} />}
            {quickCreateType === 'call' && <PhoneCall className="text-sky-600" size={18} />}
            {quickCreateType === 'event' && <Calendar className="text-violet-600" size={18} />}
            {quickCreateType === 'appointment' && <Clock className="text-violet-600" size={18} />}
            {quickCreateType === 'note' && <FileText className="text-slate-600" size={18} />}
            <h3 className="font-semibold text-sm text-slate-800 capitalize">
              Quick Create {quickCreateType}
            </h3>
          </div>
          <button
            onClick={closeQuickCreate}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Success Feedback banner */}
        {createdFeedback ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <div>
              <h4 className="font-semibold text-slate-800 text-base">
                {createdFeedback.title} Created!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                The new {createdFeedback.type} has been successfully recorded in the CRM.
              </p>
            </div>

            {/* If Company was created, provide 1-click Set as Default option */}
            {createdFeedback.type === 'company' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <Star size={13} className="text-amber-500" />
                      Default Company Status
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {defaultCompany?.id === createdFeedback.id
                        ? 'This company is currently your active default company.'
                        : 'Set this company as your active default to auto-link future records.'}
                    </div>
                  </div>
                  {defaultCompany?.id === createdFeedback.id ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                      <CheckCircle2 size={12} /> Active Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      id="quick-create-set-as-default-btn"
                      onClick={() => setDefaultCompanyId(createdFeedback.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <Star size={12} />
                      <span>Set as Default</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  closeQuickCreate();
                  if (createdFeedback.type === 'company' || createdFeedback.type === 'contact') {
                    openRecordDetail(createdFeedback.type, createdFeedback.id);
                  } else if (createdFeedback.type === 'deal') {
                    setActiveNav('deals');
                  } else if (createdFeedback.type === 'task') {
                    setActiveNav('tasks');
                  } else if (createdFeedback.type === 'case') {
                    setActiveNav('cases');
                  } else if (createdFeedback.type === 'call' || createdFeedback.type === 'event') {
                    setActiveNav('calendar');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {createdFeedback.type === 'company' || createdFeedback.type === 'contact'
                  ? 'Open Full Record'
                  : `View ${createdFeedback.type}s`}
              </button>
              <button
                onClick={closeQuickCreate}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Company Form */}
            {quickCreateType === 'company' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Industry</label>
                    <select
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {fieldSets.industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      value={companyPriority}
                      onChange={(e) => setCompanyPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="info@company.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="San Francisco"
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      placeholder="CA"
                      value={companyState}
                      onChange={(e) => setCompanyState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="USA"
                      value={companyCountry}
                      onChange={(e) => setCompanyCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Option to set as default company */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="quick-create-make-default"
                    checked={makeDefaultAfterCreate}
                    onChange={(e) => setMakeDefaultAfterCreate(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="quick-create-make-default" className="text-xs text-slate-800 cursor-pointer">
                    <span className="font-semibold text-indigo-950 flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-400" />
                      Set as Default Company
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Automatically associate new contacts, deals, tasks, cases, and calls with this company.
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Contact / Lead Form */}
            {(quickCreateType === 'contact' || quickCreateType === 'lead') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Jane"
                      value={contactFirst}
                      onChange={(e) => setContactFirst(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={contactLast}
                      onChange={(e) => setContactLast(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Type</label>
                    <select
                      value={contactType}
                      onChange={(e) => setContactType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="lead">Lead</option>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {renderCompanySelector(contactCompanyId, setContactCompanyId, 'contact-company-select')}
              </>
            )}

            {/* Deal Form */}
            {quickCreateType === 'deal' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Deal Title *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Enterprise Cloud License Q4"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Deal Value (USD) *</label>
                    <input
                      type="number"
                      required
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Stage</label>
                    <select
                      value={dealStage}
                      onChange={(e) => setDealStage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {fieldSets.dealStages.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Product</label>
                    <select
                      value={dealProduct}
                      onChange={(e) => setDealProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {fieldSets.products.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Primary Contact</label>
                    <select
                      value={dealContactId}
                      onChange={(e) => setDealContactId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">No Contact</option>
                      {contacts.filter((c) => !c.deletedAt).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {renderCompanySelector(dealCompanyId, setDealCompanyId, 'deal-company-select')}
              </>
            )}

            {/* Task Form */}
            {quickCreateType === 'task' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Follow up on proposal & contract terms"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Assignee</label>
                    <select
                      value={taskAssigneeId}
                      onChange={(e) => setTaskAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {renderCompanySelector(taskCompanyId, setTaskCompanyId, 'task-company-select')}
              </>
            )}

            {/* Case Form */}
            {quickCreateType === 'case' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject / Problem Title *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. SSO Login error for engineering users"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Problem Details</label>
                  <textarea
                    rows={2}
                    placeholder="Describe symptoms, error codes, and impact..."
                    value={caseProblem}
                    onChange={(e) => setCaseProblem(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={casePriority}
                    onChange={(e) => setCasePriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {renderCompanySelector(caseCompanyId, setCaseCompanyId, 'case-company-select')}
              </>
            )}

            {/* Call Form */}
            {quickCreateType === 'call' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Call Subject *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Qualification call with VP of Engineering"
                    value={callSubject}
                    onChange={(e) => setCallSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={callDate}
                      onChange={(e) => setCallDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Duration</label>
                    <select
                      value={callDurationMinutes}
                      onChange={(e) => setCallDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Direction</label>
                    <select
                      value={callDirection}
                      onChange={(e) => setCallDirection(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="outbound">Outbound</option>
                      <option value="inbound">Inbound</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Time Zone</label>
                    <select
                      value={callTimeZone}
                      onChange={(e) => setCallTimeZone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Tokyo">Japan Time (JST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Assigned Team Member</label>
                    <select
                      value={callAssignedUserId}
                      onChange={(e) => setCallAssignedUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Call Script</label>
                    <select
                      value={callScriptId}
                      onChange={(e) => setCallScriptId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">No Script / Freeform</option>
                      {callScripts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={callExtPhone}
                      onChange={(e) => setCallExtPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {renderCompanySelector(callCompanyId, setCallCompanyId, 'call-company-select')}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Existing Contact</label>
                    <select
                      value={callContactId}
                      onChange={(e) => setCallContactId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">Select contact...</option>
                      {contacts.filter((c) => !c.deletedAt).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Or External Person</label>
                    <input
                      type="text"
                      placeholder="Full Name (not in CRM)"
                      value={callExtName}
                      onChange={(e) => setCallExtName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {callExtName && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="call-create-contact-cb"
                      checked={callCreateContact}
                      onChange={(e) => setCallCreateContact(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="call-create-contact-cb" className="text-slate-700 cursor-pointer">
                      Automatically create "{callExtName}" as a new contact in CRM
                    </label>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Call agenda, preparation notes, or key discussion points..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="schedule-on-cal-cb"
                    checked={callScheduleOnCalendar}
                    onChange={(e) => setCallScheduleOnCalendar(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="schedule-on-cal-cb" className="text-xs text-slate-800 cursor-pointer font-medium">
                    Schedule this call for the date below and create an event entry for it in My Calendar
                  </label>
                </div>
              </>
            )}

            {/* Event / Appointment Form */}
            {(quickCreateType === 'event' || quickCreateType === 'appointment') && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {quickCreateType === 'appointment' ? 'Appointment Title *' : 'Event / Meeting Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder={quickCreateType === 'appointment' ? 'e.g. Product Demo with Executive Team' : 'e.g. Architecture Security Review Demo'}
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {renderCompanySelector(eventCompanyId, setEventCompanyId, 'event-company-select')}

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location / Video Link</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Attendee Availability Checker */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Participants & Live Availability
                  </label>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                    {users.map((u) => {
                      const isSelected = eventParticipants.includes(u.id);
                      const avail = checkUserAvailability(u.id, eventStartDate, eventStartTime, eventEndTime);
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-xs"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEventParticipants([...eventParticipants, u.id]);
                                } else {
                                  setEventParticipants(eventParticipants.filter((id) => id !== u.id));
                                }
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium text-slate-800">{u.name}</span>
                            <span className="text-[10px] text-slate-400 capitalize">({u.role})</span>
                          </label>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              avail.status === 'free'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : avail.status === 'busy'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                            title={avail.reason || 'Available for this meeting slot'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                avail.status === 'free'
                                  ? 'bg-emerald-500'
                                  : avail.status === 'busy'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {avail.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Note Form */}
            {quickCreateType === 'note' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Note Title *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Key takeaways from Q3 quarterly business review"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Note Details</label>
                  <textarea
                    rows={3}
                    placeholder="Enter discussion notes, follow-up items, or key context..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                {renderCompanySelector(noteCompanyId, setNoteCompanyId, 'note-company-select')}
              </>
            )}

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeQuickCreate}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                id="quick-create-submit"
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Save Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
