import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Search,
  X,
  Building2,
  Users,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  FileText,
  PhoneCall,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    companies,
    contacts,
    deals,
    tasks,
    cases,
    documents,
    openRecordDetail,
    setActiveNav,
  } = useCRM();

  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmed) {
      return {
        companies: [],
        contacts: [],
        deals: [],
        tasks: [],
        cases: [],
        documents: [],
      };
    }

    return {
      companies: companies
        .filter((c) => !c.deletedAt && (c.name.toLowerCase().includes(trimmed) || c.industry?.toLowerCase().includes(trimmed)))
        .slice(0, 4),
      contacts: contacts
        .filter(
          (c) =>
            !c.deletedAt &&
            (`${c.firstName} ${c.lastName}`.toLowerCase().includes(trimmed) ||
              c.email.toLowerCase().includes(trimmed) ||
              c.jobTitle?.toLowerCase().includes(trimmed))
        )
        .slice(0, 4),
      deals: deals
        .filter((d) => !d.deletedAt && (d.title.toLowerCase().includes(trimmed) || d.product?.toLowerCase().includes(trimmed)))
        .slice(0, 4),
      tasks: tasks
        .filter((t) => !t.deletedAt && t.title.toLowerCase().includes(trimmed))
        .slice(0, 4),
      cases: cases
        .filter((c) => !c.deletedAt && (c.title.toLowerCase().includes(trimmed) || c.problemName?.toLowerCase().includes(trimmed)))
        .slice(0, 4),
      documents: documents
        .filter((d) => d.title.toLowerCase().includes(trimmed) || d.fileName?.toLowerCase().includes(trimmed))
        .slice(0, 4),
    };
  }, [trimmed, companies, contacts, deals, tasks, cases, documents]);

  const totalCount =
    results.companies.length +
    results.contacts.length +
    results.deals.length +
    results.tasks.length +
    results.cases.length +
    results.documents.length;

  if (!globalSearchOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-16 px-4 z-50 animate-in fade-in-50 duration-100">
      <div
        id="global-search-dialog"
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all records (e.g. CloudScale, Marcus, BAA, Telematics)..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded font-medium"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!trimmed ? (
            <div className="py-8 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Global CRM Search</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Instant search across companies, contacts, deals, tasks, cases, and documents.
              </p>
            </div>
          ) : totalCount === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">No matching records found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for a company name, contact, or deal title.</p>
            </div>
          ) : (
            <>
              {/* Companies */}
              {results.companies.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 size={13} className="text-blue-500" />
                    <span>Companies ({results.companies.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.companies.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          openRecordDetail('company', c.id);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.industry} · {c.phone || c.website || 'No phone'}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {results.contacts.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users size={13} className="text-emerald-500" />
                    <span>Contacts ({results.contacts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.contacts.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          openRecordDetail('contact', c.id);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.jobTitle || 'Contact'} · {c.email}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deals */}
              {results.deals.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-indigo-500" />
                    <span>Deals ({results.deals.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.deals.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveNav('deals');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {d.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ${d.value.toLocaleString()} · Stage: {d.stage} · {d.product}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckSquare size={13} className="text-amber-500" />
                    <span>Tasks ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveNav('tasks');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Deadline: {t.deadline} · {t.completionPercentage}% complete · Status: {t.status}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases */}
              {results.cases.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <LifeBuoy size={13} className="text-rose-500" />
                    <span>Support Cases ({results.cases.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveNav('cases');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Status: {c.status} · Priority: {c.priority}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-500" />
                    <span>Documents ({results.documents.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.documents.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveNav('documents');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                            {d.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            v{d.version} · {d.fileName}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
