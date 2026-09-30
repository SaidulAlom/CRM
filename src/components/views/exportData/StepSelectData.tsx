import React from 'react';
import {
  Building2,
  Users,
  Layers,
  TrendingUp,
  LifeBuoy,
  CheckSquare,
  Calendar,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { ExportEntityType } from '../../../types';
import { EXPORT_ENTITY_CONFIGS } from './exportDefinitions';

interface StepSelectDataProps {
  selectedEntity: ExportEntityType;
  onSelectEntity: (entity: ExportEntityType) => void;
  entityCounts: Record<ExportEntityType, number>;
  onNext: () => void;
  canExportAll: boolean;
}

export const StepSelectData: React.FC<StepSelectDataProps> = ({
  selectedEntity,
  onSelectEntity,
  entityCounts,
  onNext,
  canExportAll,
}) => {
  const entityCards: {
    id: ExportEntityType;
    title: string;
    description: string;
    icon: any;
    badge: string;
    color: string;
  }[] = [
    {
      id: 'companies',
      title: 'Companies & Accounts',
      description: 'Business accounts, annual revenues, industries, headquarters, and employee counts.',
      icon: Building2,
      badge: `${entityCounts.companies} Accounts`,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'contacts',
      title: 'Contacts & People',
      description: 'Stakeholder profiles, emails, direct phones, designations, and account relationships.',
      icon: Users,
      badge: `${entityCounts.contacts} Contacts`,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'combined',
      title: 'Companies + Contacts (Combined)',
      description: 'Denormalized view joining employer company accounts with employee contact records.',
      icon: Layers,
      badge: `${entityCounts.combined} Combined`,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'deals',
      title: 'Deals & Sales Pipeline',
      description: 'Commercial opportunities, pipeline stages, probability amounts, and expected close dates.',
      icon: TrendingUp,
      badge: `${entityCounts.deals} Deals`,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      id: 'cases',
      title: 'Support Cases & Tickets',
      description: 'Service desk tickets, defect investigations, priority urgency, and resolution statuses.',
      icon: LifeBuoy,
      badge: `${entityCounts.cases} Cases`,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'tasks',
      title: 'Tasks & Action Items',
      description: 'Assigned workflow deliverables, milestone deadlines, completion %, and team owners.',
      icon: CheckSquare,
      badge: `${entityCounts.tasks} Tasks`,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      id: 'events',
      title: 'Calendar Events & Meetings',
      description: 'Customer briefing sessions, product demos, start/end timestamps, and attendees.',
      icon: Calendar,
      badge: `${entityCounts.events} Events`,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      id: 'all',
      title: 'All CRM Data (Full Archive)',
      description: 'Consolidated master bundle encompassing all CRM tables and client relationships.',
      icon: Database,
      badge: 'Full Bundle',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span>Step 1: Select CRM Data to Export</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose which dataset or CRM table you would like to export into a structured file.
          </p>
        </div>

        {canExportAll && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectEntity('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedEntity === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Database size={13} />
              <span>Select All CRM Data (Full Archive)</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Entity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {entityCards.map((card) => {
          const isSelected = selectedEntity === card.id;
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => onSelectEntity(card.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${card.color}`}
                  >
                    <Icon size={18} />
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                    {card.badge}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>{card.title}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Available fields</span>
                <span className="font-semibold text-slate-700">
                  {EXPORT_ENTITY_CONFIGS[card.id].fields.length} attributes
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center gap-2.5 text-xs text-indigo-900">
        <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
        <span>
          <strong>Role Clearance Verified:</strong> You are authorized to export {EXPORT_ENTITY_CONFIGS[selectedEntity].title}. All record retrieval complies with organizational sharing policies.
        </span>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Field Selection</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
