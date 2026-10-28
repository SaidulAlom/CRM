import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Task } from '../../../types';
import {
  X,
  FileCheck,
  Upload,
  Link,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Target,
  Sparkles,
} from 'lucide-react';

interface TaskEvidenceSubmissionModalProps {
  task: Task;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const TaskEvidenceSubmissionModal: React.FC<TaskEvidenceSubmissionModalProps> = ({
  task,
  onClose,
  onSubmitted,
}) => {
  const { targets, users, submitTaskEvidence, currentUser } = useCRM();

  const linkedTarget = targets.find((t) => t.id === task.targetId);
  const assignee = users.find((u) => u.id === task.assigneeId);

  const [notes, setNotes] = useState(task.evidence?.notes || '');
  const [docUrlInput, setDocUrlInput] = useState('');
  const [docUrls, setDocUrls] = useState<string[]>(task.evidence?.documentUrls || []);
  const [metricResult, setMetricResult] = useState<string>(
    task.evidence?.metricResult !== undefined ? String(task.evidence.metricResult) : ''
  );
  const [fileNames, setFileNames] = useState<string[]>(
    task.evidence?.fileNames || ['contract_deliverable_final.pdf']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!docUrlInput.trim()) return;
    try {
      new URL(docUrlInput); // validate URL
      if (!docUrls.includes(docUrlInput.trim())) {
        setDocUrls([...docUrls, docUrlInput.trim()]);
      }
      setDocUrlInput('');
      setError(null);
    } catch {
      setError('Please provide a valid URL (e.g., https://docs.google.com/...)');
    }
  };

  const handleRemoveUrl = (url: string) => {
    setDocUrls(docUrls.filter((u) => u !== url));
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setFileNames(Array.from(new Set([...fileNames, ...names])));
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFileNames(fileNames.filter((f) => f !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide detailed summary notes of the work completed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = submitTaskEvidence(task.id, {
        notes: notes.trim(),
        documentUrls: docUrls,
        metricResult: metricResult ? Number(metricResult) : undefined,
        fileNames,
      });

      if (!res.success) {
        setError(res.message || 'Failed to submit task evidence.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while submitting evidence.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileCheck size={22} className="text-indigo-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                Task Execution & Evidence Verification
              </div>
              <h2 className="text-base font-bold text-white">Submit Work for Manager Review</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Metadata Context */}
        <div className="bg-indigo-50/60 border-b border-indigo-100 px-6 py-3 flex flex-wrap items-center gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-400">Task:</span>
            <span className="font-bold text-slate-900">{task.title}</span>
          </div>
          {linkedTarget && (
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-semibold">
              <Target size={12} className="text-indigo-600" />
              <span>Goal: {linkedTarget.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar size={12} />
            <span>Due {task.deadline}</span>
          </div>
          {task.isMandatory !== false && (
            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
              Mandatory for Goal
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {task.rejectionReason && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle size={14} className="text-amber-600" />
                Previous Review Feedback (Revision Required)
              </div>
              <p className="text-amber-800">{task.rejectionReason}</p>
            </div>
          )}

          {/* Notes / Description of Completion */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Work Deliverable Notes & Completion Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail the actionable steps taken, key findings, deliverables produced, and why this satisfies the goal criteria..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-500">
              Be comprehensive. Managers verify this evidence before completing the task and approving goal achievement.
            </p>
          </div>

          {/* Measurable Metric Result */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Measurable Output / Attainment Value (Optional)
            </label>
            <input
              type="number"
              value={metricResult}
              onChange={(e) => setMetricResult(e.target.value)}
              placeholder="e.g. 5 deals closed, $25000 revenue won, 10 customer calls conducted"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
            <p className="text-[11px] text-slate-500">
              If this task produced measurable KPI numbers, input the verified figure here.
            </p>
          </div>

          {/* Deliverable URLs */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Document URLs & Cloud Artifact Links
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="url"
                  value={docUrlInput}
                  onChange={(e) => setDocUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... or slide deck link"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors shrink-0"
              >
                Add Link
              </button>
            </div>

            {docUrls.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {docUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline font-mono truncate max-w-[80%]"
                    >
                      {url}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(url)}
                      className="text-slate-400 hover:text-rose-600 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Files & Proof */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Uploaded Proof Files & Artifacts
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                onChange={handleSimulateUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload size={20} className="mx-auto text-slate-400 mb-1" />
              <div className="font-medium text-slate-700">Click to upload files or drag & drop</div>
              <div className="text-[10px] text-slate-400">PDF, XLSX, DOCX, PNG up to 25MB</div>
            </div>

            {fileNames.length > 0 && (
              <div className="space-y-1 pt-1">
                {fileNames.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-800 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-emerald-600" />
                      <span>{name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(name)}
                      className="text-slate-400 hover:text-rose-600 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notice about workflow */}
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px] space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-600" />
              Automated Goal Attainment Rule
            </div>
            <p>
              Submitting evidence transitions this task to <strong className="text-amber-700">Under Review</strong>. It does not mark the goal as achieved until your manager reviews and approves this submission.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Manager Verification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
