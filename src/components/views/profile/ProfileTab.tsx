import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Building,
  Users,
  MessageSquare,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  RotateCcw,
  Sparkles,
  Shield,
  Upload,
} from 'lucide-react';

interface ProfileTabProps {
  targetUser: User;
  currentUser: User;
  onSave: (updatedUser: Partial<User>) => void;
  isAdmin: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  targetUser,
  currentUser,
  onSave,
  isAdmin,
}) => {
  // Form State
  const [name, setName] = useState(targetUser.name);
  const [email, setEmail] = useState(targetUser.email);
  const [phone, setPhone] = useState(targetUser.phone || '');
  const [mobile, setMobile] = useState(targetUser.mobile || '');
  const [jobTitle, setJobTitle] = useState(targetUser.jobTitle || '');
  const [department, setDepartment] = useState(targetUser.department || '');
  const [team, setTeam] = useState(targetUser.team || targetUser.department || 'Sales Team');
  const [welcomeMessage, setWelcomeMessage] = useState(
    targetUser.welcomeMessage || targetUser.preferences.welcomeText || ''
  );
  const [avatar, setAvatar] = useState(targetUser.avatar || AVATAR_PRESETS[0]);
  const [location, setLocation] = useState(targetUser.location || '');
  const [bio, setBio] = useState(targetUser.bio || '');
  const [role, setRole] = useState<UserRole>(targetUser.role);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Sync state when targetUser changes
  useEffect(() => {
    setName(targetUser.name);
    setEmail(targetUser.email);
    setPhone(targetUser.phone || '');
    setMobile(targetUser.mobile || '');
    setJobTitle(targetUser.jobTitle || '');
    setDepartment(targetUser.department || '');
    setTeam(targetUser.team || targetUser.department || 'Sales Team');
    setWelcomeMessage(targetUser.welcomeMessage || targetUser.preferences.welcomeText || '');
    setAvatar(targetUser.avatar || AVATAR_PRESETS[0]);
    setLocation(targetUser.location || '');
    setBio(targetUser.bio || '');
    setRole(targetUser.role);
    setIsDirty(false);
  }, [targetUser]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setName(targetUser.name);
    setEmail(targetUser.email);
    setPhone(targetUser.phone || '');
    setMobile(targetUser.mobile || '');
    setJobTitle(targetUser.jobTitle || '');
    setDepartment(targetUser.department || '');
    setTeam(targetUser.team || targetUser.department || 'Sales Team');
    setWelcomeMessage(targetUser.welcomeMessage || targetUser.preferences.welcomeText || '');
    setAvatar(targetUser.avatar || AVATAR_PRESETS[0]);
    setLocation(targetUser.location || '');
    setBio(targetUser.bio || '');
    setRole(targetUser.role);
    setIsDirty(false);
    setFeedback(null);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleFieldChange(setAvatar, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Full name is required.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'A valid email address is required.' });
      return;
    }

    const updates: Partial<User> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      mobile: mobile.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      team: team.trim(),
      welcomeMessage: welcomeMessage.trim(),
      avatar: avatar.trim(),
      location: location.trim(),
      bio: bio.trim(),
      ...(isAdmin ? { role } : {}),
      preferences: {
        ...targetUser.preferences,
        welcomeText: welcomeMessage.trim(),
      },
    };

    onSave(updates);
    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Profile details for ${name} saved successfully!`,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const isEditingSelf = targetUser.id === currentUser.id;
  const canEditRole = isAdmin;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-700">
      {/* Feedback Alert */}
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

      {/* Profile Photo & Quick Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative group shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-indigo-100"
          />
          <label
            htmlFor="avatar-file-input"
            className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer transition-colors"
            title="Upload custom photo"
          >
            <Camera size={14} />
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{name || 'User Profile'}</h3>
            <p className="text-[11px] text-slate-500">
              {jobTitle || 'Team Member'} · {department || 'General'} ·{' '}
              <span className="capitalize font-semibold text-indigo-600">{role}</span>
            </p>
          </div>

          {/* Quick preset selector */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Choose from Preset Avatars or Upload Custom Photo
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFieldChange(setAvatar, presetUrl)}
                  className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                    avatar === presetUrl
                      ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={presetUrl} alt="Preset avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Profile Details Form Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <UserIcon size={16} className="text-indigo-600" />
            <span>Personal & Contact Information</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Basic contact details and identification across the CRM.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleFieldChange(setName, e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handleFieldChange(setPhone, e.target.value)}
                placeholder="+1 (415) 555-0142"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mobile / Direct Line</label>
            <div className="relative">
              <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => handleFieldChange(setMobile, e.target.value)}
                placeholder="+1 (415) 555-0199"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office / Location</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => handleFieldChange(setLocation, e.target.value)}
                placeholder="e.g. San Francisco, CA (HQ)"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Role Access</label>
            {canEditRole ? (
              <select
                value={role}
                onChange={(e) => handleFieldChange(setRole, e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="standard">Standard Member (Quota & Record Viewer)</option>
                <option value="manager">Manager (Team & Target Oversight)</option>
                <option value="admin">Administrator (Full Global Authority)</option>
              </select>
            ) : (
              <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold capitalize text-slate-700 flex items-center justify-between">
                <span>{role} Role</span>
                <span className="text-[10px] text-slate-400 font-normal">Managed by Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organisational Department & Team */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building size={16} className="text-indigo-600" />
            <span>Organisation & Team Designation</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Job title, organizational department, and operational team groupings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Job Title / Designation
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => handleFieldChange(setJobTitle, e.target.value)}
              placeholder="e.g. Senior Account Executive"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => handleFieldChange(setDepartment, e.target.value)}
              placeholder="e.g. Sales & Revenue"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Team / Pod</label>
            <input
              type="text"
              value={team}
              onChange={(e) => handleFieldChange(setTeam, e.target.value)}
              placeholder="e.g. Enterprise Cloud Sales"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">
              Welcome Message / Dashboard Greeting Text
            </label>
            <textarea
              rows={2}
              value={welcomeMessage}
              onChange={(e) => handleFieldChange(setWelcomeMessage, e.target.value)}
              placeholder="Personal welcome message shown on dashboard header..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This message appears under your name on the CRM Home Dashboard.
            </p>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">
              Professional Biography & Summary
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => handleFieldChange(setBio, e.target.value)}
              placeholder="Brief professional background, areas of responsibility, and expertise..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons: Save Changes & Cancel */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="text-[11px] text-slate-500">
          {isDirty ? (
            <span className="text-amber-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes pending
            </span>
          ) : (
            <span className="text-slate-400">All changes saved</span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
};
