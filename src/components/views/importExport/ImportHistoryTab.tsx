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
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { ImportHistoryRecord } from '../../../types';

export const ImportHistoryTab: React.FC = () => {
  const { importHistory, clearImportHistory, currentUser } = useCRM();
  const [selectedRecord, setSelectedRecord] = useState<ImportHistoryRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = importHistory.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.filename.toLowerCase().includes(q) ||
      item.importedByName.toLowerCase().includes(q) ||
      item.sourceApp.toLowerCase().includes(q)
    );
  });

  const handleDownloadReport = (record: ImportHistoryRecord) => {
    const lines = ['Row Number,Original Raw Text,Errors'];
    if (record.errorReport && record.errorReport.length > 0) {
      record.errorReport.forEach((err) => {
        lines.push(
          `${err.rowNumber},"${err.rawText.replace(/"/g, '""')}","${err.errors.join('; ').replace(/"/g, '""')}"`
        );
      });
    } else {
      lines.push('N/A,No errors encountered in this import run,Clean');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `import_error_report_${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
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
              Contact Import & Migration Audit History
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance audit log of historical CRM data migrations, file sizes, author credentials,
            record counts, and downloadable error reports.
          </p>
        </div>

        {currentUser.role === 'admin' && importHistory.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to clear historical import records?')) {
                clearImportHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
          >
            <Trash2 size={13} />
            <span>Clear History Log</span>
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename, source, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="text-slate-500 text-[11px]">
          Showing <strong>{filteredHistory.length}</strong> migration operations
        </div>
      </div>

      {/* History Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-4 font-semibold">Import ID & Source</th>
                <th className="py-2.5 px-4 font-semibold">File & Size</th>
                <th className="py-2.5 px-4 font-semibold">Imported By</th>
                <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                <th className="py-2.5 px-4 font-semibold text-center">Total</th>
                <th className="py-2.5 px-4 font-semibold text-center">Success</th>
                <th className="py-2.5 px-4 font-semibold text-center">Updated</th>
                <th className="py-2.5 px-4 font-semibold text-center">Duplicates</th>
                <th className="py-2.5 px-4 font-semibold text-center">Failed</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No import history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.id}</div>
                      <div className="text-[10px] text-indigo-700 font-semibold uppercase">
                        {item.sourceApp.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-slate-800 font-medium truncate max-w-[180px]">
                        {item.filename}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatFileSize(item.fileSize)} · Delimiter: &quot;{item.delimiter}&quot;
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{item.importedByName}</div>
                      <div className="text-[10px] text-slate-400">ID: {item.importedBy}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {item.totalRecords}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {item.successCount}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-indigo-700">
                      {item.updatedCount}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-amber-700">
                      {item.duplicateCount}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-rose-700">
                      {item.failedCount}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Partially Completed'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status === 'Completed' && <CheckCircle2 size={11} />}
                        {item.status === 'Partially Completed' && <AlertTriangle size={11} />}
                        {item.status === 'Failed' && <AlertCircle size={11} />}
                        <span>{item.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Details
                        </button>

                        {item.errorReport && item.errorReport.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleDownloadReport(item)}
                            title="Download Error Report"
                            className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <FileDown size={15} />
                          </button>
                        )}
                      </div>
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
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Import Audit Details — {selectedRecord.id}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Logged migration session from {selectedRecord.filename}
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
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Source App</span>
                <span className="text-slate-900 font-semibold">{selectedRecord.sourceApp}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Imported By</span>
                <span className="text-slate-900 font-semibold">{selectedRecord.importedByName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="text-slate-900 font-semibold">
                  {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Duplicate Rule</span>
                <span className="text-slate-900 font-semibold capitalize">
                  {selectedRecord.duplicateHandlingMode}
                </span>
              </div>
            </div>

            {/* Error Report in Modal if applicable */}
            {selectedRecord.errorReport && selectedRecord.errorReport.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    <span>Error Report ({selectedRecord.errorReport.length} issues)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDownloadReport(selectedRecord)}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <FileDown size={12} />
                    <span>Export CSV Error Report</span>
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-rose-200 bg-rose-50/50 p-2.5 rounded-xl">
                  {selectedRecord.errorReport.map((err, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-rose-100 text-[11px]">
                      <div className="font-bold text-rose-800">
                        Row #{err.rowNumber}: {err.errors.join(', ')}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 truncate mt-0.5">
                        {err.rawText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>All records imported cleanly with zero validation errors.</span>
              </div>
            )}

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
