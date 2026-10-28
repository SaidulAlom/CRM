import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Task } from '../../../types';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  User,
  Target,
  Calendar,
  Clock,
  ExternalLink,
  Award,
} from 'lucide-react';

interface TaskReviewModalProps {
  task: Task;
  onClose: () => void;
  onReviewed?: () => void;
}

export const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  task,
  onClose,
  onReviewed,
}) => {
  const { targets, users, reviewTaskSubmission, currentUser } = useCRM();

  const linkedTarget = targets.find((t) => t.id === task.targetId);
  const assignee = users.find((u) => u.id === task.assigneeId);

  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Self-approval check
  const isAssigneeSelfReview = task.assigneeId === currentUser.id && currentUser.role !== 'admin';
  const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleApprove = () => {
    if (isAssigneeSelfReview) {
      setError('Anti-Fraud Policy: Agents are strictly prohibited from approving their own task work. Another manager must review this.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res = reviewTaskSubmission(task.id, 'approved', feedback.trim() || undefined);
    if (!res.success) {
      setError(res.message || 'Approval failed.');
      setIsProcessing(false);
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    setIsProcessing(false);
    if (onReviewed) onReviewed();
    onClose();
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      setError('Please provide feedback explaining the reason for revision and required improvements.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res = reviewTaskSubmission(task.id, 'rejected', feedback.trim());
    if (!res.success) {
      setError(res.message || 'Rejection failed.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    if (onReviewed) onReviewed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck size={22} className="text-amber-100" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Quality Assurance & Manager Sign-off
              </div>
              <h2 className="text-base font-bold text-white">Review Task Evidence & Verification</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Self-approval / Auth Warning */}
        {isAssigneeSelfReview && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Self-Review Forbidden:</span> You cannot approve your own submitted work. To preserve data integrity and goal verification rules, another manager or admin must sign off on this deliverable.
            </div>
          </div>
        )}

        {!isAuthorized && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Unauthorized Role:</span> Only Managers and Administrators possess authorization to approve or reject submitted work.
            </div>
          </div>
        )}

        {/* Task & Agent Context */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 font-medium">Task:</span>{' '}
              <span className="font-bold text-slate-900 text-sm">{task.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <Clock size={11} />
                Under Review
              </span>
              {task.isMandatory !== false && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Mandatory Task
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              <span>
                Assignee: <strong className="text-slate-800">{assignee?.name || 'Assigned Rep'}</strong> ({assignee?.role || 'Agent'})
              </span>
            </div>
            {linkedTarget && (
              <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-semibold border border-indigo-200">
                <Target size={12} className="text-indigo-600" />
                <span>Goal: {linkedTarget.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              <span>Deadline: {task.deadline}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submitted Evidence Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-indigo-600" />
              <span>Submitted Deliverable & Evidence</span>
              {task.evidence?.submittedAt && (
                <span className="text-[11px] font-normal text-slate-400">
                  (Submitted {new Date(task.evidence.submittedAt).toLocaleString()})
                </span>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <div className="font-semibold text-slate-700">Summary Notes & Description:</div>
              <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {task.evidence?.notes || 'No written evidence submitted.'}
              </p>
            </div>

            {/* Measurable Metric Output */}
            {task.evidence?.metricResult !== undefined && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                <Award size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Reported Measurable Output:</strong>{' '}
                  <span className="font-bold">{task.evidence.metricResult.toLocaleString()}</span> units / points
                </span>
              </div>
            )}

            {/* Document Links */}
            {task.evidence?.documentUrls && task.evidence.documentUrls.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="font-semibold text-slate-700">Artifact Links:</div>
                <div className="space-y-1">
                  {task.evidence.documentUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:text-indigo-800 hover:underline font-mono"
                    >
                      <LinkIcon size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{url}</span>
                      <ExternalLink size={12} className="shrink-0 ml-auto text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {task.evidence?.fileNames && task.evidence.fileNames.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="font-semibold text-slate-700">Attached Proof Files:</div>
                <div className="flex flex-wrap gap-2">
                  {task.evidence.fileNames.map((fn, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-1.5"
                    >
                      <FileText size={13} className="text-slate-500" />
                      <span>{fn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit & Prior Review History */}
          {task.reviewHistory && task.reviewHistory.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700">Prior Review History</div>
              <div className="space-y-1.5">
                {task.reviewHistory.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {rev.reviewerName} ·{' '}
                        <span
                          className={rev.decision === 'approved' ? 'text-emerald-700' : 'text-rose-700'}
                        >
                          {rev.decision.toUpperCase()}
                        </span>
                      </div>
                      {rev.reason && <p className="text-slate-600 mt-0.5">{rev.reason}</p>}
                    </div>
                    <span className="text-slate-400 shrink-0">
                      {new Date(rev.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Feedback Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Review Feedback / Reason
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter approval congratulations or detailed revision requirements (required if rejecting)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
            />
          </div>

          {/* Guidance note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
            <div className="font-bold">Goal Attainment Impact</div>
            <p>
              Approving this work transitions this task to <strong className="text-emerald-700">Completed (100%)</strong>. If all other mandatory tasks for the goal are verified and target metrics are satisfied, the goal will automatically be marked <strong className="text-emerald-700">Achieved</strong>!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing || !isAuthorized}
              onClick={handleReject}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Return task to In Progress for revision"
            >
              <XCircle size={16} />
              <span>Reject & Request Changes</span>
            </button>

            <button
              type="button"
              disabled={isProcessing || isAssigneeSelfReview || !isAuthorized}
              onClick={handleApprove}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Verify evidence and mark task completed"
            >
              <CheckCircle2 size={16} />
              <span>Approve & Verify Work</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
