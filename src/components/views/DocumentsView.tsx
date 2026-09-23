import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Folder as FolderIcon,
  FolderPlus,
  FileText,
  Upload,
  HardDrive,
  Trash2,
  Download,
  Building2,
  Users,
  Search,
} from 'lucide-react';
import { Folder, DocumentFile } from '../../types';

export const DocumentsView: React.FC = () => {
  const {
    folders,
    documents,
    totalStorageUsedBytes,
    storageQuotaBytes,
    companies,
    contacts,
    currentUser,
    addFolder,
    addDocument,
    deleteDocument,
  } = useCRM();

  const [activeFolderId, setActiveFolderId] = useState<string>('folder-1');
  const [search, setSearch] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState(1024 * 1024 * 2); // 2 MB
  const [uploadCompanyId, setUploadCompanyId] = useState('');

  // New Folder state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const activeFolder = folders.find((f: Folder) => f.id === activeFolderId) || folders[0];

  const filteredDocuments = useMemo(() => {
    return documents.filter((d: DocumentFile) => {
      const matchFolder = !activeFolderId || d.folderId === activeFolderId;
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase());
      return matchFolder && matchSearch;
    });
  }, [documents, activeFolderId, search]);

  const usedPercentage = Math.round((totalStorageUsedBytes / storageQuotaBytes) * 100);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFileName.trim()) return;

    // Check storage quota (FR-11.5)
    if (totalStorageUsedBytes + uploadFileSize > storageQuotaBytes) {
      alert('Upload failed: Storage quota exceeded for your organisation!');
      return;
    }

    addDocument({
      title: uploadTitle.trim(),
      folderId: activeFolderId || (folders[0]?.id ?? 'folder-1'),
      fileName: uploadFileName.trim(),
      fileSize: uploadFileSize,
      fileType: 'application/pdf',
      version: '1.0',
      uploadedBy: currentUser.name,
      companyId: uploadCompanyId || undefined,
    });

    setShowUploadModal(false);
    setUploadTitle('');
    setUploadFileName('');
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), undefined, activeFolderId || null);
    setShowNewFolderModal(false);
    setNewFolderName('');
  };

  return (
    <div id="documents-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Documents & Knowledge Base</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {documents.length} files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organise proposals, NDAs, security collaterals, and customer agreements in hierarchical folders with quota tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
          >
            <FolderPlus size={15} />
            <span>New Folder</span>
          </button>
          <button
            id="upload-document-btn"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload size={15} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main layout: Left folder tree + quota card, right file table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left column: Folders & Quota Gauge (FR-11.5) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Folder Directory
            </h3>

            <div className="space-y-1 text-xs">
              {folders.map((f: Folder) => (
                <div
                  key={f.id}
                  onClick={() => setActiveFolderId(f.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    activeFolderId === f.id
                      ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon size={15} className={activeFolderId === f.id ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{f.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {documents.filter((d: DocumentFile) => d.folderId === f.id).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Quota Gauge (FR-11.5) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <HardDrive size={15} className="text-indigo-600" />
                Storage Quota
              </span>
              <span className="font-semibold text-indigo-600">{usedPercentage}% used</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usedPercentage > 85 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${usedPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{(totalStorageUsedBytes / 1024 / 1024 / 1024).toFixed(2)} GB used</span>
              <span>{(storageQuotaBytes / 1024 / 1024 / 1024).toFixed(0)} GB total</span>
            </div>
          </div>
        </div>

        {/* Right column: Document list */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FolderIcon size={16} className="text-indigo-600" />
              <span>Current Folder: {activeFolder?.name || 'All Files'}</span>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Document Title</th>
                  <th className="px-4 py-3">Linked Record</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No documents found in this folder.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc: DocumentFile) => {
                    const company = companies.find((c) => c.id === doc.companyId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-purple-600 shrink-0" />
                            <div>
                              <span>{doc.title}</span>
                              <div className="text-[10px] font-normal text-slate-400">{doc.fileName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {company ? (
                            <span className="text-indigo-600 font-medium">
                              {company.name}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            v{doc.version}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => alert(`Simulated downloading ${doc.fileName}`)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Download document"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${doc.title}?`)) deleteDocument(doc.id);
                              }}
                              className="p-1 text-slate-300 hover:text-rose-600 rounded"
                              title="Delete file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Upload Document to {activeFolder?.name || 'Root'}</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Master Service Agreement 2026"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">File Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. MSA_Final_Signed.pdf"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Attach to Company (Optional)</label>
              <select
                value={uploadCompanyId}
                onChange={(e) => setUploadCompanyId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">None</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Create New Folder</h3>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Security Whitepapers"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
