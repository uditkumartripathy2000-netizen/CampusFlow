import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Layers,
  BarChart3,
  Calendar,
  Building2,
  HelpCircle,
  X,
  FileCheck,
  Award,
  ShieldCheck,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { RequestItem, RequestStatus, RequestPriority, BonafideCertificate } from '../../types/index.ts';
import { STAFF_DIRECTORY } from '../../data/seedData.ts';
import { BonafideCertificateModal } from '../common/BonafideCertificateModal.tsx';

interface AdminDashboardViewProps {
  onOpenRequestDetail: (id: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onOpenRequestDetail }) => {
  const { 
    requests, 
    updateRequestStatus, 
    assignStaff, 
    changePriority,
    role,
    currentUser,
    approveBonafideRequest,
    rejectBonafideRequest,
    requestBonafideClarification,
    issueCertificate,
    certificates,
    setActiveVerificationCertId,
    setActiveTab,
    navigateToMapLocation
  } = useCampus();

  // Tab switcher in console
  const [consoleTab, setConsoleTab] = useState<'bonafide' | 'operational' | 'analytics'>('bonafide');
  
  // Bonafide filter
  const [bonafideStatusFilter, setBonafideStatusFilter] = useState<string>('all');
  const [selectedBonafideForReview, setSelectedBonafideForReview] = useState<RequestItem | null>(null);

  // Bonafide Action states
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);
  const [approvalNoteText, setApprovalNoteText] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<BonafideCertificate | null>(null);

  // Operational Queue filters
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Priority Change Modal State for Admin Quick Action
  const [selectedTicketForPriority, setSelectedTicketForPriority] = useState<RequestItem | null>(null);
  const [targetPriority, setTargetPriority] = useState<RequestPriority>('urgent');
  const [adminReason, setAdminReason] = useState('');
  const [priorityError, setPriorityError] = useState<string | null>(null);

  // Bonafide requests list
  const bonafideRequests = useMemo(() => {
    return requests.filter(r => r.category === 'bonafide');
  }, [requests]);

  const filteredBonafideRequests = useMemo(() => {
    return bonafideRequests.filter(req => {
      if (bonafideStatusFilter === 'all') return true;
      if (bonafideStatusFilter === 'pending') {
        return req.status === 'submitted' || req.status === 'assigned' || req.status === 'in_progress';
      }
      if (bonafideStatusFilter === 'approved') {
        return req.status === 'approved';
      }
      if (bonafideStatusFilter === 'issued') {
        return req.status === 'resolved';
      }
      if (bonafideStatusFilter === 'closed') {
        return req.status === 'closed';
      }
      return req.status === bonafideStatusFilter;
    });
  }, [bonafideRequests, bonafideStatusFilter]);

  // Keep selectedBonafideForReview in sync with latest request state
  const activeReviewItem = useMemo(() => {
    if (!selectedBonafideForReview) return null;
    return requests.find(r => r.id === selectedBonafideForReview.id) || selectedBonafideForReview;
  }, [requests, selectedBonafideForReview]);

  // KPI Calculations from live requests state
  const openRequests = useMemo(() => {
    return requests.filter(r => r.status !== 'closed' && r.status !== 'resolved');
  }, [requests]);

  const overdueOrApproachingRequests = useMemo(() => {
    return openRequests.filter(r => {
      const ageHours = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
      return ageHours >= r.slaHours * 0.75;
    });
  }, [openRequests]);

  const medianResolutionHours = useMemo(() => {
    const resolved = requests.filter(r => r.status === 'resolved' || r.status === 'closed');
    if (resolved.length === 0) return 18;
    const hoursList = resolved.map(r => {
      const created = new Date(r.createdAt).getTime();
      const updated = new Date(r.updatedAt).getTime();
      return Math.max(1, Math.round((updated - created) / (1000 * 60 * 60)));
    }).sort((a, b) => a - b);
    return hoursList[Math.floor(hoursList.length / 2)] || 18;
  }, [requests]);

  const slaCompliancePct = useMemo(() => {
    if (requests.length === 0) return 92;
    const nonCompliant = requests.filter(r => {
      const ageHours = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
      return ageHours > r.slaHours && r.status !== 'closed' && r.status !== 'resolved';
    }).length;
    return Math.max(70, Math.round(((requests.length - nonCompliant) / requests.length) * 100));
  }, [requests]);

  // Aging distribution buckets
  const agingBuckets = useMemo(() => {
    let under12 = 0;
    let between12and24 = 0;
    let between24and48 = 0;
    let over48 = 0;

    openRequests.forEach(r => {
      const hours = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
      if (hours < 12) under12++;
      else if (hours < 24) between12and24++;
      else if (hours < 48) between24and48++;
      else over48++;
    });

    return [
      { label: '< 12 Hours', count: under12, color: 'bg-[#203B32]' },
      { label: '12 – 24 Hours', count: between12and24, color: 'bg-[#234E70]' },
      { label: '24 – 48 Hours', count: between24and48, color: 'bg-[#8A5B15]' },
      { label: '> 48 Hours (Overdue)', count: over48, color: 'bg-[#992828]' },
    ];
  }, [openRequests]);

  // Workload by Staff
  const workloadByStaff = useMemo(() => {
    const counts: Record<string, { total: number; urgent: number; dept: string }> = {};

    STAFF_DIRECTORY.forEach(s => {
      counts[s.name] = { total: 0, urgent: 0, dept: s.dept };
    });

    openRequests.forEach(r => {
      if (r.assignedStaff && counts[r.assignedStaff]) {
        counts[r.assignedStaff].total += 1;
        if (r.priority === 'urgent' || r.priority === 'high') {
          counts[r.assignedStaff].urgent += 1;
        }
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [openRequests]);

  // Export to CSV functionality
  const handleExportCsv = () => {
    const headers = ['Request ID', 'Title', 'Category', 'Department', 'Requester', 'Hostel Room', 'Status', 'Priority', 'SLA Hours', 'Assigned Staff', 'Created At'];
    const rows = requests.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      `"${r.department}"`,
      `"${r.studentName}"`,
      `"${r.hostelRoom}"`,
      r.status,
      r.priority,
      r.slaHours,
      `"${r.assignedStaff || 'Unassigned'}"`,
      r.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusflow_requests_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmPriorityChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForPriority) return;
    if (!adminReason.trim()) {
      setPriorityError('Mandatory audit reason is required for priority modification.');
      return;
    }
    changePriority(selectedTicketForPriority.id, targetPriority, adminReason.trim());
    setSelectedTicketForPriority(null);
    setAdminReason('');
    setPriorityError(null);
  };

  // Bonafide Approval Action
  const handleApproveBonafide = (reqId: string) => {
    approveBonafideRequest(reqId, approvalNoteText || 'Academic section ledger clearance verified. Approved for digital certificate generation.');
    setActionSuccessMessage(`Request ${reqId} has been successfully APPROVED by ${currentUser.name}. Certificate Generation action is now enabled.`);
    setApprovalNoteText('');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  // Bonafide Reject Action
  const handleRejectBonafide = (reqId: string) => {
    if (!rejectionReasonText.trim()) return;
    rejectBonafideRequest(reqId, rejectionReasonText.trim());
    setActionSuccessMessage(`Request ${reqId} rejected with reason. Student notification and audit entry generated.`);
    setIsRejecting(false);
    setRejectionReasonText('');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  // Bonafide Clarification Action
  const handleClarifyBonafide = (reqId: string) => {
    if (!clarificationText.trim()) return;
    requestBonafideClarification(reqId, clarificationText.trim());
    setActionSuccessMessage(`Clarification dispatched to student for ${reqId}. Timeline updated.`);
    setIsClarifying(false);
    setClarificationText('');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  // Generate Certificate Action (Only after approval!)
  const handleGenerateCertificate = (reqId: string) => {
    const cert = issueCertificate(reqId);
    setActionSuccessMessage(`Certificate ${cert.id} generated successfully! Added to student repository.`);
    setTimeout(() => setActionSuccessMessage(null), 6000);
    setPreviewCert(cert);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-xs font-semibold text-[#8A5B15] bg-[#FDF6EB] px-2.5 py-1 rounded-md border border-[#F1DFC4]">Submitted</span>;
      case 'assigned':
        return <span className="text-xs font-semibold text-[#234E70] bg-[#EEF4F9] px-2.5 py-1 rounded-md border border-[#C8DCED]">Under Review</span>;
      case 'in_progress':
        return <span className="text-xs font-semibold text-[#203B32] bg-[#DCE8DF] px-2.5 py-1 rounded-md border border-[#A2C4AF]">In Progress</span>;
      case 'approved':
        return <span className="text-xs font-bold text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-1 rounded-md border border-[#0D8B65]/40 animate-pulse">Approved (Ready to Issue)</span>;
      case 'resolved':
        return <span className="text-xs font-bold text-[#1E3A2F] bg-[#DCE8DF] px-2.5 py-1 rounded-md border border-[#1E3A2F]/40">Certificate Issued</span>;
      case 'closed':
        return <span className="text-xs font-semibold text-[#992828] bg-[#FCEDEC] px-2.5 py-1 rounded-md border border-[#F5CBC8]">Rejected / Closed</span>;
      default:
        return <span className="text-xs text-[#5E6D64] capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
              {role === 'staff' ? 'Academic Section & Operations' : 'Administrator Operations Console'}
            </h2>
            <span className="text-xs font-mono bg-[#E6F5EF] text-[#0D8B65] px-2.5 py-0.5 rounded font-semibold border border-[#A2C4AF]">
              {role.toUpperCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            {role === 'staff' 
              ? 'Process bonafide certificate requests and departmental student submissions'
              : 'Institutional credential approvals, queue operations, SLA telemetry, and workload distribution'}
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E9E5] hover:bg-[#F7F8F6] text-xs font-semibold text-[#202722] rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#5E6D64]" />
              <span>Export Requests (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* ACTION FEEDBACK BANNER */}
      {actionSuccessMessage && (
        <div className="p-4 bg-[#E6F5EF] border border-[#A2C4AF] rounded-2xl flex items-center justify-between text-xs text-[#0D8B65] font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="p-1 hover:text-[#0b7756]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONSOLE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E5E9E5] pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setConsoleTab('bonafide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            consoleTab === 'bonafide'
              ? 'bg-[#1E3A2F] text-white shadow-2xs'
              : 'bg-white border border-[#E5E9E5] text-[#5E6D64] hover:text-[#202722]'
          }`}
        >
          <Award className="w-4 h-4 text-[#9A7B38]" />
          <span>Bonafide Certificate Requests</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            consoleTab === 'bonafide' ? 'bg-[#9A7B38] text-white' : 'bg-[#E6F5EF] text-[#0D8B65]'
          }`}>
            {bonafideRequests.length}
          </span>
        </button>

        {role === 'admin' && (
          <>
            <button
              onClick={() => setConsoleTab('operational')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                consoleTab === 'operational'
                  ? 'bg-[#1E3A2F] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E9E5] text-[#5E6D64] hover:text-[#202722]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>General Operations Queue</span>
              <span className="font-mono text-xs opacity-80">({requests.length})</span>
            </button>

            <button
              onClick={() => setConsoleTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                consoleTab === 'analytics'
                  ? 'bg-[#1E3A2F] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E9E5] text-[#5E6D64] hover:text-[#202722]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>SLA & Workload Analytics</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: BONAFIDE REQUESTS WORKFLOW (Exact Admin & Staff specification) */}
      {consoleTab === 'bonafide' && (
        <div className="space-y-6">
          
          {/* Bonafide Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-sm text-[#5E6D64] font-medium leading-relaxed block">Total Bonafide Requests</span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#202722] mt-2 block">
                  {bonafideRequests.length}
                </span>
              </div>
              <span className="text-xs text-[#5E6D64] mt-2 block leading-relaxed pt-2 border-t border-[#E5E9E5]">Academic Registrar Ledger</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-sm text-[#8A5B15] font-semibold leading-relaxed block">Under Review / Pending</span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#8A5B15] mt-2 block">
                  {bonafideRequests.filter(r => r.status === 'submitted' || r.status === 'assigned' || r.status === 'in_progress').length}
                </span>
              </div>
              <span className="text-xs text-[#8A5B15] mt-2 block leading-relaxed pt-2 border-t border-[#E5E9E5]">Awaiting Staff / Dean Review</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-sm text-[#0D8B65] font-semibold leading-relaxed block">Approved (Ready to Issue)</span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#0D8B65] mt-2 block">
                  {bonafideRequests.filter(r => r.status === 'approved').length}
                </span>
              </div>
              <span className="text-xs text-[#0D8B65] mt-2 block leading-relaxed pt-2 border-t border-[#E5E9E5]">Generate Certificate Enabled</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-sm text-[#1E3A2F] font-semibold leading-relaxed block">Certificates Issued</span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#1E3A2F] mt-2 block">
                  {bonafideRequests.filter(r => r.status === 'resolved').length}
                </span>
              </div>
              <span className="text-xs text-[#5E6D64] mt-2 block leading-relaxed pt-2 border-t border-[#E5E9E5]">In Student Repositories</span>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-[#E5E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#202722] leading-snug">
                  Bonafide Certificate Requests Queue
                </h3>
                <p className="text-sm text-[#5E6D64] leading-relaxed mt-0.5">
                  Verify student enrollment, fees clearance, approve applications, and execute certificate generation
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-4 h-4 text-[#5E6D64]" />
                <select
                  value={bonafideStatusFilter}
                  onChange={(e) => setBonafideStatusFilter(e.target.value)}
                  className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3.5 py-2 text-sm text-[#202722] leading-normal"
                >
                  <option value="all">All Bonafide Requests ({bonafideRequests.length})</option>
                  <option value="pending">Under Review / Pending</option>
                  <option value="approved">Approved (Ready to Issue)</option>
                  <option value="issued">Certificate Issued</option>
                  <option value="closed">Rejected / Closed</option>
                </select>
              </div>
            </div>

            {/* Bonafide Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[860px]">
                <thead>
                  <tr className="bg-[#F7F8F6] border-b border-[#E5E9E5] text-[#5E6D64]">
                    <th className="py-4 px-4 font-semibold text-xs">Request ID</th>
                    <th className="py-4 px-4 font-semibold text-xs">Student</th>
                    <th className="py-4 px-4 font-semibold text-xs">Programme</th>
                    <th className="py-4 px-4 font-semibold text-xs">Submission Date</th>
                    <th className="py-4 px-4 font-semibold text-xs">Current Status</th>
                    <th className="py-4 px-4 font-semibold text-xs">Priority</th>
                    <th className="py-4 px-4 font-semibold text-xs">Assigned Reviewer</th>
                    <th className="py-4 px-4 font-semibold text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9E5]">
                  {filteredBonafideRequests.map(req => {
                    const isApproved = req.status === 'approved';
                    const isIssued = req.status === 'resolved';

                    return (
                      <tr 
                        key={req.id} 
                        onClick={() => setSelectedBonafideForReview(req)}
                        className={`hover:bg-[#F7F8F6] cursor-pointer transition-colors ${
                          selectedBonafideForReview?.id === req.id ? 'bg-[#E6F5EF]/30 ring-1 ring-[#0D8B65]/30' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-sm text-[#0D8B65]">
                          {req.id}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-sm text-[#202722] leading-snug">{req.studentName}</div>
                          <div className="text-xs font-mono text-[#5E6D64] leading-normal mt-0.5">{req.studentId}</div>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="text-sm text-[#202722] font-medium truncate leading-snug">
                            {req.details?.programme || 'B.Tech in Computer Science & Engineering'}
                          </div>
                          <div className="text-xs text-[#5E6D64] leading-normal mt-0.5">
                            {req.details?.semester || '6th Semester'} · {req.details?.academicYear || '2025–2026'}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs text-[#5E6D64] font-medium leading-normal">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(req.status)}
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase leading-none inline-block ${
                            req.priority === 'urgent'
                              ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]'
                              : req.priority === 'high'
                                ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]'
                                : 'bg-[#F7F8F6] text-[#202722] border border-[#E5E9E5]'
                          }`}>
                            {req.priority}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-[#5E6D64]">
                          <span className="font-medium text-xs text-[#202722] leading-normal block">
                            {req.assignedStaff || 'Unassigned'}
                          </span>
                          <span className="text-xs text-[#5E6D64] leading-normal block mt-0.5">
                            {req.assignedRole || 'Academic Section'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {isApproved && (
                              <button
                                onClick={() => handleGenerateCertificate(req.id)}
                                className="px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                                title="Execute certificate generation and store in repository"
                              >
                                <Award className="w-4 h-4 text-[#9A7B38]" />
                                <span>Generate Certificate</span>
                              </button>
                            )}

                            {isIssued && req.details?.certificateId && (
                              <button
                                onClick={() => {
                                  const cert = certificates.find(c => c.id === req.details?.certificateId);
                                  if (cert) setPreviewCert(cert);
                                }}
                                className="px-3 py-2 bg-[#E6F5EF] hover:bg-[#d4ede1] text-[#0D8B65] font-semibold rounded-xl text-xs transition-colors border border-[#A2C4AF] flex items-center gap-1.5"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Cert</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBonafideForReview(req)}
                              className="px-3.5 py-2 bg-white border border-[#E5E9E5] hover:border-[#1E3A2F] text-[#202722] rounded-xl text-xs font-semibold transition-colors"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL OPERATIONS QUEUE (Admin only) */}
      {consoleTab === 'operational' && (
        <div className="bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E5E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#202722]">Central Operational Queue</h3>
              <p className="text-xs text-[#5E6D64]">Campus-wide request tickets across maintenance, mess, leave, and academics</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-lg px-3 py-1.5 text-xs text-[#202722]"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent Only</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[860px]">
              <thead>
                <tr className="bg-[#F7F8F6] border-b border-[#E5E9E5] text-[#5E6D64]">
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Category / Title</th>
                  <th className="py-3.5 px-4 font-semibold">Student / Hostel</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Staff</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E5]">
                {requests
                  .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
                  .map(req => (
                    <tr key={req.id} className="hover:bg-[#F7F8F6] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0D8B65]">
                        <button
                          onClick={() => onOpenRequestDetail(req.id)}
                          className="hover:underline text-[#0D8B65]"
                        >
                          {req.id}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[#202722] truncate">{req.title}</div>
                        <div className="text-[11px] text-[#5E6D64] uppercase mt-0.5">
                          {req.category.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[#202722] font-medium">{req.studentName}</div>
                        <div className="text-[11px] text-[#5E6D64]">{req.hostelRoom.split('·')[0]}</div>
                        {req.details?.campusLocationId && (
                          <button
                            type="button"
                            onClick={() => navigateToMapLocation(req.details!.campusLocationId!)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#0D8B65] hover:underline font-semibold mt-1"
                            title="Open location on Campus Map"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{req.details.campusLocationName ? req.details.campusLocationName.split('(')[0].trim() : 'View Map'}</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#5E6D64]">
                        {req.assignedStaff || (
                          <span className="text-[#8A5B15] font-semibold">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          req.priority === 'urgent'
                            ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]'
                            : req.priority === 'high'
                              ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]'
                              : 'bg-[#F7F8F6] text-[#202722] border border-[#E5E9E5]'
                        }`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTicketForPriority(req);
                              setTargetPriority(req.priority === 'urgent' ? 'high' : 'urgent');
                              setAdminReason('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#E6F5EF] hover:bg-[#d5ece2] text-[#0D8B65] rounded-lg transition-colors border border-[#A2C4AF]"
                          >
                            Adjust Priority
                          </button>
                          <button
                            onClick={() => onOpenRequestDetail(req.id)}
                            className="px-3 py-1 text-xs font-medium bg-white border border-[#E5E9E5] hover:border-[#0D8B65] text-[#202722] rounded-lg transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & WORKLOAD (Admin only) */}
      {consoleTab === 'analytics' && role === 'admin' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-[#5E6D64]">Total Open Requests</span>
              <div className="text-3xl font-bold font-mono text-[#202722] mt-2">{openRequests.length}</div>
              <span className="text-[11px] text-[#5E6D64] mt-1 block">Active across all departments</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-[#8A5B15]">Approaching SLA (&gt;= 75%)</span>
              <div className="text-3xl font-bold font-mono text-[#8A5B15] mt-2">{overdueOrApproachingRequests.length}</div>
              <span className="text-[11px] text-[#8A5B15] mt-1 block">Require supervisor triage</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-[#0D8B65]">Median Resolution Time</span>
              <div className="text-3xl font-bold font-mono text-[#0D8B65] mt-2">{medianResolutionHours}h</div>
              <span className="text-[11px] text-[#5E6D64] mt-1 block">Turnaround benchmark</span>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-[#0D8B65]">SLA Compliance Rate</span>
              <div className="text-3xl font-bold font-mono text-[#0D8B65] mt-2">{slaCompliancePct}%</div>
              <span className="text-[11px] text-[#5E6D64] mt-1 block">Target threshold &gt;= 90%</span>
            </div>
          </div>

          {/* Aging Analytics & Workload Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#202722]">Queue Aging Analytics</h3>
              <div className="space-y-4">
                {agingBuckets.map(b => {
                  const totalOpen = openRequests.length || 1;
                  const pct = Math.round((b.count / totalOpen) * 100);
                  return (
                    <div key={b.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#202722]">{b.label}</span>
                        <span className="font-mono text-[#5E6D64]">{b.count} requests ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#F7F8F6] rounded-full overflow-hidden border border-[#E5E9E5]">
                        <div 
                          className={`h-full ${b.color} transition-all duration-300`} 
                          style={{ width: `${Math.max(6, pct)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#202722]">Staff Workload Allocation</h3>
              <div className="divide-y divide-[#E5E9E5]">
                {workloadByStaff.map(s => (
                  <div key={s.name} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#202722]">{s.name}</div>
                      <div className="text-[#5E6D64] text-[11px]">{s.dept}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#F7F8F6] border border-[#E5E9E5] font-mono font-semibold">
                      {s.total} active ({s.urgent} urgent)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED REVIEW PANEL (FOR BONAFIDE REQUESTS) */}
      {activeReviewItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E5E9E5] flex items-center justify-between bg-[#F7F8F6]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xl text-[#1E3A2F]">{activeReviewItem.id}</span>
                  <span className="text-[#5E6D64]">/</span>
                  <span className="font-semibold text-xs text-[#202722] uppercase tracking-wider">Bonafide Review Panel</span>
                </div>
                <div className="text-xs text-[#5E6D64] leading-relaxed mt-1">
                  Academic Section · Submitted on {new Date(activeReviewItem.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedBonafideForReview(null)}
                className="p-2 text-[#5E6D64] hover:text-[#202722] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Title & Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(activeReviewItem.status)}
                  <span className="font-mono text-xs text-[#5E6D64]">
                    SLA: {activeReviewItem.slaHours} hours
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#202722] leading-snug">{activeReviewItem.title}</h3>
                <p className="text-sm text-[#5E6D64] leading-relaxed bg-[#F7F8F6] p-4 rounded-xl border border-[#E5E9E5]">
                  {activeReviewItem.description}
                </p>
              </div>

              {/* 1. STUDENT INFORMATION (Mandatory Review Checklist) */}
              <div className="p-6 bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
                  <span className="font-bold text-sm text-[#202722] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0D8B65]" />
                    <span>Verified Student Academic Profile</span>
                  </span>
                  <span className="text-xs font-mono text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-1 rounded font-semibold border border-[#A2C4AF] leading-none">
                    ERP Record Cleared
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Student Name:</span>
                    <span className="font-bold text-sm text-[#202722] leading-snug block mt-0.5">{activeReviewItem.studentName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Registration Number:</span>
                    <span className="font-mono font-bold text-sm text-[#1E3A2F] leading-snug block mt-0.5">{activeReviewItem.studentId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Programme / Branch:</span>
                    <span className="font-medium text-sm text-[#202722] leading-snug block mt-0.5">{activeReviewItem.details?.programme || 'B.Tech in Computer Science & Engineering'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Academic Term:</span>
                    <span className="font-medium text-sm text-[#202722] leading-snug block mt-0.5">{activeReviewItem.details?.semester || '6th Semester'} ({activeReviewItem.details?.academicYear || '2025–2026'})</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Hostel Residence:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = activeReviewItem.details?.campusLocationId || 
                            (activeReviewItem.hostelRoom.toLowerCase().includes('block b') ? 'hostel_block_b' : 'hostel_block_a');
                          navigateToMapLocation(targetId);
                          setSelectedBonafideForReview(null);
                        }}
                        className="text-[11px] text-[#0D8B65] hover:underline font-semibold flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Map</span>
                      </button>
                    </div>
                    <span className="font-medium text-sm text-[#202722] leading-snug block mt-0.5">{activeReviewItem.hostelRoom}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Fee Ledger Status:</span>
                    <span className={`font-semibold text-sm leading-snug block mt-0.5 ${
                      activeReviewItem.details?.erpFeeStatus?.toLowerCase().includes('pending')
                        ? 'text-[#992828]'
                        : 'text-[#0D8B65]'
                    }`}>
                      {activeReviewItem.details?.erpFeeStatus || 'Zero Outstanding Dues'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E9E5]">
                  <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Stated Application Purpose:</span>
                  <p className="font-medium text-sm text-[#202722] mt-1 leading-relaxed italic">
                    "{activeReviewItem.details?.purpose || activeReviewItem.title}"
                  </p>
                </div>
              </div>

              {/* 2. ADMIN ACTIONS SECTION (Approve, Reject with reason, Request Clarification, Generate Certificate) */}
              <div className="p-6 bg-[#F7F8F6] border border-[#E5E9E5] rounded-2xl space-y-4">
                <span className="font-bold text-xs text-[#202722] uppercase tracking-wider block">
                  Authorized Administrative Actions
                </span>

                {/* CRITICAL WORKFLOW RULE: ONLY AFTER APPROVAL SHOULD GENERATE CERTIFICATE BECOME AVAILABLE */}
                {activeReviewItem.status === 'approved' && (
                  <div className="p-5 bg-[#E6F5EF] border border-[#0D8B65] rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-[#0D8B65] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Request is Approved. Ready for Certificate Generation.</span>
                    </div>
                    <p className="text-xs text-[#5E6D64] leading-relaxed">
                      Dean authorization has cleared this request. Generating the certificate will allocate a unique institutional reference ID, add cryptographic markers, and publish the document to the student's My Documents section.
                    </p>
                    <button
                      onClick={() => handleGenerateCertificate(activeReviewItem.id)}
                      className="w-full py-3 bg-[#1E3A2F] hover:bg-[#163328] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Award className="w-4 h-4 text-[#9A7B38]" />
                      <span>Generate & Issue Bonafide Certificate</span>
                    </button>
                  </div>
                )}

                {/* If Certificate Already Issued */}
                {activeReviewItem.status === 'resolved' && activeReviewItem.details?.certificateId && (
                  <div className="p-4 bg-[#FDFBF7] border border-[#9A7B38]/50 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#1E3A2F] block leading-snug">Certificate Already Issued</span>
                      <span className="font-mono text-xs text-[#9A7B38] font-bold mt-0.5 block">
                        ID: {activeReviewItem.details.certificateId}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const cert = certificates.find(c => c.id === activeReviewItem.details?.certificateId);
                        if (cert) setPreviewCert(cert);
                      }}
                      className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl hover:bg-[#163328] transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Credential</span>
                    </button>
                  </div>
                )}

                {/* Approval & Review actions (When not yet approved or resolved) */}
                {activeReviewItem.status !== 'approved' && activeReviewItem.status !== 'resolved' && activeReviewItem.status !== 'closed' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApproveBonafide(activeReviewItem.id)}
                        className="px-4 py-2 bg-[#0D8B65] hover:bg-[#0b7756] text-white font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsRejecting(!isRejecting);
                          setIsClarifying(false);
                        }}
                        className="px-3.5 py-2 bg-white border border-[#F5CBC8] text-[#992828] hover:bg-[#FCEDEC] font-semibold rounded-xl transition-colors"
                      >
                        Reject with Reason...
                      </button>

                      <button
                        onClick={() => {
                          setIsClarifying(!isClarifying);
                          setIsRejecting(false);
                        }}
                        className="px-3.5 py-2 bg-white border border-[#E5E9E5] text-[#202722] hover:bg-neutral-100 font-medium rounded-xl transition-colors"
                      >
                        Request Clarification...
                      </button>
                    </div>

                    {/* Reject Dialog Box */}
                    {isRejecting && (
                      <div className="p-3.5 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl space-y-2">
                        <label className="block font-bold text-[#992828] text-[11px]">
                          Enter Official Rejection Reason * (Visible to Student & Audit Trail)
                        </label>
                        <textarea
                          rows={2}
                          value={rejectionReasonText}
                          onChange={(e) => setRejectionReasonText(e.target.value)}
                          placeholder="e.g. Pending tuition dues of ₹2,200 must be cleared before issuance."
                          className="w-full bg-white border border-[#F5CBC8] rounded-lg p-2 text-xs text-[#202722] focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsRejecting(false)}
                            className="px-3 py-1 bg-white border border-[#E5E9E5] text-[#5E6D64] rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRejectBonafide(activeReviewItem.id)}
                            disabled={!rejectionReasonText.trim()}
                            className="px-3 py-1 bg-[#992828] text-white rounded-lg font-bold text-xs disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Clarification Dialog Box */}
                    {isClarifying && (
                      <div className="p-3.5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl space-y-2">
                        <label className="block font-bold text-[#8A5B15] text-[11px]">
                          Request Specific Clarification from Student
                        </label>
                        <textarea
                          rows={2}
                          value={clarificationText}
                          onChange={(e) => setClarificationText(e.target.value)}
                          placeholder="e.g. Please specify the scholarship name or bank branch address..."
                          className="w-full bg-white border border-[#F1DFC4] rounded-lg p-2 text-xs text-[#202722] focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsClarifying(false)}
                            className="px-3 py-1 bg-white border border-[#E5E9E5] text-[#5E6D64] rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleClarifyBonafide(activeReviewItem.id)}
                            disabled={!clarificationText.trim()}
                            className="px-3 py-1 bg-[#8A5B15] text-white rounded-lg font-bold text-xs disabled:opacity-50"
                          >
                            Send Clarification Request
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. AUDIT TRAIL / ACTIVITY TIMELINE */}
              <div>
                <h4 className="text-xs font-bold text-[#202722] uppercase tracking-wider mb-3">
                  Chronological Audit Trail ({activeReviewItem.timeline.length} Events)
                </h4>

                <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E9E5] ml-2">
                  {activeReviewItem.timeline.map(event => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0D8B65]" />
                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#202722]">{event.action}</span>
                          <span className="text-[11px] text-[#5E6D64] font-mono">
                            {new Date(event.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="text-xs text-[#5E6D64] mt-0.5">
                          By {event.actor} · <span className="font-semibold text-[#202722]">{event.role}</span>
                          {event.system && <span className="ml-1 text-[#0D8B65] font-mono">via {event.system}</span>}
                        </div>
                        {event.note && (
                          <p className="p-2 bg-[#F7F8F6] rounded-lg mt-1 border border-[#E5E9E5] text-[#202722] leading-relaxed">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. INTERNAL ADMINISTRATIVE NOTES */}
              {activeReviewItem.internalNotes && activeReviewItem.internalNotes.length > 0 && (
                <div className="pt-3 border-t border-[#E5E9E5]">
                  <span className="font-bold text-xs text-[#8A5B15] uppercase block mb-2">
                    Confidential Internal Staff Notes
                  </span>
                  <div className="space-y-2">
                    {activeReviewItem.internalNotes.map(n => (
                      <div key={n.id} className="p-2.5 bg-[#FDF6EB] rounded-lg border border-[#F1DFC4] text-xs">
                        <div className="flex items-center justify-between font-semibold text-[#8A5B15] text-[11px]">
                          <span>{n.author}</span>
                          <span className="font-mono font-normal">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[#202722] mt-0.5">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F7F8F6] border-t border-[#E5E9E5] flex justify-end">
              <button
                onClick={() => setSelectedBonafideForReview(null)}
                className="px-4 py-2 bg-white border border-[#E5E9E5] hover:bg-neutral-100 text-[#202722] font-semibold rounded-xl text-xs transition-colors"
              >
                Close Review Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PRIORITY CHANGE MODAL (Admin) */}
      {selectedTicketForPriority && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
              <div>
                <h3 className="text-base font-bold text-[#202722]">Authorize Priority Adjustment</h3>
                <p className="text-xs text-[#5E6D64]">Ticket {selectedTicketForPriority.id} · Requester: {selectedTicketForPriority.studentName}</p>
              </div>
              <button 
                onClick={() => setSelectedTicketForPriority(null)}
                className="p-1 text-[#5E6D64] hover:text-[#202722]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-[#5E6D64] block">Student Self-Classified:</span>
                <span className="font-semibold text-[#202722] capitalize">
                  {selectedTicketForPriority.requestedPriority || (selectedTicketForPriority.priority === 'urgent' ? 'urgent' : 'routine')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#5E6D64] block">Current Effective Priority:</span>
                <span className="font-bold text-[#202722] uppercase">
                  {selectedTicketForPriority.priority}
                </span>
              </div>
            </div>

            {priorityError && (
              <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-xs text-[#992828] rounded-xl">
                {priorityError}
              </div>
            )}

            <form onSubmit={handleConfirmPriorityChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202722] mb-1.5">New Authorized Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as RequestPriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setTargetPriority(p)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                        targetPriority === p 
                          ? p === 'urgent'
                            ? 'bg-[#FCEDEC] text-[#992828] border-[#992828]'
                            : 'bg-[#E6F5EF] text-[#0D8B65] border-[#0D8B65]'
                          : 'bg-[#F7F8F6] text-[#5E6D64] border-[#E5E9E5] hover:bg-neutral-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202722] mb-1.5">
                  Mandatory Administrative Justification *
                </label>
                <textarea
                  rows={3}
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="Record why this priority level change is authorized by administration..."
                  className="w-full bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-3 py-2 text-xs text-[#202722] focus:outline-none focus:border-[#0D8B65]"
                  required
                />
                <p className="text-[11px] text-[#5E6D64] mt-1 font-mono">
                  Audit log records: Officer name, timestamp, previous priority, and reason.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E9E5]">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForPriority(null)}
                  className="px-4 py-2 border border-[#E5E9E5] text-[#5E6D64] hover:bg-[#F7F8F6] rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D8B65] hover:bg-[#0b7756] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  Authorize & Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CERTIFICATE MODAL */}
      {previewCert && (
        <BonafideCertificateModal
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
          onNavigateToVerify={(id) => {
            setActiveVerificationCertId(id);
            setActiveTab('verification');
          }}
        />
      )}
    </div>
  );
};
