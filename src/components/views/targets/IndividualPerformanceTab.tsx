import React, { useState, useMemo } from 'react';
import { User, Target } from '../../../types';
import { TargetCalculation, formatMetricValue, calculateUserScorecard } from './targetUtils';
import {
  User as UserIcon,
  Award,
  Briefcase,
  DollarSign,
  LifeBuoy,
  Target as TargetIcon,
  ChevronRight,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface IndividualPerformanceTabProps {
  calculations: TargetCalculation[];
  users: User[];
  selectedUser: User;
  onSelectUser: (user: User) => void;
  onSelectTarget: (calc: TargetCalculation) => void;
}

export const IndividualPerformanceTab: React.FC<IndividualPerformanceTabProps> = ({
  calculations,
  users,
  selectedUser,
  onSelectUser,
  onSelectTarget,
}) => {
  const scorecard = useMemo(() => {
    return calculateUserScorecard(selectedUser, calculations);
  }, [selectedUser, calculations]);

  return (
    <div className="space-y-6">
      {/* Colleague Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserIcon size={18} className="text-indigo-600" />
            <span>Individual Performance Scorecard</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed performance quotas, achieved deals, cases resolved, and personal progress breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Select Colleague:</span>
          <select
            value={selectedUser.id}
            onChange={(e) => {
              const u = users.find((item) => item.id === e.target.value);
              if (u) onSelectUser(u);
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-xs text-indigo-700 focus:ring-2 focus:ring-indigo-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role} · {u.department || 'General'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Rep Profile & Primary Quota Attainment */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg border border-indigo-400">
            {selectedUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                {selectedUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {selectedUser.jobTitle || 'Team Member'} · {selectedUser.department} · {selectedUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Targets
            </span>
            <div className="text-xl font-bold text-white mt-0.5">
              {scorecard.targetsAssignedCount} Quotas
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              {scorecard.targetsCompletedCount} Completed
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overall Attainment
            </span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-0.5">
              {scorecard.overallAttainmentRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              Pacing Rate
            </span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Revenue Won
          </span>
          <div className="text-base font-bold text-slate-900">
            ${scorecard.totalRevenueWon.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            Quota: ${scorecard.totalRevenueGoal.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Deals Closed
          </span>
          <div className="text-base font-bold text-slate-900">
            {scorecard.totalDealsWonCount} Deals
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            Closed Won
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Units Sold
          </span>
          <div className="text-base font-bold text-slate-900">
            {scorecard.totalUnitsSoldCount} Units
          </div>
          <div className="text-[10px] text-slate-500">
            Software & Packages
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <LifeBuoy size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cases Handled
          </span>
          <div className="text-base font-bold text-slate-900">
            {scorecard.totalCasesResolvedCount} Tickets
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            Resolved & Closed
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            New Customers
          </span>
          <div className="text-base font-bold text-slate-900">
            {scorecard.totalCustomersAcquiredCount} Clients
          </div>
          <div className="text-[10px] text-slate-500">
            Accounts Converted
          </div>
        </div>
      </div>

      {/* Assigned Targets List for This Rep */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TargetIcon size={16} className="text-indigo-600" />
              <span>Assigned Targets for {selectedUser.name} ({scorecard.assignedTargets.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active quotas, member individual contribution share, and completion status.
            </p>
          </div>
        </div>

        {scorecard.assignedTargets.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
            {selectedUser.name} has not been assigned to any sales or support targets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scorecard.assignedTargets.map((calc) => {
              const mem = calc.memberContributions.find((m) => m.user.id === selectedUser.id);
              const userActual = mem?.actual || 0;
              const userGoalShare = mem?.shareGoal || calc.goal;
              const userPercent = mem?.percent || 0;

              return (
                <div
                  key={calc.target.id}
                  onClick={() => onSelectTarget(calc)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs cursor-pointer transition-all space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{calc.target.name}</h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {calc.target.period}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {calc.target.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 text-sm">{userPercent}%</span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, userPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        Contributed:{' '}
                        <strong>
                          {formatMetricValue(userActual, calc.target.type, calc.target.currency, calc.target.customKpiUnit)}
                        </strong>
                      </span>
                      <span>
                        Target Share:{' '}
                        <strong>
                          {formatMetricValue(userGoalShare, calc.target.type, calc.target.currency, calc.target.customKpiUnit)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Deadline: {calc.target.endDate} ({calc.timeRemainingDays} days left)
                    </span>
                    <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                      <span>View Target</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
