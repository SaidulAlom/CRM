import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Building2,
  Users,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User as UserIcon,
} from 'lucide-react';
import { UserRole, User } from '../../types';
import { ProfilePreferencesView } from './profile/ProfilePreferencesView';
import { BrandLogo } from '../common/BrandLogo';

interface SettingsViewProps {
  initialTab?: 'profile' | 'organisation' | 'users' | 'picklists' | 'demo';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'profile' }) => {
  const {
    organisation,
    updateOrganisation,
    users,
    addUser,
    updateUser,
    toggleUserActive,
    fieldSets,
    updateFieldSets,
    currentUser,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'profile' | 'organisation' | 'users' | 'picklists' | 'demo'>(
    initialTab
  );

  // Org form state
  const [orgName, setOrgName] = useState(organisation.name);
  const [orgAddress, setOrgAddress] = useState(organisation.address);
  const [orgWebsite, setOrgWebsite] = useState(organisation.website);
  const [orgCurrency, setOrgCurrency] = useState(organisation.defaultCurrency);
  const [orgTimeZone, setOrgTimeZone] = useState(organisation.timeZone);
  const [orgLogoUrl, setOrgLogoUrl] = useState(organisation.logoUrl || '');

  // New user state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('standard');

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganisation({
      name: orgName,
      address: orgAddress,
      website: orgWebsite,
      defaultCurrency: orgCurrency,
      timeZone: orgTimeZone,
      logoUrl: orgLogoUrl.trim(),
    });
    alert('Organisation profile and logo saved successfully!');
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      active: true,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
      unavailableDates: [],
      preferences: {
        theme: 'light',
        timeZone: 'America/New_York',
        defaultCurrency: 'USD',
        welcomeText: 'Welcome to your CRM Workspace',
        clockMode: '12h',
        activityDepth: 30,
        workingDayStart: '09:00',
        workingDayEnd: '17:00',
      },
    });
    setNewUserName('');
    setNewUserEmail('');
    alert(`Invitation created for ${newUserEmail}!`);
  };

  const handleUpdateStageProbability = (stageId: string, prob: number) => {
    const updated = fieldSets.dealStages.map((s) =>
      s.id === stageId ? { ...s, probability: prob } : s
    );
    updateFieldSets({ dealStages: updated });
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset all data back to original demo state?')) {
      try {
        localStorage.removeItem('zenith_crm_state_v1');
      } catch (e) {
        // ignore
      }
      window.location.reload();
    }
  };

  return (
    <div id="settings-view" className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Organisation Administration</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure organisation details, invite colleagues, assign roles (FR-17.2), fine-tune deal stage probabilities (FR-17.4), and reset demo data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon size={14} />
          <span>My Profile & Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('organisation')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'organisation'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={14} />
          <span>Organisation Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} />
          <span>Team Members & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('picklists')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'picklists'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={14} />
          <span>Pipeline Stages & Picklists</span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'demo'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={14} />
          <span>Demo Data Management</span>
        </button>
      </div>

      {/* Tab 0: Profile & Preferences */}
      {activeTab === 'profile' && <ProfilePreferencesView />}

      {/* Tab 1: Organisation Profile */}
      {activeTab === 'organisation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl text-xs">
          <form onSubmit={handleSaveOrg} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Organisation Profile (FR-17.1)</h3>

            {/* Logo Configuration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
              <label className="block font-bold text-slate-800">Organisation Logo</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="shrink-0 flex items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-xs">
                  <BrandLogo size="lg" customUrl={orgLogoUrl} />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[11px] text-slate-500">
                    This logo appears in your CRM sidebar, navigation bar, email invitations, and exports.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Custom Logo Image URL (PNG, SVG, JPG)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png (leave blank to use default Apex SVG mark)"
                      value={orgLogoUrl}
                      onChange={(e) => setOrgLogoUrl(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  {orgLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setOrgLogoUrl('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Reset to Default Vector Apex Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Organisation Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Business Address</label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Website</label>
              <input
                type="url"
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Default Base Currency</label>
                <select
                  value={orgCurrency}
                  onChange={(e) => setOrgCurrency(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">System Time Zone</label>
                <select
                  value={orgTimeZone}
                  onChange={(e) => setOrgTimeZone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="America/New_York">America/New York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Users & Role Management (FR-17.2) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Invite User Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Invite New Team Member</h3>
            <form onSubmit={handleInviteUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@apexlogix.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Role</label>
                <div className="flex gap-2">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="standard">Standard User</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shrink-0"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Colleague</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u: User) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as UserRole })}
                        className="px-2 py-1 border border-slate-200 rounded text-xs capitalize bg-white"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="standard">Standard</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className="text-slate-400 hover:text-rose-600 text-xs"
                        >
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Deal Stages & Picklists (FR-17.4) */}
      {activeTab === 'picklists' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Deal Pipeline Stages & Win Probabilities (FR-17.4)
            </h3>
            <p className="text-slate-500 text-xs">
              Customise deal stage titles, sequence order, and standard probability percentages for pipeline forecasting.
            </p>

            <div className="space-y-2">
              {fieldSets.dealStages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-slate-900">{stage.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Win Probability:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={stage.probability}
                      onChange={(e) => handleUpdateStageProbability(stage.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center font-bold border border-slate-300 rounded bg-white"
                    />
                    <span className="font-bold text-slate-700">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Sample Demo Data Generator (FR-17.5) */}
      {activeTab === 'demo' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl space-y-4 text-xs">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-base text-slate-900">Sample Demo Data Generator</h3>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Quickly re-populate your CRM database with a full set of realistic enterprise companies, contacts, multi-stage deals, support cases, call queue entries, calendar events, and team quotas for testing and onboarding.
          </p>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-800 space-y-1 text-[11px]">
            <span className="font-bold block">Notice:</span>
            <span>This action will restore all default records and clear any locally cached changes.</span>
          </div>

          <button
            onClick={handleResetDemoData}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
          >
            <RotateCcw size={15} />
            <span>Reset Database to Demo Fixtures</span>
          </button>
        </div>
      )}
    </div>
  );
};
