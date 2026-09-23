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
  DirectMessage,
  SharedResource,
  AuditLogItem,
  SavedCustomView,
  CustomViewModule,
  CustomViewFilters,
  ShortlistItem,
  ShortlistCategory,
  SavedShortlist,
} from '../types';
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
  initialAuditLogs,
  initialSavedViews,
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
  toggleUserActive: (id: string) => void;

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
    endTime: string
  ) => { available: boolean; status: 'free' | 'busy' | 'unavailable'; reason?: string };

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

  // Events & Calendar
  events: Event[];
  filteredEvents: Event[];
  addEvent: (evt: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Calls & Scripts
  calls: Call[];
  filteredCalls: Call[];
  callScripts: CallScript[];
  addCall: (call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>, createContactIfNew?: boolean) => Call;
  updateCall: (id: string, updates: Partial<Call>) => void;
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
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  updateTarget: (id: string, updates: Partial<Target>) => void;
  deleteTarget: (id: string) => void;

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
  addMessageThread: (title: string, content: string, targetUserId?: string, authorId?: string) => void;
  replyToMessageThread: (threadId: string, text: string, authorId?: string) => void;
  directMessages: DirectMessage[];
  sendDirectMessage: (
    recipientId: string,
    text: string,
    senderId?: string,
    relatedRecord?: { type: 'deal' | 'company' | 'contact' | 'case' | 'call'; id: string; title: string }
  ) => void;
  markDirectMessagesAsRead: (otherUserId: string) => void;
  sharedResources: SharedResource[];
  addSharedResource: (resource: Omit<SharedResource, 'id' | 'createdAt' | 'createdBy'>) => void;

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
  const [users, setUsers] = useState<User[]>(initialUsers);
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
  const [targets, setTargets] = useState<Target[]>(initialTargets);
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

  const [sharedResources, setSharedResources] = useState<SharedResource[]>(initialSharedResources);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);

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
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('USER_UPDATED', `Updated user settings for ID ${id}`);
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
    endTime: string
  ): { available: boolean; status: 'free' | 'busy' | 'unavailable'; reason?: string } => {
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

    // Check overlapping events
    const hasConflict = events.some((evt) => {
      if (evt.deletedAt) return false;
      if (evt.startDate !== date) return false;
      if (!evt.participantIds.includes(userId) && evt.ownerId !== userId) return false;
      // Overlap condition: start < otherEnd and end > otherStart
      return startTime < evt.endTime && endTime > evt.startTime;
    });

    if (hasConflict) {
      return { available: false, status: 'busy', reason: `${user.name} has a scheduled meeting at this time` };
    }

    return { available: true, status: 'free' };
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
  const addTarget = (targetData: Omit<Target, 'id' | 'createdAt'>) => {
    const newTarget: Target = {
      ...targetData,
      id: `tar-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTargets((prev) => [...prev, newTarget]);
    logAudit('TARGET_CREATED', `Created ${newTarget.period} target "${newTarget.name}" (Goal: ${newTarget.goalValue})`);
  };

  const updateTarget = (id: string, updates: Partial<Target>) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    logAudit('TARGET_DELETED', `Deleted target ID ${id}`);
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
  const addMessageThread = (title: string, content: string, targetUserId?: string, authorId?: string) => {
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
    };
    setMessageThreads((prev) => [newThread, ...prev]);
    logAudit('MESSAGE_THREAD_POSTED', `Posted thread "${title}" by agent ${author.name}${targetUser ? ` directed to ${targetUser.name}` : ''}`);
  };

  const replyToMessageThread = (threadId: string, text: string, authorId?: string) => {
    const author = users.find((u) => u.id === (authorId || currentUser.id)) || currentUser;
    const newReply = {
      id: `rep-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessageThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t))
    );
  };

  const sendDirectMessage = (
    recipientId: string,
    text: string,
    senderId?: string,
    relatedRecord?: { type: 'deal' | 'company' | 'contact' | 'case' | 'call'; id: string; title: string }
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
    };

    setDirectMessages((prev) => [...prev, newMsg]);
    logAudit('DIRECT_MESSAGE_SENT', `Direct message sent from ${sender.name} to agent ${recipient.name}`);
  };

  const markDirectMessagesAsRead = (otherUserId: string) => {
    setDirectMessages((prev) =>
      prev.map((msg) =>
        msg.recipientId === currentUser.id && msg.senderId === otherUserId ? { ...msg, read: true } : msg
      )
    );
  };

  // Resources
  const addSharedResource = (resource: Omit<SharedResource, 'id' | 'createdAt' | 'createdBy'>) => {
    const newRes: SharedResource = {
      ...resource,
      id: `res-${Date.now()}`,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setSharedResources((prev) => [newRes, ...prev]);
    logAudit('RESOURCE_SHARED', `Shared resource item: "${newRes.title}"`);
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
        toggleUserActive,

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

        calls,
        filteredCalls,
        callScripts,
        addCall,
        updateCall,
        completeCallFromConsole,
        addCallScript,
        updateCallScript,
        deleteCallScript,

        targets,
        addTarget,
        updateTarget,
        deleteTarget,

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
