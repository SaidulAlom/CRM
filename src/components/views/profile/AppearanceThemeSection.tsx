import React, { useState, useEffect } from 'react';
import { User, UserPreferences, CRMSkin } from '../../../types';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';

interface AppearanceThemeSectionProps {
  targetUser: User;
  onSavePreferences: (userId: string, prefs: Partial<UserPreferences>) => void;
}

interface SkinMeta {
  id: CRMSkin;
  name: string;
  description: string;
  primaryColor: string;
  accentBg: string;
  badgeBg: string;
  borderHighlight: string;
}

const CRM_SKINS: SkinMeta[] = [
  {
    id: 'indigo',
    name: 'Modern Indigo / Violet',
    description: 'Crisp high-contrast SaaS palette with vivid royal indigo accents',
    primaryColor: '#4f46e5',
    accentBg: 'bg-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderHighlight: 'border-indigo-600',
  },
  {
    id: 'slate',
    name: 'Classic Corporate Slate',
    description: 'Understated minimalist monochrome for executive focus and readability',
    primaryColor: '#475569',
    accentBg: 'bg-slate-700',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    borderHighlight: 'border-slate-700',
  },
  {
    id: 'emerald',
    name: 'Emerald Growth & Revenue',
    description: 'Fresh energetic green theme inspired by pipeline milestones and cashflow',
    primaryColor: '#059669',
    accentBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderHighlight: 'border-emerald-600',
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    description: 'Deep navy-slate tones with sharp contrasts for low-light enterprise workspaces',
    primaryColor: '#0f172a',
    accentBg: 'bg-slate-900',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-700',
    borderHighlight: 'border-slate-900',
  },
  {
    id: 'sunset',
    name: 'Sunset Amber & Orange',
    description: 'Warm, vibrant terracotta and amber palette for dynamic sales squads',
    primaryColor: '#d97706',
    accentBg: 'bg-amber-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    borderHighlight: 'border-amber-600',
  },
  {
    id: 'nordic',
    name: 'Nordic Cyan / Sky',
    description: 'Cool crystalline cyan and slate for a calm, ultra-modern experience',
    primaryColor: '#0284c7',
    accentBg: 'bg-sky-600',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    borderHighlight: 'border-sky-600',
  },
];

export const AppearanceThemeSection: React.FC<AppearanceThemeSectionProps> = ({
  targetUser,
  onSavePreferences,
}) => {
  const currentPrefs = targetUser.preferences;

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(currentPrefs.theme || 'light');
  const [crmSkin, setCrmSkin] = useState<CRMSkin>(currentPrefs.crmSkin || 'indigo');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setTheme(currentPrefs.theme || 'light');
    setCrmSkin(currentPrefs.crmSkin || 'indigo');
    setIsDirty(false);
  }, [targetUser]);

  const applyDomTheme = (newTheme: 'light' | 'dark' | 'system', newSkin: CRMSkin) => {
    const root = document.documentElement;
    if (
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', newTheme);
    root.setAttribute('data-skin', newSkin);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsDirty(true);
    setFeedback(null);
    applyDomTheme(newTheme, crmSkin);
  };

  const handleSkinChange = (newSkin: CRMSkin) => {
    setCrmSkin(newSkin);
    setIsDirty(true);
    setFeedback(null);
    applyDomTheme(theme, newSkin);
  };

  const handleReset = () => {
    setTheme(currentPrefs.theme || 'light');
    setCrmSkin(currentPrefs.crmSkin || 'indigo');
    setIsDirty(false);
    applyDomTheme(currentPrefs.theme || 'light', currentPrefs.crmSkin || 'indigo');
    setFeedback({ type: 'success', message: 'Appearance preferences reset.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSavePreferences(targetUser.id, {
      theme,
      crmSkin,
    });

    applyDomTheme(theme, crmSkin);
    setIsDirty(false);
    setFeedback({
      type: 'success',
      message: `Appearance updated! Theme set to ${theme.toUpperCase()} mode with "${
        CRM_SKINS.find((s) => s.id === crmSkin)?.name
      }" skin.`,
    });

    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-pink-50 via-white to-rose-50 border border-pink-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Appearance & Theme Customization</h2>
            <p className="text-xs text-slate-500">
              Personalize the CRM user interface with Light/Dark mode and distinctive brand color accents.
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
        {/* Base Theme Mode (Light / Dark / System) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Display Mode (Theme)
              </h3>
              <p className="text-xs text-slate-500">
                Choose between bright daylight, low-light dark interface, or auto-match device OS
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 capitalize">
              Selected: {theme} Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Sun size={18} />
                </div>
                {theme === 'light' && <CheckCircle2 size={16} className="text-indigo-600" />}
              </div>
              <div className="font-bold text-xs text-slate-900">Light Mode</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Crisp enterprise white slate background with clear high-contrast typography and borders.
              </p>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-slate-900 text-white ring-2 ring-indigo-400'
                  : 'border-slate-200 bg-slate-900 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                  <Moon size={18} />
                </div>
                {theme === 'dark' && <CheckCircle2 size={16} className="text-indigo-400" />}
              </div>
              <div className="font-bold text-xs">Dark Mode</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Reduced eye fatigue for night shifts with deep obsidian backgrounds and neon accents.
              </p>
            </button>

            {/* System Default */}
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Laptop size={18} />
                </div>
                {theme === 'system' && <CheckCircle2 size={16} className="text-indigo-600" />}
              </div>
              <div className="font-bold text-xs text-slate-900">System Default</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Synchronizes automatically with your computer or mobile operating system dark/light schedule.
              </p>
            </button>
          </div>
        </div>

        {/* CRM Skin Palette Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                CRM Skin & Accent Palette
              </h3>
              <p className="text-xs text-slate-500">
                Choose an accent identity for pipeline stages, buttons, badges, and headers
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              6 Built-In Palettes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CRM_SKINS.map((skin) => {
              const isSelected = crmSkin === skin.id;
              return (
                <div
                  key={skin.id}
                  onClick={() => handleSkinChange(skin.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `${skin.borderHighlight} ring-2 ring-indigo-100 bg-slate-50/80`
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full shadow-inner border border-white"
                        style={{ backgroundColor: skin.primaryColor }}
                      />
                      <span className="font-bold text-xs text-slate-900">{skin.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    {skin.description}
                  </p>

                  {/* Micro Preview of Badge and Button */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                      style={{
                        backgroundColor: `${skin.primaryColor}15`,
                        color: skin.primaryColor,
                        borderColor: `${skin.primaryColor}30`,
                      }}
                    >
                      Active Stage
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-0.5 text-white rounded-lg text-[10px] font-semibold"
                      style={{ backgroundColor: skin.primaryColor }}
                    >
                      Sample Action
                    </button>
                  </div>
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
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Appearance Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
