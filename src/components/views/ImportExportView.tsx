import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  UploadCloud,
  DownloadCloud,
  BookOpen,
  History,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Lock,
  Layers,
  FileDown,
} from 'lucide-react';
import { ImportSourceApp } from '../../types';
import { ExportWizardView } from './exportData/ExportWizardView';
import { ExportHistoryTab } from './exportData/ExportHistoryTab';
import { ImportWizardTab } from './importExport/ImportWizardTab';
import { MigrationGuidesTab } from './importExport/MigrationGuidesTab';
import { ImportHistoryTab } from './importExport/ImportHistoryTab';

export const ImportExportView: React.FC = () => {
  const { currentUser, switchUser, users } = useCRM();

  // Active top-level subtab (default to 'export' as requested for Export Data)
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'guides' | 'export_history' | 'import_history'>('export');
  const [selectedPresetForImport, setSelectedPresetForImport] = useState<ImportSourceApp>('generic_csv');

  // RBAC permission check: standard users can view, managers & admins can perform import & export
  const canImportExport = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleSelectPreset = (presetId: ImportSourceApp) => {
    setSelectedPresetForImport(presetId);
    setActiveTab('import');
  };

  return (
    <div id="import-export-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and RBAC User Switcher for Testing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Export & CRM Migration Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Enterprise Data Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export CRM datasets into customized CSV, TSV, or Microsoft Excel files, or migrate external contact records with automatic column mapping, duplicate resolution, and compliance audit logging.
          </p>
        </div>

        {/* Security & Role Testing Indicator */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                canImportExport ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-500">Active Role:</span>
            <span className="font-bold text-slate-900 capitalize">{currentUser.role}</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Quick User Switcher to preview admin vs manager vs standard permissions */}
          <select
            value={currentUser.id}
            onChange={(e) => switchUser(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-hidden"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Banner if Standard User */}
      {!canImportExport && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start gap-3 text-xs">
          <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              Standard User Access Policy
            </div>
            <div className="text-amber-800 leading-relaxed">
              Standard users are authorized to export personal assigned records, with restricted sensitive fields protected. Bulk database extraction and comprehensive migration tools require Manager or Administrator authorization. You can switch to Sarah Jenkins (Admin) or David Ross (Manager) using the top-right switcher for unrestricted access.
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation Bar */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'export'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DownloadCloud size={15} />
          <span>Export Data Wizard (6 Steps)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'import'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud size={15} />
          <span>Import Contacts Wizard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guides')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'guides'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={15} />
          <span>Migration Guides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export_history')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'export_history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={15} />
          <span>Export History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('import_history')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'import_history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileDown size={15} />
          <span>Import History</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'export' && (
        <ExportWizardView onNavigateToHistory={() => setActiveTab('export_history')} />
      )}

      {activeTab === 'import' && (
        <ImportWizardTab
          initialSourceApp={selectedPresetForImport}
          onNavigateToHistory={() => setActiveTab('import_history')}
        />
      )}

      {activeTab === 'guides' && (
        <MigrationGuidesTab onSelectPresetForImport={handleSelectPreset} />
      )}

      {activeTab === 'export_history' && <ExportHistoryTab />}

      {activeTab === 'import_history' && <ImportHistoryTab />}
    </div>
  );
};
