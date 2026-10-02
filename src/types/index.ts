export type Role = 'student' | 'faculty' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  department: string;
  studentId?: string; // e.g. 2201289140
  staffId?: string;
  branch?: string;
  semester?: string;
  hostel?: string;
  room?: string;
  phone?: string;
  initials: string;
}

export type GatePassStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PASS_ISSUED' 
  | 'USED' 
  | 'EXPIRED' 
  | 'REVOKED';

export interface GatePassRequest {
  id: string; // e.g. "GP-REQ-2026-1049"
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  hostel: string;
  room: string;
  destination: string;
  reason: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  expectedReturnDate: string; // YYYY-MM-DD
  expectedReturnTime: string; // HH:mm
  contactNumber: string;
  emergencyContact?: string;
  notes?: string;
  status: GatePassStatus;
  createdAt: string;
  updatedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  issuedPassId?: string;
}

export interface IssuedGatePass {
  id: string; // e.g. "GP-PASS-8841"
  requestId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  hostel: string;
  room: string;
  destination: string;
  reason: string;
  departureDate: string;
  departureTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  contactNumber: string;
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  approvingAuthority: string;
  approvingRole: string;
  verificationToken: string; // e.g. "BPUT-GP-2026-SEC-7731"
  status: 'VALID' | 'ALREADY_USED' | 'EXPIRED' | 'REVOKED';
  departureLoggedAt?: string;
  departureLoggedBy?: string;
  returnLoggedAt?: string;
  returnLoggedBy?: string;
}

export interface GatePassVerificationResult {
  status: 'VALID' | 'PENDING' | 'EXPIRED' | 'REVOKED' | 'ALREADY_USED' | 'INVALID';
  message: string;
  pass?: IssuedGatePass;
  request?: GatePassRequest;
}

export interface AppNotification {
  id: string;
  recipientUserId: string; // e.g. student ID or role
  type: 'gatepass_submitted' | 'gatepass_approved' | 'gatepass_rejected' | 'gatepass_issued' | 'system_alert';
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  relatedRequestId?: string;
  relatedPassId?: string;
}

export type RequestCategory = 
  | 'bonafide'
  | 'maintenance'
  | 'leave_gatepass'
  | 'timetable'
  | 'mess'
  | 'fee_dues';

export type RequestStatus = 
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'approved'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RequestTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  note?: string;
  system?: string;
  previousPriority?: RequestPriority;
  newPriority?: RequestPriority;
}

export interface InternalNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface BonafideCertificate {
  id: string; // e.g. "BPUT-BC-2026-8491"
  requestId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programme: string;
  department: string;
  academicYear: string;
  semester: string;
  purpose: string;
  issueDate: string; // ISO date YYYY-MM-DD
  validUntil: string;
  authorizedSignatory: {
    name: string;
    title: string;
    department: string;
    institution: string;
  };
  institution: {
    name: string;
    subName: string;
    location: string;
    affiliation: string;
  };
  status: 'valid' | 'revoked';
  qrCodeUrl: string;
  downloadCount: number;
  lastDownloadedAt?: string;
  isDemoPrototype: true;
}

export interface RequestItem {
  id: string; // e.g. "REQ-1042"
  title: string;
  category: RequestCategory;
  department: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  hostelRoom: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  priority: RequestPriority;
  requestedPriority?: RequestPriority;
  priorityReason?: string;
  priorityVerifiedByStaff?: boolean;
  flaggedForTriage?: boolean;
  triageNote?: string;
  description: string;
  slaHours: number;
  assignedStaff?: string;
  assignedRole?: string;
  isLinkedIncident?: boolean;
  linkedIncidentId?: string;
  details: {
    // Bonafide
    purpose?: string;
    deliveryPreference?: 'digital' | 'counter';
    academicYear?: string;
    erpFeeStatus?: string;
    certificateId?: string;
    rejectionReason?: string;
    clarificationMessage?: string;
    approvedBy?: string;
    approvedAt?: string;
    programme?: string;
    semester?: string;
    // Maintenance
    issueSubcategory?: string;
    hostelBlock?: string;
    roomNumber?: string;
    campusLocationId?: string;
    campusLocationName?: string;
    hasImageAttachment?: boolean;
    attachmentName?: string;
    isEmergencySafetyRisk?: boolean;
    // Leave & Gate Pass
    departureDate?: string;
    departureTime?: string;
    returnDate?: string;
    returnTime?: string;
    destination?: string;
    reason?: string;
    emergencyContact?: string;
    wardenApproved?: boolean;
    gateLoggedOut?: boolean;
    gateLoggedIn?: boolean;
    // Timetable
    subject?: string;
    subjectCode?: string;
    classDate?: string;
    queryType?: string;
    // Mess
    mealType?: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    messFeedbackCategory?: string;
    rating?: number;
    // Fee / Dues
    feeCategory?: string;
    sampleBalance?: string;
    academicTerm?: string;
    // Warden Assisted
    assistedBy?: string;
  };
  timeline: RequestTimelineEvent[];
  internalNotes: InternalNote[];
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'hostel' | 'administrative' | 'emergency';
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: {
    type: 'all' | 'branch' | 'hostel' | 'year';
    label: string;
    explanation: string;
  };
  publishedAt: string;
  expiresAt?: string;
  author: string;
  authorRole: string;
  deliveryStats: {
    inAppDelivered: number;
    smsSimulated: number;
    readCount: number;
    acknowledgedCount: number;
  };
  channels: ('in_app' | 'sms' | 'push')[];
  isRead?: boolean;
}

export interface TimetableSlot {
  id: string;
  time: string;
  subject: string;
  code: string;
  room: string;
  faculty: string;
  type: 'Theory' | 'Lab' | 'Tutorial';
  status: 'scheduled' | 'rescheduled' | 'cancelled';
  note?: string;
}

export interface MessMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialNote?: string;
}

export interface CampusAlert {
  id: string;
  title: string;
  level: 'info' | 'warning' | 'alert';
  message: string;
  timestamp: string;
  department: string;
}

export interface OfflineDraft {
  id: string;
  category: RequestCategory;
  title: string;
  data: any;
  queuedAt: string;
  status: 'queued' | 'synced';
}

export interface SystemIntegrationInfo {
  id: string;
  name: string;
  logoText: string;
  purpose: string;
  status: 'Connected (Demo)' | 'Simulated' | 'Not Configured';
  health: 'healthy' | 'latency_normal' | 'idle';
  dataAvailable: string[];
  actionsSupported: string[];
  lastSimulatedSync: string;
  syncLatencyMs: number;
  endpointUrl: string;
}
