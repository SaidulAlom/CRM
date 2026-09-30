import React, { useState, useMemo } from 'react';
import { useCRM } from '../../../context/CRMContext';
import {
  DownloadCloud,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  Filter,
  Columns,
  Eye,
  ArrowRight,
  Database,
  Lock,
  Layers,
} from 'lucide-react';
import {
  ExportEntityType,
  ExportDestination,
  ExportDelimiterType,
  ExportEncapsulationType,
  ExportRowSeparatorType,
} from '../../../types';
import { EXPORT_ENTITY_CONFIGS } from './exportDefinitions';
import { StepSelectData } from './StepSelectData';
import { StepSelectFields } from './StepSelectFields';
import { StepApplyFilters, ExportFilterState } from './StepApplyFilters';
import { StepConfigureFormat } from './StepConfigureFormat';
import { StepExportPreview } from './StepExportPreview';
import { StepExportProcessing } from './StepExportProcessing';

interface ExportWizardViewProps {
  onNavigateToHistory: () => void;
}

export const ExportWizardView: React.FC<ExportWizardViewProps> = ({
  onNavigateToHistory,
}) => {
  const {
    companies,
    contacts,
    deals,
    cases,
    tasks,
    events,
    users,
    currentUser,
    addExportHistoryRecord,
    logAudit,
  } = useCRM();

  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Select Entity
  const [selectedEntity, setSelectedEntity] = useState<ExportEntityType>('contacts');

  // Step 2: Selected & Ordered Fields
  const entityConfig = EXPORT_ENTITY_CONFIGS[selectedEntity];

  const [orderedFieldKeys, setOrderedFieldKeys] = useState<string[]>(() =>
    entityConfig.fields.map((f) => f.key)
  );

  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(() =>
    entityConfig.fields.filter((f) => f.defaultSelected).map((f) => f.key)
  );

  // When selectedEntity changes, reset field ordering and defaults
  const handleSelectEntity = (newEntity: ExportEntityType) => {
    setSelectedEntity(newEntity);
    const cfg = EXPORT_ENTITY_CONFIGS[newEntity];
    setOrderedFieldKeys(cfg.fields.map((f) => f.key));
    setSelectedFieldKeys(cfg.fields.filter((f) => f.defaultSelected).map((f) => f.key));
    setFileName(`${cfg.defaultFileNamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Step 3: Filters State
  const [filters, setFilters] = useState<ExportFilterState>({
    dateRangePreset: 'all',
  });

  const handleResetFilters = () => {
    setFilters({ dateRangePreset: 'all' });
  };

  // Step 4: Output Format State
  const [destination, setDestination] = useState<ExportDestination>('download');
  const [delimiterType, setDelimiterType] = useState<ExportDelimiterType>('comma');
  const [customDelimiter, setCustomDelimiter] = useState(';');
  const [encapsulationType, setEncapsulationType] = useState<ExportEncapsulationType>('double');
  const [customEncapsulator, setCustomEncapsulator] = useState('"');
  const [rowSeparatorType, setRowSeparatorType] = useState<ExportRowSeparatorType>('crlf');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [fileName, setFileName] = useState(
    `${entityConfig.defaultFileNamePrefix}_${new Date().toISOString().split('T')[0]}.csv`
  );

  // Step 2 field toggling and reordering
  const handleToggleField = (key: string) => {
    if (selectedFieldKeys.includes(key)) {
      setSelectedFieldKeys((prev) => prev.filter((k) => k !== key));
    } else {
      setSelectedFieldKeys((prev) => [...prev, key]);
    }
  };

  const handleSelectAllFields = () => {
    setSelectedFieldKeys(entityConfig.fields.map((f) => f.key));
  };

  const handleResetDefaultFields = () => {
    setOrderedFieldKeys(entityConfig.fields.map((f) => f.key));
    setSelectedFieldKeys(entityConfig.fields.filter((f) => f.defaultSelected).map((f) => f.key));
  };

  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;
    const updated = [...orderedFieldKeys];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOrderedFieldKeys(updated);
  };

  const handleMoveFieldDown = (index: number) => {
    if (index === orderedFieldKeys.length - 1) return;
    const updated = [...orderedFieldKeys];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOrderedFieldKeys(updated);
  };

  // Active records by entity before filtering (with RBAC security applied)
  const isStandardUser = currentUser.role === 'standard';
  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // Combined records builder
  const combinedRecords = useMemo(() => {
    return contacts
      .filter((c) => !c.deletedAt)
      .map((c) => ({
        contact: c,
        company: companies.find((comp) => comp.id === c.companyId),
      }));
  }, [contacts, companies]);

  // Record counts for Step 1
  const entityCounts: Record<ExportEntityType, number> = {
    companies: companies.filter((c) => !c.deletedAt).length,
    contacts: contacts.filter((c) => !c.deletedAt).length,
    combined: combinedRecords.length,
    deals: deals.filter((d) => !d.deletedAt).length,
    cases: cases.filter((cs) => !cs.deletedAt).length,
    tasks: tasks.filter((t) => !t.deletedAt).length,
    events: events.length,
    all:
      companies.length +
      contacts.length +
      deals.length +
      cases.length +
      tasks.length +
      events.length,
  };

  // Raw base records according to chosen entity & RBAC
  const rawBaseRecords = useMemo(() => {
    let list: any[] = [];
    switch (selectedEntity) {
      case 'companies':
        list = companies.filter((c) => !c.deletedAt);
        break;
      case 'contacts':
        list = contacts.filter((c) => !c.deletedAt);
        break;
      case 'combined':
      case 'all':
        list = combinedRecords;
        break;
      case 'deals':
        list = deals.filter((d) => !d.deletedAt);
        break;
      case 'cases':
        list = cases.filter((cs) => !cs.deletedAt);
        break;
      case 'tasks':
        list = tasks.filter((t) => !t.deletedAt);
        break;
      case 'events':
        list = events;
        break;
    }

    // Role-based access control: If standard user, only records they own or participate in
    if (isStandardUser) {
      return list.filter((r) => {
        if (selectedEntity === 'combined') {
          return r.contact.ownerId === currentUser.id || r.company?.ownerId === currentUser.id;
        }
        if (r.ownerId) return r.ownerId === currentUser.id;
        if (r.assigneeId) return r.assigneeId === currentUser.id;
        if (r.participantIds) return r.participantIds.includes(currentUser.id);
        return true;
      });
    }

    return list;
  }, [
    selectedEntity,
    companies,
    contacts,
    combinedRecords,
    deals,
    cases,
    tasks,
    events,
    isStandardUser,
    currentUser.id,
  ]);

  // Apply Step 3 Filters to base records
  const filteredRecords = useMemo(() => {
    return rawBaseRecords.filter((record) => {
      // 1. Date Range
      if (filters.dateRangePreset !== 'all') {
        const rawDate =
          record.createdAt ||
          record.startDate ||
          record.deadline ||
          (record.contact && record.contact.createdAt);
        if (rawDate) {
          const itemDate = new Date(rawDate).getTime();
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;

          if (filters.dateRangePreset === 'today' && now - itemDate > oneDay) return false;
          if (filters.dateRangePreset === '7days' && now - itemDate > 7 * oneDay) return false;
          if (filters.dateRangePreset === '30days' && now - itemDate > 30 * oneDay) return false;
          if (filters.dateRangePreset === 'quarter' && now - itemDate > 90 * oneDay) return false;
          if (filters.dateRangePreset === 'year' && now - itemDate > 365 * oneDay) return false;

          if (filters.dateRangePreset === 'custom') {
            if (filters.customStartDate && itemDate < new Date(filters.customStartDate).getTime()) {
              return false;
            }
            if (filters.customEndDate && itemDate > new Date(filters.customEndDate).getTime() + oneDay) {
              return false;
            }
          }
        }
      }

      // 2. Owner filter
      if (filters.ownerId) {
        const itemOwner =
          record.ownerId ||
          record.assigneeId ||
          (record.contact && record.contact.ownerId) ||
          (record.company && record.company.ownerId);
        if (itemOwner !== filters.ownerId) return false;
      }

      // 3. Department filter
      if (filters.department) {
        const itemOwner =
          record.ownerId ||
          record.assigneeId ||
          (record.contact && record.contact.ownerId);
        const u = users.find((usr) => usr.id === itemOwner);
        if (!u || u.department !== filters.department) return false;
      }

      // 4. Company filter
      if (filters.companyId) {
        const cId = record.companyId || (record.company && record.company.id);
        if (cId !== filters.companyId) return false;
      }

      // 5. Contact Type
      if (filters.contactType) {
        const cType = record.type || (record.contact && record.contact.type);
        if (cType !== filters.contactType) return false;
      }

      // 6. Company Priority
      if (filters.companyPriority && record.priority !== filters.companyPriority) {
        return false;
      }

      // 7. Deal Status
      if (filters.dealStatus && record.status !== filters.dealStatus) {
        return false;
      }

      // 8. Case Status
      if (filters.caseStatus && record.status !== filters.caseStatus) {
        return false;
      }

      return true;
    });
  }, [rawBaseRecords, filters, users]);

  // Ordered list of selected field definitions
  const activeSelectedFieldDefs = useMemo(() => {
    return orderedFieldKeys
      .filter((k) => selectedFieldKeys.includes(k))
      .map((k) => entityConfig.fields.find((f) => f.key === k)!)
      .filter(Boolean);
  }, [orderedFieldKeys, selectedFieldKeys, entityConfig]);

  // Context for field accessors
  const accessorContext = { companies, contacts, users };

  // Summary of applied filters
  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.dateRangePreset !== 'all') {
      parts.push(`Date: ${filters.dateRangePreset}`);
    }
    if (filters.ownerId) {
      const u = users.find((usr) => usr.id === filters.ownerId);
      parts.push(`Owner: ${u ? u.name : filters.ownerId}`);
    }
    if (filters.department) {
      parts.push(`Dept: ${filters.department}`);
    }
    if (filters.contactType) {
      parts.push(`Type: ${filters.contactType}`);
    }
    if (filters.companyPriority) {
      parts.push(`Priority: ${filters.companyPriority}`);
    }
    if (filters.dealStatus) {
      parts.push(`Status: ${filters.dealStatus}`);
    }
    if (filters.caseStatus) {
      parts.push(`Case Status: ${filters.caseStatus}`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'None (All matching records)';
  }, [filters, users]);

  const handleResetAllWizard = () => {
    setCurrentStep(1);
    handleSelectEntity('contacts');
    setFilters({ dateRangePreset: 'all' });
  };

  const stepsList = [
    { number: 1, label: 'Select Data' },
    { number: 2, label: 'Select Fields' },
    { number: 3, label: 'Apply Filters' },
    { number: 4, label: 'Configure Format' },
    { number: 5, label: 'Preview' },
    { number: 6, label: 'Export' },
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Step Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {stepsList.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <React.Fragment key={s.number}>
                <div
                  onClick={() => {
                    if (s.number < currentStep) {
                      setCurrentStep(s.number);
                    }
                  }}
                  className={`flex items-center gap-2 select-none cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'text-indigo-600 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 font-semibold hover:text-emerald-800'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white font-bold ring-4 ring-indigo-100 shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-100 text-slate-400 font-semibold'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : s.number}
                  </div>
                  <span className="text-xs whitespace-nowrap">{s.label}</span>
                </div>

                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 min-w-[20px] transition-colors ${
                      currentStep > s.number ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Views */}
      {currentStep === 1 && (
        <StepSelectData
          selectedEntity={selectedEntity}
          onSelectEntity={handleSelectEntity}
          entityCounts={entityCounts}
          canExportAll={isAdmin || isManager}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <StepSelectFields
          availableFields={entityConfig.fields}
          orderedFieldKeys={orderedFieldKeys}
          selectedFieldKeys={selectedFieldKeys}
          onToggleField={handleToggleField}
          onSelectAll={handleSelectAllFields}
          onResetDefaults={handleResetDefaultFields}
          onMoveFieldUp={handleMoveFieldUp}
          onMoveFieldDown={handleMoveFieldDown}
          entityType={selectedEntity}
          isStandardUser={isStandardUser}
          onPrev={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <StepApplyFilters
          entityType={selectedEntity}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          users={users}
          companies={companies}
          estimatedCount={filteredRecords.length}
          totalAvailableCount={rawBaseRecords.length}
          onPrev={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 4 && (
        <StepConfigureFormat
          destination={destination}
          onDestinationChange={setDestination}
          delimiterType={delimiterType}
          onDelimiterChange={setDelimiterType}
          customDelimiter={customDelimiter}
          onCustomDelimiterChange={setCustomDelimiter}
          encapsulationType={encapsulationType}
          onEncapsulationChange={setEncapsulationType}
          customEncapsulator={customEncapsulator}
          onCustomEncapsulatorChange={setCustomEncapsulator}
          rowSeparatorType={rowSeparatorType}
          onRowSeparatorChange={setRowSeparatorType}
          includeHeaders={includeHeaders}
          onIncludeHeadersChange={setIncludeHeaders}
          fileName={fileName}
          onFileNameChange={setFileName}
          onPrev={() => setCurrentStep(3)}
          onNext={() => setCurrentStep(5)}
        />
      )}

      {currentStep === 5 && (
        <StepExportPreview
          entityType={selectedEntity}
          entityLabel={entityConfig.title}
          selectedFields={activeSelectedFieldDefs}
          filteredRecords={filteredRecords}
          totalRecordsCount={filteredRecords.length}
          destination={destination}
          delimiterType={delimiterType}
          customDelimiter={customDelimiter}
          encapsulationType={encapsulationType}
          customEncapsulator={customEncapsulator}
          rowSeparatorType={rowSeparatorType}
          includeHeaders={includeHeaders}
          filtersSummary={filtersSummary}
          fileName={fileName}
          context={accessorContext}
          onPrev={() => setCurrentStep(4)}
          onProceedToExport={() => setCurrentStep(6)}
        />
      )}

      {currentStep === 6 && (
        <StepExportProcessing
          entityType={selectedEntity}
          entityLabel={entityConfig.title}
          selectedFields={activeSelectedFieldDefs}
          filteredRecords={filteredRecords}
          destination={destination}
          delimiterType={delimiterType}
          customDelimiter={customDelimiter}
          encapsulationType={encapsulationType}
          customEncapsulator={customEncapsulator}
          rowSeparatorType={rowSeparatorType}
          includeHeaders={includeHeaders}
          filtersSummary={filtersSummary}
          fileName={fileName}
          context={accessorContext}
          onReset={handleResetAllWizard}
          onNavigateToHistory={onNavigateToHistory}
          onRecordHistory={addExportHistoryRecord}
          logAudit={logAudit}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
