import React from 'react';
import { TargetCalculation } from '../targets/targetUtils';
import { useCRM } from '../../../context/CRMContext';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Target,
} from 'lucide-react';

interface GoalAchievementBlockerModalProps {
  calculation: TargetCalculation;
  onClose: () => void;
  onOpenTaskReview?: (taskId: string) => void;
  onOpenTaskSubmit?: (taskId: string) => void;
}

export const GoalAchievementBlockerModal: React.FC<GoalAchievementBlockerModalProps> = ({
  calculation,
  onClose,
  onOpenTaskReview,
  onOpenTaskSubmit,
}) => {
  const { currentUser, setActiveNav } = useCRM();
  const { target, linkedTasks, achievementBlockers, isTargetAchieved } = calculation;

  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Target size={22} className="text-indigo-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Verification & Achievement Rules Engine
              </div>
              <h2 className="text-base font-bold text-white">
                {isTargetAchieved ? 'Goal Verification Complete' : 'Why Is This Goal Not Yet Achieved?'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Goal Overview */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-900 text-sm">{target.name}</div>
            <div className="text-slate-500">{target.department || 'Sales'} · Target Period: {target.startDate} to {target.endDate}</div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isTargetAchieved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {calculation.computedStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Rules Reminder */}
          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-950 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldAlert size={14} className="text-indigo-600" />
              Strict Zero-Button-Click Business Rule
            </div>
            <p>
              In this CRM, goals cannot be manually marked as achieved simply by clicking a button. A goal transitions to <strong className="text-emerald-700">Achieved</strong> only after every mandatory task has verified completion by a manager and all numerical targets are attained.
            </p>
          </div>

          {/* Blockers list */}
          <div className="space-y-2">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-500" />
              <span>Outstanding Achievement Requirements ({achievementBlockers.length})</span>
            </div>

            {achievementBlockers.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">All Success Criteria Satisfied!</div>
                  <div className="text-[11px] text-emerald-700">
                    Numerical target met and all mandatory tasks have been verified and approved.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {achievementBlockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-start gap-2.5 text-slate-800"
                  >
                    <span className="font-bold text-rose-600 bg-rose-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-900 leading-relaxed">{blocker}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Tasks Inspection */}
          <div className="space-y-2 pt-2">
            <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileCheck size={16} className="text-indigo-600" />
                <span>Linked Tasks ({linkedTasks.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                {calculation.completedMandatoryTasksCount}/{calculation.mandatoryTasksCount} mandatory verified
              </span>
            </div>

            <div className="space-y-2">
              {linkedTasks.map((t) => {
                const isApproved = t.status === 'Completed';
                const isUnderReview = t.status === 'Under Review';
                const isBlocked = t.status === 'Blocked';

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                      isApproved
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                        : isBlocked
                        ? 'bg-rose-50/50 border-rose-200'
                        : isUnderReview
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{t.title}</span>
                        {t.isMandatory !== false && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Mandatory
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isBlocked
                              ? 'bg-rose-100 text-rose-800'
                              : isUnderReview
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      {t.blockedReason && (
                        <div className="text-[11px] text-rose-700 font-medium">
                          Blocker: {t.blockedReason}
                        </div>
                      )}
                      {t.rejectionReason && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          Revision requested: {t.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUnderReview && isManagerOrAdmin && onOpenTaskReview && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTaskReview(t.id);
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                        >
                          <Clock size={12} />
                          <span>Review Work</span>
                        </button>
                      )}

                      {!isApproved && !isUnderReview && onOpenTaskSubmit && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTaskSubmit(t.id);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                        >
                          <FileCheck size={12} />
                          <span>Submit Evidence</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveNav('tasks');
            }}
            className="text-indigo-600 hover:underline font-bold text-xs flex items-center gap-1"
          >
            <span>Open Tasks Dashboard</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
