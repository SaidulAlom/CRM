import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Organisation,
  User,
  UserRole,
  Region,
  ExtendedField,
  FieldSets,
  Company,
  Contact,
  Deal,
  Task,
  Case,
  Event,
  Call,
  CallScript,
  Target,
  Folder,
  DocumentFile,
  EmailAccount,
  EmailMessage,
  EmailTemplate,
  Campaign,
  CustomForm,
  MessageThread,
  MessageReply,
  DirectMessage,
  DocumentAttachment,
  SharedResource,
  AuditLogItem,
  SavedCustomView,
  CustomViewModule,
  CustomViewFilters,
  ShortlistItem,
  ShortlistCategory,
  SavedShortlist,
  CRMNotification,
  UserAvailabilityResult,
  MeetingTemplate,
  ImportHistoryRecord,
  ExportHistoryRecord,
  UserPreferences,
  UserWorkSchedule,
} from '../types';
import { isWithinWorkingHours, DEFAULT_WORK_SCHEDULE } from '../utils/profileUtils';
import {
  initialOrganisation,
  initialUsers,
  initialRegions,
  initialExtendedFields,
  initialFieldSets,
  initialCompanies,
  initialContacts,
  initialDeals,
  initialTasks,
  initialCases,
  initialEvents,
  initialCalls,
  initialCallScripts,
  initialTargets,
  initialFolders,
  initialDocuments,
  initialEmailAccounts,
  initialEmailMessages,
  initialEmailTemplates,
  initialCampaigns,
  initialCustomForms,
  initialMessageThreads,
  initialDirectMessages,
  initialSharedResources,
  defaultResourceCategories,
  initialAuditLogs,
  initialSavedViews,
  initialNotifications,
  initialMeetingTemplates,
  initialImportHistory,
  initialExportHistory,
} from '../mockData';

export type { ShortlistItem, ShortlistCategory, SavedShortlist };

interface CRMContextType {
  // Navigation & View
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isShortlistOpen: boolean;
  setIsShortlistOpen: (open: boolean) => void;
  shortlist: ShortlistItem[];
  toggleShortlist: (item: ShortlistItem) => void;
  removeFromShortlist: (type: string, id: string) => void;
  isItemShortlisted: (type: string, id: string) => boolean;
  clearShortlist: () => void;
  setShortlistItems: (items: ShortlistItem[]) => void;
  savedShortlists: SavedShortlist[];
  activeSavedShortlistId: string | null;
  saveCurrentShortlist: (name: string, ownerId?: string) => SavedShortlist;
  loadSavedShortlist: (shortlistId: string) => void;
  deleteSavedShortlist: (shortlistId: string) => void;
  shortlistOwnerId: string;
  setShortlistOwnerId: (ownerId: string) => void;

  // Active Modals & Consoles
  quickCreateOpen: boolean;
  setQuickCreateOpen: (open: boolean) => void;
  quickCreateType: 'company' | 'contact' | 'lead' | 'deal' | 'task' | 'case' | 'appointment' | 'call' | 'event' | 'note' | null;
  quickCreatePrefillCompanyId: string | null;
  openQuickCreate: (
    type: 'company' | 'contact' | 'lead' | 'deal' | 'task' | 'case' | 'appointment' | 'call' | 'event' | 'note',
    prefillCompanyId?: string
  ) => void;
  closeQuickCreate: () => void;

  recordDetailModal: { type: 'company' | 'contact'; id: string } | null;
  openRecordDetail: (type: 'company' | 'contact', id: string) => void;
  closeRecordDetail: () => void;

  duplicateMergeModal: { contactA: Contact; contactB: Contact } | null;
  openDuplicateMerge: (contactA: Contact, contactB: Contact) => void;
  closeDuplicateMerge: () => void;
  mergeContacts: (winnerId: string, loserId: string, mergedData: Partial<Contact>) => void;

  activeCallConsoleCallId: string | null;
  openCallConsole: (callId: string) => void;
  closeCallConsole: () => void;

  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  firstRunChecklistDismissed: boolean;
  setFirstRunChecklistDismissed: (dismissed: boolean) => void;

  // Current User & Org
  organisation: Organisation;
  updateOrganisation: (org: Partial<Organisation>) => void;
  users: User[];
  currentUserId: string;
  currentUser: User;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateUserPreferences: (userId: string, preferences: Partial<UserPreferences>) => void;
  updateUserWorkSchedule: (userId: string, schedule: UserWorkSchedule) => void;
  toggleUserActive: (id: string) => void;
  purgeAuditLogs: (retentionDays: number) => void;

  // Regions & Availability
  regions: Region[];
  addRegion: (region: Omit<Region, 'id'>) => void;
  updateRegion: (id: string, updates: Partial<Region>) => void;
  addUserLeaveDate: (userId: string, date: string) => void;
  removeUserLeaveDate: (userId: string, date: string) => void;
  checkUserAvailability: (
    userId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ) => UserAvailabilityResult;

  // Fields & Sets
  extendedFields: ExtendedField[];
  addExtendedField: (field: Omit<ExtendedField, 'id'>) => void;
  deleteExtendedField: (id: string) => void;
  fieldSets: FieldSets;
  updateFieldSets: (sets: Partial<FieldSets>) => void;

  // Companies
  companies: Company[];
  filteredCompanies: Company[];
  defaultCompany: Company | undefined;
  setDefaultCompanyId: (companyId: string | null) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  reassignCompanyOwner: (companyId: string, newOwnerId: string, reassignOpenRecords: boolean) => void;

  // Contacts
  contacts: Contact[];
  filteredContacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => { contact: Contact; duplicateOf?: Contact };
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  checkDuplicateContact: (email: string, firstName: string, lastName: string, companyId?: string) => Contact | undefined;
  convertContactToDeal: (contactId: string, dealData: Partial<Deal>) => Deal;

  // Deals
  deals: Deal[];
  filteredDeals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>, note?: string) => void;
  moveDealStage: (dealId: string, newStage: string) => void;
  deleteDeal: (id: string) => void;

  // Tasks
  tasks: Task[];
  filteredTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Task;
  updateTask: (id: string, updates: Partial<Task>, note?: string) => void;
  deleteTask: (id: string) => void;

  // Cases
  cases: Case[];
  filteredCases: Case[];
  addCase: (item: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => Case;
  updateCase: (id: string, updates: Partial<Case>) => void;
  addCaseNote: (caseId: string, text: string) => void;
  deleteCase: (id: string) => void;

  // Events, Meetings & Calendar
  events: Event[];
  filteredEvents: Event[];
  addEvent: (evt: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Meetings Modals & Scheduling System
  createMeetingModalOpen: boolean;
  createMeetingPrefill?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    companyId?: string;
    contactId?: string;
    dealId?: string;
    caseId?: string;
    leadId?: string;
  };
  openCreateMeeting: (prefill?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    companyId?: string;
    contactId?: string;
    dealId?: string;
    caseId?: string;
    leadId?: string;
  }) => void;
  closeCreateMeeting: () => void;

  meetingDetailModalMeeting: Event | null;
  openMeetingDetail: (meeting: Event) => void;
  closeMeetingDetail: () => void;

  editMeetingModalMeeting: Event | null;
  openEditMeeting: (meeting: Event) => void;
  closeEditMeeting: () => void;

  createMeeting: (meetingData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateMeeting: (meetingId: string, updates: Partial<Event>, notifyAttendees?: boolean) => void;
  cancelMeeting: (meetingId: string, reason?: string) => void;
  rescheduleMeeting: (meetingId: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string) => void;
  recordMeetingOutcome: (meetingId: string, outcome: string, notes?: string) => void;
  deleteMeeting: (meetingId: string) => void;
  duplicateMeeting: (meetingId: string) => Event | undefined;

  // Meeting Templates
  meetingTemplates: MeetingTemplate[];
  saveMeetingTemplate: (template: Omit<MeetingTemplate, 'id' | 'createdAt'>, existingId?: string) => MeetingTemplate;
  deleteMeetingTemplate: (id: string) => void;
  resetMeetingTemplates: () => void;

  // In-app Notifications
  notifications: CRMNotification[];
  addNotification: (notif: Omit<CRMNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Calls & Scripts
  calls: Call[];
  filteredCalls: Call[];
  callScripts: CallScript[];
  addCall: (call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>, createContactIfNew?: boolean) => Call;
  updateCall: (id: string, updates: Partial<Call>) => void;
  completeCall: (
    callId: string,
    outcome: string,
    notes?: string,
    followUpDate?: string,
    nextAction?: string
  ) => void;
  rescheduleCall: (callId: string, newDate: string, newTime: string, notes?: string) => void;
  deleteCall: (callId: string) => void;
  completeCallFromConsole: (
    callId: string,
    outcomeStatus: string,
    durationSeconds: number,
    scriptAnswers?: Record<string, any>,
    followUp?: { subject: string; date: string; time: string }
  ) => void;
  addCallScript: (script: Omit<CallScript, 'id' | 'createdAt'>) => void;
  updateCallScript: (id: string, updates: Partial<CallScript>) => void;
  deleteCallScript: (id: string) => void;

  // Targets
  targets: Target[];
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => Target;
  updateTarget: (id: string, updates: Partial<Target>, note?: string) => void;
  deleteTarget: (id: string) => void;
  overrideTargetProgress: (id: string, manualValue: number, status?: Target['status'], note?: string) => void;
  sendTargetReminder: (targetId: string, customMessage?: string) => void;
  resetTargetsToDefault: () => void;

  // Documents & Folders
  folders: Folder[];
  documents: DocumentFile[];
  addFolder: (name: string, description?: string, parentId?: string | null) => void;
  addDocument: (doc: Omit<DocumentFile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteDocument: (id: string) => void;
  totalStorageUsedBytes: number;
  storageQuotaBytes: number;

  // Emails & Campaigns
  emailAccounts: EmailAccount[];
  emailMessages: EmailMessage[];
  emailTemplates: EmailTemplate[];
  campaigns: Campaign[];
  addEmailTemplate: (tmpl: Omit<EmailTemplate, 'id' | 'createdAt'>) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openedCount' | 'clickedCount' | 'bouncedCount'>) => void;
  sendCampaign: (campaignId: string) => void;
  attachEmailToRecord: (messageId: string, type: 'contact' | 'company' | 'case', id: string, name: string) => void;
  unsubscribeContact: (contactId: string) => void;

  // Forms
  customForms: CustomForm[];
  addCustomForm: (form: Omit<CustomForm, 'id' | 'createdAt' | 'submissions'>) => void;
  submitCustomForm: (formId: string, submission: { contactId?: string; responderName?: string; responderEmail?: string; answers: Record<string, any> }) => void;

  // Message Board & Resources
  messageThreads: MessageThread[];
  addMessageThread: (
    title: string,
    content: string,
    targetUserId?: string,
    authorId?: string,
    attachedDocuments?: DocumentAttachment[]
  ) => void;
  replyToMessageThread: (
    threadId: string,
    text: string,
    authorId?: string,
    attachedDocuments?: DocumentAttachment[]
  ) => void;
  directMessages: DirectMessage[];
  sendDirectMessage: (
    recipientId: string,
    text: string,
    senderId?: string,
    relatedRecord?: { type: 'deal' | 'company' | 'contact' | 'case' | 'call'; id: string; title: string },
    attachedDocuments?: DocumentAttachment[]
  ) => void;
  markDirectMessagesAsRead: (otherUserId: string) => void;
  sharedResources: SharedResource[];
  addSharedResource: (resource: Omit<SharedResource, 'id' | 'createdAt' | 'createdBy'>) => SharedResource;
  updateSharedResource: (id: string, updates: Partial<SharedResource>) => void;
  deleteSharedResource: (id: string) => void;
  togglePinResource: (id: string) => void;
  toggleFavoriteResource: (id: string) => void;
  incrementResourceViews: (id: string) => void;
  customResourceCategories: string[];
  addCustomResourceCategory: (category: string) => void;
  deleteCustomResourceCategory: (category: string) => void;

  // Saved Views & Custom Views
  savedViews: SavedCustomView[];
  addSavedView: (view: Omit<SavedCustomView, 'id' | 'createdAt' | 'updatedAt'>) => SavedCustomView;
  updateSavedView: (id: string, updates: Partial<SavedCustomView>) => void;
  deleteSavedView: (id: string) => void;
  duplicateSavedView: (id: string) => SavedCustomView | undefined;
  getViewsForModule: (module: string) => SavedCustomView[];
  userDefaultViews: Record<string, Record<string, string>>;
  setDefaultViewForModule: (module: string, viewId: string | null) => void;
  getDefaultViewForModule: (module: string) => SavedCustomView | undefined;

  // Custom View Modals
  customViewModalOpen: boolean;
  customViewModalModule: CustomViewModule;
  customViewModalEditingView: SavedCustomView | null;
  customViewModalPrefilledFilters?: CustomViewFilters;
  openCreateCustomView: (module: CustomViewModule, prefilledFilters?: CustomViewFilters) => void;
  openEditCustomView: (view: SavedCustomView) => void;
  closeCustomViewModal: () => void;

  manageViewsModalOpen: boolean;
  manageViewsModalModule: CustomViewModule | 'all';
  openManageViews: (module?: CustomViewModule | 'all') => void;
  closeManageViews: () => void;

  // Audit Logs & Utilities
  auditLogs: AuditLogItem[];
  logAudit: (action: string, details: string) => void;

  // Import & Export History
  importHistory: ImportHistoryRecord[];
  exportHistory: ExportHistoryRecord[];
  addImportHistoryRecord: (record: Omit<ImportHistoryRecord, 'id' | 'timestamp'>) => ImportHistoryRecord;
  addExportHistoryRecord: (record: Omit<ExportHistoryRecord, 'id' | 'timestamp'>) => ExportHistoryRecord;
  clearImportHistory: () => void;
  clearExportHistory: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI
  const [activeNav, setActiveNav] = useState<string>('home');
  const [isShortlistOpen, setIsShortlistOpen] = useState<boolean>(false);

  // Per-user shortlist store with localStorage persistence
  const defaultShortlistsByUser: Record<string, ShortlistItem[]> = {
    'user-1': [
      {
        id: 'comp-1',
        type: 'company',
        category: 'company',
        title: 'CloudScale Networks',
        subtitle: 'Telecommunications · Critical Priority',
        referenceInfo: '$18.5M Rev',
        addedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'deal-2',
        type: 'deal',
        category: 'deal',
        title: 'BioVance Diagnostic Platform AI Licensing',
        subtitle: '$245,000 · In Negotiation',
        referenceInfo: 'BioVance Therapeutics',
        addedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'con-1',
        type: 'contact',
        category: 'lead',
        title: 'Marcus Vance',
        subtitle: 'VP of Tech @ CloudScale Networks',
        referenceInfo: 'CloudScale Networks',
        addedAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    'user-2': [
      {
        id: 'comp-2',
        type: 'company',
        category: 'company',
        title: 'BioVance Therapeutics',
        subtitle: 'Biotechnology · High Priority',
        referenceInfo: '$9.2M Rev',
        addedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'deal-1',
        type: 'deal',
        category: 'deal',
        title: 'CloudScale Multi-Region SD-WAN',
        subtitle: '$180,000 · Proposal Delivered',
        referenceInfo: 'CloudScale Networks',
        addedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'con-2',
        type: 'contact',
        category: 'customer',
        title: 'Dr. Evelyn Reed',
        subtitle: 'Chief Medical Officer @ BioVance Therapeutics',
        referenceInfo: 'BioVance Therapeutics',
        addedAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    'user-3': [
      {
        id: 'deal-2',
        type: 'deal',
        category: 'deal',
        title: 'BioVance Diagnostic Platform AI Licensing',
        subtitle: '$245,000 · In Negotiation',
        referenceInfo: 'BioVance Therapeutics',
        addedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'con-2',
        type: 'contact',
        category: 'customer',
        title: 'Dr. Evelyn Reed',
        subtitle: 'Chief Medical Officer @ BioVance Therapeutics',
        referenceInfo: 'BioVance Therapeutics',
        addedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'task-1',
        type: 'task',
        category: 'task',
        title: 'Send revised BAA contract terms to BioVance legal team',
        subtitle: 'Deadline: 2026-09-18 · 70% complete',
        referenceInfo: 'High Priority',
        addedAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
  };

  const [userShortlists, setUserShortlists] = useState<Record<string, ShortlistItem[]>>(() => {
    try {
      const saved = localStorage.getItem('crm_user_shortlists_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved shortlists', e);
    }
    return defaultShortlistsByUser;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_user_shortlists_v2', JSON.stringify(userShortlists));
    } catch (e) {
      console.warn('Failed to save shortlists to localStorage', e);
    }
  }, [userShortlists]);

  // Saved named shortlists
  const defaultSavedShortlists: SavedShortlist[] = [
    {
      id: 'saved-sl-1',
      name: 'Key Enterprise Accounts',
      ownerId: 'user-1',
      ownerName: 'Sarah Jenkins',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-15T14:30:00.000Z',
      items: [
        {
          id: 'comp-1',
          type: 'company',
          category: 'company',
          title: 'CloudScale Networks',
          subtitle: 'Telecommunications · Critical Priority',
          referenceInfo: '$18.5M Rev',
          addedAt: '2026-09-01T10:00:00.000Z',
        },
        {
          id: 'deal-2',
          type: 'deal',
          category: 'deal',
          title: 'BioVance Diagnostic Platform AI Licensing',
          subtitle: '$245,000 · In Negotiation',
          referenceInfo: 'BioVance Therapeutics',
          addedAt: '2026-09-01T10:05:00.000Z',
        },
      ],
    },
    {
      id: 'saved-sl-2',
      name: 'Q3 High Priority Followups',
      ownerId: 'user-1',
      ownerName: 'Sarah Jenkins',
      createdAt: '2026-09-10T09:00:00.000Z',
      updatedAt: '2026-09-16T11:20:00.000Z',
      items: [
        {
          id: 'con-1',
          type: 'contact',
          category: 'lead',
          title: 'Marcus Vance',
          subtitle: 'VP of Tech @ CloudScale Networks',
          referenceInfo: 'CloudScale Networks',
          addedAt: '2026-09-10T09:00:00.000Z',
        },
        {
          id: 'deal-1',
          type: 'deal',
          category: 'deal',
          title: 'Enterprise Core License Expansion',
          subtitle: '$120,000 · Proposal Sent',
          referenceInfo: 'CloudScale Networks',
          addedAt: '2026-09-10T09:15:00.000Z',
        },
      ],
    },
  ];

  const [savedShortlists, setSavedShortlists] = useState<SavedShortlist[]>(() => {
    try {
      const saved = localStorage.getItem('crm_saved_shortlists_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved shortlists store', e);
    }
    return defaultSavedShortlists;
  });

  const [activeSavedShortlistId, setActiveSavedShortlistId] = useState<string | null>('saved-sl-1');
  const [shortlistOwnerId, setShortlistOwnerId] = useState<string>('user-1');

  useEffect(() => {
    try {
      localStorage.setItem('crm_saved_shortlists_v1', JSON.stringify(savedShortlists));
    } catch (e) {
      console.warn('Failed to save named shortlists to localStorage', e);
    }
  }, [savedShortlists]);

  const [quickCreateOpen, setQuickCreateOpen] = useState<boolean>(false);
  const [quickCreateType, setQuickCreateType] = useState<'company' | 'contact' | 'lead' | 'deal' | 'task' | 'case' | 'appointment' | 'call' | 'event' | 'note' | null>(null);
  const [quickCreatePrefillCompanyId, setQuickCreatePrefillCompanyId] = useState<string | null>(null);
  const [recordDetailModal, setRecordDetailModal] = useState<{ type: 'company' | 'contact'; id: string } | null>(null);
  const [duplicateMergeModal, setDuplicateMergeModal] = useState<{ contactA: Contact; contactB: Contact } | null>(null);
  const [activeCallConsoleCallId, setActiveCallConsoleCallId] = useState<string | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);
  const [firstRunChecklistDismissed, setFirstRunChecklistDismissed] = useState<boolean>(false);

  // Meetings Modals State
  const [createMeetingModalOpen, setCreateMeetingModalOpen] = useState<boolean>(false);
  const [createMeetingPrefill, setCreateMeetingPrefill] = useState<{
    date?: string;
    startTime?: string;
    endTime?: string;
    companyId?: string;
    contactId?: string;
    dealId?: string;
    caseId?: string;
    leadId?: string;
  } | undefined>(undefined);
  const [meetingDetailModalMeeting, setMeetingDetailModalMeeting] = useState<Event | null>(null);
  const [editMeetingModalMeeting, setEditMeetingModalMeeting] = useState<Event | null>(null);

  const openCreateMeeting = (prefill?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    companyId?: string;
    contactId?: string;
    dealId?: string;
    caseId?: string;
    leadId?: string;
  }) => {
    setCreateMeetingPrefill(prefill);
    setCreateMeetingModalOpen(true);
  };

  const closeCreateMeeting = () => {
    setCreateMeetingModalOpen(false);
    setCreateMeetingPrefill(undefined);
  };

  const openMeetingDetail = (meeting: Event) => {
    setMeetingDetailModalMeeting(meeting);
  };

  const closeMeetingDetail = () => {
    setMeetingDetailModalMeeting(null);
  };

  const openEditMeeting = (meeting: Event) => {
    setEditMeetingModalMeeting(meeting);
  };

  const closeEditMeeting = () => {
    setEditMeetingModalMeeting(null);
  };

  // In-app Notifications State
  const [notifications, setNotifications] = useState<CRMNotification[]>(() => {
    try {
      const saved = localStorage.getItem('crm_notifications');
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }, [notifications]);

  const addNotification = (notifData: Omit<CRMNotification, 'id' | 'createdAt'>) => {
    const newNotif: CRMNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => (n.userId === currentUserId ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.filter((n) => n.userId !== currentUserId));
  };

  // Meeting Templates State with LocalStorage persistence
  const [meetingTemplates, setMeetingTemplates] = useState<MeetingTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('crm_meeting_templates');
      return saved ? JSON.parse(saved) : initialMeetingTemplates;
    } catch {
      return initialMeetingTemplates;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_meeting_templates', JSON.stringify(meetingTemplates));
    } catch (e) {
      console.warn('Failed to save meeting templates', e);
    }
  }, [meetingTemplates]);

  const saveMeetingTemplate = (
    templateData: Omit<MeetingTemplate, 'id' | 'createdAt'>,
    existingId?: string
  ): MeetingTemplate => {
    let saved: MeetingTemplate;
    if (existingId) {
      saved = {
        ...templateData,
        id: existingId,
        createdAt: new Date().toISOString(),
      };
      setMeetingTemplates((prev) => prev.map((t) => (t.id === existingId ? saved : t)));
    } else {
      saved = {
        ...templateData,
        id: `tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      setMeetingTemplates((prev) => [saved, ...prev]);
    }
    return saved;
  };

  const deleteMeetingTemplate = (id: string) => {
    setMeetingTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const resetMeetingTemplates = () => {
    setMeetingTemplates(initialMeetingTemplates);
    try {
      localStorage.setItem('crm_meeting_templates', JSON.stringify(initialMeetingTemplates));
    } catch (e) {
      console.warn('Failed to reset templates', e);
    }
  };

  // User-specific Default Companies map (userId -> companyId or null)
  const [userDefaultCompanies, setUserDefaultCompanies] = useState<Record<string, string | null>>(() => {
    try {
      const saved = localStorage.getItem('crm_user_default_companies');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load user default companies from localStorage', e);
    }
    return {
      'user-1': 'comp-1', // Default seed for admin
    };
  });

  // Entities
  const [organisation, setOrganisation] = useState<Organisation>(initialOrganisation);
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('crm_users_roster_v4');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialUsers.length) {
          return parsed.map((u) => {
            const initial = initialUsers.find((iu) => iu.id === u.id);
            return {
              ...initial,
              ...u,
              status: u.status || initial?.status || 'Available',
              phone: u.phone || initial?.phone || '+1 (555) 019-2831',
              location: u.location || initial?.location || 'San Francisco, CA (HQ)',
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse users from localStorage', e);
    }
    return initialUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_users_roster_v4', JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users roster', e);
    }
  }, [users]);

  const [currentUserId, setCurrentUserId] = useState<string>('user-1'); // Sarah Jenkins (Admin)
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [extendedFields, setExtendedFields] = useState<ExtendedField[]>(initialExtendedFields);
  const [fieldSets, setFieldSets] = useState<FieldSets>(initialFieldSets);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [callScripts, setCallScripts] = useState<CallScript[]>(initialCallScripts);
  const [targets, setTargets] = useState<Target[]>(() => {
    try {
      const saved = localStorage.getItem('crm_sales_targets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse targets from localStorage', e);
    }
    return initialTargets;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_sales_targets_v3', JSON.stringify(targets));
    } catch (e) {
      console.warn('Failed to save targets to localStorage', e);
    }
  }, [targets]);

  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [documents, setDocuments] = useState<DocumentFile[]>(initialDocuments);
  const [emailAccounts] = useState<EmailAccount[]>(initialEmailAccounts);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>(initialEmailMessages);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [customForms, setCustomForms] = useState<CustomForm[]>(initialCustomForms);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>(initialMessageThreads);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    try {
      const saved = localStorage.getItem('crm_direct_messages_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialDirectMessages;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_direct_messages_v1', JSON.stringify(directMessages));
    } catch {
      // ignore
    }
  }, [directMessages]);

  const [sharedResources, setSharedResources] = useState<SharedResource[]>(() => {
    try {
      const saved = localStorage.getItem('crm_shared_resources_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialSharedResources;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_shared_resources_v2', JSON.stringify(sharedResources));
    } catch {
      // ignore
    }
  }, [sharedResources]);

  const [customResourceCategories, setCustomResourceCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crm_custom_resource_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_custom_resource_categories', JSON.stringify(customResourceCategories));
    } catch {
      // ignore
    }
  }, [customResourceCategories]);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);

  // Import & Export History with LocalStorage Persistence
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('crm_import_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialImportHistory;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_import_history_v1', JSON.stringify(importHistory));
    } catch {
      // ignore
    }
  }, [importHistory]);

  const [exportHistory, setExportHistory] = useState<ExportHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('crm_export_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialExportHistory;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_export_history_v1', JSON.stringify(exportHistory));
    } catch {
      // ignore
    }
  }, [exportHistory]);

  const addImportHistoryRecord = (record: Omit<ImportHistoryRecord, 'id' | 'timestamp'>): ImportHistoryRecord => {
    const newRecord: ImportHistoryRecord = {
      ...record,
      id: `imp-hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setImportHistory((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const addExportHistoryRecord = (record: Omit<ExportHistoryRecord, 'id' | 'timestamp'>): ExportHistoryRecord => {
    const newRecord: ExportHistoryRecord = {
      ...record,
      id: `exp-hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setExportHistory((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const clearImportHistory = () => {
    setImportHistory([]);
    try {
      localStorage.removeItem('crm_import_history_v1');
    } catch {
      // ignore
    }
  };

  const clearExportHistory = () => {
    setExportHistory([]);
    try {
      localStorage.removeItem('crm_export_history_v1');
    } catch {
      // ignore
    }
  };

  // Saved Views with LocalStorage Persistence
  const [savedViews, setSavedViews] = useState<SavedCustomView[]>(() => {
    try {
      const saved = localStorage.getItem('crm_custom_views_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialSavedViews;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_custom_views_v2', JSON.stringify(savedViews));
    } catch (e) {
      console.error('Failed to persist custom views', e);
    }
  }, [savedViews]);

  // User Default Views Mapping: userId -> module -> viewId
  const [userDefaultViews, setUserDefaultViews] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem('crm_user_default_views_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'user-1': {
        company: 'view-comp-all',
        contact: 'view-con-all',
        deal: 'view-deal-pipeline',
      },
      'user-2': {
        company: 'view-comp-all',
        contact: 'view-con-all',
        deal: 'view-deal-pipeline',
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_user_default_views_v1', JSON.stringify(userDefaultViews));
    } catch (e) {
      console.error('Failed to persist user default views', e);
    }
  }, [userDefaultViews]);

  // Custom Views Modals State
  const [customViewModalOpen, setCustomViewModalOpen] = useState<boolean>(false);
  const [customViewModalModule, setCustomViewModalModule] = useState<CustomViewModule>('company');
  const [customViewModalEditingView, setCustomViewModalEditingView] = useState<SavedCustomView | null>(null);
  const [customViewModalPrefilledFilters, setCustomViewModalPrefilledFilters] = useState<CustomViewFilters | undefined>(undefined);

  const [manageViewsModalOpen, setManageViewsModalOpen] = useState<boolean>(false);
  const [manageViewsModalModule, setManageViewsModalModule] = useState<CustomViewModule | 'all'>('all');

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // Synchronize user theme and CRM skin to document root
  useEffect(() => {
    if (!currentUser || !currentUser.preferences) return;
    const theme = currentUser.preferences.theme || 'light';
    const skin = currentUser.preferences.crmSkin || 'slate';
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
    }

    root.setAttribute('data-crm-skin', skin);
  }, [currentUser?.preferences?.theme, currentUser?.preferences?.crmSkin]);

  const defaultCompany = useMemo(() => {
    const userDefaultId = userDefaultCompanies[currentUserId];
    if (userDefaultId === null) {
      return undefined;
    }
    if (userDefaultId) {
      const found = companies.find((c) => c.id === userDefaultId && !c.deletedAt);
      if (found) return found;
    }
    // Fallback if not configured for this user
    return companies.find((c) => c.isDefault && !c.deletedAt);
  }, [companies, userDefaultCompanies, currentUserId]);

  // Synchronize company isDefault flag with active user default company
  useEffect(() => {
    const currentDefaultId = userDefaultCompanies[currentUserId];
    setCompanies((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: currentDefaultId ? c.id === currentDefaultId : false,
      }))
    );
  }, [currentUserId, userDefaultCompanies]);

  // Storage Quotas
  const storageQuotaBytes = 500 * 1024 * 1024; // 500 MB
  const totalStorageUsedBytes = useMemo(() => {
    return documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  }, [documents]);

  // Audit Logger Helper
  const logAudit = (action: string, details: string) => {
    const newItem: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newItem, ...prev]);
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sharing Policy Filter
  const passesSharingPolicy = (ownerId: string | undefined): boolean => {
    if (!ownerId) return true;
    if (organisation.sharingPolicy === 'all_shared') return true;
    if (currentUser.role === 'admin') return true;
    if (organisation.sharingPolicy === 'private_visible_to_managers' && currentUser.role === 'manager') return true;
    return ownerId === currentUser.id;
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => !c.deletedAt && passesSharingPolicy(c.ownerId));
  }, [companies, organisation.sharingPolicy, currentUser]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => !c.deletedAt && passesSharingPolicy(c.ownerId));
  }, [contacts, organisation.sharingPolicy, currentUser]);

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => !d.deletedAt && passesSharingPolicy(d.ownerId));
  }, [deals, organisation.sharingPolicy, currentUser]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => !t.deletedAt && (t.assigneeId === currentUser.id || passesSharingPolicy(t.assigneeId)));
  }, [tasks, organisation.sharingPolicy, currentUser]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => !c.deletedAt && (c.ownerId === currentUser.id || passesSharingPolicy(c.ownerId)));
  }, [cases, organisation.sharingPolicy, currentUser]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) => !e.deletedAt && (e.ownerId === currentUser.id || e.participantIds.includes(currentUser.id) || passesSharingPolicy(e.ownerId))
    );
  }, [events, organisation.sharingPolicy, currentUser]);

  const filteredCalls = useMemo(() => {
    return calls.filter(
      (c) => !c.deletedAt && (c.assignedUserId === currentUser.id || passesSharingPolicy(c.assignedUserId))
    );
  }, [calls, organisation.sharingPolicy, currentUser]);

  // Shortlist helpers & active user list
  const shortlist = useMemo(() => {
    const rawList = userShortlists[currentUserId] || [];
    // Ensure data integrity: filter out any records that are soft-deleted or removed from CRM
    return rawList.filter((item) => {
      if (item.type === 'company') {
        const comp = companies.find((c) => c.id === item.id);
        return comp && !comp.deletedAt;
      }
      if (item.type === 'contact') {
        const cont = contacts.find((c) => c.id === item.id);
        return cont && !cont.deletedAt;
      }
      if (item.type === 'deal') {
        const d = deals.find((dl) => dl.id === item.id);
        return d && !d.deletedAt;
      }
      if (item.type === 'task') {
        const t = tasks.find((tk) => tk.id === item.id);
        return t && !t.deletedAt;
      }
      if (item.type === 'case') {
        const cs = cases.find((c) => c.id === item.id);
        return cs && !cs.deletedAt;
      }
      return true;
    });
  }, [userShortlists, currentUserId, companies, contacts, deals, tasks, cases]);

  const removeItemFromAllShortlists = (type: string, id: string) => {
    setUserShortlists((prev) => {
      const updated: Record<string, ShortlistItem[]> = {};
      let changed = false;
      for (const [userId, items] of Object.entries(prev)) {
        const filtered = items.filter((p) => !(p.type === type && p.id === id));
        if (filtered.length !== items.length) {
          changed = true;
        }
        updated[userId] = filtered;
      }
      return changed ? updated : prev;
    });
  };

  const toggleShortlist = (item: ShortlistItem) => {
    setUserShortlists((prev) => {
      const userList = prev[currentUserId] || [];
      const exists = userList.some((p) => p.type === item.type && p.id === item.id);
      if (exists) {
        logAudit('SHORTLIST_REMOVED', `Removed ${item.type} "${item.title}" from Shortlist`);
        return {
          ...prev,
          [currentUserId]: userList.filter((p) => !(p.type === item.type && p.id === item.id)),
        };
      } else {
        logAudit('SHORTLIST_ADDED', `Added ${item.type} "${item.title}" to Shortlist`);
        const newItem: ShortlistItem = {
          ...item,
          addedAt: item.addedAt || new Date().toISOString(),
        };
        // Prevent duplicate entries
        const filtered = userList.filter((p) => !(p.type === item.type && p.id === item.id));
        return {
          ...prev,
          [currentUserId]: [newItem, ...filtered],
        };
      }
    });
  };

  const removeFromShortlist = (type: string, id: string) => {
    setUserShortlists((prev) => {
      const userList = prev[currentUserId] || [];
      const found = userList.find((p) => p.type === type && p.id === id);
      if (!found) return prev;
      logAudit('SHORTLIST_REMOVED', `Removed ${type} "${found.title}" from Shortlist`);
      return {
        ...prev,
        [currentUserId]: userList.filter((p) => !(p.type === type && p.id === id)),
      };
    });
  };

  const isItemShortlisted = (type: string, id: string) => {
    const userList = userShortlists[currentUserId] || [];
    return userList.some((item) => item.type === type && item.id === id);
  };

  const clearShortlist = () => {
    setUserShortlists((prev) => ({
      ...prev,
      [currentUserId]: [],
    }));
    logAudit('SHORTLIST_CLEARED', `Cleared all items from user shortlist`);
  };

  const setShortlistItems = (items: ShortlistItem[]) => {
    setUserShortlists((prev) => ({
      ...prev,
      [currentUserId]: items,
    }));
  };

  const saveCurrentShortlist = (name: string, ownerId?: string): SavedShortlist => {
    const currentItems = shortlist;
    const targetOwnerId = ownerId || shortlistOwnerId || currentUserId;
    const targetOwner = users.find((u) => u.id === targetOwnerId);
    const newSaved: SavedShortlist = {
      id: `saved-sl-${Date.now()}`,
      name: name.trim() || `Shortlist ${new Date().toLocaleDateString()}`,
      ownerId: targetOwnerId,
      ownerName: targetOwner ? targetOwner.name : 'System User',
      items: [...currentItems],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedShortlists((prev) => [newSaved, ...prev]);
    setActiveSavedShortlistId(newSaved.id);
    logAudit('SHORTLIST_SAVED', `Saved shortlist as "${newSaved.name}" with ${currentItems.length} items`);
    return newSaved;
  };

  const loadSavedShortlist = (shortlistId: string) => {
    const target = savedShortlists.find((sl) => sl.id === shortlistId);
    if (!target) return;
    setUserShortlists((prev) => ({
      ...prev,
      [currentUserId]: [...target.items],
    }));
    setActiveSavedShortlistId(target.id);
    if (target.ownerId) {
      setShortlistOwnerId(target.ownerId);
    }
    logAudit('SHORTLIST_LOADED', `Loaded saved shortlist "${target.name}" (${target.items.length} items)`);
  };

  const deleteSavedShortlist = (shortlistId: string) => {
    const target = savedShortlists.find((sl) => sl.id === shortlistId);
    setSavedShortlists((prev) => prev.filter((sl) => sl.id !== shortlistId));
    if (activeSavedShortlistId === shortlistId) {
      setActiveSavedShortlistId(null);
    }
    if (target) {
      logAudit('SHORTLIST_DELETED', `Deleted saved shortlist "${target.name}"`);
    }
  };

  // Quick Create helpers
  const openQuickCreate = (
    type: 'company' | 'contact' | 'lead' | 'deal' | 'task' | 'case' | 'appointment' | 'call' | 'event' | 'note',
    prefillCompanyId?: string
  ) => {
    setQuickCreateType(type);
    setQuickCreatePrefillCompanyId(prefillCompanyId ?? null);
    setQuickCreateOpen(true);
  };

  const closeQuickCreate = () => {
    setQuickCreateOpen(false);
    setQuickCreateType(null);
    setQuickCreatePrefillCompanyId(null);
  };

  const openRecordDetail = (type: 'company' | 'contact', id: string) => {
    setRecordDetailModal({ type, id });
  };

  const closeRecordDetail = () => {
    setRecordDetailModal(null);
  };

  const openDuplicateMerge = (contactA: Contact, contactB: Contact) => {
    setDuplicateMergeModal({ contactA, contactB });
  };

  const closeDuplicateMerge = () => {
    setDuplicateMergeModal(null);
  };

  const openCallConsole = (callId: string) => {
    setActiveCallConsoleCallId(callId);
  };

  const closeCallConsole = () => {
    setActiveCallConsoleCallId(null);
  };

  // User & Org management
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      logAudit('SWITCH_USER', `Switched active session to ${target.name} (${target.role})`);
    }
  };

  const updateOrganisation = (orgUpdates: Partial<Organisation>) => {
    setOrganisation((prev) => {
      const updated = { ...prev, ...orgUpdates };
      logAudit('ORGANISATION_UPDATE', `Updated organisation profile: ${Object.keys(orgUpdates).join(', ')}`);
      return updated;
    });
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('USER_CREATED', `Added new user ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    let updatedUserName = id;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          updatedUserName = updates.name || u.name;
          return { ...u, ...updates };
        }
        return u;
      })
    );
    const changedFields = Object.keys(updates).filter((k) => k !== 'preferences');
    logAudit(
      'USER_UPDATED',
      `Updated profile for ${updatedUserName} (${changedFields.join(', ') || 'details'}) by ${currentUser.name}`
    );
  };

  const toggleUserActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextActive = !u.active;
          logAudit('USER_STATUS_CHANGE', `${nextActive ? 'Reactivated' : 'Deactivated'} user ${u.name}`);
          return { ...u, active: nextActive };
        }
        return u;
      })
    );
  };

  const updateUserPreferences = (userId: string, prefs: Partial<UserPreferences>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            preferences: {
              ...u.preferences,
              ...prefs,
            },
          };
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === userId);
    logAudit(
      'USER_PREFERENCES_UPDATED',
      `Updated user preferences for ${target?.name || userId}: ${Object.keys(prefs).join(', ')}`
    );
  };

  const updateUserWorkSchedule = (userId: string, schedule: UserWorkSchedule) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            preferences: {
              ...u.preferences,
              workSchedule: schedule,
            },
          };
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === userId);
    logAudit(
      'WORK_SCHEDULE_UPDATED',
      `Updated weekly working hours and schedule for ${target?.name || userId}`
    );
  };

  const purgeAuditLogs = (retentionDays: number) => {
    if (retentionDays <= 0) return;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    setAuditLogs((prev) => prev.filter((log) => log.timestamp >= cutoffDate));
    logAudit('AUDIT_LOGS_PURGED', `Purged audit history older than ${retentionDays} days per retention policy`);
  };

  // Regions & Availability
  const addRegion = (regionData: Omit<Region, 'id'>) => {
    const newReg: Region = {
      ...regionData,
      id: `reg-${Date.now()}`,
    };
    setRegions((prev) => [...prev, newReg]);
    logAudit('REGION_CREATED', `Created region ${newReg.name} (${newReg.code})`);
  };

  const updateRegion = (id: string, updates: Partial<Region>) => {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const addUserLeaveDate = (userId: string, date: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (!u.unavailableDates.includes(date)) {
            return { ...u, unavailableDates: [...u.unavailableDates, date] };
          }
        }
        return u;
      })
    );
  };

  const removeUserLeaveDate = (userId: string, date: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, unavailableDates: u.unavailableDates.filter((d) => d !== date) };
        }
        return u;
      })
    );
  };

  const checkUserAvailability = (
    userId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): UserAvailabilityResult => {
    const user = users.find((u) => u.id === userId);
    if (!user) return { available: false, status: 'unavailable', reason: 'User not found' };

    // Check personal leave
    if (user.unavailableDates?.includes(date)) {
      return { available: false, status: 'unavailable', reason: `${user.name} is on scheduled leave` };
    }

    // Check region holidays
    if (user.regionId) {
      const region = regions.find((r) => r.id === user.regionId);
      if (region?.unavailableDates?.includes(date)) {
        return { available: false, status: 'unavailable', reason: `Regional holiday in ${region.name}` };
      }
    }

    // Check normal working hours & schedule if availability check enabled
    const enforce = organisation.enforceAvailabilityChecking || user.preferences?.checkSchedulesAgainstAvailability !== false;
    if (enforce && user.preferences) {
      const workCheck = isWithinWorkingHours(date, startTime, endTime, user);
      if (!workCheck.withinHours) {
        return {
          available: false,
          status: 'unavailable',
          reason: workCheck.reason || `${user.name} is outside normal working hours`,
        };
      }
    }

    // Check overlapping events
    const conflictingEvent = events.find((evt) => {
      if (evt.deletedAt) return false;
      if (evt.meetingStatus === 'Cancelled') return false;
      if (excludeEventId && evt.id === excludeEventId) return false;
      if (evt.startDate !== date) return false;
      if (!evt.participantIds.includes(userId) && evt.ownerId !== userId) return false;
      // Overlap condition: start < otherEnd and end > otherStart
      return startTime < evt.endTime && endTime > evt.startTime;
    });

    if (conflictingEvent) {
      return {
        available: false,
        status: 'busy',
        reason: `Conflict: ${conflictingEvent.title} (${conflictingEvent.startTime} – ${conflictingEvent.endTime})`,
        conflictingEvent: {
          id: conflictingEvent.id,
          title: conflictingEvent.title,
          startTime: conflictingEvent.startTime,
          endTime: conflictingEvent.endTime,
          date: conflictingEvent.startDate,
        },
      };
    }

    return { available: true, status: 'free', reason: 'No conflicting events found.' };
  };

  // Extended Fields
  const addExtendedField = (field: Omit<ExtendedField, 'id'>) => {
    const newField: ExtendedField = {
      ...field,
      id: `ef-${Date.now()}`,
    };
    setExtendedFields((prev) => [...prev, newField]);
    logAudit('EXTENDED_FIELD_ADDED', `Added custom field "${newField.label}" to ${newField.entity}`);
  };

  const deleteExtendedField = (id: string) => {
    setExtendedFields((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFieldSets = (newSets: Partial<FieldSets>) => {
    setFieldSets((prev) => ({ ...prev, ...newSets }));
    logAudit('FIELD_SETS_UPDATED', `Updated selectable field set values`);
  };

  // Companies
  const setDefaultCompanyId = (companyId: string | null) => {
    setUserDefaultCompanies((prev) => {
      const updated = {
        ...prev,
        [currentUserId]: companyId,
      };
      try {
        localStorage.setItem('crm_user_default_companies', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save user default companies to localStorage', e);
      }
      return updated;
    });

    setCompanies((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: companyId ? c.id === companyId : false,
      }))
    );

    if (companyId) {
      const comp = companies.find((c) => c.id === companyId);
      logAudit('DEFAULT_COMPANY_SET', `Set ${comp?.name || companyId} as active default company for ${currentUser.name}`);
    } else {
      logAudit('DEFAULT_COMPANY_CLEARED', `Cleared default company for ${currentUser.name}`);
    }
  };

  const addCompany = (compData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newComp: Company = {
      ...compData,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newComp, ...prev]);
    logAudit('COMPANY_CREATED', `Created company record: ${newComp.name}`);
    return newComp;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('COMPANY_UPDATED', `Updated company record ${id}`);
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
    );
    removeItemFromAllShortlists('company', id);
    logAudit('COMPANY_DELETED', `Soft deleted company ID ${id} (30-day recovery window)`);
  };

  const reassignCompanyOwner = (companyId: string, newOwnerId: string, reassignOpenRecords: boolean) => {
    const newOwner = users.find((u) => u.id === newOwnerId);
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, ownerId: newOwnerId, updatedAt: new Date().toISOString() } : c))
    );

    if (reassignOpenRecords) {
      setDeals((prev) =>
        prev.map((d) => (d.companyId === companyId && d.status === 'open' ? { ...d, ownerId: newOwnerId } : d))
      );
      setTasks((prev) =>
        prev.map((t) => (t.companyId === companyId && t.status !== 'Completed' ? { ...t, assigneeId: newOwnerId } : t))
      );
      setCases((prev) =>
        prev.map((c) => (c.companyId === companyId && c.status !== 'Closed' ? { ...c, ownerId: newOwnerId } : c))
      );
    }

    logAudit(
      'COMPANY_REASSIGNED',
      `Reassigned company ${companyId} to ${newOwner?.name || newOwnerId} (cascade open records: ${reassignOpenRecords})`
    );
  };

  // Contacts
  const checkDuplicateContact = (email: string, firstName: string, lastName: string, companyId?: string): Contact | undefined => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = `${firstName} ${lastName}`.trim().toLowerCase();

    return contacts.find((c) => {
      if (c.deletedAt) return false;
      // 1. Email match
      if (cleanEmail && c.email.trim().toLowerCase() === cleanEmail) return true;
      // 2. Name + Company match
      const cName = `${c.firstName} ${c.lastName}`.trim().toLowerCase();
      if (companyId && c.companyId === companyId && cName === cleanName) return true;
      return false;
    });
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const duplicate = checkDuplicateContact(contactData.email, contactData.firstName, contactData.lastName, contactData.companyId);

    const newContact: Contact = {
      ...contactData,
      id: `con-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
    logAudit('CONTACT_CREATED', `Added contact ${newContact.firstName} ${newContact.lastName} (${newContact.email})`);
    return { contact: newContact, duplicateOf: duplicate };
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('CONTACT_UPDATED', `Updated contact record ${id}`);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c))
    );
    removeItemFromAllShortlists('contact', id);
    logAudit('CONTACT_DELETED', `Soft deleted contact ID ${id}`);
  };

  const mergeContacts = (winnerId: string, loserId: string, mergedData: Partial<Contact>) => {
    setContacts((prev) =>
      prev
        .map((c) => {
          if (c.id === winnerId) {
            return { ...c, ...mergedData, updatedAt: new Date().toISOString() };
          }
          if (c.id === loserId) {
            return { ...c, deletedAt: new Date().toISOString() };
          }
          return c;
        })
    );
    removeItemFromAllShortlists('contact', loserId);

    // Re-link related deals, tasks, calls to winnerId
    setDeals((prev) => prev.map((d) => (d.contactId === loserId ? { ...d, contactId: winnerId } : d)));
    setTasks((prev) => prev.map((t) => (t.contactId === loserId ? { ...t, contactId: winnerId } : t)));
    setCalls((prev) => prev.map((c) => (c.contactId === loserId ? { ...c, contactId: winnerId } : c)));
    setEvents((prev) => prev.map((e) => (e.contactId === loserId ? { ...e, contactId: winnerId } : e)));

    logAudit('CONTACT_MERGED', `Merged contact ${loserId} into primary record ${winnerId}`);
    closeDuplicateMerge();
  };

  const convertContactToDeal = (contactId: string, dealData: Partial<Deal>): Deal => {
    const contact = contacts.find((c) => c.id === contactId);
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: dealData.title || `Deal for ${contact ? `${contact.firstName} ${contact.lastName}` : 'Contact'}`,
      companyId: contact?.companyId || dealData.companyId,
      contactId: contactId,
      product: dealData.product || fieldSets.products[0],
      value: dealData.value || 50000,
      currency: dealData.currency || organisation.defaultCurrency,
      stage: dealData.stage || 'lead',
      status: 'open',
      expectedCloseDate: dealData.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextStep: dealData.nextStep || 'Follow up with introductory discovery call',
      ownerId: dealData.ownerId || currentUser.id,
      description: dealData.description || `Converted from contact ${contact?.firstName} ${contact?.lastName}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          action: `Created deal converted from contact ${contact?.firstName} ${contact?.lastName}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeals((prev) => [newDeal, ...prev]);
    logAudit('CONTACT_CONVERTED_TO_DEAL', `Converted contact ${contactId} to deal "${newDeal.title}"`);
    return newDeal;
  };

  // Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          action: 'Deal created in pipeline',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    logAudit('DEAL_CREATED', `Created deal "${newDeal.title}" with value ${newDeal.currency} ${newDeal.value.toLocaleString()}`);
    return newDeal;
  };

  const updateDeal = (id: string, updates: Partial<Deal>, note?: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newHistory = [...d.history];
          if (updates.stage && updates.stage !== d.stage) {
            newHistory.unshift({
              timestamp: new Date().toISOString(),
              actor: currentUser.name,
              action: `Changed stage from ${d.stage} to ${updates.stage}`,
              fromStage: d.stage,
              toStage: updates.stage,
              note,
            });
          } else if (note) {
            newHistory.unshift({
              timestamp: new Date().toISOString(),
              actor: currentUser.name,
              action: 'Deal updated',
              note,
            });
          }
          return { ...d, ...updates, history: newHistory, updatedAt: new Date().toISOString() };
        }
        return d;
      })
    );
    logAudit('DEAL_UPDATED', `Updated deal ${id}`);
  };

  const moveDealStage = (dealId: string, newStage: string) => {
    updateDeal(dealId, {
      stage: newStage,
      status: newStage === 'won' ? 'won' : newStage === 'lost' ? 'lost' : 'open',
    });
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d)));
    removeItemFromAllShortlists('deal', id);
    logAudit('DEAL_DELETED', `Soft deleted deal ID ${id}`);
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          actor: currentUser.name,
          oldPercent: 0,
          newPercent: taskData.completionPercentage || 0,
          oldStatus: 'Not Started',
          newStatus: taskData.status || 'Not Started',
          note: 'Task initialized',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logAudit('TASK_CREATED', `Created task "${newTask.title}"`);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>, note?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newHistory = [...t.history];
          const hasPercentChange = updates.completionPercentage !== undefined && updates.completionPercentage !== t.completionPercentage;
          const hasStatusChange = updates.status !== undefined && updates.status !== t.status;

          if (hasPercentChange || hasStatusChange || note) {
            newHistory.unshift({
              timestamp: new Date().toISOString(),
              actor: currentUser.name,
              oldPercent: t.completionPercentage,
              newPercent: updates.completionPercentage !== undefined ? updates.completionPercentage : t.completionPercentage,
              oldStatus: t.status,
              newStatus: updates.status || t.status,
              note: note || (hasPercentChange ? `Progress updated to ${updates.completionPercentage}%` : undefined),
            });
          }
          return { ...t, ...updates, history: newHistory, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
    logAudit('TASK_UPDATED', `Updated task ${id}`);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t)));
    removeItemFromAllShortlists('task', id);
    logAudit('TASK_DELETED', `Soft deleted task ID ${id}`);
  };

  // Cases
  const addCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => {
    const newCase: Case = {
      ...caseData,
      id: `case-${Date.now()}`,
      internalNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCases((prev) => [newCase, ...prev]);
    logAudit('CASE_CREATED', `Opened customer support case "${newCase.title}"`);
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('CASE_UPDATED', `Updated case ${id}`);
  };

  const addCaseNote = (caseId: string, text: string) => {
    const newNote = {
      id: `cn-${Date.now()}`,
      author: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, internalNotes: [newNote, ...c.internalNotes], updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteCase = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c)));
    removeItemFromAllShortlists('case', id);
    logAudit('CASE_DELETED', `Soft deleted case ID ${id}`);
  };

  // Events & Calendar
  const addEvent = (evtData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvt: Event = {
      ...evtData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvt, ...prev]);
    logAudit('EVENT_SCHEDULED', `Scheduled event "${newEvt.title}" on ${newEvt.startDate}`);
    return newEvt;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e)));
    logAudit('EVENT_CANCELLED', `Cancelled calendar event ID ${id}`);
  };

  // Meetings System (Create, Update, Reschedule, Cancel, Outcomes)
  const createMeeting = (meetingData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event => {
    const newEvt: Event = {
      ...meetingData,
      id: `mtg-${Date.now()}`,
      isMeeting: true,
      meetingStatus: meetingData.meetingStatus || 'Scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvt, ...prev]);
    logAudit('MEETING_CREATED', `Scheduled meeting "${newEvt.title}" on ${newEvt.startDate} at ${newEvt.startTime}`);

    // Send in-app notifications to all attendees and organizer
    const organizer = users.find((u) => u.id === newEvt.ownerId) || currentUser;
    const allParticipants = Array.from(new Set([...newEvt.participantIds, newEvt.ownerId]));

    allParticipants.forEach((userId) => {
      const isOrganizer = userId === newEvt.ownerId;
      addNotification({
        userId,
        type: 'meeting_invite',
        title: isOrganizer ? 'Meeting Scheduled' : 'New Meeting Invitation',
        message: isOrganizer
          ? `You scheduled "${newEvt.title}" for ${newEvt.startDate} at ${newEvt.startTime}`
          : `${organizer.name} scheduled "${newEvt.title}" for ${newEvt.startDate} at ${newEvt.startTime}`,
        meetingId: newEvt.id,
        read: false,
      });
    });

    // Schedule reminder notification if reminderMinutes configured
    if (newEvt.reminderMinutes) {
      allParticipants.forEach((userId) => {
        addNotification({
          userId,
          type: 'meeting_reminder',
          title: `Meeting Reminder: ${newEvt.title}`,
          message: `Starts in ${newEvt.reminderMinutes} minutes on ${newEvt.startDate} at ${newEvt.startTime}`,
          meetingId: newEvt.id,
          read: false,
        });
      });
    }

    return newEvt;
  };

  const updateMeeting = (meetingId: string, updates: Partial<Event>, notifyAttendees: boolean = true) => {
    let updatedMeeting: Event | undefined;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === meetingId) {
          updatedMeeting = { ...e, ...updates, updatedAt: new Date().toISOString() };
          return updatedMeeting;
        }
        return e;
      })
    );

    if (updatedMeeting && notifyAttendees) {
      const isRescheduled = updates.startDate !== undefined || updates.startTime !== undefined || updates.endTime !== undefined;
      const allParticipants = Array.from(new Set([...(updatedMeeting.participantIds || []), updatedMeeting.ownerId]));

      allParticipants.forEach((userId) => {
        addNotification({
          userId,
          type: isRescheduled ? 'meeting_rescheduled' : 'meeting_update',
          title: isRescheduled ? 'Meeting Rescheduled' : 'Meeting Details Updated',
          message: isRescheduled
            ? `"${updatedMeeting?.title}" was moved to ${updatedMeeting?.startDate} at ${updatedMeeting?.startTime}`
            : `Details for meeting "${updatedMeeting?.title}" have been updated`,
          meetingId,
          read: false,
        });
      });

      logAudit('MEETING_UPDATED', `Updated meeting "${updatedMeeting.title}"`);
    }
  };

  const cancelMeeting = (meetingId: string, reason?: string) => {
    let targetMeeting: Event | undefined;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === meetingId) {
          const updatedNotes = reason ? `${e.notes ? e.notes + '\n\n' : ''}Cancellation Reason: ${reason}` : e.notes;
          targetMeeting = {
            ...e,
            meetingStatus: 'Cancelled',
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
          };
          return targetMeeting;
        }
        return e;
      })
    );

    if (targetMeeting) {
      const allParticipants = Array.from(new Set([...(targetMeeting.participantIds || []), targetMeeting.ownerId]));
      allParticipants.forEach((userId) => {
        addNotification({
          userId,
          type: 'meeting_cancelled',
          title: 'Meeting Cancelled',
          message: `"${targetMeeting?.title}" on ${targetMeeting?.startDate} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
          meetingId,
          read: false,
        });
      });
      logAudit('MEETING_CANCELLED', `Cancelled meeting "${targetMeeting.title}". Reason: ${reason || 'None provided'}`);
    }
  };

  const rescheduleMeeting = (meetingId: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string) => {
    updateMeeting(
      meetingId,
      {
        startDate: newDate,
        endDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        meetingStatus: 'Rescheduled',
        notes: reason ? `Rescheduled Note: ${reason}` : undefined,
      },
      true
    );
  };

  const recordMeetingOutcome = (meetingId: string, outcome: string, notes?: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === meetingId) {
          return {
            ...e,
            meetingOutcome: outcome,
            outcomeNotes: notes,
            meetingStatus: 'Completed',
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
    logAudit('MEETING_OUTCOME_RECORDED', `Recorded outcome for meeting ${meetingId}: ${outcome}`);
  };

  const deleteMeeting = (meetingId: string) => {
    deleteEvent(meetingId);
  };

  const duplicateMeeting = (meetingId: string): Event | undefined => {
    const existing = events.find((e) => e.id === meetingId);
    if (!existing) return undefined;
    const { id, createdAt, updatedAt, ...rest } = existing;
    return createMeeting({
      ...rest,
      title: `${rest.title} (Copy)`,
    });
  };

  // Calls
  const addCall = (callData: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>, createContactIfNew?: boolean) => {
    let linkedContactId = callData.contactId;

    if (createContactIfNew && callData.externalName && !linkedContactId) {
      const parts = callData.externalName.trim().split(' ');
      const firstName = parts[0] || 'Contact';
      const lastName = parts.slice(1).join(' ') || 'Lead';
      const newContact = addContact({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: callData.externalPhone || '',
        ownerId: currentUser.id,
        companyId: callData.companyId,
        type: 'lead',
        description: `Created automatically from logged call: ${callData.subject}`,
      });
      linkedContactId = newContact.contact.id;
    }

    const newCall: Call = {
      ...callData,
      contactId: linkedContactId,
      id: `call-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If scheduled as calendar event
    if (callData.isScheduled) {
      const eventTime = callData.time || '10:00';
      const duration = callData.durationMinutes || 30;
      const [h, m] = eventTime.split(':').map((val) => Number(val) || 0);
      const totalMinutes = h * 60 + m + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const createdEvent = addEvent({
        title: `Call: ${callData.subject}`,
        startDate: callData.date,
        startTime: eventTime,
        endDate: callData.date,
        endTime,
        timeZone: callData.timeZone || 'UTC',
        durationMinutes: duration,
        reminderMinutes: callData.reminderMinutes || 15,
        callId: newCall.id,
        participantIds: [callData.assignedUserId],
        confirmed: true,
        companyId: callData.companyId,
        contactId: linkedContactId,
        notes: callData.notes,
        emailAlert: true,
        ownerId: currentUser.id,
      });
      newCall.scheduledCalendarEventId = createdEvent.id;
    }

    setCalls((prev) => [newCall, ...prev]);
    logAudit('CALL_LOGGED', `Scheduled/logged call "${newCall.subject}" (Direction: ${newCall.direction})`);
    return newCall;
  };

  const updateCall = (id: string, updates: Partial<Call>) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const completeCallFromConsole = (
    callId: string,
    outcomeStatus: string,
    durationSeconds: number,
    scriptAnswers?: Record<string, any>,
    followUp?: { subject: string; date: string; time: string }
  ) => {
    const existing = calls.find((c) => c.id === callId);
    updateCall(callId, {
      outcomeStatus,
      durationSeconds,
      scriptAnswers,
      isCompleted: true,
    });

    if (followUp && followUp.subject && followUp.date) {
      addCall({
        subject: followUp.subject,
        date: followUp.date,
        time: followUp.time || '14:00',
        direction: 'outbound',
        outcomeStatus: 'Pending',
        companyId: existing?.companyId,
        contactId: existing?.contactId,
        assignedUserId: existing?.assignedUserId || currentUser.id,
        notes: `Follow-up call scheduled after completing: ${existing?.subject}`,
        scriptId: existing?.scriptId,
        isScheduled: true,
        isCompleted: false,
      });
    }

    logAudit('CALL_COMPLETED_CONSOLE', `Completed call session for "${existing?.subject}" with outcome "${outcomeStatus}"`);
    closeCallConsole();
  };

  const completeCall = (
    callId: string,
    outcome: string,
    notes?: string,
    followUpDate?: string,
    nextAction?: string
  ) => {
    const existing = calls.find((c) => c.id === callId);
    updateCall(callId, {
      outcomeStatus: outcome,
      outcomeNotes: notes,
      status: 'Completed',
      isCompleted: true,
      followUpDate,
      nextAction,
    });

    if (nextAction === 'Follow-up Call' && followUpDate) {
      addCall({
        subject: `Follow-up: ${existing?.subject || 'Client Call'}`,
        callPurpose: `Follow-up call following outcome: ${outcome}`,
        date: followUpDate,
        time: '14:00',
        direction: 'outbound',
        outcomeStatus: 'Pending',
        status: 'Pending',
        priority: existing?.priority || 'Medium',
        companyId: existing?.companyId,
        contactId: existing?.contactId,
        externalName: existing?.externalName,
        externalPhone: existing?.externalPhone,
        assignedUserId: existing?.assignedUserId || currentUser.id,
        notes: `Follow-up required. Prior discussion outcome: ${outcome}.${notes ? ` Notes: ${notes}` : ''}`,
        scriptId: existing?.scriptId,
        isScheduled: true,
        isCompleted: false,
      });
    }

    addNotification({
      userId: existing?.assignedUserId || currentUser.id,
      type: 'call_reminder',
      title: 'Call Marked Complete',
      message: `Call "${existing?.subject}" completed with outcome: ${outcome}`,
      read: false,
    });

    logAudit('CALL_COMPLETED', `Completed call "${existing?.subject}" with outcome "${outcome}"`);
  };

  const rescheduleCall = (callId: string, newDate: string, newTime: string, notes?: string) => {
    const existing = calls.find((c) => c.id === callId);
    updateCall(callId, {
      date: newDate,
      time: newTime,
      status: 'Rescheduled',
      isScheduled: true,
      notes: notes
        ? `${existing?.notes ? existing.notes + '\n' : ''}[Rescheduled to ${newDate} ${newTime}]: ${notes}`
        : existing?.notes,
    });

    if (existing?.scheduledCalendarEventId) {
      updateEvent(existing.scheduledCalendarEventId, {
        startDate: newDate,
        endDate: newDate,
        startTime: newTime,
        endTime: newTime,
        meetingStatus: 'Rescheduled',
      });
    }

    addNotification({
      userId: existing?.assignedUserId || currentUser.id,
      type: 'call_reminder',
      title: 'Call Rescheduled',
      message: `Call "${existing?.subject}" rescheduled to ${newDate} at ${newTime}`,
      read: false,
    });

    logAudit('CALL_RESCHEDULED', `Rescheduled call "${existing?.subject}" to ${newDate} ${newTime}`);
  };

  const deleteCall = (callId: string) => {
    updateCall(callId, { deletedAt: new Date().toISOString() });
    logAudit('CALL_DELETED', `Deleted call ${callId}`);
  };

  const addCallScript = (script: Omit<CallScript, 'id' | 'createdAt'>) => {
    const newScript: CallScript = {
      ...script,
      id: `script-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCallScripts((prev) => [...prev, newScript]);
    logAudit('CALL_SCRIPT_CREATED', `Built call script "${newScript.name}" with ${newScript.elements.length} prompts`);
  };

  const updateCallScript = (id: string, updates: Partial<CallScript>) => {
    setCallScripts((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteCallScript = (id: string) => {
    setCallScripts((prev) => prev.filter((s) => s.id !== id));
  };

  // Targets
  const addTarget = (targetData: Omit<Target, 'id' | 'createdAt'>): Target => {
    const targetId = `tar-${Date.now()}`;
    const now = new Date().toISOString();
    const historyItem = {
      id: `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetId,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'created' as const,
      details: `Created ${targetData.period || 'target'} quota "${targetData.name}" with goal of ${targetData.goalValue.toLocaleString()} ${targetData.customKpiUnit || ''}.`,
      newValue: targetData.goalValue,
    };

    const newTarget: Target = {
      ...targetData,
      id: targetId,
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
      history: [historyItem, ...(targetData.history || [])],
    };

    setTargets((prev) => [newTarget, ...prev]);
    logAudit('TARGET_CREATED', `Created ${newTarget.period} target "${newTarget.name}" (Goal: ${newTarget.goalValue})`);

    // Dispatch assignment notification to assigned members
    if (newTarget.notificationsConfig?.onAssignment !== false && newTarget.assignedUserIds?.length) {
      newTarget.assignedUserIds.forEach((uid) => {
        addNotification({
          userId: uid,
          type: 'task_alert',
          title: 'New Target Assigned',
          message: `${currentUser.name} assigned you to target: "${newTarget.name}" (Goal: ${newTarget.goalValue.toLocaleString()})`,
          read: false,
        });
      });
    }

    return newTarget;
  };

  const updateTarget = (id: string, updates: Partial<Target>, note?: string) => {
    const existing = targets.find((t) => t.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const historyEntries: any[] = [];

    if (updates.goalValue !== undefined && updates.goalValue !== existing.goalValue) {
      historyEntries.push({
        id: `th-${Date.now()}-val`,
        targetId: id,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'value_changed',
        details: `Updated target quota from ${existing.goalValue.toLocaleString()} to ${updates.goalValue.toLocaleString()}.${note ? ` Note: ${note}` : ''}`,
        oldValue: existing.goalValue,
        newValue: updates.goalValue,
      });
    }

    if (updates.status !== undefined && updates.status !== existing.status) {
      historyEntries.push({
        id: `th-${Date.now()}-stat`,
        targetId: id,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'status_changed',
        details: `Target status modified from ${existing.status || 'Active'} to ${updates.status}.${note ? ` Note: ${note}` : ''}`,
        oldValue: existing.status,
        newValue: updates.status,
      });
    }

    if (updates.assignedUserIds !== undefined) {
      const added = updates.assignedUserIds.filter((u) => !existing.assignedUserIds.includes(u));
      const removed = existing.assignedUserIds.filter((u) => !updates.assignedUserIds!.includes(u));
      if (added.length || removed.length) {
        historyEntries.push({
          id: `th-${Date.now()}-mem`,
          targetId: id,
          timestamp: now,
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: 'members_changed',
          details: `Target members updated: +${added.length} added, -${removed.length} removed.`,
        });

        // Notify newly added members
        added.forEach((uid) => {
          addNotification({
            userId: uid,
            type: 'task_alert',
            title: 'Assigned to Target',
            message: `${currentUser.name} assigned you to target: "${existing.name}"`,
            read: false,
          });
        });
      }
    }

    if (historyEntries.length === 0) {
      historyEntries.push({
        id: `th-${Date.now()}-gen`,
        targetId: id,
        timestamp: now,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'updated',
        details: note ? `Updated target details: ${note}` : `Updated target configurations and attributes.`,
      });
    }

    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...updates,
            updatedAt: now,
            history: [...historyEntries, ...(t.history || [])],
          };
        }
        return t;
      })
    );

    logAudit('TARGET_UPDATED', `Updated target "${existing.name}" (ID: ${id})`);
  };

  const overrideTargetProgress = (
    id: string,
    manualValue: number,
    status?: Target['status'],
    note?: string
  ) => {
    const existing = targets.find((t) => t.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const historyItem = {
      id: `th-${Date.now()}-ovr`,
      targetId: id,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'achievement_overridden' as const,
      details: `Manual achievement set to ${manualValue.toLocaleString()} ${existing.customKpiUnit || ''}${status ? ` (Status: ${status})` : ''}.${note ? ` Reason: ${note}` : ''}`,
      oldValue: existing.manualAchievement,
      newValue: manualValue,
    };

    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            manualAchievement: manualValue,
            status: status || t.status,
            manualOverrideStatus: !!status,
            updatedAt: now,
            history: [historyItem, ...(t.history || [])],
          };
        }
        return t;
      })
    );

    logAudit('TARGET_PROGRESS_OVERRIDDEN', `Overrode target achievement for "${existing.name}" to ${manualValue}`);
  };

  const sendTargetReminder = (targetId: string, customMessage?: string) => {
    const target = targets.find((t) => t.id === targetId);
    if (!target) return;

    const now = new Date().toISOString();
    target.assignedUserIds.forEach((uid) => {
      addNotification({
        userId: uid,
        type: 'task_alert',
        title: `Target Update: ${target.name}`,
        message: customMessage || `Reminder on target "${target.name}": Goal is ${target.goalValue.toLocaleString()} ending ${target.endDate}. Review your active deals and quotas.`,
        read: false,
      });
    });

    const historyItem = {
      id: `th-${Date.now()}-rem`,
      targetId,
      timestamp: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'notification_sent' as const,
      details: `Dispatched manual notification and progress reminder to ${target.assignedUserIds.length} assigned colleagues.`,
    };

    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, history: [historyItem, ...(t.history || [])] } : t))
    );

    logAudit('TARGET_REMINDER_SENT', `Sent target notifications for "${target.name}" to ${target.assignedUserIds.length} assignees`);
  };

  const deleteTarget = (id: string) => {
    const existing = targets.find((t) => t.id === id);
    setTargets((prev) => prev.filter((t) => t.id !== id));
    logAudit('TARGET_DELETED', `Deleted target "${existing?.name || id}"`);
  };

  const resetTargetsToDefault = () => {
    setTargets(initialTargets);
    try {
      localStorage.setItem('crm_sales_targets_v3', JSON.stringify(initialTargets));
    } catch (e) {
      console.warn('Failed to reset targets', e);
    }
    logAudit('TARGETS_RESET', 'Reset all targets and performance tracking quotas to system defaults');
  };

  // Documents & Folders
  const addFolder = (name: string, description?: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: `fld-${Date.now()}`,
      name,
      description,
      parentId,
    };
    setFolders((prev) => [...prev, newFolder]);
    logAudit('DOCUMENT_FOLDER_CREATED', `Created document folder "${name}"`);
  };

  const addDocument = (docData: Omit<DocumentFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (totalStorageUsedBytes + docData.fileSize > storageQuotaBytes) {
      alert(`Storage quota exceeded. Cannot upload ${docData.title}. Available: ${Math.round((storageQuotaBytes - totalStorageUsedBytes) / 1024 / 1024)} MB`);
      return;
    }

    const newDoc: DocumentFile = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logAudit('DOCUMENT_UPLOADED', `Uploaded document "${newDoc.title}" (v${newDoc.version})`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    logAudit('DOCUMENT_DELETED', `Removed document ${id}`);
  };

  // Email & Campaigns
  const addEmailTemplate = (tmpl: Omit<EmailTemplate, 'id' | 'createdAt'>) => {
    const newTmpl: EmailTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmailTemplates((prev) => [...prev, newTmpl]);
    logAudit('EMAIL_TEMPLATE_CREATED', `Created email template "${newTmpl.name}"`);
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openedCount' | 'clickedCount' | 'bouncedCount'>) => {
    const newCamp: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    logAudit('CAMPAIGN_CREATED', `Created campaign "${newCamp.title}"`);
  };

  const sendCampaign = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const eligibleContacts = contacts.filter(
            (ct) => !ct.deletedAt && !ct.isUnsubscribed && (c.recipientContactIds.length === 0 || c.recipientContactIds.includes(ct.id))
          );
          const count = eligibleContacts.length || 24;
          const opens = Math.round(count * 0.65);
          const clicks = Math.round(count * 0.28);
          const bounced = Math.max(0, Math.round(count * 0.02));

          logAudit('CAMPAIGN_DISPATCHED', `Dispatched campaign "${c.title}" to ${count} validated recipient contacts`);
          return {
            ...c,
            status: 'sent',
            sentCount: count,
            openedCount: opens,
            clickedCount: clicks,
            bouncedCount: bounced,
            sentAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const attachEmailToRecord = (messageId: string, type: 'contact' | 'company' | 'case', id: string, name: string) => {
    setEmailMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, attachedTo: { type, id, name } } : m))
    );
    logAudit('EMAIL_ATTACHED_TO_RECORD', `Attached email message to ${type} "${name}"`);
  };

  const unsubscribeContact = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isUnsubscribed: true, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('CONTACT_UNSUBSCRIBED', `Unsubscribed contact ${contactId} from email outreach campaigns`);
  };

  // Forms
  const addCustomForm = (formData: Omit<CustomForm, 'id' | 'createdAt' | 'submissions'>) => {
    const newForm: CustomForm = {
      ...formData,
      id: `form-${Date.now()}`,
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    setCustomForms((prev) => [...prev, newForm]);
    logAudit('FORM_CREATED', `Created public lead intake form "${newForm.title}"`);
  };

  const submitCustomForm = (
    formId: string,
    submissionData: { contactId?: string; responderName?: string; responderEmail?: string; answers: Record<string, any> }
  ) => {
    const newSubmission = {
      id: `sub-${Date.now()}`,
      ...submissionData,
      submittedAt: new Date().toISOString(),
    };

    setCustomForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, submissions: [newSubmission, ...f.submissions] } : f))
    );

    // If responder email is supplied and not matched, create lead contact
    if (submissionData.responderEmail && !submissionData.contactId) {
      const parts = (submissionData.responderName || 'Lead Inquiry').split(' ');
      addContact({
        firstName: parts[0] || 'Lead',
        lastName: parts.slice(1).join(' ') || 'Inquiry',
        email: submissionData.responderEmail,
        ownerId: currentUser.id,
        type: 'lead',
        description: `Inbound form submission on form ID ${formId}`,
      });
    }

    logAudit('FORM_SUBMITTED', `Received submission on form ${formId} from ${submissionData.responderName || 'visitor'}`);
  };

  // Message Board & Agent-to-Agent Direct Messaging
  const addMessageThread = (
    title: string,
    content: string,
    targetUserId?: string,
    authorId?: string,
    attachedDocuments?: DocumentAttachment[]
  ) => {
    const author = users.find((u) => u.id === (authorId || currentUser.id)) || currentUser;
    const targetUser = targetUserId ? users.find((u) => u.id === targetUserId) : undefined;

    const newThread: MessageThread = {
      id: `msg-${Date.now()}`,
      title,
      content,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      targetUserId: targetUser?.id,
      targetUserName: targetUser?.name,
      createdAt: new Date().toISOString(),
      replies: [],
      attachedDocuments: attachedDocuments && attachedDocuments.length > 0 ? attachedDocuments : undefined,
    };
    setMessageThreads((prev) => [newThread, ...prev]);
    logAudit(
      'MESSAGE_THREAD_POSTED',
      `Posted thread "${title}" by agent ${author.name}${targetUser ? ` directed to ${targetUser.name}` : ''}${
        attachedDocuments && attachedDocuments.length > 0
          ? ` with ${attachedDocuments.length} document attachment(s)`
          : ''
      }`
    );
  };

  const replyToMessageThread = (
    threadId: string,
    text: string,
    authorId?: string,
    attachedDocuments?: DocumentAttachment[]
  ) => {
    const author = users.find((u) => u.id === (authorId || currentUser.id)) || currentUser;
    const newReply: MessageReply = {
      id: `rep-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      text,
      createdAt: new Date().toISOString(),
      attachedDocuments: attachedDocuments && attachedDocuments.length > 0 ? attachedDocuments : undefined,
    };
    setMessageThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t))
    );
  };

  const sendDirectMessage = (
    recipientId: string,
    text: string,
    senderId?: string,
    relatedRecord?: { type: 'deal' | 'company' | 'contact' | 'case' | 'call'; id: string; title: string },
    attachedDocuments?: DocumentAttachment[]
  ) => {
    const sender = users.find((u) => u.id === (senderId || currentUser.id)) || currentUser;
    const recipient = users.find((u) => u.id === recipientId);
    if (!recipient) return;

    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar,
      text,
      createdAt: new Date().toISOString(),
      read: false,
      relatedRecord,
      attachedDocuments: attachedDocuments && attachedDocuments.length > 0 ? attachedDocuments : undefined,
    };

    setDirectMessages((prev) => [...prev, newMsg]);
    logAudit(
      'DIRECT_MESSAGE_SENT',
      `Direct message sent from ${sender.name} to agent ${recipient.name}${
        attachedDocuments && attachedDocuments.length > 0
          ? ` with document "${attachedDocuments[0].title}"`
          : ''
      }`
    );
  };

  const markDirectMessagesAsRead = (otherUserId: string) => {
    setDirectMessages((prev) =>
      prev.map((msg) =>
        msg.recipientId === currentUser.id && msg.senderId === otherUserId ? { ...msg, read: true } : msg
      )
    );
  };

  // Resources
  const addSharedResource = (resource: Omit<SharedResource, 'id' | 'createdAt' | 'createdBy'>): SharedResource => {
    const now = new Date().toISOString();
    const newRes: SharedResource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdBy: currentUser.name,
      createdById: currentUser.id,
      createdAt: now,
      lastModifiedBy: currentUser.name,
      lastModifiedAt: now,
      viewsCount: 0,
      isPinned: resource.isPinned || false,
      isFavorite: resource.isFavorite || false,
    };
    setSharedResources((prev) => [newRes, ...prev]);
    logAudit('RESOURCE_CREATED', `Created resource: "${newRes.title}" (${newRes.type})`);
    return newRes;
  };

  const updateSharedResource = (id: string, updates: Partial<SharedResource>) => {
    const now = new Date().toISOString();
    setSharedResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            ...updates,
            lastModifiedBy: currentUser.name,
            lastModifiedAt: now,
          };
        }
        return r;
      })
    );
    logAudit('RESOURCE_UPDATED', `Updated resource ID ${id}`);
  };

  const deleteSharedResource = (id: string) => {
    const target = sharedResources.find((r) => r.id === id);
    setSharedResources((prev) => prev.filter((r) => r.id !== id));
    logAudit('RESOURCE_DELETED', `Deleted resource "${target?.title || id}"`);
  };

  const togglePinResource = (id: string) => {
    setSharedResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r))
    );
  };

  const toggleFavoriteResource = (id: string) => {
    setSharedResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const incrementResourceViews = (id: string) => {
    setSharedResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              viewsCount: (r.viewsCount || 0) + 1,
              lastAccessedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const addCustomResourceCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (!defaultResourceCategories.includes(trimmed) && !customResourceCategories.includes(trimmed)) {
      setCustomResourceCategories((prev) => [...prev, trimmed]);
      logAudit('RESOURCE_CATEGORY_CREATED', `Added custom resource category: "${trimmed}"`);
    }
  };

  const deleteCustomResourceCategory = (category: string) => {
    setCustomResourceCategories((prev) => prev.filter((c) => c !== category));
    logAudit('RESOURCE_CATEGORY_DELETED', `Removed custom resource category: "${category}"`);
  };

  // Saved Views & Custom Views
  const addSavedView = (view: Omit<SavedCustomView, 'id' | 'createdAt' | 'updatedAt'>): SavedCustomView => {
    const now = new Date().toISOString();
    const newView: SavedCustomView = {
      ...view,
      id: `view-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: view.userId || currentUser.id,
      userName: view.userName || currentUser.name,
      createdAt: now,
      updatedAt: now,
    };
    setSavedViews((prev) => [newView, ...prev]);
    logAudit('CUSTOM_VIEW_CREATED', `Created custom view "${newView.title}" for ${newView.module}`);
    return newView;
  };

  const updateSavedView = (id: string, updates: Partial<SavedCustomView>) => {
    setSavedViews((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
    logAudit('CUSTOM_VIEW_UPDATED', `Updated custom view ID: ${id}`);
  };

  const deleteSavedView = (id: string) => {
    const found = savedViews.find((v) => v.id === id);
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
    // Clean up if it was a default view for any user
    setUserDefaultViews((prev) => {
      const updated: Record<string, Record<string, string>> = {};
      for (const [uId, modMap] of Object.entries(prev)) {
        updated[uId] = {};
        for (const [mod, vId] of Object.entries(modMap)) {
          if (vId !== id) {
            updated[uId][mod] = vId;
          }
        }
      }
      return updated;
    });
    logAudit('CUSTOM_VIEW_DELETED', `Deleted custom view "${found?.title || id}"`);
  };

  const duplicateSavedView = (id: string): SavedCustomView | undefined => {
    const target = savedViews.find((v) => v.id === id);
    if (!target) return undefined;
    const now = new Date().toISOString();
    const duplicated: SavedCustomView = {
      ...target,
      id: `view-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Copy of ${target.title}`,
      userId: currentUser.id,
      userName: currentUser.name,
      isSystem: false,
      isShared: false,
      createdAt: now,
      updatedAt: now,
    };
    setSavedViews((prev) => [duplicated, ...prev]);
    logAudit('CUSTOM_VIEW_DUPLICATED', `Duplicated custom view "${target.title}" to "${duplicated.title}"`);
    return duplicated;
  };

  const getViewsForModule = (module: string): SavedCustomView[] => {
    const mod = module.toLowerCase();
    return savedViews.filter((v) => {
      const viewMod = v.module.toLowerCase();
      // Match direct module or alias
      const matchesMod =
        viewMod === mod ||
        (mod === 'contact' && (viewMod === 'lead' || viewMod === 'customer')) ||
        (mod === 'lead' && viewMod === 'contact') ||
        (mod === 'customer' && viewMod === 'contact');

      if (!matchesMod) return false;

      // User-specific visibility check:
      // Users see:
      // 1. Their own private views
      // 2. Shared views (isShared === true)
      // 3. System built-in views (isSystem === true)
      // 4. Admins can see all views
      if (currentUser.role === 'admin') return true;
      if (v.isSystem || v.isShared) return true;
      return v.userId === currentUser.id;
    });
  };

  const setDefaultViewForModule = (module: string, viewId: string | null) => {
    setUserDefaultViews((prev) => {
      const userMap = { ...(prev[currentUser.id] || {}) };
      if (viewId === null) {
        delete userMap[module];
      } else {
        userMap[module] = viewId;
      }
      return {
        ...prev,
        [currentUser.id]: userMap,
      };
    });
    logAudit('CUSTOM_VIEW_DEFAULT_SET', `Set default view for ${module} to ${viewId || 'none'}`);
  };

  const getDefaultViewForModule = (module: string): SavedCustomView | undefined => {
    const userMap = userDefaultViews[currentUser.id] || {};
    const defaultId = userMap[module];
    const available = getViewsForModule(module);
    if (defaultId) {
      const found = available.find((v) => v.id === defaultId);
      if (found) return found;
    }
    // Fallback to first system view or first available view
    return available.find((v) => v.isSystem) || available[0];
  };

  const openCreateCustomView = (module: CustomViewModule, prefilledFilters?: CustomViewFilters) => {
    setCustomViewModalModule(module);
    setCustomViewModalEditingView(null);
    setCustomViewModalPrefilledFilters(prefilledFilters);
    setCustomViewModalOpen(true);
  };

  const openEditCustomView = (view: SavedCustomView) => {
    setCustomViewModalModule(view.module);
    setCustomViewModalEditingView(view);
    setCustomViewModalPrefilledFilters(undefined);
    setCustomViewModalOpen(true);
  };

  const closeCustomViewModal = () => {
    setCustomViewModalOpen(false);
    setCustomViewModalEditingView(null);
    setCustomViewModalPrefilledFilters(undefined);
  };

  const openManageViews = (module?: CustomViewModule | 'all') => {
    setManageViewsModalModule(module || 'all');
    setManageViewsModalOpen(true);
  };

  const closeManageViews = () => {
    setManageViewsModalOpen(false);
  };

  return (
    <CRMContext.Provider
      value={{
        activeNav,
        setActiveNav,
        isShortlistOpen,
        setIsShortlistOpen,
        shortlist,
        toggleShortlist,
        removeFromShortlist,
        isItemShortlisted,
        clearShortlist,
        setShortlistItems,
        savedShortlists,
        activeSavedShortlistId,
        saveCurrentShortlist,
        loadSavedShortlist,
        deleteSavedShortlist,
        shortlistOwnerId,
        setShortlistOwnerId,

        quickCreateOpen,
        setQuickCreateOpen,
        quickCreateType,
        quickCreatePrefillCompanyId,
        openQuickCreate,
        closeQuickCreate,

        recordDetailModal,
        openRecordDetail,
        closeRecordDetail,

        duplicateMergeModal,
        openDuplicateMerge,
        closeDuplicateMerge,
        mergeContacts,

        activeCallConsoleCallId,
        openCallConsole,
        closeCallConsole,

        globalSearchOpen,
        setGlobalSearchOpen,

        firstRunChecklistDismissed,
        setFirstRunChecklistDismissed,

        organisation,
        updateOrganisation,
        users,
        currentUserId,
        currentUser,
        switchUser,
        addUser,
        updateUser,
        updateUserPreferences,
        updateUserWorkSchedule,
        toggleUserActive,
        purgeAuditLogs,

        regions,
        addRegion,
        updateRegion,
        addUserLeaveDate,
        removeUserLeaveDate,
        checkUserAvailability,

        extendedFields,
        addExtendedField,
        deleteExtendedField,
        fieldSets,
        updateFieldSets,

        companies,
        filteredCompanies,
        defaultCompany,
        setDefaultCompanyId,
        addCompany,
        updateCompany,
        deleteCompany,
        reassignCompanyOwner,

        contacts,
        filteredContacts,
        addContact,
        updateContact,
        deleteContact,
        checkDuplicateContact,
        convertContactToDeal,

        deals,
        filteredDeals,
        addDeal,
        updateDeal,
        moveDealStage,
        deleteDeal,

        tasks,
        filteredTasks,
        addTask,
        updateTask,
        deleteTask,

        cases,
        filteredCases,
        addCase,
        updateCase,
        addCaseNote,
        deleteCase,

        events,
        filteredEvents,
        addEvent,
        updateEvent,
        deleteEvent,

        // Meetings System
        createMeetingModalOpen,
        createMeetingPrefill,
        openCreateMeeting,
        closeCreateMeeting,
        meetingDetailModalMeeting,
        openMeetingDetail,
        closeMeetingDetail,
        editMeetingModalMeeting,
        openEditMeeting,
        closeEditMeeting,
        createMeeting,
        updateMeeting,
        cancelMeeting,
        rescheduleMeeting,
        recordMeetingOutcome,
        deleteMeeting,
        duplicateMeeting,

        // Meeting Templates
        meetingTemplates,
        saveMeetingTemplate,
        deleteMeetingTemplate,
        resetMeetingTemplates,

        // Notifications
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,

        calls,
        filteredCalls,
        callScripts,
        addCall,
        updateCall,
        completeCall,
        rescheduleCall,
        deleteCall,
        completeCallFromConsole,
        addCallScript,
        updateCallScript,
        deleteCallScript,

        targets,
        addTarget,
        updateTarget,
        deleteTarget,
        overrideTargetProgress,
        sendTargetReminder,
        resetTargetsToDefault,

        folders,
        documents,
        addFolder,
        addDocument,
        deleteDocument,
        totalStorageUsedBytes,
        storageQuotaBytes,

        emailAccounts,
        emailMessages,
        emailTemplates,
        campaigns,
        addEmailTemplate,
        addCampaign,
        sendCampaign,
        attachEmailToRecord,
        unsubscribeContact,

        customForms,
        addCustomForm,
        submitCustomForm,

        messageThreads,
        addMessageThread,
        replyToMessageThread,
        directMessages,
        sendDirectMessage,
        markDirectMessagesAsRead,
        sharedResources,
        addSharedResource,
        updateSharedResource,
        deleteSharedResource,
        togglePinResource,
        toggleFavoriteResource,
        incrementResourceViews,
        customResourceCategories,
        addCustomResourceCategory,
        deleteCustomResourceCategory,

        savedViews,
        addSavedView,
        updateSavedView,
        deleteSavedView,
        duplicateSavedView,
        getViewsForModule,
        userDefaultViews,
        setDefaultViewForModule,
        getDefaultViewForModule,

        customViewModalOpen,
        customViewModalModule,
        customViewModalEditingView,
        customViewModalPrefilledFilters,
        openCreateCustomView,
        openEditCustomView,
        closeCustomViewModal,

        manageViewsModalOpen,
        manageViewsModalModule,
        openManageViews,
        closeManageViews,

        auditLogs,
        logAudit,

        importHistory,
        exportHistory,
        addImportHistoryRecord,
        addExportHistoryRecord,
        clearImportHistory,
        clearExportHistory,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
