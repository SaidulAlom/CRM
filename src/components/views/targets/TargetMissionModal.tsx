import React, { useState, useMemo } from 'react';
import { Target, Deal, User, Task, TaskMilestone } from '../../../types';
import { TargetCalculation, formatMetricValue } from './targetUtils';
import confetti from 'canvas-confetti';
import {
  X,
  Target as TargetIcon,
  Zap,
  Award,
  Swords,
  Shield,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
  Clock,
  Briefcase,
  AlertCircle,
  Trophy,
  CheckSquare,
} from 'lucide-react';

export type MissionType = 'boss_battle' | 'whale_hunter' | 'pipeline_blitz' | 'sprint_closer' | 'custom';
export type MissionDifficulty = 'Easy' | 'Medium' | 'Epic' | 'Boss';

interface TargetMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCalculation?: TargetCalculation | null;
  allTargets?: TargetCalculation[];
  deals: Deal[];
  users: User[];
  currentUser: User;
  onDeployMission: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  onSelectTarget?: (targetId: string) => void;
}

interface ArchetypeTemplate {
  id: MissionType;
  title: string;
  tagline: string;
  badge: string;
  difficulty: MissionDifficulty;
  xp: number;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  bgGradient: string;
  borderClass: string;
  defaultMilestones: string[];
}

const ARCHETYPES: ArchetypeTemplate[] = [
  {
    id: 'boss_battle',
    title: 'Boss Battle: Quota Smasher',
    tagline: 'Take down 100% of the remaining gap in a high-stakes tactical showdown before the cutoff date.',
    badge: '🏆 Boss Slayer',
    difficulty: 'Boss',
    xp: 1000,
    icon: Swords,
    color: 'text-rose-500',
    bgGradient: 'from-rose-500/10 via-amber-500/10 to-orange-500/10',
    borderClass: 'border-rose-400/50 hover:border-rose-500',
    defaultMilestones: [
      'Triage top-value pipeline deals with >=60% win probability',
      'Deploy executive sponsor call to key decision-maker',
      'Deliver concession/incentive term sheet valid for 7 days',
      'Obtain countersigned contract and register Won deal',
    ],
  },
  {
    id: 'whale_hunter',
    title: 'The Whale Hunt: High-Value Strike',
    tagline: 'Laser-focus on the top candidate deals that can close over 50% of your gap in one single transaction.',
    badge: '🐋 Whale Harpooner',
    difficulty: 'Epic',
    xp: 750,
    icon: Flame,
    color: 'text-amber-500',
    bgGradient: 'from-amber-500/10 via-yellow-500/10 to-orange-500/10',
    borderClass: 'border-amber-400/50 hover:border-amber-500',
    defaultMilestones: [
      'Conduct deep-dive discovery & map all buyer procurement blockers',
      'Schedule C-level executive alignment presentation',
      'Present custom ROI & multi-year enterprise discount package',
      'Clear security/legal redlines and sign Master Service Agreement',
    ],
  },
  {
    id: 'pipeline_blitz',
    title: 'Pipeline Blitz: Velocity Sprint',
    tagline: 'Rapid-fire push on 3 to 5 candidate pipeline deals in Negotiation stage to crush your quota early.',
    badge: '⚡ Lightning Closer',
    difficulty: 'Medium',
    xp: 500,
    icon: Zap,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-500/10 via-purple-500/10 to-blue-500/10',
    borderClass: 'border-indigo-400/50 hover:border-indigo-500',
    defaultMilestones: [
      'Complete urgent follow-up cadence to all 5 active prospects',
      'Submit final revised proposals with end-of-month incentives',
      'Schedule decision checkpoint calls within 48 hours',
      'Finalize closing documents for at least 3 opportunities',
    ],
  },
  {
    id: 'sprint_closer',
    title: 'Revenue Shield: Pipeline Moat',
    tagline: 'Rapid qualification sprint to establish 3x pipeline coverage and eliminate end-of-quarter risk.',
    badge: '🛡️ Quota Defender',
    difficulty: 'Easy',
    xp: 250,
    icon: Shield,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/10',
    borderClass: 'border-emerald-400/50 hover:border-emerald-500',
    defaultMilestones: [
      'Review untouched incoming qualified leads from last 14 days',
      'Engage 10 high-fit dormant accounts for expansion/upsell',
      'Move 3 accounts from Discovery into Proposal stage',
      'Validate deal sizes and commit dates with sales management',
    ],
  },
  {
    id: 'custom',
    title: 'Custom Tactical Ops',
    tagline: 'Design a bespoke battle plan with custom checkpoints, assigned teammates, and target objectives.',
    badge: '🎯 Tactical Strategist',
    difficulty: 'Medium',
    xp: 400,
    icon: TargetIcon,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/10 via-indigo-500/10 to-pink-500/10',
    borderClass: 'border-purple-400/50 hover:border-purple-500',
    defaultMilestones: [
      'Define tactical objective and alignment criteria',
      'Execute direct customer outreach and value proposal',
      'Validate commercial terms and finalize milestone deliverables',
    ],
  },
];

export const TargetMissionModal: React.FC<TargetMissionModalProps> = ({
  isOpen,
  onClose,
  targetCalculation,
  allTargets = [],
  deals,
  users,
  currentUser,
  onDeployMission,
  onSelectTarget,
}) => {
  // Current active target
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    targetCalculation ? targetCalculation.target.id : allTargets[0]?.target.id || ''
  );

  const activeCalc = useMemo(() => {
    if (targetCalculation && targetCalculation.target.id === selectedTargetId) {
      return targetCalculation;
    }
    const found = allTargets.find((t) => t.target.id === selectedTargetId);
    return found || targetCalculation || allTargets[0] || null;
  }, [selectedTargetId, targetCalculation, allTargets]);

  // Selected Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<MissionType>('boss_battle');

  // Form states
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [deadline, setDeadline] = useState<string>('');
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [customXp, setCustomXp] = useState<number>(1000);
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('Boss');
  const [badgeUnlocked, setBadgeUnlocked] = useState<string>('🏆 Boss Slayer');

  // Target candidate deals
  const targetCandidateDeals = useMemo(() => {
    if (!activeCalc) return [];
    const assignedUserIds = new Set(activeCalc.target.assignedUserIds || []);
    return deals
      .filter((d) => !d.deletedAt && d.status !== 'won' && d.stage !== 'won' && assignedUserIds.has(d.ownerId))
      .sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [activeCalc, deals]);

  // Initialize or re-template when archetype or active target changes
  const applyArchetype = (type: MissionType, calc: TargetCalculation | null) => {
    const arch = ARCHETYPES.find((a) => a.id === type) || ARCHETYPES[0];
    const targetName = calc ? calc.target.name : 'Sales Target';
    const remainingVal = calc ? formatMetricValue(calc.remaining, calc.target.type, calc.target.currency) : '$50,000';
    const daysLeft = calc ? Math.max(1, calc.timeRemainingDays) : 14;

    let autoTitle = '';
    let autoDesc = '';

    if (type === 'boss_battle') {
      autoTitle = `⚔️ Boss Fight: Slay ${remainingVal} Gap for "${targetName}"`;
      autoDesc = `High-priority tactical mission to close the remaining ${remainingVal} gap before the target deadline in ${daysLeft} days.`;
    } else if (type === 'whale_hunter') {
      const topDeal = targetCandidateDeals[0];
      const dealLabel = topDeal ? `${topDeal.title} (${formatMetricValue(topDeal.value, 'revenue', topDeal.currency)})` : 'Top Pipeline Whale';
      autoTitle = `🐋 Whale Strike: Close ${dealLabel}`;
      autoDesc = `Concentrated execution on top-tier opportunity to secure the decisive chunk of quota for "${targetName}".`;
    } else if (type === 'pipeline_blitz') {
      autoTitle = `⚡ Pipeline Blitz: 48-Hour Multi-Deal Sprint (${targetName})`;
      autoDesc = `Accelerate negotiation and proposals for candidate pipeline opportunities to lock in target quota.`;
    } else if (type === 'sprint_closer') {
      autoTitle = `🛡️ Revenue Shield: 3x Quota Pipeline Expansion`;
      autoDesc = `Fast-track qualification and discovery to build ironclad buffer for "${targetName}".`;
    } else {
      autoTitle = `🎯 Tactical Mission: Achieve "${targetName}"`;
      autoDesc = `Custom strategy and coordinated execution to hit target goal.`;
    }

    setMissionTitle(autoTitle);
    setMissionDescription(autoDesc);
    setCustomXp(arch.xp);
    setDifficulty(arch.difficulty);
    setBadgeUnlocked(arch.badge);

    // Default milestones
    setMilestones(
      arch.defaultMilestones.map((text, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        title: text,
        completed: false,
      }))
    );

    // Set deadline (either target endDate or 7 days, whichever is closer)
    if (calc?.target.endDate) {
      setDeadline(calc.target.endDate);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDeadline(d.toISOString().split('T')[0]);
    }

    // Default deal
    if (targetCandidateDeals.length > 0) {
      setSelectedDealId(targetCandidateDeals[0].id);
    } else {
      setSelectedDealId('');
    }
  };

  // Re-run template when opened or target switches
  React.useEffect(() => {
    if (isOpen && activeCalc) {
      applyArchetype(selectedArchetype, activeCalc);
    }
  }, [isOpen, selectedTargetId]);

  if (!isOpen) return null;

  const currentArchetype = ARCHETYPES.find((a) => a.id === selectedArchetype) || ARCHETYPES[0];
  const IconComponent = currentArchetype.icon;

  const handleArchetypeClick = (type: MissionType) => {
    setSelectedArchetype(type);
    applyArchetype(type, activeCalc);
  };

  const handleTargetChange = (tId: string) => {
    setSelectedTargetId(tId);
    if (onSelectTarget) onSelectTarget(tId);
    const newCalc = allTargets.find((t) => t.target.id === tId) || null;
    applyArchetype(selectedArchetype, newCalc);
  };

  const addMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-${Date.now()}`,
        title: newMilestoneText.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneText('');
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeploy = () => {
    if (!missionTitle.trim() || !deadline) return;

    // Fire fireworks / confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const linkedDeal = deals.find((d) => d.id === selectedDealId);

    onDeployMission({
      title: missionTitle.trim(),
      deadline,
      status: 'In Progress',
      completionPercentage: 10,
      assigneeId,
      companyId: linkedDeal?.companyId,
      contactId: linkedDeal?.contactId,
      description: missionDescription.trim(),
      // Gamified Target Mission attributes
      targetId: activeCalc?.target.id,
      dealId: selectedDealId || undefined,
      isTargetMission: true,
      missionType: selectedArchetype,
      missionDifficulty: difficulty,
      xpReward: customXp,
      targetGapSnapshot: activeCalc ? activeCalc.remaining : 0,
      badgeUnlocked,
      milestones,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Gamified Gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles size={12} />
                Target Achievement Quest System
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                +{customXp} XP Reward
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Swords size={20} className="text-rose-400" />
              Launch Target Mission: Gamified Sales Quest
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Turn abstract sales targets into high-energy, actionable missions. Link candidate pipeline deals, assign milestone checkpoints, and reward your team with XP & victory badges!
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Target Selector & Boss HP Bar */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TargetIcon size={14} className="text-indigo-400" />
                Target To Conquer:
              </label>

              {allTargets.length > 0 && (
                <select
                  value={activeCalc?.target.id || ''}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {allTargets.map((t) => (
                    <option key={t.target.id} value={t.target.id}>
                      {t.target.name} ({formatMetricValue(t.remaining, t.target.type, t.target.currency)} Gap)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Boss HP / Target Gap Visualizer */}
            {activeCalc && (
              <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Flame size={14} className="text-rose-400" />
                    <span>Target Gap (Boss HP):</span>
                    <span className="text-rose-400 font-bold text-sm">
                      {formatMetricValue(activeCalc.remaining, activeCalc.target.type, activeCalc.target.currency)}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Current Attainment: <span className="text-emerald-400 font-bold">{activeCalc.percent}%</span> (
                    {formatMetricValue(activeCalc.actual, activeCalc.target.type, activeCalc.target.currency)} /{' '}
                    {formatMetricValue(activeCalc.goal, activeCalc.target.type, activeCalc.target.currency)})
                  </div>
                </div>

                {/* Attainment vs Gap Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-l-full"
                    style={{ width: `${Math.min(100, activeCalc.percent)}%` }}
                    title={`Achieved: ${activeCalc.percent}%`}
                  />
                  <div
                    className="bg-gradient-to-r from-rose-500/80 to-amber-500/80 h-full flex-1 animate-pulse"
                    title={`Gap to Conquer: ${100 - activeCalc.percent}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" />
                    Deadline: <strong className="text-slate-200">{activeCalc.target.endDate}</strong> ({activeCalc.timeRemainingDays} days remaining)
                  </span>
                  <span>
                    Team: <strong className="text-slate-200">{activeCalc.target.assignedUserIds?.length || 1} rep(s)</strong> assigned
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Archetype Selector Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                Select Quest Archetype:
              </label>
              <span className="text-[11px] text-slate-400">Click to automatically tailor tactics & milestones</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARCHETYPES.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                const ArchIcon = arch.icon;
                return (
                  <div
                    key={arch.id}
                    onClick={() => handleArchetypeClick(arch.id)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-lg bg-slate-950 ${arch.color}`}>
                          <ArchIcon size={16} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              arch.difficulty === 'Boss'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : arch.difficulty === 'Epic'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : arch.difficulty === 'Medium'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {arch.difficulty}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400">+{arch.xp} XP</span>
                        </div>
                      </div>

                      <div className="font-bold text-xs text-white pt-1">{arch.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{arch.tagline}</p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-amber-300/90 font-medium">{arch.badge}</span>
                      {isSelected ? (
                        <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                          Selected <CheckCircle2 size={12} />
                        </span>
                      ) : (
                        <span className="text-slate-500 hover:text-slate-300">Choose &rarr;</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mission Configuration Form */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700/80 space-y-4">
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <Zap size={14} className="text-indigo-400" />
              Mission Parameters & Tactical Setup
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mission Title */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300">Mission Quest Title</label>
                <input
                  type="text"
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  placeholder="e.g. Slay $50k Gap for Q3 Revenue"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300">Mission Briefing / Strategy</label>
                <textarea
                  rows={2}
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  placeholder="Strategic brief for completing this quest..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Linked Candidate Deal */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Linked Pipeline Opportunity</span>
                  <span className="text-[10px] text-indigo-400">Optional</span>
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">-- No specific deal (General Target Mission) --</option>
                  {targetCandidateDeals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({formatMetricValue(d.value, 'revenue', d.currency)}) - {d.stage}
                    </option>
                  ))}
                </select>
                {selectedDealId && (
                  <p className="text-[10px] text-emerald-400">
                    Won status on this deal will directly advance target attainment!
                  </p>
                )}
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Quest Champion (Assignee)</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Mission Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Difficulty & XP Reward */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>XP Reward & Difficulty</span>
                  <span className="text-[10px] text-amber-400 font-bold">{customXp} XP</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Easy', 'Medium', 'Epic', 'Boss'] as const).map((diff) => {
                    const isDiffSelected = difficulty === diff;
                    const diffXp = diff === 'Easy' ? 250 : diff === 'Medium' ? 500 : diff === 'Epic' ? 750 : 1000;
                    return (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => {
                          setDifficulty(diff);
                          setCustomXp(diffXp);
                        }}
                        className={`py-1.5 rounded text-[10px] font-bold transition-colors ${
                          isDiffSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tactical Milestones / Checkpoints */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-emerald-400" />
                  Tactical Milestones ({milestones.length})
                </label>
                <span className="text-[10px] text-slate-400">
                  Checking these off in the Task View advances the mission progress
                </span>
              </div>

              <div className="space-y-1.5">
                {milestones.map((ms, idx) => (
                  <div
                    key={ms.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs">{ms.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(ms.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove milestone"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {/* Add milestone row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMilestone();
                      }
                    }}
                    placeholder="Add custom milestone (e.g. Schedule CTO demo)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Victory Badge Card */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Victory Unlockable Badge
                  </div>
                  <div className="text-xs font-bold text-white">{badgeUnlocked}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 font-black rounded-lg text-xs border border-amber-500/30">
                  +{customXp} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>Task will appear in Tasks & Activities with special gamified Quest controls.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={!missionTitle.trim() || !deadline}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Swords size={15} />
              <span>Deploy Quest (+{customXp} XP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
