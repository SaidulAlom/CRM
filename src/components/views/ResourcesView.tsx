import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Bookmark,
  Plus,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Search,
  Tag,
} from 'lucide-react';
import { SharedResource } from '../../types';

export const ResourcesView: React.FC = () => {
  const { sharedResources, addSharedResource, users } = useCRM();

  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'link' | 'note'>('link');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Sales, Playbook');

  const allTags = Array.from(
    new Set(sharedResources.flatMap((r) => r.tags || []))
  );

  const filtered = sharedResources.filter((r) => {
    const contentText = r.content || r.body || r.url || '';
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      contentText.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === 'All' || (r.tags && r.tags.includes(tagFilter));
    return matchSearch && matchTag;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addSharedResource({
      title: newTitle.trim(),
      type: newType,
      url: newType === 'link' ? newContent.trim() : undefined,
      body: newType === 'note' ? newContent.trim() : undefined,
      content: newContent.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div id="resources-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shared Team Knowledge & Resources</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              FR-16 Repository
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of shared sales decks, call scripts, external portal links, and onboarding notes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={15} />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search shared resources by title or contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Tag:</span>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="All">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => {
          const author = users.find((u) => u.id === res.createdBy || u.name === res.createdBy);
          const itemContent = res.content || (res.type === 'link' ? res.url : res.body) || '';
          const isUrl = res.type === 'link' || itemContent.startsWith('http');

          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 text-xs hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      {isUrl ? <LinkIcon size={14} /> : <FileText size={14} />}
                    </div>
                    <span className="font-bold text-sm text-slate-900 line-clamp-1">{res.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                    {res.type}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 text-xs break-words max-h-36 overflow-y-auto">
                  {isUrl ? (
                    <a
                      href={itemContent}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>{itemContent}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{itemContent}</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {res.tags?.map((tg: string) => (
                    <span
                      key={tg}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
                <span className="text-slate-400">{author?.name?.split(' ')[0] || res.createdBy || 'Team'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Add Shared Team Resource (FR-16.1)</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Sales Playbook & Objection Responses"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resource Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="link">External Link / URL</option>
                  <option value="note">Shared Markdown / Note</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Sales, Pitch, Legal"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {newType === 'link' ? 'Resource URL *' : 'Markdown Note / Body *'}
              </label>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={newType === 'link' ? 'https://docs.google.com/...' : 'Write notes, script snippets, or meeting guidelines here...'}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
