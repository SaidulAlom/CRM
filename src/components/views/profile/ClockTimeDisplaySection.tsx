import React, { useState, useEffect } from 'react';
import { User, UserPreferences } from '../../../types';
import {
  Clock,
  Calendar,
  CheckSquare,
  Bell,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatTimeDisplay, TIMEZONE_OPTIONS } from '../../../utils/profileUtils';

interface ClockTimeDisplaySectionProps {
  targetUser: User;
  onSavePreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
}

export const ClockTimeDisplaySection: React.FC<ClockTimeDisplaySectionProps> = ({
  targetUser,
  onSavePreferences,
}) => {
  const currentPrefs = targetUser.preferences;

  const [clockMode, setClockMode] = useState<'12h' | '24h'>(currentPrefs.clockMode || '12h');
  const [timeZone, setTimeZone] = useState(currentPrefs.timeZone || 'America/New_York');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Live ticking time
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: clockMode === '12h' ? 'numeric' : '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: clockMode === '12h',
        }).format(now);
        setCurrentTimeFormatted(timeStr);
      } catch {
        setCurrentTimeFormatted('02:30:00 PM');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeZone, clockMode]);

  useEffect(() => {
    setClockMode(currentPrefs.clockMode || '12h');
    setTimeZone(currentPrefs.timeZone || 'America/New_York');
    setIsDirty(false);
  }, [targetUser]);

  const handleModeChange = (mode: '12h' | '24h') => {
    setClockMode(mode);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setClockMode(currentPrefs.clockMode || '12h');
    setTimeZone(currentPrefs.timeZone || 'America/New_York');
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Clock display settings reset.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSavePreferences(targetUser.id, {
      clockMode,
      timeZone,
    });

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Clock preferences saved! All calendar appointments, activity logs, tasks, and notifications will now use the ${clockMode.toUpperCase()} format.`,
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  const currentTzObj = TIMEZONE_OPTIONS.find((t) => t.value === timeZone) || TIMEZONE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Clock & Time Display Preferences</h2>
            <p className="text-xs text-slate-500">
              Control the time formatting convention across meetings, calendar appointments, task deadlines, and activity timestamps.
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

      {/* Live Digital Clock Showcase */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-amber-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Active Live Time in Your Selected Timezone</span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-amber-300">
            {currentTimeFormatted || '12:00:00 PM'}
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Timezone: <strong>{currentTzObj.label}</strong> ({currentTzObj.offset})
          </p>
        </div>

        {/* Quick Format Selector in Banner */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleModeChange('12h')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              clockMode === '12h'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            12-Hour AM/PM
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('24h')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              clockMode === '24h'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            24-Hour Military
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Format Selection Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Choose Preferred Time Convention
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 12-Hour */}
            <div
              onClick={() => handleModeChange('12h')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                clockMode === '12h'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">12-Hour Format (AM / PM)</span>
                {clockMode === '12h' && <CheckCircle2 size={16} className="text-amber-600" />}
              </div>
              <div className="text-2xl font-mono font-bold text-amber-700 my-2">
                {formatTimeDisplay('14:30', '12h')}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standard business format in North America and the UK. Morning and afternoon hours are distinguished with AM/PM indicators.
              </p>
            </div>

            {/* 24-Hour */}
            <div
              onClick={() => handleModeChange('24h')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                clockMode === '24h'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">24-Hour Format (ISO / Military)</span>
                {clockMode === '24h' && <CheckCircle2 size={16} className="text-amber-600" />}
              </div>
              <div className="text-2xl font-mono font-bold text-amber-700 my-2">
                {formatTimeDisplay('14:30', '24h')}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                International ISO standard without ambiguity between morning and evening. Widely adopted across European, Asian, and military operations.
              </p>
            </div>
          </div>
        </div>

        {/* Application Across CRM Features */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Where This Time Format Is Automatically Applied
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Calendar Events */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Calendar size={15} />
                <span>Calendar Events</span>
              </div>
              <p className="text-[11px] text-slate-500">
                All daily, weekly, and monthly timeline grids render meetings in {clockMode}.
              </p>
              <div className="text-[11px] font-mono text-slate-700 pt-1 font-semibold">
                e.g. {formatTimeDisplay('10:00', clockMode)} – {formatTimeDisplay('11:00', clockMode)}
              </div>
            </div>

            {/* Tasks & Deadlines */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckSquare size={15} />
                <span>Tasks & Appointments</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Task due times, followup reminders, and booking slots format consistently.
              </p>
              <div className="text-[11px] font-mono text-slate-700 pt-1 font-semibold">
                Due by: {formatTimeDisplay('17:00', clockMode)}
              </div>
            </div>

            {/* Activity Logs & Audit */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                <Activity size={15} />
                <span>Activity Timestamps</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Audit logs, deal modifications, and login events display exact local time.
              </p>
              <div className="text-[11px] font-mono text-slate-700 pt-1 font-semibold">
                Updated at {formatTimeDisplay('15:45', clockMode)}
              </div>
            </div>

            {/* Notifications */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Bell size={15} />
                <span>Notifications & Alerts</span>
              </div>
              <p className="text-[11px] text-slate-500">
                TopBar bells and system warnings reflect your current {timeZone} clock.
              </p>
              <div className="text-[11px] font-mono text-slate-700 pt-1 font-semibold">
                Received at {formatTimeDisplay('09:15', clockMode)}
              </div>
            </div>

            {/* Peer Messages */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <MessageSquare size={15} />
                <span>Peer Direct Messages</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Internal team chat threads and replies timestamped in your preferred format.
              </p>
              <div className="text-[11px] font-mono text-slate-700 pt-1 font-semibold">
                Sent at {formatTimeDisplay('11:20', clockMode)}
              </div>
            </div>
          </div>
        </div>

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
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Clock Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
