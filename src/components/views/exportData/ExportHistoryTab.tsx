import React, { useState } from 'react';
import {
  History,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileDown,
  Trash2,
  Calendar,
  UserCheck,
  Search,
  ExternalLink,
  Eye,
  Filter,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { ExportHistoryRecord } from '../../../types';

export const ExportHistoryTab: React.FC = () => {
  const { exportHistory, currentUser } = useCRM();
  const [selectedRecord, setSelectedRecord] = useState<ExportHistoryRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filteredHistory = exportHistory.filter((item) => {
    if (filterEntity !== 'all' && item.entity !== filterEntity) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.filename.toLowerCase().includes(q) ||
      item.exportedByName.toLowerCase().includes(q) ||
      (item.entityLabel || item.entity).toLowerCase().includes(q)
    );
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              CRM Data Export Compliance & Audit History
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logging of previous data export operations, downloaded tables, author user credentials,
            record volumes, delimiters, and applied filters.
          </p>
        </div>
      </div>

      {/* Control Bar: Search and Entity Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename, exported table, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Table Filter:</span>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Tables</option>
            <option value="companies">Companies</option>
            <option value="contacts">Contacts</option>
            <option value="combined">Combined</option>
            <option value="deals">Deals</option>
            <option value="cases">Support Cases</option>
            <option value="tasks">Tasks</option>
            <option value="events">Calendar Events</option>
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Showing <strong>{filteredHistory.length}</strong> export operations
        </div>
      </div>

      {/* Export History Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-4 font-semibold">Export ID & Table</th>
                <th className="py-2.5 px-4 font-semibold">File Name & Size</th>
                <th className="py-2.5 px-4 font-semibold">Exported By</th>
                <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                <th className="py-2.5 px-4 font-semibold text-center">Records</th>
                <th className="py-2.5 px-4 font-semibold">Format / Destination</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No export history records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.id}</div>
                      <div className="text-[10px] text-indigo-700 font-semibold uppercase">
                        {item.entityLabel || item.entity}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-slate-800 font-medium truncate max-w-[200px]" title={item.filename}>
                        {item.filename}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatFileSize(item.fileSize)} · Delimiter: &quot;{item.delimiter}&quot;
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{item.exportedByName}</div>
                      <div className="text-[10px] text-slate-400">User ID: {item.exportedBy}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {item.recordsCount}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 capitalize">
                        {item.destination === 'excel' ? 'Microsoft Excel' : item.format.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Destination: {item.destination}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        <span>{item.status || 'Completed'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Export Audit Record — {selectedRecord.id}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Full details of data extraction operation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Exported Table</span>
                <span className="text-slate-900 font-semibold">{selectedRecord.entityLabel || selectedRecord.entity}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Exported By</span>
                <span className="text-slate-900 font-semibold">{selectedRecord.exportedByName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="text-slate-900 font-semibold">
                  {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Records Exported</span>
                <span className="text-slate-900 font-semibold">{selectedRecord.recordsCount} records</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Delimiter & Encapsulation</span>
                <span className="text-slate-900 font-mono font-semibold">
                  &quot;{selectedRecord.delimiter}&quot; / {selectedRecord.encapsulation || 'double'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Row Separator</span>
                <span className="text-slate-900 font-mono font-semibold uppercase">
                  {selectedRecord.rowSeparator || 'CRLF'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">Applied Filters</span>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 font-mono text-[11px]">
                {selectedRecord.appliedFiltersSummary || 'None (All matching records)'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">
                Exported Fields ({selectedRecord.selectedFields.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                {selectedRecord.selectedFields.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-medium"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
