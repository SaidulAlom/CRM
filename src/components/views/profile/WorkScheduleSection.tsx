import React, { useState, useEffect, useMemo } from 'react';
import { User, UserPreferences, UserWorkSchedule, WorkDaySchedule, WorkDayName } from '../../../types';
import {
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Sliders,
} from 'lucide-react';
import {
  DEFAULT_WORK_SCHEDULE,
  TIMEZONE_OPTIONS,
  formatTimeDisplay,
} from '../../../utils/profileUtils';

interface WorkScheduleSectionProps {
  targetUser: User;
  onSaveSchedule: (userId: string, schedule: UserWorkSchedule) => void;
  onSavePreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
  isAdmin: boolean;
}

type DayKey = WorkDayName;

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const WorkScheduleSection: React.FC<WorkScheduleSectionProps> = ({
  targetUser,
  onSaveSchedule,
  onSavePreferences,
  isAdmin,
}) => {
  const currentPrefs = targetUser.preferences;
  const initialSchedule: UserWorkSchedule = currentPrefs.workSchedule || DEFAULT_WORK_SCHEDULE;

  const [schedule, setSchedule] = useState<UserWorkSchedule>(initialSchedule);
  const [workingTimezone, setWorkingTimezone] = useState(
    initialSchedule.timezone || currentPrefs.timeZone || 'America/New_York'
  );

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const s = targetUser.preferences.workSchedule || DEFAULT_WORK_SCHEDULE;
    setSchedule(s);
    setWorkingTimezone(s.timezone || targetUser.preferences.timeZone || 'America/New_York');
    setIsDirty(false);
  }, [targetUser]);

  const handleDayToggle = (day: DayKey, enabled: boolean) => {
    setSchedule((prev) => {
      const currentDay = prev[day] || { enabled: false, start: '09:00', end: '17:00' };
      return {
        ...prev,
        [day]: {
          ...currentDay,
          enabled,
        },
      };
    });
    setIsDirty(true);
    setFeedback(null);
  };

  const handleDayTimeChange = (
    day: DayKey,
    field: 'start' | 'end' | 'breakStart' | 'breakEnd',
    val: string
  ) => {
    setSchedule((prev) => {
      const currentDay = prev[day] || { enabled: true, start: '09:00', end: '17:00' };
      return {
        ...prev,
        [day]: {
          ...currentDay,
          [field]: val,
        },
      };
    });
    setIsDirty(true);
    setFeedback(null);
  };

  // Presets
  const applyPreset = (preset: 'standard' | 'extended' | 'saturday_half' | 'support_shift') => {
    if (preset === 'standard') {
      setSchedule({
        timezone: workingTimezone,
        monday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        tuesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        wednesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        thursday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        friday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        saturday: { enabled: false, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' },
      });
    } else if (preset === 'saturday_half') {
      setSchedule({
        timezone: workingTimezone,
        monday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        tuesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        wednesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        thursday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        friday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
        saturday: { enabled: true, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' },
      });
    } else if (preset === 'extended') {
      setSchedule({
        timezone: workingTimezone,
        monday: { enabled: true, start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
        tuesday: { enabled: true, start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
        wednesday: { enabled: true, start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
        thursday: { enabled: true, start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
        friday: { enabled: true, start: '08:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
        saturday: { enabled: false, start: '08:00', end: '14:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' },
      });
    } else if (preset === 'support_shift') {
      setSchedule({
        timezone: workingTimezone,
        monday: { enabled: true, start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
        tuesday: { enabled: true, start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
        wednesday: { enabled: true, start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
        thursday: { enabled: true, start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
        friday: { enabled: true, start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
        saturday: { enabled: false, start: '10:00', end: '16:00' },
        sunday: { enabled: false, start: '10:00', end: '16:00' },
      });
    }
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    const s = targetUser.preferences.workSchedule || DEFAULT_WORK_SCHEDULE;
    setSchedule(s);
    setWorkingTimezone(s.timezone || targetUser.preferences.timeZone || 'America/New_York');
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Work schedule restored to saved settings.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Weekly hours calculation
  const totalWeeklyHours = useMemo(() => {
    let totalMinutes = 0;
    DAYS.forEach(({ key }) => {
      const day: WorkDaySchedule | undefined = schedule[key];
      if (day && day.enabled && day.start && day.end) {
        const [sh, sm] = day.start.split(':').map(Number);
        const [eh, em] = day.end.split(':').map(Number);
        let minutes = (eh * 60 + em) - (sh * 60 + sm);

        if (day.breakStart && day.breakEnd) {
          const [bsh, bsm] = day.breakStart.split(':').map(Number);
          const [beh, bem] = day.breakEnd.split(':').map(Number);
          const breakMin = (beh * 60 + bem) - (bsh * 60 + bsm);
          if (breakMin > 0) minutes -= breakMin;
        }

        if (minutes > 0) totalMinutes += minutes;
      }
    });

    return (totalMinutes / 60).toFixed(1);
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalizedSchedule: UserWorkSchedule = {
      ...schedule,
      timezone: workingTimezone,
    };

    onSaveSchedule(targetUser.id, finalizedSchedule);
    onSavePreferences(targetUser.id, {
      workingDayStart: schedule.monday?.start || '09:00',
      workingDayEnd: schedule.monday?.end || '17:00',
    });

    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Work schedule saved successfully! Total scheduled hours: ${totalWeeklyHours} hrs/week.`,
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  const clockMode = targetUser.preferences.clockMode || '12h';

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50 via-white to-emerald-50 border border-teal-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Work Schedule & Business Hours</h2>
            <p className="text-xs text-slate-500">
              Configure normal working days, business shifts, break periods, and working timezone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              Unsaved Changes
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-200">
            {totalWeeklyHours} Hours / Week
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

      {/* Quick Shift Presets Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Zap size={14} className="text-amber-500" />
            <span>Apply Schedule Template Preset</span>
          </div>
          <span className="text-[11px] text-slate-400">One-click standard configurations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
              Standard Business
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mon–Fri: 9:00 AM – 5:00 PM</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-1">40 hrs (1h lunch)</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('saturday_half')}
            className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
              Saturday Half-Day
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mon–Fri 9-5 + Sat 9-1</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-1">44 hrs / 6-day</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('extended')}
            className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
              Extended Coverage
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mon–Fri: 8:00 AM – 6:00 PM</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-1">45 hrs / week</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('support_shift')}
            className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
              Support Shift
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Mon–Fri: 10:00 AM – 7:00 PM</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-1">40 hrs (Late shift)</div>
          </button>
        </div>
      </div>

      {/* Visual Weekly Timeline Preview Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Weekly Availability Overview
            </h3>
          </div>
          <span className="text-[11px] text-teal-400 font-semibold font-mono">
            {totalWeeklyHours} Working Hours Total
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1">
          {DAYS.map(({ key, short }) => {
            const day: WorkDaySchedule | undefined = schedule[key];
            const isWorking = day?.enabled;

            return (
              <div
                key={key}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isWorking
                    ? 'border-teal-500/60 bg-teal-950/40 text-teal-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-500'
                }`}
              >
                <div className="text-xs font-bold">{short}</div>
                <div className="mt-1 text-[10px] font-mono leading-tight">
                  {isWorking ? (
                    <>
                      <div>{formatTimeDisplay(day.start, clockMode)}</div>
                      <div className="text-slate-400">to</div>
                      <div>{formatTimeDisplay(day.end, clockMode)}</div>
                      {day.breakStart && (
                        <div className="text-[9px] text-amber-400/80 mt-1">
                          Break: {formatTimeDisplay(day.breakStart, clockMode)}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 font-semibold uppercase">Off</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Working Timezone Setting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-teal-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Working Timezone</h3>
                <p className="text-[11px] text-slate-500">
                  Timezone applied to your shift hours (helpful for distributed or remote team members)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">
              Shift Timezone
            </span>
          </div>

          <select
            value={workingTimezone}
            onChange={(e) => {
              setWorkingTimezone(e.target.value);
              setIsDirty(true);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden font-medium text-slate-800"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>

        {/* Detailed Daily Hours Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daily Working Hours & Break Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Toggle days active and define working start/end times and scheduled lunch breaks
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              24-Hour Input (Auto-rendered in {clockMode})
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {DAYS.map(({ key, label }) => {
              const day: WorkDaySchedule = schedule[key] || {
                enabled: false,
                start: '09:00',
                end: '17:00',
              };

              return (
                <div key={key} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Day Toggle */}
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) => handleDayToggle(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                    <span
                      className={`text-xs font-bold ${
                        day.enabled ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                    {!day.enabled && (
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        (Off)
                      </span>
                    )}
                  </div>

                  {/* Times input if enabled */}
                  {day.enabled ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Work Start */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Start Time ({formatTimeDisplay(day.start, clockMode)})
                        </label>
                        <input
                          type="time"
                          value={day.start}
                          onChange={(e) => handleDayTimeChange(key, 'start', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Work End */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          End Time ({formatTimeDisplay(day.end, clockMode)})
                        </label>
                        <input
                          type="time"
                          value={day.end}
                          onChange={(e) => handleDayTimeChange(key, 'end', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Break Start */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                          <Coffee size={11} className="text-amber-600" />
                          <span>Break Start (Optional)</span>
                        </label>
                        <input
                          type="time"
                          value={day.breakStart || ''}
                          onChange={(e) => handleDayTimeChange(key, 'breakStart', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Break End */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                          <Coffee size={11} className="text-amber-600" />
                          <span>Break End</span>
                        </label>
                        <input
                          type="time"
                          value={day.breakEnd || ''}
                          onChange={(e) => handleDayTimeChange(key, 'breakEnd', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      Scheduled non-working day. Availability checker will flag any meetings requested on {label}.
                    </div>
                  )}
                </div>
              );
            })}
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
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Working Schedule</span>
          </button>
        </div>
      </form>
    </div>
  );
};
