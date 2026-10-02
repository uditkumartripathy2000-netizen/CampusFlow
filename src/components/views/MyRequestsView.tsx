import React, { useState, useMemo } from 'react';
import { 
  Search, 
  List, 
  Table as TableIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  PlusCircle, 
  Send, 
  RotateCcw, 
  Check, 
  Building2, 
  Calendar,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  HelpCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { RequestItem, RequestStatus, RequestPriority, RequestCategory } from '../../types/index.ts';
import { STAFF_DIRECTORY } from '../../data/seedData.ts';

interface MyRequestsViewProps {
  onOpenWizard: () => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  onOpenWizard,
  selectedId,
  onSelectId
}) => {
  const { 
    requests, 
    currentUser, 
    role, 
    updateRequestStatus, 
    addClarification, 
    addInternalNote,
    assignStaff,
    changePriority,
    searchQuery,
    setSearchQuery,
    getActiveUrgentRequest,
    navigateToMapLocation 
  } = useCampus();

  // Filters
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Drawer comment state
  const [commentText, setCommentText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [assigneeSelect, setAssigneeSelect] = useState(STAFF_DIRECTORY[0].name);

  // Priority Change Modal State (Staff/Admin only - Rule 8)
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [newPriorityTarget, setNewPriorityTarget] = useState<RequestPriority>('urgent');
  const [priorityChangeReason, setPriorityChangeReason] = useState('');
  const [priorityModalError, setPriorityModalError] = useState<string | null>(null);

  // Active selected request
  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedId) || null;
  }, [requests, selectedId]);

  // Filtered requests list (Role-aware: students only see their own requests!)
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Scenario H: Role changes do not leak one student's requests to another student's view
      if (role === 'student') {
        const isOwner = req.studentId === currentUser.studentId || 
                        (currentUser.studentId && req.studentId === currentUser.studentId) ||
                        req.studentName.toLowerCase().includes('udit');
        if (!isOwner) return false;
      }

      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchStudent = req.studentName.toLowerCase().includes(q);
        const matchDept = req.department.toLowerCase().includes(q);
        const matchRoom = req.hostelRoom.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchStudent && !matchDept && !matchRoom) {
          return false;
        }
      }

      return true;
    });
  }, [requests, role, currentUser, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-xs font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-1 rounded-md border border-[#F1DFC4]">Submitted</span>;
      case 'assigned':
        return <span className="text-xs font-semibold text-[#234E70] bg-[#EEF4F9] px-2.5 py-1 rounded-md border border-[#C8DCED]">Assigned</span>;
      case 'in_progress':
        return <span className="text-xs font-semibold text-[#203B32] bg-[#DCE8DF] px-2.5 py-1 rounded-md border border-[#A2C4AF]">In Progress</span>;
      case 'resolved':
        return <span className="text-xs font-semibold text-[#203B32] bg-[#DCE8DF] px-2.5 py-1 rounded-md border border-[#A2C4AF]">Resolved</span>;
      case 'closed':
        return <span className="text-xs font-semibold text-[#65736A] bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E4E2D9]">Closed</span>;
      case 'reopened':
        return <span className="text-xs font-semibold text-[#992828] bg-[#FCEDEC] px-2.5 py-1 rounded-md border border-[#F5CBC8]">Reopened</span>;
      default:
        return <span className="text-xs text-[#65736A]">{status}</span>;
    }
  };

  const getPriorityBadge = (req: RequestItem) => {
    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded ${
            req.priority === 'urgent'
              ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]'
              : req.priority === 'high'
                ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]'
                : req.priority === 'medium'
                  ? 'bg-[#F7F8F6] text-[#202722] border border-[#E5E9E5]'
                  : 'bg-[#F7F8F6] text-[#5E6D64] border border-[#E5E9E5]'
          }`}>
            {req.priority === 'urgent' && <AlertCircle className="w-3.5 h-3.5 text-[#992828]" />}
            <span>{req.priority.toUpperCase()}</span>
          </span>

          {req.priorityVerifiedByStaff && (
            <span className="text-[10px] bg-[#E6F5EF] text-[#0D8B65] font-semibold px-1.5 py-0.5 rounded border border-[#A2C4AF]">
              Staff Verified
            </span>
          )}
        </div>

        {req.requestedPriority && req.requestedPriority !== req.priority && (
          <span className="text-[10px] text-[#5E6D64] font-mono">
            Student Req: <span className="uppercase font-semibold">{req.requestedPriority}</span>
          </span>
        )}

        {req.flaggedForTriage && (
          <span className="text-[10px] text-[#8A5B15] bg-[#FDF6EB] border border-[#F1DFC4] px-1.5 py-0.5 rounded font-mono font-medium">
            Triage Flagged
          </span>
        )}
      </div>
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !commentText.trim()) return;
    addClarification(selectedId, commentText.trim());
    setCommentText('');
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !internalNoteText.trim()) return;
    addInternalNote(selectedId, internalNoteText.trim());
    setInternalNoteText('');
  };

  const handleExecutePriorityChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!priorityChangeReason.trim()) {
      setPriorityModalError('A mandatory reason is required to adjust request priority.');
      return;
    }
    changePriority(selectedId, newPriorityTarget, priorityChangeReason.trim());
    setIsPriorityModalOpen(false);
    setPriorityChangeReason('');
    setPriorityModalError(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E2D9]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#26312B] tracking-tight">
              {role === 'student' ? 'My Campus Requests' : 'Requests Central Directory'}
            </h2>
            <span className="text-xs font-mono bg-[#DCE8DF] text-[#203B32] px-2.5 py-0.5 rounded font-semibold">
              {role === 'student' ? 'Student View' : 'Operations Queue'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#65736A] mt-0.5">
            Submit, track, clarify, and review the status and chronological audit history of requests
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#203B32] hover:bg-[#172C25] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campus Request</span>
        </button>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-white border border-[#E4E2D9] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65736A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (REQ-1042), title, student, room..."
              className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32] focus:bg-white transition-colors"
            />
          </div>

          {/* View Toggles & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-[#203B32] font-semibold' : 'text-[#65736A]'}`}
                title="Table Grid View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-[#203B32] font-semibold' : 'text-[#65736A]'}`}
                title="Detailed List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#65736A] hover:text-[#26312B] px-2.5 py-1.5 rounded-lg border border-[#E4E2D9] hover:bg-[#F7F5F0]"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Select Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E4E2D9] text-xs">
          <span className="text-[#65736A] font-semibold text-xs uppercase">Filter by:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F5F0] border border-[#E4E2D9] rounded-lg px-2.5 py-1.5 text-xs text-[#26312B]"
          >
            <option value="all">All Statuses ({filteredRequests.length})</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F7F5F0] border border-[#E4E2D9] rounded-lg px-2.5 py-1.5 text-xs text-[#26312B]"
          >
            <option value="all">All Categories</option>
            <option value="bonafide">Bonafide Certificate</option>
            <option value="maintenance">Hostel Maintenance</option>
            <option value="leave_gatepass">Leave & Gate Pass</option>
            <option value="timetable">Timetable Query</option>
            <option value="mess">Mess & Dining</option>
            <option value="fee_dues">Fee & Dues</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F7F5F0] border border-[#E4E2D9] rounded-lg px-2.5 py-1.5 text-xs text-[#26312B]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <span className="text-xs text-[#65736A] ml-auto font-mono tabular-nums">
            Showing {filteredRequests.length} requests
          </span>
        </div>
      </div>

      {/* Main Request Content: Table or List View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-[#E4E2D9] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-[#F7F5F0] border-b border-[#E4E2D9] text-[#65736A]">
                  <th className="py-3 px-4 font-semibold">Request ID</th>
                  <th className="py-3 px-4 font-semibold">Subject & Category</th>
                  <th className="py-3 px-4 font-semibold">Requester</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Age / SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2D9]">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#65736A]">
                      <div className="max-w-xs mx-auto space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#203B32] mx-auto opacity-70" />
                        <div className="font-semibold text-[#26312B] text-sm">No matching requests found</div>
                        <p className="text-xs leading-relaxed">Try adjusting your filters or click New Campus Request to create a new ticket.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const isSelected = selectedId === req.id;
                    const ageHours = Math.round((Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60));
                    const isOverdue = ageHours > req.slaHours && req.status !== 'resolved' && req.status !== 'closed';

                    return (
                      <tr
                        key={req.id}
                        onClick={() => onSelectId(req.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-[#DCE8DF]/40' 
                            : 'hover:bg-[#F7F5F0]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#203B32]">
                          {req.id}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-[#26312B] truncate">{req.title}</div>
                          <div className="text-[11px] text-[#65736A] uppercase mt-0.5">
                            {req.category.replace('_', ' ')}
                            {req.isLinkedIncident && (
                              <span className="text-[#203B32] lowercase font-sans ml-1 font-medium">· linked {req.linkedIncidentId}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[#26312B] font-medium">{req.studentName}</div>
                          <div className="text-[11px] text-[#65736A] truncate">{req.hostelRoom.split('·')[1] || req.hostelRoom}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[#65736A] truncate max-w-[160px]">
                          {req.department}
                        </td>

                        <td className="py-3.5 px-4">
                          {getPriorityBadge(req)}
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(req.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className={`font-mono text-xs ${isOverdue ? 'text-[#992828] font-bold' : 'text-[#26312B]'}`}>
                            {ageHours}h open
                          </div>
                          <div className="text-[11px] text-[#65736A]">SLA: {req.slaHours}h</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3.5">
          {filteredRequests.map(req => {
            const isSelected = selectedId === req.id;
            const ageHours = Math.round((Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60));

            return (
              <div
                key={req.id}
                onClick={() => onSelectId(req.id)}
                className={`p-5 bg-white border rounded-2xl cursor-pointer transition-all shadow-xs ${
                  isSelected ? 'border-[#203B32] ring-1 ring-[#203B32]' : 'border-[#E4E2D9] hover:border-[#203B32]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#203B32]">{req.id}</span>
                    <span className="text-[#E4E2D9]">·</span>
                    <span className="text-[#203B32] font-semibold uppercase text-xs">{req.category.replace('_', ' ')}</span>
                    <span className="text-[#E4E2D9]">·</span>
                    <span className="text-[#65736A]">{req.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(req)}
                    {getStatusBadge(req.status)}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#26312B] mb-1.5">{req.title}</h3>
                <p className="text-xs text-[#65736A] line-clamp-2 leading-relaxed mb-3.5">{req.description}</p>

                <div className="flex items-center justify-between text-xs text-[#65736A] pt-3 border-t border-[#E4E2D9]">
                  <span>Requester: {req.studentName} ({req.hostelRoom})</span>
                  <span className="font-mono">Age: {ageHours}h · SLA: {req.slaHours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-[#E4E2D9] flex items-center justify-between bg-[#F7F5F0]">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-base text-[#203B32]">{selectedRequest.id}</span>
                    <span className="text-[#65736A]">/</span>
                    <span className="font-semibold text-[#26312B] uppercase">{selectedRequest.category.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-[#65736A] mt-0.5">{selectedRequest.department}</div>
                </div>

                <button
                  onClick={() => onSelectId(null)}
                  className="p-1.5 text-[#65736A] hover:text-[#26312B] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6">
                {/* Title & Status Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getStatusBadge(selectedRequest.status)}
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(selectedRequest)}
                      {role !== 'student' && (
                        <button
                          onClick={() => {
                            setNewPriorityTarget(selectedRequest.priority === 'urgent' ? 'high' : 'urgent');
                            setPriorityChangeReason('');
                            setIsPriorityModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#203B32] bg-[#DCE8DF] hover:bg-[#c9ded0] rounded-lg border border-[#A2C4AF] transition-colors"
                        >
                          Change Priority
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#26312B] mt-1">{selectedRequest.title}</h3>
                  
                  <div className="mt-3 p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E4E2D9] text-xs text-[#26312B] leading-relaxed">
                    {selectedRequest.description}
                  </div>
                </div>

                {/* Priority Status & Policy Assessment Panel */}
                <div className="p-4 bg-white border border-[#E5E9E5] rounded-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E9E5]">
                    <span className="text-xs font-bold text-[#202722] uppercase tracking-wider">
                      Priority & Fairness Policy Status
                    </span>
                    <span className="text-[11px] font-mono text-[#0D8B65] bg-[#E6F5EF] px-2 py-0.5 rounded font-semibold">
                      Policy v2.0
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-[#5E6D64] block">Student Requested Priority:</span>
                      <span className="font-semibold text-[#202722] capitalize">
                        {selectedRequest.requestedPriority || (selectedRequest.priority === 'urgent' ? 'urgent' : 'routine / medium')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5E6D64] block">Current Effective Priority:</span>
                      <span className="font-bold text-[#202722] uppercase">
                        {selectedRequest.priority} {selectedRequest.priorityVerifiedByStaff ? '(Staff Verified)' : ''}
                      </span>
                    </div>
                  </div>

                  {selectedRequest.priorityReason && (
                    <div className="p-2.5 bg-[#F7F8F6] rounded-lg text-xs border border-[#E5E9E5]">
                      <span className="text-[#5E6D64] font-medium block text-[11px]">Recorded Justification:</span>
                      <p className="text-[#202722] mt-0.5">{selectedRequest.priorityReason}</p>
                    </div>
                  )}

                  {selectedRequest.flaggedForTriage && (
                    <div className="p-2.5 bg-[#FDF6EB] rounded-lg text-xs border border-[#F1DFC4] text-[#8A5B15]">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Active Urgent Limit Policy Applied</span>
                      </div>
                      <p className="leading-relaxed">
                        {selectedRequest.triageNote || 'Student currently has an active Urgent ticket open. This report was submitted at High Priority and flagged for expedited supervisor triage.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E4E2D9]">
                    <span className="text-[11px] uppercase font-bold text-[#65736A] block">Requester</span>
                    <span className="font-semibold text-[#26312B] block mt-0.5">{selectedRequest.studentName}</span>
                    <span className="text-xs text-[#65736A]">{selectedRequest.studentId}</span>
                  </div>

                  <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E4E2D9]">
                    <span className="text-[11px] uppercase font-bold text-[#65736A] block">Assigned Staff</span>
                    <span className="font-semibold text-[#26312B] block mt-0.5">
                      {selectedRequest.assignedStaff || 'Queue Pending'}
                    </span>
                    <span className="text-xs text-[#65736A]">{selectedRequest.assignedRole || 'Central Pool'}</span>
                  </div>

                  <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E4E2D9]">
                    <span className="text-[11px] uppercase font-bold text-[#65736A] block">SLA Commitment</span>
                    <span className="font-bold font-mono text-[#26312B] block mt-0.5">{selectedRequest.slaHours} Hours</span>
                    <span className="text-xs text-[#65736A]">Created {new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E4E2D9]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-[#65736A] block">Campus Location</span>
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = selectedRequest.details?.campusLocationId || 
                            (selectedRequest.hostelRoom.toLowerCase().includes('block b') ? 'hostel_block_b' : 'hostel_block_a');
                          navigateToMapLocation(targetId);
                        }}
                        className="text-[11px] text-[#0D8B65] hover:underline font-semibold flex items-center gap-1"
                        title="Focus this facility on the continuous campus map"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>View on Map</span>
                      </button>
                    </div>
                    <span className="font-semibold text-[#26312B] block mt-0.5 truncate">
                      {selectedRequest.details?.campusLocationName || selectedRequest.hostelRoom}
                    </span>
                    {selectedRequest.details?.roomNumber && (
                      <span className="text-xs text-[#5E6D64] block">Room/Bay: {selectedRequest.details.roomNumber}</span>
                    )}
                    {selectedRequest.isLinkedIncident && (
                      <span className="text-xs text-[#203B32] font-semibold block mt-0.5">Clustered: {selectedRequest.linkedIncidentId}</span>
                    )}
                  </div>
                </div>

                {/* ROLE ACTIONS PANEL (Admin / Staff / Student) */}
                <div className="p-4 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl space-y-3">
                  <span className="text-xs font-bold text-[#26312B] block uppercase tracking-wider">
                    Available Actions ({role.toUpperCase()})
                  </span>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Status change actions for Staff & Admin */}
                    {role !== 'student' && (
                      <>
                        {selectedRequest.status !== 'in_progress' && (
                          <button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress', 'Started active execution')}
                            className="px-3.5 py-2 bg-[#203B32] text-white rounded-lg hover:bg-[#172C25] font-medium transition-colors shadow-xs"
                          >
                            Mark In Progress
                          </button>
                        )}

                        {selectedRequest.status !== 'resolved' && selectedRequest.status !== 'closed' && (
                          <button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'resolved', 'Task completed and verified')}
                            className="px-3.5 py-2 bg-[#DCE8DF] text-[#203B32] border border-[#A2C4AF] rounded-lg hover:bg-[#cbe0d2] font-semibold transition-colors shadow-xs"
                          >
                            Resolve Request
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setNewPriorityTarget('urgent');
                            setPriorityChangeReason('Supervisor flagged safety risk during morning inspection');
                            setIsPriorityModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8] rounded-lg hover:bg-[#f8dedc] font-semibold transition-colors shadow-xs"
                        >
                          Promote to Urgent...
                        </button>
                      </>
                    )}

                    {/* Student Actions */}
                    {role === 'student' && (
                      <>
                        {selectedRequest.status === 'resolved' && (
                          <button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'closed', 'Student confirmed verified resolution')}
                            className="px-4 py-2 bg-[#203B32] text-white rounded-xl hover:bg-[#172C25] font-semibold transition-colors shadow-xs"
                          >
                            Confirm Resolution & Close
                          </button>
                        )}

                        {(selectedRequest.status === 'resolved' || selectedRequest.status === 'closed') && (
                          <button
                            onClick={() => updateRequestStatus(selectedRequest.id, 'reopened', 'Student reported issue still persists')}
                            className="px-4 py-2 bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4] rounded-xl hover:bg-[#f6ebd7] font-semibold transition-colors shadow-xs"
                          >
                            Reopen Request
                          </button>
                        )}

                        {selectedRequest.status === 'submitted' && (
                          <button
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, 'closed', 'Cancelled by student');
                            }}
                            className="px-3.5 py-2 bg-neutral-200 text-[#202722] rounded-xl hover:bg-neutral-300 font-medium transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Assign Staff (Admin or Staff) */}
                  {role !== 'student' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#E5E9E5]">
                      <select
                        value={assigneeSelect}
                        onChange={(e) => setAssigneeSelect(e.target.value)}
                        className="bg-white border border-[#E5E9E5] rounded-lg px-2.5 py-1.5 text-xs text-[#202722] flex-1"
                      >
                        {STAFF_DIRECTORY.map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.dept})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const staffObj = STAFF_DIRECTORY.find(s => s.name === assigneeSelect);
                          assignStaff(selectedRequest.id, assigneeSelect, staffObj?.role || 'Staff');
                        }}
                        className="px-3 py-1.5 bg-white border border-[#E5E9E5] hover:border-[#0D8B65] text-xs font-semibold rounded-lg text-[#0D8B65] transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>

                {/* Audit Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-[#202722] uppercase tracking-wider mb-3">
                    Chronological Activity Timeline ({selectedRequest.timeline.length})
                  </h4>

                  <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E9E5] ml-2">
                    {selectedRequest.timeline.map((event) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0D8B65]" />
                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#202722]">{event.action}</span>
                            <span className="text-[11px] text-[#5E6D64] font-mono">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-xs text-[#5E6D64] mt-0.5">
                            By {event.actor} · <span className="font-medium text-[#202722]">{event.role}</span>
                            {event.system && <span className="ml-1 text-[#0D8B65] font-mono">via {event.system}</span>}
                          </div>

                          {/* Priority Adjustment Audit Badge */}
                          {event.previousPriority && event.newPriority && (
                            <div className="inline-flex items-center gap-1.5 my-1.5 px-2.5 py-1 rounded bg-[#FDF6EB] border border-[#F1DFC4] text-[11px] font-mono text-[#8A5B15]">
                              <span>Priority Audit:</span>
                              <span className="uppercase line-through">{event.previousPriority}</span>
                              <span>→</span>
                              <span className="uppercase font-bold text-[#992828]">{event.newPriority}</span>
                            </div>
                          )}

                          {event.note && (
                            <p className="text-xs text-[#202722] bg-[#F7F8F6] p-2.5 rounded-lg mt-1 border border-[#E5E9E5] leading-relaxed">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Clarification / Comment Form */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">
                    Add Note / Clarification
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add an update visible to student & staff..."
                      className="flex-1 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32] focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-[#203B32] text-white rounded-xl text-xs font-semibold hover:bg-[#172C25] disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Internal Notes (Staff & Admin only) */}
                {role !== 'student' && (
                  <div className="pt-3 border-t border-[#E4E2D9]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#8A5B15] uppercase">Internal Administrative Notes</span>
                      <span className="text-[11px] text-[#65736A]">Visible only to College Staff</span>
                    </div>

                    {selectedRequest.internalNotes.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {selectedRequest.internalNotes.map(n => (
                          <div key={n.id} className="p-2.5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-lg text-xs text-[#26312B]">
                            <div className="text-[11px] text-[#8A5B15] font-semibold mb-0.5">{n.author}:</div>
                            <div>{n.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddInternalNote} className="flex gap-2">
                      <input
                        type="text"
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        placeholder="Log internal office memo..."
                        className="flex-1 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#8A5B15]"
                      />
                      <button
                        type="submit"
                        disabled={!internalNoteText.trim()}
                        className="px-3.5 py-2 bg-[#8A5B15] text-white rounded-xl text-xs font-semibold hover:bg-[#724a11] disabled:opacity-50"
                      >
                        Add Memo
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E4E2D9] bg-[#F7F5F0] flex items-center justify-between text-xs text-[#65736A]">
              <span className="font-mono">{selectedRequest.id}</span>
              <button
                onClick={() => onSelectId(null)}
                className="text-[#26312B] hover:underline font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIORITY CHANGE MODAL (Staff/Admin Rule 8) */}
      {isPriorityModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2D9] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D9]">
              <div>
                <h3 className="text-base font-bold text-[#26312B]">Adjust Ticket Priority</h3>
                <p className="text-xs text-[#65736A]">Ticket {selectedRequest.id} · Current: {selectedRequest.priority.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setIsPriorityModalOpen(false)}
                className="p-1 text-[#65736A] hover:text-[#26312B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {priorityModalError && (
              <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-xs text-[#992828] rounded-xl">
                {priorityModalError}
              </div>
            )}

            <form onSubmit={handleExecutePriorityChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#26312B] mb-1.5">New Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as RequestPriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriorityTarget(p)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                        newPriorityTarget === p 
                          ? p === 'urgent' 
                            ? 'bg-[#FCEDEC] text-[#992828] border-[#992828]'
                            : 'bg-[#DCE8DF] text-[#203B32] border-[#203B32]'
                          : 'bg-[#F7F5F0] text-[#65736A] border-[#E4E2D9] hover:bg-neutral-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#26312B] mb-1.5">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={3}
                  value={priorityChangeReason}
                  onChange={(e) => setPriorityChangeReason(e.target.value)}
                  placeholder="Explain why this priority adjustment is authorized..."
                  className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32]"
                  required
                />
                <p className="text-[11px] text-[#65736A] mt-1">
                  Reason, previous priority, and staff actor will be permanently recorded in the ticket history.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E2D9]">
                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(false)}
                  className="px-4 py-2 border border-[#E4E2D9] text-[#65736A] hover:bg-[#F7F5F0] rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#203B32] hover:bg-[#172C25] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Confirm Priority Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
