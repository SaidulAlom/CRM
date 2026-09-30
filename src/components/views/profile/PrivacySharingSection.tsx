import React, { useState, useEffect } from 'react';
import { User, Organisation, UserPreferences, ProfileVisibility, SharingPolicy } from '../../../types';
import {
  Shield,
  Eye,
  Lock,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface PrivacySharingSectionProps {
  targetUser: User;
  organisation: Organisation;
  currentUser: User;
  onSaveUserPreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
  onSaveOrganisation: (updates: Partial<Organisation>) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export const PrivacySharingSection: React.FC<PrivacySharingSectionProps> = ({
  targetUser,
  organisation,
  currentUser,
  onSaveUserPreferences,
  onSaveOrganisation,
  isAdmin,
  isManager,
}) => {
  const currentPrefs = targetUser.preferences;

  // User-level privacy state
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    currentPrefs.profileVisibility || 'public'
  );
  const [shareWorkSchedule, setShareWorkSchedule] = useState<boolean>(
    currentPrefs.shareWorkSchedule !== false
  );
  const [shareContactDetails, setShareContactDetails] = useState<boolean>(
    currentPrefs.shareContactDetails !== false
  );
  const [allowDirectMessaging, setAllowDirectMessaging] = useState<boolean>(
    currentPrefs.allowDirectMessaging !== false
  );

  // Company-wide sharing policy (Admin only)
  const [sharingPolicy, setSharingPolicy] = useState<SharingPolicy>(organisation.sharingPolicy);
  const [allowTeamSharing, setAllowTeamSharing] = useState<boolean>(
    organisation.allowTeamSharing !== false
  );

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setProfileVisibility(currentPrefs.profileVisibility || 'public');
    setShareWorkSchedule(currentPrefs.shareWorkSchedule !== false);
    setShareContactDetails(currentPrefs.shareContactDetails !== false);
    setAllowDirectMessaging(currentPrefs.allowDirectMessaging !== false);
    setSharingPolicy(organisation.sharingPolicy);
    setAllowTeamSharing(organisation.allowTeamSharing !== false);
    setIsDirty(false);
  }, [targetUser, organisation]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setProfileVisibility(currentPrefs.profileVisibility || 'public');
    setShareWorkSchedule(currentPrefs.shareWorkSchedule !== false);
    setShareContactDetails(currentPrefs.shareContactDetails !== false);
    setAllowDirectMessaging(currentPrefs.allowDirectMessaging !== false);
    setSharingPolicy(organisation.sharingPolicy);
    setAllowTeamSharing(organisation.allowTeamSharing !== false);
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Privacy options reverted to saved values.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update User Privacy preferences
    onSaveUserPreferences(targetUser.id, {
      profileVisibility,
      shareWorkSchedule,
      shareContactDetails,
      allowDirectMessaging,
    });

    // 2. If Admin, also update company-wide sharing policies
    if (isAdmin) {
      onSaveOrganisation({
        sharingPolicy,
        allowTeamSharing,
      });
    }

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: 'Privacy & Information Sharing preferences saved successfully!',
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Privacy & Information Sharing</h2>
            <p className="text-xs text-slate-500">
              Configure visibility rules for your profile, contacts, schedule availability, and role-based sharing permissions.
            </p>
          </div>
        </div>

        {isDirty && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Visibility Level */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Visibility Tier (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Determine who inside the CRM organization can view this profile's full information
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 capitalize">
              Current: {profileVisibility.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Public */}
            <div
              onClick={() => handleFieldChange(setProfileVisibility, 'public')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                profileVisibility === 'public'
                  ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Users size={16} />
                </div>
                {profileVisibility === 'public' && (
                  <CheckCircle2 size={16} className="text-purple-600" />
                )}
              </div>
              <div className="font-bold text-xs text-slate-900">Entire Team (Public)</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Profile, active presence, designation, and skills are visible to all CRM users across every team.
              </p>
            </div>

            {/* Managers Only */}
            <div
              onClick={() => handleFieldChange(setProfileVisibility, 'manager_only')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                profileVisibility === 'manager_only'
                  ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck size={16} />
                </div>
                {profileVisibility === 'manager_only' && (
                  <CheckCircle2 size={16} className="text-purple-600" />
                )}
              </div>
              <div className="font-bold text-xs text-slate-900">Managers Only</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Detailed profile is only accessible to direct managers and administrators. Peers see minimal card.
              </p>
            </div>

            {/* Private */}
            <div
              onClick={() => handleFieldChange(setProfileVisibility, 'private')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                profileVisibility === 'private'
                  ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Lock size={16} />
                </div>
                {profileVisibility === 'private' && (
                  <CheckCircle2 size={16} className="text-purple-600" />
                )}
              </div>
              <div className="font-bold text-xs text-slate-900">Private (Confidential)</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Private information is strictly masked from team members; only system administrators can inspect full details.
              </p>
            </div>
          </div>
        </div>

        {/* Granular Field-Level Privacy Toggles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Field-Level & Activity Sharing Switches
          </h3>

          <div className="divide-y divide-slate-100">
            {/* Share Phone & Mobile */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Share Direct Phone & Mobile Numbers
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allow colleagues to view office phone and mobile number in user directory
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareContactDetails}
                  onChange={(e) => handleFieldChange(setShareContactDetails, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Share Work Schedule & Availability */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Share Working Hours & Availability Calendar
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allow meeting organizers and task assigners to view your weekly hours and scheduled leave
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareWorkSchedule}
                  onChange={(e) => handleFieldChange(setShareWorkSchedule, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Direct Messaging */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Allow Direct In-App Peer Messaging
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Permit colleagues to send direct instant messages and task reminders
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDirectMessaging}
                  onChange={(e) => handleFieldChange(setAllowDirectMessaging, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Administrator Organization-Wide Sharing Controls */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Organization-Wide Sharing Policy (Admin Control)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Company Policy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* All Shared */}
              <button
                type="button"
                onClick={() => handleFieldChange(setSharingPolicy, 'all_shared')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sharingPolicy === 'all_shared'
                    ? 'border-indigo-400 bg-indigo-900/60 ring-2 ring-indigo-400/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>All Records Shared</span>
                  {sharingPolicy === 'all_shared' && <CheckCircle2 size={14} className="text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  All authenticated users can view company records and reports
                </div>
              </button>

              {/* Private Visible to Managers */}
              <button
                type="button"
                onClick={() => handleFieldChange(setSharingPolicy, 'private_visible_to_managers')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sharingPolicy === 'private_visible_to_managers'
                    ? 'border-indigo-400 bg-indigo-900/60 ring-2 ring-indigo-400/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Manager Visibility Only</span>
                  {sharingPolicy === 'private_visible_to_managers' && <CheckCircle2 size={14} className="text-indigo-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Only assigned owners, designated managers and admins can inspect
                </div>
              </button>

              {/* Strictly Private */}
              <button
                type="button"
                onClick={() => handleFieldChange(setSharingPolicy, 'private_to_owner')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sharingPolicy === 'private_to_owner'
                    ? 'border-indigo-400 bg-indigo-900/60 ring-2 ring-indigo-400/40 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Strictly Private to Owner</span>
                  {sharingPolicy === 'private_to_owner' && <CheckCircle2 size={14} className="text-amber-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Records visible only to record creator and system super-admins
                </div>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-indigo-900/80">
              <div>
                <span className="font-semibold">Allow Cross-Team Peer Sharing:</span>
                <span className="text-[11px] text-slate-400 ml-2">
                  When disabled, members cannot share records outside their own department
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowTeamSharing}
                  onChange={(e) => handleFieldChange(setAllowTeamSharing, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            <span>Cancel / Reset</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Privacy & Sharing Options</span>
          </button>
        </div>
      </form>
    </div>
  );
};
