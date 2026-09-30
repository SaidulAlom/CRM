import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  Briefcase,
  CheckSquare,
  LifeBuoy,
  PhoneCall,
  FileText,
  BarChart3,
  Target,
  Users2,
  Mail,
  FileSpreadsheet,
  MessageSquare,
  Bookmark,
  Settings,
  Star,
  Flag,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileQuestion,
  UserCog,
} from 'lucide-react';

import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    activeNav,
    setActiveNav,
    isShortlistOpen,
    setIsShortlistOpen,
    shortlist,
    currentUser,
    tasks,
    calls,
    cases,
    directMessages,
    organisation,
  } = useCRM();

  const openTasksCount = tasks.filter((t) => !t.deletedAt && t.status !== 'Completed' && t.assigneeId === currentUser.id).length;
  const pendingCallsCount = calls.filter((c) => !c.deletedAt && !c.isCompleted && c.assignedUserId === currentUser.id).length;
  const openCasesCount = cases.filter((c) => !c.deletedAt && c.status !== 'Closed').length;
  const unreadMessagesCount = directMessages.filter((m) => m.recipientId === currentUser.id && !m.read).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'deals', label: 'Deals & Pipeline', icon: Briefcase },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined },
    { id: 'cases', label: 'Cases & Support', icon: LifeBuoy, badge: openCasesCount > 0 ? openCasesCount : undefined },
    { id: 'calls', label: 'Call List', icon: PhoneCall, badge: pendingCallsCount > 0 ? pendingCallsCount : undefined },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'targets', label: 'Sales Targets', icon: Target },
    { id: 'team', label: 'Team View', icon: Users2 },
    { id: 'campaigns', label: 'Email & Campaigns', icon: Mail },
    { id: 'forms', label: 'Inbound Forms', icon: FileQuestion },
    { id: 'messages', label: 'Message Board', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: 'resources', label: 'Resources', icon: Bookmark },
    { id: 'import_export', label: 'Export & Import Data', icon: DownloadCloud },
    { id: 'profile', label: 'Profile & Preferences', icon: UserCog },
    { id: 'setup', label: 'Setup & Admin', icon: Settings },
  ];

  return (
    <aside
      id="crm-sidebar"
      className={`relative flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 z-20 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <BrandLogo size="md" showText={true} className="flex-1 mr-2" />
        ) : (
          <BrandLogo size="sm" collapsed={true} className="mx-auto" />
        )}
        <button
          id="toggle-sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 hidden md:block transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Sharing Policy pill notice */}
      {!collapsed && (
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 truncate">
            {organisation.sharingPolicy === 'all_shared' ? (
              <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
            ) : organisation.sharingPolicy === 'private_visible_to_managers' ? (
              <Shield size={12} className="text-blue-400 shrink-0" />
            ) : (
              <ShieldAlert size={12} className="text-amber-400 shrink-0" />
            )}
            <span className="truncate">
              {organisation.sharingPolicy === 'all_shared'
                ? 'All records shared'
                : organisation.sharingPolicy === 'private_visible_to_managers'
                ? 'Manager visible'
                : 'Strictly private'}
            </span>
          </span>
          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold uppercase">
            {currentUser.role}
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveNav(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon size={17} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Shortlist Quick Drawer Toggle & User badge footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          id="toggle-shortlist-panel"
          onClick={() => setIsShortlistOpen(!isShortlistOpen)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            isShortlistOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
          } ${collapsed ? 'justify-center px-1' : ''}`}
          title={isShortlistOpen ? 'Hide Shortlist panel' : 'Show Shortlist panel'}
          aria-expanded={isShortlistOpen}
        >
          <Flag size={15} className={`shrink-0 ${isShortlistOpen ? 'text-amber-400 fill-amber-400' : 'text-slate-400 hover:text-amber-400'}`} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">Shortlist</span>
              <span className="text-[11px] font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                {shortlist.length}
              </span>
            </>
          )}
        </button>

        {/* Current user info */}
        <div
          onClick={() => setActiveNav('setup')}
          className={`flex items-center gap-2.5 p-1.5 rounded-md hover:bg-slate-800/80 cursor-pointer transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={`${currentUser.name} (${currentUser.role})`}
        >
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate capitalize">
                {currentUser.role} · {currentUser.email.split('@')[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
