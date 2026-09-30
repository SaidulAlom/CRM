import React, { useState, useEffect } from 'react';
import { User, UserPreferences, DateFormatOption } from '../../../types';
import {
  Globe,
  DollarSign,
  Clock,
  Calendar,
  Languages,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  formatCurrency,
  formatDateDisplay,
  formatTimeDisplay,
} from '../../../utils/profileUtils';

interface RegionalSettingsSectionProps {
  targetUser: User;
  onSavePreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
  isAdmin: boolean;
}

export const RegionalSettingsSection: React.FC<RegionalSettingsSectionProps> = ({
  targetUser,
  onSavePreferences,
  isAdmin,
}) => {
  const currentPrefs = targetUser.preferences;

  // Local state
  const [currency, setCurrency] = useState(currentPrefs.defaultCurrency || 'USD');
  const [timeZone, setTimeZone] = useState(currentPrefs.timeZone || 'America/New_York');
  const [dateFormat, setDateFormat] = useState<DateFormatOption>(
    currentPrefs.dateFormat || 'YYYY-MM-DD'
  );
  const [clockMode, setClockMode] = useState<'12h' | '24h'>(currentPrefs.clockMode || '12h');
  const [language, setLanguage] = useState(currentPrefs.language || 'en-US');

  // Status & feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  // Real-time clock for live preview
  const [currentTimeStr, setCurrentTimeStr] = useState('14:30');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeInTz = new Intl.DateTimeFormat('en-US', {
          timeZone: timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
        setCurrentTimeStr(timeInTz);
      } catch {
        setCurrentTimeStr('14:30');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [timeZone]);

  useEffect(() => {
    setCurrency(currentPrefs.defaultCurrency || 'USD');
    setTimeZone(currentPrefs.timeZone || 'America/New_York');
    setDateFormat(currentPrefs.dateFormat || 'YYYY-MM-DD');
    setClockMode(currentPrefs.clockMode || '12h');
    setLanguage(currentPrefs.language || 'en-US');
    setIsDirty(false);
  }, [targetUser]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsDirty(true);
    setFeedback(null);
  };

  const handleReset = () => {
    setCurrency(currentPrefs.defaultCurrency || 'USD');
    setTimeZone(currentPrefs.timeZone || 'America/New_York');
    setDateFormat(currentPrefs.dateFormat || 'YYYY-MM-DD');
    setClockMode(currentPrefs.clockMode || '12h');
    setLanguage(currentPrefs.language || 'en-US');
    setIsDirty(false);
    setFeedback({ type: 'success', message: 'Regional preferences reset to previous values.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPrefs: Partial<UserPreferences> = {
      defaultCurrency: currency,
      timeZone,
      dateFormat,
      clockMode,
      language,
    };

    onSavePreferences(targetUser.id, updatedPrefs);
    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Regional & localization settings saved! Currency (${currency}) and Timezone (${timeZone}) will be applied throughout Deals, Reports, Calendar & Sales Targets.`,
    });

    setTimeout(() => {
      setFeedback(null), 5000;
    });
  };

  const selectedCurrencyObj = CURRENCY_OPTIONS.find((c) => c.code === currency) || CURRENCY_OPTIONS[0];
  const selectedTzObj = TIMEZONE_OPTIONS.find((t) => t.value === timeZone) || TIMEZONE_OPTIONS[0];
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Regional & Localization Preferences</h2>
            <p className="text-xs text-slate-500">
              Configure your primary currency, time zone, date formatting, clock system, and language interface.
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

      {/* Live Localization Preview Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Regional Preview in CRM
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {timeZone} ({selectedTzObj.offset})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Formatted Currency Sample */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Sample Deal & Revenue Value
            </div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatCurrency(1250000, currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Used in Deals pipeline, Reports, Quotas, and Targets
            </div>
          </div>

          {/* Formatted Date Sample */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Sample Date Display
            </div>
            <div className="text-xl font-extrabold text-blue-400">
              {formatDateDisplay(todayIso, dateFormat)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Used in Calendar, Tasks, Deadlines & Timestamps
            </div>
          </div>

          {/* Formatted Time Sample */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Current Time ({clockMode.toUpperCase()})
            </div>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {formatTimeDisplay(currentTimeStr, clockMode)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Used for Meetings, Call Schedule & Inbound logs
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default Currency */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Default Currency</h3>
                <p className="text-[11px] text-slate-500">
                  Select your primary currency symbol and format
                </p>
              </div>
            </div>

            <select
              value={currency}
              onChange={(e) => handleFieldChange(setCurrency, e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-800"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code}) — {c.symbol}
                </option>
              ))}
            </select>

            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between">
              <span>Preview: <strong>{formatCurrency(45000, currency)}</strong></span>
              <span className="text-emerald-700 font-mono text-[10px]">Symbol: {selectedCurrencyObj.symbol}</span>
            </div>
          </div>

          {/* Time Zone */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">User Time Zone</h3>
                <p className="text-[11px] text-slate-500">
                  All appointments, meeting reminders and call queues adjust to this zone
                </p>
              </div>
            </div>

            <select
              value={timeZone}
              onChange={(e) => handleFieldChange(setTimeZone, e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
              <span>Local time in this zone: <strong>{formatTimeDisplay(currentTimeStr, clockMode)}</strong></span>
              <span className="text-blue-700 font-mono text-[10px]">{selectedTzObj.offset}</span>
            </div>
          </div>

          {/* Date Format */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Date Format</h3>
                <p className="text-[11px] text-slate-500">
                  Select your preferred day/month/year sequence
                </p>
              </div>
            </div>

            <select
              value={dateFormat}
              onChange={(e) => handleFieldChange(setDateFormat, e.target.value as DateFormatOption)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
            >
              {DATE_FORMAT_OPTIONS.map((df) => (
                <option key={df.value} value={df.value}>
                  {df.label} — e.g. {df.example}
                </option>
              ))}
            </select>

            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-center justify-between">
              <span>Today in selected format:</span>
              <strong className="font-mono">{formatDateDisplay(todayIso, dateFormat)}</strong>
            </div>
          </div>

          {/* Clock Display Format (12h vs 24h) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Clock Format</h3>
                <p className="text-[11px] text-slate-500">
                  Choose between 12-hour AM/PM or 24-hour international standard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleFieldChange(setClockMode, '12h')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  clockMode === '12h'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">12-Hour Format</div>
                <div className="text-[11px] text-slate-500 mt-0.5">e.g. 02:30 PM</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-1">Standard AM/PM</div>
              </button>

              <button
                type="button"
                onClick={() => handleFieldChange(setClockMode, '24h')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  clockMode === '24h'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">24-Hour Format</div>
                <div className="text-[11px] text-slate-500 mt-0.5">e.g. 14:30</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-1">Military / ISO</div>
              </button>
            </div>
          </div>

          {/* Interface Language */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Languages size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Display Language</h3>
                <p className="text-[11px] text-slate-500">
                  Select your interface language for CRM navigation and system terminology
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleFieldChange(setLanguage, lang.code)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    language === lang.code
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-200'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{lang.nativeName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{lang.name}</div>
                </button>
              ))}
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
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Regional Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
