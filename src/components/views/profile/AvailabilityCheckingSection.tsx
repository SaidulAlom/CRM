import React, { useState, useEffect } from 'react';
import { User, Organisation, UserPreferences } from '../../../types';
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  CheckSquare,
  LifeBuoy,
  PhoneCall,
  Play,
} from 'lucide-react';
import { isWithinWorkingHours, formatTimeDisplay, formatDateDisplay } from '../../../utils/profileUtils';

interface AvailabilityCheckingSectionProps {
  targetUser: User;
  organisation: Organisation;
  currentUser: User;
  onSaveUserPreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
  onSaveOrganisation: (updates: Partial<Organisation>) => void;
  isAdmin: boolean;
}

export const AvailabilityCheckingSection: React.FC<AvailabilityCheckingSectionProps> = ({
  targetUser,
  organisation,
  currentUser,
  onSaveUserPreferences,
  onSaveOrganisation,
  isAdmin,
}) => {
  const currentPrefs = targetUser.preferences;

  const [checkAvailability, setCheckAvailability] = useState<boolean>(
    currentPrefs.checkSchedulesAgainstAvailability !== false
  );
  const [enforceOrgWide, setEnforceOrgWide] = useState<boolean>(
    organisation.enforceAvailabilityChecking || false
  );

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Live Conflict Simulator State
  const [simDate, setSimDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [simStartTime, setSimStartTime] = useState('13:00');
  const [simEndTime, setSimEndTime] = useState('14:00');
  const [simResult, setSimResult] = useState<{ withinHours: boolean; reason?: string } | null>(null);

  useEffect(() => {
    setCheckAvailability(currentPrefs.checkSchedulesAgainstAvailability !== false);
    setEnforceOrgWide(organisation.enforceAvailabilityChecking || false);
    setIsDirty(false);
  }, [targetUser, organisation]);

  // Run simulation whenever simulation inputs or user schedule change
  const runSimulator = () => {
    const res = isWithinWorkingHours(simDate, simStartTime, simEndTime, targetUser);
    setSimResult(res);
  };

  useEffect(() => {
    runSimulator();
  }, [simDate, simStartTime, simEndTime, targetUser]);

  const handleReset = () => {
    setCheckAvailability(currentPrefs.checkSchedulesAgainstAvailability !== false);
    setEnforceOrgWide(organisation.enforceAvailabilityChecking || false);
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Availability check preferences reset.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveUserPreferences(targetUser.id, {
      checkSchedulesAgainstAvailability: checkAvailability,
    });

    if (isAdmin) {
      onSaveOrganisation({
        enforceAvailabilityChecking: enforceOrgWide,
      });
    }

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: 'Availability checking rules successfully saved!',
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  const clockMode = targetUser.preferences.clockMode || '12h';

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-cyan-50 via-white to-blue-50 border border-cyan-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-sm">
            <CalendarCheck size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Availability & Schedule Conflict Checking</h2>
            <p className="text-xs text-slate-500">
              Warn organizers when meetings, tasks, or events are booked outside active working hours or during lunch breaks.
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

      {/* Interactive Conflict Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Availability Simulator
            </h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">
            Test Scheduling Against {targetUser.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select Test Date
            </label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Start Time ({formatTimeDisplay(simStartTime, clockMode)})
            </label>
            <input
              type="time"
              value={simStartTime}
              onChange={(e) => setSimStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              End Time ({formatTimeDisplay(simEndTime, clockMode)})
            </label>
            <input
              type="time"
              value={simEndTime}
              onChange={(e) => setSimEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Simulator Output Result */}
        <div className="pt-2">
          {simResult?.withinHours ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-emerald-300">
                  Slots Available (Within Working Hours)
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  {targetUser.name} is on duty during this interval ({formatTimeDisplay(simStartTime, clockMode)} – {formatTimeDisplay(simEndTime, clockMode)}). No schedule conflict detected.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-rose-300">
                  Schedule Conflict Detected! (Warning Triggered)
                </div>
                <div className="text-[11px] text-rose-300 mt-0.5 font-medium">
                  {simResult?.reason || `${targetUser.name} is unavailable during this time.`}
                </div>
                <div className="text-[10px] text-rose-400/80 mt-1">
                  When enabled, organizers attempting to schedule a meeting or assign a task will see this exact warning.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Availability Check Switch */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 shrink-0 mt-0.5">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Check Schedules Against User Availability
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  When enabled, the CRM automatically evaluates working hours, lunch breaks, non-working days, and scheduled leaves whenever someone schedules an appointment or assigns a task to you.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={checkAvailability}
                onChange={(e) => {
                  setCheckAvailability(e.target.checked);
                  setIsDirty(true);
                  setFeedback(null);
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Feature Touchpoints Grid */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Features Guarded by Availability Checking:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Users size={14} className="text-cyan-600" />
                  <span>Meetings & Calls</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Flags participant unavailability in meeting scheduler.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-cyan-600" />
                  <span>Task Delegation</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Warns managers if deadlines fall on an off day.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <PhoneCall size={14} className="text-cyan-600" />
                  <span>Call Scheduling</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Prevents routing inbound callbacks outside business shift.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <LifeBuoy size={14} className="text-cyan-600" />
                  <span>Support Cases</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Guarantees active coverage during SLA commitments.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Administrator Organization-Wide Enforcement Toggle */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white border border-cyan-800 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Enforce Availability Checking Across Organization (Admin)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Company Mandate
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-300 max-w-xl">
                When enabled, availability verification is mandatory across all employees, preventing meetings from being booked during non-working days or scheduled breaks regardless of individual preferences.
              </p>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enforceOrgWide}
                  onChange={(e) => {
                    setEnforceOrgWide(e.target.checked);
                    setIsDirty(true);
                    setFeedback(null);
                  }}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
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
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Availability Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
};
