import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../../../types';
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
  Save,
  Globe,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface BasicProfileSectionProps {
  targetUser: User;
  currentUser: User;
  onSaveUser: (userId: string, updates: Partial<User>) => void;
  isAdmin: boolean;
  isManager: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

const USER_STATUS_OPTIONS: UserStatus[] = [
  'Available',
  'Busy',
  'In a Meeting',
  'On Call',
  'Away',
  'Out of Office',
];

export const BasicProfileSection: React.FC<BasicProfileSectionProps> = ({
  targetUser,
  currentUser,
  onSaveUser,
  isAdmin,
  isManager,
}) => {
  // Form state
  const [name, setName] = useState(targetUser.name);
  const [email, setEmail] = useState(targetUser.email);
  const [phone, setPhone] = useState(targetUser.phone || '');
  const [mobile, setMobile] = useState(targetUser.mobile || '');
  const [jobTitle, setJobTitle] = useState(targetUser.jobTitle || '');
  const [department, setDepartment] = useState(targetUser.department || 'Sales');
  const [team, setTeam] = useState(targetUser.team || targetUser.department || 'Enterprise Sales');
  const [welcomeMessage, setWelcomeMessage] = useState(
    targetUser.welcomeMessage || targetUser.preferences.welcomeText || ''
  );
  const [avatar, setAvatar] = useState(targetUser.avatar || AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [location, setLocation] = useState(targetUser.location || '');
  const [bio, setBio] = useState(targetUser.bio || '');
  const [status, setStatus] = useState<UserStatus>(targetUser.status || 'Available');
  const [statusMessage, setStatusMessage] = useState(targetUser.statusMessage || '');
  const [role, setRole] = useState<UserRole>(targetUser.role);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Synchronize when target user switches
  useEffect(() => {
    setName(targetUser.name);
    setEmail(targetUser.email);
    setPhone(targetUser.phone || '');
    setMobile(targetUser.mobile || '');
    setJobTitle(targetUser.jobTitle || '');
    setDepartment(targetUser.department || 'Sales');
    setTeam(targetUser.team || targetUser.department || 'Enterprise Sales');
    setWelcomeMessage(targetUser.welcomeMessage || targetUser.preferences.welcomeText || '');
    setAvatar(targetUser.avatar || AVATAR_PRESETS[0]);
    setLocation(targetUser.location || '');
    setBio(targetUser.bio || '');
    setStatus(targetUser.status || 'Available');
    setStatusMessage(targetUser.statusMessage || '');
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
    setDepartment(targetUser.department || 'Sales');
    setTeam(targetUser.team || targetUser.department || 'Enterprise Sales');
    setWelcomeMessage(targetUser.welcomeMessage || targetUser.preferences.welcomeText || '');
    setAvatar(targetUser.avatar || AVATAR_PRESETS[0]);
    setCustomAvatarUrl('');
    setLocation(targetUser.location || '');
    setBio(targetUser.bio || '');
    setStatus(targetUser.status || 'Available');
    setStatusMessage(targetUser.statusMessage || '');
    setRole(targetUser.role);
    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: 'Form changes discarded and reset to original state.',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'Image size should be less than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleFieldChange(setAvatar, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      handleFieldChange(setAvatar, customAvatarUrl.trim());
      setCustomAvatarUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
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
      status,
      statusMessage: statusMessage.trim(),
      ...(isAdmin ? { role } : {}),
      preferences: {
        ...targetUser.preferences,
        welcomeText: welcomeMessage.trim() || targetUser.preferences.welcomeText,
      },
    };

    onSaveUser(targetUser.id, updates);
    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Profile information for ${name} has been successfully saved!`,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const isEditingSelf = targetUser.id === currentUser.id;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <UserIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Basic Profile Information</h2>
            <p className="text-xs text-slate-500">
              Manage your personal identity, contact channels, designation, team affiliation, and custom welcome message.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              Unsaved Changes
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {targetUser.role} Account
          </span>
        </div>
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
        {/* Profile Photo Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Photo & Presence
              </h3>
              <p className="text-xs text-slate-500">
                Choose a photo, upload an image, or select an avatar preset.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">JPG, PNG, GIF up to 2MB</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6 pt-2">
            {/* Current Photo Preview */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-indigo-200"
              />
              <label
                htmlFor="avatar-file-upload"
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-colors"
                title="Upload Photo"
              >
                <Camera size={14} />
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets and URL input */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Select Avatar Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFieldChange(setAvatar, preset)}
                      className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-all ${
                        avatar === preset
                          ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105'
                          : 'border-transparent hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct image URL */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Or Paste External Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customAvatarUrl.trim()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs disabled:opacity-50 transition-colors"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Status / Presence Indicator */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Presence Status
              </label>
              <select
                value={status}
                onChange={(e) => handleFieldChange(setStatus, e.target.value as UserStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-800"
              >
                {USER_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Message (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. In customer meeting until 3 PM"
                value={statusMessage}
                onChange={(e) => handleFieldChange(setStatusMessage, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Core Personal Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => handleFieldChange(setName, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.jenkins@zenithcrm.com"
                  value={email}
                  onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Office Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Phone Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => handleFieldChange(setPhone, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / Direct Phone
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 987-6543"
                  value={mobile}
                  onChange={(e) => handleFieldChange(setMobile, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Location / Office */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Location / Base City
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco Headquarters, Building B / Remote"
                  value={location}
                  onChange={(e) => handleFieldChange(setLocation, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organization, Department & Role */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Job Title, Department & Team
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title / Designation
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Senior Account Executive"
                  value={jobTitle}
                  onChange={(e) => handleFieldChange(setJobTitle, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <div className="relative">
                <Building size={14} className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => handleFieldChange(setDepartment, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  <option value="Sales">Sales & Revenue</option>
                  <option value="Customer Support">Customer Support / Success</option>
                  <option value="Marketing">Marketing & Growth</option>
                  <option value="Product">Product & Engineering</option>
                  <option value="Operations">Operations & Finance</option>
                  <option value="Executive">Executive Leadership</option>
                </select>
              </div>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team
              </label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Enterprise North America"
                  value={team}
                  onChange={(e) => handleFieldChange(setTeam, e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* User Role (Only Admins can change role) */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              System Access Role
            </label>
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <select
                  value={role}
                  onChange={(e) => handleFieldChange(setRole, e.target.value as UserRole)}
                  className="px-3 py-2 border border-indigo-200 rounded-xl text-xs bg-indigo-50/50 font-semibold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="admin">Administrator (Full System & Company Authority)</option>
                  <option value="manager">Manager (Team Level Management & Quotas)</option>
                  <option value="standard">Standard User (Personal Workspace)</option>
                </select>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield size={13} className="text-indigo-600" /> Admin privilege active
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <Shield size={14} className="text-slate-400" />
                <span className="font-semibold capitalize">{targetUser.role} Role</span>
                <span className="text-[11px] text-slate-400">
                  (Role assignments can only be modified by system administrators)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Message & Bio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Personal Welcome Text & About Me
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Personal Welcome Message
              </label>
              <span className="text-[11px] text-slate-400">
                Displayed on your dashboard greeting
              </span>
            </div>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Ready to crush Q4 enterprise quotas and deliver customer delight!"
                value={welcomeMessage}
                onChange={(e) => handleFieldChange(setWelcomeMessage, e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Bio / Professional Background
            </label>
            <textarea
              rows={3}
              placeholder="Write a brief description about your expertise, industry focus, or specialties..."
              value={bio}
              onChange={(e) => handleFieldChange(setBio, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Action Buttons: Save Changes & Cancel */}
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
