import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  MessageSquare,
  Users,
  Plus,
  Send,
  CornerDownRight,
  User as UserIcon,
  Search,
  CheckCheck,
  Check,
  Paperclip,
  ArrowRightLeft,
  Circle,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File,
  Download,
  Eye,
  ExternalLink,
  Folder as FolderIcon,
  HardDrive,
  Info,
  CheckSquare,
  Square,
  FileCheck,
} from 'lucide-react';
import {
  MessageThread,
  MessageReply,
  DirectMessage,
  User,
  DocumentAttachment,
  DocumentFile,
  Folder,
} from '../../types';

// Helper to format bytes to human readable format
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Helper for file type icons
const getFileTypeBadge = (fileType?: string, fileName?: string) => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  const type = (fileType || '').toLowerCase();

  if (type.includes('pdf') || ext === 'pdf') {
    return {
      icon: FileText,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      tag: 'PDF',
    };
  }
  if (
    type.includes('word') ||
    type.includes('officedocument.word') ||
    ext === 'doc' ||
    ext === 'docx'
  ) {
    return {
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tag: 'DOCX',
    };
  }
  if (
    type.includes('sheet') ||
    type.includes('excel') ||
    type.includes('csv') ||
    ext === 'xls' ||
    ext === 'xlsx' ||
    ext === 'csv'
  ) {
    return {
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: 'SHEET',
    };
  }
  if (type.includes('zip') || ext === 'zip' || ext === 'rar') {
    return {
      icon: FileArchive,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: 'ZIP',
    };
  }
  return {
    icon: File,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    tag: ext?.toUpperCase() || 'FILE',
  };
};

export const MessagesView: React.FC = () => {
  const {
    users,
    currentUser,
    switchUser,
    messageThreads,
    addMessageThread,
    replyToMessageThread,
    directMessages,
    sendDirectMessage,
    markDirectMessagesAsRead,
    deals,
    companies,
    contacts,
    cases,
    openRecordDetail,
    documents,
    folders,
    setActiveNav,
  } = useCRM();

  // Navigation tab: 'direct' (Agent-to-Agent) or 'threads' (Public Discussion Board)
  const [activeTab, setActiveTab] = useState<'direct' | 'threads'>('direct');

  // Direct Messaging States
  const otherAgents = users.filter((u) => u.id !== currentUser.id);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    otherAgents[0]?.id || ''
  );
  const [agentSearch, setAgentSearch] = useState('');
  const [dmText, setDmText] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<
    'none' | 'deal' | 'company' | 'contact' | 'case'
  >('none');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [dmAttachedDocs, setDmAttachedDocs] = useState<DocumentAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Direct Message Modal
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [newDmRecipientId, setNewDmRecipientId] = useState(otherAgents[0]?.id || '');
  const [newDmMessage, setNewDmMessage] = useState('');
  const [newDmAttachedDocs, setNewDmAttachedDocs] = useState<DocumentAttachment[]>([]);

  // Threads States
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    messageThreads[0]?.id ?? ''
  );
  const [replyText, setReplyText] = useState('');
  const [replyAttachedDocs, setReplyAttachedDocs] = useState<DocumentAttachment[]>([]);
  const [threadFilter, setThreadFilter] = useState<'all' | 'directed'>('all');

  // New Thread Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTargetAgentId, setNewTargetAgentId] = useState<string>('');
  const [newThreadAttachedDocs, setNewThreadAttachedDocs] = useState<DocumentAttachment[]>([]);

  // Document Picker Modal State
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [docPickerTarget, setDocPickerTarget] = useState<
    'dm' | 'reply' | 'newThread' | 'newDm'
  >('dm');
  const [docPickerFolderFilter, setDocPickerFolderFilter] = useState<string>('all');
  const [docPickerSearch, setDocPickerSearch] = useState('');
  const [tempSelectedDocIds, setTempSelectedDocIds] = useState<string[]>([]);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentAttachment | null>(null);

  // Ensure selectedAgentId is valid if users change
  useEffect(() => {
    if (!otherAgents.some((a) => a.id === selectedAgentId) && otherAgents.length > 0) {
      setSelectedAgentId(otherAgents[0].id);
    }
  }, [currentUser.id, otherAgents, selectedAgentId]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedAgentId) {
      markDirectMessagesAsRead(selectedAgentId);
    }
  }, [selectedAgentId, currentUser.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [directMessages, selectedAgentId, activeTab]);

  const selectedAgent = users.find((u) => u.id === selectedAgentId) || otherAgents[0];

  // Filter conversation messages between active agent and selected agent
  const currentConversation = directMessages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === selectedAgentId) ||
      (m.senderId === selectedAgentId && m.recipientId === currentUser.id)
  );

  // Calculate unread count per agent for active user
  const unreadCountByAgent = users.reduce((acc, user) => {
    const count = directMessages.filter(
      (m) => m.senderId === user.id && m.recipientId === currentUser.id && !m.read
    ).length;
    acc[user.id] = count;
    return acc;
  }, {} as Record<string, number>);

  const totalUnreadCount = Object.values(unreadCountByAgent).reduce((a, b) => a + b, 0);

  // Download document handler
  const handleDownloadDocument = (doc: DocumentAttachment) => {
    const content = `Apex CRM Document Archive\n=================================\nTitle: ${doc.title}\nFile: ${doc.fileName}\nVersion: ${doc.version || '1.0'}\nFile Size: ${doc.fileSize} bytes\nFile Type: ${doc.fileType}\nOrigin: Documents Module\nExported: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: doc.fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open Document Picker Modal
  const openDocPicker = (target: 'dm' | 'reply' | 'newThread' | 'newDm') => {
    setDocPickerTarget(target);
    // Initialize temporary selection with currently attached docs
    let existingIds: string[] = [];
    if (target === 'dm') existingIds = dmAttachedDocs.map((d) => d.id);
    if (target === 'reply') existingIds = replyAttachedDocs.map((d) => d.id);
    if (target === 'newThread') existingIds = newThreadAttachedDocs.map((d) => d.id);
    if (target === 'newDm') existingIds = newDmAttachedDocs.map((d) => d.id);
    setTempSelectedDocIds(existingIds);
    setDocPickerFolderFilter('all');
    setDocPickerSearch('');
    setShowDocPicker(true);
  };

  // Confirm Document Selection from Picker
  const handleConfirmDocPicker = () => {
    const chosenDocs: DocumentAttachment[] = documents
      .filter((d) => tempSelectedDocIds.includes(d.id))
      .map((d) => ({
        id: d.id,
        title: d.title,
        fileName: d.fileName,
        fileSize: d.fileSize,
        fileType: d.fileType,
        version: d.version,
        folderId: d.folderId,
      }));

    if (docPickerTarget === 'dm') setDmAttachedDocs(chosenDocs);
    if (docPickerTarget === 'reply') setReplyAttachedDocs(chosenDocs);
    if (docPickerTarget === 'newThread') setNewThreadAttachedDocs(chosenDocs);
    if (docPickerTarget === 'newDm') setNewDmAttachedDocs(chosenDocs);

    setShowDocPicker(false);
  };

  // Send Direct Message
  const handleSendDM = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!dmText.trim() && dmAttachedDocs.length === 0) || !selectedAgentId) return;

    let relatedRecord: DirectMessage['relatedRecord'] = undefined;
    if (selectedRecordType !== 'none' && selectedRecordId) {
      if (selectedRecordType === 'deal') {
        const deal = deals.find((d) => d.id === selectedRecordId);
        if (deal) relatedRecord = { type: 'deal', id: deal.id, title: deal.title };
      } else if (selectedRecordType === 'company') {
        const comp = companies.find((c) => c.id === selectedRecordId);
        if (comp) relatedRecord = { type: 'company', id: comp.id, title: comp.name };
      } else if (selectedRecordType === 'contact') {
        const ct = contacts.find((c) => c.id === selectedRecordId);
        if (ct) relatedRecord = { type: 'contact', id: ct.id, title: `${ct.firstName} ${ct.lastName}` };
      } else if (selectedRecordType === 'case') {
        const cs = cases.find((c) => c.id === selectedRecordId);
        if (cs) relatedRecord = { type: 'case', id: cs.id, title: cs.title };
      }
    }

    const messageText = dmText.trim() || (dmAttachedDocs.length > 0 ? `Attached ${dmAttachedDocs.length} document(s) from Documents module.` : '');

    sendDirectMessage(selectedAgentId, messageText, currentUser.id, relatedRecord, dmAttachedDocs);
    setDmText('');
    setDmAttachedDocs([]);
    setSelectedRecordType('none');
    setSelectedRecordId('');
  };

  const handleStartNewDM = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newDmMessage.trim() && newDmAttachedDocs.length === 0) || !newDmRecipientId) return;
    const msgText = newDmMessage.trim() || `Attached ${newDmAttachedDocs.length} document(s) from Documents module.`;
    sendDirectMessage(newDmRecipientId, msgText, currentUser.id, undefined, newDmAttachedDocs);
    setSelectedAgentId(newDmRecipientId);
    setShowNewDmModal(false);
    setNewDmMessage('');
    setNewDmAttachedDocs([]);
    setActiveTab('direct');
  };

  // Threads logic
  const filteredThreads = messageThreads.filter((t) => {
    if (threadFilter === 'directed') {
      return t.targetUserId === currentUser.id;
    }
    return true;
  });

  const activeThread =
    filteredThreads.find((t) => t.id === selectedThreadId) || filteredThreads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && replyAttachedDocs.length === 0) || !activeThread) return;
    const text = replyText.trim() || `Attached ${replyAttachedDocs.length} document(s) from Documents module.`;
    replyToMessageThread(activeThread.id, text, currentUser.id, replyAttachedDocs);
    setReplyText('');
    setReplyAttachedDocs([]);
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addMessageThread(
      newTitle.trim(),
      newContent.trim(),
      newTargetAgentId || undefined,
      currentUser.id,
      newThreadAttachedDocs
    );
    setShowNewModal(false);
    setNewTitle('');
    setNewContent('');
    setNewTargetAgentId('');
    setNewThreadAttachedDocs([]);
  };

  const quickPrompts = [
    'Can you please review this attached BAA agreement?',
    'Sending the platform architecture whitepaper for review.',
    'Client requested an update on contract terms.',
    'All approved from my side. Feel free to proceed!',
  ];

  // Document Attachment Card Component for rendered messages
  const renderDocumentCard = (
    doc: DocumentAttachment,
    isMe: boolean = false,
    inThread: boolean = false
  ) => {
    const badge = getFileTypeBadge(doc.fileType, doc.fileName);
    const IconComp = badge.icon;
    const folder = folders.find((f) => f.id === doc.folderId);

    return (
      <div
        key={doc.id}
        className={`group p-2.5 rounded-xl transition-all border text-xs flex items-center justify-between gap-3 ${
          isMe
            ? 'bg-indigo-700/60 hover:bg-indigo-700/80 border-indigo-400/40 text-white'
            : inThread
            ? 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-800'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              isMe ? 'bg-indigo-800/80 border-indigo-400/30 text-white' : `${badge.bgColor} ${badge.borderColor} ${badge.color}`
            }`}
          >
            <IconComp size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold truncate leading-tight">{doc.title}</span>
              {doc.version && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    isMe
                      ? 'bg-indigo-900/80 text-indigo-100 border border-indigo-500/40'
                      : 'bg-slate-200/80 text-slate-700 border border-slate-300'
                  }`}
                >
                  v{doc.version}
                </span>
              )}
            </div>

            <div
              className={`flex items-center gap-2 text-[10px] mt-0.5 truncate ${
                isMe ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              <span className="truncate">{doc.fileName}</span>
              <span>•</span>
              <span className="shrink-0">{formatBytes(doc.fileSize)}</span>
              {folder && (
                <>
                  <span>•</span>
                  <span className="truncate flex items-center gap-0.5">
                    <FolderIcon size={9} />
                    {folder.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewDoc(doc);
            }}
            title="Preview Document Details"
            className={`p-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              isMe
                ? 'hover:bg-indigo-600/70 text-indigo-100'
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Eye size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadDocument(doc);
            }}
            title={`Download ${doc.fileName}`}
            className={`p-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              isMe
                ? 'hover:bg-indigo-600/70 text-indigo-100'
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Render attachment pills before sending in compose area
  const renderAttachmentChips = (
    attachments: DocumentAttachment[],
    onRemove: (id: string) => void,
    onAddMore: () => void
  ) => {
    if (attachments.length === 0) return null;

    return (
      <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs overflow-x-auto">
        <span className="text-indigo-900 font-bold flex items-center gap-1 text-[11px] shrink-0">
          <Paperclip size={13} className="text-indigo-600" />
          Attached from Documents ({attachments.length}):
        </span>

        {attachments.map((doc) => {
          const badge = getFileTypeBadge(doc.fileType, doc.fileName);
          const IconComp = badge.icon;

          return (
            <div
              key={doc.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-indigo-200 rounded-lg text-slate-800 text-[11px] shrink-0 shadow-2xs"
            >
              <IconComp size={13} className={badge.color} />
              <span className="font-semibold max-w-[140px] truncate">{doc.title}</span>
              <span className="text-[10px] text-slate-400">({formatBytes(doc.fileSize)})</span>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                title="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddMore}
          className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-[10px] font-semibold shrink-0 flex items-center gap-1 transition-colors"
        >
          <Plus size={12} />
          <span>Add More</span>
        </button>
      </div>
    );
  };

  return (
    <div id="messages-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Persona Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agent Communications & Message Board</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Paperclip size={11} />
                  Documents Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Message between CRM agents in real-time, attach documents directly from the Documents module, and share updates across team threads.
              </p>
            </div>
          </div>
        </div>

        {/* Active Agent Perspective Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Shield size={13} className="text-indigo-600" />
              Logged in Agent:
            </span>
            <select
              id="active-agent-select"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            id="new-agent-chat-btn"
            onClick={() => {
              setNewDmAttachedDocs([]);
              setShowNewDmModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>New Agent Chat</span>
          </button>

          <button
            id="new-thread-btn"
            onClick={() => {
              setNewThreadAttachedDocs([]);
              setShowNewModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>New Discussion Thread</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs: Agent-to-Agent Chat vs Public Team Threads */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-direct-messages"
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'direct'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Users size={15} />
            <span>Agent-to-Agent Direct Chat</span>
            {totalUnreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'direct' ? 'bg-white text-indigo-700' : 'bg-red-500 text-white'
              }`}>
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            id="tab-team-threads"
            onClick={() => setActiveTab('threads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'threads'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <MessageSquare size={15} />
            <span>Team Discussion Threads</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'threads' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {messageThreads.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={() => setActiveNav('documents')}
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <HardDrive size={13} />
            <span>Documents Library ({documents.length})</span>
          </button>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {users.filter((u) => u.active).length} Agents Online
          </span>
        </div>
      </div>

      {/* TAB 1: AGENT-TO-AGENT DIRECT CHAT */}
      {activeTab === 'direct' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[660px]">
          {/* Left Column: Agents Roster */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                  Team Agents ({otherAgents.length})
                </h3>
                <span className="text-[11px] text-indigo-600 font-semibold">1-on-1 Chats</span>
              </div>

              {/* Agent Search Filter */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter agents by name or role..."
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Agents List */}
              <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
                {otherAgents
                  .filter(
                    (agent) =>
                      agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
                      agent.role.toLowerCase().includes(agentSearch.toLowerCase()) ||
                      agent.email.toLowerCase().includes(agentSearch.toLowerCase())
                  )
                  .map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    const unread = unreadCountByAgent[agent.id] || 0;

                    // Find latest message with this agent
                    const agentMsgs = directMessages.filter(
                      (m) =>
                        (m.senderId === currentUser.id && m.recipientId === agent.id) ||
                        (m.senderId === agent.id && m.recipientId === currentUser.id)
                    );
                    const lastMsg = agentMsgs[agentMsgs.length - 1];

                    return (
                      <div
                        key={agent.id}
                        id={`agent-chat-item-${agent.id}`}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border text-xs relative ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-200 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar & Online Dot */}
                          <div className="relative shrink-0">
                            {agent.avatar ? (
                              <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                {agent.name.slice(0, 2)}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-slate-900 truncate">{agent.name}</h4>
                              {lastMsg && (
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize">
                                {agent.role}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate">
                                {agent.email}
                              </span>
                            </div>

                            {lastMsg ? (
                              <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1">
                                <span className="font-medium text-slate-700 shrink-0">
                                  {lastMsg.senderId === currentUser.id ? 'You: ' : ''}
                                </span>
                                {lastMsg.attachedDocuments && lastMsg.attachedDocuments.length > 0 && (
                                  <Paperclip size={11} className="text-indigo-600 shrink-0" />
                                )}
                                <span className="truncate">{lastMsg.text}</span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic mt-1">
                                No messages yet. Click to chat.
                              </p>
                            )}
                          </div>

                          {/* Unread Badge */}
                          {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Switch User Helper Box */}
            <div className="pt-3 border-t border-slate-200 mt-2">
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">Active Perspective</span>
                    <span className="font-bold text-slate-800 text-xs truncate block">{currentUser.name}</span>
                  </div>
                </div>
                {selectedAgent && (
                  <button
                    onClick={() => switchUser(selectedAgent.id)}
                    title={`Switch perspective to ${selectedAgent.name}`}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold shadow-2xs transition-colors shrink-0"
                  >
                    <ArrowRightLeft size={12} />
                    <span>Switch to {selectedAgent.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Chat Pane */}
          <div className="md:col-span-8 flex flex-col justify-between h-[660px] bg-slate-50/30">
            {selectedAgent ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {selectedAgent.avatar ? (
                        <img
                          src={selectedAgent.avatar}
                          alt={selectedAgent.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                          {selectedAgent.name.slice(0, 2)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 truncate">
                          {selectedAgent.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          {selectedAgent.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 truncate">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {selectedAgent.email}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Online & Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchUser(selectedAgent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <ArrowRightLeft size={13} className="text-indigo-600" />
                      <span>Reply as {selectedAgent.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {/* Conversation Starter Header */}
                  <div className="text-center py-4 space-y-1 border-b border-slate-200/60 pb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mb-1">
                      <Users size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Direct Messaging with {selectedAgent.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      All messages in this channel are private between you and {selectedAgent.name}. You can attach documents from the Documents module and link CRM records.
                    </p>
                  </div>

                  {currentConversation.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No messages exchanged yet between you and {selectedAgent.name}. Say hello or attach a document below!
                    </div>
                  ) : (
                    currentConversation.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || selectedAgent.avatar}
                              alt={msg.senderName}
                              className="w-7 h-7 rounded-full object-cover mb-1 shrink-0"
                            />
                          )}

                          <div
                            className={`max-w-[78%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-2 ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px]">
                              <span className={`font-bold ${isMe ? 'text-indigo-200' : 'text-slate-600'}`}>
                                {isMe ? 'You' : msg.senderName}
                              </span>
                              <span className={isMe ? 'text-indigo-200' : 'text-slate-400'}>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {/* Attached CRM Record pill */}
                            {msg.relatedRecord && (
                              <div
                                onClick={() => {
                                  if (msg.relatedRecord?.type === 'company' || msg.relatedRecord?.type === 'contact') {
                                    openRecordDetail(msg.relatedRecord.type, msg.relatedRecord.id);
                                  }
                                }}
                                className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 cursor-pointer ${
                                  isMe
                                    ? 'bg-indigo-700/80 text-white border border-indigo-500 hover:bg-indigo-700'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200/70'
                                }`}
                              >
                                <Briefcase size={12} className="shrink-0" />
                                <span className="font-semibold capitalize">{msg.relatedRecord.type}:</span>
                                <span className="underline truncate">{msg.relatedRecord.title}</span>
                              </div>
                            )}

                            {/* Message text */}
                            {msg.text && (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}

                            {/* Attached Documents from Documents Module */}
                            {msg.attachedDocuments && msg.attachedDocuments.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div
                                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                    isMe ? 'text-indigo-200' : 'text-slate-400'
                                  }`}
                                >
                                  <Paperclip size={11} />
                                  <span>Attached Documents ({msg.attachedDocuments.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                  {msg.attachedDocuments.map((doc) =>
                                    renderDocumentCard(doc, isMe, false)
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Read Receipt */}
                            {isMe && (
                              <div className="flex items-center justify-end gap-1 text-[10px] text-indigo-200 pt-0.5">
                                <CheckCheck size={12} className="text-indigo-200" />
                                <span>Delivered</span>
                              </div>
                            )}
                          </div>

                          {isMe && (
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-7 h-7 rounded-full object-cover mb-1 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-4 py-2 bg-white/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" /> Quick Replies:
                  </span>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDmText(prompt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full text-[11px] font-medium transition-colors shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Compose Direct Message Area */}
                <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
                  {/* Attached Document Chips Preview */}
                  {renderAttachmentChips(
                    dmAttachedDocs,
                    (id) => setDmAttachedDocs((prev) => prev.filter((d) => d.id !== id)),
                    () => openDocPicker('dm')
                  )}

                  {/* Optional Record Linker Selector */}
                  {selectedRecordType !== 'none' && (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs">
                      <Briefcase size={14} className="text-indigo-600 shrink-0" />
                      <span className="text-indigo-900 font-semibold capitalize shrink-0">
                        Link {selectedRecordType}:
                      </span>
                      <select
                        value={selectedRecordId}
                        onChange={(e) => setSelectedRecordId(e.target.value)}
                        className="flex-1 bg-white border border-indigo-200 rounded-lg p-1 text-xs text-slate-800"
                      >
                        <option value="">Select a {selectedRecordType} to reference...</option>
                        {selectedRecordType === 'deal' &&
                          deals.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title} (${d.value.toLocaleString()})
                            </option>
                          ))}
                        {selectedRecordType === 'company' &&
                          companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.industry})
                            </option>
                          ))}
                        {selectedRecordType === 'contact' &&
                          contacts.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.firstName} {c.lastName} ({c.email})
                            </option>
                          ))}
                        {selectedRecordType === 'case' &&
                          cases.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title} [{c.status}]
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecordType('none');
                          setSelectedRecordId('');
                        }}
                        className="p-1 hover:bg-indigo-100 rounded text-indigo-700"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendDM} className="flex items-end gap-2">
                    {/* Attach Document from Documents Module Button */}
                    <button
                      type="button"
                      onClick={() => openDocPicker('dm')}
                      className={`h-10 px-3 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors shrink-0 ${
                        dmAttachedDocs.length > 0
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                      title="Attach documents from Documents Module"
                    >
                      <Paperclip size={14} className={dmAttachedDocs.length > 0 ? 'text-indigo-600' : 'text-slate-500'} />
                      <span className="hidden sm:inline">Attach Document</span>
                      {dmAttachedDocs.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                          {dmAttachedDocs.length}
                        </span>
                      )}
                    </button>

                    {/* Record Attach Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedRecordType}
                        onChange={(e) => {
                          setSelectedRecordType(e.target.value as any);
                          setSelectedRecordId('');
                        }}
                        className="h-10 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 focus:outline-hidden cursor-pointer"
                        title="Attach CRM Record (Deal, Company, Contact)"
                      >
                        <option value="none">Link Record...</option>
                        <option value="deal">Link Deal</option>
                        <option value="company">Link Company</option>
                        <option value="contact">Link Contact</option>
                        <option value="case">Link Case</option>
                      </select>
                    </div>

                    <div className="flex-1 relative">
                      <textarea
                        rows={2}
                        value={dmText}
                        onChange={(e) => setDmText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendDM();
                          }
                        }}
                        placeholder={`Message ${selectedAgent.name} as ${currentUser.name}... (Press Enter to send)`}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none bg-slate-50/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!dmText.trim() && dmAttachedDocs.length === 0}
                      className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 ${
                        dmText.trim() || dmAttachedDocs.length > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={13} />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                <Users size={32} className="text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No agent selected</p>
                <p className="mt-1">Choose an agent from the left roster to start a direct message conversation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEAM DISCUSSION THREADS */}
      {activeTab === 'threads' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
          {/* Left column: Threads list */}
          <div className="md:col-span-5 border-r border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                Active Discussions ({filteredThreads.length})
              </h4>

              {/* Filter toggle */}
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setThreadFilter('all')}
                  className={`px-2 py-1 rounded-md ${
                    threadFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setThreadFilter('directed')}
                  className={`px-2 py-1 rounded-md ${
                    threadFilter === 'directed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Directed to Me
                </button>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[520px]">
              {filteredThreads.map((thread: MessageThread) => {
                const isSelected = activeThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    id={`thread-item-${thread.id}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors border text-xs ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-bold text-slate-900 truncate">{thread.title}</h5>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {thread.targetUserName && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                          @{thread.targetUserName}
                        </span>
                      )}

                      {thread.attachedDocuments && thread.attachedDocuments.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Paperclip size={10} />
                          {thread.attachedDocuments.length} doc{thread.attachedDocuments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-1">{thread.content}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                      <span>By {thread.authorName}</span>
                      <span className="text-indigo-600 font-semibold">{thread.replies.length} replies</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Active thread conversation */}
          <div className="md:col-span-7 flex flex-col justify-between h-[600px]">
            {activeThread ? (
              <>
                {/* Thread header */}
                <div className="p-4 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900">{activeThread.title}</h3>
                    {activeThread.targetUserName && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                        Direct to: {activeThread.targetUserName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Started by <strong className="text-slate-700">{activeThread.authorName}</strong></span>
                    <span>•</span>
                    <span>{new Date(activeThread.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Thread content & replies */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Initial post */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-indigo-700">{activeThread.authorName}</div>
                      <span className="text-[10px] text-slate-400">{new Date(activeThread.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{activeThread.content}</p>

                    {/* Attached Documents on thread */}
                    {activeThread.attachedDocuments && activeThread.attachedDocuments.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/80 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Paperclip size={11} className="text-indigo-600" />
                          <span>Attached Documents ({activeThread.attachedDocuments.length})</span>
                        </div>
                        <div className="space-y-1.5">
                          {activeThread.attachedDocuments.map((doc) =>
                            renderDocumentCard(doc, false, true)
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Threaded replies */}
                  <div className="space-y-2.5 pl-4 border-l-2 border-indigo-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Replies ({activeThread.replies.length})
                    </div>

                    {activeThread.replies.map((reply: MessageReply) => (
                      <div key={reply.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{reply.authorName}</span>
                          <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{reply.text}</p>

                        {/* Attached Documents in reply */}
                        {reply.attachedDocuments && reply.attachedDocuments.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Paperclip size={11} className="text-indigo-600" />
                              <span>Attached Documents:</span>
                            </div>
                            <div className="space-y-1">
                              {reply.attachedDocuments.map((doc) =>
                                renderDocumentCard(doc, false, true)
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply box */}
                <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                  {renderAttachmentChips(
                    replyAttachedDocs,
                    (id) => setReplyAttachedDocs((prev) => prev.filter((d) => d.id !== id)),
                    () => openDocPicker('reply')
                  )}

                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDocPicker('reply')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        replyAttachedDocs.length > 0
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                      title="Attach documents from Documents Module to reply"
                    >
                      <Paperclip size={15} className={replyAttachedDocs.length > 0 ? 'text-indigo-600' : 'text-slate-500'} />
                      {replyAttachedDocs.length > 0 && (
                        <span className="text-[10px] font-bold">{replyAttachedDocs.length}</span>
                      )}
                    </button>

                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply as ${currentUser.name}...`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim() && replyAttachedDocs.length === 0}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0 ${
                        replyText.trim() || replyAttachedDocs.length > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={13} />
                      <span>Reply</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a discussion thread from the left or create a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PICKER MODAL */}
      {showDocPicker && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-2xl w-full space-y-4 text-xs max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <HardDrive size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Attach Documents from Documents Module
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select existing files from CRM folders to embed into your chat conversation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Folder Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files by title, filename, or description..."
                  value={docPickerSearch}
                  onChange={(e) => setDocPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Folder Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setDocPickerFolderFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                    docPickerFolderFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Folders ({documents.length})
                </button>
                {folders.map((f: Folder) => {
                  const count = documents.filter((d) => d.folderId === f.id).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDocPickerFolderFilter(f.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                        docPickerFolderFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <FolderIcon size={11} />
                      <span>{f.name}</span>
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
              {documents
                .filter((doc: DocumentFile) => {
                  const matchesFolder =
                    docPickerFolderFilter === 'all' || doc.folderId === docPickerFolderFilter;
                  const matchesSearch =
                    !docPickerSearch ||
                    doc.title.toLowerCase().includes(docPickerSearch.toLowerCase()) ||
                    doc.fileName.toLowerCase().includes(docPickerSearch.toLowerCase()) ||
                    (doc.description &&
                      doc.description.toLowerCase().includes(docPickerSearch.toLowerCase()));
                  return matchesFolder && matchesSearch;
                })
                .map((doc: DocumentFile) => {
                  const isSelected = tempSelectedDocIds.includes(doc.id);
                  const badge = getFileTypeBadge(doc.fileType, doc.fileName);
                  const IconComp = badge.icon;
                  const folder = folders.find((f) => f.id === doc.folderId);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setTempSelectedDocIds((prev) =>
                          prev.includes(doc.id)
                            ? prev.filter((id) => id !== doc.id)
                            : [...prev, doc.id]
                        );
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bgColor} ${badge.borderColor} ${badge.color}`}
                        >
                          <IconComp size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 truncate text-xs">{doc.title}</h4>
                            {doc.version && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                v{doc.version}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 truncate">
                            <span className="truncate">{doc.fileName}</span>
                            <span>•</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                            {folder && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 truncate">
                                  <FolderIcon size={9} />
                                  {folder.name}
                                </span>
                              </>
                            )}
                          </div>

                          {doc.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selection Checkbox */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                {tempSelectedDocIds.length} document{tempSelectedDocIds.length === 1 ? '' : 's'} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocPicker(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDocPicker}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Attach Selected ({tempSelectedDocIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Document Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                {(() => {
                  const badge = getFileTypeBadge(previewDoc.fileType, previewDoc.fileName);
                  const IconComp = badge.icon;
                  return (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${badge.bgColor} ${badge.borderColor} ${badge.color}`}
                    >
                      <IconComp size={24} />
                    </div>
                  );
                })()}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900">{previewDoc.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{previewDoc.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Version {previewDoc.version || '1.0'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatBytes(previewDoc.fileSize)}
                    </span>
                  </div>
                </div>
              </div>

              {(() => {
                const fullDoc = documents.find((d) => d.id === previewDoc.id);
                const folder = folders.find((f) => f.id === previewDoc.folderId || f.id === fullDoc?.folderId);

                return (
                  <div className="space-y-2 text-[11px] pt-2 border-t border-slate-200/80">
                    {folder && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Folder:</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <FolderIcon size={11} className="text-indigo-600" />
                          {folder.name}
                        </span>
                      </div>
                    )}
                    {fullDoc?.uploadedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Uploaded By:</span>
                        <span className="font-semibold text-slate-700">{fullDoc.uploadedBy}</span>
                      </div>
                    )}
                    {fullDoc?.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Created:</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(fullDoc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {fullDoc?.description && (
                      <div className="pt-2">
                        <span className="text-slate-400 font-medium block mb-1">Description:</span>
                        <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          {fullDoc.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  setActiveNav('documents');
                }}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
              >
                <ExternalLink size={13} />
                <span>View in Documents Module</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Direct Message Modal */}
      {showNewDmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleStartNewDM}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                <span>Message an Agent</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewDmModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Recipient Agent *</label>
              <select
                required
                value={newDmRecipientId}
                onChange={(e) => setNewDmRecipientId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {otherAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role}) • {agent.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={3}
                required={newDmAttachedDocs.length === 0}
                value={newDmMessage}
                onChange={(e) => setNewDmMessage(e.target.value)}
                placeholder="Write your direct message to this agent..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Document Attachments in New DM */}
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-700">Attach Document(s) from Documents</label>
              {renderAttachmentChips(
                newDmAttachedDocs,
                (id) => setNewDmAttachedDocs((prev) => prev.filter((d) => d.id !== id)),
                () => openDocPicker('newDm')
              )}
              {newDmAttachedDocs.length === 0 && (
                <button
                  type="button"
                  onClick={() => openDocPicker('newDm')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  <Paperclip size={13} className="text-indigo-600" />
                  <span>Choose Documents from Module</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewDmModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Discussion Thread Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateThread}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Start New Discussion Thread</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Thread Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Q3 Healthcare Pipeline Sync"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Direct to Agent (Optional)</label>
              <select
                value={newTargetAgentId}
                onChange={(e) => setNewTargetAgentId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">Public / Team Wide (No specific agent)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    @{u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={3}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Post updates, questions, deal strategy, or notes..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Document Attachments in New Thread */}
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-700">Attach Document(s) from Documents</label>
              {renderAttachmentChips(
                newThreadAttachedDocs,
                (id) => setNewThreadAttachedDocs((prev) => prev.filter((d) => d.id !== id)),
                () => openDocPicker('newThread')
              )}
              {newThreadAttachedDocs.length === 0 && (
                <button
                  type="button"
                  onClick={() => openDocPicker('newThread')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  <Paperclip size={13} className="text-indigo-600" />
                  <span>Attach Documents from Module</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Publish Thread
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
