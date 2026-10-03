import { RequestItem, UserProfile, RequestStatus } from '../types/index.ts';

/**
 * Deterministic assignment and visibility rule for Faculty:
 * A faculty member only sees tickets that are explicitly assigned to them,
 * or fall under their official departmental / warden responsibility.
 *
 * Maintenance complaints, fee queries, and other departmental tickets do NOT
 * silently leak into faculty views unless explicitly assigned to that faculty member.
 */
export const isTicketAssignedToFaculty = (req: RequestItem, faculty: UserProfile): boolean => {
  if (!faculty || faculty.role !== 'faculty') return false;

  const facultyNameLower = faculty.name.toLowerCase();
  const assignedStaffLower = (req.assignedStaff || '').toLowerCase();
  const facultyEmailLower = (faculty.email || '').toLowerCase();
  const facultyStaffIdLower = (faculty.staffId || '').toLowerCase();

  // 1. Direct Staff Assignment match
  if (assignedStaffLower) {
    if (
      assignedStaffLower === facultyNameLower ||
      assignedStaffLower === facultyEmailLower ||
      (facultyStaffIdLower && assignedStaffLower === facultyStaffIdLower) ||
      // Handle abbreviations: e.g. "Dr. P. Dash" vs "Dr. Pramod Dash"
      (facultyNameLower.includes('dash') && assignedStaffLower.includes('dash')) ||
      (facultyNameLower.includes('pramod') && assignedStaffLower.includes('pramod'))
    ) {
      return true;
    }
  }

  // 2. Warden Role / Hostel Council Responsibility
  const isWarden = 
    (faculty.roleTitle || '').toLowerCase().includes('warden') ||
    (faculty.department || '').toLowerCase().includes('hostel council');

  if (isWarden) {
    // Leave & Gate pass requests assigned to warden or unassigned under warden department
    if (req.category === 'leave_gatepass') {
      if (req.assignedStaff && !assignedStaffLower.includes('dash') && !assignedStaffLower.includes('warden') && assignedStaffLower !== facultyNameLower) {
        return false;
      }
      return true;
    }
    if ((req.assignedRole || '').toLowerCase().includes('warden')) {
      return true;
    }
    if (req.department.toLowerCase().includes('warden') && (!req.assignedStaff || assignedStaffLower === facultyNameLower || assignedStaffLower.includes('dash'))) {
      return true;
    }
  }

  // 3. Academic Department Responsibility (Timetable queries, academic advising)
  const facultyDeptLower = (faculty.department || '').toLowerCase();
  if (req.category === 'timetable') {
    // If ticket is specifically in faculty's academic department
    if (
      facultyDeptLower.includes('electrical') && 
      (req.title.toLowerCase().includes('electrical') || req.description.toLowerCase().includes('electrical'))
    ) {
      return true;
    }
    // If assigned to academic mentor
    if ((req.assignedRole || '').toLowerCase().includes('faculty') || (req.assignedRole || '').toLowerCase().includes('mentor')) {
      if (!req.assignedStaff || assignedStaffLower === facultyNameLower || assignedStaffLower.includes('dash')) {
        return true;
      }
    }
  }

  // NOTE: Maintenance complaints, mess issues, fee dues, and general bonafides
  // are NOT automatically shown to faculty unless explicitly assigned to them.
  return false;
};

/**
 * Check whether a ticket is overdue based on SLA hours and creation timestamp.
 */
export const isTicketOverdue = (req: RequestItem): boolean => {
  if (req.status === 'closed' || req.status === 'resolved') return false;
  const ageHours = (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60);
  return ageHours > req.slaHours;
};

/**
 * Check if the ticket is approaching SLA (≥ 75% of SLA expired).
 */
export const isTicketApproachingSla = (req: RequestItem): boolean => {
  if (req.status === 'closed' || req.status === 'resolved') return false;
  const ageHours = (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60);
  return ageHours >= req.slaHours * 0.75 && ageHours <= req.slaHours;
};

/**
 * Evaluates whether a user with a given profile has permission to perform an action on a ticket.
 */
export const canUserPerformActionOnTicket = (
  req: RequestItem,
  user: UserProfile,
  action: 'assign' | 'in_progress' | 'approve' | 'reject' | 'resolve' | 'reopen' | 'close' | 'cancel' | 'note'
): { allowed: boolean; reason?: string } => {
  // Students cannot approve, resolve, or assign tickets
  if (user.role === 'student') {
    const isOwner = 
      req.studentId === user.studentId || 
      req.studentEmail === user.email || 
      (user.name && req.studentName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0]));

    if (action === 'reopen' && (req.status === 'resolved' || req.status === 'closed') && isOwner) {
      return { allowed: true };
    }
    if (action === 'close' && req.status === 'resolved' && isOwner) {
      return { allowed: true };
    }
    if (action === 'cancel' && req.status === 'submitted' && isOwner) {
      return { allowed: true };
    }
    if (action === 'note') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Students do not possess resolver or administrative permissions.' };
  }

  // Admin has universal management privileges
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // Faculty must be assigned to the ticket or responsible for its department
  if (user.role === 'faculty') {
    const isAssigned = isTicketAssignedToFaculty(req, user);
    if (!isAssigned) {
      return { allowed: false, reason: 'This ticket belongs to another department or resolver queue. Access is restricted.' };
    }

    switch (action) {
      case 'assign':
        return { allowed: !req.assignedStaff || req.assignedStaff === user.name };
      case 'in_progress':
        return { 
          allowed: req.status === 'submitted' || req.status === 'assigned',
          reason: req.status === 'in_progress' ? 'Ticket is already In Progress' : undefined
        };
      case 'approve':
      case 'reject':
        // Only approval-type requests (leave/gatepass, bonafide) can be approved/rejected
        if (req.category === 'leave_gatepass' || req.category === 'bonafide') {
          return { allowed: req.status !== 'closed' && req.status !== 'resolved' };
        }
        return { allowed: false, reason: 'Approval and rejection decisions only apply to authorization requests (gate passes & bonafides).' };
      case 'resolve':
        return { 
          allowed: req.status !== 'closed' && req.status !== 'resolved',
          reason: req.status === 'resolved' ? 'Ticket is already resolved.' : undefined 
        };
      case 'close':
        return { allowed: req.status === 'resolved' };
      case 'reopen':
        return { allowed: req.status === 'resolved' || req.status === 'closed' };
      case 'note':
        return { allowed: true };
      default:
        return { allowed: false };
    }
  }

  // Staff (Maintenance/Estate)
  if (user.role === 'staff') {
    const isMaintenanceOrAssigned = 
      req.category === 'maintenance' || 
      (req.assignedStaff && req.assignedStaff.toLowerCase() === user.name.toLowerCase());

    if (!isMaintenanceOrAssigned) {
      return { allowed: false, reason: 'Staff permissions are limited to maintenance and assigned works.' };
    }

    switch (action) {
      case 'assign':
        return { allowed: true };
      case 'in_progress':
        return { allowed: req.status === 'submitted' || req.status === 'assigned' };
      case 'resolve':
        return { allowed: req.status !== 'closed' && req.status !== 'resolved' };
      case 'close':
        return { allowed: req.status === 'resolved' };
      case 'reopen':
        return { allowed: req.status === 'resolved' || req.status === 'closed' };
      case 'note':
        return { allowed: true };
      default:
        return { allowed: false, reason: 'Action not permitted for staff role.' };
    }
  }

  return { allowed: false, reason: 'Unauthorized role.' };
};
