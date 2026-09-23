export type UserRole = 'admin' | 'manager' | 'standard';

export type SharingPolicy = 'all_shared' | 'private_to_owner' | 'private_visible_to_managers';

export interface Organisation {
  id: string;
  name: string;
  address: string;
  industry: string;
  logoUrl?: string;
  website: string;
  defaultCurrency: string;
  timeZone: string;
  sharingPolicy: SharingPolicy;
}

export interface UserPreferences {
  defaultCurrency: string;
  timeZone: string;
  welcomeText: string;
  clockMode: '12h' | '24h';
  theme: 'light' | 'dark';
  activityDepth: number; // in days
  workingDayStart: string; // e.g. "09:00"
  workingDayEnd: string; // e.g. "17:00"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId?: string;
  avatar?: string;
  active: boolean;
  preferences: UserPreferences;
  unavailableDates: string[]; // YYYY-MM-DD
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  unavailableDates: string[];
}

export interface ExtendedField {
  id: string;
  entity: 'company' | 'contact' | 'event';
  label: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

export interface FieldSets {
  products: string[];
  dealStages: { id: string; name: string; probability: number; color: string }[];
  caseStatuses: string[];
  callOutcomes: string[];
  priorityLevels: string[];
  industries: string[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  annualRevenue?: number;
  employeeCount?: number;
  phone?: string;
  email?: string;
  website?: string;
  billingAddress?: string;
  shippingAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  ownerId: string;
  regionId?: string;
  description?: string;
  isDefault?: boolean;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  messagingHandle?: string;
  mailingAddress?: string;
  shippingAddress?: string;
  ownerId: string;
  companyId?: string;
  type: 'lead' | 'customer' | 'vendor' | 'other';
  description?: string;
  campaignIds?: string[];
  isUnsubscribed?: boolean;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DealHistoryItem {
  timestamp: string;
  actor: string;
  action: string;
  fromStage?: string;
  toStage?: string;
  note?: string;
}

export interface Deal {
  id: string;
  title: string;
  companyId?: string;
  contactId?: string;
  product: string;
  value: number;
  currency: string;
  stage: string;
  status: 'open' | 'won' | 'lost';
  expectedCloseDate: string;
  nextStep?: string;
  ownerId: string;
  description?: string;
  targetId?: string;
  history: DealHistoryItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TaskHistoryItem {
  timestamp: string;
  actor: string;
  oldPercent: number;
  newPercent: number;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Waiting';
  completionPercentage: number;
  assigneeId: string;
  companyId?: string;
  contactId?: string;
  description?: string;
  history: TaskHistoryItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CaseNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Case {
  id: string;
  title: string;
  problemName: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  ownerId: string;
  companyId?: string;
  contactId?: string;
  description?: string;
  closedDate?: string;
  teamMemberIds: string[];
  internalNotes: CaseNote[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  timeZone?: string;
  durationMinutes?: number;
  reminderMinutes?: number;
  callId?: string;
  participantIds: string[];
  confirmed: boolean;
  companyId?: string;
  contactId?: string;
  location?: string;
  directions?: string;
  notes?: string;
  emailAlert: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CallScriptElement {
  id: string;
  type: 'instruction' | 'free_text' | 'yes_no' | 'multiple_choice';
  prompt: string;
  options?: string[];
}

export interface CallScript {
  id: string;
  name: string;
  description: string;
  elements: CallScriptElement[];
  createdAt: string;
}

export interface Call {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number; // Call duration scheduled (e.g. 15, 30, 45, 60 mins)
  timeZone?: string; // Time zone for the call
  reminderMinutes?: number; // Reminder notification in minutes prior to call
  direction: 'inbound' | 'outbound';
  outcomeStatus: string;
  companyId?: string;
  contactId?: string;
  externalName?: string;
  externalPhone?: string;
  assignedUserId: string;
  notes?: string;
  scriptId?: string;
  scriptAnswers?: Record<string, any>;
  durationSeconds?: number;
  scheduledCalendarEventId?: string;
  isScheduled: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Target {
  id: string;
  name: string;
  type: 'units_sold' | 'revenue' | 'cases_resolved';
  goalValue: number;
  period: 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  assignedUserIds: string[];
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
}

export interface DocumentFile {
  id: string;
  title: string;
  description?: string;
  version: string;
  folderId: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  companyId?: string;
  contactId?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'Google Workspace' | 'Microsoft 365' | 'IMAP/SMTP';
  status: 'connected' | 'syncing' | 'error';
  lastSyncedAt: string;
}

export interface EmailMessage {
  id: string;
  accountId: string;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  timestamp: string;
  attachedTo?: {
    type: 'contact' | 'company' | 'case';
    id: string;
    name: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  schedule: 'one-off' | 'recurring';
  templateId: string;
  sendingAccountId: string;
  status: 'draft' | 'scheduled' | 'sent' | 'archived';
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  recipientContactIds: string[];
  sentAt?: string;
  createdAt: string;
}

export interface FormQuestion {
  id: string;
  prompt: string;
  type: 'checkbox' | 'date' | 'time' | 'multiple_choice' | 'free_text' | 'yes_no';
  options?: string[];
  required?: boolean;
}

export interface FormSubmission {
  id: string;
  contactId?: string;
  responderName?: string;
  responderEmail?: string;
  answers: Record<string, any>;
  submittedAt: string;
}

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  questions: FormQuestion[];
  submissions: FormSubmission[];
  isPublic: boolean;
  createdAt: string;
}

export interface MessageReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  replies: MessageReply[];
  targetUserId?: string;
  targetUserName?: string;
  isPrivate?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  text: string;
  createdAt: string;
  read: boolean;
  relatedRecord?: {
    type: 'deal' | 'company' | 'contact' | 'case' | 'call';
    id: string;
    title: string;
  };
}

export interface SharedResource {
  id: string;
  title: string;
  type: 'link' | 'note';
  url?: string;
  body?: string;
  content?: string;
  tags?: string[];
  createdBy: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  timestamp: string;
}

export type CustomViewModule = 'company' | 'contact' | 'lead' | 'customer' | 'deal';

export type CustomViewNameMatchOperator =
  | 'contains'
  | 'is'
  | 'is_not'
  | 'starts_with'
  | 'ends_with'
  | 'does_not_contain';

export interface CustomViewFilters {
  nameOperator?: CustomViewNameMatchOperator;
  nameQuery?: string;
  status?: string;
  priority?: string;
  industry?: string;
  type?: string;
  stage?: string;
  city?: string;
  email?: string;
  phone?: string;
  ownerId?: string;
  dateRange?: 'all' | 'today' | '7days' | '30days' | '90days' | 'this_year';
}

export interface SavedCustomView {
  id: string;
  title: string;
  module: CustomViewModule;
  entity?: 'company' | 'contact';
  columns: string[];
  filters: CustomViewFilters;
  filterKey?: string;
  filterValue?: string;
  userId: string;
  userName?: string;
  isShared: boolean;
  isSystem?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShortlistCategory = 'company' | 'contact' | 'lead' | 'customer' | 'deal' | 'case' | 'task';

export interface ShortlistItem {
  id: string;
  type: 'company' | 'contact' | 'deal' | 'case' | 'task';
  category?: ShortlistCategory;
  title: string;
  subtitle?: string;
  referenceInfo?: string;
  addedAt?: string;
}

export interface SavedShortlist {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  items: ShortlistItem[];
  createdAt: string;
  updatedAt: string;
}


