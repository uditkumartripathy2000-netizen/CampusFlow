import React, { useState, useMemo } from 'react';
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
  MessageSquare,
  MapPin,
  RotateCcw,
  Send,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileCheck,
  Wrench,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { GatePassRequest, IssuedGatePass, RequestItem, RequestStatus, RequestPriority, RequestCategory } from '../../types/index.ts';
import { GatePassModal } from '../common/GatePassModal.tsx';
import { 
  isTicketAssignedToFaculty, 
  isTicketOverdue, 
  isTicketApproachingSla, 
  canUserPerformActionOnTicket 
} from '../../utils/ticketRouting.ts';

export const FacultyDashboardView: React.FC = () => {
  const { 
    currentUser, 
    requests,
    updateRequestStatus,
    assignStaff,
    addInternalNote,
    gatePassRequests, 
    issuedGatePasses,
    approveGatePassRequest, 
    rejectGatePassRequest,
    activeGatePassModal,
    setActiveGatePassModal,
    navigateToMapLocation
  } = useCampus();

  // Main Tabs: Assigned Tickets, Gate Pass Approvals, Student Advisees, Class Schedules
  const [activeTab, setActiveTab] = useState<'assigned_tickets' | 'gatepasses' | 'mentoring' | 'timetable'>('assigned_tickets');

  // Success and Error Notification Toast
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 1: ASSIGNED TICKETS STATE & FILTERS
  // -------------------------------------------------------------
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('all');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>('all');

  // Selected Ticket for Drawer / Detail Modal
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Action Modals State for Tickets
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rejectingTicketId, setRejectingTicketId] = useState<string | null>(null);
  const [ticketRejectionReason, setTicketRejectionReason] = useState('');
  const [approvingTicketId, setApprovingTicketId] = useState<string | null>(null);
  const [ticketApprovalNote, setTicketApprovalNote] = useState('');
  const [reopeningTicketId, setReopeningTicketId] = useState<string | null>(null);
  const [ticketReopenReason, setTicketReopenReason] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Deterministically filter tickets assigned to this faculty member
  const facultyAssignedTickets = useMemo(() => {
    return requests.filter(r => isTicketAssignedToFaculty(r, currentUser));
  }, [requests, currentUser]);

  // Stat Counts
  const totalAssignedCount = facultyAssignedTickets.length;
  const pendingAssignedCount = facultyAssignedTickets.filter(r => r.status === 'submitted' || r.status === 'assigned').length;
  const inProgressAssignedCount = facultyAssignedTickets.filter(r => r.status === 'in_progress').length;
  const resolvedClosedAssignedCount = facultyAssignedTickets.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  // Filtered assigned tickets
  const filteredAssignedTickets = useMemo(() => {
    return facultyAssignedTickets.filter(t => {
      if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
      if (ticketCategoryFilter !== 'all' && t.category !== ticketCategoryFilter) return false;
      if (ticketPriorityFilter !== 'all' && t.priority !== ticketPriorityFilter) return false;
      if (ticketSearchQuery.trim()) {
        const q = ticketSearchQuery.toLowerCase();
        const mId = t.id.toLowerCase().includes(q);
        const mTitle = t.title.toLowerCase().includes(q);
        const mStudent = t.studentName.toLowerCase().includes(q);
        const mDept = t.department.toLowerCase().includes(q);
        const mCat = t.category.toLowerCase().includes(q);
        if (!mId && !mTitle && !mStudent && !mDept && !mCat) return false;
      }
      return true;
    });
  }, [facultyAssignedTickets, ticketStatusFilter, ticketCategoryFilter, ticketPriorityFilter, ticketSearchQuery]);

  // Active selected ticket for drawer
  const selectedTicket = useMemo(() => {
    return requests.find(r => r.id === selectedTicketId) || null;
  }, [requests, selectedTicketId]);

  // -------------------------------------------------------------
  // TAB 2: GATE PASS APPROVALS STATE
  // -------------------------------------------------------------
  const [gatePassFilterStatus, setGatePassFilterStatus] = useState<string>('all');
  const [gatePassSearchQuery, setGatePassSearchQuery] = useState<string>('');
  const [rejectingGatePassId, setRejectingGatePassId] = useState<string | null>(null);
  const [gatePassRejectionReason, setGatePassRejectionReason] = useState<string>('');

  const pendingGatePassRequests = gatePassRequests.filter(r => r.status === 'PENDING');

  const filteredGatePasses = gatePassRequests.filter(r => {
    if (gatePassFilterStatus !== 'all' && r.status !== gatePassFilterStatus) return false;
    if (gatePassSearchQuery.trim()) {
      const q = gatePassSearchQuery.toLowerCase();
      return r.studentName.toLowerCase().includes(q) ||
             r.studentId.includes(q) ||
             r.destination.toLowerCase().includes(q) ||
             r.id.toLowerCase().includes(q);
    }
    return true;
  });

  // Gate Pass Actions
  const handleApproveGatePass = (reqId: string) => {
    try {
      const res = approveGatePassRequest(reqId, 'Approved by Warden/Faculty. Clear for departure.');
      setActionSuccess(`Gate Pass for ${res.request.studentName} APPROVED! Digital pass ${res.pass.id} generated.`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Approval failed');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleRejectGatePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingGatePassId || !gatePassRejectionReason.trim()) return;

    try {
      const updated = rejectGatePassRequest(rejectingGatePassId, gatePassRejectionReason.trim());
      setActionSuccess(`Gate Pass request for ${updated.studentName} has been declined.`);
      setRejectingGatePassId(null);
      setGatePassRejectionReason('');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Rejection failed');
      setTimeout(() => setActionError(null), 5000);
    }
  };

  // -------------------------------------------------------------
  // TICKET ACTIONS
  // -------------------------------------------------------------
  const handleSelfAssignTicket = (ticket: RequestItem) => {
    const perm = canUserPerformActionOnTicket(ticket, currentUser, 'assign');
    if (!perm.allowed) {
      setActionError(perm.reason || 'Not authorized to self-assign this ticket.');
      return;
    }
    assignStaff(ticket.id, currentUser.name, currentUser.roleTitle, 'Faculty member accepted and self-assigned ticket for active resolution.');
    setActionSuccess(`Ticket ${ticket.id} successfully assigned to you!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleStartProgress = (ticket: RequestItem) => {
    const perm = canUserPerformActionOnTicket(ticket, currentUser, 'in_progress');
    if (!perm.allowed) {
      setActionError(perm.reason || 'Cannot move ticket to In Progress.');
      return;
    }
    updateRequestStatus(ticket.id, 'in_progress', 'Faculty initiated active inspection / processing.');
    setActionSuccess(`Ticket ${ticket.id} marked as In Progress.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleApproveTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingTicketId) return;
    const targetTicket = requests.find(r => r.id === approvingTicketId);
    if (!targetTicket) return;

    const note = ticketApprovalNote.trim() || 'Request authorized and approved by Faculty.';
    updateRequestStatus(targetTicket.id, 'approved', note);
    setActionSuccess(`Ticket ${targetTicket.id} approved successfully!`);
    setApprovingTicketId(null);
    setTicketApprovalNote('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRejectTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTicketId || !ticketRejectionReason.trim()) return;
    const targetTicket = requests.find(r => r.id === rejectingTicketId);
    if (!targetTicket) return;

    updateRequestStatus(targetTicket.id, 'closed', `Request Rejected by Faculty: ${ticketRejectionReason.trim()}`);
    setActionSuccess(`Ticket ${targetTicket.id} declined with official reason.`);
    setRejectingTicketId(null);
    setTicketRejectionReason('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleResolveTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId || !resolutionSummary.trim()) return;
    const targetTicket = requests.find(r => r.id === resolvingTicketId);
    if (!targetTicket) return;

    updateRequestStatus(targetTicket.id, 'resolved', `Resolved by Faculty: ${resolutionSummary.trim()}`);
    setActionSuccess(`Ticket ${targetTicket.id} marked as Resolved!`);
    setResolvingTicketId(null);
    setResolutionSummary('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleCloseTicket = (ticket: RequestItem) => {
    updateRequestStatus(ticket.id, 'closed', 'Ticket officially closed by Faculty Resolver after verified resolution.');
    setActionSuccess(`Ticket ${ticket.id} closed.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReopenTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopeningTicketId || !ticketReopenReason.trim()) return;
    const targetTicket = requests.find(r => r.id === reopeningTicketId);
    if (!targetTicket) return;

    updateRequestStatus(targetTicket.id, 'reopened', `Reopened by Faculty: ${ticketReopenReason.trim()}`);
    setActionSuccess(`Ticket ${targetTicket.id} reopened for further action.`);
    setReopeningTicketId(null);
    setTicketReopenReason('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleAddInternalNote = (ticketId: string) => {
    if (!internalNoteInput.trim()) return;
    addInternalNote(ticketId, internalNoteInput.trim());
    setInternalNoteInput('');
    setActionSuccess('Internal note added to audit record.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Helper Badge Renderers
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-xs font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-0.5 rounded-md border border-[#F1DFC4]">Submitted</span>;
      case 'assigned':
        return <span className="text-xs font-semibold text-[#234E70] bg-[#EEF4F9] px-2.5 py-0.5 rounded-md border border-[#C8DCED]">Assigned</span>;
      case 'in_progress':
        return <span className="text-xs font-semibold text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded-md border border-[#A2C4AF]">In Progress</span>;
      case 'approved':
        return <span className="text-xs font-semibold text-[#1E3A2F] bg-[#E6F5EF] px-2.5 py-0.5 rounded-md border border-[#1E3A2F]/30">Approved</span>;
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

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#992828] bg-[#FCEDEC] px-2.5 py-0.5 rounded border border-[#F5CBC8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#992828] animate-pulse" />
            <span>URGENT</span>
          </span>
        );
      case 'high':
        return <span className="text-[11px] font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2 py-0.5 rounded border border-[#F1DFC4]">HIGH</span>;
      case 'medium':
        return <span className="text-[11px] font-medium text-[#234E70] bg-[#EEF4F9] px-2 py-0.5 rounded border border-[#C8DCED]">MEDIUM</span>;
      default:
        return <span className="text-[11px] font-medium text-[#5E6D64] bg-[#F7F8F6] px-2 py-0.5 rounded border border-[#E5E9E5]">LOW</span>;
    }
  };

  const getCategoryIcon = (cat: RequestCategory) => {
    switch (cat) {
      case 'leave_gatepass': return <Luggage className="w-4 h-4 text-[#8A5B15]" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-[#234E70]" />;
      case 'bonafide': return <FileCheck className="w-4 h-4 text-[#0D8B65]" />;
      case 'timetable': return <Calendar className="w-4 h-4 text-[#8A5B15]" />;
      case 'fee_dues': return <Building2 className="w-4 h-4 text-[#234E70]" />;
      default: return <FileText className="w-4 h-4 text-[#5E6D64]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans selection:bg-[#1E3A2F] selection:text-white">
      {/* 1. FACULTY HEADER */}
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

        {/* Summary Badges in Header */}
        <div className="flex items-center gap-2">
          {pendingAssignedCount > 0 && (
            <div className="px-3 py-1.5 bg-[#FDF6EB] border border-[#F1DFC4] text-[#8A5B15] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8A5B15] animate-pulse" />
              <span>{pendingAssignedCount} Assigned Ticket(s) Pending</span>
            </div>
          )}
          {pendingGatePassRequests.length > 0 && (
            <div className="px-3 py-1.5 bg-white border border-[#E5E9E5] text-[#202722] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5 text-[#0D8B65]" />
              <span>{pendingGatePassRequests.length} Outstation Pass(es)</span>
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS / ERROR TOASTS */}
      {actionSuccess && (
        <div className="p-4 bg-[#E6F5EF] border border-[#A2C4AF] rounded-2xl text-xs text-[#0D8B65] flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="p-1 text-[#0D8B65] hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-[#FCEDEC] border border-[#F5CBC8] rounded-2xl text-xs text-[#992828] flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 text-[#992828] hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. NAVIGATION TABS */}
      <div className="flex bg-[#F7F8F6] p-1.5 rounded-2xl border border-[#E5E9E5] text-xs font-semibold max-w-2xl overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('assigned_tickets')}
          className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'assigned_tickets' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64] hover:text-[#202722]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#0D8B65]" />
          <span>Assigned Tickets</span>
          {pendingAssignedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#8A5B15] text-white text-[10px] font-bold">
              {pendingAssignedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gatepasses')}
          className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'gatepasses' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64] hover:text-[#202722]'
          }`}
        >
          <Luggage className="w-4 h-4 text-[#234E70]" />
          <span>Gate Pass Approvals</span>
          {pendingGatePassRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#8A5B15] text-white text-[10px] font-bold">
              {pendingGatePassRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mentoring')}
          className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'mentoring' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64] hover:text-[#202722]'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#234E70]" />
          <span>Student Advisees</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'timetable' ? 'bg-white text-[#202722] shadow-2xs font-bold' : 'text-[#5E6D64] hover:text-[#202722]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#8A5B15]" />
          <span>Class Schedules</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: SERVICE REQUESTS / ASSIGNED TICKETS INTERFACE           */}
      {/* ============================================================= */}
      {activeTab === 'assigned_tickets' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* STAT SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-[#5E6D64] font-medium block">Total Assigned</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#202722]">{totalAssignedCount}</span>
                <span className="text-[10px] font-semibold text-[#5E6D64] bg-[#F7F8F6] px-2 py-0.5 rounded">All Roles</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-[#8A5B15] font-medium block">Pending Review</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#8A5B15]">{pendingAssignedCount}</span>
                <span className="text-[10px] font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2 py-0.5 rounded">Action Needed</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-[#0D8B65] font-medium block">In Progress</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#0D8B65]">{inProgressAssignedCount}</span>
                <span className="text-[10px] font-semibold text-[#0D8B65] bg-[#E6F5EF] px-2 py-0.5 rounded">Under Inspection</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-[#5E6D64] font-medium block">Resolved / Closed</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-[#202722]">{resolvedClosedAssignedCount}</span>
                <span className="text-[10px] font-semibold text-[#0D8B65] bg-[#E6F5EF] px-2 py-0.5 rounded">Completed</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  placeholder="Search by ticket ID (e.g. REQ-1050), title, student, department, or keyword..."
                  className="w-full pl-9 pr-8 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
                {ticketSearchQuery && (
                  <button onClick={() => setTicketSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5E6D64] hover:text-[#202722]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#5E6D64]" />
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] font-semibold focus:outline-none focus:border-[#1E3A2F]"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted (New)</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="reopened">Reopened</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] font-semibold focus:outline-none focus:border-[#1E3A2F]"
                >
                  <option value="all">All Categories</option>
                  <option value="leave_gatepass">Leave & Gate Pass</option>
                  <option value="timetable">Academic & Timetable</option>
                  <option value="maintenance">Hostel Maintenance</option>
                  <option value="bonafide">Bonafide Certificates</option>
                  <option value="mess">Mess & Dining</option>
                  <option value="fee_dues">Fee & Dues</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => setTicketPriorityFilter(e.target.value)}
                  className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] font-semibold focus:outline-none focus:border-[#1E3A2F]"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Active filters notice if applied */}
            {(ticketStatusFilter !== 'all' || ticketCategoryFilter !== 'all' || ticketPriorityFilter !== 'all' || ticketSearchQuery) && (
              <div className="flex items-center justify-between text-xs text-[#5E6D64] pt-2 border-t border-[#E5E9E5]">
                <span>Showing {filteredAssignedTickets.length} matching ticket(s) of {facultyAssignedTickets.length} total assigned.</span>
                <button
                  onClick={() => {
                    setTicketStatusFilter('all');
                    setTicketCategoryFilter('all');
                    setTicketPriorityFilter('all');
                    setTicketSearchQuery('');
                  }}
                  className="text-[#0D8B65] font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* TICKET CARDS LIST */}
          <div className="space-y-3">
            {filteredAssignedTickets.length === 0 ? (
              <div className="bg-white border border-[#E5E9E5] rounded-3xl p-12 text-center shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F7F8F6] text-[#5E6D64] flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#202722]">No Assigned Tickets Found</h3>
                <p className="text-xs text-[#5E6D64] max-w-md mx-auto leading-relaxed">
                  {facultyAssignedTickets.length === 0
                    ? `No campus service tickets are currently routed to ${currentUser.name} or ${currentUser.department}. Unassigned maintenance, mess, and fee tickets remain in their respective administrative queues.`
                    : 'No service tickets match your selected search or filter criteria. Try adjusting your filters above.'}
                </p>
                {facultyAssignedTickets.length > 0 && (
                  <button
                    onClick={() => {
                      setTicketStatusFilter('all');
                      setTicketCategoryFilter('all');
                      setTicketPriorityFilter('all');
                      setTicketSearchQuery('');
                    }}
                    className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl hover:bg-[#163328] transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              filteredAssignedTickets.map(ticket => {
                const isOverdue = isTicketOverdue(ticket);
                const isNearSla = isTicketApproachingSla(ticket);

                return (
                  <div 
                    key={ticket.id}
                    className="bg-white border border-[#E5E9E5] hover:border-[#1E3A2F]/30 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all space-y-3"
                  >
                    {/* Top Row: ID, Badges, Priority, Overdue */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#202722] bg-[#F7F8F6] px-2.5 py-1 rounded-lg border border-[#E5E9E5]">
                          {ticket.id}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F6] text-xs font-semibold text-[#202722] border border-[#E5E9E5]">
                          {getCategoryIcon(ticket.category)}
                          <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                        </span>

                        {getStatusBadge(ticket.status)}
                      </div>

                      <div className="flex items-center gap-2">
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#992828] bg-[#FCEDEC] px-2 py-0.5 rounded border border-[#F5CBC8] animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>OVERDUE</span>
                          </span>
                        )}
                        {!isOverdue && isNearSla && (
                          <span className="text-[10px] font-bold text-[#8A5B15] bg-[#FDF6EB] px-2 py-0.5 rounded border border-[#F1DFC4]">
                            SLA RISK
                          </span>
                        )}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#202722]">{ticket.title}</h4>
                      <p className="text-xs text-[#5E6D64] line-clamp-2 mt-1 leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Metadata Strip: Student, Department, Location, SLA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E9E5] text-xs text-[#5E6D64]">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[#202722]">
                          <User className="w-3.5 h-3.5 text-[#5E6D64]" />
                          <span className="font-semibold">{ticket.studentName}</span>
                          <span className="text-[#5E6D64] font-mono">({ticket.studentId})</span>
                        </div>

                        <div className="text-[11px] text-[#5E6D64]">
                          {ticket.hostelRoom.split('·')[0]}
                        </div>

                        {ticket.details?.campusLocationName && (
                          <div className="flex items-center gap-1 text-[#234E70] bg-[#EEF4F9] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#C8DCED]">
                            <MapPin className="w-3 h-3" />
                            <span>{ticket.details.campusLocationName}</span>
                            {ticket.details.campusLocationId && (
                              <button
                                type="button"
                                onClick={() => navigateToMapLocation(ticket.details.campusLocationId!)}
                                className="underline hover:text-[#1E3A2F] ml-1"
                                title="Pan to building on GIS map"
                              >
                                View Map
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-[11px] text-[#5E6D64]">
                          <span>SLA: {ticket.slaHours}h</span>
                          <span className="mx-1">·</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="px-3.5 py-1.5 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <span>Review & Actions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: GATE PASS APPROVALS QUEUE (PRESERVED)                  */}
      {/* ============================================================= */}
      {activeTab === 'gatepasses' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filter Bar */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gatePassSearchQuery}
                onChange={(e) => setGatePassSearchQuery(e.target.value)}
                placeholder="Search by student name, ID, destination, or request serial..."
                className="w-full pl-9 pr-4 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#5E6D64]" />
              <select
                value={gatePassFilterStatus}
                onChange={(e) => setGatePassFilterStatus(e.target.value)}
                className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] font-semibold focus:outline-none focus:border-[#1E3A2F]"
              >
                <option value="all">All Request Statuses</option>
                <option value="PENDING">Pending Review ({pendingGatePassRequests.length})</option>
                <option value="PASS_ISSUED">Pass Issued</option>
                <option value="REJECTED">Declined</option>
                <option value="USED">Already Departed</option>
              </select>
            </div>
          </div>

          {/* Gate Pass Cards List */}
          <div className="space-y-3">
            {filteredGatePasses.length === 0 ? (
              <div className="bg-white border border-[#E5E9E5] rounded-3xl p-12 text-center shadow-2xs space-y-2">
                <Luggage className="w-10 h-10 text-[#5E6D64] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[#202722]">No gate pass requests found</h3>
                <p className="text-xs text-[#5E6D64]">There are no outstation authorization requests matching the active filter.</p>
              </div>
            ) : (
              filteredGatePasses.map((req) => {
                const issuedPass = issuedGatePasses.find(p => p.requestId === req.id);

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-[#E5E9E5] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 transition-all hover:border-[#1E3A2F]/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#202722] bg-[#F7F8F6] px-2.5 py-1 rounded-lg border border-[#E5E9E5]">
                          {req.id}
                        </span>
                        <span className="font-bold text-sm text-[#202722]">{req.studentName}</span>
                        <span className="text-xs font-mono text-[#5E6D64]">({req.studentId})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'PENDING' && (
                          <span className="text-[11px] font-bold text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-0.5 rounded-full border border-[#F1DFC4] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Action Pending</span>
                          </span>
                        )}
                        {req.status === 'PASS_ISSUED' && (
                          <span className="text-[11px] font-bold text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded-full border border-[#A2C4AF] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Pass Active ({req.issuedPassId})</span>
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-[11px] font-bold text-[#992828] bg-[#FCEDEC] px-2.5 py-0.5 rounded-full border border-[#F5CBC8] flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#F7F8F6] rounded-xl text-xs">
                      <div>
                        <span className="text-[#5E6D64] block text-[10px] uppercase font-bold">Destination & Purpose</span>
                        <span className="font-semibold text-[#202722]">{req.destination}</span>
                        <p className="text-[11px] text-[#5E6D64] mt-0.5 line-clamp-1">{req.reason}</p>
                      </div>

                      <div>
                        <span className="text-[#5E6D64] block text-[10px] uppercase font-bold">Departure – Return</span>
                        <span className="font-semibold text-[#202722]">
                          {req.departureDate} ({req.departureTime})
                        </span>
                        <span className="text-[11px] text-[#5E6D64] block">
                          Return: {req.expectedReturnDate} ({req.expectedReturnTime})
                        </span>
                      </div>

                      <div>
                        <span className="text-[#5E6D64] block text-[10px] uppercase font-bold">Hostel Residence</span>
                        <span className="font-semibold text-[#202722]">{req.hostel} · {req.room}</span>
                        <div className="text-[11px] text-[#5E6D64] mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{req.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <div className="p-2.5 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl text-xs text-[#992828] flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Decline Reason:</strong> {req.rejectionReason}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#5E6D64]">
                        Applied: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingGatePassId(req.id);
                                setGatePassRejectionReason('');
                              }}
                              className="px-3.5 py-1.5 border border-[#F5CBC8] text-[#992828] hover:bg-[#FCEDEC] text-xs font-semibold rounded-xl transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveGatePass(req.id)}
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

      {/* ============================================================= */}
      {/* TAB 3: STUDENT ADVISEES (PRESERVED)                           */}
      {/* ============================================================= */}
      {activeTab === 'mentoring' && (
        <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4 animate-in fade-in">
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

      {/* ============================================================= */}
      {/* TAB 4: TIMETABLE & CLASS SCHEDULES (PRESERVED)                */}
      {/* ============================================================= */}
      {activeTab === 'timetable' && (
        <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4 animate-in fade-in">
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

      {/* ============================================================= */}
      {/* MODAL / DRAWER: TICKET DETAIL & ACTION WORKFLOW               */}
      {/* ============================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E9E5] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5E9E5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#202722] bg-[#F7F8F6] px-2.5 py-1 rounded-lg border border-[#E5E9E5]">
                    {selectedTicket.id}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8F6] text-xs font-semibold text-[#202722] border border-[#E5E9E5]">
                    {getCategoryIcon(selectedTicket.category)}
                    <span className="capitalize">{selectedTicket.category.replace('_', ' ')}</span>
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h3 className="text-lg font-bold text-[#202722] mt-2">{selectedTicket.title}</h3>
              </div>

              <button 
                onClick={() => setSelectedTicketId(null)}
                className="p-1.5 text-[#5E6D64] hover:text-[#202722] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overdue Warning */}
            {isTicketOverdue(selectedTicket) && (
              <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-[#992828] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span><strong>SLA Breached:</strong> This request has exceeded its target resolution window of {selectedTicket.slaHours} hours.</span>
              </div>
            )}

            {/* Student & Department Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F7F8F6] rounded-2xl text-xs">
              <div>
                <span className="text-[#5E6D64] block text-[10px] uppercase font-bold">Student Applicant</span>
                <span className="font-bold text-[#202722] text-sm">{selectedTicket.studentName}</span>
                <div className="text-[11px] text-[#5E6D64] font-mono mt-0.5">ID: {selectedTicket.studentId} · {selectedTicket.studentEmail}</div>
                <div className="text-[11px] text-[#5E6D64] mt-0.5">{selectedTicket.hostelRoom}</div>
              </div>

              <div>
                <span className="text-[#5E6D64] block text-[10px] uppercase font-bold">Assigned Department & Resolver</span>
                <span className="font-semibold text-[#202722]">{selectedTicket.department}</span>
                <div className="text-[11px] text-[#5E6D64] mt-0.5">
                  Assigned: <strong>{selectedTicket.assignedStaff || 'Unassigned / Needs Review'}</strong> {selectedTicket.assignedRole ? `(${selectedTicket.assignedRole})` : ''}
                </div>
                <div className="text-[11px] text-[#5E6D64] mt-0.5">
                  Target SLA: {selectedTicket.slaHours} Hours · Priority: {selectedTicket.priority.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Location (with Map shortcut) */}
            {selectedTicket.details?.campusLocationName && (
              <div className="flex items-center justify-between p-3 bg-[#EEF4F9] border border-[#C8DCED] rounded-xl text-xs text-[#234E70]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Reported Location: <strong>{selectedTicket.details.campusLocationName}</strong></span>
                </div>
                {selectedTicket.details.campusLocationId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigateToMapLocation(selectedTicket.details.campusLocationId!);
                      setSelectedTicketId(null);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-[#F7F8F6] text-[#234E70] font-bold rounded-lg border border-[#C8DCED] transition-colors"
                  >
                    View on Campus Map
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-[#202722] block mb-1">Issue Details & Applicant Statement</span>
              <p className="text-xs text-[#202722] leading-relaxed p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                {selectedTicket.description}
              </p>
            </div>

            {/* Category Specific Details */}
            {selectedTicket.category === 'leave_gatepass' && selectedTicket.details && (
              <div className="p-3 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl text-xs space-y-1">
                <span className="font-bold text-[#8A5B15] block text-[11px] uppercase">Outstation Clearance Details:</span>
                <div><strong>Destination:</strong> {selectedTicket.details.destination || 'N/A'}</div>
                <div><strong>Dates:</strong> {selectedTicket.details.departureDate} ({selectedTicket.details.departureTime}) to {selectedTicket.details.returnDate} ({selectedTicket.details.returnTime})</div>
                <div><strong>Reason:</strong> {selectedTicket.details.reason || 'N/A'}</div>
                {selectedTicket.details.emergencyContact && <div><strong>Emergency Contact:</strong> {selectedTicket.details.emergencyContact}</div>}
              </div>
            )}

            {/* WORKFLOW ACTIONS PANEL */}
            <div className="p-4 bg-white border border-[#E5E9E5] rounded-2xl space-y-3">
              <span className="text-xs font-bold text-[#202722] block uppercase tracking-wide">
                Faculty Resolution & Workflow Controls
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Self-Assign Button */}
                {(!selectedTicket.assignedStaff || selectedTicket.assignedStaff !== currentUser.name) && selectedTicket.status === 'submitted' && (
                  <button
                    type="button"
                    onClick={() => handleSelfAssignTicket(selectedTicket)}
                    className="px-3.5 py-2 bg-[#234E70] hover:bg-[#1a3a53] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept & Assign to Myself</span>
                  </button>
                )}

                {/* 2. Start In Progress */}
                {(selectedTicket.status === 'submitted' || selectedTicket.status === 'assigned') && (
                  <button
                    type="button"
                    onClick={() => handleStartProgress(selectedTicket)}
                    className="px-3.5 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Start Active Progress</span>
                  </button>
                )}

                {/* 3. Authorize & Approve (for leave/gatepass and bonafide) */}
                {(selectedTicket.category === 'leave_gatepass' || selectedTicket.category === 'bonafide') && 
                  selectedTicket.status !== 'approved' && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setApprovingTicketId(selectedTicket.id);
                      setTicketApprovalNote('');
                    }}
                    className="px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize & Approve Request</span>
                  </button>
                )}

                {/* 4. Decline / Reject (for authorization requests) */}
                {(selectedTicket.category === 'leave_gatepass' || selectedTicket.category === 'bonafide') && 
                  selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingTicketId(selectedTicket.id);
                      setTicketRejectionReason('');
                    }}
                    className="px-3.5 py-2 border border-[#F5CBC8] text-[#992828] hover:bg-[#FCEDEC] text-xs font-semibold rounded-xl transition-colors"
                  >
                    Decline Request
                  </button>
                )}

                {/* 5. Mark as Resolved (for operational/complaint tickets) */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResolvingTicketId(selectedTicket.id);
                      setResolutionSummary('');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {/* 6. Close Ticket */}
                {selectedTicket.status === 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleCloseTicket(selectedTicket)}
                    className="px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Close Ticket</span>
                  </button>
                )}

                {/* 7. Reopen Ticket */}
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                  <button
                    type="button"
                    onClick={() => {
                      setReopeningTicketId(selectedTicket.id);
                      setTicketReopenReason('');
                    }}
                    className="px-3 py-1.5 border border-[#E5E9E5] text-xs font-semibold text-[#5E6D64] hover:text-[#202722] rounded-xl hover:bg-[#F7F8F6] transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            </div>

            {/* INTERNAL NOTES SECTION */}
            <div className="p-4 bg-[#F7F8F6] border border-[#E5E9E5] rounded-2xl space-y-3">
              <span className="text-xs font-bold text-[#202722] block uppercase tracking-wide">
                Internal Faculty & Resolver Notes ({selectedTicket.internalNotes.length})
              </span>

              {selectedTicket.internalNotes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTicket.internalNotes.map(note => (
                    <div key={note.id} className="p-2.5 bg-white border border-[#E5E9E5] rounded-xl text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#5E6D64] mb-1">
                        <span className="font-semibold text-[#202722]">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[#202722]">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="Add confidential internal resolver note..."
                  className="flex-1 px-3 py-2 bg-white border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
                <button
                  type="button"
                  onClick={() => handleAddInternalNote(selectedTicket.id)}
                  disabled={!internalNoteInput.trim()}
                  className="px-3 py-2 bg-[#202722] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs disabled:opacity-40"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* TIMELINE AUDIT HISTORY */}
            <div className="space-y-2 pt-2 border-t border-[#E5E9E5]">
              <span className="text-xs font-bold text-[#202722] block uppercase tracking-wide">
                Audit Timeline ({selectedTicket.timeline.length} Events)
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedTicket.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="p-2.5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#5E6D64] mb-0.5">
                      <span className="font-semibold text-[#202722]">{event.action}</span>
                      <span>{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[11px] text-[#5E6D64]">
                      By: <span className="font-medium text-[#202722]">{event.actor}</span> ({event.role})
                    </div>
                    {event.note && (
                      <p className="text-xs text-[#202722] mt-1 bg-white p-2 rounded-lg border border-[#E5E9E5]">
                        {event.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ACTION SUB-MODALS                                             */}
      {/* ============================================================= */}

      {/* 1. TICKET RESOLUTION MODAL */}
      {resolvingTicketId && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Record Ticket Resolution</h3>
              <button onClick={() => setResolvingTicketId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              Provide a clear summary of the action taken to resolve this ticket. This resolution will be logged in the permanent student audit timeline.
            </p>

            <form onSubmit={handleResolveTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Resolution Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="e.g. Conducted site verification, fixed room switchboard and replaced faulty fuse. Clear for usage."
                  className="w-full p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#0D8B65]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResolvingTicketId(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TICKET APPROVAL MODAL */}
      {approvingTicketId && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Authorize & Approve Request</h3>
              <button onClick={() => setApprovingTicketId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              Confirm authorization for this request. An approval stamp and timeline record will be attached to the student document.
            </p>

            <form onSubmit={handleApproveTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Approval Note (Optional)</label>
                <input
                  type="text"
                  value={ticketApprovalNote}
                  onChange={(e) => setTicketApprovalNote(e.target.value)}
                  placeholder="e.g. Verified academic records and attendance eligibility."
                  className="w-full p-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApprovingTicketId(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TICKET REJECTION MODAL */}
      {rejectingTicketId && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Decline Service Request</h3>
              <button onClick={() => setRejectingTicketId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              State the official reason for declining this request. The applicant will be notified with this message.
            </p>

            <form onSubmit={handleRejectTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  value={ticketRejectionReason}
                  onChange={(e) => setTicketRejectionReason(e.target.value)}
                  placeholder="e.g. Outstanding laboratory fees pending or documentation incomplete."
                  className="w-full p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#992828]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingTicketId(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#992828] hover:bg-[#801e1e] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TICKET REOPEN MODAL */}
      {reopeningTicketId && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Reopen Resolved Ticket</h3>
              <button onClick={() => setReopeningTicketId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              Explain why this ticket is being reopened for further inspection or corrective action.
            </p>

            <form onSubmit={handleReopenTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Reason for Reopening *</label>
                <textarea
                  required
                  rows={3}
                  value={ticketReopenReason}
                  onChange={(e) => setTicketReopenReason(e.target.value)}
                  placeholder="e.g. Issue re-occurred after initial fix. Additional parts required."
                  className="w-full p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReopeningTicketId(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. GATE PASS REJECTION MODAL (PRESERVED) */}
      {rejectingGatePassId && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202722]">Decline Gate Pass Request</h3>
              <button onClick={() => setRejectingGatePassId(null)} className="p-1 text-[#5E6D64]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5E6D64]">
              State the official institutional or warden reason for declining this outstation request. The student will be notified immediately.
            </p>

            <form onSubmit={handleRejectGatePassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  value={gatePassRejectionReason}
                  onChange={(e) => setGatePassRejectionReason(e.target.value)}
                  placeholder="e.g. Mandatory laboratory exam scheduled on requested date, or guardian confirmation pending."
                  className="w-full p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingGatePassId(null)}
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

      {/* 6. ACTIVE DIGITAL GATE PASS MODAL (PRESERVED) */}
      {activeGatePassModal && (
        <GatePassModal
          pass={activeGatePassModal}
          onClose={() => setActiveGatePassModal(null)}
        />
      )}
    </div>
  );
};
