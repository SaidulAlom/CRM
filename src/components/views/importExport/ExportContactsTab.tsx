import React, { useState } from 'react';
import {
  DownloadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  FileDown,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { DelimiterType } from '../../../types';
import { CRM_CONTACT_FIELDS } from './migrationPresets';
import { getDelimiterCharacter } from './importUtils';

export const ExportContactsTab: React.FC = () => {
  const { contacts, companies, currentUser, addExportHistoryRecord, logAudit } = useCRM();

  const [exportFormat, setExportFormat] = useState<'csv' | 'tab' | 'custom'>('csv');
  const [customDelimiter, setCustomDelimiter] = useState(';');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'firstName',
    'lastName',
    'email',
    'phone',
    'mobile',
    'jobTitle',
    'company',
    'type',
    'mailingAddress',
  ]);

  const [filterType, setFilterType] = useState<'all' | 'lead' | 'customer' | 'vendor'>('all');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Filter records
  const targetContacts = contacts.filter((c) => {
    if (c.deletedAt) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });

  const handleToggleField = (fieldKey: string) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields((prev) => prev.filter((k) => k !== fieldKey));
    } else {
      setSelectedFields((prev) => [...prev, fieldKey]);
    }
  };

  const handleSelectAllFields = () => {
    setSelectedFields(CRM_CONTACT_FIELDS.map((f) => f.key));
  };

  const handleDeselectAllFields = () => {
    setSelectedFields(['firstName', 'lastName']); // keep minimal identifiers
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export.');
      return;
    }

    const delimiterChar =
      exportFormat === 'csv' ? ',' : exportFormat === 'tab' ? '\t' : customDelimiter || ',';

    const lines: string[] = [];

    // Header row
    if (includeHeaders) {
      const headerRow = selectedFields.map((fKey) => {
        const fieldDef = CRM_CONTACT_FIELDS.find((f) => f.key === fKey);
        const label = fieldDef?.label || fKey;
        // Escape quotes
        return `"${label.replace(/"/g, '""')}"`;
      });
      lines.push(headerRow.join(delimiterChar));
    }

    // Data rows
    targetContacts.forEach((contact) => {
      const company = companies.find((cp) => cp.id === contact.companyId);
      const row = selectedFields.map((fKey) => {
        let val = '';
        if (fKey === 'company') {
          val = company?.name || '';
        } else {
          val = (contact as any)[fKey] || '';
        }

        // Clean and quote
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      lines.push(row.join(delimiterChar));
    });

    const fileContent = lines.join('\n');
    const ext = exportFormat === 'csv' ? 'csv' : exportFormat === 'tab' ? 'tsv' : 'txt';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `crm_contacts_export_${dateStr}.${ext}`;

    const mime =
      exportFormat === 'csv'
        ? 'text/csv;charset=utf-8;'
        : 'text/plain;charset=utf-8;';

    const blob = new Blob([fileContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record export in history
    addExportHistoryRecord({
      entity: 'contacts',
      entityLabel: 'Contacts',
      filename,
      format: exportFormat,
      destination: 'download',
      delimiter: delimiterChar,
      encapsulation: 'double',
      rowSeparator: 'crlf',
      selectedFields,
      includeHeaders,
      recordsCount: targetContacts.length,
      exportedBy: currentUser.id,
      exportedByName: `${currentUser.name} (${currentUser.role})`,
      status: 'Completed',
      appliedFiltersSummary: `Filter: ${filterType}`,
    });

    logAudit(
      'CONTACTS_EXPORTED',
      `Exported ${targetContacts.length} contacts as ${filename} by ${currentUser.name}`
    );

    setExportSuccessMessage(
      `Successfully generated and downloaded ${filename} with ${targetContacts.length} contact records.`
    );
    setTimeout(() => setExportSuccessMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <DownloadCloud size={20} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Export CRM Contacts & Directory
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Generate structured CSV, Tab-delimited, or custom exports with selective field mapping,
          relationship filters, and audit trail logging.
        </p>
      </div>

      {exportSuccessMessage && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Format & Filter Controls */}
        <div className="space-y-5">
          {/* File Format */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider block">
              1. File Format & Delimiter
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'csv', label: 'CSV (Comma)', desc: '.csv' },
                { id: 'tab', label: 'Tab Delimited', desc: '.tsv' },
                { id: 'custom', label: 'Custom Delimiter', desc: '.txt' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    exportFormat === fmt.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{fmt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</div>
                </button>
              ))}
            </div>

            {exportFormat === 'custom' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Delimiter Character
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  placeholder="e.g. ; or |"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-slate-700 font-semibold cursor-pointer flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Include field names as first row header</span>
              </label>
            </div>
          </div>

          {/* Record Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
            <label className="font-bold text-slate-900 uppercase tracking-wider block">
              2. Filter Records
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Contacts', count: contacts.length },
                { id: 'lead', label: 'Leads Only', count: contacts.filter((c) => c.type === 'lead').length },
                { id: 'customer', label: 'Customers Only', count: contacts.filter((c) => c.type === 'customer').length },
                { id: 'vendor', label: 'Vendors Only', count: contacts.filter((c) => c.type === 'vendor').length },
              ].map((flt) => (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => setFilterType(flt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    filterType === flt.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{flt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{flt.count} records</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
              Ready to export: <strong className="text-slate-900">{targetContacts.length}</strong> matching contacts.
            </div>
          </div>

          {/* Export Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-700">
              <ShieldCheck size={16} />
              <span className="font-bold">Role-Based Data Export</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Your user credentials ({currentUser.name} · {currentUser.role}) will be permanently recorded in the export audit log.
            </p>

            <button
              type="button"
              onClick={handleExport}
              disabled={targetContacts.length === 0 || selectedFields.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              <FileDown size={16} />
              <span>Download Export File ({targetContacts.length} Rows)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Field Selection */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                3. Select Fields to Include in Export
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Choose the specific columns you wish to include in the exported spreadsheet.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFields}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAllFields}
                className="text-xs font-semibold text-slate-500 hover:underline"
              >
                Reset to Core
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CRM_CONTACT_FIELDS.map((field) => {
              const isSelected = selectedFields.includes(field.key);
              return (
                <div
                  key={field.key}
                  onClick={() => handleToggleField(field.key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'border-indigo-300 bg-indigo-50/40 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleField(field.key)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{field.label}</span>
                      {field.required && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                          Key
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {field.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
            <span>
              <strong className="text-slate-900">{selectedFields.length}</strong> of{' '}
              {CRM_CONTACT_FIELDS.length} fields selected
            </span>
            <span>
              Estimated output size: ~{(targetContacts.length * selectedFields.length * 20 / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
