import React, { useState } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  ImportPreviewStats,
  DuplicateHandlingMode,
  ImportHistoryRecord,
} from '../../../types';

interface StepImportExecutionProps {
  stats: ImportPreviewStats;
  duplicateMode: DuplicateHandlingMode;
  fileName: string;
  isImporting: boolean;
  importResult: ImportHistoryRecord | null;
  onExecuteImport: () => void;
  onDownloadErrorReport: () => void;
  onResetWizard: () => void;
  onPrev: () => void;
}

export const StepImportExecution: React.FC<StepImportExecutionProps> = ({
  stats,
  duplicateMode,
  fileName,
  isImporting,
  importResult,
  onExecuteImport,
  onDownloadErrorReport,
  onResetWizard,
  onPrev,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Projected counts based on mode
  const recordsToInsert =
    duplicateMode === 'create_new'
      ? stats.validRecords
      : stats.validRecords - stats.duplicateRecords;

  const recordsToUpdate =
    duplicateMode === 'update' ? stats.duplicateRecords : 0;

  const recordsToSkip =
    duplicateMode === 'skip'
      ? stats.duplicateRecords + stats.invalidRecords
      : stats.invalidRecords;

  return (
    <div className="space-y-6">
      {/* If Import Completed: Show Final Summary Screen */}
      {importResult ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Import Process Completed Successfully!
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Records have been processed, validated, and saved to your CRM contacts database.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {importResult.status}
            </span>
          </div>

          {/* Outcome Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Records</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {importResult.totalRecords}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block">Successfully Added</span>
              <span className="text-xl font-bold text-emerald-800 mt-1 block">
                {importResult.successCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[11px] font-semibold text-indigo-700 block">Contacts Updated</span>
              <span className="text-xl font-bold text-indigo-800 mt-1 block">
                {importResult.updatedCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-700 block">Duplicates Handled</span>
              <span className="text-xl font-bold text-amber-800 mt-1 block">
                {importResult.duplicateCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[11px] font-semibold text-rose-700 block">Skipped / Failed</span>
              <span className="text-xl font-bold text-rose-800 mt-1 block">
                {importResult.failedCount}
              </span>
            </div>
          </div>

          {/* Error Report Download if any errors occurred */}
          {importResult.errorReport && importResult.errorReport.length > 0 ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-amber-700 shrink-0" />
                <div>
                  <div className="font-bold text-amber-900">
                    {importResult.errorReport.length} Records Encountered Validation Issues
                  </div>
                  <div className="text-amber-800 text-[11px]">
                    Download an audit error report with row numbers and exact validation failure details.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onDownloadErrorReport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold shadow-2xs transition-colors"
              >
                <FileDown size={14} />
                <span>Download Error Report (.CSV)</span>
              </button>
            </div>
          ) : null}

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="text-slate-500 text-[11px]">
              Import record logged to audit history by system authorization.
            </div>

            <button
              type="button"
              onClick={onResetWizard}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              <RotateCcw size={14} />
              <span>Import Another File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Final Confirmation Before Running Import */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Step 6 — Final Review & Confirmation
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Confirm your import specifications before inserting records into your CRM database.
                </p>
              </div>
            </div>

            {/* Summary Cards of Operations */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  New Contacts to Create
                </span>
                <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                  {recordsToInsert}
                </span>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">
                  Fresh records added to pipeline
                </span>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
                  Existing to Update
                </span>
                <span className="text-2xl font-bold text-indigo-900 mt-1 block">
                  {recordsToUpdate}
                </span>
                <span className="text-[10px] text-indigo-700 mt-0.5 block">
                  {duplicateMode === 'update' ? 'Merged with new data' : 'Not configured to update'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Duplicates Encountered
                </span>
                <span className="text-2xl font-bold text-amber-900 mt-1 block">
                  {stats.duplicateRecords}
                </span>
                <span className="text-[10px] text-amber-700 mt-0.5 block">
                  Mode: {duplicateMode.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
                  Records Skipped
                </span>
                <span className="text-2xl font-bold text-rose-900 mt-1 block">
                  {recordsToSkip}
                </span>
                <span className="text-[10px] text-rose-700 mt-0.5 block">
                  Duplicates & invalid records
                </span>
              </div>
            </div>

            {/* Audit / Compliance Note */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800">
                  Role-Based Audit Verification
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  Executing this import will associate records with your active session, log file checksums,
                  timestamp, and records count to the system audit trail.
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onPrev}
                disabled={isImporting}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 disabled:opacity-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Duplicates</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isImporting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Contacts...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    <span>Import Contacts Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Contact Data Import
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    You are about to import <strong className="text-slate-800">{stats.totalRecords} records</strong> from{' '}
                    <span className="font-mono text-slate-700">{fileName}</span>.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insert new records:</span>
                    <strong className="text-emerald-700">{recordsToInsert}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Update existing:</span>
                    <strong className="text-indigo-700">{recordsToUpdate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duplicate strategy:</span>
                    <strong className="text-slate-800 capitalize">{duplicateMode.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      onExecuteImport();
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
