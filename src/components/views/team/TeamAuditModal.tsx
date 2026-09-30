import React from 'react';
import { AuditLogItem } from '../../../types';
import { X, History, Shield, Clock } from 'lucide-react';

interface TeamAuditModalProps {
  auditLogs: AuditLogItem[];
  onClose: () => void;
}

export const TeamAuditModal: React.FC<TeamAuditModalProps> = ({ auditLogs, onClose }) => {
  // Filter audit logs relevant to users/profiles
  const userAuditLogs = auditLogs.filter(
    (log) =>
      log.action.includes('USER') ||
      log.action.includes('ROLE') ||
      log.action.includes('SWITCH') ||
      log.action.includes('PROFILE') ||
      log.action.includes('REGION')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Team Member Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable compliance history of team profile and permission modifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 text-xs text-slate-700">
          {userAuditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-slate-600">No profile change events recorded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Any future edits to team member roles, statuses, and contact details will appear here.
              </p>
            </div>
          ) : (
            userAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">{log.actorName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs pl-0.5">{log.details}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {userAuditLogs.length} logged system events
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
