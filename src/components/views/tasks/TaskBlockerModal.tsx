import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { Task } from '../../../types';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TaskBlockerModalProps {
  task: Task;
  onClose: () => void;
  onBlocked?: () => void;
}

export const TaskBlockerModal: React.FC<TaskBlockerModalProps> = ({
  task,
  onClose,
  onBlocked,
}) => {
  const { setTaskBlocked } = useCRM();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please describe what is blocking this task.');
      return;
    }

    setTaskBlocked(task.id, reason.trim());
    if (onBlocked) onBlocked();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-100" />
            <h2 className="text-sm font-bold">Report Task Blocker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-rose-200 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <div className="text-slate-500 font-medium">Task:</div>
            <div className="font-bold text-slate-900 text-sm">{task.title}</div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-800">
              Blocker Description / Impediment <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Awaiting client legal team sign-off on Section 4 indemnity, API endpoint rate limits preventing sync..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-500">
              Reporting a blocker flags this task and notifies team managers for escalation.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              Mark Task as Blocked
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
