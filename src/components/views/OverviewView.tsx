import React from 'react';
import { 
  PlusCircle, 
  Clock, 
  Calendar, 
  UtensilsCrossed, 
  AlertTriangle, 
  FileCheck, 
  Wrench, 
  Luggage, 
  IndianRupee, 
  ChevronRight,
  CheckCircle2,
  BellRing,
  AlertCircle,
  Map 
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { TODAY_TIMETABLE, WEEKLY_MESS_MENU, CAMPUS_ALERTS } from '../../data/seedData.ts';
import { RequestCategory, RequestStatus, RequestItem } from '../../types/index.ts';

interface OverviewViewProps {
  onOpenWizard: (category?: RequestCategory) => void;
  onOpenRequestDetail: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ 
  onOpenWizard, 
  onOpenRequestDetail 
}) => {
  const { 
    currentUser, 
    requests, 
    notices, 
    setActiveTab, 
    setSelectedRequestId,
    role 
  } = useCampus();

  // Get active student requests (Role-aware: student sees only their own requests)
  const activeRequests = requests.filter(r => {
    const isUnresolved = r.status !== 'closed' && r.status !== 'resolved';
    if (!isUnresolved) return false;
    if (role === 'student') {
      return r.studentId === currentUser.studentId || 
             (currentUser.studentId && r.studentId === currentUser.studentId) ||
             r.studentName.toLowerCase().includes('udit');
    }
    return true;
  }).slice(0, 4);

  // Today is Friday in demo context
  const todayMess = WEEKLY_MESS_MENU.find(m => m.day === 'Friday') || WEEKLY_MESS_MENU[0];

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-xs font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-0.5 rounded-md border border-[#F1DFC4]">Submitted</span>;
      case 'assigned':
        return <span className="text-xs font-semibold text-[#234E70] bg-[#EEF4F9] px-2.5 py-0.5 rounded-md border border-[#C8DCED]">Assigned</span>;
      case 'in_progress':
        return <span className="text-xs font-semibold text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded-md border border-[#A2C4AF]">In Progress</span>;
      case 'resolved':
        return <span className="text-xs font-semibold text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded-md border border-[#A2C4AF]">Resolved</span>;
      case 'closed':
        return <span className="text-xs font-medium text-[#5E6D64] bg-[#F7F8F6] px-2.5 py-0.5 rounded-md border border-[#E5E9E5]">Closed</span>;
      case 'reopened':
        return <span className="text-xs font-semibold text-[#992828] bg-[#FCEDEC] px-2.5 py-0.5 rounded-md border border-[#F5CBC8]">Reopened</span>;
      default:
        return <span className="text-xs text-[#5E6D64]">{status}</span>;
    }
  };

  const getPriorityIndicator = (req: RequestItem) => {
    if (req.priority === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#992828] bg-[#FCEDEC] px-2 py-0.5 rounded border border-[#F5CBC8]">
          <AlertCircle className="w-3 h-3" />
          <span>Urgent</span>
        </span>
      );
    }
    if (req.priority === 'high') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2 py-0.5 rounded border border-[#F1DFC4]">
          <span>High{req.flaggedForTriage ? ' (Triage)' : ''}</span>
        </span>
      );
    }
    return <span className="text-[11px] text-[#5E6D64] font-medium">{req.priority.toUpperCase()}</span>;
  };

  // Dynamic time-based greeting based on current local browser time:
  // 05:00–11:59 → "Good morning"
  // 12:00–16:59 → "Good afternoon"
  // 17:00–20:59 → "Good evening"
  // 21:00–04:59 → "Good night"
  const getTimeGreeting = (): string => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    }
    if (currentHour >= 12 && currentHour < 17) {
      return 'Good afternoon';
    }
    if (currentHour >= 17 && currentHour < 21) {
      return 'Good evening';
    }
    return 'Good night';
  };

  const userDisplayName = currentUser?.name ? currentUser.name.trim().split(' ')[0] : 'Udit';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Personal Greeting & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            {getTimeGreeting()}, {userDisplayName}.
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Summary of your personal campus tasks, active submissions, and daily schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenWizard()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch New Request</span>
          </button>
        </div>
      </div>

      {/* 2. Campus Operational Status Alert Banner */}
      {CAMPUS_ALERTS.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAMPUS_ALERTS.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-2xs ${
                alert.level === 'warning' 
                  ? 'bg-[#FDF6EB] border-[#F1DFC4] text-[#202722]' 
                  : 'bg-[#E6F5EF]/60 border-[#A2C4AF] text-[#202722]'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-white shrink-0 mt-0.5 shadow-2xs border border-[#E5E9E5]">
                <AlertTriangle className={`w-4 h-4 ${alert.level === 'warning' ? 'text-[#8A5B15]' : 'text-[#0D8B65]'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#202722]">{alert.title}</span>
                  <span className="text-[#5E6D64] font-mono text-[11px]">{alert.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed text-[#202722]/90">{alert.message}</p>
                <div className="text-[11px] text-[#5E6D64] mt-1.5 font-medium">Source: {alert.department}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Universal Launcher Grid */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#202722]">What do you need to get done?</h3>
            <p className="text-xs text-[#5E6D64] mt-0.5">Select a routine campus task to auto-route across departments</p>
          </div>
          <span className="text-xs text-[#0D8B65] font-semibold hidden sm:inline bg-[#E6F5EF] px-2.5 py-1 rounded-lg">
            6 Connected Workflows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onOpenWizard('bonafide')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E6F5EF] flex items-center justify-center text-[#0D8B65] group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Bonafide Certificate</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">ERP dues & seal</div>
            </div>
          </button>

          <button
            onClick={() => onOpenWizard('maintenance')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EEF4F9] flex items-center justify-center text-[#234E70] group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Hostel Maintenance</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">FretBox & repairs</div>
            </div>
          </button>

          <button
            onClick={() => onOpenWizard('leave_gatepass')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FDF6EB] flex items-center justify-center text-[#8A5B15] group-hover:scale-105 transition-transform">
              <Luggage className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Leave & Gate Pass</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">Warden QR clearance</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('my_campus')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F7F8F6] flex items-center justify-center text-[#202722] group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Today's Timetable</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">LMS schedules</div>
            </div>
          </button>

          <button
            onClick={() => onOpenWizard('fee_dues')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E6F5EF] flex items-center justify-center text-[#0D8B65] group-hover:scale-105 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Check Fee Ledger</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">Sample dues status</div>
            </div>
          </button>

          <button
            onClick={() => onOpenWizard('mess')}
            className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between h-32 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FCEDEC] flex items-center justify-center text-[#992828] group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202722] group-hover:text-[#0D8B65] transition-colors">Mess Menu & Review</div>
              <div className="text-[11px] text-[#5E6D64] mt-0.5">Dining feedback</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Requests & Academic Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Requests Card */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202722]">
                  {role === 'student' ? 'My Active Requests' : 'Active Campus Queue Preview'}
                </h3>
                <p className="text-xs text-[#5E6D64] mt-0.5">Track real-time progress across college offices</p>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs font-semibold text-[#0D8B65] hover:underline flex items-center gap-1"
              >
                <span>View All ({requests.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeRequests.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5E9E5] rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-[#0D8B65] mx-auto mb-2 opacity-75" />
                <p className="text-xs font-semibold text-[#202722]">No open requests</p>
                <p className="text-xs text-[#5E6D64] mt-0.5">All your campus submissions have been resolved.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E9E5]">
                {activeRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      onOpenRequestDetail(req.id);
                    }}
                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#F7F8F6] p-3.5 rounded-xl transition-colors text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-[#5E6D64] mb-1">
                        <span className="font-mono text-xs font-bold text-[#202722]">{req.id}</span>
                        <span>·</span>
                        <span className="truncate">{req.department}</span>
                        <span>·</span>
                        {getPriorityIndicator(req)}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#202722] line-clamp-1">{req.title}</h4>
                      
                      <div className="flex items-center gap-3 text-xs text-[#5E6D64] mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {new Date(req.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        {req.isLinkedIncident && (
                          <span className="text-[#0D8B65] font-semibold">Clustered ({req.linkedIncidentId})</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {getStatusBadge(req.status)}
                      <div className="text-xs text-[#5E6D64] mt-1.5 font-mono">
                        SLA: {req.slaHours}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Timetable Section */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202722]">Today's Academic Schedule</h3>
                <p className="text-xs text-[#5E6D64] mt-0.5">B.Tech CSE 6th Sem · LMS Verified</p>
              </div>
              <button
                onClick={() => setActiveTab('my_campus')}
                className="text-xs font-semibold text-[#0D8B65] hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {TODAY_TIMETABLE.slice(0, 3).map(slot => (
                <div 
                  key={slot.id}
                  className="p-4 rounded-xl border border-[#E5E9E5] bg-[#F7F8F6]/80 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="px-3 py-1.5 bg-white border border-[#E5E9E5] rounded-lg text-center shrink-0 shadow-2xs">
                      <span className="text-xs font-mono font-bold text-[#202722] block">{slot.time.split(' – ')[0]}</span>
                      <span className="text-[10px] text-[#5E6D64] uppercase font-semibold">{slot.type}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#202722] truncate">{slot.subject}</div>
                      <div className="text-xs text-[#5E6D64] truncate mt-0.5">{slot.room} · {slot.faculty}</div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {slot.status === 'rescheduled' ? (
                      <span className="text-[11px] font-semibold text-[#8A5B15] bg-[#FDF6EB] border border-[#F1DFC4] px-2 py-0.5 rounded">
                        Room Updated
                      </span>
                    ) : (
                      <span className="text-xs text-[#5E6D64]">On Schedule</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mess Menu & Bulletins (1 col) */}
        <div className="space-y-6">
          {/* Mess Menu Preview */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#0D8B65]" />
                <h3 className="text-sm font-bold text-[#202722]">Mess Menu (Friday)</h3>
              </div>
              <button
                onClick={() => onOpenWizard('mess')}
                className="text-xs font-medium text-[#0D8B65] hover:underline"
              >
                Feedback
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F8F6] border border-[#E5E9E5]">
                <div className="text-[11px] font-bold text-[#5E6D64] uppercase tracking-wider mb-1">Lunch (12:30 – 14:15)</div>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{todayMess.lunch}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F8F6] border border-[#E5E9E5]">
                <div className="text-[11px] font-bold text-[#5E6D64] uppercase tracking-wider mb-1">Snacks (17:00 – 18:00)</div>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{todayMess.snacks}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F8F6] border border-[#E5E9E5]">
                <div className="text-[11px] font-bold text-[#5E6D64] uppercase tracking-wider mb-1">Dinner (20:00 – 21:45)</div>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{todayMess.dinner}</p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#E5E9E5] flex items-center justify-between text-xs text-[#5E6D64]">
              <span>Catering: Central Mess</span>
              <button
                onClick={() => setActiveTab('my_campus')}
                className="text-[#0D8B65] font-semibold hover:underline"
              >
                Full Week Menu →
              </button>
            </div>
          </div>

          {/* Official Notices Feed */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#0D8B65]" />
                <h3 className="text-sm font-bold text-[#202722]">Official Notices</h3>
              </div>
              <button
                onClick={() => setActiveTab('notices')}
                className="text-xs font-medium text-[#0D8B65] hover:underline"
              >
                All ({notices.length})
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map(notice => (
                <div 
                  key={notice.id}
                  onClick={() => setActiveTab('notices')}
                  className="p-3.5 rounded-xl border border-[#E5E9E5] hover:border-[#0D8B65] cursor-pointer transition-colors text-left shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-[#5E6D64] mb-1">
                    <span className="font-semibold text-[#0D8B65] uppercase text-[11px]">{notice.category}</span>
                    <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#202722] line-clamp-1">{notice.title}</h4>
                  <p className="text-xs text-[#5E6D64] line-clamp-2 mt-1 leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
