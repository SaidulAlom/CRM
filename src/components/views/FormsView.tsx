import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  FileQuestion,
  Plus,
  Code2,
  Copy,
  Check,
  Send,
  Users,
  Eye,
  Calendar,
} from 'lucide-react';
import { CustomForm, FormQuestion } from '../../types';

export const FormsView: React.FC = () => {
  const { customForms, addCustomForm, submitCustomForm, contacts } = useCRM();

  const [selectedFormId, setSelectedFormId] = useState<string>(customForms[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // New form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [questions, setQuestions] = useState<Array<Omit<FormQuestion, 'id'>>>([
    { prompt: 'What is your company name?', type: 'free_text', required: true },
    { prompt: 'What size is your sales team?', type: 'multiple_choice', options: ['1-10', '11-50', '50+'], required: true },
  ]);

  // Simulated live submission modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [responderName, setResponderName] = useState('');
  const [responderEmail, setResponderEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const activeForm = customForms.find((f) => f.id === selectedFormId) || customForms[0];

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCustomForm({
      title: newTitle.trim(),
      description: newDesc.trim(),
      instructions: 'Please fill out this form to get in touch with our team.',
      questions: questions.map((q, idx) => ({ ...q, id: `q-${Date.now()}-${idx}` })),
      isPublic: true,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm || !responderName.trim() || !responderEmail.trim()) return;

    submitCustomForm(activeForm.id, {
      responderName: responderName.trim(),
      responderEmail: responderEmail.trim(),
      answers,
    });

    setShowSubmitModal(false);
    setResponderName('');
    setResponderEmail('');
    setAnswers({});
    alert('Form response successfully captured and logged into CRM!');
  };

  const embedSnippet = `<div id="crm-inbound-form-${activeForm?.id || 'demo'}"></div>\n<script src="https://crm.apexlogix.io/embed/forms.js" data-form-id="${activeForm?.id || 'demo'}"></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="forms-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inbound Web-to-Lead Forms</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              FR-12 Form Builder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build custom inbound capture forms, generate responsive embed code snippets (FR-12.3), and review incoming submissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={15} />
          <span>New Inbound Form</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Forms Directory */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Available Inbound Forms ({customForms.length})
          </h3>

          <div className="space-y-1.5 text-xs">
            {customForms.map((form) => (
              <div
                key={form.id}
                onClick={() => setSelectedFormId(form.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                  activeForm?.id === form.id
                    ? 'bg-indigo-50 border-indigo-200 font-semibold text-indigo-950'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold truncate">{form.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white text-slate-500 border border-slate-200">
                    {form.submissions.length} leads
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{form.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Form Details & Submissions */}
        {activeForm && (
          <div className="md:col-span-8 space-y-6">
            {/* Embed & Test Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{activeForm.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{activeForm.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    <Send size={13} />
                    <span>Test Submit Response</span>
                  </button>
                  <button
                    onClick={copyEmbed}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Embed HTML'}</span>
                  </button>
                </div>
              </div>

              {/* Embed snippet box (FR-12.3) */}
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
                <div className="text-slate-500 text-[10px] mb-1">// Copy & paste into any landing page or website HTML</div>
                <code>{embedSnippet}</code>
              </div>

              {/* Questions preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800">Form Questions ({activeForm.questions.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeForm.questions.map((q, idx) => (
                    <div key={q.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-900">
                        {idx + 1}. {q.prompt} {q.required && <span className="text-rose-500">*</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize mt-0.5">Type: {q.type.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Logged Submissions ({activeForm.submissions.length})</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Lead / Responder</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3">Answers Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeForm.submissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">
                          No submissions captured yet. Click "Test Submit Response" above to simulate an inbound lead!
                        </td>
                      </tr>
                    ) : (
                      activeForm.submissions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-900">{s.responderName || 'Anonymous'}</td>
                          <td className="px-4 py-3 text-slate-600">{s.responderEmail || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(s.submittedAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-700">
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              {JSON.stringify(s.answers)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit modal */}
      {showSubmitModal && activeForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleFormSubmission} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Simulate Submission: {activeForm.title}</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Your Email Address *</label>
              <input
                type="email"
                required
                value={responderEmail}
                onChange={(e) => setResponderEmail(e.target.value)}
                placeholder="rachel@acmecorp.com"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {activeForm.questions.map((q) => (
              <div key={q.id}>
                <label className="block font-medium text-slate-700 mb-1">
                  {q.prompt} {q.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  required={q.required}
                  value={answers[q.prompt] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.prompt]: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create form modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateForm} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Create New Inbound Form (FR-12.1)</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Form Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Enterprise Demo Request Form"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description for internal team..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Build Form
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
