import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { GitMerge, X, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Contact } from '../../types';

interface DuplicateMergeModalContentProps {
  contactA: Contact;
  contactB: Contact;
  closeDuplicateMerge: () => void;
  mergeContacts: (winnerId: string, loserId: string, mergedData: Partial<Contact>) => void;
  companies: any[];
}

const DuplicateMergeModalContent: React.FC<DuplicateMergeModalContentProps> = ({
  contactA,
  contactB,
  closeDuplicateMerge,
  mergeContacts,
  companies,
}) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, 'A' | 'B'>>({
    firstName: 'A',
    lastName: 'A',
    email: 'A',
    phone: contactA.phone ? 'A' : 'B',
    jobTitle: contactA.jobTitle ? 'A' : 'B',
    companyId: contactA.companyId ? 'A' : 'B',
    type: 'A',
    description: 'A',
  });

  const getCompany = (id?: string) => companies.find((c) => c.id === id)?.name || 'None';

  const handleMerge = () => {
    const merged: Partial<Contact> = {
      firstName: selectedFields.firstName === 'A' ? contactA.firstName : contactB.firstName,
      lastName: selectedFields.lastName === 'A' ? contactA.lastName : contactB.lastName,
      email: selectedFields.email === 'A' ? contactA.email : contactB.email,
      phone: selectedFields.phone === 'A' ? contactA.phone : contactB.phone,
      jobTitle: selectedFields.jobTitle === 'A' ? contactA.jobTitle : contactB.jobTitle,
      companyId: selectedFields.companyId === 'A' ? contactA.companyId : contactB.companyId,
      type: selectedFields.type === 'A' ? contactA.type : contactB.type,
      description: `${contactA.description || ''} \n${contactB.description || ''}`.trim(),
    };

    // Winner is Contact A, Loser is Contact B (soft deleted & related items linked to A)
    mergeContacts(contactA.id, contactB.id, merged);
  };

  const fields = [
    { key: 'firstName', label: 'First Name', valA: contactA.firstName, valB: contactB.firstName },
    { key: 'lastName', label: 'Last Name', valA: contactA.lastName, valB: contactB.lastName },
    { key: 'email', label: 'Email', valA: contactA.email, valB: contactB.email },
    { key: 'phone', label: 'Phone', valA: contactA.phone || '—', valB: contactB.phone || '—' },
    { key: 'jobTitle', label: 'Job Title', valA: contactA.jobTitle || '—', valB: contactB.jobTitle || '—' },
    { key: 'companyId', label: 'Company', valA: getCompany(contactA.companyId), valB: getCompany(contactB.companyId) },
    { key: 'type', label: 'Contact Type', valA: contactA.type, valB: contactB.type },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50 duration-150">
      <div
        id="duplicate-merge-dialog"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={20} className="shrink-0" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Potential Duplicate Contact Detected (FR-4.4)</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Matched on email ({contactA.email}) or full name & company. Select values to preserve.
              </p>
            </div>
          </div>
          <button onClick={closeDuplicateMerge} className="p-1 hover:bg-amber-600 rounded text-white">
            <X size={18} />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
            <div>Field</div>
            <div>New Entry (Record A)</div>
            <div>Existing Contact (Record B)</div>
          </div>

          <div className="space-y-2">
            {fields.map((f) => {
              const pickA = selectedFields[f.key] === 'A';
              return (
                <div key={f.key} className="grid grid-cols-3 gap-3 items-center py-1.5 border-b border-slate-100">
                  <div className="font-medium text-slate-700">{f.label}</div>
                  <div
                    onClick={() => setSelectedFields((prev) => ({ ...prev, [f.key]: 'A' }))}
                    className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                      pickA ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="truncate">{f.valA}</span>
                    {pickA && <Check size={14} className="text-indigo-600 shrink-0" />}
                  </div>
                  <div
                    onClick={() => setSelectedFields((prev) => ({ ...prev, [f.key]: 'B' }))}
                    className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                      !pickA ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="truncate">{f.valB}</span>
                    {!pickA && <Check size={14} className="text-indigo-600 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Merge behavior:</span> Open deals, tasks, calls, and meeting events from both records will be unified under the merged contact. The duplicate record will be archived.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={closeDuplicateMerge}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
          >
            Keep Both (Cancel Merge)
          </button>
          <button
            id="confirm-merge-btn"
            onClick={handleMerge}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <GitMerge size={14} />
            <span>Merge Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const DuplicateMergeModal: React.FC = () => {
  const { duplicateMergeModal, closeDuplicateMerge, mergeContacts, companies } = useCRM();

  if (!duplicateMergeModal) return null;

  return (
    <DuplicateMergeModalContent
      contactA={duplicateMergeModal.contactA}
      contactB={duplicateMergeModal.contactB}
      closeDuplicateMerge={closeDuplicateMerge}
      mergeContacts={mergeContacts}
      companies={companies}
    />
  );
};
