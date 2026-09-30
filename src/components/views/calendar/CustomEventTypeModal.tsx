import React, { useState } from 'react';
import { X, Plus, Sparkles, Tag, Check, Trash2 } from 'lucide-react';
import { EventTypeConfig } from './calendarConstants';

interface CustomEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTypes: EventTypeConfig[];
  onAddCustomType: (newType: EventTypeConfig) => void;
  onDeleteCustomType: (typeName: string) => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', dot: '#4f46e5', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', blockBg: 'bg-indigo-100/90 text-indigo-950', blockBorder: 'border-indigo-500' },
  { name: 'Emerald', dot: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', blockBg: 'bg-emerald-100/90 text-emerald-950', blockBorder: 'border-emerald-500' },
  { name: 'Amber', dot: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', blockBg: 'bg-amber-100/90 text-amber-950', blockBorder: 'border-amber-500' },
  { name: 'Rose', dot: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', blockBg: 'bg-rose-100/90 text-rose-950', blockBorder: 'border-rose-500' },
  { name: 'Purple', dot: '#7c3aed', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', blockBg: 'bg-purple-100/90 text-purple-950', blockBorder: 'border-purple-500' },
  { name: 'Sky', dot: '#0284c7', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', blockBg: 'bg-sky-100/90 text-sky-950', blockBorder: 'border-sky-500' },
  { name: 'Teal', dot: '#0d9488', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', blockBg: 'bg-teal-100/90 text-teal-950', blockBorder: 'border-teal-500' },
  { name: 'Slate', dot: '#475569', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', blockBg: 'bg-slate-200/90 text-slate-950', blockBorder: 'border-slate-500' },
];

export const CustomEventTypeModal: React.FC<CustomEventTypeModalProps> = ({
  isOpen,
  onClose,
  customTypes,
  onAddCustomType,
  onDeleteCustomType,
}) => {
  const [typeName, setTypeName] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      setError('Event type name is required.');
      return;
    }

    const palette = PRESET_COLORS[selectedColorIdx];
    const newConfig: EventTypeConfig = {
      type: typeName.trim(),
      label: typeName.trim(),
      dotColor: palette.dot,
      badgeBg: palette.bg,
      badgeText: palette.text,
      badgeBorder: palette.border,
      blockBg: palette.blockBg,
      blockBorder: palette.blockBorder,
    };

    onAddCustomType(newConfig);
    setTypeName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Manage Custom Event Types</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Create Form */}
          <form onSubmit={handleCreate} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-xs text-slate-900">Add New Event Activity Type</div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Activity Type Name
              </label>
              <input
                type="text"
                placeholder="e.g. Executive Briefing, Product Demo, Sprint Review"
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {error && <span className="text-rose-600 text-[10px] mt-1 block">{error}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Accent Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((col, idx) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                      selectedColorIdx === idx
                        ? 'border-indigo-600 bg-white ring-2 ring-indigo-200 shadow-2xs font-bold text-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: col.dot }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Add Custom Event Type</span>
            </button>
          </form>

          {/* Existing Custom Types */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Configured Custom Types ({customTypes.length})
            </div>

            {customTypes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No custom types created yet. Default system types include Meeting, Call, Task, Appointment, and Customer Visit.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customTypes.map((ct) => (
                  <div
                    key={ct.type}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: ct.dotColor }}
                      />
                      <span className="font-semibold text-slate-800 text-xs">{ct.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCustomType(ct.type)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete type"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
