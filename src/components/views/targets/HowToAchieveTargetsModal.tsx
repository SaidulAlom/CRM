import React, { useState, useMemo } from 'react';
import { TargetCalculation, formatMetricValue } from './targetUtils';
import { Target, Deal, User } from '../../../types';
import { TargetMissionModal } from './TargetMissionModal';
import { useCRM } from '../../../context/CRMContext';
import {
  X,
  Target as TargetIcon,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Package,
  LifeBuoy,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';

interface HowToAchieveTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: TargetCalculation[];
  deals: Deal[];
  currentUser: User;
  onNavigateToDeals: () => void;
}

export const HowToAchieveTargetsModal: React.FC<HowToAchieveTargetsModalProps> = ({
  isOpen,
  onClose,
  targets,
  deals,
  currentUser,
  onNavigateToDeals,
}) => {
  const { addTask, users } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'playbook' | 'workflow'>('overview');
  const [showMissionModal, setShowMissionModal] = useState(false);

  // Calculator State
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    targets.length > 0 ? targets[0].target.id : ''
  );
  const [customGoal, setCustomGoal] = useState<number>(100000);
  const [customCurrent, setCustomCurrent] = useState<number>(45000);
  const [customAvgDealSize, setCustomAvgDealSize] = useState<number>(15000);
  const [customWinRate, setCustomWinRate] = useState<number>(33);
  const [customDaysRemaining, setCustomDaysRemaining] = useState<number>(30);

  // Selected target for the calculator
  const selectedCalculation = useMemo(() => {
    return targets.find((t) => t.target.id === selectedTargetId) || targets[0];
  }, [targets, selectedTargetId]);

  // Sync calculator with selected target when changed
  const handleSelectTarget = (targetId: string) => {
    setSelectedTargetId(targetId);
    const found = targets.find((t) => t.target.id === targetId);
    if (found) {
      setCustomGoal(found.goal);
      setCustomCurrent(found.actual);
      setCustomDaysRemaining(Math.max(1, found.timeRemainingDays));
    }
  };

  // Calculator computations
  const calcGap = Math.max(0, customGoal - customCurrent);
  const calcAttainment = customGoal > 0 ? Math.min(100, Math.round((customCurrent / customGoal) * 100)) : 0;
  const calcDealsNeeded = customAvgDealSize > 0 ? Math.ceil(calcGap / customAvgDealSize) : 0;
  const calcPipelineMultiplier = customWinRate > 0 ? (100 / customWinRate) : 3;
  const calcPipelineRequired = Math.round(calcGap * calcPipelineMultiplier);
  const calcDailyPace = customDaysRemaining > 0 ? Math.round(calcGap / customDaysRemaining) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                <Compass size={16} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Strategic Guidance & Execution
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              How to Achieve Sales Targets in the CRM
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Understand the target achievement mechanics, calculate exact deal requirements to close your quota gap, and follow the field-tested sales playbook.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap size={14} />
            <span>Achievement Mechanics</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={14} />
            <span>Interactive Quota Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={14} />
            <span>The 5-Pillar Sales Playbook</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Step-by-Step CRM Workflow</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs space-y-6">
          {/* TAB 1: HOW THE CRM CALCULATES AND ACCEPTS ACHIEVEMENT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span>How Target Achievement Works Automatically in this CRM</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Sales targets in this system are connected to real CRM records. You do not need to manually report numbers unless overriding. When team members conduct their daily sales activities, the engine continuously aggregates results in real time.
                </p>
              </div>

              {/* The 4 Strict Criteria */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">
                  The 4 Attribution Rules for Target Achievement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Assignee Matching</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      The record owner (deal owner, support rep, or contact creator) must be listed among the target’s <strong>Assigned Team Members</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>Date Window Inclusion</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      The deal close date (or case resolution date) must fall between the target’s <strong>Start Date</strong> and <strong>End Date</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                      <span>Won / Closed Status</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      For revenue & deals targets, the deal status must be marked as <strong>“Closed Won”</strong> (or moved to the Won stage in the pipeline). Open pipeline deals do not count until won.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
                      <span>Pacing & Health Status</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Pacing compares attainment % against elapsed calendar days %. If attainment keeps pace with time elapsed, the target is <strong>“On Track”</strong>; otherwise it flags <strong>“At Risk”</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Types Breakdown Table */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">
                  How Each Target Type is Achieved
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Target Type</th>
                        <th className="py-2.5 px-3">What Contributes</th>
                        <th className="py-2.5 px-3">How to Increment It</th>
                        <th className="py-2.5 px-3">Example Goal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <DollarSign size={14} className="text-emerald-600" />
                          <span>Revenue Target</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">Total dollar value ($) of won deals</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Mark deal as Closed Won or finish sale via POS</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">$250,000</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <Briefcase size={14} className="text-indigo-600" />
                          <span>Deals Closed</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">Total count of won deals</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Each won deal increments target count by +1</td>
                        <td className="py-2.5 px-3 text-indigo-600 font-bold">25 deals</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <Package size={14} className="text-purple-600" />
                          <span>Units Sold</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">Won enterprise contract software/hardware packages</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Close deals with designated package contracts</td>
                        <td className="py-2.5 px-3 text-purple-600 font-bold">50 units</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <LifeBuoy size={14} className="text-sky-600" />
                          <span>Cases Resolved</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">Support tickets marked Closed or Resolved</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Resolve customer support inquiries in Cases</td>
                        <td className="py-2.5 px-3 text-sky-600 font-bold">80 cases</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <Users size={14} className="text-amber-600" />
                          <span>New Customers</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">Newly created contacts marked as Customer</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">Add new customer contact or convert lead</td>
                        <td className="py-2.5 px-3 text-amber-600 font-bold">30 customers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TARGET CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Preset from Active Target
                  </span>
                  <div className="text-xs font-bold text-slate-800">
                    Select an active CRM target to auto-fill its quota gap and timeline:
                  </div>
                </div>
                <select
                  value={selectedTargetId}
                  onChange={(e) => handleSelectTarget(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-bold text-indigo-700"
                >
                  {targets.map((c) => (
                    <option key={c.target.id} value={c.target.id}>
                      {c.target.name} ({formatMetricValue(c.goal, c.target.type, c.target.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculator Inputs & Result Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Target Quota & Sales Parameters
                  </h4>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Total Target Quota ($)
                    </label>
                    <input
                      type="number"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Current Won Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={customCurrent}
                      onChange={(e) => setCustomCurrent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Expected Average Deal Size ($)
                    </label>
                    <input
                      type="number"
                      value={customAvgDealSize}
                      onChange={(e) => setCustomAvgDealSize(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Win Rate (% Won)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customWinRate}
                        onChange={(e) => setCustomWinRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Days Remaining
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customDaysRemaining}
                        onChange={(e) => setCustomDaysRemaining(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Outputs & Tactical Requirements */}
                <div className="space-y-4 p-4 border border-indigo-100 rounded-xl bg-indigo-50/40">
                  <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Exact Requirements to Reach 100% Target</span>
                  </h4>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Remaining Gap</span>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        ${calcGap.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-medium">{calcAttainment}% reached</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Deals to Close</span>
                      <div className="text-lg font-bold text-indigo-600 mt-0.5">
                        {calcDealsNeeded} Deals
                      </div>
                      <span className="text-[10px] text-slate-500">at ~${customAvgDealSize.toLocaleString()} avg</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Required Pipeline</span>
                      <div className="text-lg font-bold text-amber-700 mt-0.5">
                        ${calcPipelineRequired.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500">at {customWinRate}% close rate ({calcPipelineMultiplier.toFixed(1)}x coverage)</span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Daily Pacing Pace</span>
                      <div className="text-lg font-bold text-emerald-700 mt-0.5">
                        ${calcDailyPace.toLocaleString()}/day
                      </div>
                      <span className="text-[10px] text-slate-500">over {customDaysRemaining} days remaining</span>
                    </div>
                  </div>

                  {/* Formula explanation */}
                  <div className="p-3 bg-white rounded-lg border border-indigo-100 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-900">The Target Achievement Formula:</span>
                    <p>
                      <strong>1. Deal Quantity:</strong> Remaining Gap (${calcGap.toLocaleString()}) ÷ Avg Deal Size (${customAvgDealSize.toLocaleString()}) = <strong>{calcDealsNeeded} won deals</strong> needed.
                    </p>
                    <p>
                      <strong>2. Pipeline Safety Buffer:</strong> With a {customWinRate}% win rate, you must maintain <strong>${calcPipelineRequired.toLocaleString()}</strong> in active proposals or negotiations so normal drop-offs don't jeopardize the target.
                    </p>
                  </div>

                  {/* Launch Quest Button */}
                  <button
                    onClick={() => setShowMissionModal(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Swords size={15} />
                    <span>Turn this Calculation into an Actionable Quest Mission</span>
                    <Sparkles size={13} className="text-amber-300" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THE 5-PILLAR SALES PLAYBOOK */}
          {activeTab === 'playbook' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>The 5-Pillar Sales Quota Execution Framework</span>
                </h3>
                <p className="text-slate-600 text-xs">
                  How high-performing sales representatives and managers consistently exceed quota before month-end:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Maintain 3x Pipeline Coverage</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Never rely on a 1:1 pipeline where every deal must close. Because 50–60% of proposals encounter budget delays or competitor pushback, keep 300% of your remaining quota gap in active pipeline deals.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Accelerate Deals in "Negotiation" & "Proposal"</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Deals in the final stages have the highest probability of closing this period. Identify stalled negotiations, schedule a live decision-maker call, offer a limited-time incentive or bundle discount, and secure signature.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Increase Average Deal Size via Upselling & Add-ons</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Reaching target by closing 10 small deals takes 5x more effort than expanding 3 existing opportunities. Bundle onboarding packages, premium service tiers, or multi-year terms to expand deal values.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Eliminate "Zombie" Deals & Unblock Stalled Opportunities</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Review all deals without next steps or overdue closing dates. Set a firm next action (call, demo, or revised proposal) or disqualify so your focus remains on revenue-generating opportunities.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    5
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">Pacing Discipline & Weekly Micro-Targets</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Break monthly or quarterly targets down into weekly milestones. If you are trailing behind expected calendar pace, take corrective prospecting action in week 2 rather than scrambling in week 4.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP CRM WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  How to Record Your Wins in the CRM
                </h4>
                <p className="text-slate-600 text-xs">
                  Follow these 4 simple steps to record sales and see your target progress update immediately.
                </p>
              </div>

              <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6">
                {/* Step 1 */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Go to Deals Pipeline or POS
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Open <strong>Deals</strong> in the primary navigation sidebar to view your active sales pipeline, or use <strong>POS</strong> for direct counter sales.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Verify Assignee & Expected Close Date
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Ensure the deal's <strong>Owner</strong> matches an assigned member on the target, and that the <strong>Expected Close Date</strong> is within the target's date range.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Move Deal Stage to "Closed Won"
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Drag the deal into the <strong>Won</strong> column on the Kanban board, or open the deal and change its stage to <strong>Closed Won</strong>.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Inspect the Live Progress Bar in Targets
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Return to <strong>Sales Targets</strong>. The system recalculates attainment instantly, updates the progress gauge, and records the achievement in audit history.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDeals();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>Open Deals Pipeline Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Target tracking updates live from won deals and closed tickets.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToDeals();
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Briefcase size={13} className="text-indigo-600" />
              <span>Go to Deals Pipeline</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>

      {/* Target Mission Creator Modal */}
      {showMissionModal && (
        <TargetMissionModal
          isOpen={showMissionModal}
          onClose={() => setShowMissionModal(false)}
          targetCalculation={selectedCalculation}
          allTargets={targets}
          deals={deals}
          users={users}
          currentUser={currentUser}
          onDeployMission={(taskData) => {
            addTask(taskData);
            onClose();
          }}
        />
      )}
    </div>
  );
};
