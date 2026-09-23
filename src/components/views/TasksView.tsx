import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Building2,
  Users,
  CheckCircle2,
  Trash2,
  Sliders,
  Flag,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    companies,
    contacts,
    users,
    currentUser,
    updateTask,
    deleteTask,
    openQuickCreate,
    openRecordDetail,
    toggleShortlist,
    isItemShortlisted,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'open' | 'completed' | 'overdue'>('all');

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.deletedAt)
      .filter((t) => {
        if (!search) return true;
        return t.title.toLowerCase().includes(search.toLowerCase());
      })
      .filter((t) => {
        if (filter === 'my') return t.assigneeId === currentUser.id;
        if (filter === 'open') return t.status !== 'Completed';
        if (filter === 'completed') return t.status === 'Completed';
        if (filter === 'overdue') return t.status !== 'Completed' && t.deadline < today;
        return true;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tasks, search, filter, currentUser.id, today]);

  return (
    <div id="tasks-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tasks & Activities</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {filteredTasks.length} tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage actionable work items with live percent-complete progress tracking and deadline monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="create-task-btn"
            onClick={() => openQuickCreate('task')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'my', 'open', 'completed', 'overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'my' ? 'My Tasks' : tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="w-10 px-3 py-3 text-center" title="Shortlist">
                  <span className="sr-only">Shortlist</span>
                  <Flag size={12} className="mx-auto text-slate-400" />
                </th>
                <th className="px-4 py-3">Task Description</th>
                <th className="px-4 py-3">Company / Contact</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3 w-52">Progress (% Complete)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isShortlisted = isItemShortlisted('task', t.id);
                  const company = companies.find((c) => c.id === t.companyId);
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  const isOverdue = t.status !== 'Completed' && t.deadline < today;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist({
                            type: 'task',
                            category: 'task',
                            id: t.id,
                            title: t.title,
                            subtitle: `${t.status} (${t.completionPercentage}%) · Due ${t.deadline}`,
                            referenceInfo: company?.name || `Due ${t.deadline}`,
                          });
                        }}
                      >
                        <button
                          id={`shortlist-btn-task-${t.id}`}
                          className={`p-1 rounded transition-colors ${
                            isShortlisted
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-amber-500'
                          }`}
                          title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                          aria-label={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                        >
                          <Flag
                            size={14}
                            className={isShortlisted ? 'text-amber-400 fill-amber-400' : ''}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{t.title}</div>
                        {t.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {company ? (
                          <span
                            onClick={() => openRecordDetail('company', company.id)}
                            className="text-indigo-600 hover:underline cursor-pointer font-medium"
                          >
                            {company.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {assignee?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'text-slate-700'
                          }`}
                        >
                          {t.deadline} {isOverdue && '(Overdue)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Interactive Progress Slider (FR-6.2) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">{t.status}</span>
                            <span className="font-bold text-indigo-600">{t.completionPercentage}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={t.completionPercentage}
                            onChange={(e) => {
                              const pct = Number(e.target.value);
                              updateTask(t.id, {
                                completionPercentage: pct,
                                status: pct === 100 ? 'Completed' : pct === 0 ? 'Not Started' : 'In Progress',
                              });
                            }}
                            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                            title="Drag to update task completion percentage"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {t.completionPercentage < 100 ? (
                            <button
                              onClick={() => updateTask(t.id, { completionPercentage: 100, status: 'Completed' })}
                              className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 font-medium"
                            >
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTask(t.id, { completionPercentage: 0, status: 'Not Started' })}
                              className="px-2 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded font-medium"
                            >
                              Re-open
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Delete task?')) deleteTask(t.id);
                            }}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded"
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
