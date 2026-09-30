import React, { useState, useEffect } from 'react';
import { User, Organisation } from '../../../types';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Shield,
  Eye,
  Copy,
  Info,
  Users,
} from 'lucide-react';
import { interpolateWelcomeText } from '../../../utils/profileUtils';

interface TeamWelcomeTextSectionProps {
  organisation: Organisation;
  currentUser: User;
  users: User[];
  onSaveOrganisation: (updates: Partial<Organisation>) => void;
  isAdmin: boolean;
  isManager: boolean;
}

const TEMPLATE_PRESETS = [
  'Welcome to {companyName} {teamName} Dashboard, {firstName}! Have a productive day closing deals.',
  'Good day, {userName}! Check your priority pipeline, scheduled calls, and quarterly targets.',
  'Welcome back, {firstName} ({jobTitle}). Let\'s deliver customer success and break records today!',
  'Welcome to your workspace at {companyName}. Keep track of meetings, customer requests, and KPIs.',
];

const DYNAMIC_VARIABLES = [
  { tag: '{userName}', description: 'Full user name (e.g. Alex Johnson)' },
  { tag: '{firstName}', description: 'First name only (e.g. Alex)' },
  { tag: '{userRole}', description: 'Access role (e.g. ADMIN, MANAGER, STANDARD)' },
  { tag: '{jobTitle}', description: 'Official designation / job title' },
  { tag: '{department}', description: 'Department name (e.g. Sales, Support)' },
  { tag: '{teamName}', description: 'Assigned team (e.g. Enterprise Sales)' },
  { tag: '{companyName}', description: 'Organisation corporate name' },
  { tag: '{currentDate}', description: 'Today\'s date in user\'s format' },
];

export const TeamWelcomeTextSection: React.FC<TeamWelcomeTextSectionProps> = ({
  organisation,
  currentUser,
  users,
  onSaveOrganisation,
  isAdmin,
  isManager,
}) => {
  const [welcomeText, setWelcomeText] = useState(
    organisation.teamWelcomeText ||
      'Welcome to the {teamName} Dashboard at {companyName}. Have an inspired and productive day, {firstName}!'
  );
  const [previewUserId, setPreviewUserId] = useState(currentUser.id);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setWelcomeText(
      organisation.teamWelcomeText ||
        'Welcome to the {teamName} Dashboard at {companyName}. Have an inspired and productive day, {firstName}!'
    );
    setIsDirty(false);
  }, [organisation.teamWelcomeText]);

  const previewUser = users.find((u) => u.id === previewUserId) || currentUser;

  const handleInsertVariable = (tag: string) => {
    if (!canEdit) return;
    setWelcomeText((prev) => prev + ' ' + tag);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleApplyPreset = (preset: string) => {
    if (!canEdit) return;
    setWelcomeText(preset);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setWelcomeText(
      organisation.teamWelcomeText ||
        'Welcome to the {teamName} Dashboard at {companyName}. Have an inspired and productive day, {firstName}!'
    );
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Welcome text reset to current saved version.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!welcomeText.trim()) {
      setFeedback({ type: 'error', message: 'Welcome text cannot be blank.' });
      return;
    }

    onSaveOrganisation({
      teamWelcomeText: welcomeText.trim(),
    });

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: 'Team Welcome Text successfully updated! It will be displayed to all team members on the CRM home dashboard.',
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  const canEdit = isAdmin || isManager;
  const interpolatedResult = interpolateWelcomeText(welcomeText, previewUser, organisation);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Team Welcome Text Configuration</h2>
            <p className="text-xs text-slate-500">
              Customize the corporate greeting displayed to team members on the CRM Dashboard with dynamic smart variables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Shield size={12} /> Manager / Admin Authority
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Read-Only for Standard Role
            </span>
          )}
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

      {/* Live Interactive Preview */}
      <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Dashboard Banner Simulation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Preview as member:</span>
            <select
              value={previewUserId}
              onChange={(e) => setPreviewUserId(e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium text-slate-800"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Mock Dashboard Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-inner">
          <div className="flex items-center gap-3">
            <img
              src={previewUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={previewUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Welcome back, {previewUser.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase">
                  {previewUser.role}
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                {interpolatedResult}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Template Text Editor
            </h3>
            <span className="text-[11px] text-slate-400">
              Supports dynamic interpolation tags
            </span>
          </div>

          <textarea
            rows={4}
            disabled={!canEdit}
            value={welcomeText}
            onChange={(e) => {
              setWelcomeText(e.target.value);
              setIsDirty(true);
              setFeedback(null);
            }}
            placeholder="Type your team welcome message here..."
            className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 font-medium leading-relaxed"
          />

          {/* Dynamic Variable Chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Click variable tag to insert into template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DYNAMIC_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleInsertVariable(v.tag)}
                  className="p-2 border border-slate-200 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors group disabled:opacity-50"
                >
                  <div className="font-mono font-bold text-[11px] text-indigo-700 group-hover:text-indigo-900">
                    {v.tag}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {v.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sample Preset Templates */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Or pick an enterprise template preset:
            </label>
            <div className="space-y-2">
              {TEMPLATE_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs text-slate-800 transition-colors"
                >
                  <span className="truncate pr-3 font-medium">{preset}</span>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold shrink-0 transition-colors disabled:opacity-50"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canEdit && (
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Save size={14} />
              <span>Save Team Welcome Message</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
