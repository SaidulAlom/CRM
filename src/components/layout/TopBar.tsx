import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CRMNotification } from '../../types';
import {
  Search,
  Plus,
  Building2,
  Users,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  PhoneCall,
  Calendar,
  Settings,
  ChevronDown,
  Clock,
  Bell,
  CheckCircle2,
  ExternalLink,
  Flag,
  UserCheck,
  FileText,
  Star,
  AlertTriangle,
  Bookmark,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    openQuickCreate,
    setGlobalSearchOpen,
    setActiveNav,
    defaultCompany,
    organisation,
    isShortlistOpen,
    setIsShortlistOpen,
    shortlist,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    openCreateMeeting,
    openMeetingDetail,
    events,
  } = useCRM();

  const [quickCreateMenuOpen, setQuickCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const qcRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const myNotifications = useMemo(() => {
    return notifications.filter((n: CRMNotification) => n.userId === currentUser.id);
  }, [notifications, currentUser.id]);

  const unreadNotifCount = useMemo(() => {
    return myNotifications.filter((n: CRMNotification) => !n.read).length;
  }, [myNotifications]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (qcRef.current && !qcRef.current.contains(e.target as Node)) {
        setQuickCreateMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="crm-topbar"
      className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-3 shrink-0 z-10"
    >
      {/* Search Input Bar (Cmd+K trigger) */}
      <div className="flex-1 max-w-xl">
        <button
          id="global-search-trigger"
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 text-xs font-normal transition-all shadow-xs"
        >
          <span className="flex items-center gap-2 text-slate-500 truncate">
            <Search size={15} className="text-slate-400 shrink-0" />
            <span className="truncate">Search companies, contacts, deals, tasks, cases...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-300 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Default Company indicator if set (FR-3.3) */}
        {defaultCompany && (
          <div
            onClick={() => setActiveNav('companies')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs cursor-pointer hover:bg-indigo-100 transition-colors"
            title="Default Company active. New items will pre-link to this company."
          >
            <Building2 size={13} className="text-indigo-600" />
            <span className="font-medium text-[11px] truncate max-w-[120px]">
              {defaultCompany.name}
            </span>
            <span className="text-[10px] bg-indigo-200/70 text-indigo-800 px-1 rounded uppercase tracking-wider">
              Default
            </span>
          </div>
        )}

        {/* Quick Create Dropdown (FR-2.3) */}
        <div className="relative" ref={qcRef}>
          <button
            id="quick-create-button"
            onClick={() => setQuickCreateMenuOpen(!quickCreateMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Quick Create</span>
            <ChevronDown size={13} className="opacity-80" />
          </button>

          {quickCreateMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Create New Record
              </div>
              <button
                id="quick-create-company"
                onClick={() => {
                  openQuickCreate('company');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Building2 size={15} className="text-slate-400" />
                <span>Company</span>
              </button>
              <button
                id="quick-create-contact"
                onClick={() => {
                  openQuickCreate('contact');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Users size={15} className="text-slate-400" />
                <span>Contact</span>
              </button>
              <button
                id="quick-create-lead"
                onClick={() => {
                  openQuickCreate('lead');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <UserCheck size={15} className="text-slate-400" />
                <span>Lead</span>
              </button>
              <button
                id="quick-create-deal"
                onClick={() => {
                  openQuickCreate('deal');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Briefcase size={15} className="text-slate-400" />
                <span>Deal</span>
              </button>
              <button
                id="quick-create-task"
                onClick={() => {
                  openQuickCreate('task');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <CheckSquare size={15} className="text-slate-400" />
                <span>Task</span>
              </button>
              <button
                id="quick-create-case"
                onClick={() => {
                  openQuickCreate('case');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <LifeBuoy size={15} className="text-slate-400" />
                <span>Support Case</span>
              </button>
              <button
                id="quick-create-call"
                onClick={() => {
                  openQuickCreate('call');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <PhoneCall size={15} className="text-slate-400" />
                <span>Log / Schedule Call</span>
              </button>
              <button
                id="quick-create-event"
                onClick={() => {
                  openCreateMeeting();
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Calendar size={15} className="text-slate-400" />
                <span>Create Meeting</span>
              </button>
              <button
                id="quick-create-appointment"
                onClick={() => {
                  openQuickCreate('appointment');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Clock size={15} className="text-slate-400" />
                <span>Appointment</span>
              </button>
              <button
                id="quick-create-note"
                onClick={() => {
                  openQuickCreate('note');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <FileText size={15} className="text-slate-400" />
                <span>Note</span>
              </button>
              <button
                id="quick-create-resource"
                onClick={() => {
                  setActiveNav('resources');
                  setQuickCreateMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <Bookmark size={15} className="text-slate-400" />
                <span>Resource / Link</span>
              </button>
            </div>
          )}
        </div>

        {/* Shortlist Toggle Button */}
        <button
          id="topbar-shortlist-toggle"
          onClick={() => setIsShortlistOpen(!isShortlistOpen)}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs ${
            isShortlistOpen
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title={isShortlistOpen ? 'Hide Shortlist panel' : 'Show Shortlist panel'}
          aria-label="Toggle Shortlist"
        >
          <Flag size={14} className={isShortlistOpen ? 'fill-amber-400 text-amber-600' : 'text-slate-500'} />
          <span className="hidden sm:inline">Shortlist</span>
          {shortlist.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {shortlist.length}
            </span>
          )}
        </button>

        {/* In-app Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-bell-btn"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className={`relative p-2 rounded-lg border text-xs font-medium transition-all shadow-2xs ${
              notifMenuOpen
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="CRM Notifications & Reminders"
            aria-label="View notifications"
          >
            <Bell size={15} className={unreadNotifCount > 0 ? 'text-indigo-600' : 'text-slate-500'} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CRM Notifications</h4>
                  <p className="text-[10px] text-slate-500">Meetings, calendar alerts & reminders</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {myNotifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {myNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No notifications right now.
                  </div>
                ) : (
                  myNotifications.map((n: CRMNotification) => {
                    const isMeetingInvite = n.type === 'meeting_invite';
                    const isReminder = n.type === 'meeting_reminder';
                    const isCancel = n.type === 'meeting_cancelled';
                    const isReschedule = n.type === 'meeting_rescheduled';

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.meetingId) {
                            const mtg = events.find((e) => e.id === n.meetingId);
                            if (mtg) {
                              openMeetingDetail(mtg);
                              setNotifMenuOpen(false);
                            } else {
                              setActiveNav('calendar');
                              setNotifMenuOpen(false);
                            }
                          }
                        }}
                        className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                            isCancel
                              ? 'bg-rose-600'
                              : isReminder
                              ? 'bg-amber-600'
                              : isReschedule
                              ? 'bg-purple-600'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {isReminder ? (
                            <Clock size={13} />
                          ) : isCancel ? (
                            <AlertTriangle size={13} />
                          ) : (
                            <Calendar size={13} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 truncate">{n.title}</span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-100 px-3 pt-1.5 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveNav('calendar');
                    setNotifMenuOpen(false);
                  }}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                >
                  Go to Calendar
                </button>
                <button
                  onClick={() => {
                    openCreateMeeting();
                    setNotifMenuOpen(false);
                  }}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                >
                  + New Meeting
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role & User Switcher (Critical for evaluating Admin, Manager, Standard User permissions & sharing policy) */}
        <div className="relative" ref={userRef}>
          <button
            id="user-role-switcher"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-indigo-600 font-semibold uppercase">
                  <span>Role: {currentUser.role}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role / User Context
              </div>

              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    id={`switch-to-user-${u.id}`}
                    onClick={() => {
                      switchUser(u.id);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      isSelected ? 'bg-indigo-50/80 text-indigo-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="text-indigo-600" />}
                  </button>
                );
              })}

              <div className="border-t border-slate-100 mt-1 pt-1 space-y-0.5">
                <button
                  id="open-profile-from-user-menu"
                  onClick={() => {
                    setActiveNav('profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium"
                >
                  <UserCheck size={14} className="text-indigo-500" />
                  <span>My Profile & Preferences</span>
                </button>

                <button
                  id="open-setup-from-user-menu"
                  onClick={() => {
                    setActiveNav('setup');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Settings size={14} className="text-slate-400" />
                  <span>Organisation & System Setup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
