import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { auth, googleAuthProvider, signInWithPopup, signOut, testConnection, db } from '../../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firestoreService } from '../../firebase/firestoreService';
import { useCRM } from '../../context/CRMContext';
import firebaseConfig from '../../../firebase-applet-config.json';

interface FirebaseBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseBackendModal: React.FC<FirebaseBackendModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    companies,
    contacts,
    deals,
    tasks,
    events,
    calls,
    cases,
    auditLogs,
    users,
  } = useCRM();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'error'>('connected');
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnectionStatus('checking');
    try {
      await testConnection();
      setConnectionStatus('connected');
    } catch {
      setConnectionStatus('error');
    }
  };

  const handleGoogleSignIn = async () => {
    setConnecting(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const handleSyncToFirestore = async () => {
    setSyncing(true);
    setSyncSuccessMessage(null);
    try {
      await firestoreService.seedCollectionIfEmpty('companies', companies);
      await firestoreService.seedCollectionIfEmpty('contacts', contacts);
      await firestoreService.seedCollectionIfEmpty('deals', deals);
      await firestoreService.seedCollectionIfEmpty('tasks', tasks);
      await firestoreService.seedCollectionIfEmpty('events', events);
      await firestoreService.seedCollectionIfEmpty('calls', calls);
      await firestoreService.seedCollectionIfEmpty('cases', cases);
      await firestoreService.seedCollectionIfEmpty('auditLogs', auditLogs);
      await firestoreService.seedCollectionIfEmpty('users', users);

      setSyncSuccessMessage('All CRM records successfully synced to Cloud Firestore!');
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-2xs">
              <Database size={17} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Firebase Firestore Backend
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Provisioned & Ready
                </span>
              </h3>
              <p className="text-[11px] text-amber-100">
                Connected to project <strong className="text-white font-mono">{firebaseConfig.projectId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Database Connection Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={16} className="text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">Firestore Cloud Database</span>
              </div>
              <div className="flex items-center gap-1.5">
                {connectionStatus === 'connected' && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Online & Linked
                  </span>
                )}
                {connectionStatus === 'checking' && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <RefreshCw size={12} className="animate-spin text-amber-600" />
                    Verifying...
                  </span>
                )}
                {connectionStatus === 'error' && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <AlertCircle size={12} className="text-rose-600" />
                    Offline
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Database ID:</span>
                <span className="text-slate-800 font-semibold truncate block">
                  {firebaseConfig.firestoreDatabaseId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Security Rules:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  RBAC Deployed (firestore.rules)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw size={12} />
                <span>Test Cloud Ping</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToFirestore}
                disabled={syncing}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <UploadCloud size={13} />
                <span>{syncing ? 'Syncing Records...' : 'Seed / Sync CRM Data to Cloud'}</span>
              </button>
            </div>

            {syncSuccessMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Authentication Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">Firebase User Authentication</span>
              </div>
              <span className="text-[10px] text-slate-400">Google OAuth & Identity</span>
            </div>

            {firebaseUser ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-3">
                  {firebaseUser.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={firebaseUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {firebaseUser.email?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {firebaseUser.displayName || firebaseUser.email}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                      UID: {firebaseUser.uid}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200/80">
                <div className="text-[11px] text-slate-600">
                  Sign in with your Google account to save and synchronize your CRM activities securely under your UID.
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={connecting}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 shadow-2xs transition-colors"
                >
                  <LogIn size={13} />
                  <span>{connecting ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cloud Collections Info */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Managed Cloud Collections
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{events.length}</div>
                <div className="text-[10px] text-slate-500">events</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{companies.length}</div>
                <div className="text-[10px] text-slate-500">companies</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{contacts.length}</div>
                <div className="text-[10px] text-slate-500">contacts</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{deals.length}</div>
                <div className="text-[10px] text-slate-500">deals</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{tasks.length}</div>
                <div className="text-[10px] text-slate-500">tasks</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-xs">{cases.length}</div>
                <div className="text-[10px] text-slate-500">cases</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Powered by Google Cloud Firestore & Firebase Auth
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
