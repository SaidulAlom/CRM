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
  MapPin,
  Edit2,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  USER_STATUSES,
  calculateMemberStats,
  canEditUser,
} from './teamConstants';

interface TeamMemberCardProps {
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

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
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
    <div
      onClick={() => onViewDetails(member)}
      className="group relative bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between text-xs cursor-pointer p-5 space-y-4"
    >
      {/* Top Banner / Avatar & Identity */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-sm shadow-xs">
                {initials}
              </div>
            )}
            {/* Status dot */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${statusInfo.dotColor}`}
              title={`Status: ${statusInfo.label}`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                {member.name}
              </h3>
              {isSelf && (
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                  You
                </span>
              )}
            </div>

            <p className="text-slate-600 font-medium text-xs truncate mt-0.5">
              {member.jobTitle || 'Team Member'}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
              <span>{member.department || 'Operations'}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize flex items-center gap-1">
                <Shield size={10} className="text-slate-400" />
                {member.role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Edit Icon */}
        {isEditable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(member);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Edit team member profile"
          >
            <Edit2 size={14} />
          </button>
        ) : (
          <span
            className="text-[10px] text-slate-400 shrink-0 select-none px-1.5 py-0.5 bg-slate-50 rounded"
            title="Read-only view"
          >
            View Only
          </span>
        )}
      </div>

      {/* Status note & location */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span
            className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded border text-[10px] ${statusInfo.badgeBg} ${statusInfo.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </span>

          {member.location && (
            <span className="text-slate-400 flex items-center gap-1 text-[11px] truncate max-w-[150px]">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{member.location}</span>
            </span>
          )}
        </div>

        {member.statusMessage && (
          <p className="text-[11px] text-slate-500 italic line-clamp-1">
            "{member.statusMessage}"
          </p>
        )}
      </div>

      {/* Progress & Workload Metrics */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {/* Task completion progress bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 font-medium">Task Completion</span>
            <span className="font-semibold text-slate-800">
              {stats.completedTasks}/{stats.totalTasks} ({stats.completionRate}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
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

        {/* Metric boxes: Open Deals, Open Cases */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100/90">
            <span className="text-slate-400 text-[10px] block font-medium">Active Pipeline</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                <Briefcase size={12} className="text-indigo-600" />
                {stats.openDealsCount} {stats.openDealsCount === 1 ? 'deal' : 'deals'}
              </span>
              {stats.openDealsValue > 0 && (
                <span className="text-[10px] text-slate-500 font-medium">
                  ${(stats.openDealsValue / 1000).toFixed(0)}k
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100/90">
            <span className="text-slate-400 text-[10px] block font-medium">Open Cases</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                <LifeBuoy size={12} className="text-rose-600" />
                {stats.openCasesCount}
              </span>
              {stats.overdueTasks > 0 ? (
                <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5">
                  <AlertCircle size={10} />
                  {stats.overdueTasks} late
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 size={10} />
                  On track
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Next Scheduled Event */}
        {stats.nextEvent ? (
          <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-between text-[11px]">
            <span className="text-indigo-900 font-medium truncate flex items-center gap-1.5">
              <Calendar size={11} className="text-indigo-600 shrink-0" />
              <span className="truncate">{stats.nextEvent.title}</span>
            </span>
            <span className="text-indigo-600 font-semibold shrink-0 ml-2">
              {stats.nextEvent.startDate.slice(5)} {stats.nextEvent.startTime || ''}
            </span>
          </div>
        ) : (
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              No meetings scheduled
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScheduleMeeting(member);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Book
            </button>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onScheduleMeeting(member);
          }}
          className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-1 text-[11px]"
          title="Schedule meeting with colleague"
        >
          <Calendar size={12} className="text-slate-500" />
          <span>Meet</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSendMessage(member);
          }}
          className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-1 text-[11px]"
          title="Send message to colleague"
        >
          <MessageSquare size={12} className="text-slate-500" />
          <span>Message</span>
        </button>

        {member.phone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCall(member);
            }}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg transition-colors shrink-0"
            title={`Call ${member.name} (${member.phone})`}
          >
            <Phone size={12} />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(member);
          }}
          className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors shrink-0"
          title="View comprehensive member profile & progress"
        >
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
