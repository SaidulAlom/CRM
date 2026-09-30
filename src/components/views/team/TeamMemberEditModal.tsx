import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../../types';
import {
  X,
  Save,
  Shield,
  AlertCircle,
  CheckCircle2,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  User as UserIcon,
  Briefcase,
  Building,
} from 'lucide-react';
import { USER_STATUSES, DEPARTMENTS } from './teamConstants';

interface TeamMemberEditModalProps {
  member: User;
  currentUser: User;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<User>) => void;
}

export const TeamMemberEditModal: React.FC<TeamMemberEditModalProps> = ({
  member,
  currentUser,
  onClose,
  onSave,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const isSelf = currentUser.id === member.id;

  // Form states
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone || '');
  const [jobTitle, setJobTitle] = useState(member.jobTitle || '');
  const [department, setDepartment] = useState(member.department || 'Sales & Revenue');
  const [status, setStatus] = useState<UserStatus>(member.status || 'Available');
  const [statusMessage, setStatusMessage] = useState(member.statusMessage || '');
  const [location, setLocation] = useState(member.location || '');
  const [role, setRole] = useState<UserRole>(member.role);
  const [bio, setBio] = useState(member.bio || '');
  const [workingDayStart, setWorkingDayStart] = useState(
    member.preferences.workingDayStart || '09:00'
  );
  const [workingDayEnd, setWorkingDayEnd] = useState(
    member.preferences.workingDayEnd || '17:00'
  );
  const [active, setActive] = useState(member.active);

  // Skills tag manager
  const [skills, setSkills] = useState<string[]>(member.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Validation & Error Handling
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setNewSkillInput('');
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@company.com).';
    }

    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title/role designation is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const updates: Partial<User> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      status,
      statusMessage: statusMessage.trim() || undefined,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
      skills,
      preferences: {
        ...member.preferences,
        workingDayStart,
        workingDayEnd,
      },
    };

    // System role only editable by Admin (or Manager editing non-admin)
    if (isAdmin || (isManager && !isSelf && member.role !== 'admin')) {
      updates.role = role;
    }

    if (isAdmin) {
      updates.active = active;
    }

    try {
      onSave(member.id, updates);
      setSuccessMessage('Member profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to update profile. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <UserIcon size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Edit Team Member Profile
              </h3>
              <p className="text-xs text-slate-500">
                Updating details for <span className="font-semibold">{member.name}</span>
                {isSelf && ' (Your own profile)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            title="Cancel & close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banners */}
        {errors.form && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {/* Identity Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              General Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                  placeholder="e.g. Sarah Jenkins"
                />
                {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                  placeholder="name@apexsolutions.com"
                />
                {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Job Title / Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    errors.jobTitle ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                  placeholder="e.g. VP of Sales"
                />
                {errors.jobTitle && (
                  <p className="text-rose-600 text-[11px] mt-1">{errors.jobTitle}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Other">Other / Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phone / Direct Extension
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="+1 (415) 555-0199"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Location / Office
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="San Francisco, CA (HQ)"
                />
              </div>
            </div>
          </div>

          {/* Status & Presence Section */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Current Presence & Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Status Indicator
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {USER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Status Message / Headline
                </label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. In client calls until 3 PM"
                />
              </div>
            </div>
          </div>

          {/* Permissions & Working Hours */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Role & Permissions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>System Role</span>
                  {!isAdmin && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      Admin only to change
                    </span>
                  )}
                </label>
                <select
                  value={role}
                  disabled={!isAdmin}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    !isAdmin
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-300 cursor-pointer'
                  }`}
                >
                  <option value="standard">Standard User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                {isAdmin ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Active Member Account</span>
                  </label>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Account Status:{' '}
                    <strong className={active ? 'text-emerald-700' : 'text-rose-700'}>
                      {active ? 'Active' : 'Deactivated'}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Working Day Start
                </label>
                <input
                  type="time"
                  value={workingDayStart}
                  onChange={(e) => setWorkingDayStart(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Working Day End
                </label>
                <input
                  type="time"
                  value={workingDayEnd}
                  onChange={(e) => setWorkingDayEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Skills & Expertise Tags
            </h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Type a skill and press Enter (e.g. Enterprise Sales, SOC2)"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              {skills.length === 0 ? (
                <span className="text-slate-400 text-[11px]">No skills added yet.</span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-white text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 rounded"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Bio / Profile Notes */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-slate-700 font-semibold">
              Professional Bio & Responsibilities
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder="Outline key areas of domain expertise, responsibilities, or background..."
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Audit log will record this update by{' '}
            <strong className="text-slate-700">{currentUser.name}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save size={13} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
