import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Bookmark,
  Plus,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Search,
  Tag,
  Star,
  Pin,
  PinOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  Shield,
  Layers,
  Filter,
  ArrowUpDown,
  Download,
  File,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  Lock,
  Globe,
  Users2,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  Bold,
  Italic,
  Heading,
  ListOrdered,
  List as ListIcon,
  Quote,
  Table as TableIcon,
  Upload,
} from 'lucide-react';
import { SharedResource, ResourceType, ResourceVisibility } from '../../types';
import { defaultResourceCategories } from '../../mockData';

export const ResourcesView: React.FC = () => {
  const {
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
    users,
    currentUser,
  } = useCRM();

  // Combine default and custom categories
  const allCategories = useMemo(() => {
    const combined = [...defaultResourceCategories, ...(customResourceCategories || [])];
    return Array.from(new Set(combined));
  }, [customResourceCategories]);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('All');
  const [creatorFilter, setCreatorFilter] = useState<string>('All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'pinned' | 'favorites' | 'my_resources'>('all');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'created_desc' | 'views_desc' | 'title_asc'>('updated_desc');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modals & Active Items
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<SharedResource | null>(null);
  const [activeDetailResource, setActiveDetailResource] = useState<SharedResource | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Form Fields State
  const [formType, setFormType] = useState<ResourceType>('hyperlink');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState(allCategories[0] || 'Partner Links');
  const [formTags, setFormTags] = useState('');
  const [formVisibility, setFormVisibility] = useState<ResourceVisibility>('everyone');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('2.4 MB');
  const [formFileType, setFormFileType] = useState('application/pdf');
  const [formDocumentVersion, setFormDocumentVersion] = useState('v1.0');
  const [formTab, setFormTab] = useState<'write' | 'preview'>('write');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Category Manager State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Open Create Form
  const handleOpenCreateModal = (initialType: ResourceType = 'hyperlink') => {
    setEditingResource(null);
    setFormType(initialType);
    setFormTitle('');
    setFormDescription('');
    setFormUrl('');
    setFormContent(
      initialType === 'text'
        ? `### Customer Support Instructions\n\nStep 1: **Verify the customer's account**.\nStep 2: **Check the previous support history**.\nStep 3: **Record the resolution in the CRM**.`
        : ''
    );
    setFormCategory(allCategories[0] || 'Partner Links');
    setFormTags('Sales, SOP');
    setFormVisibility('everyone');
    setFormIsPinned(false);
    setFormIsFavorite(false);
    setFormFileName(initialType === 'document' ? 'Apex_Document_Resource.pdf' : '');
    setFormFileSize('2.4 MB');
    setFormFileType('application/pdf');
    setFormDocumentVersion('v1.0');
    setFormTab('write');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEditModal = (resource: SharedResource) => {
    setEditingResource(resource);
    // Normalize type
    let resolvedType: ResourceType = 'hyperlink';
    if (resource.type === 'note' || resource.type === 'text') resolvedType = 'text';
    else if (resource.type === 'document') resolvedType = 'document';
    else if (resource.type === 'quicklink') resolvedType = 'quicklink';

    setFormType(resolvedType);
    setFormTitle(resource.title || '');
    setFormDescription(resource.description || '');
    setFormUrl(resource.url || '');
    setFormContent(resource.content || resource.body || '');
    setFormCategory(resource.category || allCategories[0] || 'Other');
    setFormTags(resource.tags ? resource.tags.join(', ') : '');
    setFormVisibility(resource.visibility || 'everyone');
    setFormIsPinned(!!resource.isPinned);
    setFormIsFavorite(!!resource.isFavorite);
    setFormFileName(resource.fileName || '');
    setFormFileSize(resource.fileSize || '1.8 MB');
    setFormFileType(resource.fileType || 'application/pdf');
    setFormDocumentVersion(resource.documentVersion || 'v1.0');
    setFormTab('write');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // URL Validation
  const isValidUrl = (urlString: string) => {
    if (!urlString.trim()) return false;
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      // Allow urls starting with http:// or https:// or domain-like formats
      return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/.*)?$/i.test(urlString);
    }
  };

  // Format URL for opening
  const formatUrlForOpening = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    return `https://${rawUrl}`;
  };

  // Save Form Handler
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formTitle.trim()) {
      errors.title = 'Resource title is required';
    }

    if (formType === 'hyperlink' || formType === 'quicklink') {
      if (!formUrl.trim()) {
        errors.url = 'Valid URL is required';
      } else if (!isValidUrl(formUrl.trim())) {
        errors.url = 'Please provide a valid URL (e.g. https://example.com)';
      }
    }

    if (formType === 'text') {
      if (!formContent.trim()) {
        errors.content = 'Resource content is required';
      }
    }

    if (formType === 'document') {
      if (!formFileName.trim()) {
        errors.fileName = 'Document file name is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const processedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const formattedUrl = formUrl.trim()
      ? formUrl.trim().startsWith('http://') || formUrl.trim().startsWith('https://')
        ? formUrl.trim()
        : `https://${formUrl.trim()}`
      : undefined;

    if (editingResource) {
      updateSharedResource(editingResource.id, {
        title: formTitle.trim(),
        type: formType,
        description: formDescription.trim() || undefined,
        url: formattedUrl,
        content: formType === 'text' ? formContent.trim() : undefined,
        body: formType === 'text' ? formContent.trim() : undefined,
        category: formCategory,
        tags: processedTags,
        visibility: formVisibility,
        isPinned: formIsPinned,
        isFavorite: formIsFavorite,
        fileName: formType === 'document' ? formFileName.trim() : undefined,
        fileSize: formType === 'document' ? formFileSize : undefined,
        fileType: formType === 'document' ? formFileType : undefined,
        documentVersion: formType === 'document' ? formDocumentVersion.trim() : undefined,
      });
      showToast(`Updated "${formTitle.trim()}"`);
    } else {
      const created = addSharedResource({
        title: formTitle.trim(),
        type: formType,
        description: formDescription.trim() || undefined,
        url: formattedUrl,
        content: formType === 'text' ? formContent.trim() : undefined,
        body: formType === 'text' ? formContent.trim() : undefined,
        category: formCategory,
        tags: processedTags,
        visibility: formVisibility,
        isPinned: formIsPinned,
        isFavorite: formIsFavorite,
        fileName: formType === 'document' ? formFileName.trim() : undefined,
        fileSize: formType === 'document' ? formFileSize : undefined,
        fileType: formType === 'document' ? formFileType : undefined,
        documentVersion: formType === 'document' ? formDocumentVersion.trim() : undefined,
      });
      showToast(`Created new ${formType}: "${formTitle.trim()}"`);
    }

    setIsFormModalOpen(false);
  };

  // Open Details Modal and track view
  const handleOpenDetailModal = (resource: SharedResource) => {
    setActiveDetailResource(resource);
    incrementResourceViews(resource.id);
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string = 'Content') => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  // Simulated Document Download
  const handleSimulateDownload = (resource: SharedResource) => {
    const filename = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.pdf`;
    showToast(`Downloading "${filename}"...`);
    setTimeout(() => {
      showToast(`Successfully downloaded "${filename}"`);
    }, 1000);
  };

  // Permission Check
  const canEditResource = (resource: SharedResource): boolean => {
    if (currentUser.role === 'admin') return true;
    if (resource.createdById === currentUser.id) return true;
    if (resource.createdBy === currentUser.name) return true;
    return false;
  };

  // Filter and Sort Resources
  const filteredAndSortedResources = useMemo(() => {
    return sharedResources.filter((res) => {
      // Privacy check: If private, only show to creator or admin
      if (res.visibility === 'private' && currentUser.role !== 'admin' && res.createdById !== currentUser.id && res.createdBy !== currentUser.name) {
        return false;
      }

      // Quick Filter tab
      if (quickFilter === 'pinned' && !res.isPinned) return false;
      if (quickFilter === 'favorites' && !res.isFavorite) return false;
      if (quickFilter === 'my_resources' && res.createdById !== currentUser.id && res.createdBy !== currentUser.name) return false;

      // Category filter
      if (categoryFilter !== 'All' && res.category !== categoryFilter) return false;

      // Type filter
      if (typeFilter !== 'All') {
        const normType = res.type === 'note' ? 'text' : res.type === 'link' ? 'hyperlink' : res.type;
        if (normType !== typeFilter) return false;
      }

      // Visibility filter
      if (visibilityFilter !== 'All' && res.visibility !== visibilityFilter) return false;

      // Creator filter
      if (creatorFilter !== 'All') {
        if (res.createdBy !== creatorFilter && res.createdById !== creatorFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = res.title.toLowerCase().includes(q);
        const inDesc = (res.description || '').toLowerCase().includes(q);
        const inContent = (res.content || res.body || '').toLowerCase().includes(q);
        const inUrl = (res.url || '').toLowerCase().includes(q);
        const inCategory = (res.category || '').toLowerCase().includes(q);
        const inCreator = (res.createdBy || '').toLowerCase().includes(q);
        const inTags = (res.tags || []).some((t) => t.toLowerCase().includes(q));
        const inFileName = (res.fileName || '').toLowerCase().includes(q);

        if (!inTitle && !inDesc && !inContent && !inUrl && !inCategory && !inCreator && !inTags && !inFileName) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'updated_desc') {
        const dateA = a.lastModifiedAt || a.createdAt;
        const dateB = b.lastModifiedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
      if (sortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'views_desc') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [
    sharedResources,
    currentUser,
    quickFilter,
    categoryFilter,
    typeFilter,
    visibilityFilter,
    creatorFilter,
    searchQuery,
    sortBy,
  ]);

  // Pinned Resources list for top section
  const pinnedResources = useMemo(() => {
    return sharedResources.filter((r) => {
      if (!r.isPinned) return false;
      if (r.visibility === 'private' && currentUser.role !== 'admin' && r.createdById !== currentUser.id && r.createdBy !== currentUser.name) {
        return false;
      }
      return true;
    });
  }, [sharedResources, currentUser]);

  // Statistics
  const stats = useMemo(() => {
    const total = sharedResources.length;
    const hyperlinks = sharedResources.filter((r) => r.type === 'hyperlink' || r.type === 'link' || r.type === 'quicklink').length;
    const textGuides = sharedResources.filter((r) => r.type === 'text' || r.type === 'note').length;
    const documents = sharedResources.filter((r) => r.type === 'document').length;
    const pinnedCount = sharedResources.filter((r) => r.isPinned).length;
    const favoritesCount = sharedResources.filter((r) => r.isFavorite).length;

    return { total, hyperlinks, textGuides, documents, pinnedCount, favoritesCount };
  }, [sharedResources]);

  // Unique creators for filter dropdown
  const creatorsList = useMemo(() => {
    const list = Array.from(new Set(sharedResources.map((r) => r.createdBy).filter(Boolean)));
    return list;
  }, [sharedResources]);

  // Format Helper: Render Markdown preview
  const renderFormattedMarkdown = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="text-sm font-bold text-slate-800 mt-3 mb-1">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-lg font-bold text-slate-950 mt-4 mb-2">
            {trimmed.replace('# ', '')}
          </h1>
        );
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        elements.push(
          <li key={idx} className="ml-5 list-disc text-slate-700 text-xs my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={idx} className="ml-5 list-decimal text-slate-700 text-xs my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
          </li>
        );
      } else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="border-l-4 border-indigo-400 pl-3 py-1 my-2 bg-indigo-50/50 text-indigo-900 rounded-r text-xs italic">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      } else if (trimmed === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-slate-700 text-xs leading-relaxed my-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          </p>
        );
      }
    });

    return <div className="space-y-0.5">{elements}</div>;
  };

  const formatInlineMarkdown = (text: string) => {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    // Italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Inline code `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200/80 rounded font-mono text-[11px] text-slate-800">$1</code>');
    // Links [title](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-600 underline font-medium hover:text-indigo-800">$1</a>');

    return formatted;
  };

  // Helper: Get Resource Type Icon & Color
  const getResourceTypeMeta = (type: string) => {
    switch (type) {
      case 'hyperlink':
      case 'link':
        return {
          label: 'Hyperlink',
          icon: Globe,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case 'text':
      case 'note':
        return {
          label: 'Text / Data',
          icon: FileText,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        };
      case 'document':
        return {
          label: 'Document',
          icon: File,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'quicklink':
        return {
          label: 'Quick Link',
          icon: Pin,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          badgeColor: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          label: 'Resource',
          icon: Bookmark,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
          badgeColor: 'bg-slate-100 text-slate-800',
        };
    }
  };

  // Helper: Get Visibility Badge
  const getVisibilityMeta = (vis: ResourceVisibility) => {
    switch (vis) {
      case 'everyone':
        return { label: 'Everyone', icon: Globe, color: 'text-slate-600 bg-slate-100 border-slate-200' };
      case 'team':
        return { label: 'Team', icon: Users2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'private':
        return { label: 'Private', icon: Lock, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { label: 'Everyone', icon: Globe, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  // Handle Markdown Insertion
  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    setFormContent((prev) => `${prev}${prefix}${suffix}`);
  };

  return (
    <div id="resources-management-module" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium animate-fade-in border border-slate-800">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bookmark size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resources & Quick Links</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized knowledge repository for company websites, partner portals, instructions, and shared documents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="manage-categories-btn"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Layers size={14} className="text-slate-500" />
            <span>Manage Categories</span>
          </button>

          <button
            id="new-resource-btn"
            onClick={() => handleOpenCreateModal('hyperlink')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>+ New Resource</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bookmark size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">All Resources</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Globe size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Links & Portals</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.hyperlinks}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Guides & Data</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.textGuides}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <File size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Documents</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.documents}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Pin size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Pinned & Quick</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.pinnedCount}</p>
          </div>
        </div>
      </div>

      {/* Pinned Resources Section (Prompt Requirement 7 & 12) */}
      {pinnedResources.length > 0 && quickFilter !== 'my_resources' && (
        <div id="pinned-resources-section" className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs space-y-3.5 bg-gradient-to-br from-indigo-50/20 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                <Pin size={15} />
              </span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pinned Resources ({pinnedResources.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Quick access across all CRM devices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5 w-10 text-center">⭐</th>
                  <th className="py-2.5 px-3.5">Resource</th>
                  <th className="py-2.5 px-3.5">Type</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Created By</th>
                  <th className="py-2.5 px-3.5">Views</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pinnedResources.map((res) => {
                  const typeMeta = getResourceTypeMeta(res.type);
                  const isUrl = res.type === 'hyperlink' || res.type === 'quicklink' || (res.url && !res.content);

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 text-center">
                        <button
                          onClick={() => toggleFavoriteResource(res.id)}
                          className={`p-1 rounded transition-colors ${
                            res.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'
                          }`}
                          title={res.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                        >
                          <Star size={14} className={res.isFavorite ? 'fill-amber-400' : ''} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-900 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-md shrink-0 ${typeMeta.color}`}>
                            <typeMeta.icon size={13} />
                          </span>
                          <span
                            onClick={() => handleOpenDetailModal(res)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
                          >
                            {res.title}
                          </span>
                        </div>
                        {res.description && (
                          <p className="text-[11px] text-slate-500 truncate pl-6">{res.description}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${typeMeta.badgeColor}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium truncate">
                        {res.category}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          <span>{res.createdBy}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Eye size={12} className="text-slate-400" />
                          {res.viewsCount || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right space-x-1">
                        {isUrl && res.url ? (
                          <a
                            href={formatUrlForOpening(res.url)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => incrementResourceViews(res.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px] transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : res.type === 'document' ? (
                          <button
                            onClick={() => {
                              handleOpenDetailModal(res);
                              handleSimulateDownload(res);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold text-[11px] transition-colors"
                          >
                            <Download size={11} />
                            <span>Download</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetailModal(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors"
                          >
                            <Eye size={11} />
                            <span>View</span>
                          </button>
                        )}

                        <button
                          onClick={() => togglePinResource(res.id)}
                          className="p-1 text-indigo-600 hover:text-slate-400 hover:bg-slate-100 rounded"
                          title="Unpin resource"
                        >
                          <PinOff size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search & Filtering Bar (Prompt Requirement 6 & 12) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              id="search-resources-input"
              type="text"
              placeholder="Search resources by title, description, content, URL, tags, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0 text-xs">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                quickFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({sharedResources.length})
            </button>
            <button
              onClick={() => setQuickFilter('pinned')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                quickFilter === 'pinned'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pin size={12} />
              <span>Pinned ({stats.pinnedCount})</span>
            </button>
            <button
              onClick={() => setQuickFilter('favorites')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                quickFilter === 'favorites'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star size={12} className="fill-amber-400 text-amber-500" />
              <span>Favorites ({stats.favoritesCount})</span>
            </button>
            <button
              onClick={() => setQuickFilter('my_resources')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                quickFilter === 'my_resources'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={12} />
              <span>My Resources</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Category:</span>
              <select
                id="filter-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="All">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Type:</span>
              <select
                id="filter-type-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="All">All Types</option>
                <option value="hyperlink">🔗 Hyperlinks</option>
                <option value="text">📝 Text / Data</option>
                <option value="document">📄 Documents</option>
                <option value="quicklink">📌 Quick Links</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Visibility:</span>
              <select
                id="filter-visibility-select"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="All">All</option>
                <option value="everyone">Everyone</option>
                <option value="team">Team Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Creator Filter */}
            {creatorsList.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Creator:</span>
                <select
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="All">All Creators</option>
                  {creatorsList.map((creator) => (
                    <option key={creator} value={creator}>
                      {creator}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="created_desc">Newest Added</option>
                <option value="views_desc">Most Viewed</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewLayout === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewLayout === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Resources Presentation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">
            Showing {filteredAndSortedResources.length} of {sharedResources.length} resources
          </span>
          {(searchQuery || categoryFilter !== 'All' || typeFilter !== 'All' || visibilityFilter !== 'All' || quickFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setTypeFilter('All');
                setVisibilityFilter('All');
                setCreatorFilter('All');
                setQuickFilter('all');
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredAndSortedResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No resources match your query</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria or filters, or create a new resource for your team.
            </p>
            <button
              onClick={() => handleOpenCreateModal('hyperlink')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus size={14} />
              <span>Create Resource</span>
            </button>
          </div>
        ) : viewLayout === 'grid' ? (
          /* Grid Layout (Prompt Requirement 1 & 12) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedResources.map((res) => {
              const typeMeta = getResourceTypeMeta(res.type);
              const visMeta = getVisibilityMeta(res.visibility);
              const isUrl = res.type === 'hyperlink' || res.type === 'quicklink' || (res.url && !res.content);
              const previewContent = res.description || res.content || res.body || res.url || '';

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs flex flex-col justify-between space-y-4 text-xs transition-all hover:shadow-md relative group"
                >
                  {/* Top card row: icon, badges & quick star/pin */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${typeMeta.color}`}>
                          <typeMeta.icon size={16} />
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeMeta.badgeColor}`}>
                            {typeMeta.label}
                          </span>
                          <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {res.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavoriteResource(res.id)}
                          className={`p-1 rounded transition-colors ${
                            res.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={res.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                        >
                          <Star size={14} className={res.isFavorite ? 'fill-amber-400' : ''} />
                        </button>
                        <button
                          onClick={() => togglePinResource(res.id)}
                          className={`p-1 rounded transition-colors ${
                            res.isPinned ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={res.isPinned ? 'Unpin from top' : 'Pin to top'}
                        >
                          <Pin size={14} className={res.isPinned ? 'fill-indigo-600' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => handleOpenDetailModal(res)}
                      className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 cursor-pointer pt-0.5 leading-snug"
                    >
                      {res.title}
                    </h3>

                    {/* Preview box / description */}
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs border border-slate-100 min-h-[64px] flex flex-col justify-center">
                      {isUrl && res.url ? (
                        <div className="space-y-1">
                          {res.description && (
                            <p className="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">
                              {res.description}
                            </p>
                          )}
                          <a
                            href={formatUrlForOpening(res.url)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => incrementResourceViews(res.id)}
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-[11px] truncate pt-0.5"
                          >
                            <span className="truncate">{res.url}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        </div>
                      ) : res.type === 'document' ? (
                        <div className="flex items-center gap-2.5">
                          <FileText size={18} className="text-amber-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 text-[11px] truncate">{res.fileName || res.title}</p>
                            <p className="text-[10px] text-slate-500">{res.fileSize || '2.4 MB'} · {res.documentVersion || 'v1.0'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="line-clamp-3 text-slate-600 text-[11px] leading-relaxed">
                          {res.description || res.content || res.body || 'No description provided.'}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {res.tags && res.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {res.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                            #{tag}
                          </span>
                        ))}
                        {res.tags.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{res.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2 truncate">
                      <span className="flex items-center gap-1 truncate">
                        <User size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{res.createdBy}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                        <Eye size={12} className="text-slate-400" />
                        {res.viewsCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isUrl && res.url ? (
                        <a
                          href={formatUrlForOpening(res.url)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => incrementResourceViews(res.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Open Link in New Tab"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenDetailModal(res)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyToClipboard(res.url || res.content || res.body || '', isUrl ? 'URL' : 'Content')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={13} />
                      </button>

                      {canEditResource(res) && (
                        <button
                          onClick={() => handleOpenEditModal(res)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit resource"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}

                      {canEditResource(res) && (
                        <button
                          onClick={() => setDeleteConfirmId(res.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List Layout (Prompt Requirement 1 & 12) */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-3.5 w-10 text-center">⭐</th>
                    <th className="py-3 px-3.5">Resource Title & Description</th>
                    <th className="py-3 px-3.5">Type</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Visibility</th>
                    <th className="py-3 px-3.5">Created By</th>
                    <th className="py-3 px-3.5">Updated</th>
                    <th className="py-3 px-3.5 text-center">Views</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedResources.map((res) => {
                    const typeMeta = getResourceTypeMeta(res.type);
                    const visMeta = getVisibilityMeta(res.visibility);
                    const isUrl = res.type === 'hyperlink' || res.type === 'quicklink' || (res.url && !res.content);

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => toggleFavoriteResource(res.id)}
                            className={`p-1 rounded transition-colors ${
                              res.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'
                            }`}
                          >
                            <Star size={14} className={res.isFavorite ? 'fill-amber-400' : ''} />
                          </button>
                        </td>
                        <td className="py-3 px-3.5 font-medium max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-md shrink-0 ${typeMeta.color}`}>
                              <typeMeta.icon size={13} />
                            </span>
                            <span
                              onClick={() => handleOpenDetailModal(res)}
                              className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
                            >
                              {res.title}
                            </span>
                            {res.isPinned && (
                              <Pin size={11} className="text-indigo-600 fill-indigo-600 shrink-0" />
                            )}
                          </div>
                          {res.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 pl-6 mt-0.5">
                              {res.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${typeMeta.badgeColor}`}>
                            {typeMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 font-medium">
                          {res.category}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${visMeta.color}`}>
                            <visMeta.icon size={10} />
                            <span>{visMeta.label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          {res.createdBy}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                          {new Date(res.lastModifiedAt || res.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3.5 text-center text-slate-500 font-mono text-[11px]">
                          {res.viewsCount || 0}
                        </td>
                        <td className="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isUrl && res.url ? (
                            <a
                              href={formatUrlForOpening(res.url)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => incrementResourceViews(res.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px]"
                            >
                              <span>Open</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenDetailModal(res)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px]"
                            >
                              <Eye size={11} />
                              <span>View</span>
                            </button>
                          )}

                          <button
                            onClick={() => togglePinResource(res.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title={res.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin size={13} className={res.isPinned ? 'fill-indigo-600 text-indigo-600' : ''} />
                          </button>

                          {canEditResource(res) && (
                            <button
                              onClick={() => handleOpenEditModal(res)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {canEditResource(res) && (
                            <button
                              onClick={() => setDeleteConfirmId(res.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT RESOURCE MODAL (Prompt Requirements 2, 3, 4, 10) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bookmark size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingResource ? 'Edit Resource' : 'Create New Resource'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add quick links, internal instructions, procedures, or documents for your CRM team.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveResource} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Resource Type Selector (Prompt Requirement 1 & 2) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('hyperlink');
                      setFormErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formType === 'hyperlink'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Globe size={15} className={formType === 'hyperlink' ? 'text-blue-600' : 'text-slate-400'} />
                    <span>🔗 Hyperlink</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('text');
                      setFormErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formType === 'text'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileText size={15} className={formType === 'text' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>📝 Text / Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('document');
                      setFormErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formType === 'document'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <File size={15} className={formType === 'document' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>📄 Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('quicklink');
                      setFormErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formType === 'quicklink'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Pin size={15} className={formType === 'quicklink' ? 'text-purple-600' : 'text-slate-400'} />
                    <span>📌 Quick Link</span>
                  </button>
                </div>
              </div>

              {/* Title & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Resource Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="resource-form-title"
                    type="text"
                    placeholder="e.g. Partner Portal or Support Instructions"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs text-slate-800 ${
                      formErrors.title ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.title && <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="resource-form-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Short Description / Preview
                </label>
                <input
                  type="text"
                  placeholder="Brief overview explaining what this resource is used for..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* DYNAMIC FIELDS PER RESOURCE TYPE */}

              {/* 1. Hyperlink & Quick Link Fields (Prompt Requirement 3) */}
              {(formType === 'hyperlink' || formType === 'quicklink') && (
                <div className="space-y-2 p-3.5 bg-blue-50/40 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">
                      Destination URL <span className="text-red-500">*</span>
                    </label>
                    {formUrl && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                        isValidUrl(formUrl) ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {isValidUrl(formUrl) ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Valid URL format</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} />
                            <span>Invalid format</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        id="resource-form-url"
                        type="text"
                        placeholder="https://example.com"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs text-slate-800 font-mono ${
                          formErrors.url ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {formUrl && isValidUrl(formUrl) && (
                      <a
                        href={formatUrlForOpening(formUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Test</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {formErrors.url && <p className="text-[11px] text-red-500">{formErrors.url}</p>}
                  <p className="text-[11px] text-slate-500">
                    When clicked, this resource will open securely in a new browser tab.
                  </p>
                </div>
              )}

              {/* 2. Text / Data Editor with Rich Text Toolbar (Prompt Requirement 4) */}
              {formType === 'text' && (
                <div className="space-y-2 p-3.5 bg-emerald-50/30 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">
                      Resource Content (Markdown Supported) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFormTab('write')}
                        className={`px-2.5 py-1 rounded font-medium ${
                          formTab === 'write' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormTab('preview')}
                        className={`px-2.5 py-1 rounded font-medium ${
                          formTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {formTab === 'write' ? (
                    <div className="space-y-1.5">
                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-200 rounded-lg flex-wrap text-slate-600">
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('**', '**')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700 font-bold"
                          title="Bold"
                        >
                          <Bold size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('*', '*')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700 italic"
                          title="Italic"
                        >
                          <Italic size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('\n### ')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700 font-semibold text-[11px]"
                          title="Heading 3"
                        >
                          H3
                        </button>
                        <span className="w-px h-4 bg-slate-200 mx-1" />
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('\n* ')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          title="Bullet list"
                        >
                          <ListIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('\n1. ')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          title="Numbered list"
                        >
                          <ListOrdered size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('\n> ')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          title="Quote block"
                        >
                          <Quote size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkdown('\n| Column 1 | Column 2 |\n| --- | --- |\n| Data 1 | Data 2 |')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          title="Table format"
                        >
                          <TableIcon size={13} />
                        </button>

                        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>Templates:</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormContent(
                                `### Customer Support Instructions\n\nStep 1: **Verify the customer's account**.\nStep 2: **Check the previous support history**.\nStep 3: **Record the resolution in the CRM**.`
                              )
                            }
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            Support SOP
                          </button>
                        </div>
                      </div>

                      <textarea
                        id="resource-form-content"
                        rows={7}
                        placeholder="Write detailed instructions, procedures, or notes..."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className={`w-full p-3 border rounded-xl text-xs text-slate-800 font-mono leading-relaxed ${
                          formErrors.content ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl min-h-[160px] max-h-60 overflow-y-auto">
                      {formContent ? (
                        renderFormattedMarkdown(formContent)
                      ) : (
                        <p className="text-slate-400 italic">No content to preview yet.</p>
                      )}
                    </div>
                  )}
                  {formErrors.content && <p className="text-[11px] text-red-500">{formErrors.content}</p>}
                </div>
              )}

              {/* 3. Document Attachment Fields (Prompt Requirement 10) */}
              {formType === 'document' && (
                <div className="space-y-3 p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80">
                  <label className="block text-slate-700 font-semibold">
                    Document File Attachment <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-0.5">File Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex_Customer_Agreement_v3.pdf"
                        value={formFileName}
                        onChange={(e) => setFormFileName(e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs text-slate-800 ${
                          formErrors.fileName ? 'border-red-400' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Version</label>
                      <input
                        type="text"
                        placeholder="e.g. v2.1"
                        value={formDocumentVersion}
                        onChange={(e) => setFormDocumentVersion(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">File Format</label>
                      <select
                        value={formFileType}
                        onChange={(e) => setFormFileType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
                      >
                        <option value="application/pdf">PDF Document (.pdf)</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</option>
                        <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (.xlsx)</option>
                        <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PowerPoint (.pptx)</option>
                        <option value="image/png">Image (.png / .jpg)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Simulated Size</label>
                      <select
                        value={formFileSize}
                        onChange={(e) => setFormFileSize(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
                      >
                        <option value="850 KB">850 KB</option>
                        <option value="1.4 MB">1.4 MB</option>
                        <option value="2.4 MB">2.4 MB</option>
                        <option value="4.8 MB">4.8 MB</option>
                        <option value="12.2 MB">12.2 MB</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-dashed border-amber-300 bg-amber-50/70 p-3 rounded-xl flex items-center justify-center gap-2 text-amber-800 text-[11px]">
                    <Upload size={14} />
                    <span>Document simulator attached securely. Download & preview enabled.</span>
                  </div>
                  {formErrors.fileName && <p className="text-[11px] text-red-500">{formErrors.fileName}</p>}
                </div>
              )}

              {/* Tags & Visibility Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales, Training, Legal, Partner"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Team Sharing & Visibility (Prompt Requirement 8)
                  </label>
                  <select
                    id="resource-form-visibility"
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as ResourceVisibility)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white"
                  >
                    <option value="everyone">🌐 Everyone (All CRM Users)</option>
                    <option value="team">👥 Team Only (Department / Assigned)</option>
                    <option value="private">🔒 Private (Only Me & Admins)</option>
                  </select>
                </div>
              </div>

              {/* Pin & Favorite Checkboxes (Prompt Requirement 7) */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="flex items-center gap-1">
                    <Pin size={13} className="text-indigo-600" />
                    <span>Pin to Quick Resources at top of page</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={formIsFavorite}
                    onChange={(e) => setFormIsFavorite(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                  />
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-400" />
                    <span>Add to Favorites</span>
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="save-resource-btn"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingResource ? 'Update Resource' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED RESOURCE DETAIL MODAL (Prompt Requirement 9 & 11) */}
      {activeDetailResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            {(() => {
              const res = activeDetailResource;
              const typeMeta = getResourceTypeMeta(res.type);
              const visMeta = getVisibilityMeta(res.visibility);
              const isUrl = res.type === 'hyperlink' || res.type === 'quicklink' || (res.url && !res.content);

              return (
                <>
                  <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${typeMeta.color}`}>
                        <typeMeta.icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeMeta.badgeColor}`}>
                            {typeMeta.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 text-slate-800">
                            {res.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${visMeta.color}`}>
                            <visMeta.icon size={10} />
                            <span>{visMeta.label}</span>
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 leading-snug">
                          {res.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteResource(res.id)}
                        className={`p-1.5 rounded-lg border border-slate-200 bg-white transition-colors ${
                          res.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Favorite"
                      >
                        <Star size={15} className={res.isFavorite ? 'fill-amber-400' : ''} />
                      </button>
                      <button
                        onClick={() => togglePinResource(res.id)}
                        className={`p-1.5 rounded-lg border border-slate-200 bg-white transition-colors ${
                          res.isPinned ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Pin"
                      >
                        <Pin size={15} className={res.isPinned ? 'fill-indigo-600' : ''} />
                      </button>
                      <button
                        onClick={() => setActiveDetailResource(null)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                    {/* Description */}
                    {res.description && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-xs">
                        {res.description}
                      </div>
                    )}

                    {/* Specific Detail Presentation by Type */}
                    {isUrl && res.url ? (
                      /* Hyperlink Display */
                      <div className="p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
                              Target Destination
                            </span>
                            <p className="font-mono text-xs text-blue-800 break-all select-all">
                              {res.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyToClipboard(res.url || '', 'Link URL')}
                              className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Copy size={13} />
                              <span>Copy Link</span>
                            </button>
                            <a
                              href={formatUrlForOpening(res.url)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => incrementResourceViews(res.id)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                              <span>Open Resource</span>
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : res.type === 'document' ? (
                      /* Document Display */
                      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{res.fileName || res.title}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Size: {res.fileSize || '2.4 MB'} · Version: {res.documentVersion || 'v1.0'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSimulateDownload(res)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <Download size={14} />
                            <span>Download File</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Text / Data Rich Viewer */
                      <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-semibold text-slate-800 text-xs">Formatted Instructions & Notes</span>
                          <button
                            onClick={() => handleCopyToClipboard(res.content || res.body || '', 'Content')}
                            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <Copy size={12} />
                            <span>Copy Text</span>
                          </button>
                        </div>
                        <div className="text-slate-800">
                          {renderFormattedMarkdown(res.content || res.body || '')}
                        </div>
                      </div>
                    )}

                    {/* Metadata & Tracking Section (Prompt Requirement 11) */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        <Info size={13} className="text-indigo-600" />
                        <span>Resource Activity & Tracking</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <p className="text-slate-400">Created By</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{res.createdBy}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Created Date</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {new Date(res.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Last Modified</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {new Date(res.lastModifiedAt || res.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Total Views</p>
                          <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                            {res.viewsCount || 0} times
                          </p>
                        </div>
                      </div>

                      {res.tags && res.tags.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-400 text-[10px]">Tags:</span>
                          {res.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[10px] font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      {canEditResource(res) && (
                        <button
                          onClick={() => {
                            setActiveDetailResource(null);
                            handleOpenEditModal(res);
                          }}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                      )}

                      {canEditResource(res) && (
                        <button
                          onClick={() => {
                            setActiveDetailResource(null);
                            setDeleteConfirmId(res.id);
                          }}
                          className="px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-semibold text-xs flex items-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveDetailResource(null)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL (Prompt Requirement 5) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Manage Resource Categories</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add Custom Category Form */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold">
                Add Custom Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sales Battlecards, Security Reviews..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      addCustomResourceCategory(newCategoryName.trim());
                      setNewCategoryName('');
                      showToast(`Added category "${newCategoryName.trim()}"`);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 text-xs">Current Categories ({allCategories.length})</p>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {allCategories.map((cat) => {
                  const isCustom = customResourceCategories?.includes(cat);
                  const count = sharedResources.filter((r) => r.category === cat).length;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{cat}</span>
                        {isCustom ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-100 text-indigo-700 font-semibold">
                            Custom
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-600 font-semibold">
                            System
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">({count} items)</span>
                      </div>

                      {isCustom && (
                        <button
                          onClick={() => {
                            deleteCustomResourceCategory(cat);
                            showToast(`Removed category "${cat}"`);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete custom category"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Resource?</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  This will remove the resource for all CRM users. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSharedResource(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('Resource deleted');
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
