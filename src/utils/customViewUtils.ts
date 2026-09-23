import {
  CustomViewModule,
  CustomViewFilters,
  CustomViewNameMatchOperator,
  Company,
  Contact,
  Deal,
  User,
} from '../types';

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultSelected?: boolean;
}

export const MODULE_COLUMNS: Record<CustomViewModule, ColumnDefinition[]> = {
  company: [
    { key: 'name', label: 'Company Name', defaultSelected: true },
    { key: 'industry', label: 'Industry', defaultSelected: true },
    { key: 'priority', label: 'Priority / Status', defaultSelected: true },
    { key: 'phone', label: 'Phone', defaultSelected: true },
    { key: 'email', label: 'Email', defaultSelected: true },
    { key: 'city', label: 'City', defaultSelected: true },
    { key: 'owner', label: 'Assigned User', defaultSelected: true },
    { key: 'website', label: 'Website', defaultSelected: false },
    { key: 'annualRevenue', label: 'Annual Revenue', defaultSelected: false },
    { key: 'employeeCount', label: 'Employees', defaultSelected: false },
    { key: 'state', label: 'State / Province', defaultSelected: false },
    { key: 'country', label: 'Country', defaultSelected: false },
    { key: 'createdAt', label: 'Created Date', defaultSelected: false },
  ],
  contact: [
    { key: 'name', label: 'Contact Name', defaultSelected: true },
    { key: 'company', label: 'Associated Company', defaultSelected: true },
    { key: 'type', label: 'Type / Status', defaultSelected: true },
    { key: 'email', label: 'Email', defaultSelected: true },
    { key: 'phone', label: 'Phone', defaultSelected: true },
    { key: 'owner', label: 'Assigned User', defaultSelected: true },
    { key: 'jobTitle', label: 'Job Title', defaultSelected: false },
    { key: 'city', label: 'City / Location', defaultSelected: false },
    { key: 'createdAt', label: 'Created Date', defaultSelected: false },
  ],
  lead: [
    { key: 'name', label: 'Lead Name', defaultSelected: true },
    { key: 'company', label: 'Company', defaultSelected: true },
    { key: 'jobTitle', label: 'Job Title', defaultSelected: true },
    { key: 'email', label: 'Email', defaultSelected: true },
    { key: 'phone', label: 'Phone', defaultSelected: true },
    { key: 'owner', label: 'Lead Owner', defaultSelected: true },
    { key: 'createdAt', label: 'Created Date', defaultSelected: false },
  ],
  customer: [
    { key: 'name', label: 'Customer Name', defaultSelected: true },
    { key: 'company', label: 'Company', defaultSelected: true },
    { key: 'jobTitle', label: 'Job Title', defaultSelected: true },
    { key: 'email', label: 'Email', defaultSelected: true },
    { key: 'phone', label: 'Phone', defaultSelected: true },
    { key: 'owner', label: 'Account Owner', defaultSelected: true },
    { key: 'createdAt', label: 'Created Date', defaultSelected: false },
  ],
  deal: [
    { key: 'title', label: 'Deal Title', defaultSelected: true },
    { key: 'company', label: 'Associated Company', defaultSelected: true },
    { key: 'value', label: 'Value', defaultSelected: true },
    { key: 'stage', label: 'Pipeline Stage', defaultSelected: true },
    { key: 'status', label: 'Status', defaultSelected: true },
    { key: 'owner', label: 'Deal Owner', defaultSelected: true },
    { key: 'expectedCloseDate', label: 'Expected Close', defaultSelected: true },
    { key: 'product', label: 'Product', defaultSelected: false },
    { key: 'createdAt', label: 'Created Date', defaultSelected: false },
  ],
};

/**
 * Evaluates a string against a target text using the specified matching operator
 */
export function evaluateNameMatch(
  text: string | undefined | null,
  operator: CustomViewNameMatchOperator | undefined,
  query: string | undefined | null
): boolean {
  if (!query || !query.trim()) return true;
  const target = (text || '').trim().toLowerCase();
  const q = query.trim().toLowerCase();
  const op = operator || 'contains';

  switch (op) {
    case 'is':
      return target === q;
    case 'is_not':
      return target !== q;
    case 'contains':
      return target.includes(q);
    case 'does_not_contain':
      return !target.includes(q);
    case 'starts_with':
      return target.startsWith(q);
    case 'ends_with':
      return target.endsWith(q);
    default:
      return target.includes(q);
  }
}

/**
 * Checks if a date falls into the specified relative date range
 */
export function evaluateDateRange(dateStr: string | undefined, range: string | undefined): boolean {
  if (!range || range === 'all' || !dateStr) return true;
  const itemTime = new Date(dateStr).getTime();
  if (isNaN(itemTime)) return true;

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  switch (range) {
    case 'today':
      return now - itemTime <= oneDay;
    case '7days':
      return now - itemTime <= 7 * oneDay;
    case '30days':
      return now - itemTime <= 30 * oneDay;
    case '90days':
      return now - itemTime <= 90 * oneDay;
    case 'this_year': {
      const year = new Date().getFullYear();
      return new Date(dateStr).getFullYear() === year;
    }
    default:
      return true;
  }
}

/**
 * Evaluates whether a Company record matches custom view / extended search filters
 */
export function matchesCompanyFilters(
  company: Company,
  filters: CustomViewFilters | undefined,
  users: User[]
): boolean {
  if (!filters) return true;

  // Name match
  if (filters.nameQuery && !evaluateNameMatch(company.name, filters.nameOperator, filters.nameQuery)) {
    return false;
  }

  // Status / Priority
  if (filters.status && filters.status !== 'All') {
    if (filters.status === 'Active') {
      // In CRM companies, non-deleted are active
      if (company.deletedAt) return false;
    } else if (company.priority !== filters.status) {
      return false;
    }
  }

  if (filters.priority && filters.priority !== 'All') {
    if (company.priority !== filters.priority) return false;
  }

  // Industry
  if (filters.industry && filters.industry !== 'All') {
    if (company.industry !== filters.industry) return false;
  }

  // City
  if (filters.city && filters.city.trim()) {
    const cCity = (company.city || '').toLowerCase();
    if (!cCity.includes(filters.city.trim().toLowerCase())) return false;
  }

  // Email
  if (filters.email && filters.email.trim()) {
    const cEmail = (company.email || '').toLowerCase();
    if (!cEmail.includes(filters.email.trim().toLowerCase())) return false;
  }

  // Phone
  if (filters.phone && filters.phone.trim()) {
    const cPhone = (company.phone || '').replace(/\D/g, '');
    const qPhone = filters.phone.trim().replace(/\D/g, '');
    if (!cPhone.includes(qPhone)) return false;
  }

  // Owner
  if (filters.ownerId && filters.ownerId !== 'All') {
    if (company.ownerId !== filters.ownerId) return false;
  }

  // Date Range
  if (filters.dateRange && filters.dateRange !== 'all') {
    if (!evaluateDateRange(company.createdAt, filters.dateRange)) return false;
  }

  return true;
}

/**
 * Evaluates whether a Contact record matches custom view / extended search filters
 */
export function matchesContactFilters(
  contact: Contact,
  filters: CustomViewFilters | undefined,
  companies: Company[],
  users: User[]
): boolean {
  if (!filters) return true;

  const fullName = `${contact.firstName} ${contact.lastName}`;

  // Name match
  if (filters.nameQuery && !evaluateNameMatch(fullName, filters.nameOperator, filters.nameQuery)) {
    return false;
  }

  // Type
  if (filters.type && filters.type !== 'All') {
    if (contact.type !== filters.type) return false;
  }

  // Status (alias for type if mapped)
  if (filters.status && filters.status !== 'All') {
    if (contact.type !== filters.status.toLowerCase()) return false;
  }

  // Email
  if (filters.email && filters.email.trim()) {
    const cEmail = (contact.email || '').toLowerCase();
    if (!cEmail.includes(filters.email.trim().toLowerCase())) return false;
  }

  // Phone
  if (filters.phone && filters.phone.trim()) {
    const cPhone = (contact.phone || contact.mobile || '').replace(/\D/g, '');
    const qPhone = filters.phone.trim().replace(/\D/g, '');
    if (!cPhone.includes(qPhone)) return false;
  }

  // City / Location
  if (filters.city && filters.city.trim()) {
    const cAddr = (contact.mailingAddress || '').toLowerCase();
    if (!cAddr.includes(filters.city.trim().toLowerCase())) return false;
  }

  // Industry (via associated company)
  if (filters.industry && filters.industry !== 'All') {
    const comp = companies.find((cp) => cp.id === contact.companyId);
    if (!comp || comp.industry !== filters.industry) return false;
  }

  // Owner
  if (filters.ownerId && filters.ownerId !== 'All') {
    if (contact.ownerId !== filters.ownerId) return false;
  }

  // Date Range
  if (filters.dateRange && filters.dateRange !== 'all') {
    if (!evaluateDateRange(contact.createdAt, filters.dateRange)) return false;
  }

  return true;
}

/**
 * Evaluates whether a Deal record matches custom view / extended search filters
 */
export function matchesDealFilters(
  deal: Deal,
  filters: CustomViewFilters | undefined,
  companies: Company[],
  users: User[]
): boolean {
  if (!filters) return true;

  // Title match
  if (filters.nameQuery && !evaluateNameMatch(deal.title, filters.nameOperator, filters.nameQuery)) {
    return false;
  }

  // Status
  if (filters.status && filters.status !== 'All') {
    if (deal.status !== filters.status.toLowerCase()) return false;
  }

  // Stage
  if (filters.stage && filters.stage !== 'All') {
    if (deal.stage !== filters.stage) return false;
  }

  // Industry (via associated company)
  if (filters.industry && filters.industry !== 'All') {
    const comp = companies.find((cp) => cp.id === deal.companyId);
    if (!comp || comp.industry !== filters.industry) return false;
  }

  // Owner
  if (filters.ownerId && filters.ownerId !== 'All') {
    if (deal.ownerId !== filters.ownerId) return false;
  }

  // Date Range
  if (filters.dateRange && filters.dateRange !== 'all') {
    if (!evaluateDateRange(deal.createdAt, filters.dateRange)) return false;
  }

  return true;
}
