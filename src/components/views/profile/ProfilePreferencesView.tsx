import React, { useState } from 'react';
import { useCRM } from '../../../context/CRMContext';
import { User, UserPreferences, UserWorkSchedule } from '../../../types';
import {
  User as UserIcon,
  Globe,
  MessageSquare,
  Lock,
  Palette,
  Clock,
  History,
  Calendar,
  CalendarCheck,
  Shield,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building,
  Briefcase,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { BasicProfileSection } from './BasicProfileSection';
import { RegionalSettingsSection } from './RegionalSettingsSection';
import { TeamWelcomeTextSection } from './TeamWelcomeTextSection';
import { PrivacySharingSection } from './PrivacySharingSection';
import { AppearanceThemeSection } from './AppearanceThemeSection';
import { ClockTimeDisplaySection } from './ClockTimeDisplaySection';
import { ActivityHistorySection } from './ActivityHistorySection';
import { WorkScheduleSection } from './WorkScheduleSection';
import { AvailabilityCheckingSection } from './AvailabilityCheckingSection';
import { RoleBasedSettingsSection } from './RoleBasedSettingsSection';
import { formatTimeDisplay, formatCurrency } from '../../../utils/profileUtils';

export type ProfileTabKey =
  | 'basic'
  | 'regional'
  | 'welcome'
  | 'privacy'
  | 'appearance'
  | 'clock'
  | 'activity'
  | 'schedule'
  | 'availability'
  | 'roles';

interface ProfileTabMeta {
  id: ProfileTabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const TABS: ProfileTabMeta[] = [
  { id: 'basic', label: 'Basic Profile', icon: UserIcon },
  { id: 'regional', label: 'Regional & Localization', icon: Globe },
  { id: 'welcome', label: 'Team Welcome Text', icon: MessageSquare },
  { id: 'privacy', label: 'Privacy & Sharing', icon: Lock },
  { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
  { id: 'clock', label: 'Clock & Time Display', icon: Clock },
  { id: 'activity', label: 'Activity History', icon: History },
  { id: 'schedule', label: 'Work Schedule', icon: Calendar },
  { id: 'availability', label: 'Availability Checking', icon: CalendarCheck },
  { id: 'roles', label: 'Role Governance & RBAC', icon: Shield },
];

export const ProfilePreferencesView: React.FC = () => {
  const {
    currentUser,
    users,
    updateUser,
    updateUserPreferences,
    updateUserWorkSchedule,
    organisation,
    updateOrganisation,
    auditLogs,
    purgeAuditLogs,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('basic');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';

  // Target user (current user by default, or another user if selected by admin/manager)
  const targetUser: User = users.find((u) => u.id === selectedUserId) || currentUser;

  // Handlers for updating user data
  const handleSaveUser = (userId: string, updates: Partial<User>) => {
    updateUser(userId, updates);
  };

  const handleSavePreferences = (userId: string, prefs: Partial<UserPreferences>) => {
    updateUserPreferences(userId, prefs);
  };

  const handleSaveSchedule = (userId: string, schedule: UserWorkSchedule) => {
    updateUserWorkSchedule(userId, schedule);
  };

  return (
    <div id="profile-preferences-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Profile Header Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        {/* Background ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-indigo-50/80 via-blue-50/40 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Avatar & Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={targetUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={targetUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-indigo-100"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                  targetUser.status === 'Available'
                    ? 'bg-emerald-500'
                    : targetUser.status === 'Busy' || targetUser.status === 'In a Meeting'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
                title={`Status: ${targetUser.status || 'Available'}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {targetUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {targetUser.role} Role
                </span>
                {targetUser.id === currentUser.id && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    My Account
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  {targetUser.jobTitle || 'Team Member'}
                </span>
                <span className="flex items-center gap-1">
                  <Building size={13} className="text-slate-400" />
                  {targetUser.department || 'CRM'} • {targetUser.team || 'Sales Team'}
                </span>
                {targetUser.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {targetUser.location}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5 font-medium">
                <span className="flex items-center gap-1 text-slate-600">
                  <Mail size={12} className="text-slate-400" />
                  {targetUser.email}
                </span>
                {targetUser.phone && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone size={12} className="text-slate-400" />
                    {targetUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Badges / Target User Selector for Admins */}
          <div className="flex flex-col sm:items-end justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            {(isAdmin || isManager) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Configure Member:</span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-3 py-1.5 border border-indigo-200 rounded-xl text-xs bg-indigo-50/50 font-bold text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg">
                Currency: <strong>{targetUser.preferences.defaultCurrency || 'USD'}</strong>
              </span>
              <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg">
                TZ: <strong>{targetUser.preferences.timeZone || 'America/New_York'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="transition-all">
        {/* 1. Basic Profile Section */}
        {activeTab === 'basic' && (
          <BasicProfileSection
            targetUser={targetUser}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            isAdmin={isAdmin}
            isManager={isManager}
          />
        )}

        {/* 2. Regional & Localization Section */}
        {activeTab === 'regional' && (
          <RegionalSettingsSection
            targetUser={targetUser}
            onSavePreferences={handleSavePreferences}
            isAdmin={isAdmin}
          />
        )}

        {/* 3. Team Welcome Text Section */}
        {activeTab === 'welcome' && (
          <TeamWelcomeTextSection
            organisation={organisation}
            currentUser={currentUser}
            users={users}
            onSaveOrganisation={updateOrganisation}
            isAdmin={isAdmin}
            isManager={isManager}
          />
        )}

        {/* 4. Privacy & Information Sharing Section */}
        {activeTab === 'privacy' && (
          <PrivacySharingSection
            targetUser={targetUser}
            organisation={organisation}
            currentUser={currentUser}
            onSaveUserPreferences={handleSavePreferences}
            onSaveOrganisation={updateOrganisation}
            isAdmin={isAdmin}
            isManager={isManager}
          />
        )}

        {/* 5. Appearance & Theme Section */}
        {activeTab === 'appearance' && (
          <AppearanceThemeSection
            targetUser={targetUser}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {/* 6. Clock & Time Display Section */}
        {activeTab === 'clock' && (
          <ClockTimeDisplaySection
            targetUser={targetUser}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {/* 7. Activity History Section */}
        {activeTab === 'activity' && (
          <ActivityHistorySection
            targetUser={targetUser}
            organisation={organisation}
            auditLogs={auditLogs}
            onSavePreferences={handleSavePreferences}
            onSaveOrganisation={updateOrganisation}
            onPurgeLogs={purgeAuditLogs}
            isAdmin={isAdmin}
          />
        )}

        {/* 8. Work Schedule Section */}
        {activeTab === 'schedule' && (
          <WorkScheduleSection
            targetUser={targetUser}
            onSaveSchedule={handleSaveSchedule}
            onSavePreferences={handleSavePreferences}
            isAdmin={isAdmin}
          />
        )}

        {/* 9. Availability Checking Section */}
        {activeTab === 'availability' && (
          <AvailabilityCheckingSection
            targetUser={targetUser}
            organisation={organisation}
            currentUser={currentUser}
            onSaveUserPreferences={handleSavePreferences}
            onSaveOrganisation={updateOrganisation}
            isAdmin={isAdmin}
          />
        )}

        {/* 10. Role Governance & RBAC Section */}
        {activeTab === 'roles' && (
          <RoleBasedSettingsSection
            currentUser={currentUser}
            targetUser={targetUser}
            users={users}
            onSelectTargetUser={(u) => setSelectedUserId(u.id)}
            isAdmin={isAdmin}
            isManager={isManager}
          />
        )}
      </div>
    </div>
  );
};
