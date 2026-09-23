import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { MessageThread, MessageReply, DirectMessage, User } from '../../types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Direct Message Modal
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [newDmRecipientId, setNewDmRecipientId] = useState(otherAgents[0]?.id || '');
  const [newDmMessage, setNewDmMessage] = useState('');

  // Threads States
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    messageThreads[0]?.id ?? ''
  );
  const [replyText, setReplyText] = useState('');
  const [threadFilter, setThreadFilter] = useState<'all' | 'directed'>('all');

  // New Thread Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTargetAgentId, setNewTargetAgentId] = useState<string>('');

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

  // Send Direct Message
  const handleSendDM = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dmText.trim() || !selectedAgentId) return;

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

    sendDirectMessage(selectedAgentId, dmText.trim(), currentUser.id, relatedRecord);
    setDmText('');
    setSelectedRecordType('none');
    setSelectedRecordId('');
  };

  const handleStartNewDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDmMessage.trim() || !newDmRecipientId) return;
    sendDirectMessage(newDmRecipientId, newDmMessage.trim(), currentUser.id);
    setSelectedAgentId(newDmRecipientId);
    setShowNewDmModal(false);
    setNewDmMessage('');
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
    if (!replyText.trim() || !activeThread) return;
    replyToMessageThread(activeThread.id, replyText.trim(), currentUser.id);
    setReplyText('');
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addMessageThread(newTitle.trim(), newContent.trim(), newTargetAgentId || undefined, currentUser.id);
    setShowNewModal(false);
    setNewTitle('');
    setNewContent('');
    setNewTargetAgentId('');
  };

  const quickPrompts = [
    'Can you please review this priority deal?',
    'Client requested an update on contract terms.',
    'All approved from my side. Feel free to proceed!',
    'Do you have 10 minutes to sync before the call?',
  ];

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
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Message between CRM agents in real-time, coordinate deals, and share updates across team threads.
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
            onClick={() => setShowNewDmModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>New Agent Chat</span>
          </button>

          <button
            id="new-thread-btn"
            onClick={() => setShowNewModal(true)}
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

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {users.filter((u) => u.active).length} Agents Online
          </span>
        </div>
      </div>

      {/* TAB 1: AGENT-TO-AGENT DIRECT CHAT */}
      {activeTab === 'direct' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
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
              <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
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
                              <p className="text-[11px] text-slate-500 truncate mt-1">
                                <span className="font-medium text-slate-700">
                                  {lastMsg.senderId === currentUser.id ? 'You: ' : ''}
                                </span>
                                {lastMsg.text}
                              </p>
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
          <div className="md:col-span-8 flex flex-col justify-between h-[640px] bg-slate-50/30">
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
                        <span>·</span>
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
                      All messages in this channel are private between you and {selectedAgent.name}. You can reference CRM deals, companies, and contacts.
                    </p>
                  </div>

                  {currentConversation.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No messages exchanged yet between you and {selectedAgent.name}. Say hello or share a deal update below!
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
                            className={`max-w-[75%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-1.5 ${
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

                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

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
                        <option value="none">Attach Record...</option>
                        <option value="deal">Attach Deal</option>
                        <option value="company">Attach Company</option>
                        <option value="contact">Attach Contact</option>
                        <option value="case">Attach Case</option>
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
                      disabled={!dmText.trim()}
                      className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 ${
                        dmText.trim()
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
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

            <div className="space-y-2 overflow-y-auto max-h-[500px]">
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

                    {thread.targetUserName && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 mt-1">
                        @{thread.targetUserName}
                      </span>
                    )}

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
          <div className="md:col-span-7 flex flex-col justify-between h-[580px]">
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
                    <span>·</span>
                    <span>{new Date(activeThread.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Thread content & replies */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Initial post */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-semibold text-indigo-700">{activeThread.authorName}</div>
                    <p className="text-slate-800 leading-relaxed">{activeThread.content}</p>
                  </div>

                  {/* Threaded replies (FR-10.2) */}
                  <div className="space-y-2.5 pl-4 border-l-2 border-indigo-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Replies ({activeThread.replies.length})
                    </div>

                    {activeThread.replies.map((reply: MessageReply) => (
                      <div key={reply.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{reply.authorName}</span>
                          <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply box */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply as ${currentUser.name}...`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
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
                    {agent.name} ({agent.role}) · {agent.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                value={newDmMessage}
                onChange={(e) => setNewDmMessage(e.target.value)}
                placeholder="Write your direct message to this agent..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
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
                rows={4}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Post updates, questions, deal strategy, or notes..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
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
