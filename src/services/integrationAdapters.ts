/**
 * CampusFlow Modular System Integration Adapters
 * 
 * Provides clean adapter interfaces to integrate CampusFlow with external campus software:
 * 1. FretBox Hostel & Facility Management Adapter
 * 2. College ERP (Student Information & Fee Ledger) Adapter
 * 3. LMS Academic Schedule & Class Scheduler Adapter
 * 4. Institutional Security Gate & SMS Notification Gateway Adapter
 * 
 * In this prototype, mock adapters provide realistic responses and state synchronization
 * without inventing active production credentials.
 */

export interface FretboxSyncResult {
  fretboxTicketId: string;
  category: string;
  facility: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'DISPATCHED_TO_CONTRACTOR';
  technicianAssigned?: string;
  syncedAt: string;
}

export interface ErpStudentVerification {
  studentId: string;
  name: string;
  enrolledProgramme: string;
  currentSemester: string;
  tuitionFeeStatus: 'CLEARED' | 'PENDING_RECONCILIATION' | 'DUES_EXIST';
  libraryDuesStatus: 'CLEARED' | 'OVERDUE';
  hostelDuesStatus: 'CLEARED';
  eligibleForBonafide: boolean;
  eligibleForGatePass: boolean;
}

export interface GatePassSecuritySync {
  passId: string;
  gateId: string;
  action: 'DEPARTURE' | 'RETURN';
  timestamp: string;
  guardName: string;
  rfidScanned: boolean;
}

export class FretBoxAdapter {
  static isConnected(): boolean {
    return true; // Mock adapter connected in simulation mode
  }

  static getProviderName(): string {
    return 'FretBox Campus Facility Bus (Simulated Adapter v1.4)';
  }

  static async pushMaintenanceTicket(ticketData: {
    requestId: string;
    title: string;
    location: string;
    room: string;
    issueType: string;
  }): Promise<FretboxSyncResult> {
    // Simulate API round-trip delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      fretboxTicketId: `FB-EST-${Math.floor(10000 + Math.random() * 90000)}`,
      category: ticketData.issueType,
      facility: ticketData.location,
      status: 'QUEUED',
      technicianAssigned: 'Er. Ramesh Chandra Patra (Works Pool)',
      syncedAt: new Date().toISOString()
    };
  }
}

export class CollegeErpAdapter {
  static isConnected(): boolean {
    return true;
  }

  static getProviderName(): string {
    return 'BPUT Central ERP / SIS Integration Gateway (Mock Adapter)';
  }

  static async verifyStudentStatus(studentId: string): Promise<ErpStudentVerification> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      studentId,
      name: 'Udit Kumar Tripathy',
      enrolledProgramme: 'B.Tech in Computer Science & Engineering',
      currentSemester: '6th Semester',
      tuitionFeeStatus: 'CLEARED',
      libraryDuesStatus: 'CLEARED',
      hostelDuesStatus: 'CLEARED',
      eligibleForBonafide: true,
      eligibleForGatePass: true
    };
  }
}

export class SecurityGateAdapter {
  static isConnected(): boolean {
    return true;
  }

  static async recordGateMovement(event: GatePassSecuritySync): Promise<{ success: boolean; logId: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
      success: true,
      logId: `GATE-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      message: `Movement recorded at ${event.gateId}: ${event.action} for Pass ${event.passId} by ${event.guardName}.`
    };
  }
}
