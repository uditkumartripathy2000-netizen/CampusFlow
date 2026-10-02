import { 
  UserProfile, 
  RequestItem, 
  NoticeItem, 
  TimetableSlot, 
  MessMenuDay, 
  CampusAlert,
  SystemIntegrationInfo,
  BonafideCertificate,
  GatePassRequest,
  IssuedGatePass,
  AppNotification,
  Role
} from '../types/index.ts';

export const SEED_PROFILES: Record<Role, UserProfile> = {
  student: {
    id: 'USR-STU-01',
    name: 'Udit Kumar Tripathy',
    email: 'student@bput-campus.ac.in',
    role: 'student',
    roleTitle: 'Student · B.Tech Computer Science',
    department: 'Department of Computer Science & Engineering',
    studentId: '2201289140',
    branch: 'Computer Science & Engineering',
    semester: '6th Semester (3rd Year)',
    hostel: 'Brahmaputra Hall of Residence',
    room: 'Block B · Room 314',
    phone: '+91 94371 88210',
    initials: 'UT',
  },
  faculty: {
    id: 'USR-FAC-01',
    name: 'Dr. Pramod Dash',
    email: 'faculty@bput-campus.ac.in',
    role: 'faculty',
    roleTitle: 'Associate Professor & Hostel Warden',
    department: 'Department of Electrical Engineering & Hostel Council',
    staffId: 'FAC-EE-2014',
    phone: '+91 94371 88200',
    initials: 'PD',
  },
  admin: {
    id: 'USR-ADM-01',
    name: 'Prof. S. K. Mohapatra',
    email: 'admin@bput-campus.ac.in',
    role: 'admin',
    roleTitle: 'Dean of Student Welfare & Central Ops',
    department: 'Office of the Dean & Registrar',
    staffId: 'ADM-DSW-01',
    phone: '+91 661 2482 101',
    initials: 'SM',
  },
  staff: {
    id: 'USR-STF-01',
    name: 'Er. Ramesh Chandra Patra',
    email: 'staff@bput-campus.ac.in',
    role: 'staff',
    roleTitle: 'Chief Facilities & Hostel Works Supervisor',
    department: 'Estate, Works & Hostel Maintenance',
    staffId: 'STF-EST-109',
    phone: '+91 98610 44321',
    initials: 'RP',
  },
};

export const INITIAL_GATEPASS_REQUESTS: GatePassRequest[] = [
  {
    id: 'GP-REQ-2026-1049',
    studentId: '2201289140',
    studentName: 'Udit Kumar Tripathy',
    studentEmail: 'student@bput-campus.ac.in',
    department: 'Computer Science & Engineering',
    hostel: 'Brahmaputra Hall of Residence',
    room: 'Block B · Room 314',
    destination: 'Bhubaneswar (Technical Hackathon at SOA University)',
    reason: 'Inter-college Smart Campus Innovation Hackathon finals participant representing BPUT team',
    departureDate: '2026-10-03',
    departureTime: '14:00',
    expectedReturnDate: '2026-10-05',
    expectedReturnTime: '20:00',
    contactNumber: '+91 94371 88210',
    emergencyContact: '+91 94370 12345 (Guardian)',
    notes: 'Official permission slip attached with Faculty advisor endorsement.',
    status: 'PASS_ISSUED',
    createdAt: '2026-10-01T09:30:00Z',
    updatedAt: '2026-10-01T15:20:00Z',
    reviewerId: 'USR-FAC-01',
    reviewerName: 'Dr. Pramod Dash',
    reviewerRole: 'Hostel Warden (Brahmaputra Hall)',
    reviewedAt: '2026-10-01T15:20:00Z',
    issuedPassId: 'GP-PASS-8841'
  },
  {
    id: 'GP-REQ-2026-1050',
    studentId: '2201289140',
    studentName: 'Udit Kumar Tripathy',
    studentEmail: 'student@bput-campus.ac.in',
    department: 'Computer Science & Engineering',
    hostel: 'Brahmaputra Hall of Residence',
    room: 'Block B · Room 314',
    destination: 'Rourkela Sector 4 (Specialist Dental Clinic)',
    reason: 'Scheduled root canal treatment appointment at CWS Hospital Rourkela',
    departureDate: '2026-10-07',
    departureTime: '16:30',
    expectedReturnDate: '2026-10-07',
    expectedReturnTime: '21:00',
    contactNumber: '+91 94371 88210',
    emergencyContact: '+91 94370 12345',
    notes: 'Prescription card registered with campus health centre.',
    status: 'PENDING',
    createdAt: '2026-10-02T08:15:00Z',
    updatedAt: '2026-10-02T08:15:00Z'
  },
  {
    id: 'GP-REQ-2026-1048',
    studentId: '2201289205',
    studentName: 'Subhashree Priyadarshini',
    studentEmail: 'subhashree.p@bput-campus.ac.in',
    department: 'Electronics & Telecommunication',
    hostel: 'Mahanadi Hall of Residence',
    room: 'Block A · Room 112',
    destination: 'Cuttack Home Visit',
    reason: 'Family social function and sister wedding engagement over weekend',
    departureDate: '2026-10-02',
    departureTime: '17:00',
    expectedReturnDate: '2026-10-05',
    expectedReturnTime: '08:00',
    contactNumber: '+91 94378 99120',
    emergencyContact: '+91 94371 44556 (Parent)',
    status: 'PENDING',
    createdAt: '2026-10-02T09:45:00Z',
    updatedAt: '2026-10-02T09:45:00Z'
  }
];

export const INITIAL_ISSUED_GATEPASSES: IssuedGatePass[] = [
  {
    id: 'GP-PASS-8841',
    requestId: 'GP-REQ-2026-1049',
    studentId: '2201289140',
    studentName: 'Udit Kumar Tripathy',
    studentEmail: 'student@bput-campus.ac.in',
    department: 'Computer Science & Engineering',
    hostel: 'Brahmaputra Hall of Residence',
    room: 'Block B · Room 314',
    destination: 'Bhubaneswar (Technical Hackathon at SOA University)',
    reason: 'Inter-college Smart Campus Innovation Hackathon finals participant representing BPUT team',
    departureDate: '2026-10-03',
    departureTime: '14:00',
    expectedReturnDate: '2026-10-05',
    expectedReturnTime: '20:00',
    contactNumber: '+91 94371 88210',
    issuedAt: '2026-10-01T15:20:00Z',
    validFrom: '2026-10-03 14:00',
    validUntil: '2026-10-05 20:00',
    approvingAuthority: 'Dr. Pramod Dash',
    approvingRole: 'Hostel Warden (Brahmaputra Hall)',
    verificationToken: 'BPUT-GP-2026-SEC-7731',
    status: 'VALID'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-01',
    recipientUserId: '2201289140',
    type: 'gatepass_approved',
    title: 'Gate Pass Approved by Warden',
    message: 'Your gate pass request GP-REQ-2026-1049 has been approved by Dr. Pramod Dash. Digital pass GP-PASS-8841 is now active.',
    createdAt: '2026-10-01T15:20:00Z',
    relatedRequestId: 'GP-REQ-2026-1049',
    relatedPassId: 'GP-PASS-8841'
  }
];

export const STAFF_DIRECTORY = [
  { name: 'Er. Ramesh Chandra Patra', role: 'Facilities & Hostel Maintenance Supervisor', dept: 'Works & Maintenance' },
  { name: 'Dr. P. Dash', role: 'Hostel Warden (Brahmaputra Block B)', dept: 'Hostel Administration' },
  { name: 'Mrs. Sunita Mohanty', role: 'Superintendent, Academic & Bonafide Wing', dept: 'Registrar Office' },
  { name: 'Mr. Binod Behera', role: 'Chief Security Officer (Main Gate 1)', dept: 'Campus Security' },
  { name: 'Chef Debendra Jena', role: 'Chief Catering Officer', dept: 'Central Mess Committee' },
];

export const INITIAL_REQUESTS: RequestItem[] = [
  // 1. Water leak in Brahmaputra Block B - Report 1 (Student Udit)
  {
    id: 'REQ-1042',
    title: 'Severe pipeline seepage in 3rd floor washroom ceiling',
    category: 'maintenance',
    department: 'Hostel Maintenance (FretBox Sync)',
    studentName: 'Udit Kumar Tripathy',
    studentId: '2201289140',
    studentEmail: 'udit.tripathy@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 314',
    createdAt: '2026-09-30T10:15:00Z',
    updatedAt: '2026-10-01T04:30:00Z',
    status: 'in_progress',
    priority: 'high',
    slaHours: 24,
    assignedStaff: 'Er. Ramesh Chandra Patra',
    assignedRole: 'Works & Maintenance',
    description: 'Continuous water dripping from the overhead junction box and main supply pipe above washroom cubicle 3. Dampness spreading to adjacent room walls.',
    details: {
      issueSubcategory: 'Plumbing & Water Supply',
      hostelBlock: 'Block B',
      roomNumber: '314 / 3rd Floor Common Washroom',
      hasImageAttachment: true,
      attachmentName: 'leak_pipe_junction_b3.jpg',
    },
    timeline: [
      { id: 'TL-1', timestamp: '2026-09-30T10:15:00Z', actor: 'Udit Kumar Tripathy', role: 'Student', action: 'Request Submitted', note: 'Logged via CampusFlow web launcher' },
      { id: 'TL-2', timestamp: '2026-09-30T10:18:00Z', actor: 'CampusFlow Engine', role: 'System', action: 'Auto-Routed to FretBox API', system: 'FretBox v2' },
      { id: 'TL-3', timestamp: '2026-09-30T11:45:00Z', actor: 'Er. Ramesh Chandra Patra', role: 'Supervisor', action: 'Assigned & Site Inspection Scheduled', note: 'Plumbing contractor unit dispatched with spare valve fittings' },
      { id: 'TL-4', timestamp: '2026-10-01T04:30:00Z', actor: 'Er. Ramesh Chandra Patra', role: 'Supervisor', action: 'Status changed to In Progress', note: 'Overhead riser valve isolated. Soldering joints in progress.' }
    ],
    internalNotes: [
      { id: 'IN-1', timestamp: '2026-09-30T11:40:00Z', author: 'Er. Ramesh Chandra Patra', text: 'Matches identical reports from rooms B-312 and B-318. Linked to Master Incident INC-408.' }
    ],
    isLinkedIncident: true,
    linkedIncidentId: 'INC-408'
  },

  // 2. Similar Water leak Report in Block B - Room 312
  {
    id: 'REQ-1039',
    title: 'Water pressure fluctuation and ceiling seepage near B-312',
    category: 'maintenance',
    department: 'Hostel Maintenance (FretBox Sync)',
    studentName: 'Subham Sourav Panda',
    studentId: '2201289112',
    studentEmail: 'subham.panda@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 312',
    createdAt: '2026-09-30T08:50:00Z',
    updatedAt: '2026-09-30T11:45:00Z',
    status: 'in_progress',
    priority: 'high',
    slaHours: 24,
    assignedStaff: 'Er. Ramesh Chandra Patra',
    assignedRole: 'Works & Maintenance',
    description: 'Ceiling plaster is peeling off due to overhead pipeline seepage from the main corridor header pipe.',
    details: {
      issueSubcategory: 'Plumbing & Water Supply',
      hostelBlock: 'Block B',
      roomNumber: '312',
      hasImageAttachment: false,
    },
    timeline: [
      { id: 'TL-5', timestamp: '2026-09-30T08:50:00Z', actor: 'Subham Sourav Panda', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-6', timestamp: '2026-09-30T11:45:00Z', actor: 'CampusFlow Engine', role: 'System', action: 'Clustered into Incident INC-408' }
    ],
    internalNotes: [
      { id: 'IN-2', timestamp: '2026-09-30T11:45:00Z', author: 'Er. Ramesh Chandra Patra', text: 'Associated with block overhead riser line breakdown.' }
    ],
    isLinkedIncident: true,
    linkedIncidentId: 'INC-408'
  },

  // 3. Similar Water leak Report in Block B - Room 318
  {
    id: 'REQ-1038',
    title: 'Water accumulation in corridor drain near B-318',
    category: 'maintenance',
    department: 'Hostel Maintenance (FretBox Sync)',
    studentName: 'Ananya Priyadarshini',
    studentId: '2201289088',
    studentEmail: 'ananya.p@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 318',
    createdAt: '2026-09-30T07:30:00Z',
    updatedAt: '2026-09-30T11:45:00Z',
    status: 'in_progress',
    priority: 'high',
    slaHours: 24,
    assignedStaff: 'Er. Ramesh Chandra Patra',
    assignedRole: 'Works & Maintenance',
    description: 'Excessive water dripping along the outer corridor ceiling causing slippery floor.',
    details: {
      issueSubcategory: 'Plumbing & Water Supply',
      hostelBlock: 'Block B',
      roomNumber: '318',
      hasImageAttachment: false,
    },
    timeline: [
      { id: 'TL-7', timestamp: '2026-09-30T07:30:00Z', actor: 'Ananya Priyadarshini', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-8', timestamp: '2026-09-30T11:45:00Z', actor: 'CampusFlow Engine', role: 'System', action: 'Clustered into Incident INC-408' }
    ],
    internalNotes: [],
    isLinkedIncident: true,
    linkedIncidentId: 'INC-408'
  },

  // 4. Bonafide Certificate Request (Student Udit)
  {
    id: 'REQ-1045',
    title: 'Bonafide Certificate for National Scholarship Portal (NSP)',
    category: 'bonafide',
    department: 'Registrar Academic Section',
    studentName: 'Udit Kumar Tripathy',
    studentId: '2201289140',
    studentEmail: 'udit.tripathy@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 314',
    createdAt: '2026-09-29T14:20:00Z',
    updatedAt: '2026-09-30T16:10:00Z',
    status: 'assigned',
    priority: 'medium',
    slaHours: 48,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Academic Section',
    description: 'Need official college bonafide certificate with fee structure for NSP Post-Matric renewal deadline on Oct 10.',
    details: {
      purpose: 'National Scholarship Portal (NSP) Renewal Application',
      deliveryPreference: 'digital',
      academicYear: '2026-2027',
      erpFeeStatus: 'Cleared (No outstanding dues found on College ERP)',
    },
    timeline: [
      { id: 'TL-9', timestamp: '2026-09-29T14:20:00Z', actor: 'Udit Kumar Tripathy', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-10', timestamp: '2026-09-29T14:21:00Z', actor: 'CampusFlow Engine', role: 'System', action: 'ERP Dues Check Passed', note: 'Sample college ERP ledger verified zero dues' },
      { id: 'TL-11', timestamp: '2026-09-30T16:10:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Assigned for Digitally Signed Generation', note: 'Queued for Dean seal attachment' }
    ],
    internalNotes: [
      { id: 'IN-3', timestamp: '2026-09-30T16:10:00Z', author: 'Mrs. Sunita Mohanty', text: 'ERP enrollment verified for B.Tech CSE 2022-26 batch.' }
    ]
  },

  // 4b. Bonafide Certificate - Approved and Issued (Student Udit)
  {
    id: 'REQ-1040',
    title: 'Bonafide Certificate for Smart India Hackathon & Paper Presentation',
    category: 'bonafide',
    department: 'Registrar Academic Section',
    studentName: 'Udit Kumar Tripathy',
    studentId: '2201289140',
    studentEmail: 'udit.tripathy@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 314',
    createdAt: '2026-09-27T09:30:00Z',
    updatedAt: '2026-09-28T15:00:00Z',
    status: 'resolved',
    priority: 'medium',
    slaHours: 48,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Academic Section',
    description: 'Requires institutional bonafide certificate for national hackathon registration and conference delegation clearance.',
    details: {
      purpose: 'Smart India Hackathon 2026 & National Paper Presentation Participation',
      deliveryPreference: 'digital',
      academicYear: '2025–2026',
      semester: '6th Semester (3rd Year)',
      programme: 'Bachelor of Technology in Computer Science & Engineering',
      erpFeeStatus: 'Cleared',
      certificateId: 'BPUT-BC-2026-8491',
      approvedBy: 'Prof. S. K. Mohapatra',
      approvedAt: '2026-09-28T14:40:00Z'
    },
    timeline: [
      { id: 'TL-B1', timestamp: '2026-09-27T09:30:00Z', actor: 'Udit Kumar Tripathy', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-B2', timestamp: '2026-09-27T09:32:00Z', actor: 'CampusFlow Orchestrator', role: 'System', action: 'Eligibility Verified against ERP Ledger', note: 'Cumulative biometric attendance ≥ 75%, Zero outstanding tuition dues' },
      { id: 'TL-B3', timestamp: '2026-09-28T11:20:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Request Reviewed & Forwarded to Dean', note: 'Academic standing verified in good order' },
      { id: 'TL-B4', timestamp: '2026-09-28T14:40:00Z', actor: 'Prof. S. K. Mohapatra', role: 'Admin', action: 'Request Approved', note: 'Authorized for digital issuance' },
      { id: 'TL-B5', timestamp: '2026-09-28T15:00:00Z', actor: 'Prof. S. K. Mohapatra', role: 'Admin', action: 'Certificate Generated (ID: BPUT-BC-2026-8491)', note: 'Cryptographic hash generated. Added to student My Documents' },
      { id: 'TL-B6', timestamp: '2026-09-28T16:15:00Z', actor: 'Udit Kumar Tripathy', role: 'Student', action: 'Certificate Downloaded', note: 'Downloaded institutional PDF copy' }
    ],
    internalNotes: [
      { id: 'IN-B1', timestamp: '2026-09-28T14:40:00Z', author: 'Prof. S. K. Mohapatra', text: 'Approved for SIH 2026 campus delegation. Certificate generated.' }
    ]
  },

  // 4c. Bonafide Certificate - Approved (Ready for Admin "Generate Certificate" Action)
  {
    id: 'REQ-1052',
    title: 'Bonafide Certificate for Canara Bank Education Loan Subsidy Scheme',
    category: 'bonafide',
    department: 'Registrar Academic Section',
    studentName: 'Subham Sourav Panda',
    studentId: '2201289112',
    studentEmail: 'subham.panda@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 312',
    createdAt: '2026-09-30T11:00:00Z',
    updatedAt: '2026-10-01T04:10:00Z',
    status: 'approved',
    priority: 'high',
    slaHours: 24,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Academic Section',
    description: 'Urgent bonafide letter required for Central Sector Interest Subsidy (CSIS) renewal at Canara Bank Cuttack branch.',
    details: {
      purpose: 'Canara Bank Central Sector Interest Subsidy (CSIS) Loan Renewal',
      deliveryPreference: 'digital',
      academicYear: '2025–2026',
      semester: '6th Semester (3rd Year)',
      programme: 'Bachelor of Technology in Computer Science & Engineering',
      erpFeeStatus: 'Cleared (Zero dues)',
      approvedBy: 'Prof. S. K. Mohapatra',
      approvedAt: '2026-10-01T04:10:00Z'
    },
    timeline: [
      { id: 'TL-B7', timestamp: '2026-09-30T11:00:00Z', actor: 'Subham Sourav Panda', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-B8', timestamp: '2026-09-30T11:05:00Z', actor: 'CampusFlow Orchestrator', role: 'System', action: 'ERP Ledger Validated', note: 'No pending liability found' },
      { id: 'TL-B9', timestamp: '2026-09-30T16:45:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Request Reviewed', note: 'Bank loan document checklist satisfied' },
      { id: 'TL-B10', timestamp: '2026-10-01T04:10:00Z', actor: 'Prof. S. K. Mohapatra', role: 'Admin', action: 'Request Approved', note: 'Approved by Dean. Pending certificate generation dispatch.' }
    ],
    internalNotes: [
      { id: 'IN-B2', timestamp: '2026-10-01T04:10:00Z', author: 'Prof. S. K. Mohapatra', text: 'Approved. Waiting for admin to execute Generate Certificate action.' }
    ]
  },

  // 4d. Bonafide Certificate - Rejected with Reason
  {
    id: 'REQ-1037',
    title: 'Bonafide Certificate for Outstation Industrial Training Application',
    category: 'bonafide',
    department: 'Registrar Academic Section',
    studentName: 'Ananya Priyadarshini',
    studentId: '2201289088',
    studentEmail: 'ananya.p@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 318',
    createdAt: '2026-09-28T14:00:00Z',
    updatedAt: '2026-09-29T10:30:00Z',
    status: 'closed',
    priority: 'medium',
    slaHours: 48,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Academic Section',
    description: 'Application for summer training bonafide letter at Tata Consultancy Services Bhubaneswar.',
    details: {
      purpose: 'Industrial Training NOC at TCS Bhubaneswar',
      deliveryPreference: 'digital',
      academicYear: '2025–2026',
      semester: '6th Semester (3rd Year)',
      programme: 'Bachelor of Technology in Computer Science & Engineering',
      erpFeeStatus: 'Dues Pending (₹2,200 Exam Fee)',
      rejectionReason: 'Fee ledger reflects pending semester examination fee of ₹2,200. Under university statute, bonafide credentials cannot be released until account ledger clearance. Please clear dues at Finance window before re-applying.'
    },
    timeline: [
      { id: 'TL-B11', timestamp: '2026-09-28T14:00:00Z', actor: 'Ananya Priyadarshini', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-B12', timestamp: '2026-09-29T10:15:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Request Reviewed', note: 'Flagged outstanding examination fee dues' },
      { id: 'TL-B13', timestamp: '2026-09-29T10:30:00Z', actor: 'Prof. S. K. Mohapatra', role: 'Admin', action: 'Request Rejected with Reason', note: 'Fee ledger reflects pending semester exam fee. Please clear dues before re-applying.' }
    ],
    internalNotes: [
      { id: 'IN-B3', timestamp: '2026-09-29T10:30:00Z', author: 'Prof. S. K. Mohapatra', text: 'Cannot approve while ₹2,200 remains unsettled in SBI Collect sync.' }
    ]
  },

  // 5. Leave & Gate Pass Request (Student Udit)
  {
    id: 'REQ-1050',
    title: 'Weekend Home Leave Pass (Cuttack)',
    category: 'leave_gatepass',
    department: 'Hostel Warden & Security Gate',
    studentName: 'Udit Kumar Tripathy',
    studentId: '2201289140',
    studentEmail: 'udit.tripathy@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block B · Room 314',
    createdAt: '2026-10-01T02:00:00Z',
    updatedAt: '2026-10-01T04:15:00Z',
    status: 'assigned',
    priority: 'medium',
    slaHours: 12,
    assignedStaff: 'Dr. P. Dash',
    assignedRole: 'Hostel Warden',
    description: 'Traveling home to Cuttack for family occasion. Returning on Monday morning before 08:30 AM class.',
    details: {
      departureDate: '2026-10-02',
      departureTime: '17:30',
      returnDate: '2026-10-05',
      returnTime: '08:00',
      destination: 'CDA Sector 9, Cuttack, Odisha',
      reason: 'Family ceremony',
      emergencyContact: '+91 94370 12345 (Father)',
      wardenApproved: false,
      gateLoggedOut: false,
      gateLoggedIn: false,
    },
    timeline: [
      { id: 'TL-12', timestamp: '2026-10-01T02:00:00Z', actor: 'Udit Kumar Tripathy', role: 'Student', action: 'Leave Submitted', note: 'Pending Warden review' },
      { id: 'TL-13', timestamp: '2026-10-01T02:02:00Z', actor: 'CampusFlow Engine', role: 'System', action: 'Routed to Warden Queue', note: 'SMS notification simulated to Dr. P. Dash' }
    ],
    internalNotes: []
  },

  // 6. Timetable Query
  {
    id: 'REQ-1035',
    title: 'Room clash for Web Technologies Lab (Batch B1)',
    category: 'timetable',
    department: 'Academic Section & LMS',
    studentName: 'Biswajit Sahoo',
    studentId: '2201289064',
    studentEmail: 'biswajit.s@bput-campus.ac.in',
    hostelRoom: 'Mahanadi Hall · Room A-204',
    createdAt: '2026-09-28T09:10:00Z',
    updatedAt: '2026-09-29T11:00:00Z',
    status: 'resolved',
    priority: 'medium',
    slaHours: 24,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Academic Section',
    description: 'Friday 2:00 PM Web Tech Lab is shown in Lab 3, but 4th sem IT is also scheduled in the same room on LMS.',
    details: {
      subject: 'Web Technologies Lab (CS-312)',
      subjectCode: 'CS-312',
      classDate: '2026-10-02',
      queryType: 'Room Allocation Conflict',
    },
    timeline: [
      { id: 'TL-14', timestamp: '2026-09-28T09:10:00Z', actor: 'Biswajit Sahoo', role: 'Student', action: 'Query Submitted' },
      { id: 'TL-15', timestamp: '2026-09-29T11:00:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Resolved', note: 'Relocated CS-312 Batch B1 to Computer Lab 5 (Ground Floor CS Wing). Updated on LMS.' }
    ],
    internalNotes: [
      { id: 'IN-4', timestamp: '2026-09-29T10:55:00Z', author: 'Mrs. Sunita Mohanty', text: 'LMS timetable synced. Conflict cleared.' }
    ]
  },

  // 7. Mess Feedback
  {
    id: 'REQ-1044',
    title: 'Inadequate heating and late dinner refill in South Counter',
    category: 'mess',
    department: 'Central Mess Committee',
    studentName: 'Smruti Rekha Nayak',
    studentId: '2201289190',
    studentEmail: 'smruti.n@bput-campus.ac.in',
    hostelRoom: 'Mahanadi Hall · Block C · Room 112',
    createdAt: '2026-09-30T15:30:00Z',
    updatedAt: '2026-10-01T03:00:00Z',
    status: 'assigned',
    priority: 'low',
    slaHours: 48,
    assignedStaff: 'Chef Debendra Jena',
    assignedRole: 'Catering Officer',
    description: 'Rice and Dalma were lukewarm during Wednesday dinner around 8:45 PM. Rotis took 20 minutes to refill.',
    details: {
      mealType: 'dinner',
      messFeedbackCategory: 'Food Temperature & Serving Delay',
      rating: 2,
    },
    timeline: [
      { id: 'TL-16', timestamp: '2026-09-30T15:30:00Z', actor: 'Smruti Rekha Nayak', role: 'Student', action: 'Feedback Logged' },
      { id: 'TL-17', timestamp: '2026-10-01T03:00:00Z', actor: 'Chef Debendra Jena', role: 'Staff', action: 'Assigned', note: 'Instructed counter staff to maintain warmer bain-maries temperature at 70°C.' }
    ],
    internalNotes: []
  },

  // 8. Fee / Dues Query
  {
    id: 'REQ-1029',
    title: 'Discrepancy in Hostel Caution Deposit Refund Status',
    category: 'fee_dues',
    department: 'Finance & Accounts Office',
    studentName: 'Tanmaya Dash',
    studentId: '2101289050',
    studentEmail: 'tanmaya.d@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Room 402',
    createdAt: '2026-09-27T11:00:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
    status: 'closed',
    priority: 'low',
    slaHours: 72,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Accounts Officer',
    description: 'ERP portal shows caution fee clearance pending, although no-dues receipt #AC-8891 was submitted in May.',
    details: {
      feeCategory: 'Hostel Caution Money & No-Dues',
      sampleBalance: '₹5,000 Caution Deposit (Demo Record)',
      academicTerm: 'Final Year Clearance',
    },
    timeline: [
      { id: 'TL-18', timestamp: '2026-09-27T11:00:00Z', actor: 'Tanmaya Dash', role: 'Student', action: 'Query Submitted' },
      { id: 'TL-19', timestamp: '2026-09-28T14:00:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Resolved', note: 'Reconciled manual receipt #AC-8891 against bank ledger. Status updated to Cleared.' },
      { id: 'TL-20', timestamp: '2026-09-28T14:30:00Z', actor: 'Tanmaya Dash', role: 'Student', action: 'Closed by Student', note: 'Confirmed resolved in ERP portal.' }
    ],
    internalNotes: []
  },

  // 9. Maintenance: Broken fan regulator in Mahanadi Hall
  {
    id: 'REQ-1046',
    title: 'Ceiling fan regulator stuck at speed 1 in room M-108',
    category: 'maintenance',
    department: 'Hostel Maintenance (FretBox Sync)',
    studentName: 'Priyabrata Mishra',
    studentId: '2201289132',
    studentEmail: 'priyabrata.m@bput-campus.ac.in',
    hostelRoom: 'Mahanadi Hall · Block A · Room 108',
    createdAt: '2026-09-30T17:15:00Z',
    updatedAt: '2026-10-01T05:00:00Z',
    status: 'assigned',
    priority: 'low',
    slaHours: 48,
    assignedStaff: 'Er. Ramesh Chandra Patra',
    assignedRole: 'Electrical Maintenance',
    description: 'Switchboard step regulator knob is broken, cannot adjust fan speed during warm afternoons.',
    details: {
      issueSubcategory: 'Electrical & Lighting',
      hostelBlock: 'Block A',
      roomNumber: '108',
      hasImageAttachment: false,
    },
    timeline: [
      { id: 'TL-21', timestamp: '2026-09-30T17:15:00Z', actor: 'Priyabrata Mishra', role: 'Student', action: 'Request Submitted' },
      { id: 'TL-22', timestamp: '2026-10-01T05:00:00Z', actor: 'Er. Ramesh Chandra Patra', role: 'Supervisor', action: 'Assigned', note: 'Electrician rostered for afternoon rounds.' }
    ],
    internalNotes: []
  },

  // 10. Bonafide for Passport Application
  {
    id: 'REQ-1041',
    title: 'Study Certificate & Address Proof for Regional Passport Office',
    category: 'bonafide',
    department: 'Registrar Academic Section',
    studentName: 'Deepak Kumar Barik',
    studentId: '2201289075',
    studentEmail: 'deepak.b@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block C · Room 220',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-30T14:00:00Z',
    status: 'resolved',
    priority: 'medium',
    slaHours: 48,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Registrar Academic Section',
    description: 'Requires passport verification letter mentioning hostel residence address and current enrollment.',
    details: {
      purpose: 'Passport Application at PSK Bhubaneswar',
      deliveryPreference: 'counter',
      academicYear: '2026-2027',
      erpFeeStatus: 'Cleared',
    },
    timeline: [
      { id: 'TL-23', timestamp: '2026-09-29T10:00:00Z', actor: 'Deepak Kumar Barik', role: 'Student', action: 'Submitted' },
      { id: 'TL-24', timestamp: '2026-09-30T14:00:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Resolved', note: 'Document stamped and kept at Window 3 for physical counter pickup.' }
    ],
    internalNotes: []
  },

  // 11. Overdue Item (Approaching SLA / Overdue Demo)
  {
    id: 'REQ-1031',
    title: 'Water filter cartridge replacement on 2nd Floor Block A',
    category: 'maintenance',
    department: 'Hostel Maintenance (FretBox Sync)',
    studentName: 'Rahul Nayak',
    studentId: '2201289155',
    studentEmail: 'rahul.n@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Block A · 2nd Floor',
    createdAt: '2026-09-27T08:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
    status: 'submitted',
    priority: 'urgent',
    slaHours: 24,
    description: 'RO water purifier TDS reading is over 350 and indicator light is blinking red. Drinking water supply affected for 40 students.',
    details: {
      issueSubcategory: 'Drinking Water & RO Plant',
      hostelBlock: 'Block A',
      roomNumber: '2nd Floor Water Station',
      hasImageAttachment: false,
    },
    timeline: [
      { id: 'TL-25', timestamp: '2026-09-27T08:00:00Z', actor: 'Rahul Nayak', role: 'Student', action: 'Submitted' }
    ],
    internalNotes: [
      { id: 'IN-5', timestamp: '2026-09-29T10:00:00Z', author: 'Prof. S. K. Mohapatra', text: 'Flagged overdue during morning administrative audit. Vendor PO pending.' }
    ]
  },

  // 12. Leave & Gate pass - Approved and ready for gate
  {
    id: 'REQ-1048',
    title: 'Emergency Medical Visit to Apollo Hospital Bhubaneswar',
    category: 'leave_gatepass',
    department: 'Hostel Warden & Security Gate',
    studentName: 'Manish Swain',
    studentId: '2201289108',
    studentEmail: 'manish.s@bput-campus.ac.in',
    hostelRoom: 'Mahanadi Hall · Block B · Room 215',
    createdAt: '2026-09-30T18:00:00Z',
    updatedAt: '2026-09-30T19:00:00Z',
    status: 'in_progress',
    priority: 'urgent',
    slaHours: 4,
    assignedStaff: 'Dr. P. Dash',
    assignedRole: 'Hostel Warden',
    description: 'Dental surgery follow-up appointment at Apollo Hospital.',
    details: {
      departureDate: '2026-10-01',
      departureTime: '09:00',
      returnDate: '2026-10-01',
      returnTime: '17:00',
      destination: 'Apollo Hospital, Sainik School Road, Bhubaneswar',
      reason: 'Medical checkup',
      emergencyContact: '+91 98612 99887 (Mother)',
      wardenApproved: true,
      gateLoggedOut: true,
      gateLoggedIn: false,
    },
    timeline: [
      { id: 'TL-26', timestamp: '2026-09-30T18:00:00Z', actor: 'Manish Swain', role: 'Student', action: 'Submitted' },
      { id: 'TL-27', timestamp: '2026-09-30T19:00:00Z', actor: 'Dr. P. Dash', role: 'Warden', action: 'Approved', note: 'Medical prescription verified. Digital gate pass clearance generated.' },
      { id: 'TL-28', timestamp: '2026-10-01T09:05:00Z', actor: 'Mr. Binod Behera', role: 'Security', action: 'Departure Logged at Main Gate 1', system: 'Gate QR Scanner' }
    ],
    internalNotes: []
  },

  // 13. Fee / Dues Query (Sample balance)
  {
    id: 'REQ-1049',
    title: 'Semester 6 Examination Fee Payment Receipt Missing in ERP',
    category: 'fee_dues',
    department: 'Finance & Accounts Office',
    studentName: 'Lipsa Pradhan',
    studentId: '2201289094',
    studentEmail: 'lipsa.p@bput-campus.ac.in',
    hostelRoom: 'Mahanadi Hall · Room 306',
    createdAt: '2026-09-30T20:00:00Z',
    updatedAt: '2026-10-01T01:30:00Z',
    status: 'assigned',
    priority: 'high',
    slaHours: 48,
    assignedStaff: 'Mrs. Sunita Mohanty',
    assignedRole: 'Accounts Officer',
    description: 'UPI transaction of ₹2,200 successful via SBI Collect on Sept 29, but ERP portal still displays Unpaid status.',
    details: {
      feeCategory: 'BPUT Semester Examination Fees',
      sampleBalance: '₹2,200 (Transaction Ref: SBIC-992140)',
      academicTerm: '6th Semester 2026',
    },
    timeline: [
      { id: 'TL-29', timestamp: '2026-09-30T20:00:00Z', actor: 'Lipsa Pradhan', role: 'Student', action: 'Submitted' },
      { id: 'TL-30', timestamp: '2026-10-01T01:30:00Z', actor: 'Mrs. Sunita Mohanty', role: 'Staff', action: 'Assigned', note: 'Sent SBI Collect transaction scroll to Finance desk for manual reconciliation.' }
    ],
    internalNotes: []
  },

  // 14. Mess feedback: Sunday Special Menu
  {
    id: 'REQ-1033',
    title: 'Request to introduce seasonal Odia dishes (Chhena Poda / Dalma variation)',
    category: 'mess',
    department: 'Central Mess Committee',
    studentName: 'Ashish Mohapatra',
    studentId: '2201289033',
    studentEmail: 'ashish.m@bput-campus.ac.in',
    hostelRoom: 'Brahmaputra Hall · Room 118',
    createdAt: '2026-09-28T05:00:00Z',
    updatedAt: '2026-09-29T12:00:00Z',
    status: 'closed',
    priority: 'low',
    slaHours: 72,
    assignedStaff: 'Chef Debendra Jena',
    assignedRole: 'Catering Officer',
    description: 'Suggestion from Hostel Council for Sunday festive dinners during Durga Puja season.',
    details: {
      mealType: 'dinner',
      messFeedbackCategory: 'Menu Suggestion',
      rating: 5,
    },
    timeline: [
      { id: 'TL-31', timestamp: '2026-09-28T05:00:00Z', actor: 'Ashish Mohapatra', role: 'Student', action: 'Submitted' },
      { id: 'TL-32', timestamp: '2026-09-29T12:00:00Z', actor: 'Chef Debendra Jena', role: 'Staff', action: 'Closed', note: 'Approved by Mess Committee. Special Chhena Poda dessert scheduled for upcoming Sunday dinner rotation.' }
    ],
    internalNotes: []
  }
];

export const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'NOT-201',
    title: 'Water Supply Riser Valve Maintenance: Brahmaputra Block B',
    content: 'Due to scheduled solder repairs on the main riser line (INC-408), overhead water supply to Block B 2nd and 3rd floors will experience intermittent low pressure between 10:30 AM and 01:30 PM today. Alternate backup tanks on the ground floor are open.',
    category: 'hostel',
    priority: 'urgent',
    targetAudience: {
      type: 'hostel',
      label: 'Brahmaputra Hall (Block B Residents)',
      explanation: 'You are receiving this notice because your allocated residence is Brahmaputra Hall · Block B.'
    },
    publishedAt: '2026-10-01T04:45:00Z',
    author: 'Er. Ramesh Chandra Patra',
    authorRole: 'Chief Facilities & Hostel Works Supervisor',
    deliveryStats: {
      inAppDelivered: 184,
      smsSimulated: 172,
      readCount: 148,
      acknowledgedCount: 92,
    },
    channels: ['in_app', 'sms', 'push'],
    isRead: false,
  },
  {
    id: 'NOT-202',
    title: 'BPUT End-Semester Registration & Form Fill-up Schedule (Spring 2026)',
    content: 'All eligible regular and back-paper students of 6th & 8th Semesters must verify their registered subjects on the University ERP portal before October 12, 2026. Hall tickets will be auto-generated for students with ≥75% cumulative biometric attendance.',
    category: 'academic',
    priority: 'important',
    targetAudience: {
      type: 'year',
      label: '3rd & 4th Year B.Tech Students',
      explanation: 'Targeted to 6th and 8th semester undergraduates preparing for University end-term registration.'
    },
    publishedAt: '2026-09-30T11:00:00Z',
    expiresAt: '2026-10-12T23:59:00Z',
    author: 'Prof. S. K. Mohapatra',
    authorRole: 'Dean of Student Welfare & Central Ops',
    deliveryStats: {
      inAppDelivered: 640,
      smsSimulated: 610,
      readCount: 520,
      acknowledgedCount: 380,
    },
    channels: ['in_app', 'push'],
    isRead: true,
  },
  {
    id: 'NOT-203',
    title: 'Mandatory Warden Gate Pass Verification Window for Long Weekend',
    content: 'Hostellers applying for weekend leave (Oct 2 - Oct 5) must submit applications via CampusFlow before 04:00 PM on Thursday. Unapproved manual slips will strictly NOT be honored by security personnel at Main Gate 1.',
    category: 'hostel',
    priority: 'important',
    targetAudience: {
      type: 'all',
      label: 'All Campus Boarders (Mahanadi & Brahmaputra)',
      explanation: 'Applicable to all residential students holding hostel allotments.'
    },
    publishedAt: '2026-09-29T16:00:00Z',
    author: 'Dr. P. Dash',
    authorRole: 'Hostel Warden & Proctorial Board',
    deliveryStats: {
      inAppDelivered: 1120,
      smsSimulated: 980,
      readCount: 890,
      acknowledgedCount: 645,
    },
    channels: ['in_app', 'sms'],
    isRead: true,
  },
  {
    id: 'NOT-204',
    title: 'Computer Science Department: Lab Rescheduling for Friday Oct 2',
    content: 'Due to the Gandhi Jayanti National Holiday on Friday Oct 2, Friday afternoon practical sessions for CSE 6th Sem (Web Tech Lab & Compiler Lab) are compensated on Saturday Oct 10 from 09:30 AM.',
    category: 'academic',
    priority: 'normal',
    targetAudience: {
      type: 'branch',
      label: 'B.Tech Computer Science & Engineering',
      explanation: 'Targeted to CSE Department faculty and enrolled students.'
    },
    publishedAt: '2026-09-29T09:30:00Z',
    author: 'Mrs. Sunita Mohanty',
    authorRole: 'Superintendent, Academic Wing',
    deliveryStats: {
      inAppDelivered: 240,
      smsSimulated: 220,
      readCount: 205,
      acknowledgedCount: 160,
    },
    channels: ['in_app'],
    isRead: true,
  },
  {
    id: 'NOT-205',
    title: 'Mess Committee Meeting & October Festive Menu Review',
    content: 'Hostel student representatives and wing coordinators are invited to the Mess Advisory Committee meeting this Thursday at 05:30 PM in the Central Conference Hall to finalize the Durga Puja holiday menu roster.',
    category: 'administrative',
    priority: 'normal',
    targetAudience: {
      type: 'all',
      label: 'All Students & Wing Prefects',
      explanation: 'Open public notice for residential hostel feedback.'
    },
    publishedAt: '2026-09-28T14:00:00Z',
    author: 'Chef Debendra Jena',
    authorRole: 'Chief Catering Officer',
    deliveryStats: {
      inAppDelivered: 890,
      smsSimulated: 0,
      readCount: 420,
      acknowledgedCount: 110,
    },
    channels: ['in_app'],
    isRead: false,
  },
  {
    id: 'NOT-206',
    title: 'Notice regarding National Scholarship Portal (NSP) Bonafide Clearance',
    content: 'Students requiring institutional seals and fee breakups for state/central scholarships must apply via CampusFlow Bonafide Workflow. Physical queues at Registrar Window 2 are decommissioned to prevent document loss.',
    category: 'administrative',
    priority: 'important',
    targetAudience: {
      type: 'all',
      label: 'All Registered Students',
      explanation: 'General administrative procedural update.'
    },
    publishedAt: '2026-09-27T10:00:00Z',
    author: 'Mrs. Sunita Mohanty',
    authorRole: 'Registrar Academic Section',
    deliveryStats: {
      inAppDelivered: 1250,
      smsSimulated: 890,
      readCount: 1040,
      acknowledgedCount: 710,
    },
    channels: ['in_app', 'sms'],
    isRead: true,
  }
];

export const TODAY_TIMETABLE: TimetableSlot[] = [
  {
    id: 'TT-01',
    time: '08:30 – 09:25',
    subject: 'Compiler Design',
    code: 'CS-301',
    room: 'Hall C-102 (Core Academic Block)',
    faculty: 'Dr. A. K. Behera',
    type: 'Theory',
    status: 'scheduled',
  },
  {
    id: 'TT-02',
    time: '09:30 – 10:25',
    subject: 'Distributed Systems & Cloud',
    code: 'CS-303',
    room: 'Hall C-102',
    faculty: 'Prof. Manas Ranjan Panda',
    type: 'Theory',
    status: 'scheduled',
  },
  {
    id: 'TT-03',
    time: '10:45 – 11:40',
    subject: 'Web Technologies & Architecture',
    code: 'CS-305',
    room: 'Lecture Theatre 2',
    faculty: 'Dr. Sharmistha Pattnaik',
    type: 'Theory',
    status: 'scheduled',
  },
  {
    id: 'TT-04',
    time: '11:45 – 12:40',
    subject: 'Engineering Economics & Ethics',
    code: 'HS-301',
    room: 'Hall C-104',
    faculty: 'Dr. B. K. Choudhury',
    type: 'Theory',
    status: 'scheduled',
  },
  {
    id: 'TT-05',
    time: '14:00 – 16:30',
    subject: 'Web Technologies & Full Stack Lab',
    code: 'CS-312',
    room: 'Software Systems Lab 5 (Ground Floor)',
    faculty: 'Dr. Sharmistha Pattnaik & TAs',
    type: 'Lab',
    status: 'rescheduled',
    note: 'Room updated from Lab 3 to Lab 5 as per REQ-1035 resolution'
  }
];

export const WEEKLY_MESS_MENU: MessMenuDay[] = [
  {
    day: 'Monday',
    breakfast: 'Idli, Sambar, Coconut Chutney, Banana, Tea/Coffee',
    lunch: 'Steamed Rice, Authentic Odia Dalma, Potol Rasa, Crispy Papad, Curd',
    snacks: 'Vegetable Cutlet, Tomato Sauce, Hot Tea',
    dinner: 'Roti, Paneer Makhani / Egg Curry, Jeera Rice, Dal Tadka, Salad',
  },
  {
    day: 'Tuesday',
    breakfast: 'Puri, Aloo Chana Tarkari, Jalebi, Tea/Coffee',
    lunch: 'Rice, Rohi Fish Curry (Besara) / Chhena Kofta, Yellow Dal, Bhindi Fry',
    snacks: 'Poha with Roasted Peanuts, Green Chutney, Tea',
    dinner: 'Phulka Roti, Mix Veg Handi, Moong Dal, Gulab Jamun',
  },
  {
    day: 'Wednesday',
    breakfast: 'Uttapam, Tomato Chutney, Sprouts Chaat, Tea/Coffee',
    lunch: 'Rice, Dal Fry, Aloo Bhaja, Dahi Baigana, Salad, Papad',
    snacks: 'Samosa (1 pc), Muri Mixture, Lemon Chai',
    dinner: 'Tandoori Roti, Chicken Kassa / Kadai Paneer, Veg Pulao, Dal, Sweet Curd',
  },
  {
    day: 'Thursday (Vegetarian)',
    breakfast: 'Methi Paratha, Plain Curd, Pickle, Tea/Coffee',
    lunch: 'Bhubaneswar Style Khichdi, Besan Kadhi, Khatta (Tomato-Khajur), Papad, Fried Aloo',
    snacks: 'Upma, Sambar, Filter Coffee',
    dinner: 'Phulka, Dal Makhani, Shahi Paneer, Jeera Rice, Rasgulla (2 pcs)',
    specialNote: 'Pure Vegetarian Menu across all dining halls'
  },
  {
    day: 'Friday',
    breakfast: 'Masala Dosa, Sambar, Coconut Chutney, Tea',
    lunch: 'Steamed Basmati Rice, Machha Chhencheda (Fish) / Paneer Butter Masala, Masoor Dal',
    snacks: 'Chura Upma, Roasted Badam, Milk Tea',
    dinner: 'Roti, Rajma Masala, Steamed Rice, Boondi Raita, Seasonal Fruit',
  },
  {
    day: 'Saturday',
    breakfast: 'Aloo Paratha, Butter Cubes, Dahi, Pickle, Tea',
    lunch: 'Lemon Rice, Sambar, Dry Aloo Jeera, Plain Rice, Papad',
    snacks: 'Biscuits & Onion Pakoda, Ginger Tea',
    dinner: 'Naan, Paneer Do Pyaza / Mutton Curry (Optional Coupon), Veg Biryani, Ice Cream',
  },
  {
    day: 'Sunday',
    breakfast: 'Chole Bhature, Sweet Lassi, Banana',
    lunch: 'Special Dum Biryani (Chicken / Veg Soya), Mirchi Ka Salan, Raita, Crispy Onion',
    snacks: 'Maggi Noodles / Veg Sandwich, Tea',
    dinner: 'Phulka, Special Dalma, Aloo Posto, Pulao, Odia Chhena Poda Sweet',
    specialNote: 'Festive Special Dinner sponsored by Central Mess Council'
  }
];

export const CAMPUS_ALERTS: CampusAlert[] = [
  {
    id: 'ALT-01',
    title: 'Water Pressure Notice',
    level: 'warning',
    message: 'Brahmaputra Block B overhead line repair under active execution (INC-408). Alternate tanks operational.',
    timestamp: 'Updated 20 mins ago',
    department: 'Estate Maintenance'
  },
  {
    id: 'ALT-02',
    title: 'End-Sem Fee Portal Open',
    level: 'info',
    message: 'BPUT regular semester exam fee reconciliation active. Verify ERP ledger before Oct 12.',
    timestamp: 'Valid till Oct 12',
    department: 'Academic Section'
  }
];

export const SYSTEM_INTEGRATIONS: SystemIntegrationInfo[] = [
  {
    id: 'int-fretbox',
    name: 'FretBox Campus OS',
    logoText: 'FB',
    purpose: 'Hostel room allocations, maintenance ticketing, warden approvals & mess feedback synchronization.',
    status: 'Connected (Demo)',
    health: 'healthy',
    dataAvailable: [
      'Student room mapping (Block/Room)',
      'Maintenance ticket statuses & SLA countdowns',
      'Hostel warden roster & approval webhooks',
      'Daily mess menu catalog'
    ],
    actionsSupported: [
      'Submit maintenance incident',
      'Check for duplicate complaints in same wing',
      'Sync warden gate pass approval',
      'Post student dining feedback'
    ],
    lastSimulatedSync: 'Just now (12s ago)',
    syncLatencyMs: 38,
    endpointUrl: 'https://api.fretbox.internal/v2/campus/bput-rourkela'
  },
  {
    id: 'int-erp',
    name: 'College ERP Core (Oracle/SAP)',
    logoText: 'ERP',
    purpose: 'Official student registration master, semester tuition fees, caution money balances, and bonafide certification ledger.',
    status: 'Connected (Demo)',
    health: 'healthy',
    dataAvailable: [
      'Official student name & registration number (2201289140)',
      'Enrolled branch, semester & academic status',
      'Semester fee payment clearance records',
      'Library & laboratory no-dues status'
    ],
    actionsSupported: [
      'Verify student eligibility & active enrollment',
      'Validate fee payment receipt transactions',
      'Issue tamper-verifiable digital bonafide reference number',
      'Sync no-dues clearance across departments'
    ],
    lastSimulatedSync: '1 min ago',
    syncLatencyMs: 82,
    endpointUrl: 'https://erp.bput-campus.ac.in/api/v1/student-services'
  },
  {
    id: 'int-lms',
    name: 'Academic LMS & Class Scheduler',
    logoText: 'LMS',
    purpose: 'Official timetable schedules, faculty allocations, course syllabus, and lecture room clash detection.',
    status: 'Connected (Demo)',
    health: 'healthy',
    dataAvailable: [
      'Master class timetable & room bookings',
      'Faculty assigned to course codes',
      'Lab session batch rosters (Batch B1, B2)',
      'Official holiday and compensatory class schedules'
    ],
    actionsSupported: [
      'Fetch real-time daily class timetable',
      'Log room allocation clash queries to Academic Office',
      'Broadcast class reschedule notifications to students'
    ],
    lastSimulatedSync: '4 mins ago',
    syncLatencyMs: 45,
    endpointUrl: 'https://lms.bput-campus.ac.in/rest/timetable'
  },
  {
    id: 'int-office',
    name: 'Central Registrar & Dean Office',
    logoText: 'RO',
    purpose: 'Manual administrative review, physical certificate counter issuance, proctorial inquiries, and institutional stamp sign-off.',
    status: 'Connected (Demo)',
    health: 'healthy',
    dataAvailable: [
      'Desk officer queue assignment',
      'Physical counter pickup slot schedules',
      'Digital signature audit trails',
      'Dean office circular approvals'
    ],
    actionsSupported: [
      'Route document requests for administrative review',
      'Mark certificate ready for digital download or physical window collection',
      'Add internal administrative audit notes'
    ],
    lastSimulatedSync: '2 mins ago',
    syncLatencyMs: 60,
    endpointUrl: 'https://office.bput-campus.ac.in/workflow/desk-bridge'
  },
  {
    id: 'int-security',
    name: 'Campus Gate & Access Terminal',
    logoText: 'GATE',
    purpose: 'Physical gate access control, barcode/QR scanner verification for student departure/entry, and warden authorization sync.',
    status: 'Connected (Demo)',
    health: 'healthy',
    dataAvailable: [
      'Gate-1 and Gate-2 guard on-duty status',
      'Approved gate passes for current 24-hour cycle',
      'Real-time student tap-out and tap-in timestamps',
      'Overstay / curfew breach flags'
    ],
    actionsSupported: [
      'Verify student QR gate pass instantly at security post',
      'Log exit timestamp upon guard scan',
      'Log entry timestamp upon campus return',
      'Auto-close verified gate pass workflow'
    ],
    lastSimulatedSync: '30s ago',
    syncLatencyMs: 24,
    endpointUrl: 'https://security.bput-campus.ac.in/terminals/gate1'
  },
  {
    id: 'int-sms',
    name: 'National SMS & Telecom Gateway',
    logoText: 'SMS',
    purpose: 'Low-bandwidth campus communication, simulated SMS push notifications, and 2-way feature-phone SMS query bot (FB MENU, FB STATUS).',
    status: 'Simulated',
    health: 'healthy',
    dataAvailable: [
      'Registered parent and student contact numbers',
      'Shortcode routing table (56161 / FB-BPUT)',
      'SMS delivery queue and latency logs'
    ],
    actionsSupported: [
      'Process incoming student SMS queries (FB STATUS, FB MENU)',
      'Simulate emergency hostel SMS broadcasts',
      'Simulate automated parent gate pass departure alerts'
    ],
    lastSimulatedSync: 'Active Simulation',
    syncLatencyMs: 15,
    endpointUrl: 'simulated://sms-gateway.internal/shortcode/56161'
  }
];

export const WORKFLOW_DEFINITIONS = [
  {
    id: 'wf-bonafide',
    title: 'Bonafide Certificate Issuance',
    tagline: 'Student intent → ERP Dues Check → Office Seal → Digital Delivery',
    systemInvolved: ['College ERP', 'CampusFlow Core', 'Registrar Office'],
    typicalSla: '24–48 hours',
    description: 'Autonomous eligibility validation against ERP ledger followed by single-click administrative sign-off.'
  },
  {
    id: 'wf-maintenance',
    title: 'Hostel Maintenance & Incident Clustering',
    tagline: 'Complaint → Duplicate Detection → Block Incident → Contractor SLA → Verified Completion',
    systemInvolved: ['FretBox OS', 'CampusFlow Core', 'Works & Maintenance'],
    typicalSla: '4–24 hours',
    description: 'Detects recurring complaints (e.g. water leaks) in the same block, merges duplicate complaints into a master incident, and coordinates contractor repairs.'
  },
  {
    id: 'wf-gatepass',
    title: 'Hostel Leave & Gate Security Pass',
    tagline: 'Leave Request → Warden Authorization → Digital Pass → Security Terminal Scan → Verified Return',
    systemInvolved: ['FretBox OS', 'Hostel Warden', 'Gate Security Terminal'],
    typicalSla: '2–6 hours',
    description: 'Multi-party approval chain preventing paper slip forgery while recording live physical entry and exit timestamps.'
  }
];

export const INITIAL_CERTIFICATES: BonafideCertificate[] = [
  {
    id: 'BPUT-BC-2026-8491',
    requestId: 'REQ-1040',
    studentId: '2201289140',
    studentName: 'Udit Kumar Tripathy',
    studentEmail: 'udit.tripathy@bput-campus.ac.in',
    programme: 'Bachelor of Technology in Computer Science & Engineering',
    department: 'Department of Computer Science & Engineering',
    academicYear: '2025–2026',
    semester: '6th Semester (3rd Year)',
    purpose: 'Smart India Hackathon 2026 & National Paper Presentation Participation',
    issueDate: '2026-09-28',
    validUntil: '2027-09-27',
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
    qrCodeUrl: '/verify/BPUT-BC-2026-8491',
    downloadCount: 1,
    lastDownloadedAt: '2026-09-28T16:15:00Z',
    isDemoPrototype: true
  },
  {
    id: 'BPUT-BC-2026-7215',
    requestId: 'REQ-1025',
    studentId: '2201289108',
    studentName: 'Manish Swain',
    studentEmail: 'manish.s@bput-campus.ac.in',
    programme: 'Bachelor of Technology in Mechanical Engineering',
    department: 'Department of Mechanical Engineering',
    academicYear: '2025–2026',
    semester: '6th Semester (3rd Year)',
    purpose: 'Indian Oil Corporation Limited (IOCL) Summer Internship Sponsorship',
    issueDate: '2026-09-20',
    validUntil: '2027-09-19',
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
    qrCodeUrl: '/verify/BPUT-BC-2026-7215',
    downloadCount: 2,
    lastDownloadedAt: '2026-09-21T10:00:00Z',
    isDemoPrototype: true
  },
  {
    id: 'BPUT-BC-2026-6102',
    requestId: 'REQ-1018',
    studentId: '2201289064',
    studentName: 'Biswajit Sahoo',
    studentEmail: 'biswajit.s@bput-campus.ac.in',
    programme: 'Bachelor of Technology in Electrical Engineering',
    department: 'Department of Electrical Engineering',
    academicYear: '2025–2026',
    semester: '6th Semester (3rd Year)',
    purpose: 'State Bank of India Scholar Education Loan Subsidy Verification',
    issueDate: '2026-09-15',
    validUntil: '2027-09-14',
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
    qrCodeUrl: '/verify/BPUT-BC-2026-6102',
    downloadCount: 1,
    lastDownloadedAt: '2026-09-16T12:00:00Z',
    isDemoPrototype: true
  }
];
