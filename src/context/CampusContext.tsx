import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  UserProfile, 
  RequestItem, 
  NoticeItem, 
  RequestStatus, 
  RequestPriority,
  RequestCategory,
  OfflineDraft,
  BonafideCertificate,
  GatePassRequest,
  IssuedGatePass,
  GatePassVerificationResult,
  AppNotification
} from '../types/index.ts';
import { 
  SEED_PROFILES, 
  INITIAL_REQUESTS, 
  INITIAL_NOTICES, 
  SYSTEM_INTEGRATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_GATEPASS_REQUESTS,
  INITIAL_ISSUED_GATEPASSES,
  INITIAL_NOTIFICATIONS
} from '../data/seedData.ts';
import { AuthService, AuthSession } from '../services/authService.ts';
import { SecurityGateAdapter } from '../services/integrationAdapters.ts';
import { canUserPerformActionOnTicket } from '../utils/ticketRouting.ts';

interface CampusContextType {
  // Session & Trusted Role
  session: AuthSession | null;
  isAuthenticated: boolean;
  authenticate: (session: AuthSession) => void;
  logout: () => void;
  role: Role;
  setRole: (role: Role) => void;
  currentUser: UserProfile;
  requests: RequestItem[];
  notices: NoticeItem[];
  certificates: BonafideCertificate[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAccessibilityMode: boolean;
  setIsAccessibilityMode: (val: boolean) => void;
  isOfflineSimulated: boolean;
  setIsOfflineSimulated: (val: boolean) => void;
  offlineDrafts: OfflineDraft[];
  activeVerificationCertId: string | null;
  setActiveVerificationCertId: (id: string | null) => void;

  // Gate Pass Lifecycle
  gatePassRequests: GatePassRequest[];
  issuedGatePasses: IssuedGatePass[];
  notifications: AppNotification[];
  activeGatePassModal: IssuedGatePass | null;
  setActiveGatePassModal: (pass: IssuedGatePass | null) => void;
  createGatePassRequest: (data: Partial<GatePassRequest>) => GatePassRequest;
  approveGatePassRequest: (requestId: string, notes?: string) => { request: GatePassRequest; pass: IssuedGatePass };
  rejectGatePassRequest: (requestId: string, reason: string) => GatePassRequest;
  verifyGatePass: (tokenOrId: string) => GatePassVerificationResult;
  recordGatePassDeparture: (passId: string, guardName?: string) => void;
  recordGatePassReturn: (passId: string, guardName?: string) => void;
  getActiveGatePassForStudent: (studentId: string) => IssuedGatePass | null;
  markNotificationRead: (id: string) => void;

  // Campus Map Integration
  activeMapLocationId: string | null;
  setActiveMapLocationId: (id: string | null) => void;
  navigateToMapLocation: (locationId: string) => void;
  
  // Actions
  createRequest: (data: Partial<RequestItem>) => RequestItem;
  updateRequestStatus: (id: string, newStatus: RequestStatus, note?: string) => void;
  assignStaff: (id: string, staffName: string, roleName: string, note?: string) => void;
  changePriority: (id: string, newPriority: RequestPriority, reason: string) => void;
  escalateRequest: (id: string, reason: string) => void;
  addInternalNote: (id: string, noteText: string) => void;
  addClarification: (id: string, commentText: string) => void;
  linkToIncident: (sourceRequestId: string, incidentId: string) => void;
  approveGatePass: (id: string) => void;
  recordGateDeparture: (id: string) => void;
  recordGateReturn: (id: string) => void;
  createNotice: (notice: Partial<NoticeItem>) => NoticeItem;
  markNoticeRead: (id: string) => void;
  resetToSeedData: () => void;
  queueOfflineDraft: (draft: Partial<OfflineDraft>) => void;
  syncOfflineQueue: () => void;
  processSmsCommand: (command: string) => { reply: string; success: boolean };
  triggerSimulatedSync: () => void;
  systemLastSynced: string;
  getActiveUrgentRequest: (studentId: string) => RequestItem | null;
  checkUrgentEligibility: (category: RequestCategory, details: any) => { eligible: boolean; reason: string };

  // Bonafide Certificate Workflow Actions
  issueCertificate: (requestId: string, customDetails?: Partial<BonafideCertificate>) => BonafideCertificate;
  approveBonafideRequest: (requestId: string, approvalNote?: string) => void;
  rejectBonafideRequest: (requestId: string, reason: string) => void;
  requestBonafideClarification: (requestId: string, message: string) => void;
  recordCertificateDownload: (certificateId: string) => void;
  getStudentCertificates: (studentId: string) => BonafideCertificate[];
  getCertificateById: (certificateId: string) => BonafideCertificate | null;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REQUESTS: 'campusflow_requests_bput_v1',
  NOTICES: 'campusflow_notices_bput_v1',
  CERTIFICATES: 'campusflow_certificates_bput_v1',
  ROLE: 'campusflow_role_bput_v1',
  OFFLINE_DRAFTS: 'campusflow_offline_drafts_v1',
  A11Y: 'campusflow_a11y_mode_v1',
  GATEPASS_REQUESTS: 'campusflow_gatepass_requests_v2',
  ISSUED_GATEPASSES: 'campusflow_issued_gatepasses_v2',
  NOTIFICATIONS: 'campusflow_notifications_v2'
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active Authenticated Session from trusted storage
  const [session, setSession] = useState<AuthSession | null>(() => {
    return AuthService.validateCurrentSession().session || null;
  });

  const isAuthenticated = !!session;

  // Trusted Role & User Profile from authenticated session
  const currentUser: UserProfile = session ? session.user : SEED_PROFILES.student;
  const role: Role = currentUser.role;

  // Active Map Location for pan coordination
  const [activeMapLocationId, setActiveMapLocationId] = useState<string | null>(null);

  const authenticate = (newSession: AuthSession) => {
    setSession(newSession);
    AuthService.saveSession(newSession);
    if (newSession.user.role === 'faculty') {
      setActiveTab('faculty_dashboard');
      try { window.history.pushState({}, '', '/faculty'); } catch (e) {}
    } else if (newSession.user.role === 'admin' || newSession.user.role === 'staff') {
      setActiveTab('admin_dashboard');
      try { window.history.pushState({}, '', '/admin'); } catch (e) {}
    } else {
      setActiveTab('overview');
      try { window.history.pushState({}, '', '/student'); } catch (e) {}
    }
  };

  const logout = () => {
    AuthService.clearSession();
    setSession(null);
    setActiveTab('overview');
    try { window.history.pushState({}, '', '/'); } catch (e) {}
  };

  const navigateToMapLocation = (locationId: string) => {
    setActiveMapLocationId(locationId);
    setActiveTab('campus_map');
  };

  // Deprecated client setRole - prevents client-side privilege escalation
  const setRole = (newRole: Role) => {
    console.warn(`[Role Security Policy]: Client-side role elevation to "${newRole}" is blocked. Roles are bound to trusted authenticated sessions.`);
  };

  // Gate Pass Requests state
  const [gatePassRequests, setGatePassRequests] = useState<GatePassRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GATEPASS_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved gatepass requests, using seeds', e);
    }
    return INITIAL_GATEPASS_REQUESTS;
  });

  // Issued Gate Passes state
  const [issuedGatePasses, setIssuedGatePasses] = useState<IssuedGatePass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ISSUED_GATEPASSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved issued gatepasses, using seeds', e);
    }
    return INITIAL_ISSUED_GATEPASSES;
  });

  // In-App Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved notifications, using seeds', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeGatePassModal, setActiveGatePassModal] = useState<IssuedGatePass | null>(null);

  // Requests state
  const [requests, setRequests] = useState<RequestItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved requests, using seeds', e);
    }
    return INITIAL_REQUESTS;
  });

  // Notices state
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved notices, using seeds', e);
    }
    return INITIAL_NOTICES;
  });

  // Certificates state
  const [certificates, setCertificates] = useState<BonafideCertificate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved certificates, using seeds', e);
    }
    return INITIAL_CERTIFICATES;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (session?.user.role === 'faculty') return 'faculty_dashboard';
    if (session?.user.role === 'admin' || session?.user.role === 'staff') return 'admin_dashboard';
    return 'overview';
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeVerificationCertId, setActiveVerificationCertId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.A11Y) === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_DRAFTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [systemLastSynced, setSystemLastSynced] = useState<string>('Just now');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error(e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch (e) {
      console.error(e);
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    } catch (e) {
      console.error(e);
    }
  }, [certificates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch (e) {
      console.error(e);
    }
  }, [role]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.A11Y, isAccessibilityMode ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAccessibilityMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_DRAFTS, JSON.stringify(offlineDrafts));
    } catch (e) {
      console.error(e);
    }
  }, [offlineDrafts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GATEPASS_REQUESTS, JSON.stringify(gatePassRequests));
    } catch (e) {
      console.error(e);
    }
  }, [gatePassRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ISSUED_GATEPASSES, JSON.stringify(issuedGatePasses));
    } catch (e) {
      console.error(e);
    }
  }, [issuedGatePasses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Helper to check for active urgent request for a student
  const getActiveUrgentRequest = (studentId: string): RequestItem | null => {
    return requests.find(r => 
      r.studentId === studentId && 
      r.priority === 'urgent' && 
      r.status !== 'resolved' && 
      r.status !== 'closed'
    ) || null;
  };

  // Helper to evaluate urgent eligibility based on category and issue details
  const checkUrgentEligibility = (category: RequestCategory, details: any = {}): { eligible: boolean; reason: string } => {
    if (category === 'maintenance') {
      const sub = details?.issueSubcategory || '';
      const desc = ((details?.description || '') + ' ' + (details?.detailsText || '')).toLowerCase();
      
      if (sub === 'Plumbing & Water Supply' && (desc.includes('burst') || desc.includes('flood') || desc.includes('seepage') || desc.includes('sewage') || desc.includes('leak') || desc.includes('pressure') || desc.includes('overflow') || desc.includes('pipe'))) {
        return { eligible: true, reason: 'Severe water supply/pipe breakdown affecting sanitation or structural safety' };
      }
      if (sub === 'Electrical & Lighting' && (desc.includes('spark') || desc.includes('shock') || desc.includes('short circuit') || desc.includes('blackout') || desc.includes('fire') || desc.includes('smoke') || desc.includes('breaker') || desc.includes('hazard'))) {
        return { eligible: true, reason: 'Critical electrical hazard or building-wide power failure' };
      }
      if (sub === 'Drinking Water & RO Plant' && (desc.includes('contamination') || desc.includes('tds') || desc.includes('purifier') || desc.includes('smell') || desc.includes('dirty') || desc.includes('ro'))) {
        return { eligible: true, reason: 'Compromised drinking water facility or critical purifier failure' };
      }
      if (details?.isEmergencySafetyRisk) {
        return { eligible: true, reason: 'Verified imminent campus structural or personal safety risk' };
      }
      return { 
        eligible: false, 
        reason: 'Routine maintenance items (e.g. bulb replacement, switch repair, furniture adjustment) do not qualify for Urgent priority under campus policy. Assigned standard priority.' 
      };
    }

    if (category === 'leave_gatepass') {
      const reason = (details?.reason || '').toLowerCase();
      if (reason.includes('medical') || reason.includes('hospital') || reason.includes('emergency') || reason.includes('surgery') || reason.includes('accident') || reason.includes('illness') || reason.includes('bereavement')) {
        return { eligible: true, reason: 'Verified emergency medical care or family crisis pass' };
      }
      return { 
        eligible: false, 
        reason: 'Routine weekend, personal, or festival outstation travel must be requested with standard 12-24h warden review. Only medical emergencies qualify for Urgent gate passes.' 
      };
    }

    if (category === 'mess') {
      const desc = (details?.description || '').toLowerCase();
      if (desc.includes('poisoning') || desc.includes('contamination') || desc.includes('glass') || desc.includes('insect') || desc.includes('vomit') || desc.includes('foreign') || desc.includes('chemical')) {
        return { eligible: true, reason: 'Critical food safety or health hazard outbreak' };
      }
      return { 
        eligible: false, 
        reason: 'Taste preference, refill delays, and menu suggestions are handled under standard catering review (24-48h SLA).' 
      };
    }

    // Other categories: Bonafide, Timetable, Fee dues
    return {
      eligible: false,
      reason: 'Administrative certificates and academic scheduling queries follow standard verification SLAs. In case of imminent scholarship forfeiture, contact the Registrar Office directly.'
    };
  };

  // Create new request with urgent policy enforcement
  const createRequest = (data: Partial<RequestItem>): RequestItem => {
    const nextNum = 1051 + Math.floor(Math.random() * 800);
    const newId = `REQ-${nextNum}`;
    const nowIso = new Date().toISOString();

    const targetStudentId = data.studentId || currentUser.studentId || '2201289140';
    const rawCategory = data.category || 'maintenance';
    const requestedPriority: RequestPriority = data.priority || 'medium';
    
    let effectivePriority: RequestPriority = requestedPriority;
    let flaggedForTriage = false;
    let triageNote: string | undefined = undefined;
    let priorityReason = data.priorityReason;

    // Policy Rule 1 & 2: Evaluate Urgent requests
    if (requestedPriority === 'urgent') {
      const eligibility = checkUrgentEligibility(rawCategory, {
        ...data.details,
        description: data.description,
        isEmergencySafetyRisk: data.details?.isEmergencySafetyRisk
      });

      if (!eligibility.eligible) {
        // Rule 7: Does not qualify -> assign standard priority with clear explanation
        effectivePriority = 'medium';
        triageNote = eligibility.reason;
      } else {
        // Rule 3 & 4: Check active urgent limit (max 1 active urgent request per student)
        const existingActiveUrgent = getActiveUrgentRequest(targetStudentId);
        if (existingActiveUrgent) {
          // Rule 6: Do not block. Queue at High with priority triage flag and notification.
          effectivePriority = 'high';
          flaggedForTriage = true;
          triageNote = `Active urgent allowance currently utilized by ticket ${existingActiveUrgent.id}. Submitted at High priority with priority triage flag for expedited staff review.`;
        } else {
          // Rule 5: Qualified and active slot available!
          effectivePriority = 'urgent';
          priorityReason = data.priorityReason || eligibility.reason;
        }
      }
    }

    let targetDept = 'Central Student Services';
    let slaHours = 48;
    let defaultAssignedRole = 'Administrative Officer';
    let defaultAssignedStaff = 'Prof. S. K. Mohapatra';

    if (rawCategory === 'bonafide') {
      targetDept = 'Registrar Academic Section';
      slaHours = 48;
      defaultAssignedRole = 'Academic Section';
      defaultAssignedStaff = 'Mrs. Sunita Mohanty';
    } else if (rawCategory === 'maintenance') {
      targetDept = 'Hostel Maintenance (FretBox Sync)';
      slaHours = effectivePriority === 'urgent' ? 12 : effectivePriority === 'high' ? 24 : 48;
      defaultAssignedRole = 'Works & Maintenance';
      defaultAssignedStaff = 'Er. Ramesh Chandra Patra';
    } else if (rawCategory === 'leave_gatepass') {
      targetDept = 'Hostel Warden & Security Gate';
      slaHours = effectivePriority === 'urgent' ? 4 : 12;
      defaultAssignedRole = 'Hostel Warden';
      defaultAssignedStaff = 'Dr. Pramod Dash';
    } else if (rawCategory === 'timetable') {
      targetDept = 'Academic Section & LMS';
      slaHours = 24;
      defaultAssignedRole = 'Academic Section';
      const textToSearch = ((data.title || '') + ' ' + (data.description || '') + ' ' + (data.details?.subject || '')).toLowerCase();
      if (textToSearch.includes('electrical') || textToSearch.includes('power') || textToSearch.includes('circuits')) {
        defaultAssignedStaff = 'Dr. Pramod Dash';
        defaultAssignedRole = 'Associate Professor & Faculty Mentor';
      } else {
        defaultAssignedStaff = 'Mrs. Sunita Mohanty';
      }
    } else if (rawCategory === 'mess') {
      targetDept = 'Central Mess Committee';
      slaHours = effectivePriority === 'urgent' ? 12 : 48;
      defaultAssignedRole = 'Catering Officer';
      defaultAssignedStaff = 'Chef Debendra Jena';
    } else if (rawCategory === 'fee_dues') {
      targetDept = 'Finance & Accounts Office';
      slaHours = 72;
      defaultAssignedRole = 'Accounts Officer';
      defaultAssignedStaff = 'Mrs. Sunita Mohanty';
    }

    const assignedStaff = data.assignedStaff || defaultAssignedStaff;
    const assignedRole = data.assignedRole || defaultAssignedRole;

    const timelineEvents: RequestItem['timeline'] = [
      {
        id: `TL-${Date.now()}-1`,
        timestamp: nowIso,
        actor: data.studentName || currentUser.name,
        role: currentUser.roleTitle,
        action: 'Request Submitted',
        note: isOfflineSimulated ? 'Synchronized from offline local queue' : 'Submitted via CampusFlow Intent Portal'
      },
      {
        id: `TL-${Date.now()}-2`,
        timestamp: nowIso,
        actor: 'CampusFlow Core Orchestrator',
        role: 'System',
        action: 'Intent Classified & Routed',
        system: targetDept.includes('FretBox') ? 'FretBox v2 API' : 'CampusFlow Service Bus',
        note: `Auto-routed to ${targetDept} (Assigned: ${assignedStaff} · ${assignedRole}). Auto-assigned SLA: ${slaHours} hours (Priority: ${effectivePriority.toUpperCase()})`
      }
    ];

    if (flaggedForTriage && triageNote) {
      timelineEvents.push({
        id: `TL-${Date.now()}-3`,
        timestamp: nowIso,
        actor: 'Urgent Policy Guard',
        role: 'System Policy',
        action: 'Priority Triage Flag Added',
        note: triageNote,
        previousPriority: 'urgent',
        newPriority: 'high',
      });
    } else if (requestedPriority === 'urgent' && effectivePriority !== 'urgent' && triageNote) {
      timelineEvents.push({
        id: `TL-${Date.now()}-3`,
        timestamp: nowIso,
        actor: 'Urgent Policy Guard',
        role: 'System Policy',
        action: 'Priority Policy Applied',
        note: triageNote,
        previousPriority: 'urgent',
        newPriority: effectivePriority,
      });
    }

    const newRequest: RequestItem = {
      id: newId,
      title: data.title || 'Campus Workflow Request',
      category: rawCategory,
      department: targetDept,
      studentName: data.studentName || currentUser.name,
      studentId: targetStudentId,
      studentEmail: data.studentEmail || currentUser.email,
      hostelRoom: `${currentUser.hostel || 'Brahmaputra Hall'} · ${currentUser.room || 'Block B · Room 314'}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'submitted',
      priority: effectivePriority,
      requestedPriority: requestedPriority,
      priorityReason: priorityReason,
      priorityVerifiedByStaff: false,
      flaggedForTriage: flaggedForTriage,
      triageNote: triageNote,
      slaHours: slaHours,
      assignedStaff: assignedStaff,
      assignedRole: assignedRole,
      description: data.description || '',
      details: data.details || {},
      timeline: timelineEvents,
      internalNotes: [],
      isLinkedIncident: false,
    };

    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const updateRequestStatus = (id: string, newStatus: RequestStatus, note?: string) => {
    const targetReq = requests.find(r => r.id === id);
    if (!targetReq) return;

    let actionType: 'in_progress' | 'approve' | 'reject' | 'resolve' | 'reopen' | 'close' | 'cancel' = 'in_progress';
    if (newStatus === 'in_progress') actionType = 'in_progress';
    else if (newStatus === 'approved') actionType = 'approve';
    else if (newStatus === 'resolved') actionType = 'resolve';
    else if (newStatus === 'reopened') actionType = 'reopen';
    else if (newStatus === 'closed' && (note?.toLowerCase().includes('reject') || note?.toLowerCase().includes('decline'))) actionType = 'reject';
    else if (newStatus === 'closed' && (note?.toLowerCase().includes('cancel'))) actionType = 'cancel';
    else if (newStatus === 'closed') actionType = 'close';

    const perm = canUserPerformActionOnTicket(targetReq, currentUser, actionType);
    if (!perm.allowed) {
      console.warn(`[CampusFlow Authorization Guard]: Action '${actionType}' denied for user ${currentUser.name} (${currentUser.role}): ${perm.reason}`);
      return;
    }

    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      let effectivePriority = req.priority;
      let additionalNote = note;

      // Rule 9: Reopening check - ensure no duplicate active urgent allowance
      if (newStatus === 'reopened' && req.priority === 'urgent') {
        const otherUrgent = requests.find(r => 
          r.id !== id && 
          r.studentId === req.studentId && 
          r.priority === 'urgent' && 
          r.status !== 'resolved' && 
          r.status !== 'closed'
        );
        if (otherUrgent) {
          effectivePriority = 'high';
          additionalNote = (note ? note + ' · ' : '') + `Reopened at High priority because ticket ${otherUrgent.id} currently holds the active urgent slot.`;
        }
      }

      const newTimeline = [...req.timeline, {
        id: `TL-${Date.now()}`,
        timestamp: nowIso,
        actor: currentUser.name,
        role: currentUser.roleTitle,
        action: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
        note: additionalNote || undefined
      }];

      return {
        ...req,
        status: newStatus,
        priority: effectivePriority,
        updatedAt: nowIso,
        timeline: newTimeline
      };
    }));
  };

  const assignStaff = (id: string, staffName: string, roleName: string, note?: string) => {
    const targetReq = requests.find(r => r.id === id);
    if (!targetReq) return;

    const perm = canUserPerformActionOnTicket(targetReq, currentUser, 'assign');
    if (!perm.allowed) {
      console.warn(`[CampusFlow Authorization Guard]: Assign staff denied for user ${currentUser.name} (${currentUser.role}): ${perm.reason}`);
      return;
    }

    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        assignedStaff: staffName,
        assignedRole: roleName,
        status: req.status === 'submitted' ? 'assigned' : req.status,
        updatedAt: nowIso,
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: `Assigned to ${staffName} (${roleName})`,
            note: note || 'Dispatched to department personnel for on-site inspection and task execution.'
          }
        ]
      };
    }));
  };

  // Rule 8: Change priority with mandatory reason and audit recording
  const changePriority = (id: string, newPriority: RequestPriority, reason: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      const oldPriority = req.priority;
      
      const newTimeline = [...req.timeline, {
        id: `TL-${Date.now()}`,
        timestamp: nowIso,
        actor: currentUser.name,
        role: currentUser.roleTitle,
        action: `Priority updated from ${oldPriority.toUpperCase()} to ${newPriority.toUpperCase()}`,
        note: reason,
        previousPriority: oldPriority,
        newPriority: newPriority,
      }];

      return {
        ...req,
        priority: newPriority,
        priorityReason: reason,
        priorityVerifiedByStaff: true,
        flaggedForTriage: false, // cleared once staff reviews
        updatedAt: nowIso,
        timeline: newTimeline,
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: `[PRIORITY AUDIT]: Priority adjusted to ${newPriority.toUpperCase()} by ${currentUser.roleTitle}. Reason: ${reason}`
          }
        ]
      };
    }));
  };

  const escalateRequest = (id: string, reason: string) => {
    changePriority(id, 'urgent', reason);
  };

  const addInternalNote = (id: string, noteText: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      return {
        ...req,
        updatedAt: nowIso,
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: noteText
          }
        ]
      };
    }));
  };

  const addClarification = (id: string, commentText: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      return {
        ...req,
        updatedAt: nowIso,
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Added Note / Clarification',
            note: commentText
          }
        ]
      };
    }));
  };

  const linkToIncident = (sourceRequestId: string, incidentId: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== sourceRequestId) return req;

      return {
        ...req,
        isLinkedIncident: true,
        linkedIncidentId: incidentId,
        updatedAt: nowIso,
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: `Linked to Master Incident ${incidentId}`,
            note: 'Complaint clustered to eliminate duplicate contractor dispatch'
          }
        ]
      };
    }));
  };

  // Digital Gate Pass Lifecycle Workflow Methods
  const createGatePassRequest = (data: Partial<GatePassRequest>): GatePassRequest => {
    const nowIso = new Date().toISOString();
    const requestId = `GP-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: GatePassRequest = {
      id: requestId,
      studentId: data.studentId || currentUser.studentId || '2201289140',
      studentName: data.studentName || currentUser.name,
      studentEmail: data.studentEmail || currentUser.email,
      department: data.department || currentUser.department,
      hostel: data.hostel || currentUser.hostel || 'Brahmaputra Hall',
      room: data.room || currentUser.room || 'Block B · Room 314',
      destination: data.destination || '',
      reason: data.reason || '',
      departureDate: data.departureDate || new Date().toISOString().split('T')[0],
      departureTime: data.departureTime || '16:00',
      expectedReturnDate: data.expectedReturnDate || new Date().toISOString().split('T')[0],
      expectedReturnTime: data.expectedReturnTime || '21:00',
      contactNumber: data.contactNumber || currentUser.phone || '+91 94371 88210',
      emergencyContact: data.emergencyContact,
      notes: data.notes,
      status: 'PENDING',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setGatePassRequests(prev => [newRequest, ...prev]);

    // Add In-App Notification
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      recipientUserId: newRequest.studentId,
      type: 'gatepass_submitted',
      title: 'Gate Pass Request Submitted',
      message: `Your request (${newRequest.id}) to leave for "${newRequest.destination}" is queued for Warden / Faculty review.`,
      createdAt: nowIso,
      relatedRequestId: newRequest.id
    };
    setNotifications(prev => [notif, ...prev]);

    return newRequest;
  };

  const approveGatePassRequest = (requestId: string, notes?: string): { request: GatePassRequest; pass: IssuedGatePass } => {
    // ENFORCE AUTHORIZATION: Students cannot approve their own requests
    if (role === 'student') {
      throw new Error('[Security Policy Violation]: Students are not authorized to approve gate pass requests.');
    }

    const nowIso = new Date().toISOString();
    const existingReq = gatePassRequests.find(r => r.id === requestId);
    if (!existingReq) {
      throw new Error(`Gate pass request ${requestId} not found.`);
    }

    const passId = `GP-PASS-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationToken = `BPUT-GP-2026-SEC-${Math.floor(1000 + Math.random() * 9000)}`;

    const issuedPass: IssuedGatePass = {
      id: passId,
      requestId: existingReq.id,
      studentId: existingReq.studentId,
      studentName: existingReq.studentName,
      studentEmail: existingReq.studentEmail,
      department: existingReq.department,
      hostel: existingReq.hostel,
      room: existingReq.room,
      destination: existingReq.destination,
      reason: existingReq.reason,
      departureDate: existingReq.departureDate,
      departureTime: existingReq.departureTime,
      expectedReturnDate: existingReq.expectedReturnDate,
      expectedReturnTime: existingReq.expectedReturnTime,
      contactNumber: existingReq.contactNumber,
      issuedAt: nowIso,
      validFrom: `${existingReq.departureDate} ${existingReq.departureTime}`,
      validUntil: `${existingReq.expectedReturnDate} ${existingReq.expectedReturnTime}`,
      approvingAuthority: currentUser.name,
      approvingRole: currentUser.roleTitle || 'Hostel Warden',
      verificationToken,
      status: 'VALID'
    };

    const updatedRequest: GatePassRequest = {
      ...existingReq,
      status: 'PASS_ISSUED',
      updatedAt: nowIso,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.roleTitle,
      reviewedAt: nowIso,
      issuedPassId: passId
    };

    setGatePassRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
    setIssuedGatePasses(prev => [issuedPass, ...prev.filter(p => p.requestId !== requestId)]);

    // Create In-App Notification for Student
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      recipientUserId: existingReq.studentId,
      type: 'gatepass_approved',
      title: 'Gate Pass Approved by Warden',
      message: `Your gate pass request (${existingReq.id}) has been APPROVED by ${currentUser.name}. Digital pass ${passId} is issued and ready.`,
      createdAt: nowIso,
      relatedRequestId: existingReq.id,
      relatedPassId: passId
    };
    setNotifications(prev => [notif, ...prev]);

    return { request: updatedRequest, pass: issuedPass };
  };

  const rejectGatePassRequest = (requestId: string, reason: string): GatePassRequest => {
    if (role === 'student') {
      throw new Error('[Security Policy Violation]: Students are not authorized to reject gate pass requests.');
    }

    const nowIso = new Date().toISOString();
    const existingReq = gatePassRequests.find(r => r.id === requestId);
    if (!existingReq) {
      throw new Error(`Gate pass request ${requestId} not found.`);
    }

    const updatedRequest: GatePassRequest = {
      ...existingReq,
      status: 'REJECTED',
      updatedAt: nowIso,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.roleTitle,
      reviewedAt: nowIso,
      rejectionReason: reason || 'Travel request declined by warden.'
    };

    setGatePassRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));

    // Create Notification
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      recipientUserId: existingReq.studentId,
      type: 'gatepass_rejected',
      title: 'Gate Pass Request Declined',
      message: `Your gate pass request (${existingReq.id}) was not approved. Reason: ${reason || 'Consult hostel office.'}`,
      createdAt: nowIso,
      relatedRequestId: existingReq.id
    };
    setNotifications(prev => [notif, ...prev]);

    return updatedRequest;
  };

  const verifyGatePass = (query: string): GatePassVerificationResult => {
    if (!query || !query.trim()) {
      return { status: 'INVALID', message: 'Please enter a valid Gate Pass ID or Security Verification Code.' };
    }

    const clean = query.trim().toUpperCase();

    // 1. Search in Issued Passes
    const matchedPass = issuedGatePasses.find(p => 
      p.id.toUpperCase() === clean || 
      p.verificationToken.toUpperCase() === clean ||
      p.requestId.toUpperCase() === clean
    );

    if (matchedPass) {
      if (matchedPass.status === 'ALREADY_USED') {
        return {
          status: 'ALREADY_USED',
          message: 'Single-Use Violation: This gate pass has ALREADY been used for campus departure and return.',
          pass: matchedPass
        };
      }
      if (matchedPass.status === 'REVOKED') {
        return {
          status: 'REVOKED',
          message: 'Access Denied: This digital gate pass was officially revoked by campus administration.',
          pass: matchedPass
        };
      }

      // Check Expiration against validUntil
      const now = Date.now();
      const expiryTime = new Date(matchedPass.validUntil.replace(' ', 'T')).getTime();
      if (!isNaN(expiryTime) && now > expiryTime) {
        return {
          status: 'EXPIRED',
          message: `Pass Expired: The permitted return window ended at ${matchedPass.validUntil}.`,
          pass: matchedPass
        };
      }

      return {
        status: 'VALID',
        message: 'Authoritative Pass Verified: Active, authorized, and cleared for campus gate movement.',
        pass: matchedPass
      };
    }

    // 2. Search in Requests
    const matchedReq = gatePassRequests.find(r => r.id.toUpperCase() === clean);
    if (matchedReq) {
      if (matchedReq.status === 'PENDING') {
        return {
          status: 'PENDING',
          message: 'Not Cleared: Gate pass request is still PENDING authorization. No digital pass has been issued yet.',
          request: matchedReq
        };
      }
      if (matchedReq.status === 'REJECTED') {
        return {
          status: 'REVOKED',
          message: `Request Rejected: Permission declined by authority (${matchedReq.rejectionReason || 'Declined'}).`,
          request: matchedReq
        };
      }
    }

    return {
      status: 'INVALID',
      message: 'Invalid Verification Code: No authentic gate pass record exists for this identifier.'
    };
  };

  const recordGatePassDeparture = (passId: string, guardName?: string) => {
    const nowIso = new Date().toISOString();
    const guard = guardName || currentUser.name;

    setIssuedGatePasses(prev => prev.map(p => {
      if (p.id !== passId) return p;
      return {
        ...p,
        departureLoggedAt: nowIso,
        departureLoggedBy: guard
      };
    }));

    // Invoke Security Gate Adapter
    SecurityGateAdapter.recordGateMovement({
      passId,
      gateId: 'Gate 1 (Main Highway Entrance)',
      action: 'DEPARTURE',
      timestamp: nowIso,
      guardName: guard,
      rfidScanned: true
    });
  };

  const recordGatePassReturn = (passId: string, guardName?: string) => {
    const nowIso = new Date().toISOString();
    const guard = guardName || currentUser.name;

    setIssuedGatePasses(prev => prev.map(p => {
      if (p.id !== passId) return p;
      return {
        ...p,
        returnLoggedAt: nowIso,
        returnLoggedBy: guard,
        status: 'ALREADY_USED' // Mark used so it cannot be reused
      };
    }));

    // Invoke Security Gate Adapter
    SecurityGateAdapter.recordGateMovement({
      passId,
      gateId: 'Gate 1 (Main Highway Entrance)',
      action: 'RETURN',
      timestamp: nowIso,
      guardName: guard,
      rfidScanned: true
    });
  };

  const getActiveGatePassForStudent = (studentId: string): IssuedGatePass | null => {
    const match = issuedGatePasses.find(p => p.studentId === studentId && p.status === 'VALID');
    return match || null;
  };

  const markNotificationRead = (id: string) => {
    const nowIso = new Date().toISOString();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: nowIso } : n));
  };

  const approveGatePass = (id: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      return {
        ...req,
        status: 'in_progress',
        updatedAt: nowIso,
        details: {
          ...req.details,
          wardenApproved: true,
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Warden Approval Granted',
            note: 'Digital security pass clearance issued for Gate 1 terminal scan.'
          }
        ]
      };
    }));
  };

  const recordGateDeparture = (id: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      return {
        ...req,
        updatedAt: nowIso,
        details: {
          ...req.details,
          gateLoggedOut: true,
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: 'Security Officer Behera',
            role: 'Gate Security Terminal',
            action: 'Student Departure Logged at Main Gate 1',
            system: 'Terminal Scanner #01',
            note: 'Pass barcode verified. Departure time stamped.'
          }
        ]
      };
    }));
  };

  const recordGateReturn = (id: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      return {
        ...req,
        status: 'resolved',
        updatedAt: nowIso,
        details: {
          ...req.details,
          gateLoggedIn: true,
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: 'Security Officer Behera',
            role: 'Gate Security Terminal',
            action: 'Student Campus Return Verified',
            system: 'Terminal Scanner #01',
            note: 'Return inside permitted hours. Workflow marked Resolved.'
          }
        ]
      };
    }));
  };

  const createNotice = (data: Partial<NoticeItem>): NoticeItem => {
    const nextId = `NOT-${207 + Math.floor(Math.random() * 50)}`;
    const nowIso = new Date().toISOString();

    const newNotice: NoticeItem = {
      id: nextId,
      title: data.title || 'Campus Announcement',
      content: data.content || '',
      category: data.category || 'administrative',
      priority: data.priority || 'normal',
      targetAudience: data.targetAudience || {
        type: 'all',
        label: 'All Campus Students',
        explanation: 'Broadcast notice published for the general student body.'
      },
      publishedAt: nowIso,
      expiresAt: data.expiresAt,
      author: currentUser.name,
      authorRole: currentUser.roleTitle,
      deliveryStats: {
        inAppDelivered: 450,
        smsSimulated: 380,
        readCount: 1,
        acknowledgedCount: 0,
      },
      channels: data.channels || ['in_app', 'push'],
      isRead: true,
    };

    setNotices(prev => [newNotice, ...prev]);
    return newNotice;
  };

  const markNoticeRead = (id: string) => {
    setNotices(prev => prev.map(not => not.id === id ? { ...not, isRead: true } : not));
  };

  const queueOfflineDraft = (draft: Partial<OfflineDraft>) => {
    const newDraft: OfflineDraft = {
      id: `DRAFT-${Date.now()}`,
      category: draft.category || 'maintenance',
      title: draft.title || 'Untitled Request (Offline)',
      data: draft.data || {},
      queuedAt: new Date().toISOString(),
      status: 'queued',
    };
    setOfflineDrafts(prev => [newDraft, ...prev]);
  };

  const syncOfflineQueue = () => {
    if (offlineDrafts.length === 0) return;
    offlineDrafts.forEach(draft => {
      createRequest({
        title: draft.title,
        category: draft.category,
        description: draft.data.description || 'Submitted while in offline accessibility mode',
        priority: draft.data.priority || 'medium',
        details: draft.data.details || {}
      });
    });
    setOfflineDrafts([]);
  };

  const processSmsCommand = (cmd: string): { reply: string; success: boolean } => {
    const cleaned = cmd.trim().toUpperCase();

    if (cleaned === 'FB MENU' || cleaned === 'MENU') {
      return {
        reply: '[CAMPUSFLOW / FRETBOX MESS BOT]\nToday (Friday):\n• Breakfast: Masala Dosa, Sambar\n• Lunch: Steamed Rice, Machha Besara / Paneer Butter Masala, Dal\n• Snacks: Chura Upma, Tea\n• Dinner: Roti, Rajma Masala, Rice, Fruit',
        success: true
      };
    }

    if (cleaned === 'FB NOTICE' || cleaned === 'NOTICE') {
      const latestNotice = notices[0];
      return {
        reply: `[CAMPUSFLOW SMS NOTICE]\n${latestNotice.title}\n${latestNotice.content.substring(0, 140)}... (Pub: ${new Date(latestNotice.publishedAt).toLocaleDateString()})`,
        success: true
      };
    }

    if (cleaned.startsWith('FB STATUS') || cleaned.startsWith('STATUS')) {
      const parts = cleaned.split(' ');
      const queryId = parts.length > 1 ? parts[parts.length - 1] : '';
      const match = requests.find(r => r.id.toUpperCase().includes(queryId) || queryId === r.id.toUpperCase());

      if (match) {
        return {
          reply: `[CAMPUSFLOW STATUS ${match.id}]\nTitle: ${match.title.substring(0, 40)}\nStatus: ${match.status.toUpperCase()}\nAssigned: ${match.assignedStaff || 'Queue Pending'}\nLast Update: ${new Date(match.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          success: true
        };
      } else {
        return {
          reply: `[CAMPUSFLOW]\nRequest ID '${queryId}' not found. Format: FB STATUS 1042. Active student requests: ${requests.slice(0, 3).map(r => r.id).join(', ')}.`,
          success: false
        };
      }
    }

    return {
      reply: '[CAMPUSFLOW SMS COMMAND HELP]\nValid commands:\n• FB MENU - View today mess menu\n• FB NOTICE - Read latest urgent bulletin\n• FB STATUS <ID> - Track request (e.g. FB STATUS 1042)',
      success: false
    };
  };

  const resetToSeedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.NOTICES);
      localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_DRAFTS);
    } catch (e) {
      // ignore
    }
    setRequests(INITIAL_REQUESTS);
    setNotices(INITIAL_NOTICES);
    setCertificates(INITIAL_CERTIFICATES);
    setOfflineDrafts([]);
    setSelectedRequestId(null);
    setActiveVerificationCertId(null);
    setSearchQuery('');
  };

  const triggerSimulatedSync = () => {
    setSystemLastSynced('Just now');
  };

  // Bonafide Certificate Workflow Actions
  const approveBonafideRequest = (requestId: string, approvalNote?: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'approved',
        updatedAt: nowIso,
        details: {
          ...req.details,
          approvedBy: currentUser.name,
          approvedAt: nowIso,
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Request Approved for Certificate Issuance',
            note: approvalNote || 'Dean administrative verification complete. Ready for digital certificate generation.'
          }
        ],
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: `[BONAFIDE WORKFLOW]: Approved by ${currentUser.name} (${currentUser.roleTitle}). Authorized for certificate generation.`
          }
        ]
      };
    }));
  };

  const rejectBonafideRequest = (requestId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'closed',
        updatedAt: nowIso,
        details: {
          ...req.details,
          rejectionReason: reason
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Request Rejected with Reason',
            note: reason
          }
        ],
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: `[BONAFIDE WORKFLOW]: Request rejected by ${currentUser.name}. Reason: ${reason}`
          }
        ]
      };
    }));
  };

  const requestBonafideClarification = (requestId: string, message: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        updatedAt: nowIso,
        details: {
          ...req.details,
          clarificationMessage: message
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Clarification Requested by Reviewer',
            note: message
          }
        ],
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: `[CLARIFICATION REQUESTED]: ${message}`
          }
        ]
      };
    }));
  };

  const issueCertificate = (requestId: string, customDetails?: Partial<BonafideCertificate>): BonafideCertificate => {
    const nowIso = new Date().toISOString();
    const todayYmd = nowIso.split('T')[0];
    const targetReq = requests.find(r => r.id === requestId);
    const certNum = Math.floor(1000 + Math.random() * 9000);
    const newCertId = `BPUT-BC-2026-${certNum}`;

    const studentName = targetReq?.studentName || currentUser.name;
    const studentId = targetReq?.studentId || currentUser.studentId || '2201289140';
    const studentEmail = targetReq?.studentEmail || currentUser.email;
    const programme = targetReq?.details?.programme || 'Bachelor of Technology in Computer Science & Engineering';
    const department = targetReq?.department || 'Department of Computer Science & Engineering';
    const academicYear = targetReq?.details?.academicYear || '2025–2026';
    const semester = targetReq?.details?.semester || '6th Semester (3rd Year)';
    const purpose = targetReq?.details?.purpose || targetReq?.title || 'Academic Bonafide & Institutional Verification';

    const newCert: BonafideCertificate = {
      id: newCertId,
      requestId: requestId,
      studentId: studentId,
      studentName: studentName,
      studentEmail: studentEmail,
      programme: programme,
      department: department,
      academicYear: academicYear,
      semester: semester,
      purpose: purpose,
      issueDate: todayYmd,
      validUntil: '2027-09-30',
      authorizedSignatory: {
        name: 'Prof. S. K. Mohapatra',
        title: 'Dean of Academic Affairs & Student Welfare',
        department: 'Office of the Registrar',
        institution: 'Government College of Engineering, Kalahandi'
      },
      institution: {
        name: 'BIJU PATNAIK UNIVERSITY OF TECHNOLOGY, ODISHA',
        subName: 'GOVERNMENT COLLEGE OF ENGINEERING, KALAHANDI',
        location: 'Bhawanipatna, Kalahandi, Odisha — 766002',
        affiliation: 'A Constituent College of BPUT, Rourkela'
      },
      status: 'valid',
      qrCodeUrl: `/verify/${newCertId}`,
      downloadCount: 0,
      isDemoPrototype: true,
      ...customDetails
    };

    // Update request: status 'resolved' (Certificate Issued) and attach certificateId
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'resolved',
        updatedAt: nowIso,
        details: {
          ...req.details,
          certificateId: newCertId,
          approvedBy: req.details?.approvedBy || currentUser.name,
          approvedAt: req.details?.approvedAt || nowIso
        },
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: `Certificate Generated (ID: ${newCertId})`,
            note: `Cryptographically sealed and registered in repository. Certificate issued to ${studentName}.`
          }
        ],
        internalNotes: [
          ...req.internalNotes,
          {
            id: `IN-${Date.now()}`,
            timestamp: nowIso,
            author: currentUser.name,
            text: `[BONAFIDE ISSUED]: Certificate ${newCertId} generated and stored in student My Documents repository.`
          }
        ]
      };
    }));

    setCertificates(prev => [newCert, ...prev]);
    return newCert;
  };

  const recordCertificateDownload = (certificateId: string) => {
    const nowIso = new Date().toISOString();
    setCertificates(prev => prev.map(cert => {
      if (cert.id !== certificateId) return cert;
      return {
        ...cert,
        downloadCount: (cert.downloadCount || 0) + 1,
        lastDownloadedAt: nowIso
      };
    }));

    // Find associated request and add timeline event
    setRequests(prev => prev.map(req => {
      if (req.details?.certificateId !== certificateId) return req;
      return {
        ...req,
        updatedAt: nowIso,
        timeline: [
          ...req.timeline,
          {
            id: `TL-${Date.now()}`,
            timestamp: nowIso,
            actor: currentUser.name,
            role: currentUser.roleTitle,
            action: 'Certificate Downloaded',
            note: `Downloaded official A4 institutional credential (ID: ${certificateId}).`
          }
        ]
      };
    }));
  };

  const getStudentCertificates = (studentId: string): BonafideCertificate[] => {
    return certificates.filter(c => c.studentId === studentId);
  };

  const getCertificateById = (certificateId: string): BonafideCertificate | null => {
    if (!certificateId) return null;
    const clean = certificateId.trim().toUpperCase();
    return certificates.find(c => c.id.toUpperCase() === clean) || null;
  };

  return (
    <CampusContext.Provider
      value={{
        session,
        isAuthenticated,
        authenticate,
        logout,
        role,
        setRole,
        currentUser,
        requests,
        notices,
        certificates,
        gatePassRequests,
        issuedGatePasses,
        notifications,
        activeGatePassModal,
        setActiveGatePassModal,
        createGatePassRequest,
        approveGatePassRequest,
        rejectGatePassRequest,
        verifyGatePass,
        recordGatePassDeparture,
        recordGatePassReturn,
        getActiveGatePassForStudent,
        markNotificationRead,
        activeTab,
        setActiveTab,
        selectedRequestId,
        setSelectedRequestId,
        searchQuery,
        setSearchQuery,
        isAccessibilityMode,
        setIsAccessibilityMode,
        isOfflineSimulated,
        setIsOfflineSimulated,
        offlineDrafts,
        activeVerificationCertId,
        setActiveVerificationCertId,
        activeMapLocationId,
        setActiveMapLocationId,
        navigateToMapLocation,
        createRequest,
        updateRequestStatus,
        assignStaff,
        changePriority,
        escalateRequest,
        addInternalNote,
        addClarification,
        linkToIncident,
        approveGatePass,
        recordGateDeparture,
        recordGateReturn,
        createNotice,
        markNoticeRead,
        resetToSeedData,
        queueOfflineDraft,
        syncOfflineQueue,
        processSmsCommand,
        triggerSimulatedSync,
        systemLastSynced,
        getActiveUrgentRequest,
        checkUrgentEligibility,
        issueCertificate,
        approveBonafideRequest,
        rejectBonafideRequest,
        requestBonafideClarification,
        recordCertificateDownload,
        getStudentCertificates,
        getCertificateById,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
