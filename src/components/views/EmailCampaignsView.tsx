import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Mail,
  Plus,
  Send,
  Inbox,
  Settings,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCode,
  Building2,
  Users,
  Briefcase,
  LifeBuoy,
} from 'lucide-react';
import { EmailAccount, EmailMessage, EmailTemplate, Campaign } from '../../types';

export const EmailCampaignsView: React.FC = () => {
  const {
    emailAccounts,
    emailMessages,
    emailTemplates,
    campaigns,
    companies,
    contacts,
    deals,
    cases,
    attachEmailToRecord,
    sendCampaign,
    addEmailTemplate,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'inbox' | 'templates' | 'mailboxes'>('campaigns');

  // Attach email modal state (FR-13.2)
  const [attachModalEmailId, setAttachModalEmailId] = useState<string | null>(null);
  const [attachTargetType, setAttachTargetType] = useState<'company' | 'contact' | 'case'>('company');
  const [attachTargetId, setAttachTargetId] = useState('');

  // Template creation modal state (FR-13.3)
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState(
    'Hi {{first_name}},\n\nI noticed that {{company_name}} is scaling rapidly. Would you be open to reviewing our enterprise roadmap next week?\n\nBest,\n{{sender_name}}'
  );

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachModalEmailId || !attachTargetId) return;

    let targetName = 'Linked Record';
    if (attachTargetType === 'company') {
      targetName = companies.find((c) => c.id === attachTargetId)?.name || 'Company';
    } else if (attachTargetType === 'contact') {
      const ct = contacts.find((c) => c.id === attachTargetId);
      targetName = ct ? `${ct.firstName} ${ct.lastName}` : 'Contact';
    } else {
      targetName = cases.find((c) => c.id === attachTargetId)?.title || 'Case';
    }

    attachEmailToRecord(attachModalEmailId, attachTargetType, attachTargetId, targetName);
    setAttachModalEmailId(null);
    alert('Email message attached to record successfully!');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateSubject.trim()) return;
    addEmailTemplate({
      name: templateName.trim(),
      subject: templateSubject.trim(),
      body: templateBody.trim(),
    });
    setShowTemplateModal(false);
    setTemplateName('');
    setTemplateSubject('');
  };

  return (
    <div id="email-campaigns-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email & Campaigns</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {campaigns.length} campaigns
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch batched email campaigns with merge tags (FR-13.3), manage shared IMAP/SMTP mailboxes, and link inbox messages.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'campaigns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send size={14} />
          <span>Campaigns & Batch Dispatch ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'inbox'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox size={14} />
          <span>Connected Inbox ({emailMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode size={14} />
          <span>Templates & Merge Fields ({emailTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mailboxes')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'mailboxes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={14} />
          <span>Mailbox Configuration ({emailAccounts.length})</span>
        </button>
      </div>

      {/* Tab 1: Campaigns & Batch Dispatch (FR-13.4, FR-13.5) */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((c: Campaign) => {
              const totalAudience = c.recipientContactIds.length;
              const progressPct = totalAudience > 0 ? Math.round((c.sentCount / totalAudience) * 100) : 100;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{c.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            c.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">Schedule: {c.schedule}</p>
                    </div>

                    {c.status !== 'sent' && (
                      <button
                        onClick={() => sendCampaign(c.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                        title="Simulate sending a rate-limited batch (FR-13.5)"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Dispatch Batch</span>
                      </button>
                    )}
                  </div>

                  {/* Batch Progress Bar (FR-13.5) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Dispatch Progress</span>
                      <span className="font-bold">{c.sentCount} / {totalAudience} sent ({progressPct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  {/* Stats counts (FR-13.4) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] block">Opened</span>
                      <span className="font-bold text-slate-900 text-sm">{c.openedCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] block">Clicked</span>
                      <span className="font-bold text-emerald-600 text-sm">{c.clickedCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] block">Bounced</span>
                      <span className="font-bold text-rose-600 text-sm">{c.bouncedCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Connected Inbox (FR-13.2) */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            Inbox Messages & Record Attacher
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Attached Record</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailMessages.map((msg: EmailMessage) => (
                  <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span>{msg.subject}</span>
                      <div className="text-[11px] font-normal text-slate-500 line-clamp-1">{msg.body}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{msg.sender}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(msg.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {msg.attachedTo ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                          {msg.attachedTo.type}: {msg.attachedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unattached</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAttachModalEmailId(msg.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded text-xs font-medium"
                      >
                        {msg.attachedTo ? 'Change Attachment' : 'Attach to Record'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Templates (FR-13.3) */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Email Templates</h3>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              <Plus size={14} />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map((tmpl: EmailTemplate) => (
              <div key={tmpl.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">{tmpl.name}</div>
                <div className="text-[11px] text-slate-500">Subject: {tmpl.subject}</div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line font-mono text-[11px]">
                  {tmpl.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Mailboxes (FR-13.1) */}
      {activeTab === 'mailboxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailAccounts.map((mb: EmailAccount) => (
            <div key={mb.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-900">{mb.email}</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {mb.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>Account Name: {mb.name}</div>
                <div>Provider: {mb.provider}</div>
                <div>Last Synced: {new Date(mb.lastSyncedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attach Email Modal */}
      {attachModalEmailId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAttachSubmit} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Attach Email to Record (FR-13.2)</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Record Type</label>
              <select
                value={attachTargetType}
                onChange={(e) => {
                  setAttachTargetType(e.target.value as any);
                  setAttachTargetId('');
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="company">Company</option>
                <option value="contact">Contact</option>
                <option value="case">Support Case</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Record</label>
              <select
                value={attachTargetId}
                onChange={(e) => setAttachTargetId(e.target.value)}
                required
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">Select...</option>
                {attachTargetType === 'company' &&
                  companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                {attachTargetType === 'contact' &&
                  contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                {attachTargetType === 'case' &&
                  cases.map((cs) => (
                    <option key={cs.id} value={cs.id}>{cs.title}</option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAttachModalEmailId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!attachTargetId}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold"
              >
                Confirm Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTemplate} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Create Email Template (FR-13.3)</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Template Name *</label>
              <input
                type="text"
                required
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Executive Outreach 2026"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Subject *</label>
              <input
                type="text"
                required
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="e.g. Quick question regarding {{company_name}}"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Body Text (with Merge Tags)</label>
              <textarea
                rows={6}
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Available tags: {'{{first_name}}'}, {'{{last_name}}'}, {'{{company_name}}'}, {'{{sender_name}}'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
