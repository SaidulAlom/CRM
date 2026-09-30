import React, { useState, useMemo } from 'react';
import { User } from '../../../types';
import { TargetCalculation, generateTargetsExport, triggerFileDownload, formatMetricValue } from './targetUtils';
import {
  FileSpreadsheet,
  Download,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileText,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface TargetReportsTabProps {
  calculations: TargetCalculation[];
  users: User[];
  onSelectTarget: (calc: TargetCalculation) => void;
}

export const TargetReportsTab: React.FC<TargetReportsTabProps> = ({
  calculations,
  users,
  onSelectTarget,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((c) => {
      if (filterType !== 'all' && c.target.type !== filterType) return false;
      if (filterPeriod !== 'all' && c.target.period !== filterPeriod) return false;
      if (filterDepartment !== 'all' && c.target.department !== filterDepartment) return false;
      return true;
    });
  }, [calculations, filterType, filterPeriod, filterDepartment]);

  // Export handlers
  const handleExportCSV = () => {
    const { content, filename, mimeType } = generateTargetsExport(filteredCalculations, users, 'csv');
    triggerFileDownload(content, filename, mimeType);
    setDownloadNotice(`Generated CSV report: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleExportExcel = () => {
    const { content, filename, mimeType } = generateTargetsExport(filteredCalculations, users, 'excel');
    triggerFileDownload(content, filename, mimeType);
    setDownloadNotice(`Generated Excel-compatible report: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  // Chart data: Target vs Actual comparison
  const barChartData = useMemo(() => {
    return filteredCalculations.slice(0, 8).map((c) => {
      const name = c.target.name.length > 20 ? c.target.name.substring(0, 18) + '...' : c.target.name;
      // Normalize values if revenue, show in thousands for readability
      const isRevenue = c.target.type === 'revenue';
      const goalDisplay = isRevenue ? Math.round(c.goal / 1000) : c.goal;
      const actualDisplay = isRevenue ? Math.round(c.actual / 1000) : c.actual;

      return {
        name,
        Goal: goalDisplay,
        Achieved: actualDisplay,
        unit: isRevenue ? '$k' : 'units',
      };
    });
  }, [filteredCalculations]);

  // Status breakdown data for Pie Chart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {
      Completed: 0,
      'On Track': 0,
      'At Risk': 0,
      Upcoming: 0,
      Expired: 0,
      Active: 0,
    };

    filteredCalculations.forEach((c) => {
      counts[c.computedStatus] = (counts[c.computedStatus] || 0) + 1;
    });

    const colors: Record<string, string> = {
      Completed: '#10b981',
      'On Track': '#6366f1',
      'At Risk': '#f59e0b',
      Upcoming: '#0ea5e9',
      Expired: '#ef4444',
      Active: '#8b5cf6',
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name] || '#94a3b8',
      }));
  }, [filteredCalculations]);

  // Monthly / Pacing trend
  const pacingLineData = useMemo(() => {
    return [
      { week: 'Week 1', TargetPace: 15, ActualAttainment: 12 },
      { week: 'Week 2', TargetPace: 30, ActualAttainment: 28 },
      { week: 'Week 3', TargetPace: 45, ActualAttainment: 42 },
      { week: 'Week 4', TargetPace: 60, ActualAttainment: 58 },
      { week: 'Week 5', TargetPace: 75, ActualAttainment: 72 },
      { week: 'Week 6', TargetPace: 90, ActualAttainment: 88 },
      { week: 'Current Pace', TargetPace: 100, ActualAttainment: 94 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-600" />
            <span>Target Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate target achievement vs actuals, team pacing trends, and export complete reports for Microsoft Excel.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet size={15} />
            <span>Open in Microsoft Excel</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter size={14} />
          <span>Filters:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        >
          <option value="all">All Metric Types</option>
          <option value="revenue">Revenue</option>
          <option value="units_sold">Units Sold</option>
          <option value="deals_closed">Deals Closed</option>
          <option value="cases_resolved">Customer Support Cases</option>
          <option value="new_customers">New Customers</option>
          <option value="custom_kpi">Custom KPI</option>
        </select>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        >
          <option value="all">All Periods</option>
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
          <option value="year">Yearly</option>
        </select>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        >
          <option value="all">All Departments</option>
          <option value="Sales & Revenue">Sales & Revenue</option>
          <option value="Customer Success">Customer Success</option>
        </select>

        {(filterType !== 'all' || filterPeriod !== 'all' || filterDepartment !== 'all') && (
          <button
            onClick={() => {
              setFilterType('all');
              setFilterPeriod('all');
              setFilterDepartment('all');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Target vs Actual */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Target vs Actual Achievement (Top Quotas)
              </h3>
              <p className="text-xs text-slate-500">
                Comparative analysis of target quota versus live CRM calculated results.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="Goal" name="Target Goal" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Achieved" name="Actual Achieved" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon size={16} className="text-indigo-600" />
              <span>Target Pacing Status</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of targets by automated pacing health.</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Comparison Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Comprehensive Target Attainment Audit ({filteredCalculations.length} Targets)
          </h3>
          <span className="text-xs text-slate-500">
            Click any row to inspect underlying deals, tickets, and contributor logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Target Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Department</th>
                <th className="p-3">Timeframe</th>
                <th className="p-3">Goal Value</th>
                <th className="p-3">Achieved Value</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Achievement %</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Colleagues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCalculations.map((c) => (
                <tr
                  key={c.target.id}
                  onClick={() => onSelectTarget(c)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-900">{c.target.name}</td>
                  <td className="p-3 capitalize text-slate-600">{c.target.type.replace('_', ' ')}</td>
                  <td className="p-3 text-slate-600">{c.target.department || 'All Teams'}</td>
                  <td className="p-3 text-slate-500">
                    {c.target.startDate} to {c.target.endDate}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    {formatMetricValue(c.goal, c.target.type, c.target.currency, c.target.customKpiUnit)}
                  </td>
                  <td className="p-3 font-bold text-indigo-600">
                    {formatMetricValue(c.actual, c.target.type, c.target.currency, c.target.customKpiUnit)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatMetricValue(c.remaining, c.target.type, c.target.currency, c.target.customKpiUnit)}
                  </td>
                  <td className="p-3 font-bold">
                    <span
                      className={`${
                        c.percent >= 100
                          ? 'text-emerald-700'
                          : c.percent >= 70
                          ? 'text-indigo-600'
                          : 'text-amber-700'
                      }`}
                    >
                      {c.percent}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.computedStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.computedStatus === 'On Track'
                          ? 'bg-indigo-100 text-indigo-800'
                          : c.computedStatus === 'At Risk'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.computedStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {c.target.assignedUserIds.length} Reps
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
