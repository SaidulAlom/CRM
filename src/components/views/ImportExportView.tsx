import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  DownloadCloud,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';

export const ImportExportView: React.FC = () => {
  const {
    contacts,
    companies,
    deals,
    cases,
    tasks,
    addContact,
    addCompany,
    currentUser,
    defaultCompany,
  } = useCRM();

  const [importType, setImportType] = useState<'contacts' | 'companies'>('contacts');
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sample CSV templates
  const sampleContactsCsv = `firstName,lastName,email,phone,title\nSarah,Connor,sarah@cyberdyne.com,+1 555-0199,Head of Security\nJohn,Doe,john.doe@acme.corp,+1 555-0188,VP Procurement`;
  const sampleCompaniesCsv = `name,industry,website,phone,priority\nNexus Dynamics,Technology,https://nexusdyn.com,+1 555-0122,Critical\nVanguard Logistics,Logistics,https://vanguardlog.com,+1 555-0133,High`;

  const handleRunImport = () => {
    try {
      const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        setImportStatus('Error: CSV must have at least a header row and one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] || '';
        });

        if (importType === 'contacts') {
          if (row.firstname && row.lastname) {
            addContact({
              firstName: row.firstname,
              lastName: row.lastname,
              email: row.email || '',
              phone: row.phone || '',
              jobTitle: row.title || row.jobtitle || 'Team Member',
              type: 'lead',
              companyId: defaultCompany?.id || (companies[0]?.id || ''),
              ownerId: currentUser.id,
              description: 'Imported via CSV Data Wizard',
            });
            importedCount++;
          }
        } else {
          if (row.name) {
            addCompany({
              name: row.name,
              industry: row.industry || 'Technology',
              website: row.website || '',
              phone: row.phone || '',
              priority: (row.priority as any) || 'Medium',
              ownerId: currentUser.id,
              description: 'Imported via CSV Data Wizard',
            });
            importedCount++;
          }
        }
      }

      setImportStatus(`Success! Cleanly parsed and inserted ${importedCount} records into your CRM database.`);
      setCsvText('');
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  const handleExportCsv = (type: 'contacts' | 'companies' | 'deals') => {
    let csvData = '';
    let filename = '';

    if (type === 'contacts') {
      filename = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Type'];
      const rows = contacts.map((c) => [
        c.id,
        `"${c.firstName}"`,
        `"${c.lastName}"`,
        `"${c.email}"`,
        `"${c.phone || ''}"`,
        `"${c.jobTitle || ''}"`,
        `"${c.type}"`,
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'companies') {
      filename = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['ID', 'Name', 'Industry', 'Website', 'Phone', 'Priority'];
      const rows = companies.map((c) => [
        c.id,
        `"${c.name}"`,
        `"${c.industry}"`,
        `"${c.website || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.priority}"`,
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      filename = `deals_export_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['ID', 'Title', 'Value', 'Stage', 'Status', 'Expected Close'];
      const rows = deals.map((d) => [
        d.id,
        `"${d.title}"`,
        d.value,
        `"${d.stage}"`,
        `"${d.status}"`,
        `"${d.expectedCloseDate}"`,
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="import-export-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Management & CSV Migration</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              FR-18 CSV Import & Export
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bulk-import records from spreadsheet CSV files with automatic field mapping and download complete CRM data archives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Bulk Import */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <UploadCloud size={20} />
            <h3 className="font-bold text-sm text-slate-900">CSV Bulk Import Wizard</h3>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Target Entity</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportType('contacts');
                  setCsvText(sampleContactsCsv);
                }}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  importType === 'contacts'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Contacts / Leads
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('companies');
                  setCsvText(sampleCompaniesCsv);
                }}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  importType === 'companies'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Companies / Accounts
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700">Paste CSV Contents (or load sample)</label>
              <button
                type="button"
                onClick={() => setCsvText(importType === 'contacts' ? sampleContactsCsv : sampleCompaniesCsv)}
                className="text-[11px] text-indigo-600 hover:underline font-medium"
              >
                Insert Sample Data
              </button>
            </div>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="firstName,lastName,email,phone..."
              className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                importStatus.startsWith('Error')
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {importStatus.startsWith('Error') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{importStatus}</span>
            </div>
          )}

          <button
            onClick={handleRunImport}
            disabled={!csvText.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs transition-colors"
          >
            <span>Execute CSV Import</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Export Data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <DownloadCloud size={20} />
            <h3 className="font-bold text-sm text-slate-900">Export CRM Tables</h3>
          </div>

          <p className="text-slate-500 text-xs">
            Download current snapshots of your contacts, accounts, and deal pipelines formatted for standard Excel and CSV spreadsheets.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Contacts & Leads</span>
                <span className="text-slate-400 text-[11px]">{contacts.length} records available</span>
              </div>
              <button
                onClick={() => handleExportCsv('contacts')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-2xs"
              >
                Download CSV
              </button>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Companies & Accounts</span>
                <span className="text-slate-400 text-[11px]">{companies.length} records available</span>
              </div>
              <button
                onClick={() => handleExportCsv('companies')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-2xs"
              >
                Download CSV
              </button>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Deals & Opportunities</span>
                <span className="text-slate-400 text-[11px]">{deals.length} records available</span>
              </div>
              <button
                onClick={() => handleExportCsv('deals')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-2xs"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
