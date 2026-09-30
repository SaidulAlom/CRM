import {
  Company,
  Contact,
  Deal,
  Case,
  Task,
  Event,
  User,
  UserRole,
  ExportEntityType,
} from '../../../types';

export interface ExportFieldDefinition {
  key: string;
  label: string;
  category: 'core' | 'contact' | 'organization' | 'financial' | 'dates' | 'system';
  description: string;
  defaultSelected: boolean;
  isSensitive?: boolean; // Requires manager/admin or will be masked for standard users
  accessor: (record: any, context: { companies: Company[]; contacts: Contact[]; users: User[] }) => string;
}

export interface EntityExportConfig {
  id: ExportEntityType;
  title: string;
  shortLabel: string;
  description: string;
  badge: string;
  iconBg: string;
  iconText: string;
  fields: ExportFieldDefinition[];
  defaultFileNamePrefix: string;
}

// -------------------------------------------------------------
// Field Definitions by Entity
// -------------------------------------------------------------

export const COMPANY_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Company ID',
    category: 'system',
    description: 'Unique internal record identifier',
    defaultSelected: true,
    accessor: (c: Company) => c.id || '',
  },
  {
    key: 'name',
    label: 'Company Name',
    category: 'core',
    description: 'Corporate business or organization name',
    defaultSelected: true,
    accessor: (c: Company) => c.name || '',
  },
  {
    key: 'industry',
    label: 'Industry Sector',
    category: 'organization',
    description: 'Commercial business vertical',
    defaultSelected: true,
    accessor: (c: Company) => c.industry || '',
  },
  {
    key: 'priority',
    label: 'Account Priority',
    category: 'core',
    description: 'Strategic priority (Critical, High, Medium, Low)',
    defaultSelected: true,
    accessor: (c: Company) => c.priority || '',
  },
  {
    key: 'annualRevenue',
    label: 'Annual Revenue',
    category: 'financial',
    description: 'Reported annual corporate revenue',
    defaultSelected: true,
    isSensitive: true,
    accessor: (c: Company) => (c.annualRevenue !== undefined ? `$${Number(c.annualRevenue).toLocaleString()}` : ''),
  },
  {
    key: 'employeeCount',
    label: 'Employee Count',
    category: 'organization',
    description: 'Headcount of full-time staff',
    defaultSelected: true,
    accessor: (c: Company) => (c.employeeCount !== undefined ? String(c.employeeCount) : ''),
  },
  {
    key: 'phone',
    label: 'Main Telephone',
    category: 'contact',
    description: 'Primary corporate switchboard phone',
    defaultSelected: true,
    accessor: (c: Company) => c.phone || '',
  },
  {
    key: 'email',
    label: 'Corporate Email',
    category: 'contact',
    description: 'General inquiry or company inbox',
    defaultSelected: true,
    accessor: (c: Company) => c.email || '',
  },
  {
    key: 'website',
    label: 'Website URL',
    category: 'contact',
    description: 'Company homepage or web domain',
    defaultSelected: true,
    accessor: (c: Company) => c.website || '',
  },
  {
    key: 'address',
    label: 'Headquarters Address',
    category: 'organization',
    description: 'Physical office address',
    defaultSelected: true,
    accessor: (c: Company) => c.address || c.billingAddress || '',
  },
  {
    key: 'city',
    label: 'City',
    category: 'organization',
    description: 'Headquarters city',
    defaultSelected: true,
    accessor: (c: Company) => c.city || '',
  },
  {
    key: 'state',
    label: 'State / Province',
    category: 'organization',
    description: 'State or administrative territory',
    defaultSelected: true,
    accessor: (c: Company) => c.state || '',
  },
  {
    key: 'country',
    label: 'Country',
    category: 'organization',
    description: 'Nation of operation',
    defaultSelected: true,
    accessor: (c: Company) => c.country || '',
  },
  {
    key: 'ownerName',
    label: 'Account Owner',
    category: 'core',
    description: 'Assigned CRM sales or account manager',
    defaultSelected: true,
    accessor: (c: Company, { users }) => {
      const u = users.find((usr) => usr.id === c.ownerId);
      return u ? `${u.name} (${u.role})` : c.ownerId || '';
    },
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    category: 'dates',
    description: 'Record creation timestamp',
    defaultSelected: true,
    accessor: (c: Company) => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
  },
  {
    key: 'updatedAt',
    label: 'Last Updated Date',
    category: 'dates',
    description: 'Last record modification date',
    defaultSelected: false,
    accessor: (c: Company) => c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
  },
  {
    key: 'description',
    label: 'Description / Notes',
    category: 'core',
    description: 'Account overview notes and background',
    defaultSelected: false,
    accessor: (c: Company) => c.description || '',
  },
];

export const CONTACT_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Contact ID',
    category: 'system',
    description: 'Unique internal record identifier',
    defaultSelected: true,
    accessor: (c: Contact) => c.id || '',
  },
  {
    key: 'firstName',
    label: 'First Name',
    category: 'core',
    description: 'Contact given name',
    defaultSelected: true,
    accessor: (c: Contact) => c.firstName || '',
  },
  {
    key: 'lastName',
    label: 'Last Name',
    category: 'core',
    description: 'Contact family / surname',
    defaultSelected: true,
    accessor: (c: Contact) => c.lastName || '',
  },
  {
    key: 'fullName',
    label: 'Full Name',
    category: 'core',
    description: 'Combined first and last name',
    defaultSelected: true,
    accessor: (c: Contact) => `${c.firstName || ''} ${c.lastName || ''}`.trim(),
  },
  {
    key: 'email',
    label: 'Email Address',
    category: 'contact',
    description: 'Primary corporate business email address',
    defaultSelected: true,
    accessor: (c: Contact) => c.email || '',
  },
  {
    key: 'phone',
    label: 'Direct Phone',
    category: 'contact',
    description: 'Direct business telephone number',
    defaultSelected: true,
    accessor: (c: Contact) => c.phone || '',
  },
  {
    key: 'mobile',
    label: 'Mobile Phone',
    category: 'contact',
    description: 'Cellular mobile phone number',
    defaultSelected: true,
    accessor: (c: Contact) => c.mobile || '',
  },
  {
    key: 'jobTitle',
    label: 'Designation / Job Title',
    category: 'core',
    description: 'Organizational job title or executive role',
    defaultSelected: true,
    accessor: (c: Contact) => c.jobTitle || '',
  },
  {
    key: 'companyName',
    label: 'Company / Organization',
    category: 'organization',
    description: 'Employer business organization name',
    defaultSelected: true,
    accessor: (c: Contact, { companies }) => {
      const comp = companies.find((cp) => cp.id === c.companyId);
      return comp ? comp.name : '';
    },
  },
  {
    key: 'type',
    label: 'Relationship Type',
    category: 'core',
    description: 'Lifecycle classification (Lead, Customer, Vendor, Other)',
    defaultSelected: true,
    accessor: (c: Contact) => c.type ? c.type.toUpperCase() : 'OTHER',
  },
  {
    key: 'mailingAddress',
    label: 'Mailing Address',
    category: 'contact',
    description: 'Primary postal mailing address',
    defaultSelected: true,
    accessor: (c: Contact) => c.mailingAddress || '',
  },
  {
    key: 'messagingHandle',
    label: 'Messaging / Slack Handle',
    category: 'contact',
    description: 'Chat handle, Slack ID, or Teams handle',
    defaultSelected: false,
    accessor: (c: Contact) => c.messagingHandle || '',
  },
  {
    key: 'ownerName',
    label: 'Contact Owner',
    category: 'core',
    description: 'Assigned CRM team member',
    defaultSelected: true,
    accessor: (c: Contact, { users }) => {
      const u = users.find((usr) => usr.id === c.ownerId);
      return u ? `${u.name} (${u.role})` : c.ownerId || '';
    },
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    category: 'dates',
    description: 'Creation timestamp',
    defaultSelected: true,
    accessor: (c: Contact) => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
  },
  {
    key: 'updatedAt',
    label: 'Last Updated Date',
    category: 'dates',
    description: 'Last modification date',
    defaultSelected: false,
    accessor: (c: Contact) => c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
  },
  {
    key: 'description',
    label: 'Notes / Bio',
    category: 'core',
    description: 'Relationship notes and background history',
    defaultSelected: false,
    accessor: (c: Contact) => c.description || '',
  },
];

export const COMBINED_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'companyName',
    label: 'Company Name',
    category: 'organization',
    description: 'Company business name',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.company?.name || '',
  },
  {
    key: 'companyIndustry',
    label: 'Company Industry',
    category: 'organization',
    description: 'Industry classification',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.company?.industry || '',
  },
  {
    key: 'companyPhone',
    label: 'Company Phone',
    category: 'organization',
    description: 'Company office phone',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.company?.phone || '',
  },
  {
    key: 'companyWebsite',
    label: 'Company Website',
    category: 'organization',
    description: 'Company website domain',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.company?.website || '',
  },
  {
    key: 'contactFullName',
    label: 'Contact Full Name',
    category: 'core',
    description: 'Individual person name',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) =>
      `${row.contact.firstName || ''} ${row.contact.lastName || ''}`.trim(),
  },
  {
    key: 'contactJobTitle',
    label: 'Contact Job Title',
    category: 'core',
    description: 'Contact executive designation',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.contact.jobTitle || '',
  },
  {
    key: 'contactEmail',
    label: 'Contact Email',
    category: 'contact',
    description: 'Direct contact email',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) => row.contact.email || '',
  },
  {
    key: 'contactPhone',
    label: 'Contact Phone / Mobile',
    category: 'contact',
    description: 'Contact phone or cell',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) =>
      row.contact.phone || row.contact.mobile || '',
  },
  {
    key: 'contactType',
    label: 'Relationship Type',
    category: 'core',
    description: 'Lead or Customer lifecycle stage',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) =>
      row.contact.type ? row.contact.type.toUpperCase() : 'OTHER',
  },
  {
    key: 'contactAddress',
    label: 'Contact Address',
    category: 'contact',
    description: 'Physical or mailing address',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }) =>
      row.contact.mailingAddress || row.company?.address || '',
  },
  {
    key: 'ownerName',
    label: 'Account Owner',
    category: 'core',
    description: 'Account representative',
    defaultSelected: true,
    accessor: (row: { contact: Contact; company?: Company }, { users }) => {
      const ownerId = row.contact.ownerId || row.company?.ownerId;
      const u = users.find((usr) => usr.id === ownerId);
      return u ? `${u.name} (${u.role})` : ownerId || '';
    },
  },
];

export const DEAL_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Deal ID',
    category: 'system',
    description: 'Unique deal record identifier',
    defaultSelected: true,
    accessor: (d: Deal) => d.id || '',
  },
  {
    key: 'title',
    label: 'Deal Title',
    category: 'core',
    description: 'Sales opportunity name',
    defaultSelected: true,
    accessor: (d: Deal) => d.title || '',
  },
  {
    key: 'companyName',
    label: 'Account / Company',
    category: 'organization',
    description: 'Target prospective company',
    defaultSelected: true,
    accessor: (d: Deal, { companies }) => {
      const comp = companies.find((cp) => cp.id === d.companyId);
      return comp ? comp.name : '';
    },
  },
  {
    key: 'contactName',
    label: 'Primary Contact',
    category: 'contact',
    description: 'Key decision-maker contact',
    defaultSelected: true,
    accessor: (d: Deal, { contacts }) => {
      const ct = contacts.find((c) => c.id === d.contactId);
      return ct ? `${ct.firstName} ${ct.lastName}`.trim() : '';
    },
  },
  {
    key: 'product',
    label: 'Product / Offering',
    category: 'core',
    description: 'Subscribed product or service line',
    defaultSelected: true,
    accessor: (d: Deal) => d.product || '',
  },
  {
    key: 'value',
    label: 'Deal Value',
    category: 'financial',
    description: 'Contract or monetary pipeline value',
    defaultSelected: true,
    accessor: (d: Deal) => `$${Number(d.value || 0).toLocaleString()}`,
  },
  {
    key: 'currency',
    label: 'Currency',
    category: 'financial',
    description: 'Contract currency (USD, EUR, GBP)',
    defaultSelected: true,
    accessor: (d: Deal) => d.currency || 'USD',
  },
  {
    key: 'stage',
    label: 'Pipeline Stage',
    category: 'core',
    description: 'Current sales pipeline step',
    defaultSelected: true,
    accessor: (d: Deal) => d.stage || '',
  },
  {
    key: 'status',
    label: 'Deal Status',
    category: 'core',
    description: 'Deal outcome (Open, Won, Lost)',
    defaultSelected: true,
    accessor: (d: Deal) => (d.status ? d.status.toUpperCase() : 'OPEN'),
  },
  {
    key: 'expectedCloseDate',
    label: 'Expected Close Date',
    category: 'dates',
    description: 'Anticipated signature / closing date',
    defaultSelected: true,
    accessor: (d: Deal) => d.expectedCloseDate || '',
  },
  {
    key: 'nextStep',
    label: 'Next Step',
    category: 'core',
    description: 'Planned next action item',
    defaultSelected: false,
    accessor: (d: Deal) => d.nextStep || '',
  },
  {
    key: 'ownerName',
    label: 'Deal Owner',
    category: 'core',
    description: 'Sales representative in charge',
    defaultSelected: true,
    accessor: (d: Deal, { users }) => {
      const u = users.find((usr) => usr.id === d.ownerId);
      return u ? `${u.name} (${u.role})` : d.ownerId || '';
    },
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    category: 'dates',
    description: 'Date opportunity was created',
    defaultSelected: true,
    accessor: (d: Deal) => d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
  },
];

export const CASE_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Case ID',
    category: 'system',
    description: 'Unique support ticket identifier',
    defaultSelected: true,
    accessor: (cs: Case) => cs.id || '',
  },
  {
    key: 'title',
    label: 'Case Subject',
    category: 'core',
    description: 'Support case subject line',
    defaultSelected: true,
    accessor: (cs: Case) => cs.title || '',
  },
  {
    key: 'problemName',
    label: 'Problem Classification',
    category: 'core',
    description: 'Technical problem category',
    defaultSelected: true,
    accessor: (cs: Case) => cs.problemName || '',
  },
  {
    key: 'status',
    label: 'Case Status',
    category: 'core',
    description: 'Ticket status (Open, In Progress, Closed)',
    defaultSelected: true,
    accessor: (cs: Case) => cs.status || '',
  },
  {
    key: 'priority',
    label: 'Urgency Priority',
    category: 'core',
    description: 'Severity level (Critical, High, Medium, Low)',
    defaultSelected: true,
    accessor: (cs: Case) => cs.priority || '',
  },
  {
    key: 'companyName',
    label: 'Client Company',
    category: 'organization',
    description: 'Account requesting support',
    defaultSelected: true,
    accessor: (cs: Case, { companies }) => {
      const comp = companies.find((cp) => cp.id === cs.companyId);
      return comp ? comp.name : '';
    },
  },
  {
    key: 'contactName',
    label: 'Requester Contact',
    category: 'contact',
    description: 'Customer contact reporting the ticket',
    defaultSelected: true,
    accessor: (cs: Case, { contacts }) => {
      const ct = contacts.find((c) => c.id === cs.contactId);
      return ct ? `${ct.firstName} ${ct.lastName}`.trim() : '';
    },
  },
  {
    key: 'ownerName',
    label: 'Assigned Agent',
    category: 'core',
    description: 'Support engineer handling the issue',
    defaultSelected: true,
    accessor: (cs: Case, { users }) => {
      const u = users.find((usr) => usr.id === cs.ownerId);
      return u ? `${u.name} (${u.role})` : cs.ownerId || '';
    },
  },
  {
    key: 'createdAt',
    label: 'Opened Date',
    category: 'dates',
    description: 'Ticket submission date',
    defaultSelected: true,
    accessor: (cs: Case) => cs.createdAt ? new Date(cs.createdAt).toLocaleDateString() : '',
  },
  {
    key: 'closedDate',
    label: 'Resolution Date',
    category: 'dates',
    description: 'Date ticket was resolved',
    defaultSelected: false,
    accessor: (cs: Case) => cs.closedDate ? new Date(cs.closedDate).toLocaleDateString() : '',
  },
  {
    key: 'description',
    label: 'Case Details',
    category: 'core',
    description: 'Detailed description of the issue',
    defaultSelected: false,
    accessor: (cs: Case) => cs.description || '',
  },
];

export const TASK_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Task ID',
    category: 'system',
    description: 'Unique task identifier',
    defaultSelected: true,
    accessor: (t: Task) => t.id || '',
  },
  {
    key: 'title',
    label: 'Task Title',
    category: 'core',
    description: 'Action item title',
    defaultSelected: true,
    accessor: (t: Task) => t.title || '',
  },
  {
    key: 'deadline',
    label: 'Due Date / Deadline',
    category: 'dates',
    description: 'Target completion deadline',
    defaultSelected: true,
    accessor: (t: Task) => t.deadline || '',
  },
  {
    key: 'status',
    label: 'Status',
    category: 'core',
    description: 'Status (Not Started, In Progress, Completed, Waiting)',
    defaultSelected: true,
    accessor: (t: Task) => t.status || '',
  },
  {
    key: 'completionPercentage',
    label: 'Completion %',
    category: 'core',
    description: 'Progress completion percentage',
    defaultSelected: true,
    accessor: (t: Task) => `${t.completionPercentage || 0}%`,
  },
  {
    key: 'assigneeName',
    label: 'Assigned User',
    category: 'core',
    description: 'Team member responsible for delivery',
    defaultSelected: true,
    accessor: (t: Task, { users }) => {
      const u = users.find((usr) => usr.id === t.assigneeId);
      return u ? `${u.name} (${u.role})` : t.assigneeId || '';
    },
  },
  {
    key: 'companyName',
    label: 'Related Company',
    category: 'organization',
    description: 'Associated client account',
    defaultSelected: true,
    accessor: (t: Task, { companies }) => {
      const comp = companies.find((cp) => cp.id === t.companyId);
      return comp ? comp.name : '';
    },
  },
  {
    key: 'contactName',
    label: 'Related Contact',
    category: 'contact',
    description: 'Associated customer contact',
    defaultSelected: false,
    accessor: (t: Task, { contacts }) => {
      const ct = contacts.find((c) => c.id === t.contactId);
      return ct ? `${ct.firstName} ${ct.lastName}`.trim() : '';
    },
  },
  {
    key: 'createdAt',
    label: 'Created Date',
    category: 'dates',
    description: 'Task assignment creation date',
    defaultSelected: true,
    accessor: (t: Task) => t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
  },
  {
    key: 'description',
    label: 'Task Details',
    category: 'core',
    description: 'Full task briefing notes',
    defaultSelected: false,
    accessor: (t: Task) => t.description || '',
  },
];

export const EVENT_EXPORT_FIELDS: ExportFieldDefinition[] = [
  {
    key: 'id',
    label: 'Event ID',
    category: 'system',
    description: 'Unique calendar meeting identifier',
    defaultSelected: true,
    accessor: (e: Event) => e.id || '',
  },
  {
    key: 'title',
    label: 'Meeting / Event Title',
    category: 'core',
    description: 'Calendar event subject title',
    defaultSelected: true,
    accessor: (e: Event) => e.title || '',
  },
  {
    key: 'startDate',
    label: 'Start Date',
    category: 'dates',
    description: 'Meeting start date',
    defaultSelected: true,
    accessor: (e: Event) => e.startDate || '',
  },
  {
    key: 'startTime',
    label: 'Start Time',
    category: 'dates',
    description: 'Scheduled start time',
    defaultSelected: true,
    accessor: (e: Event) => e.startTime || '',
  },
  {
    key: 'endDate',
    label: 'End Date',
    category: 'dates',
    description: 'Meeting conclusion date',
    defaultSelected: true,
    accessor: (e: Event) => e.endDate || '',
  },
  {
    key: 'endTime',
    label: 'End Time',
    category: 'dates',
    description: 'Scheduled end time',
    defaultSelected: true,
    accessor: (e: Event) => e.endTime || '',
  },
  {
    key: 'confirmed',
    label: 'Confirmation Status',
    category: 'core',
    description: 'Whether the meeting is confirmed',
    defaultSelected: true,
    accessor: (e: Event) => (e.confirmed ? 'Confirmed' : 'Pending Confirmation'),
  },
  {
    key: 'companyName',
    label: 'Related Company',
    category: 'organization',
    description: 'Client account attending the session',
    defaultSelected: true,
    accessor: (e: Event, { companies }) => {
      const comp = companies.find((cp) => cp.id === e.companyId);
      return comp ? comp.name : '';
    },
  },
  {
    key: 'contactName',
    label: 'Related Contact',
    category: 'contact',
    description: 'Customer contact meeting with team',
    defaultSelected: true,
    accessor: (e: Event, { contacts }) => {
      const ct = contacts.find((c) => c.id === e.contactId);
      return ct ? `${ct.firstName} ${ct.lastName}`.trim() : '';
    },
  },
  {
    key: 'participants',
    label: 'Internal Attendees',
    category: 'core',
    description: 'Staff members participating in the meeting',
    defaultSelected: true,
    accessor: (e: Event, { users }) => {
      if (!e.participantIds || e.participantIds.length === 0) return '';
      return e.participantIds
        .map((pid) => {
          const u = users.find((usr) => usr.id === pid);
          return u ? u.name : pid;
        })
        .join('; ');
    },
  },
];

// -------------------------------------------------------------
// Entity Config Registry
// -------------------------------------------------------------

export const EXPORT_ENTITY_CONFIGS: Record<ExportEntityType, EntityExportConfig> = {
  companies: {
    id: 'companies',
    title: 'Companies & Accounts',
    shortLabel: 'Companies',
    description: 'Corporate client accounts, sectors, priorities, annual revenue, and headquarters directories.',
    badge: 'Directory',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    fields: COMPANY_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_companies_export',
  },
  contacts: {
    id: 'contacts',
    title: 'Contacts & People',
    shortLabel: 'Contacts',
    description: 'Executive stakeholders, client leads, vendors, direct phone lines, job designations, and emails.',
    badge: 'People',
    iconBg: 'bg-blue-600',
    iconText: 'text-white',
    fields: CONTACT_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_contacts_export',
  },
  combined: {
    id: 'combined',
    title: 'Companies + Contacts (Combined)',
    shortLabel: 'Companies + Contacts',
    description: 'Denormalized view joining employer business accounts with associated contact personnel in each row.',
    badge: 'Combined Master',
    iconBg: 'bg-indigo-600',
    iconText: 'text-white',
    fields: COMBINED_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_companies_and_contacts_master',
  },
  deals: {
    id: 'deals',
    title: 'Deals & Sales Pipeline',
    shortLabel: 'Deals',
    description: 'Active commercial opportunities, pipeline stages, probability values, product lines, and target closing dates.',
    badge: 'Revenue Pipeline',
    iconBg: 'bg-violet-600',
    iconText: 'text-white',
    fields: DEAL_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_deals_pipeline_export',
  },
  cases: {
    id: 'cases',
    title: 'Support Cases & Tickets',
    shortLabel: 'Support Cases',
    description: 'Customer service inquiries, defect tickets, urgency priority levels, resolution dates, and engineer owners.',
    badge: 'Support Desk',
    iconBg: 'bg-amber-600',
    iconText: 'text-white',
    fields: CASE_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_support_cases_export',
  },
  tasks: {
    id: 'tasks',
    title: 'Tasks & Action Items',
    shortLabel: 'Tasks',
    description: 'Internal project assignments, milestone deadlines, completion percentages, and accountable team assignees.',
    badge: 'Operations',
    iconBg: 'bg-teal-600',
    iconText: 'text-white',
    fields: TASK_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_tasks_export',
  },
  events: {
    id: 'events',
    title: 'Calendar Events & Meetings',
    shortLabel: 'Calendar Events',
    description: 'Customer briefing sessions, product demos, schedule dates, start/end hours, and confirmed participants.',
    badge: 'Schedules',
    iconBg: 'bg-cyan-600',
    iconText: 'text-white',
    fields: EVENT_EXPORT_FIELDS,
    defaultFileNamePrefix: 'crm_calendar_events_export',
  },
  all: {
    id: 'all',
    title: 'All CRM Tables (Full Archive)',
    shortLabel: 'All CRM Data',
    description: 'Comprehensive multi-entity database archive encompassing companies, contacts, deals, cases, tasks, and calendar events.',
    badge: 'Full Archive',
    iconBg: 'bg-slate-800',
    iconText: 'text-white',
    fields: COMBINED_EXPORT_FIELDS, // default template
    defaultFileNamePrefix: 'crm_complete_database_archive',
  },
};
