import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  Luggage, 
  User, 
  FileText, 
  Check, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  GraduationCap,
  Building2,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { GatePassRequest, IssuedGatePass } from '../../types/index.ts';
import { GatePassModal } from '../common/GatePassModal.tsx';

export const FacultyDashboardView: React.FC = () => {
  const { 
    currentUser, 
    gatePassRequests, 
    issuedGatePasses,
    approveGatePassRequest, 
    rejectGatePassRequest,
    activeGatePassModal,
    setActiveGatePassModal,
    role
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'gatepasses' | 'mentoring' | 'timetable'>('gatepasses');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reject Modal State
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = (reqId: string) => {
    try {
      const res = approveGatePassRequest(reqId, 'Approved by Warden/Faculty. Clear for departure.');
      setActionSuccess(`Gate Pass for ${res.request.studentName} APPROVED! Digital pass ${res.pass.id} generated.`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectionReason.trim()) return;

    try {
      const updated = rejectGatePassRequest(rejectingRequestId, rejectionReason.trim());
      setActionSuccess(`Gate Pass request for ${updated.studentName} has been declined.`);
      setRejectingRequestId(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const pendingRequests = gatePassRequests.filter(r => r.status === 'PENDING');

  const filteredGatePasses = gatePassRequests.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.studentName.toLowerCase().includes(q) ||
             r.studentId.includes(q) ||
             r.destination.toLowerCase().includes(q) ||
             r.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Faculty Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
              Faculty & Warden Authorization Desk
            </h2>
            <span className="text-[11px] font-mono text-[#234E70] bg-[#EEF4F9] px-2.5 py-0.5 rounded font-bold border border-[#C8DCED]">
              FACULTY ROLE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            {currentUser.name} · {currentUser.roleTitle} ({currentUser.department})
          </p>
        </div>

        {/* Pending Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-white border border-[#E5E9E5] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A5B15] animate-pulse" />
            <span className="text-[#202722]">{pendingRequests.length} Pending Outstation Review(s)</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-[#E6F5EF] border border-[#A2C4AF] rounded-2xl text-xs text-[#0D8B65] flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="p-1 text-[#0D8B65]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-[#F7F8F6] p-1.5 rounded-2xl border border-[#E5E9E5] text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('gatepasses')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'gatepasses' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64]'
          }`}
        >
          <Luggage className="w-4 h-4 text-[#0D8B65]" />
          <span>Gate Pass Approvals</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#8A5B15] text-white text-[10px]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mentoring')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'mentoring' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64]'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#234E70]" />
          <span>Student Advisees</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'timetable' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#8A5B15]" />
          <span>Class Schedules</span>
        </button>
      </div>

      {/* TAB 1: GATE PASS APPROVALS QUEUE */}
      {activeTab === 'gatepasses' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID, destination, or request serial..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#5E6D64] font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-1.5 text-xs text-[#202722] focus:outline-none"
              >
                <option value="all">All Statuses ({gatePassRequests.length})</option>
                <option value="PENDING">Pending Warden Review ({gatePassRequests.filter(r => r.status === 'PENDING').length})</option>
                <option value="PASS_ISSUED">Pass Issued ({gatePassRequests.filter(r => r.status === 'PASS_ISSUED').length})</option>
                <option value="REJECTED">Declined ({gatePassRequests.filter(r => r.status === 'REJECTED').length})</option>
              </select>
            </div>
          </div>

          {/* Gate Pass Cards List */}
          <div className="space-y-3">
            {filteredGatePasses.length === 0 ? (
              <div className="bg-white border border-[#E5E9E5] rounded-2xl p-8 text-center text-[#5E6D64] text-xs">
                No gate pass requests match the selected query.
              </div>
            ) : (
              filteredGatePasses.map(req => {
                const issuedPass = issuedGatePasses.find(p => p.requestId === req.id);

                return (
                  <div 
                    key={req.id}
                    className="p-5 bg-white border border-[#E5E9E5] hover:border-[#A2C4AF] rounded-2xl shadow-2xs transition-all space-y-3.5"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E9E5]">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#1E3A2F] bg-[#E6F5EF] px-2 py-0.5 rounded border border-[#A2C4AF]">
                          {req.id}
                        </span>
                        <span className="text-[#5E6D64]">•</span>
                        <span className="text-xs font-semibold text-[#202722]">{req.department}</span>
                        <span className="text-[#5E6D64]">•</span>
                        <span className="text-xs text-[#5E6D64]">{req.hostel} ({req.room})</span>
                      </div>

                      <div>
                        {req.status === 'PENDING' && (
                          <span className="px-2.5 py-1 bg-[#FDF6EB] text-[#8A5B15] text-[11px] font-bold rounded-lg border border-[#F1DFC4] inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>PENDING WARDEN DECISION</span>
                          </span>
                        )}
                        {req.status === 'PASS_ISSUED' && (
                          <span className="px-2.5 py-1 bg-[#E6F5EF] text-[#0D8B65] text-[11px] font-bold rounded-lg border border-[#A2C4AF] inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>DIGITAL PASS ISSUED</span>
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 bg-[#FCEDEC] text-[#992828] text-[11px] font-bold rounded-lg border border-[#F5CBC8] inline-flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" />
                            <span>REQUEST DECLINED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5E6D64] block">Student Requester</span>
                        <span className="font-bold text-[#202722] text-sm">{req.studentName}</span>
                        <div className="font-mono text-[#5E6D64] text-xs">ID: {req.studentId}</div>
                        <div className="text-[#5E6D64] text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#0D8B65]" />
                          <span>{req.contactNumber}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5E6D64] block">Destination & Reason</span>
                        <span className="font-bold text-[#202722]">{req.destination}</span>
                        <p className="text-xs text-[#5E6D64] mt-0.5 line-clamp-2 italic leading-relaxed">
                          "{req.reason}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5E6D64] block">Requested Movement Window</span>
                        <div className="text-xs text-[#202722]">
                          Departure: <strong className="font-mono">{req.departureDate} at {req.departureTime}</strong>
                        </div>
                        <div className="text-xs text-[#202722] mt-0.5">
                          Return: <strong className="font-mono">{req.expectedReturnDate} by {req.expectedReturnTime}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-2.5 border-t border-[#E5E9E5] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-[#5E6D64]">
                        Submitted on <span className="font-mono">{new Date(req.createdAt).toLocaleString()}</span>
                        {req.reviewerName && (
                          <span className="ml-2">• Reviewed by <strong className="text-[#202722]">{req.reviewerName}</strong></span>
                        )}
                        {req.rejectionReason && (
                          <span className="ml-2 text-[#992828] font-medium">• Rejection: {req.rejectionReason}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setRejectingRequestId(req.id)}
                              className="px-3.5 py-1.5 bg-white border border-[#F5CBC8] hover:bg-[#FCEDEC] text-[#992828] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline...</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(req.id)}
                              className="px-4 py-1.5 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Authorize & Issue Digital Pass</span>
                            </button>
                          </>
                        )}

                        {req.status === 'PASS_ISSUED' && issuedPass && (
                          <button
                            type="button"
                            onClick={() => setActiveGatePassModal(issuedPass)}
                            className="px-3.5 py-1.5 bg-[#E6F5EF] hover:bg-[#d5ede0] text-[#0D8B65] text-xs font-semibold rounded-xl border border-[#A2C4AF] transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Digital Pass ({issuedPass.id})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ADVISEES */}
      {activeTab === 'mentoring' && (
        <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#202722]">Assigned Academic Advisees</h3>
            <p className="text-xs text-[#5E6D64]">B.Tech Electrical & Computer Science 3rd Year Mentorship Roster</p>
          </div>

          <div className="divide-y divide-[#E5E9E5] text-xs">
            {[
              { id: '2201289140', name: 'Udit Kumar Tripathy', prog: 'B.Tech CSE', hostel: 'Brahmaputra Hall (314)', attendance: '94%', dues: 'None' },
              { id: '2201289205', name: 'Subhashree Priyadarshini', prog: 'B.Tech ETC', hostel: 'Mahanadi Hall (112)', attendance: '88%', dues: 'None' },
              { id: '2201289033', name: 'Alok Ranjan Mohapatra', prog: 'B.Tech EE', hostel: 'Brahmaputra Hall (210)', attendance: '91%', dues: 'None' }
            ].map(stu => (
              <div key={stu.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#202722]">{stu.name}</span>
                  <div className="text-[11px] text-[#5E6D64] font-mono">Reg: {stu.id} • {stu.prog} • {stu.hostel}</div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-[#0D8B65]">Attendance: {stu.attendance}</span>
                  <div className="text-[10px] text-[#5E6D64]">Clearance: {stu.dues}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#202722]">Faculty Teaching & Lab Schedules</h3>
            <p className="text-xs text-[#5E6D64]">Current semester class commitments and lab slot reservations</p>
          </div>
          <div className="p-4 bg-[#F7F8F6] rounded-2xl border border-[#E5E9E5] text-xs space-y-2">
            <div className="font-bold text-[#202722]">Friday Schedule:</div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E5E9E5]">
              <span className="font-mono text-[#0D8B65] font-bold">10:00 AM – 11:30 AM</span>: Distributed Systems & Cloud Lab (CS-303L) · Ramanujan Lab Bay 3
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-[#E5E9E5]">
              <span className="font-mono text-[#234E70] font-bold">02:30 PM – 04:00 PM</span>: High Voltage Systems Engineering · Lecture Theatre 4
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Decline Gate Pass Request</h3>
              <button onClick={() => setRejectingRequestId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              State the official institutional or warden reason for declining this outstation request. The student will be notified immediately.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Mandatory laboratory exam scheduled on requested date, or guardian confirmation pending."
                  className="w-full p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#992828] hover:bg-[#801e1e] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Digital Pass Modal */}
      {activeGatePassModal && (
        <GatePassModal
          pass={activeGatePassModal}
          onClose={() => setActiveGatePassModal(null)}
        />
      )}
    </div>
  );
};
