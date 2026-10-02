import React, { useState } from 'react';
import { 
  Smartphone, 
  WifiOff, 
  Wifi, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  UserPlus, 
  ShieldAlert, 
  Clock, 
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';

export const AccessibilityView: React.FC = () => {
  const { 
    isOfflineSimulated, 
    setIsOfflineSimulated, 
    offlineDrafts, 
    queueOfflineDraft, 
    syncOfflineQueue, 
    processSmsCommand, 
    createRequest,
    getActiveUrgentRequest,
    checkUrgentEligibility 
  } = useCampus();

  // SMS Simulator State
  const [smsInput, setSmsInput] = useState('FB STATUS 1042');
  const [smsMessages, setSmsMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '[CAMPUSFLOW / FRETBOX SMS GATEWAY]\nConnected to shortcode 56161.\nSend:\n• FB MENU for today mess\n• FB NOTICE for latest urgent notice\n• FB STATUS <ID> to track ticket',
      time: '10:00 AM'
    },
    {
      sender: 'user',
      text: 'FB MENU',
      time: '10:05 AM'
    },
    {
      sender: 'bot',
      text: '[CAMPUSFLOW / FRETBOX MESS BOT]\nToday (Friday):\n• Lunch: Steamed Rice, Machha Besara / Paneer Butter Masala, Dal\n• Snacks: Chura Upma, Hot Tea\n• Dinner: Roti, Rajma Masala, Steamed Rice, Seasonal Fruit',
      time: '10:05 AM'
    }
  ]);

  // Offline Draft Form State
  const [draftTitle, setDraftTitle] = useState('Drinking Water Purifier Broken');
  const [draftCategory, setDraftCategory] = useState<'maintenance' | 'leave_gatepass'>('maintenance');
  const [draftDesc, setDraftDesc] = useState('2nd floor water cooler TDS light flashing red. Filter replacement needed.');

  // Warden-Assisted Entry State
  const [assistedStudentName, setAssistedStudentName] = useState('Deepak Kumar Nayak');
  const [assistedRegNo, setAssistedRegNo] = useState('2201289199');
  const [assistedCategory, setAssistedCategory] = useState<'maintenance' | 'bonafide' | 'leave_gatepass'>('maintenance');
  const [assistedSeverity, setAssistedSeverity] = useState<'routine' | 'elevated' | 'urgent'>('routine');
  const [assistedDetails, setAssistedDetails] = useState('Student visited warden desk without smartphone. Room lock jammed in Block A room 102.');
  const [assistedUrgentReason, setAssistedUrgentReason] = useState('');
  const [assistedSuccessMsg, setAssistedSuccessMsg] = useState<string | null>(null);

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const userCmd = smsInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsgs = [
      ...smsMessages,
      { sender: 'user' as const, text: userCmd, time: timeNow }
    ];

    const result = processSmsCommand(userCmd);

    setTimeout(() => {
      setSmsMessages([
        ...newMsgs,
        { sender: 'bot' as const, text: result.reply, time: timeNow }
      ]);
    }, 400);

    setSmsInput('');
  };

  const handleQueueOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    queueOfflineDraft({
      title: draftTitle,
      category: draftCategory,
      data: {
        description: draftDesc,
        priority: 'medium',
        details: {
          hostelBlock: 'Block A',
          roomNumber: '2nd Floor Water Station'
        }
      }
    });

    setDraftTitle('');
    setDraftDesc('');
  };

  const handleWardenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistedStudentName.trim() || !assistedDetails.trim()) return;

    const req = createRequest({
      title: `[Warden-Assisted Entry] ${assistedStudentName}: ${assistedDetails.slice(0, 35)}...`,
      category: assistedCategory,
      priority: assistedSeverity === 'urgent' ? 'urgent' : assistedSeverity === 'elevated' ? 'high' : 'medium',
      priorityReason: assistedUrgentReason.trim() || undefined,
      studentName: assistedStudentName,
      studentId: assistedRegNo,
      description: `Logged by Hostel Warden on behalf of student without smartphone access. Student: ${assistedStudentName} (Reg: ${assistedRegNo}). Details: ${assistedDetails}`,
      details: {
        assistedBy: 'Warden Desk Desk-01',
        hostelBlock: 'Block A',
        reason: assistedDetails
      }
    });

    setAssistedSuccessMsg(`Request ${req.id} created successfully on behalf of ${assistedStudentName} with priority ${req.priority.toUpperCase()}.`);
    setTimeout(() => setAssistedSuccessMsg(null), 5000);
    setAssistedDetails('');
    setAssistedUrgentReason('');
    setAssistedSeverity('routine');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            Accessibility & Offline Connectivity
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Demonstrates low-bandwidth operation, offline draft caching, 2-way SMS queries, and assisted entry options
          </p>
        </div>

        {/* Global A11y & Offline Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors shadow-2xs ${
              isOfflineSimulated 
                ? 'bg-[#FDF6EB] text-[#8A5B15] border-[#F1DFC4]' 
                : 'bg-white text-[#5E6D64] border-[#E5E9E5] hover:bg-[#F7F8F6]'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-4 h-4 text-[#8A5B15] animate-pulse" />
                <span>Simulating Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-[#0D8B65]" />
                <span>Simulate Offline Drop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* THREE SECTION GRID: OFFLINE QUEUE, SMS BOT SIMULATOR, WARDEN ASSIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Offline Local Queue Simulator (1 col) */}
        <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0D8B65]" />
              <h3 className="text-sm font-bold text-[#202722]">Offline Request Queuing</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-[#F7F8F6] border border-[#E5E9E5] px-2 py-0.5 rounded text-[#202722]">
              {offlineDrafts.length} Queued
            </span>
          </div>

          <p className="text-xs text-[#5E6D64] leading-relaxed">
            When campus Wi-Fi drops, students can compose requests locally in browser cache. 
            CampusFlow syncs them automatically upon network restoration.
          </p>

          {/* Create Draft Form */}
          <form onSubmit={handleQueueOffline} className="space-y-3.5 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-[#202722] mb-1">Issue Title</label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Broken water cooler on 2nd floor"
                className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] focus:outline-none focus:border-[#0D8B65]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202722] mb-1">Category</label>
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as any)}
                className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722]"
              >
                <option value="maintenance">Hostel Maintenance</option>
                <option value="leave_gatepass">Leave & Gate Pass</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#202722] mb-1">Description</label>
              <textarea
                rows={2}
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#202722] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              Save Draft to Offline Cache
            </button>
          </form>

          {/* Queued Drafts List */}
          {offlineDrafts.length > 0 && (
            <div className="pt-3 border-t border-[#E5E9E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#202722]">Cached Drafts Ready:</span>
                <button
                  onClick={syncOfflineQueue}
                  className="px-2.5 py-1 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0A7353] transition-colors"
                >
                  Sync All ({offlineDrafts.length})
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {offlineDrafts.map(d => (
                  <div key={d.id} className="p-2.5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] text-xs">
                    <div className="font-semibold text-[#202722] truncate">{d.title}</div>
                    <div className="text-[11px] text-[#5E6D64] mt-0.5">Queued: {new Date(d.queuedAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Interactive 2-Way SMS Gateway Simulator (1 col) */}
        <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0D8B65]" />
                <h3 className="text-sm font-bold text-[#202722]">Feature Phone SMS Terminal</h3>
              </div>
              <span className="text-[11px] font-mono text-[#0D8B65] font-bold bg-[#E6F5EF] px-2 py-0.5 rounded">
                Shortcode: 56161
              </span>
            </div>

            <p className="text-xs text-[#5E6D64] leading-relaxed mt-2 mb-3">
              Students without smartphones can text queries to <strong>56161</strong> to retrieve mess menus, emergency bulletins, or ticket statuses.
            </p>

            {/* Quick SMS Prompts */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
              <button
                onClick={() => setSmsInput('FB MENU')}
                className="px-2.5 py-1 bg-[#F7F8F6] hover:bg-[#E6F5EF] rounded-lg font-mono text-[#202722] border border-[#E5E9E5]"
              >
                FB MENU
              </button>
              <button
                onClick={() => setSmsInput('FB NOTICE')}
                className="px-2.5 py-1 bg-[#F7F8F6] hover:bg-[#E6F5EF] rounded-lg font-mono text-[#202722] border border-[#E5E9E5]"
              >
                FB NOTICE
              </button>
              <button
                onClick={() => setSmsInput('FB STATUS 1042')}
                className="px-2.5 py-1 bg-[#F7F8F6] hover:bg-[#E6F5EF] rounded-lg font-mono text-[#202722] border border-[#E5E9E5]"
              >
                FB STATUS 1042
              </button>
            </div>

            {/* Simulated Phone Screen */}
            <div className="bg-[#1C2520] text-white p-3.5 rounded-xl font-mono text-xs max-h-64 overflow-y-auto space-y-2 border border-[#2F3A32]">
              {smsMessages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-lg leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user' 
                      ? 'bg-[#0D8B65] text-white ml-6 text-right' 
                      : 'bg-[#2A3730] text-[#E5E9E5] mr-6'
                  }`}
                >
                  <div className="text-[10px] opacity-70 mb-0.5">{m.sender === 'user' ? 'YOU (SMS Out)' : 'CAMPUSFLOW 56161'} · {m.time}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Command Input Form */}
          <form onSubmit={handleSendSms} className="flex gap-2 pt-2">
            <input
              type="text"
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="e.g. FB STATUS 1042"
              className="flex-1 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] font-mono focus:outline-none focus:border-[#0D8B65]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3. Warden-Assisted Kiosk Entry (1 col) */}
        <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0D8B65]" />
              <h3 className="text-sm font-bold text-[#202722]">Warden-Assisted Entry</h3>
            </div>
            <span className="text-[11px] font-mono bg-[#F7F8F6] border border-[#E5E9E5] px-2 py-0.5 rounded text-[#202722]">
              Hostel Desk
            </span>
          </div>

          <p className="text-xs text-[#5E6D64] leading-relaxed">
            For students without mobile devices or campus workers, the hostel warden logs requests with identical policy checks and audit trails.
          </p>

          {assistedSuccessMsg && (
            <div className="p-3 bg-[#E6F5EF] border border-[#A2C4AF] rounded-xl text-xs text-[#0D8B65] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{assistedSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleWardenSubmit} className="space-y-3.5 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#202722] mb-1">Student Name</label>
                <input
                  type="text"
                  value={assistedStudentName}
                  onChange={(e) => setAssistedStudentName(e.target.value)}
                  className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202722] mb-1">Reg Number</label>
                <input
                  type="text"
                  value={assistedRegNo}
                  onChange={(e) => setAssistedRegNo(e.target.value)}
                  className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#202722] mb-1">Category</label>
                <select
                  value={assistedCategory}
                  onChange={(e) => setAssistedCategory(e.target.value as any)}
                  className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="bonafide">Bonafide</option>
                  <option value="leave_gatepass">Leave Pass</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202722] mb-1">Seriousness</label>
                <select
                  value={assistedSeverity}
                  onChange={(e) => setAssistedSeverity(e.target.value as any)}
                  className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
                >
                  <option value="routine">Routine (Medium)</option>
                  <option value="elevated">Elevated (High)</option>
                  <option value="urgent">Critical Safety (Urgent)</option>
                </select>
              </div>
            </div>

            {assistedSeverity === 'urgent' && (
              <div>
                <label className="block font-semibold text-[#992828] mb-1">Warden Emergency Justification *</label>
                <input
                  type="text"
                  value={assistedUrgentReason}
                  onChange={(e) => setAssistedUrgentReason(e.target.value)}
                  placeholder="Record why this qualifies as critical emergency..."
                  className="w-full bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#202722] mb-1">Warden Desk Notes</label>
              <textarea
                rows={3}
                value={assistedDetails}
                onChange={(e) => setAssistedDetails(e.target.value)}
                placeholder="Log verbal complaint specifics..."
                className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202722]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              Submit via Warden Desk Proxy
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
