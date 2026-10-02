/**
 * Shared Campus Locations Dataset for CampusFlow
 * Fictional University Campus: Biju Patnaik University of Technology (Demo Campus)
 * Deterministic vector coordinates on a 1200x800 campus grid
 */

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  category: 'academic' | 'residential' | 'laboratory' | 'administrative' | 'amenities' | 'sports_outdoor' | 'security_medical';
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floorCount: number;
  departments: string[];
  facilities: string[];
  openHours: string;
  contactPerson?: string;
  contactPhone?: string;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  // 1. Academic Block A
  {
    id: 'acad_block_a',
    name: 'Academic Block A (Ramanujan Complex)',
    code: 'ACAD-A',
    category: 'academic',
    description: 'Premier lecture halls, smart seminar halls, and Computer Science & Information Technology faculty chambers.',
    x: 220,
    y: 190,
    width: 140,
    height: 100,
    floorCount: 4,
    departments: ['Computer Science & Engineering', 'Information Technology', 'Applied Mathematics'],
    facilities: ['Lecture Theatres 1-8', 'Turing Seminar Hall', 'Faculty Lounge', 'Departmental Server Room'],
    openHours: '08:00 AM – 07:00 PM',
    contactPerson: 'Dr. S. Mohanty (HOD CSE)',
    contactPhone: '+91 661 2482 120'
  },

  // 2. Academic Block B
  {
    id: 'acad_block_b',
    name: 'Academic Block B (Visvesvaraya Wing)',
    code: 'ACAD-B',
    category: 'academic',
    description: 'Mechanical, Civil, and Electrical engineering classrooms, design drawing studios, and faculty offices.',
    x: 410,
    y: 190,
    width: 140,
    height: 100,
    floorCount: 4,
    departments: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
    facilities: ['Drawing Studios A & B', 'Classrooms 201-216', 'CAD Design Lab', 'Conference Suite'],
    openHours: '08:00 AM – 07:00 PM',
    contactPerson: 'Prof. K. C. Nayak (Dean Academics)',
    contactPhone: '+91 661 2482 122'
  },

  // 3. Central Laboratories
  {
    id: 'central_labs',
    name: 'Central Laboratories Complex',
    code: 'LAB-CENTRAL',
    category: 'laboratory',
    description: 'High-performance computing clusters, VLSI design bays, robotics arena, and advanced physics/chemistry research labs.',
    x: 600,
    y: 190,
    width: 150,
    height: 100,
    floorCount: 3,
    departments: ['Central Research Division', 'Electronics & Telecom', 'Material Sciences'],
    facilities: ['AI & Cloud Computing Bay', 'Robotics Arena', 'Materials Testing Unit', '3D Fabrication Lab'],
    openHours: '08:30 AM – 09:00 PM',
    contactPerson: 'Er. Animesh Sahoo (Chief Lab Officer)',
    contactPhone: '+91 661 2482 135'
  },

  // 4. Student Hostel A
  {
    id: 'hostel_block_a',
    name: 'Student Hostel A (Brahmaputra Hall)',
    code: 'HOSTEL-A',
    category: 'residential',
    description: 'Primary residential hall for senior engineering undergraduate students with 3 wings and in-house reading room.',
    x: 210,
    y: 470,
    width: 150,
    height: 120,
    floorCount: 4,
    departments: ['Hostel Administration', 'Student Welfare Council'],
    facilities: ['Rooms 101-440', 'Study Room', 'Indoor Games Room', 'Laundry Yard', 'Solar Geysers'],
    openHours: 'Open 24/7 (Gate Curfew: 10:00 PM)',
    contactPerson: 'Dr. P. Dash (Hostel Warden)',
    contactPhone: '+91 94371 88200'
  },

  // 5. Student Hostel B
  {
    id: 'hostel_block_b',
    name: 'Student Hostel B (Mahanadi Hall)',
    code: 'HOSTEL-B',
    category: 'residential',
    description: 'Junior undergraduate and freshman residential hall with strict anti-ragging security and dedicated proctorial oversight.',
    x: 410,
    y: 470,
    width: 150,
    height: 120,
    floorCount: 4,
    departments: ['Freshman Mentorship Cell', 'Hostel Security Wing'],
    facilities: ['Rooms 101-420', 'Common Room with TV', 'Wi-Fi Study Cell', 'Resident Doctor Post'],
    openHours: 'Open 24/7 (Gate Curfew: 09:30 PM)',
    contactPerson: 'Prof. R. N. Rath (Associate Warden)',
    contactPhone: '+91 94371 88201'
  },

  // 6. Central University Library
  {
    id: 'central_library',
    name: 'Biju Patnaik Central Library',
    code: 'LIB-CENTRAL',
    category: 'administrative',
    description: 'Central digital repository with 45,000+ volumes, IEEE/Elsevier e-journal terminals, and air-conditioned silent study cubicles.',
    x: 600,
    y: 340,
    width: 130,
    height: 90,
    floorCount: 3,
    departments: ['Library & Documentation Wing', 'Digital Archive Service'],
    facilities: ['24/7 Reading Hall', 'Digital Lab (50 PCs)', 'Photocopy & Binding Desk', 'Audio-Visual Room'],
    openHours: '08:00 AM – 11:00 PM (Reading Room 24/7)',
    contactPerson: 'Mrs. Jayanti Behera (Librarian)',
    contactPhone: '+91 661 2482 140'
  },

  // 7. Administration Block
  {
    id: 'admin_block',
    name: 'Administration Block (Prashasan Bhavan)',
    code: 'ADMIN-BLOCK',
    category: 'administrative',
    description: 'Offices of the Vice Chancellor, Registrar, Dean of Student Welfare, Bonafide Certificate counter, and Finance Division.',
    x: 410,
    y: 40,
    width: 170,
    height: 95,
    floorCount: 3,
    departments: ['Registrar Office', 'Dean of Student Welfare', 'Finance & Accounts', 'Exam Cell'],
    facilities: ['Bonafide Counter (Window 3)', 'Fee Clearance Desk', 'Boardroom', 'VC Secretariat'],
    openHours: '09:30 AM – 05:30 PM (Mon-Sat)',
    contactPerson: 'Prof. S. K. Mohapatra (Dean SW)',
    contactPhone: '+91 661 2482 101'
  },

  // 8. Canteen & Mess
  {
    id: 'canteen_mess',
    name: 'Central Dining Hall & Student Canteen',
    code: 'CANTEEN-MESS',
    category: 'amenities',
    description: 'Central dining facility serving breakfast, lunch, snacks, and dinner with daily nutritious menus and retail cafeteria.',
    x: 610,
    y: 480,
    width: 140,
    height: 100,
    floorCount: 2,
    departments: ['Central Mess Committee', 'Food Safety Inspection Unit'],
    facilities: ['Dining Hall (800 Seats)', 'Express Coffee Kiosk', 'Juice Bar', 'FSSAI Certified Kitchen'],
    openHours: '07:00 AM – 10:00 PM',
    contactPerson: 'Chef Debendra Jena (Chief Catering Officer)',
    contactPhone: '+91 94380 99112'
  },

  // 9. Sports Ground
  {
    id: 'sports_ground',
    name: 'Kalinga Athletic Pavilion & Multi-Sports Ground',
    code: 'SPORTS-GROUND',
    category: 'sports_outdoor',
    description: 'Full-size cricket/football turf with 400m running track, floodlit basketball and volleyball courts, and gymnasium.',
    x: 820,
    y: 370,
    width: 250,
    height: 220,
    floorCount: 1,
    departments: ['Department of Physical Education', 'Sports Council'],
    facilities: ['Cricket Pitch', 'Football Field', 'Basketball Court', 'Open Pavilion', 'Indoor Fitness Gym'],
    openHours: '05:30 AM – 08:30 PM',
    contactPerson: 'Coach B. K. Samal (Sports Director)',
    contactPhone: '+91 94372 55100'
  },

  // 10. Parking Bay
  {
    id: 'parking_bay',
    name: 'Central Campus Parking Bay',
    code: 'PARKING-BAY',
    category: 'amenities',
    description: 'Covered two-wheeler stand and EV charging bays for students, staff, and university transport buses.',
    x: 820,
    y: 190,
    width: 140,
    height: 90,
    floorCount: 1,
    departments: ['Estate Security & Transport Wing'],
    facilities: ['4 EV Charging Stations', 'Helmet Lockers', 'Shuttle Bus Stop', 'CCTV Surveillance'],
    openHours: 'Open 24/7',
    contactPerson: 'Transport Supervisor',
    contactPhone: '+91 661 2482 105'
  },

  // 11. Medical / Help Desk
  {
    id: 'health_centre',
    name: 'Campus Health Centre & Emergency Triage',
    code: 'HEALTH-DESK',
    category: 'security_medical',
    description: 'Round-the-clock primary medical station with resident medical officer, 4 observation beds, and emergency ambulance on standby.',
    x: 230,
    y: 340,
    width: 130,
    height: 80,
    floorCount: 2,
    departments: ['Campus Health Services', 'Emergency Response Unit'],
    facilities: ['24x7 Ambulance Bay', 'Doctor Consultation Room', 'First Aid Station', 'Basic Pharmacy'],
    openHours: 'Open 24/7 for Emergencies (OPD: 09:00 AM – 06:00 PM)',
    contactPerson: 'Dr. M. K. Tripathy (Chief Medical Officer)',
    contactPhone: '+91 661 2482 112'
  },

  // 12. Main Gate & Security Control
  {
    id: 'main_gate',
    name: 'Main Security Gate & Reception (Gate 1)',
    code: 'MAIN-GATE',
    category: 'security_medical',
    description: 'Main campus entrance on Highway 26 with RFID boom barrier, visitor biometric registration, and 24x7 security guard post.',
    x: 50,
    y: 330,
    width: 120,
    height: 90,
    floorCount: 2,
    departments: ['Campus Security Force', 'Visitor Protocol Desk'],
    facilities: ['Visitor Pass Kiosk', 'Vehicle RFID Scanners', 'Lost & Found Counter', 'Emergency SOS Siren'],
    openHours: 'Open 24/7',
    contactPerson: 'Mr. Binod Behera (Chief Security Officer)',
    contactPhone: '+91 661 2482 100'
  },

  // 13. Workshop & Innovation Hub
  {
    id: 'workshop_hub',
    name: 'Central Engineering Workshop & FabLab',
    code: 'WORKSHOP',
    category: 'laboratory',
    description: 'Hands-on manufacturing labs for welding, foundry, fitting, CNC machining, and student startup innovation incubator.',
    x: 820,
    y: 50,
    width: 140,
    height: 100,
    floorCount: 2,
    departments: ['Mechanical Workshop', 'Innovation & Incubation Centre'],
    facilities: ['CNC Lathe Bay', 'Welding & Smithy Shop', 'Carpentry Bay', 'Student Project Garage'],
    openHours: '08:00 AM – 06:00 PM',
    contactPerson: 'Er. S. P. Swain (Workshop Superintendent)',
    contactPhone: '+91 661 2482 130'
  },

  // 14. Open Air Amphitheatre
  {
    id: 'amphitheatre',
    name: 'Utkal Cultural Amphitheatre',
    code: 'AMPHI',
    category: 'amenities',
    description: 'Tiered open-air auditorium for student club fests, tech conventions, alumni gatherings, and campus cultural performances.',
    x: 410,
    y: 340,
    width: 140,
    height: 80,
    floorCount: 1,
    departments: ['Student Cultural Council'],
    facilities: ['Stepped Seating (1,200 Capacity)', 'Acoustic Shell', 'Green Rooms', 'Festival Lighting'],
    openHours: '06:00 AM – 09:30 PM',
    contactPerson: 'Cultural Secretary',
    contactPhone: '+91 661 2482 110'
  }
];

export const CAMPUS_CATEGORIES = [
  { id: 'all', label: 'All Facilities', icon: 'MapPin' },
  { id: 'academic', label: 'Academic Blocks', icon: 'BookOpen' },
  { id: 'residential', label: 'Hostels & Residence', icon: 'Home' },
  { id: 'laboratory', label: 'Laboratories & Hubs', icon: 'Cpu' },
  { id: 'administrative', label: 'Admin & Library', icon: 'Building2' },
  { id: 'amenities', label: 'Dining & Amenities', icon: 'Utensils' },
  { id: 'sports_outdoor', label: 'Sports Complex', icon: 'Trophy' },
  { id: 'security_medical', label: 'Medical & Security', icon: 'ShieldCheck' }
] as const;
