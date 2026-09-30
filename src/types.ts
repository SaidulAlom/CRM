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
  teamWelcomeText?: string;
  allowTeamSharing?: boolean;
  dataRetentionPolicyDays?: number; // 0 for unlimited, or 30, 90, 180, 365
  enforceAvailabilityChecking?: boolean;
}

export type CRMSkin = 'slate' | 'indigo' | 'emerald' | 'midnight' | 'sunset' | 'nordic';

export type DateFormatOption = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';

export type ProfileVisibility = 'public' | 'manager_only' | 'private';

export interface WorkDaySchedule {
  enabled: boolean;
  start: string; // "09:00"
  end: string; // "17:00"
  breakStart?: string; // "12:30"
  breakEnd?: string; // "13:30"
}

export type WorkDayName =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface UserWorkSchedule {
  timezone?: string;
  monday: WorkDaySchedule;
  tuesday: WorkDaySchedule;
  wednesday: WorkDaySchedule;
  thursday: WorkDaySchedule;
  friday: WorkDaySchedule;
  saturday: WorkDaySchedule;
  sunday: WorkDaySchedule;
}

export interface UserPreferences {
  defaultCurrency: string;
  timeZone: string;
  welcomeText: string;
  clockMode: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  crmSkin?: CRMSkin;
  dateFormat?: DateFormatOption;
  language?: string;
  activityDepth: number; // in days: 7, 30, 90, 180, 365, or 99999 for all
  workingDayStart: string; // e.g. "09:00"
  workingDayEnd: string; // e.g. "17:00"
  workSchedule?: UserWorkSchedule;
  checkSchedulesAgainstAvailability?: boolean;
  profileVisibility?: ProfileVisibility;
  shareWorkSchedule?: boolean;
  shareContactDetails?: boolean;
  allowDirectMessaging?: boolean;
}

export type UserStatus = 'Available' | 'In a Meeting' | 'On Call' | 'Away' | 'Out of Office' | 'Busy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  team?: string;
  jobTitle?: string;
  regionId?: string;
  avatar?: string;
  active: boolean;
  preferences: UserPreferences;
  unavailableDates: string[]; // YYYY-MM-DD
  phone?: string;
  mobile?: string;
  welcomeMessage?: string;
  status?: UserStatus;
  statusMessage?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  joinedDate?: string;
  managerId?: string;
  lastActive?: string;
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

export type MeetingStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type MeetingLocationType = 'office' | 'online' | 'custom';

export type EventType =
  | 'Meeting'
  | 'Appointment'
  | 'Call'
  | 'Task'
  | 'Follow-up'
  | 'Customer Visit'
  | 'Sales Meeting'
  | 'Internal Meeting'
  | 'Training'
  | 'Other';

export type ConfirmationStatus = 'Confirmed' | 'Pending' | 'Not Confirmed' | 'Cancelled';

export interface EventAttachment {
  name: string;
  url?: string;
  size?: string;
}

export interface UserAvailabilityResult {
  available: boolean;
  status: 'free' | 'busy' | 'unavailable';
  reason?: string;
  conflictingEvent?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
  };
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
  dealId?: string;
  caseId?: string;
  leadId?: string;
  location?: string;
  locationType?: MeetingLocationType;
  meetingLink?: string;
  directions?: string;
  notes?: string;
  agenda?: string;
  emailAlert: boolean;
  ownerId: string;
  isMeeting?: boolean;
  eventType?: EventType | string;
  confirmationStatus?: ConfirmationStatus;
  meetingStatus?: MeetingStatus;
  meetingOutcome?: string;
  outcomeNotes?: string;
  attachments?: EventAttachment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  title: string;
  agenda: string;
  durationMinutes: number;
  locationType?: MeetingLocationType;
  location?: string;
  meetingLink?: string;
  reminderMinutes?: number;
  category: 'team' | 'sales' | 'engineering' | 'leadership' | 'client' | 'custom';
  description?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface CRMNotification {
  id: string;
  userId: string;
  type: 'meeting_invite' | 'meeting_update' | 'meeting_cancelled' | 'meeting_rescheduled' | 'meeting_reminder' | 'call_reminder' | 'task_alert';
  title: string;
  message: string;
  meetingId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
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

export type CallStatus =
  | 'Pending'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'No Answer'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Overdue';

export type CallPriority = 'High' | 'Medium' | 'Low';

export interface Call {
  id: string;
  subject: string;
  callPurpose?: string; // Purpose or intent of the call
  priority?: CallPriority; // Priority: High, Medium, Low
  status?: CallStatus; // Current call status
  dueDate?: string; // Due date for calls to be made
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number; // Call duration scheduled (e.g. 15, 30, 45, 60 mins)
  timeZone?: string; // Time zone for the call
  reminderMinutes?: number; // Reminder notification in minutes prior to call
  direction: 'inbound' | 'outbound';
  outcomeStatus: string;
  outcomeNotes?: string;
  followUpDate?: string;
  nextAction?: string;
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

export type TargetType =
  | 'revenue'
  | 'units_sold'
  | 'deals_closed'
  | 'cases_resolved'
  | 'new_customers'
  | 'custom_kpi';

export type TargetPeriod = 'month' | 'quarter' | 'year' | 'custom';

export type TargetPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TargetStatus =
  | 'Draft'
  | 'Upcoming'
  | 'Active'
  | 'On Track'
  | 'At Risk'
  | 'Completed'
  | 'Expired'
  | 'Cancelled';

export interface TargetHistoryItem {
  id: string;
  targetId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action:
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'value_changed'
    | 'members_changed'
    | 'achievement_overridden'
    | 'completed'
    | 'notification_sent';
  details: string;
  oldValue?: string | number;
  newValue?: string | number;
}

export interface TargetNotificationsConfig {
  onAssignment: boolean;
  onMilestone: boolean;
  onApproachingDeadline: boolean;
  onFallingBehind: boolean;
}

export interface Target {
  id: string;
  name: string;
  description?: string;
  type: TargetType;
  customKpiName?: string;
  customKpiUnit?: string;
  goalValue: number;
  period: TargetPeriod;
  startDate: string;
  endDate: string;
  assignedUserIds: string[];
  department?: string;
  priority?: TargetPriority;
  status?: TargetStatus;
  manualAchievement?: number;
  manualOverrideStatus?: boolean;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  history?: TargetHistoryItem[];
  notificationsConfig?: TargetNotificationsConfig;
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

export interface DocumentAttachment {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  version?: string;
  folderId?: string;
}

export interface MessageReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  attachedDocuments?: DocumentAttachment[];
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
  attachedDocuments?: DocumentAttachment[];
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
  attachedDocuments?: DocumentAttachment[];
}

export type ResourceType = 'hyperlink' | 'text' | 'document' | 'quicklink';
export type ResourceVisibility = 'everyone' | 'team' | 'private';

export interface SharedResource {
  id: string;
  title: string;
  type: ResourceType | 'link' | 'note';
  description?: string;
  url?: string;
  body?: string;
  content?: string;
  category: string;
  tags?: string[];
  visibility: ResourceVisibility;
  isPinned?: boolean;
  isFavorite?: boolean;
  createdBy: string;
  createdById?: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  viewsCount?: number;
  lastAccessedAt?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  documentVersion?: string;
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

// ---------------------------------------------------------
// Contact Import, CRM Migration & Data Export Types
// ---------------------------------------------------------

export type ImportSourceApp =
  | 'outlook'
  | 'palm'
  | 'act'
  | 'goldmine'
  | 'salesforce_contacts'
  | 'salesforce_leads'
  | 'generic_csv'
  | 'custom';

export type DelimiterType = 'comma' | 'tab' | 'semicolon' | 'pipe' | 'custom';

export type DuplicateHandlingMode = 'skip' | 'update' | 'create_new' | 'ask_user';

export type DuplicateMatchRule = 'email' | 'phone' | 'name_and_company' | 'name_only';

export interface ColumnMappingItem {
  sourceColumn: string;
  targetField: string; // Contact model key (e.g., 'firstName', 'lastName', 'email', 'phone', etc.) or '__ignore__'
  sampleValue?: string;
  isRequired?: boolean;
}

export interface ParsedImportRow {
  rowNumber: number;
  originalValues: Record<string, string>;
  mappedRecord: Partial<Contact>;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateOfName?: string;
  duplicateConflictReason?: string;
  action: 'insert' | 'update' | 'skip' | 'error';
}

export interface ImportPreviewStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  missingRequiredCount: number;
  mappingErrorsCount: number;
}

export interface ImportHistoryRecord {
  id: string;
  filename: string;
  fileSize: number;
  sourceApp: ImportSourceApp | string;
  delimiter: string;
  importedBy: string;
  importedByName: string;
  timestamp: string;
  totalRecords: number;
  successCount: number;
  updatedCount: number;
  duplicateCount: number;
  failedCount: number;
  status: 'Completed' | 'Partially Completed' | 'Failed';
  duplicateHandlingMode: DuplicateHandlingMode;
  errorReport?: {
    rowNumber: number;
    rawText: string;
    errors: string[];
  }[];
}

export type ExportEntityType =
  | 'companies'
  | 'contacts'
  | 'combined'
  | 'deals'
  | 'cases'
  | 'tasks'
  | 'events'
  | 'all';

export type ExportDestination = 'download' | 'browser' | 'excel';

export type ExportDelimiterType = 'comma' | 'tab' | 'semicolon' | 'pipe' | 'custom';

export type ExportEncapsulationType = 'double' | 'single' | 'none' | 'custom';

export type ExportRowSeparatorType = 'crlf' | 'lf' | 'cr';

export interface ExportHistoryRecord {
  id: string;
  entity: ExportEntityType;
  entityLabel?: string;
  filename: string;
  format: 'csv' | 'tab' | 'semicolon' | 'pipe' | 'custom' | 'excel';
  destination: ExportDestination;
  delimiter: string;
  encapsulation: ExportEncapsulationType;
  rowSeparator: ExportRowSeparatorType;
  selectedFields: string[];
  includeHeaders: boolean;
  recordsCount: number;
  exportedBy: string;
  exportedByName: string;
  timestamp: string;
  status: 'Completed' | 'Failed';
  appliedFiltersSummary?: string;
  fileSize?: number;
}


