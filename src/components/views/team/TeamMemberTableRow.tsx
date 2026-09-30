import React, { useState } from 'react';
import {
  User,
  Task,
  Deal,
  Case,
  Event,
} from '../../../types';
import {
  Shield,
  Calendar,
  Briefcase,
  LifeBuoy,
  MessageSquare,
  Phone,
  Mail,
  Edit2,
  ArrowRight,
  MapPin,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  USER_STATUSES,
  calculateMemberStats,
  canEditUser,
} from './teamConstants';

interface TeamMemberTableRowProps {
  member: User;
  currentUser: User;
  tasks: Task[];
  deals: Deal[];
  cases: Case[];
  events: Event[];
  onViewDetails: (member: User) => void;
  onEdit: (member: User) => void;
  onScheduleMeeting: (member: User) => void;
  onSendMessage: (member: User) => void;
  onCall: (member: User) => void;
  onAssignTask: (member: User) => void;
}

export const TeamMemberTableRow: React.FC<TeamMemberTableRowProps> = ({
  member,
  currentUser,
  tasks,
  deals,
  cases,
  events,
  onViewDetails,
  onEdit,
  onScheduleMeeting,
  onSendMessage,
  onCall,
  onAssignTask,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const isEditable = canEditUser(currentUser, member);
  const isSelf = currentUser.id === member.id;

  const stats = calculateMemberStats(member, tasks, deals, cases, events);
  const statusInfo =
    USER_STATUSES.find((s) => s.value === member.status) || USER_STATUSES[0];

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(member.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <tr
      onClick={() => onViewDetails(member)}
      className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 cursor-pointer text-xs"
    >
      {/* Colleague Identity */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center text-xs">
                {initials}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusInfo.dotColor}`}
            />
          </div>

          <div className="min-w-0 max-w-[180px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {member.name}
              </span>
              {isSelf && (
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                  You
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span>{member.email}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="hover:text-slate-700"
                title="Copy email"
              >
                {copiedEmail ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Role & Department */}
      <td className="py-3 px-4">
        <div className="font-medium text-slate-800 truncate max-w-[160px]">
          {member.jobTitle || 'Team Member'}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[160px]">
          <span>{member.department || 'Operations'}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{member.role}</span>
        </div>
      </td>

      {/* Status & Presence */}
      <td className="py-3 px-4">
        <div>
          <span
            className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded border text-[10px] ${statusInfo.badgeBg} ${statusInfo.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </span>
          {member.statusMessage && (
            <p className="text-[11px] text-slate-400 italic truncate max-w-[170px] mt-0.5">
              {member.statusMessage}
            </p>
          )}
        </div>
      </td>

      {/* Task Progress */}
      <td className="py-3 px-4">
        <div className="w-28 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-800">{stats.completionRate}%</span>
            <span className="text-slate-400 text-[10px]">
              {stats.completedTasks}/{stats.totalTasks} done
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stats.completionRate >= 80
                  ? 'bg-emerald-500'
                  : stats.completionRate >= 40
                  ? 'bg-indigo-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(stats.completionRate, 4)}%` }}
            />
          </div>
        </div>
      </td>

      {/* Active Pipeline Deals */}
      <td className="py-3 px-4">
        <div className="font-medium text-slate-800 flex items-center gap-1">
          <Briefcase size={12} className="text-indigo-600" />
          <span>{stats.openDealsCount} deals</span>
        </div>
        <div className="text-[11px] text-slate-500">
          ${stats.openDealsValue.toLocaleString()} pipeline
        </div>
      </td>

      {/* Open Cases */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <LifeBuoy size={12} className="text-rose-600" />
          <span className="font-medium text-slate-800">{stats.openCasesCount}</span>
          {stats.overdueTasks > 0 && (
            <span className="text-[10px] text-rose-600 font-medium">
              ({stats.overdueTasks} late)
            </span>
          )}
        </div>
      </td>

      {/* Next Scheduled Event */}
      <td className="py-3 px-4">
        {stats.nextEvent ? (
          <div className="max-w-[160px] truncate">
            <div className="font-medium text-slate-800 text-[11px] truncate flex items-center gap-1">
              <Calendar size={11} className="text-indigo-600 shrink-0" />
              <span className="truncate">{stats.nextEvent.title}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.nextEvent.startDate} {stats.nextEvent.startTime || ''}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">—</span>
        )}
      </td>

      {/* Action Buttons */}
      <td className="py-3 px-4 text-right">
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onScheduleMeeting(member)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
            title="Schedule meeting"
          >
            <Calendar size={14} />
          </button>

          <button
            type="button"
            onClick={() => onSendMessage(member)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
            title="Send direct message"
          >
            <MessageSquare size={14} />
          </button>

          {member.phone && (
            <button
              type="button"
              onClick={() => onCall(member)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
              title={`Call ${member.name}`}
            >
              <Phone size={14} />
            </button>
          )}

          {isEditable && (
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit profile"
            >
              <Edit2 size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewDetails(member)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="View details"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};
