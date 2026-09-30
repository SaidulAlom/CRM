import React from 'react';
import { User, UserRole } from '../../../types';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Sliders,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface RoleBasedSettingsSectionProps {
  currentUser: User;
  targetUser: User;
  users: User[];
  onSelectTargetUser: (user: User) => void;
  isAdmin: boolean;
  isManager: boolean;
}

interface CapabilityRow {
  feature: string;
  standard: boolean;
  manager: boolean;
  admin: boolean;
  description: string;
}

const CAPABILITIES: CapabilityRow[] = [
  {
    feature: 'Update Personal Identity & Photo',
    standard: true,
    manager: true,
    admin: true,
    description: 'Edit full name, avatar, bio, phone, mobile, and personal status message',
  },
  {
    feature: 'Regional & Localization Formats',
    standard: true,
    manager: true,
    admin: true,
    description: 'Customize default currency, timezone, date format, clock mode, and language',
  },
  {
    feature: 'Custom Appearance & CRM Skins',
    standard: true,
    manager: true,
    admin: true,
    description: 'Choose Light, Dark, or System mode and 6 enterprise brand color skins',
  },
  {
    feature: 'Personal Work Hours & Breaks',
    standard: true,
    manager: true,
    admin: true,
    description: 'Configure active days, working shifts, and lunch breaks',
  },
  {
    feature: 'Availability Conflict Warnings',
    standard: true,
    manager: true,
    admin: true,
    description: 'Enable personal schedule conflict detection for meeting organizers',
  },
  {
    feature: 'Team Welcome Banner Template',
    standard: false,
    manager: true,
    admin: true,
    description: 'Customize corporate greeting with dynamic smart variables for dashboard',
  },
  {
    feature: 'Inspect & Manage Team Schedules',
    standard: false,
    manager: true,
    admin: true,
    description: 'Review subordinate working hours, leave dates, and workload quotas',
  },
  {
    feature: 'Company-Wide Record Sharing Policies',
    standard: false,
    manager: false,
    admin: true,
    description: 'Enforce All Shared, Manager-Only, or Strict Private visibility rules',
  },
  {
    feature: 'Mandatory Availability Enforcement',
    standard: false,
    manager: false,
    admin: true,
    description: 'Mandate organizational compliance with working shifts for all bookings',
  },
  {
    feature: 'Historical Audit Log Retention & Purge',
    standard: false,
    manager: false,
    admin: true,
    description: 'Define legal data retention limits and trigger irreversible log purges',
  },
  {
    feature: 'Modify Other User Profiles & Roles',
    standard: false,
    manager: false,
    admin: true,
    description: 'Promote or demote users between Standard, Manager, and Administrator',
  },
];

export const RoleBasedSettingsSection: React.FC<RoleBasedSettingsSectionProps> = ({
  currentUser,
  targetUser,
  users,
  onSelectTargetUser,
  isAdmin,
  isManager,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Governance</h2>
            <p className="text-xs text-slate-300">
              Clear breakdown of configuration privileges and governance boundaries across Standard, Manager, and Admin roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 uppercase">
            Active: {currentUser.role}
          </span>
        </div>
      </div>

      {/* Admin / Manager User Inspection Switcher */}
      {(isAdmin || isManager) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Manage Profile & Preferences for Team Members
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAdmin
                  ? 'As an Administrator, you can view and configure preferences for any colleague in the organisation.'
                  : 'As a Manager, you can inspect and configure profile details for team members.'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700">
              Editing: <strong>{targetUser.name}</strong> ({targetUser.role})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {users.map((u) => {
              const isSelected = u.id === targetUser.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectTargetUser(u)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate text-left">
                      <div className="font-bold text-xs text-slate-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 truncate capitalize">
                        {u.role} • {u.jobTitle || u.department || 'CRM'}
                      </div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            RBAC Feature Governance Matrix
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Overview of capabilities permitted per organizational tier
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-700">
                <th className="py-3 px-4">Feature / Setting Area</th>
                <th className="py-3 px-4 text-center w-28">Standard User</th>
                <th className="py-3 px-4 text-center w-28">Manager</th>
                <th className="py-3 px-4 text-center w-28">Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {CAPABILITIES.map((cap, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{cap.feature}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{cap.description}</div>
                  </td>

                  {/* Standard */}
                  <td className="py-3 px-4 text-center">
                    {cap.standard ? (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-slate-100 text-slate-400">
                        <XCircle size={14} />
                      </span>
                    )}
                  </td>

                  {/* Manager */}
                  <td className="py-3 px-4 text-center">
                    {cap.manager ? (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-slate-100 text-slate-400">
                        <XCircle size={14} />
                      </span>
                    )}
                  </td>

                  {/* Admin */}
                  <td className="py-3 px-4 text-center">
                    {cap.admin ? (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-indigo-100 text-indigo-700">
                        <CheckCircle2 size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center p-1 rounded-full bg-slate-100 text-slate-400">
                        <XCircle size={14} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
