import React, { useState, useMemo } from 'react';
import { User } from '../../../types';
import { TargetCalculation, formatMetricValue, calculateUserScorecard } from './targetUtils';
import {
  Users,
  Award,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TeamPerformanceTabProps {
  calculations: TargetCalculation[];
  users: User[];
  onSelectUserForIndividualView: (user: User) => void;
  onSelectTarget: (calc: TargetCalculation) => void;
}

export const TeamPerformanceTab: React.FC<TeamPerformanceTabProps> = ({
  calculations,
  users,
  onSelectUserForIndividualView,
  onSelectTarget,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  // Compute scorecard for all team members
  const memberScorecards = useMemo(() => {
    return users
      .filter((u) => u.active && (selectedDept === 'all' || u.department === selectedDept))
      .map((u) => calculateUserScorecard(u, calculations))
      .sort((a, b) => b.overallAttainmentRate - a.overallAttainmentRate);
  }, [users, calculations, selectedDept]);

  // Department rollups
  const departmentRollups = useMemo(() => {
    const map: Record<string, { count: number; revenueWon: number; revenueGoal: number; targets: number }> = {};
    departments.forEach((dept) => {
      map[dept] = { count: 0, revenueWon: 0, revenueGoal: 0, targets: 0 };
    });

    calculations.forEach((c) => {
      const dept = c.target.department || 'Sales & Revenue';
      if (!map[dept]) map[dept] = { count: 0, revenueWon: 0, revenueGoal: 0, targets: 0 };
      map[dept].targets++;
      if (c.target.type === 'revenue') {
        map[dept].revenueWon += c.actual;
        map[dept].revenueGoal += c.goal;
      }
    });

    return Object.entries(map).map(([dept, data]) => {
      const deptUsers = users.filter((u) => u.department === dept);
      const attainment = data.revenueGoal > 0 ? Math.round((data.revenueWon / data.revenueGoal) * 100) : 0;
      return {
        dept,
        memberCount: deptUsers.length,
        targetsCount: data.targets,
        revenueWon: data.revenueWon,
        revenueGoal: data.revenueGoal,
        attainment,
      };
    });
  }, [departments, calculations, users]);

  // Chart data: Top reps comparison
  const chartData = useMemo(() => {
    return memberScorecards.slice(0, 7).map((sc) => ({
      name: sc.user.name.split(' ')[0],
      Attainment: sc.overallAttainmentRate,
      DealsWon: sc.totalDealsWonCount,
      RevenueWonK: Math.round(sc.totalRevenueWon / 1000),
    }));
  }, [memberScorecards]);

  return (
    <div className="space-y-6">
      {/* Department Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <span>Team & Department Performance Overview</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor quota attainment rates, department rollups, and sales rep performance rankings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-600">Filter Team:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-xs text-slate-800"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentRollups.map((dr) => (
          <div
            key={dr.dept}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Department
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">{dr.dept}</h3>
                <span className="text-[11px] text-slate-500">
                  {dr.memberCount} members · {dr.targetsCount} active targets
                </span>
              </div>
              <span className="text-base font-extrabold text-indigo-600">{dr.attainment}%</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Revenue Won:</span>
                <span className="font-bold text-slate-800">${dr.revenueWon.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, dr.attainment)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attainment Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-600" />
              <span>Attainment Leaderboard (% of Assigned Quota)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live comparison of individual attainment percentages across sales and support colleagues.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '11px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Attainment" name="Overall Attainment %" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <span>Colleague Performance Ranking</span>
          </h3>
          <span className="text-xs text-slate-500">
            Click any colleague to view their dedicated performance scorecard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3 w-12 text-center">Rank</th>
                <th className="p-3">Team Member</th>
                <th className="p-3">Department</th>
                <th className="p-3">Assigned Targets</th>
                <th className="p-3">Revenue Won</th>
                <th className="p-3">Deals Won</th>
                <th className="p-3">Cases Resolved</th>
                <th className="p-3 text-right">Attainment Rate</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberScorecards.map((sc, index) => (
                <tr
                  key={sc.user.id}
                  onClick={() => onSelectUserForIndividualView(sc.user)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                >
                  <td className="p-3 text-center font-bold text-slate-500">
                    {index === 0 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-xs mx-auto">
                        1
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {sc.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{sc.user.name}</div>
                        <div className="text-[10px] text-slate-500">{sc.user.jobTitle || sc.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{sc.user.department}</td>
                  <td className="p-3 font-semibold text-slate-700">{sc.targetsAssignedCount} Targets</td>
                  <td className="p-3 font-bold text-emerald-700">${sc.totalRevenueWon.toLocaleString()}</td>
                  <td className="p-3 text-slate-700">{sc.totalDealsWonCount}</td>
                  <td className="p-3 text-slate-700">{sc.totalCasesResolvedCount}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        sc.overallAttainmentRate >= 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : sc.overallAttainmentRate >= 70
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sc.overallAttainmentRate}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
