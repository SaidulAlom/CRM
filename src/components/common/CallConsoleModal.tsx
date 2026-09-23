import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  PhoneCall,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  RotateCcw,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

export const CallConsoleModal: React.FC = () => {
  const {
    activeCallConsoleCallId,
    closeCallConsole,
    calls,
    callScripts,
    contacts,
    companies,
    fieldSets,
    completeCallFromConsole,
  } = useCRM();

  const call = calls.find((c) => c.id === activeCallConsoleCallId);
  const script = callScripts.find((s) => s.id === call?.scriptId) || callScripts[0];
  const contact = contacts.find((ct) => ct.id === call?.contactId);
  const company = companies.find((cp) => cp.id === call?.companyId);

  // Call duration timer
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Script answers state (key: element id, value: answer)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [outcome, setOutcome] = useState<string>(fieldSets.callOutcomes[0] || 'Connected - Scheduled Demo');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpSubject, setFollowUpSubject] = useState('Follow-up Call');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [followUpTime, setFollowUpTime] = useState('11:00');

  useEffect(() => {
    if (!activeCallConsoleCallId) {
      setSeconds(0);
      setAnswers({});
      return;
    }
    setSeconds(0);
    setIsTimerRunning(true);
  }, [activeCallConsoleCallId]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeCallConsoleCallId) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeCallConsoleCallId]);

  if (!activeCallConsoleCallId || !call) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTimerRunning(false);
    completeCallFromConsole(
      call.id,
      outcome,
      seconds,
      answers,
      scheduleFollowUp ? { subject: followUpSubject, date: followUpDate, time: followUpTime } : undefined
    );
  };

  const handleRestart = () => {
    setSeconds(0);
    setIsTimerRunning(true);
    setAnswers({});
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-in fade-in-50 duration-150">
      <div
        id="call-console-dialog"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Top Control Bar with Active Call Stats (FR-9.4) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <PhoneCall size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Live Call In Progress
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300 font-medium capitalize">
                  {call.direction}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md">
                {call.subject}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Call Timer */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
              <Clock size={15} className="text-slate-400" />
              <span className="font-mono font-bold text-sm text-white tracking-widest">
                {formatTimer(seconds)}
              </span>
            </div>

            <button
              onClick={handleRestart}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Restart call timer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={closeCallConsole}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Close Call Console"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Subheader: Contact & Company Quick Context Card */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-4 truncate">
            <span className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Users size={14} className="text-indigo-600" />
              {contact ? `${contact.firstName} ${contact.lastName}` : call.externalName || 'Unknown Contact'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">
              {contact?.phone || call.externalPhone || 'No direct phone'}
            </span>
            {company && (
              <>
                <span className="text-slate-400">·</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building2 size={13} className="text-blue-600" />
                  {company.name}
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Assigned Script: <span className="text-slate-800 font-semibold">{script?.name || 'Standard'}</span>
          </div>
        </div>

        {/* Main Body: Call Script Question-and-Answer Sheet (FR-9.4, FR-9.5, FR-9.6) */}
        <form onSubmit={handleComplete} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Call Script: {script?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {script?.description || 'Guide questions and capture responses during the interaction.'}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                FR-9.5 Script Protocol
              </span>
            </div>

            {/* Script Element items */}
            <div className="space-y-5">
              {script?.elements.map((el, idx) => (
                <div key={el.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-xs text-slate-800">
                        {el.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Instruction Type */}
                  {el.type === 'instruction' && (
                    <div className="ml-7 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900">
                      Guidance Note: Read or follow the prompt above verbatim.
                    </div>
                  )}

                  {/* Yes/No Type */}
                  {el.type === 'yes_no' && (
                    <div className="ml-7 flex items-center gap-3 pt-1">
                      {['Yes', 'No'].map((opt) => {
                        const isChosen = answers[el.id] === opt;
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [el.id]: opt }))}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isChosen
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Choice Type */}
                  {el.type === 'multiple_choice' && (
                    <div className="ml-7 flex flex-wrap gap-2 pt-1">
                      {el.options?.map((opt) => {
                        const isChosen = answers[el.id] === opt;
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [el.id]: opt }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isChosen
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Free Text Type */}
                  {el.type === 'free_text' && (
                    <div className="ml-7 pt-1">
                      <textarea
                        rows={2}
                        placeholder="Type customer notes or remarks here..."
                        value={answers[el.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [el.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Call Outcome & Follow-Up Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/70 space-y-4">
              <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Call Outcome & Next Steps
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Outcome Status *</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {fieldSets.callOutcomes.map((out) => (
                      <option key={out} value={out}>{out}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 pt-5">
                    <input
                      type="checkbox"
                      id="schedule-follow-up-cb"
                      checked={scheduleFollowUp}
                      onChange={(e) => setScheduleFollowUp(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="schedule-follow-up-cb" className="font-medium text-slate-800 cursor-pointer">
                      Schedule a follow-up call
                    </label>
                  </div>
                </div>
              </div>

              {scheduleFollowUp && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-200/80">
                  <div>
                    <label className="block text-slate-600 mb-1">Follow-up Subject</label>
                    <input
                      type="text"
                      value={followUpSubject}
                      onChange={(e) => setFollowUpSubject(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Time</label>
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              Total Duration: <span className="font-semibold text-slate-800">{formatTimer(seconds)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeCallConsole}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel / Discard
              </button>
              <button
                id="complete-call-submit"
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 size={15} />
                <span>Complete Call & Save Responses</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
