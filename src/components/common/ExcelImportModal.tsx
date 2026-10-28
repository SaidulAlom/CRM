import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  ArrowRight,
  ArrowLeft,
  Filter,
  Check,
  ShieldCheck,
  Building2,
  Users,
  Copy,
  Plus,
  Trash2,
  FileDown,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Contact, Company } from '../../types';
import {
  parseExcelOrDelimitedFile,
  exportToExcel,
  exportImportErrorReport,
  ParsedExcelSheet,
} from '../../utils/excelUtils';
import { firestoreService } from '../../firebase/firestoreService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetModule?: 'contact' | 'company';
  initialMode?: 'file' | 'manual';
  onImportComplete?: (summary: { imported: number; updated: number; skipped: number }) => void;
}

export interface ManualContactFormItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  companyName: string;
  jobTitle: string;
  type: 'lead' | 'customer' | 'vendor' | 'other';
  mailingAddress: string;
  notes: string;
  validationError?: string;
}

const createNewManualContact = (): ManualContactFormItem => ({
  id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mobile: '',
  companyName: '',
  jobTitle: '',
  type: 'lead',
  mailingAddress: '',
  notes: '',
});

interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
}

const CONTACT_TARGET_FIELDS: TargetFieldDef[] = [
  { key: 'firstName', label: 'First Name', required: true, aliases: ['first name', 'firstname', 'fname', 'given name', 'first'] },
  { key: 'lastName', label: 'Last Name', required: true, aliases: ['last name', 'lastname', 'lname', 'surname', 'family name', 'last'] },
  { key: 'email', label: 'Email Address', required: true, aliases: ['email', 'email address', 'e-mail', 'mail', 'work email'] },
  { key: 'phone', label: 'Phone', required: false, aliases: ['phone', 'telephone', 'phone number', 'tel', 'work phone', 'office phone'] },
  { key: 'mobile', label: 'Mobile Phone', required: false, aliases: ['mobile', 'cell', 'cell phone', 'cellular', 'mobile phone'] },
  { key: 'companyName', label: 'Company / Account', required: false, aliases: ['company', 'company name', 'account', 'organization', 'organisation', 'business'] },
  { key: 'jobTitle', label: 'Job Title / Position', required: false, aliases: ['job title', 'title', 'position', 'role', 'designation'] },
  { key: 'department', label: 'Department', required: false, aliases: ['department', 'dept', 'division', 'unit'] },
  { key: 'type', label: 'Contact Type (Lead / Customer / Partner)', required: false, aliases: ['type', 'contact type', 'category', 'status', 'stage'] },
  { key: 'mailingAddress', label: 'Street Address', required: false, aliases: ['address', 'street', 'mailing address', 'street address'] },
  { key: 'city', label: 'City', required: false, aliases: ['city', 'town', 'municipality'] },
  { key: 'state', label: 'State / Province', required: false, aliases: ['state', 'province', 'region'] },
  { key: 'zip', label: 'Zip / Postal Code', required: false, aliases: ['zip', 'zip code', 'postal code', 'postcode'] },
  { key: 'country', label: 'Country', required: false, aliases: ['country', 'nation'] },
  { key: 'notes', label: 'Notes / Description', required: false, aliases: ['notes', 'comments', 'description', 'memo', 'note'] },
];

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  sampleValue: string;
}

export interface ValidatedRow {
  rowNumber: number;
  originalValues: Record<string, string>;
  mappedData: Record<string, string>;
  status: 'valid' | 'warning' | 'error';
  isDuplicate: boolean;
  duplicateContactId?: string;
  duplicateContactName?: string;
  action: 'insert' | 'update' | 'skip';
  errors: string[];
  warnings: string[];
  selected: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  targetModule = 'contact',
  initialMode = 'file',
  onImportComplete,
}) => {
  const {
    contacts,
    companies,
    currentUser,
    addContact,
    updateContact,
    addCompany,
    addImportHistoryRecord,
    logAudit,
  } = useCRM();

  // Wizard Step: 1 = File/Manual, 2 = Mapping & Duplicate Rules, 3 = Preview & Validate, 4 = Processing/Results
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Input Mode: 'file' or 'manual'
  const [inputMode, setInputMode] = useState<'file' | 'manual'>(initialMode);

  // Manual Contact Form State (Structured entries without uploading any file)
  const [manualContacts, setManualContacts] = useState<ManualContactFormItem[]>([
    createNewManualContact(),
  ]);
  const [manualEntryTab, setManualEntryTab] = useState<'form' | 'paste'>('form');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Manual Paste State
  const [manualText, setManualText] = useState('');

  // Parsed Raw Matrix
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);

  // Step 2: Mapping & Rules
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [duplicateMatchRule, setDuplicateMatchRule] = useState<'email' | 'phone' | 'name_and_company'>('email');
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'insert'>('skip');

  // Step 3: Filter & Rows
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [rowOverrides, setRowOverrides] = useState<Record<number, { action?: 'insert' | 'update' | 'skip'; selected?: boolean }>>({});

  // Step 4: Import execution & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
    errorsList: { rowNumber: number; originalData: Record<string, any>; errors: string[] }[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && initialMode) {
      setInputMode(initialMode);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setUploadedFile(null);
      setManualText('');
      setHeaders([]);
      setRawRows([]);
      setMappings([]);
      setRowOverrides({});
      setImportSummary(null);
      setFileError(null);
      setManualContacts([createNewManualContact()]);
      setManualEntryTab('form');
    }
  }, [isOpen]);

  // Add a single new contact row to manual form
  const handleAddManualContact = () => {
    setManualContacts((prev) => [...prev, createNewManualContact()]);
  };

  // Add 3 rows at once
  const handleAddMultipleManualContacts = (count: number) => {
    const additions = Array.from({ length: count }, () => createNewManualContact());
    setManualContacts((prev) => [...prev, ...additions]);
  };

  // Remove a row from manual form
  const handleRemoveManualContact = (id: string) => {
    if (manualContacts.length <= 1) {
      setManualContacts([createNewManualContact()]);
      return;
    }
    setManualContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Update specific field in a manual contact row
  const handleUpdateManualContact = (
    id: string,
    field: keyof ManualContactFormItem,
    value: string
  ) => {
    setManualContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (updated.validationError && field === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          updated.validationError = undefined;
        } else if (updated.validationError && (field === 'firstName' || field === 'lastName') && value.trim()) {
          updated.validationError = undefined;
        }
        return updated;
      })
    );
  };

  // Clear all manual form rows
  const handleClearManualContacts = () => {
    setManualContacts([createNewManualContact()]);
    setFileError(null);
  };

  // Pre-populate sample contacts in manual form
  const handleLoadSampleManualContacts = () => {
    setManualContacts([
      {
        id: `sample_1_${Date.now()}`,
        firstName: 'Marcus',
        lastName: 'Aurelius',
        email: 'marcus.aurelius@stoicadvisory.com',
        phone: '+1 (555) 234-5678',
        mobile: '+1 (555) 987-6543',
        companyName: 'Stoic Advisory',
        jobTitle: 'Senior Managing Director',
        type: 'customer',
        mailingAddress: '100 Market St, Suite 400, San Francisco, CA',
        notes: 'Executive sponsor for enterprise digital expansion',
      },
      {
        id: `sample_2_${Date.now()}`,
        firstName: 'Helena',
        lastName: 'Vance',
        email: 'helena.vance@solarenergy.org',
        phone: '+1 (555) 876-5432',
        mobile: '+1 (555) 123-9876',
        companyName: 'Solaris CleanTech',
        jobTitle: 'VP of Engineering',
        type: 'lead',
        mailingAddress: '500 Technology Square, Cambridge, MA',
        notes: 'Requested product overview and security evaluation',
      },
      {
        id: `sample_3_${Date.now()}`,
        firstName: 'David',
        lastName: 'Ross',
        email: 'david.ross@summitridge.com',
        phone: '+1 (555) 432-1098',
        mobile: '+1 (555) 345-6789',
        companyName: 'Summit Ridge Corp',
        jobTitle: 'Head of Operations',
        type: 'customer',
        mailingAddress: '200 W Madison St, Chicago, IL',
        notes: 'Key client assessing team-wide seat expansion',
      },
    ]);
    setFileError(null);
  };

  // Validate & submit manual contacts directly without any file
  const handleSubmitManualForm = () => {
    setFileError(null);

    const nonBlankRows = manualContacts.filter(
      (c) =>
        c.firstName.trim() ||
        c.lastName.trim() ||
        c.email.trim() ||
        c.phone.trim() ||
        c.companyName.trim()
    );

    if (nonBlankRows.length === 0) {
      setFileError('Please fill in at least one contact in the form before proceeding.');
      return;
    }

    let hasErrors = false;
    const validatedList = manualContacts.map((c) => {
      const isRowBlank =
        !c.firstName.trim() &&
        !c.lastName.trim() &&
        !c.email.trim() &&
        !c.phone.trim() &&
        !c.companyName.trim();

      if (isRowBlank) return c;

      const errors: string[] = [];
      if (!c.firstName.trim()) errors.push('First Name required');
      if (!c.lastName.trim()) errors.push('Last Name required');
      if (!c.email.trim()) {
        errors.push('Email required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
        errors.push('Invalid email address format');
      }

      if (errors.length > 0) {
        hasErrors = true;
        return { ...c, validationError: errors.join(', ') };
      }
      return { ...c, validationError: undefined };
    });

    setManualContacts(validatedList);

    if (hasErrors) {
      setFileError('Please correct the highlighted required fields (First Name, Last Name, and a valid Email Address) in the form.');
      return;
    }

    const validRowsToImport = validatedList.filter(
      (c) => c.firstName.trim() && c.lastName.trim() && c.email.trim()
    );

    const standardHeaders = [
      'First Name',
      'Last Name',
      'Email Address',
      'Phone Number',
      'Mobile Number',
      'Company Name',
      'Job Title',
      'Contact Type',
      'Street Address',
      'Notes / Description',
    ];

    const matrixRows = validRowsToImport.map((c) => [
      c.firstName.trim(),
      c.lastName.trim(),
      c.email.trim(),
      c.phone.trim(),
      c.mobile.trim(),
      c.companyName.trim(),
      c.jobTitle.trim(),
      c.type,
      c.mailingAddress.trim(),
      c.notes.trim(),
    ]);

    setHeaders(standardHeaders);
    setRawRows(matrixRows);
    setMappings([
      { sourceColumn: 'First Name', targetField: 'firstName', sampleValue: validRowsToImport[0].firstName },
      { sourceColumn: 'Last Name', targetField: 'lastName', sampleValue: validRowsToImport[0].lastName },
      { sourceColumn: 'Email Address', targetField: 'email', sampleValue: validRowsToImport[0].email },
      { sourceColumn: 'Phone Number', targetField: 'phone', sampleValue: validRowsToImport[0].phone },
      { sourceColumn: 'Mobile Number', targetField: 'mobile', sampleValue: validRowsToImport[0].mobile },
      { sourceColumn: 'Company Name', targetField: 'companyName', sampleValue: validRowsToImport[0].companyName },
      { sourceColumn: 'Job Title', targetField: 'jobTitle', sampleValue: validRowsToImport[0].jobTitle },
      { sourceColumn: 'Contact Type', targetField: 'type', sampleValue: validRowsToImport[0].type },
      { sourceColumn: 'Street Address', targetField: 'mailingAddress', sampleValue: validRowsToImport[0].mailingAddress },
      { sourceColumn: 'Notes / Description', targetField: 'notes', sampleValue: validRowsToImport[0].notes },
    ]);

    // Advance directly to Step 3 (Review, Duplicate Rules & Validation)
    setCurrentStep(3);
  };

  // Auto-build mapping heuristics
  const generateInitialMapping = (detectedHeaders: string[], sampleRow: string[] = []) => {
    const usedTargets = new Set<string>();

    return detectedHeaders.map((header, idx) => {
      const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      let bestField: TargetFieldDef | undefined;

      // Exact or alias match
      for (const field of CONTACT_TARGET_FIELDS) {
        if (usedTargets.has(field.key)) continue;
        if (
          field.aliases.some(
            (alias) => alias === cleanHeader || alias.replace(/ /g, '') === cleanHeader.replace(/ /g, '')
          )
        ) {
          bestField = field;
          break;
        }
      }

      // Substring match fallback
      if (!bestField) {
        for (const field of CONTACT_TARGET_FIELDS) {
          if (usedTargets.has(field.key)) continue;
          if (field.aliases.some((alias) => cleanHeader.includes(alias))) {
            bestField = field;
            break;
          }
        }
      }

      if (bestField) {
        usedTargets.add(bestField.key);
      }

      return {
        sourceColumn: header,
        targetField: bestField ? bestField.key : '__ignore__',
        sampleValue: sampleRow[idx] || '',
      };
    });
  };

  // Handle Excel or Delimited File upload
  const handleFileUpload = async (file: File) => {
    setFileError(null);
    setUploadedFile(file);

    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      setFileError('The file size exceeds the 20MB limit.');
      return;
    }

    try {
      const parsed = await parseExcelOrDelimitedFile(file);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setFileError('The selected worksheet contains no data rows.');
        return;
      }

      setAvailableSheets(parsed.sheetNames);
      setSelectedSheet(parsed.activeSheet);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);

      const initialMap = generateInitialMapping(parsed.headers, parsed.rows[0] || []);
      setMappings(initialMap);
    } catch (err: any) {
      setFileError(err.message || 'Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
    }
  };

  // Handle Sheet Change
  const handleSheetChange = async (sheetName: string) => {
    if (!uploadedFile) return;
    try {
      setSelectedSheet(sheetName);
      const parsed = await parseExcelOrDelimitedFile(uploadedFile, sheetName);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setMappings(generateInitialMapping(parsed.headers, parsed.rows[0] || []));
    } catch (err: any) {
      setFileError(err.message || 'Failed to load selected worksheet.');
    }
  };

  // Handle Manual Paste / Text Entry
  const handleParseManualText = () => {
    if (!manualText.trim()) {
      setFileError('Please paste spreadsheet data into the manual entry box.');
      return;
    }
    setFileError(null);

    // Determine delimiter (tabs from Excel/Sheets or commas)
    const lines = manualText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setFileError('Manual import requires at least 1 header line and 1 data row.');
      return;
    }

    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const delim = isTab ? '\t' : ',';

    const detectedHeaders = firstLine.split(delim).map((h, i) => h.trim() || `Column ${i + 1}`);
    const dataRows = lines.slice(1).map((line) => {
      return line.split(delim).map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
    });

    setHeaders(detectedHeaders);
    setRawRows(dataRows);
    setMappings(generateInitialMapping(detectedHeaders, dataRows[0] || []));
    setCurrentStep(2);
  };

  // Load Sample Demo Data
  const handleLoadDemoData = () => {
    const demo = [
      'First Name\tLast Name\tEmail\tPhone\tCompany\tJob Title\tDepartment\tType\tCity\tNotes',
      'Marcus\tAurelius\tmarcus.aurelius@stoicadvisory.com\t+1 (555) 234-5678\tStoic Advisory\tSenior Director\tExecutive\tcustomer\tRome\tMet at Annual Global Summit',
      'Helena\tVance\thelena.vance@solarenergy.org\t+1 (555) 876-5432\tSolaris CleanTech\tVP Engineering\tR&D\tlead\tSan Francisco\tInterested in enterprise license',
      'David\tRoss\tdavid.ross@summitridge.com\t+1 (555) 432-1098\tSummit Ridge Corp\tOperations Head\tOperations\tcustomer\tChicago\tExisting client relationship',
      'Elena\tRostova\telena.rostova@quantumscale.io\t+1 (555) 345-6789\tQuantumScale\tLead Architect\tProduct\tlead\tAustin\tNeeds security evaluation document',
      'Invalid\tPerson\tinvalid-email-format\t12345\tNo Email Corp\tTester\tQA\tlead\tNew York\tDemonstrating validation error handling',
    ].join('\n');

    setManualText(demo);
    setInputMode('manual');
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    exportToExcel({
      filename: 'CRM_Contacts_Import_Template.xlsx',
      sheetName: 'Contacts_Template',
      records: [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@acme-corp.com',
          phone: '+1 (555) 123-4567',
          mobile: '+1 (555) 987-6543',
          companyName: 'Acme Corporation',
          jobTitle: 'VP of Business Development',
          department: 'Sales',
          type: 'lead',
          mailingAddress: '100 Market St, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          notes: 'Met at Enterprise Tech Expo 2026',
        },
        {
          firstName: 'Alexander',
          lastName: 'Wright',
          email: 'alex.wright@hyperion.io',
          phone: '+1 (555) 234-5678',
          mobile: '+1 (555) 876-5432',
          companyName: 'Hyperion Innovations',
          jobTitle: 'Chief Technology Officer',
          department: 'Engineering',
          type: 'customer',
          mailingAddress: '500 Technology Square',
          city: 'Cambridge',
          state: 'MA',
          zip: '02139',
          country: 'USA',
          notes: 'Key decision maker for enterprise infrastructure',
        },
      ],
      columns: [
        { header: 'First Name', key: 'firstName', width: 16 },
        { header: 'Last Name', key: 'lastName', width: 16 },
        { header: 'Email Address', key: 'email', width: 28 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Mobile Number', key: 'mobile', width: 18 },
        { header: 'Company Name', key: 'companyName', width: 24 },
        { header: 'Job Title', key: 'jobTitle', width: 24 },
        { header: 'Department', key: 'department', width: 16 },
        { header: 'Contact Type', key: 'type', width: 14 },
        { header: 'Street Address', key: 'mailingAddress', width: 28 },
        { header: 'City', key: 'city', width: 16 },
        { header: 'State', key: 'state', width: 12 },
        { header: 'Zip Code', key: 'zip', width: 12 },
        { header: 'Country', key: 'country', width: 14 },
        { header: 'Notes', key: 'notes', width: 32 },
      ],
    });
  };

  // Evaluate & Validate Rows for Step 3
  const validatedRows: ValidatedRow[] = useMemo(() => {
    if (rawRows.length === 0 || mappings.length === 0) return [];

    const fieldMapIndex: Record<string, number> = {};
    mappings.forEach((m, idx) => {
      if (m.targetField && m.targetField !== '__ignore__') {
        fieldMapIndex[m.targetField] = idx;
      }
    });

    return rawRows.map((row, rowIdx) => {
      const rowNum = rowIdx + 2; // +1 for 0-index, +1 for header
      const originalValues: Record<string, string> = {};
      headers.forEach((h, idx) => {
        originalValues[h] = row[idx] || '';
      });

      const mappedData: Record<string, string> = {};
      Object.entries(fieldMapIndex).forEach(([fieldKey, colIdx]) => {
        mappedData[fieldKey] = (row[colIdx] || '').trim();
      });

      const errors: string[] = [];
      const warnings: string[] = [];

      // Required validation
      if (!mappedData.firstName) errors.push('Missing First Name');
      if (!mappedData.lastName) errors.push('Missing Last Name');
      if (!mappedData.email) {
        errors.push('Missing Email Address');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mappedData.email)) {
        errors.push(`Invalid email format: "${mappedData.email}"`);
      }

      // Duplicate match detection against existing CRM contacts
      let duplicateContact: Contact | undefined;
      const cleanEmail = (mappedData.email || '').toLowerCase();
      const cleanPhone = (mappedData.phone || mappedData.mobile || '').replace(/[^0-9]/g, '');
      const cleanName = `${mappedData.firstName || ''} ${mappedData.lastName || ''}`.trim().toLowerCase();

      if (duplicateMatchRule === 'email' && cleanEmail) {
        duplicateContact = contacts.find((c) => !c.deletedAt && c.email.toLowerCase() === cleanEmail);
      } else if (duplicateMatchRule === 'phone' && cleanPhone) {
        duplicateContact = contacts.find((c) => {
          if (c.deletedAt) return false;
          const cp = (c.phone || c.mobile || '').replace(/[^0-9]/g, '');
          return cp && (cp === cleanPhone || (cp.length > 7 && cleanPhone.endsWith(cp)));
        });
      } else if (duplicateMatchRule === 'name_and_company') {
        duplicateContact = contacts.find((c) => {
          if (c.deletedAt) return false;
          const cName = `${c.firstName} ${c.lastName}`.trim().toLowerCase();
          if (cName !== cleanName) return false;
          const comp = companies.find((cp) => cp.id === c.companyId);
          return comp && comp.name.toLowerCase() === (mappedData.companyName || '').toLowerCase();
        });
      }

      const isDuplicate = !!duplicateContact;
      if (duplicateContact) {
        warnings.push(`Matches existing contact: ${duplicateContact.firstName} ${duplicateContact.lastName} (${duplicateContact.email})`);
      }

      // Default action based on duplicate setting and validation
      let action: 'insert' | 'update' | 'skip' = 'insert';
      if (errors.length > 0) {
        action = 'skip';
      } else if (isDuplicate) {
        action = duplicateAction === 'update' ? 'update' : duplicateAction === 'skip' ? 'skip' : 'insert';
      }

      // Check row-level override
      const override = rowOverrides[rowNum];
      if (override?.action) {
        action = override.action;
      }
      const selected = override?.selected !== undefined ? override.selected : errors.length === 0 && action !== 'skip';

      const status: 'valid' | 'warning' | 'error' = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

      return {
        rowNumber: rowNum,
        originalValues,
        mappedData,
        status,
        isDuplicate,
        duplicateContactId: duplicateContact?.id,
        duplicateContactName: duplicateContact ? `${duplicateContact.firstName} ${duplicateContact.lastName}` : undefined,
        action,
        errors,
        warnings,
        selected,
      };
    });
  }, [rawRows, mappings, headers, duplicateMatchRule, duplicateAction, contacts, companies, rowOverrides]);

  // Row Filtered for Preview
  const displayedValidatedRows = useMemo(() => {
    if (previewFilter === 'all') return validatedRows;
    return validatedRows.filter((r) => r.status === previewFilter);
  }, [validatedRows, previewFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = validatedRows.length;
    const valid = validatedRows.filter((r) => r.status === 'valid').length;
    const warnings = validatedRows.filter((r) => r.status === 'warning').length;
    const errors = validatedRows.filter((r) => r.status === 'error').length;
    const selectedCount = validatedRows.filter((r) => r.selected).length;
    const toInsert = validatedRows.filter((r) => r.selected && r.action === 'insert').length;
    const toUpdate = validatedRows.filter((r) => r.selected && r.action === 'update').length;
    const toSkip = validatedRows.filter((r) => !r.selected || r.action === 'skip').length;

    return { total, valid, warnings, errors, selectedCount, toInsert, toUpdate, toSkip };
  }, [validatedRows]);

  // Execute Actual Database Import
  const handleConfirmImport = async () => {
    setIsProcessing(true);
    setCurrentStep(4);
    setProcessProgress(10);

    const activeRowsToImport = validatedRows.filter((r) => r.selected && r.status !== 'error');
    let imported = 0;
    let updated = 0;
    let skipped = validatedRows.length - activeRowsToImport.length;
    let failed = 0;
    const errorsList: { rowNumber: number; originalData: Record<string, any>; errors: string[] }[] = [];

    // Capture initial invalid rows in error report
    validatedRows.forEach((r) => {
      if (r.status === 'error') {
        failed++;
        errorsList.push({
          rowNumber: r.rowNumber,
          originalData: r.originalValues,
          errors: r.errors,
        });
      }
    });

    try {
      setProcessProgress(30);

      // Cache existing companies map
      const companyMap = new Map<string, string>();
      companies.forEach((c) => companyMap.set(c.name.toLowerCase().trim(), c.id));

      for (let i = 0; i < activeRowsToImport.length; i++) {
        const row = activeRowsToImport[i];
        setProcessProgress(30 + Math.round(((i + 1) / activeRowsToImport.length) * 60));

        try {
          // Resolve or auto-create company if provided
          let companyId: string | undefined;
          if (row.mappedData.companyName) {
            const cleanCompName = row.mappedData.companyName.trim();
            const existingId = companyMap.get(cleanCompName.toLowerCase());
            if (existingId) {
              companyId = existingId;
            } else {
              const newComp = addCompany({
                name: cleanCompName,
                industry: 'Other',
                priority: 'Medium',
                ownerId: currentUser.id,
                description: 'Imported via Excel spreadsheet',
              });
              companyMap.set(cleanCompName.toLowerCase(), newComp.id);
              companyId = newComp.id;
            }
          }

          const contactPayload = {
            firstName: row.mappedData.firstName,
            lastName: row.mappedData.lastName,
            email: row.mappedData.email,
            phone: row.mappedData.phone || undefined,
            mobile: row.mappedData.mobile || undefined,
            companyId: companyId,
            jobTitle: row.mappedData.jobTitle || undefined,
            type: (['lead', 'customer', 'vendor'].includes(row.mappedData.type?.toLowerCase())
              ? row.mappedData.type.toLowerCase()
              : 'lead') as any,
            mailingAddress: row.mappedData.mailingAddress || undefined,
            description: row.mappedData.notes || undefined,
            ownerId: currentUser.id,
          };

          if (row.action === 'update' && row.duplicateContactId) {
            updateContact(row.duplicateContactId, contactPayload);
            updated++;
          } else {
            const res = addContact(contactPayload);
            // Also sync to cloud firestore asynchronously
            try {
              firestoreService.saveDocument('contacts', res.contact).catch(() => {});
            } catch {
              // Non-blocking firestore sync
            }
            imported++;
          }
        } catch (itemErr: any) {
          failed++;
          errorsList.push({
            rowNumber: row.rowNumber,
            originalData: row.originalValues,
            errors: [itemErr.message || 'Failed to save record to CRM database'],
          });
        }
      }

      setProcessProgress(100);

      // Record in Import History & Audit
      const sourceName = uploadedFile ? uploadedFile.name : 'Manual_Data_Entry.xlsx';
      addImportHistoryRecord({
        filename: sourceName,
        sourceApp: 'Excel Spreadsheet',
        fileSize: uploadedFile ? uploadedFile.size : new Blob([manualText]).size,
        delimiter: 'excel',
        importedBy: currentUser.id,
        importedByName: currentUser.name,
        totalRecords: validatedRows.length,
        successCount: imported,
        updatedCount: updated,
        duplicateCount: stats.warnings,
        failedCount: failed,
        status: failed === 0 ? 'Completed' : imported > 0 ? 'Partially Completed' : 'Failed',
        duplicateHandlingMode: duplicateAction === 'update' ? 'update' : duplicateAction === 'skip' ? 'skip' : 'create_new',
      });

      logAudit(
        'EXCEL_DATA_IMPORTED',
        `Imported ${imported} contacts, updated ${updated}, skipped ${skipped}, failed ${failed} from ${sourceName} by ${currentUser.name}`
      );

      const summary = {
        total: validatedRows.length,
        imported,
        updated,
        skipped,
        failed,
        errorsList,
      };

      setImportSummary(summary);
      if (onImportComplete) {
        onImportComplete({ imported, updated, skipped });
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shadow-2xs border border-white/20">
              <FileSpreadsheet size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Excel & Manual Contact Import
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  .xlsx / .xls / Manual
                </span>
              </div>
              <p className="text-[11px] text-teal-100/90">
                Import from Microsoft Excel spreadsheets or copy/paste raw tabular data with duplicate prevention and validation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Breadcrumb */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 overflow-x-auto text-[11px] font-semibold">
          <div className="flex items-center gap-6">
            {inputMode === 'file' ? (
              <>
                <div
                  className={`flex items-center gap-1.5 ${
                    currentStep === 1 ? 'text-indigo-600 font-bold' : currentStep > 1 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 1 ? 'bg-indigo-600 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <span>Upload Excel File</span>
                </div>

                <span className="text-slate-300">→</span>

                <div
                  className={`flex items-center gap-1.5 ${
                    currentStep === 2 ? 'text-indigo-600 font-bold' : currentStep > 2 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 2 ? 'bg-indigo-600 text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </span>
                  <span>Column Mapping</span>
                </div>
              </>
            ) : (
              <div
                className={`flex items-center gap-1.5 ${
                  currentStep === 1 ? 'text-indigo-600 font-bold' : currentStep > 1 ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === 1 ? 'bg-indigo-600 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                <span>Manual Contact Form</span>
              </div>
            )}

            <span className="text-slate-300">→</span>

            <div
              className={`flex items-center gap-1.5 ${
                currentStep === 3 ? 'text-indigo-600 font-bold' : currentStep > 3 ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 3 ? 'bg-indigo-600 text-white' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 3 ? '✓' : inputMode === 'manual' ? '2' : '3'}
              </span>
              <span>Review & Duplicate Rules</span>
            </div>

            <span className="text-slate-300">→</span>

            <div
              className={`flex items-center gap-1.5 ${
                currentStep === 4 ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {inputMode === 'manual' ? '3' : '4'}
              </span>
              <span>Execution & Results</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="hidden sm:flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-[11px]"
          >
            <Download size={13} />
            <span>Download Excel Template (.xlsx)</span>
          </button>
        </div>

        {/* Step Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {fileError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{fileError}</div>
              <button
                type="button"
                onClick={() => setFileError(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* STEP 1: SOURCE SELECTION (FILE OR MANUAL) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Mode Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    inputMode === 'file'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet size={15} />
                  <span>Upload Excel File (.xlsx, .xls, .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    inputMode === 'manual'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users size={15} />
                  <span>Manual Contact Form (No File Needed)</span>
                </button>
              </div>

              {inputMode === 'file' && (
                <div className="space-y-4">
                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.tsv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3">
                      <UploadCloud size={28} />
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mb-1">
                      {uploadedFile ? uploadedFile.name : 'Choose or drag & drop your Excel spreadsheet'}
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Supports Microsoft Excel (<strong className="text-slate-700">.xlsx</strong>, <strong className="text-slate-700">.xls</strong>), CSV, and TSV files up to 20MB.
                    </p>

                    {uploadedFile && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Ready: {rawRows.length} records found ({headers.length} columns)</span>
                      </div>
                    )}
                  </div>

                  {/* Multi-sheet selection if workbook has multiple sheets */}
                  {availableSheets.length > 1 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span className="font-semibold text-xs text-slate-800">
                          Select Worksheet:
                        </span>
                      </div>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                      >
                        {availableSheets.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Helper row with template and demo loader */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Need a format template?</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Download size={12} />
                        <span>Download Contacts Template (.xlsx)</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleLoadDemoData}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                      >
                        Load Sample Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {inputMode === 'manual' && (
                <div className="space-y-4">
                  {/* Datalist for existing CRM company names */}
                  <datalist id="crm-modal-companies-list">
                    {companies.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>

                  {/* Header info & action bar */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-emerald-50/60 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" />
                        <h3 className="font-bold text-xs text-slate-900">
                          Manual Contact Entry Form
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                          No File Upload Required
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Directly enter contact fields into the form. You can add multiple contacts for bulk import.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddManualContact}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Plus size={13} />
                        <span>Add Contact</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddMultipleManualContacts(3)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                        title="Add 3 empty rows"
                      >
                        +3 Rows
                      </button>

                      <button
                        type="button"
                        onClick={handleLoadSampleManualContacts}
                        className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                        title="Load 3 sample contacts to test import instantly"
                      >
                        Load Sample Contacts
                      </button>

                      <button
                        type="button"
                        onClick={handleClearManualContacts}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl text-xs transition-colors"
                        title="Reset form"
                      >
                        Clear Form
                      </button>
                    </div>
                  </div>

                  {/* Contact Form Cards */}
                  <div className="space-y-3">
                    {manualContacts.map((contact, idx) => (
                      <div
                        key={contact.id}
                        className={`p-4 bg-white rounded-2xl border transition-all ${
                          contact.validationError
                            ? 'border-rose-300 ring-2 ring-rose-100 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800">
                              {contact.firstName || contact.lastName
                                ? `${contact.firstName} ${contact.lastName}`.trim()
                                : `Contact #${idx + 1}`}
                            </span>
                            {contact.validationError && (
                              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold rounded-md flex items-center gap-1">
                                <AlertCircle size={10} />
                                {contact.validationError}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {manualContacts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveManualContact(contact.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remove this contact from form"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          {/* First Name */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              First Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={contact.firstName}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'firstName', e.target.value)}
                              placeholder="e.g. Jane"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Last Name */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Last Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={contact.lastName}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'lastName', e.target.value)}
                              placeholder="e.g. Doe"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Email Address */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Email Address <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'email', e.target.value)}
                              placeholder="e.g. jane.doe@company.com"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'phone', e.target.value)}
                              placeholder="e.g. +1 (555) 012-3456"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Company Name */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Company / Organization
                            </label>
                            <input
                              type="text"
                              list="crm-modal-companies-list"
                              value={contact.companyName}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'companyName', e.target.value)}
                              placeholder="Select or enter company"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Job Title */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Job Title / Role
                            </label>
                            <input
                              type="text"
                              value={contact.jobTitle}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'jobTitle', e.target.value)}
                              placeholder="e.g. VP of Product"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>

                          {/* Contact Type */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Contact Type
                            </label>
                            <select
                              value={contact.type}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'type', e.target.value as any)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                            >
                              <option value="lead">Lead</option>
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          {/* Street Address */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Mailing / Street Address
                            </label>
                            <input
                              type="text"
                              value={contact.mailingAddress}
                              onChange={(e) => handleUpdateManualContact(contact.id, 'mailingAddress', e.target.value)}
                              placeholder="e.g. 100 Main St, Suite 200"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Notes / Description */}
                        <div className="mt-2.5">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Notes / Description
                          </label>
                          <input
                            type="text"
                            value={contact.notes}
                            onChange={(e) => handleUpdateManualContact(contact.id, 'notes', e.target.value)}
                            placeholder="e.g. Met at summit, interested in enterprise tier..."
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form Bottom Action Toolbar */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleAddManualContact}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Plus size={14} />
                      <span>+ Add Another Contact</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs font-medium">
                        {manualContacts.length} contact{manualContacts.length === 1 ? '' : 's'} in form
                      </span>
                      <button
                        type="button"
                        onClick={handleSubmitManualForm}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Check size={14} />
                        <span>Validate & Review Contacts ({manualContacts.filter(c => c.firstName.trim() || c.email.trim()).length || 1})</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Optional Raw Text Paste toggle for power users */}
                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setManualEntryTab(manualEntryTab === 'paste' ? 'form' : 'paste')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                    >
                      {manualEntryTab === 'paste' ? '← Back to Structured Contact Form' : 'Need to paste raw tab/comma-separated text instead?'}
                    </button>
                  </div>

                  {manualEntryTab === 'paste' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs text-slate-800">
                          Raw Tabular Text Input
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadDemoData}
                          className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] hover:underline"
                        >
                          Load Sample Paste Data
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder={`First Name\tLast Name\tEmail\tPhone\tCompany\tJob Title\nMarcus\tAurelius\tmarcus@stoic.com\t555-0199\tStoic Ltd\tManaging Director`}
                        className="w-full p-2.5 font-mono text-[11px] border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleParseManualText}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Parse & Map Text Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING & DUPLICATE RULES */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Duplicate Handling Policy Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">
                    Duplicate Detection & Merge Policy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Duplicate Matching Criteria
                    </label>
                    <select
                      value={duplicateMatchRule}
                      onChange={(e) => setDuplicateMatchRule(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="email">Match by Email Address (Standard)</option>
                      <option value="phone">Match by Phone / Mobile Number</option>
                      <option value="name_and_company">Match by Full Name & Company</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Action When Duplicate Exists
                    </label>
                    <select
                      value={duplicateAction}
                      onChange={(e) => setDuplicateAction(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="skip">Skip Duplicate (Safest - Do Not Overwrite)</option>
                      <option value="update">Update Existing Record with New Data</option>
                      <option value="insert">Allow Duplicate (Create New Contact Anyway)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Column Mapping Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">
                    Map Spreadsheet Columns to CRM Contact Fields
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {mappings.filter((m) => m.targetField !== '__ignore__').length} of {mappings.length} columns mapped
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-1/3">Source Excel Column</th>
                        <th className="py-2.5 px-4 w-1/3">Target CRM Field</th>
                        <th className="py-2.5 px-4 w-1/3">Sample Value (Row 1)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {mappings.map((mapping, idx) => {
                        const targetFieldDef = CONTACT_TARGET_FIELDS.find((f) => f.key === mapping.targetField);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-4 font-semibold text-slate-800">
                              {mapping.sourceColumn}
                            </td>
                            <td className="py-2 px-4">
                              <select
                                value={mapping.targetField}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setMappings((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, targetField: newVal } : m))
                                  );
                                }}
                                className={`w-full p-1.5 rounded-lg border text-xs ${
                                  mapping.targetField === '__ignore__'
                                    ? 'border-slate-200 text-slate-400 bg-slate-50'
                                    : targetFieldDef?.required
                                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900 font-semibold'
                                    : 'border-slate-300 bg-white text-slate-800 font-medium'
                                }`}
                              >
                                <option value="__ignore__">— Do Not Import (Ignore) —</option>
                                <optgroup label="Required Fields">
                                  {CONTACT_TARGET_FIELDS.filter((f) => f.required).map((f) => (
                                    <option key={f.key} value={f.key}>
                                      {f.label} * (Required)
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Optional Contact Details">
                                  {CONTACT_TARGET_FIELDS.filter((f) => !f.required).map((f) => (
                                    <option key={f.key} value={f.key}>
                                      {f.label}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </td>
                            <td className="py-2 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                              {mapping.sampleValue || <span className="italic text-slate-300">empty</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewFilter('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Total Records
                  </div>
                  <div className="text-xl font-bold">{stats.total}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewFilter('valid')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === 'valid'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Valid & Ready
                  </div>
                  <div className="text-xl font-bold">{stats.valid}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewFilter('warning')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === 'warning'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Duplicates / Warnings
                  </div>
                  <div className="text-xl font-bold">{stats.warnings}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewFilter('error')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    previewFilter === 'error'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Errors (Rejected)
                  </div>
                  <div className="text-xl font-bold">{stats.errors}</div>
                </button>
              </div>

              {/* Action Banner */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                  <span>
                    Selected for import: <strong>{stats.selectedCount}</strong> records ({stats.toInsert} new, {stats.toUpdate} updates, {stats.toSkip} skipped).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newOverrides: Record<number, any> = {};
                      validatedRows.forEach((r) => {
                        if (r.status !== 'error') {
                          newOverrides[r.rowNumber] = { selected: true };
                        }
                      });
                      setRowOverrides(newOverrides);
                    }}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline"
                  >
                    Select All Valid
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newOverrides: Record<number, any> = {};
                      validatedRows.forEach((r) => {
                        newOverrides[r.rowNumber] = { selected: false, action: 'skip' };
                      });
                      setRowOverrides(newOverrides);
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">Import</th>
                      <th className="py-2 px-3 w-12 text-center">Row</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Contact Name</th>
                      <th className="py-2 px-3">Email Address</th>
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {displayedValidatedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={`hover:bg-slate-50/80 ${
                          !row.selected ? 'opacity-50 bg-slate-50/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={row.status === 'error'}
                            onChange={(e) => {
                              setRowOverrides((prev) => ({
                                ...prev,
                                [row.rowNumber]: {
                                  ...prev[row.rowNumber],
                                  selected: e.target.checked,
                                },
                              }));
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-400">
                          {row.rowNumber}
                        </td>
                        <td className="py-2 px-3">
                          {row.status === 'valid' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          )}
                          {row.status === 'warning' && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
                              title={row.warnings.join('; ')}
                            >
                              <AlertTriangle size={11} /> Duplicate
                            </span>
                          )}
                          {row.status === 'error' && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
                              title={row.errors.join('; ')}
                            >
                              <AlertCircle size={11} /> Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {row.mappedData.firstName} {row.mappedData.lastName}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                          {row.mappedData.email || <span className="text-rose-500 italic">None</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {row.mappedData.companyName || '—'}
                        </td>
                        <td className="py-2 px-3">
                          {row.status === 'error' ? (
                            <span className="text-[10px] text-rose-600 font-medium">
                              {row.errors[0]}
                            </span>
                          ) : (
                            <select
                              value={row.action}
                              onChange={(e) => {
                                const newAct = e.target.value as 'insert' | 'update' | 'skip';
                                setRowOverrides((prev) => ({
                                  ...prev,
                                  [row.rowNumber]: {
                                    ...prev[row.rowNumber],
                                    action: newAct,
                                    selected: newAct !== 'skip',
                                  },
                                }));
                              }}
                              className="p-1 border border-slate-300 rounded text-[11px] font-semibold bg-white"
                            >
                              <option value="insert">Insert as New</option>
                              {row.isDuplicate && <option value="update">Update Match</option>}
                              <option value="skip">Skip Record</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING & FINAL RESULTS */}
          {currentStep === 4 && (
            <div className="py-6 space-y-6 text-center">
              {isProcessing ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Importing & Validating Records...
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saving contacts, resolving duplicate policies, and synchronizing with database.
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                </div>
              ) : importSummary ? (
                <div className="space-y-6 max-w-xl mx-auto text-left">
                  <div className="text-center space-y-1">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <CheckCircle2 size={30} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Import Process Completed!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Your database has been updated with the validated spreadsheet records.
                    </p>
                  </div>

                  {/* Summary Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-xl font-bold text-emerald-700">
                        {importSummary.imported}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-900 uppercase">
                        New Added
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="text-xl font-bold text-indigo-700">
                        {importSummary.updated}
                      </div>
                      <div className="text-[10px] font-semibold text-indigo-900 uppercase">
                        Updated
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
                      <div className="text-xl font-bold text-slate-700">
                        {importSummary.skipped}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-900 uppercase">
                        Skipped
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="text-xl font-bold text-rose-700">
                        {importSummary.failed}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-900 uppercase">
                        Failed
                      </div>
                    </div>
                  </div>

                  {/* Error Report Download if any errors */}
                  {importSummary.errorsList.length > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AlertCircle size={18} className="text-rose-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-rose-900">
                            {importSummary.errorsList.length} rows were rejected due to validation errors
                          </div>
                          <p className="text-[11px] text-rose-700">
                            Download the Excel error report with specific reasons to fix and re-import.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => exportImportErrorReport(importSummary.errorsList)}
                        className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileDown size={13} />
                        <span>Download Error Report (.xlsx)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && currentStep < 4 && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 3 && inputMode === 'manual') {
                    setCurrentStep(1);
                  } else {
                    setCurrentStep((prev) => (prev - 1) as any);
                  }
                }}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              {currentStep === 4 ? 'Close' : 'Cancel'}
            </button>

            {currentStep === 1 && inputMode === 'file' && (
              <button
                type="button"
                disabled={rawRows.length === 0}
                onClick={() => setCurrentStep(2)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Continue to Column Mapping</span>
                <ArrowRight size={14} />
              </button>
            )}

            {currentStep === 1 && inputMode === 'manual' && (
              <button
                type="button"
                onClick={handleSubmitManualForm}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check size={14} />
                <span>Validate & Review Contacts</span>
                <ArrowRight size={14} />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Review & Validate Data ({rawRows.length} rows)</span>
                <ArrowRight size={14} />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                disabled={stats.selectedCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check size={14} />
                <span>Confirm & Import {stats.selectedCount} Records</span>
              </button>
            )}

            {currentStep === 4 && !isProcessing && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                View Contacts List
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
