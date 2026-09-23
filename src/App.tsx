import React, { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ShortlistSidebar } from './components/layout/ShortlistSidebar';

// Modals
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickCreateModal } from './components/common/QuickCreateModal';
import { RecordDetailModal } from './components/common/RecordDetailModal';
import { CallConsoleModal } from './components/common/CallConsoleModal';
import { DuplicateMergeModal } from './components/common/DuplicateMergeModal';
import { CustomViewModal } from './components/views/customViews/CustomViewModal';
import { ManageViewsModal } from './components/views/customViews/ManageViewsModal';

// Views
import { HomeView } from './components/views/HomeView';
import { CalendarView } from './components/views/CalendarView';
import { CompaniesView } from './components/views/CompaniesView';
import { ContactsView } from './components/views/ContactsView';
import { DealsView } from './components/views/DealsView';
import { TasksView } from './components/views/TasksView';
import { CasesView } from './components/views/CasesView';
import { CallsView } from './components/views/CallsView';
import { DocumentsView } from './components/views/DocumentsView';
import { ReportsView } from './components/views/ReportsView';
import { TargetsView } from './components/views/TargetsView';
import { TeamView } from './components/views/TeamView';
import { EmailCampaignsView } from './components/views/EmailCampaignsView';
import { FormsView } from './components/views/FormsView';
import { MessagesView } from './components/views/MessagesView';
import { ResourcesView } from './components/views/ResourcesView';
import { ImportExportView } from './components/views/ImportExportView';
import { SettingsView } from './components/views/SettingsView';

const CRMAppContent: React.FC = () => {
  const { activeNav, setGlobalSearchOpen } = useCRM();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'home':
        return <HomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'companies':
        return <CompaniesView />;
      case 'contacts':
        return <ContactsView />;
      case 'deals':
        return <DealsView />;
      case 'tasks':
        return <TasksView />;
      case 'cases':
        return <CasesView />;
      case 'calls':
        return <CallsView />;
      case 'documents':
        return <DocumentsView />;
      case 'reports':
        return <ReportsView />;
      case 'targets':
        return <TargetsView />;
      case 'team':
        return <TeamView />;
      case 'campaigns':
        return <EmailCampaignsView />;
      case 'forms':
        return <FormsView />;
      case 'messages':
        return <MessagesView />;
      case 'resources':
        return <ResourcesView />;
      case 'import_export':
        return <ImportExportView />;
      case 'setup':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div id="crm-root-layout" className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-800">
      {/* Primary Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Persistent Shortlist Flyout Sidebar */}
      <ShortlistSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100">
        <TopBar />
        <main id="main-content-viewport" className="flex-1 overflow-y-auto bg-slate-50">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <GlobalSearchModal />
      <QuickCreateModal />
      <RecordDetailModal />
      <CallConsoleModal />
      <DuplicateMergeModal />
      <CustomViewModal />
      <ManageViewsModal />
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <CRMAppContent />
    </CRMProvider>
  );
}
