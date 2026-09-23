import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Users,
  Calendar,
  Briefcase,
  LifeBuoy,
  Target,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const {
    users,
    deals,
    cases,
    events,
    targets,
    openQuickCreate,
    setActiveNav,
  } = useCRM();

  const [selectedUserModal, setSelectedUserModal] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div id="team-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Roster</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {users.length} colleagues
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Colleague activity dashboard: target progress, open deals, open cases, and next scheduled event (FR-15.1).
          </p>
        </div>
      </div>

      {/* Team Cards Grid (FR-15.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const userOpenDeals = deals.filter((d) => !d.deletedAt && d.ownerId === user.id && d.status === 'open');
          const userOpenCases = cases.filter((c) => !c.deletedAt && c.ownerId === user.id && c.status !== 'Closed');
          const nextEvent = events
            .filter((e) => !e.deletedAt && e.startDate >= today && (e.participantIds.includes(user.id) || e.ownerId === user.id))
            .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

          const userTarget = targets.find((t) => t.assignedUserIds.includes(user.id));

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 text-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                    <span className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                      <Shield size={11} className="text-indigo-500" />
                      {user.role} role
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics (FR-15.1) */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Open Deals</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    <Briefcase size={13} className="text-indigo-600" />
                    {userOpenDeals.length}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Open Cases</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    <LifeBuoy size={13} className="text-rose-600" />
                    {userOpenCases.length}
                  </span>
                </div>
              </div>

              {/* Target progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Target Attainment</span>
                  <span className="font-bold text-indigo-600">67%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[67%]" />
                </div>
              </div>

              {/* Next Event */}
              <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200/60 text-[11px]">
                <span className="text-violet-700 font-semibold block mb-0.5 flex items-center gap-1">
                  <Calendar size={12} />
                  Next Event:
                </span>
                <span className="text-slate-700 font-medium truncate block">
                  {nextEvent ? `${nextEvent.startDate} - ${nextEvent.title}` : 'No upcoming events'}
                </span>
              </div>

              {/* Action buttons (FR-15.2) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openQuickCreate('event')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center font-medium transition-colors"
                  title="Schedule meeting with colleague"
                >
                  Schedule Mtg
                </button>
                <button
                  onClick={() => setActiveNav('messages')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center font-medium transition-colors"
                  title="Send message on Message Board"
                >
                  Message
                </button>
                <button
                  onClick={() => setSelectedUserModal(user.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                  title="View Profile Details"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Profile Modal */}
      {selectedUserModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          {(() => {
            const u = users.find((usr) => usr.id === selectedUserModal);
            if (!u) return null;
            return (
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                    {u.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{u.name}</h3>
                    <p className="text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">System Role</span>
                    <span className="font-semibold text-slate-800 capitalize">{u.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Direct Dial / Extension</span>
                    <span className="font-medium text-slate-700">+1 (555) 019-2831</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preferred Currency</span>
                    <span className="font-medium text-slate-700">{u.preferences.defaultCurrency}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedUserModal(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
