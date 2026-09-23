import React, { useState, useMemo } from 'react';
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
  FileText,
  Mail,
  Star,
  Flag,
  UserCheck,
  Edit3,
  ExternalLink,
  Plus,
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
} from 'lucide-react';

interface RecordDetailModalContentProps {
  type: 'company' | 'contact';
  id: string;
}

const RecordDetailModalContent: React.FC<RecordDetailModalContentProps> = ({ type, id }) => {
  const {
    closeRecordDetail,
    companies,
    contacts,
    deals,
    tasks,
    cases,
    calls,
    events,
    documents,
    emailMessages,
    campaigns,
    users,
    currentUser,
    updateCompany,
    updateContact,
    reassignCompanyOwner,
    convertContactToDeal,
    toggleShortlist,
    isItemShortlisted,
    openQuickCreate,
    defaultCompany,
    setDefaultCompanyId,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isReassigning, setIsReassigning] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [reassignOpenRecords, setReassignOpenRecords] = useState(true);

  const company = type === 'company' ? companies.find((c) => c.id === id) : null;
  const contact = type === 'contact' ? contacts.find((c) => c.id === id) : null;

  const isDefaultCompany = type === 'company' && company ? defaultCompany?.id === company.id : false;

  const owner = users.find((u) => u.id === (company?.ownerId || contact?.ownerId));
  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Related data for Company (FR-3.2)
  const relatedContacts = contacts.filter((c) => !c.deletedAt && c.companyId === id);
  const relatedDeals = deals.filter((d) => !d.deletedAt && (type === 'company' ? d.companyId === id : d.contactId === id));
  const relatedTasks = tasks.filter((t) => !t.deletedAt && (type === 'company' ? t.companyId === id : t.contactId === id));
  const relatedCases = cases.filter((c) => !c.deletedAt && (type === 'company' ? c.companyId === id : c.contactId === id));
  const relatedCalls = calls.filter((c) => !c.deletedAt && (type === 'company' ? c.companyId === id : c.contactId === id));
  const relatedEvents = events.filter((e) => !e.deletedAt && (type === 'company' ? e.companyId === id : e.contactId === id));
  const relatedDocuments = documents.filter((d) => (type === 'company' ? d.companyId === id : d.contactId === id));
  const relatedEmails = emailMessages.filter(
    (em) => em.attachedTo && em.attachedTo.type === type && em.attachedTo.id === id
  );

  // Chronological Activity Timeline (FR-4.2)
  const timelineItems = useMemo(() => {
    const list: { id: string; type: string; title: string; date: string; actor?: string; detail?: string }[] = [];

    relatedCalls.forEach((c) => {
      list.push({
        id: c.id,
        type: 'call',
        title: `Call (${c.direction}): ${c.subject}`,
        date: `${c.date} ${c.time}`,
        detail: `Status: ${c.outcomeStatus} · Notes: ${c.notes || 'None'}`,
      });
    });

    relatedEvents.forEach((e) => {
      list.push({
        id: e.id,
        type: 'event',
        title: `Meeting: ${e.title}`,
        date: `${e.startDate} ${e.startTime}`,
        detail: `Location: ${e.location || 'Remote'}`,
      });
    });

    relatedEmails.forEach((em) => {
      list.push({
        id: em.id,
        type: 'email',
        title: `Email: ${em.subject}`,
        date: em.timestamp,
        detail: `From: ${em.sender}`,
      });
    });

    relatedDeals.forEach((d) => {
      list.push({
        id: d.id,
        type: 'deal',
        title: `Deal: ${d.title} ($${d.value.toLocaleString()})`,
        date: d.createdAt,
        detail: `Current Stage: ${d.stage} · Next: ${d.nextStep || 'Follow up'}`,
      });
    });

    relatedTasks.forEach((t) => {
      list.push({
        id: t.id,
        type: 'task',
        title: `Task: ${t.title}`,
        date: t.createdAt,
        detail: `Deadline: ${t.deadline} · ${t.completionPercentage}% complete`,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [relatedCalls, relatedEvents, relatedEmails, relatedDeals, relatedTasks]);

  if (!company && !contact) return null;

  const shortlisted = isItemShortlisted(type, id);

  const handleToggleShortlist = () => {
    if (type === 'company' && company) {
      toggleShortlist({
        type: 'company',
        category: 'company',
        id: company.id,
        title: company.name,
        subtitle: `${company.industry || 'Company'} · ${company.priority || 'Normal'} Priority`,
        referenceInfo: company.annualRevenue ? `$${(company.annualRevenue / 1000000).toFixed(1)}M Rev` : company.industry,
      });
    } else if (type === 'contact' && contact) {
      const comp = companies.find((c) => c.id === contact.companyId);
      const cat = contact.type === 'lead' ? 'lead' : contact.type === 'customer' ? 'customer' : 'contact';
      toggleShortlist({
        type: 'contact',
        category: cat,
        id: contact.id,
        title: `${contact.firstName} ${contact.lastName}`,
        subtitle: `${contact.jobTitle || (contact.type === 'lead' ? 'Lead' : contact.type === 'customer' ? 'Customer' : 'Contact')} · ${comp?.name || 'Independent'}`,
        referenceInfo: comp?.name || (contact.type === 'lead' ? 'Lead' : 'Customer'),
      });
    }
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerId || !company) return;
    reassignCompanyOwner(company.id, newOwnerId, reassignOpenRecords);
    setIsReassigning(false);
  };

  const handleConvertContact = () => {
    if (!contact) return;
    convertContactToDeal(contact.id, {
      title: `${contact.firstName} ${contact.lastName} - Initial Pipeline Deal`,
      value: 65000,
      stage: 'lead',
    });
    alert('Contact successfully converted into an active Pipeline Deal!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-in fade-in-50 duration-150">
      <div
        id="record-detail-modal"
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Header with Name, Owner, Priority/Type, and Actions */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              {type === 'company' ? <Building2 size={22} /> : <Users size={22} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white truncate leading-tight">
                  {type === 'company' ? company?.name : `${contact?.firstName} ${contact?.lastName}`}
                </h2>
                <button
                  id="record-shortlist-toggle"
                  onClick={handleToggleShortlist}
                  className={`p-1 transition-colors rounded ${
                    shortlisted
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-slate-400 hover:text-amber-400'
                  }`}
                  title={shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                  aria-label={shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                >
                  <Flag
                    size={16}
                    className={shortlisted ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                <span>Owner: {owner?.name || 'Unassigned'}</span>
                <span>·</span>
                {type === 'company' ? (
                  <span className="capitalize">{company?.industry}</span>
                ) : (
                  <span>{contact?.jobTitle || 'No Title'}</span>
                )}
                {company?.priority && (
                  <>
                    <span>·</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${
                        company.priority === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : company.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {company.priority} Priority
                    </span>
                  </>
                )}
                {isDefaultCompany && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      <Star size={10} className="fill-amber-300 text-amber-300" />
                      Default Company
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {type === 'company' && company && (
              isDefaultCompany ? (
                <button
                  id="header-clear-default-company-btn"
                  onClick={() => setDefaultCompanyId(null)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-400/30 rounded-lg text-xs font-medium transition-colors"
                  title="Remove as Default Company"
                >
                  <X size={14} />
                  <span>Clear Default</span>
                </button>
              ) : (
                <button
                  id="header-set-default-company-btn"
                  onClick={() => setDefaultCompanyId(company.id)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  title="Set this company as your default company (auto-associates new records)"
                >
                  <Star size={14} />
                  <span>Set as Default</span>
                </button>
              )
            )}

            {type === 'contact' && (
              <button
                id="convert-contact-to-deal-btn"
                onClick={handleConvertContact}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Convert this contact into an active pipeline deal"
              >
                <TrendingUp size={14} />
                <span>Convert to Deal</span>
              </button>
            )}

            {type === 'company' && isManagerOrAdmin && (
              <button
                id="reassign-owner-btn"
                onClick={() => setIsReassigning(!isReassigning)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <UserCheck size={14} />
                <span>Reassign Owner</span>
              </button>
            )}

            <button
              onClick={closeRecordDetail}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Manager Reassign Banner if active (FR-3.4) */}
        {isReassigning && (
          <div className="p-3 bg-indigo-950 text-indigo-100 border-b border-indigo-900 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-indigo-400" />
              <span className="font-semibold">Reassign Company Owner (Manager Control)</span>
            </div>
            <form onSubmit={handleReassign} className="flex items-center gap-3">
              <select
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(e.target.value)}
                required
                className="bg-slate-900 text-white border border-indigo-700 rounded px-2.5 py-1 text-xs"
              >
                <option value="">Select new owner...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={reassignOpenRecords}
                  onChange={(e) => setReassignOpenRecords(e.target.checked)}
                  className="rounded text-indigo-500"
                />
                <span>Also cascade to open deals, tasks, & cases</span>
              </label>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs shadow-xs"
              >
                Apply Reassignment
              </button>
              <button
                type="button"
                onClick={() => setIsReassigning(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Tabs navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Activity Timeline</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {timelineItems.length}
            </span>
          </button>
          {type === 'company' && (
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'contacts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Contacts</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {relatedContacts.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deals'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Deals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {relatedDeals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {relatedTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cases'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Cases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {relatedCases.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calls'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Calls</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {relatedCalls.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Documents</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {relatedDocuments.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview & Details */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Default Company Section (FR-3.1) */}
                {type === 'company' && company && (
                  <div
                    id="company-default-section"
                    className={`p-4 rounded-xl border transition-all ${
                      isDefaultCompany
                        ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-200 shadow-2xs'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isDefaultCompany ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Star size={18} className={isDefaultCompany ? 'fill-white' : ''} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Default Company
                            </h4>
                            {isDefaultCompany ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Active for {currentUser.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Not Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {isDefaultCompany ? (
                              <span>
                                <strong>{company.name}</strong> is currently your active default company. Newly created contacts, deals, tasks, cases, leads, appointments, and notes will automatically pre-select this company.
                              </span>
                            ) : defaultCompany ? (
                              <span>
                                Your current default company is <strong className="text-slate-900">{defaultCompany.name}</strong>. Selecting <strong>&quot;Set as Default Company&quot;</strong> will automatically replace the previous default company.
                              </span>
                            ) : (
                              <span>
                                No default company is currently active for your profile. Setting <strong>{company.name}</strong> as your default will automatically pre-select it whenever creating new CRM records.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isDefaultCompany ? (
                          <button
                            type="button"
                            id="btn-remove-default-company"
                            onClick={() => setDefaultCompanyId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-rose-300 text-slate-700 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <X size={14} />
                            <span>Remove / Clear Default</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            id="btn-set-default-company"
                            onClick={() => setDefaultCompanyId(company.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Star size={14} />
                            <span>Set as Default Company</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Information Card */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4">
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">
                    Record Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {type === 'company' ? (
                      <>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Industry</span>
                          <span className="font-medium text-slate-800">{company?.industry}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Annual Revenue</span>
                          <span className="font-medium text-slate-800">
                            {company?.annualRevenue ? `$${company.annualRevenue.toLocaleString()}` : 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Employees</span>
                          <span className="font-medium text-slate-800">{company?.employeeCount || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Phone</span>
                          <span className="font-medium text-slate-800">{company?.phone || 'N/A'}</span>
                        </div>
                        {company?.email && (
                          <div>
                            <span className="text-slate-400 block mb-0.5">Email</span>
                            <a href={`mailto:${company.email}`} className="font-medium text-indigo-600 hover:underline">
                              {company.email}
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block mb-0.5">Website</span>
                          <a
                            href={company?.website}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {company?.website || 'N/A'}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Address</span>
                          <span className="font-medium text-slate-800">
                            {[company?.address || company?.billingAddress, company?.city, company?.state, company?.country].filter(Boolean).join(', ') || 'N/A'}
                          </span>
                        </div>
                        {company?.customFields &&
                          Object.entries(company.customFields).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-400 block mb-0.5 uppercase text-[10px]">{k}</span>
                              <span className="font-medium text-slate-800">{String(v)}</span>
                            </div>
                          ))}
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Full Name</span>
                          <span className="font-medium text-slate-800">{contact?.firstName} {contact?.lastName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Email</span>
                          <a href={`mailto:${contact?.email}`} className="font-medium text-indigo-600 hover:underline">
                            {contact?.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Job Title</span>
                          <span className="font-medium text-slate-800">{contact?.jobTitle || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Phone</span>
                          <span className="font-medium text-slate-800">{contact?.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Mobile</span>
                          <span className="font-medium text-slate-800">{contact?.mobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Type</span>
                          <span className="font-semibold text-slate-700 capitalize">{contact?.type}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Messaging</span>
                          <span className="font-medium text-slate-800">{contact?.messagingHandle || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Mailing Address</span>
                          <span className="font-medium text-slate-800">{contact?.mailingAddress || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description / Notes */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-slate-400 block mb-1 text-xs">Description & Context</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {type === 'company' ? company?.description : contact?.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Top-Down Related Summary Blocks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-indigo-600" />
                        Active Deals ({relatedDeals.length})
                      </span>
                      <button
                        onClick={() => openQuickCreate('deal')}
                        className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {relatedDeals.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No deals associated yet</p>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        {relatedDeals.slice(0, 2).map((d) => (
                          <div key={d.id} className="flex items-center justify-between">
                            <span className="truncate max-w-[150px] font-medium text-slate-700">{d.title}</span>
                            <span className="font-semibold text-slate-900">${d.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-amber-600" />
                        Tasks ({relatedTasks.length})
                      </span>
                      <button
                        onClick={() => openQuickCreate('task')}
                        className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {relatedTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No tasks assigned</p>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        {relatedTasks.slice(0, 2).map((t) => (
                          <div key={t.id} className="flex items-center justify-between">
                            <span className="truncate max-w-[150px] text-slate-700">{t.title}</span>
                            <span className="text-[11px] text-amber-600 font-medium">{t.completionPercentage}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar stats & quick logs */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold text-xs text-slate-800 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => openQuickCreate('call', type === 'company' ? company?.id : contact?.companyId)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <PhoneCall size={14} className="text-sky-600" />
                      <span>Log or Schedule Call</span>
                    </button>
                    <button
                      onClick={() => openQuickCreate('event', type === 'company' ? company?.id : contact?.companyId)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Calendar size={14} className="text-violet-600" />
                      <span>Schedule Meeting</span>
                    </button>
                    <button
                      onClick={() => openQuickCreate('task', type === 'company' ? company?.id : contact?.companyId)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <CheckSquare size={14} className="text-amber-600" />
                      <span>Create Related Task</span>
                    </button>
                    <button
                      onClick={() => openQuickCreate('deal', type === 'company' ? company?.id : contact?.companyId)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Briefcase size={14} className="text-indigo-600" />
                      <span>Create New Deal</span>
                    </button>
                  </div>
                </div>

                {type === 'company' && (
                  isDefaultCompany ? (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                      <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        Default Company Active
                      </div>
                      <div className="text-[11px] text-indigo-700 leading-normal">
                        All new contacts, deals, tasks, cases, leads, appointments, and notes will automatically pre-fill this company.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                      <div className="font-semibold mb-0.5 text-slate-800">Set as Default Company</div>
                      <div className="text-[11px] text-slate-500 mb-2 leading-normal">
                        Make this company your active default to automatically associate newly created records.
                      </div>
                      <button
                        type="button"
                        onClick={() => setDefaultCompanyId(company?.id || null)}
                        className="w-full py-1.5 px-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Make Default
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline (FR-4.2) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 max-w-2xl">
              <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
                Chronological Activity History ({timelineItems.length})
              </h4>
              {timelineItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="text-xs font-medium text-slate-600">No activity logged yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Log a call, schedule a meeting, or attach an email to populate this timeline.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{item.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {item.detail && <p className="text-[11px] text-slate-600">{item.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Contacts */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Attached People ({relatedContacts.length})
                </h4>
                <button
                  onClick={() => openQuickCreate('contact')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add Contact
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedContacts.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                    <div className="font-semibold text-slate-800">{c.firstName} {c.lastName}</div>
                    <div className="text-[11px] text-slate-500">{c.jobTitle || 'No title'} · {c.email}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{c.phone || 'No phone'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Deals */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Pipeline Deals ({relatedDeals.length})
                </h4>
                <button
                  onClick={() => openQuickCreate('deal')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add Deal
                </button>
              </div>
              <div className="space-y-2">
                {relatedDeals.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{d.title}</div>
                      <div className="text-[11px] text-slate-500">{d.product} · Stage: <span className="font-semibold uppercase text-indigo-600">{d.stage}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">${d.value.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Close: {d.expectedCloseDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Associated Tasks ({relatedTasks.length})
                </h4>
                <button
                  onClick={() => openQuickCreate('task')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
              <div className="space-y-2">
                {relatedTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{t.title}</div>
                      <div className="text-[11px] text-slate-500">Status: {t.status} · Due: {t.deadline}</div>
                    </div>
                    <div className="text-right font-semibold text-amber-600">
                      {t.completionPercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Cases */}
          {activeTab === 'cases' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Support Cases ({relatedCases.length})
                </h4>
                <button
                  onClick={() => openQuickCreate('case')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Open Case
                </button>
              </div>
              <div className="space-y-2">
                {relatedCases.map((cs) => (
                  <div key={cs.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{cs.title}</div>
                      <div className="text-[11px] text-slate-500">{cs.problemName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {cs.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Calls */}
          {activeTab === 'calls' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Calls History ({relatedCalls.length})
                </h4>
                <button
                  onClick={() => openQuickCreate('call')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Log Call
                </button>
              </div>
              <div className="space-y-2">
                {relatedCalls.map((cl) => (
                  <div key={cl.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{cl.subject}</div>
                      <div className="text-[11px] text-slate-500">{cl.date} at {cl.time} · {cl.direction} · Outcome: {cl.outcomeStatus}</div>
                    </div>
                    {cl.durationSeconds && (
                      <span className="text-[11px] text-slate-500">
                        {Math.floor(cl.durationSeconds / 60)}m {cl.durationSeconds % 60}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Attached Documents ({relatedDocuments.length})
              </h4>
              <div className="space-y-2">
                {relatedDocuments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No files linked to this record.</p>
                ) : (
                  relatedDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">v{doc.version} · {doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)</div>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-medium">Download</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RecordDetailModal: React.FC = () => {
  const { recordDetailModal } = useCRM();

  if (!recordDetailModal) return null;

  return (
    <RecordDetailModalContent
      type={recordDetailModal.type}
      id={recordDetailModal.id}
    />
  );
};
