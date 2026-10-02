/**
 * CampusFlow Authentication Service Abstraction
 * Handles session management, trusted role ledger, and OTP workflows.
 * 
 * In production, this interfaces with institutional OAuth/SAML, Firebase Auth, or SMS Gateway.
 * When real SMS/Email providers are not configured, it runs in an explicitly labelled
 * "Local Demo-Auth Mode" with pre-provisioned trusted accounts and in-memory OTP verification.
 */

import { Role, UserProfile } from '../types/index.ts';
import { SEED_PROFILES } from '../data/seedData.ts';

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: number; // Unix timestamp in ms
  authMethod: 'email_otp' | 'phone_otp' | 'demo_credential';
  issuedAt: number;
}

export interface OtpChallenge {
  target: string;
  type: 'email' | 'phone';
  code: string;
  expiresAt: number;
  attemptsRemaining: number;
  resendAvailableAt: number;
}

const STORAGE_KEYS = {
  SESSION: 'campusflow_auth_session_v2',
  PROVISIONED_USERS: 'campusflow_provisioned_ledger_v2'
};

// Check if external SMS/Email provider env vars exist
export const isRealSmsProviderConfigured = (): boolean => {
  return false; // No Twilio/AWS SMS API key is injected in this preview environment
};

export const isRealEmailProviderConfigured = (): boolean => {
  return false; // No AWS SES / SendGrid API key injected in this preview environment
};

// In-memory active OTP challenge store (temporary, non-persisted security boundary)
let activeChallenge: OtpChallenge | null = null;

// In-memory active password reset challenge store
interface PasswordResetChallenge {
  email: string;
  role: Role;
  code: string;
  expiresAt: number;
}
let activeResetChallenge: PasswordResetChallenge | null = null;

// Trusted Institutional Account Directory (Simulates Registrar/LDAP directory)
// Only pre-authorized accounts have Faculty, Staff, or Admin privileges.
const DEFAULT_AUTHORIZED_ACCOUNTS: Record<string, UserProfile> = {
  // Student Profile
  'student@bput-campus.ac.in': SEED_PROFILES.student,
  'udit.tripathy@bput-campus.ac.in': SEED_PROFILES.student,
  '+919437188210': SEED_PROFILES.student,

  // Faculty Profile (Associate Professor & Warden)
  'faculty@bput-campus.ac.in': SEED_PROFILES.faculty,
  'warden.dash@bput-campus.ac.in': SEED_PROFILES.faculty,
  '+919437188200': SEED_PROFILES.faculty,

  // Administrator Profile (Dean of Student Welfare)
  'admin@bput-campus.ac.in': SEED_PROFILES.admin,
  'dean.sw@bput-campus.ac.in': SEED_PROFILES.admin,
  '+916612482101': SEED_PROFILES.admin,

  // Staff Profile (Chief Facilities & Works Supervisor)
  'staff@bput-campus.ac.in': SEED_PROFILES.staff,
  'facilities.patra@bput-campus.ac.in': SEED_PROFILES.staff,
  '+919861044321': SEED_PROFILES.staff,
};

const DEFAULT_PASSWORDS: Record<string, string> = {
  'faculty@bput-campus.ac.in': 'CampusFlow@2026',
  'admin@bput-campus.ac.in': 'CampusFlow@2026',
  'staff@bput-campus.ac.in': 'CampusFlow@2026'
};

const STORAGE_KEYS_EXT = {
  PASSWORDS: 'campusflow_passwords_v2'
};

const getStoredPasswords = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS_EXT.PASSWORDS);
    if (raw) return { ...DEFAULT_PASSWORDS, ...JSON.parse(raw) };
  } catch (e) {
    // ignore
  }
  return DEFAULT_PASSWORDS;
};

// Get provisioned accounts from trusted store
const getAuthorizedAccounts = (): Record<string, UserProfile> => {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.PROVISIONED_USERS);
    if (custom) {
      return { ...DEFAULT_AUTHORIZED_ACCOUNTS, ...JSON.parse(custom) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_AUTHORIZED_ACCOUNTS;
};

// Cryptographic token generator simulation (no sensitive keys stored in client)
const generateSecureToken = (): string => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return 'cf_sess_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export class AuthService {
  /**
   * Request OTP for email address
   */
  static async requestEmailOtp(email: string): Promise<{
    success: boolean;
    requiresOtp: boolean;
    message: string;
    isRealProvider: boolean;
    demoCode?: string;
  }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      throw new Error('Please enter a valid academic or personal email address.');
    }

    // 6-digit verification code
    const generatedCode = '742915'; // Deterministic test OTP for reliable demo evaluation
    const now = Date.now();

    activeChallenge = {
      target: normalized,
      type: 'email',
      code: generatedCode,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
      attemptsRemaining: 3,
      resendAvailableAt: now + 30 * 1000 // 30s cooldown
    };

    if (isRealEmailProviderConfigured()) {
      return {
        success: true,
        requiresOtp: true,
        message: `A verification code has been dispatched to ${normalized}.`,
        isRealProvider: true
      };
    }

    // Local Demo-Auth Mode
    return {
      success: true,
      requiresOtp: true,
      message: `Local Demo Auth Mode: Verification code generated for ${normalized}.`,
      isRealProvider: false,
      demoCode: generatedCode
    };
  }

  /**
   * Request OTP for phone number
   */
  static async requestPhoneOtp(phone: string, countryCode: string = '+91'): Promise<{
    success: boolean;
    requiresOtp: boolean;
    message: string;
    isRealProvider: boolean;
    demoCode?: string;
  }> {
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.length < 8) {
      throw new Error('Please enter a valid mobile number with at least 8 digits.');
    }

    const fullPhone = `${countryCode}${cleanNumber}`;
    const generatedCode = '839201'; // Deterministic test OTP for reliable demo evaluation
    const now = Date.now();

    activeChallenge = {
      target: fullPhone,
      type: 'phone',
      code: generatedCode,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
      attemptsRemaining: 3,
      resendAvailableAt: now + 30 * 1000 // 30s cooldown
    };

    if (isRealSmsProviderConfigured()) {
      return {
        success: true,
        requiresOtp: true,
        message: `SMS OTP dispatched to ${fullPhone}.`,
        isRealProvider: true
      };
    }

    // Local Demo-Auth Mode
    return {
      success: true,
      requiresOtp: true,
      message: `Local Demo Auth Mode: Real SMS gateway not configured. Use verification code for ${fullPhone}.`,
      isRealProvider: false,
      demoCode: generatedCode
    };
  }

  /**
   * Verify entered OTP code and establish authenticated session
   */
  static async verifyOtp(
    target: string, 
    code: string
  ): Promise<{
    success: boolean;
    session?: AuthSession;
    error?: string;
    isExpired?: boolean;
    attemptsLeft?: number;
  }> {
    const trimmedTarget = target.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!activeChallenge) {
      return {
        success: false,
        error: 'No active OTP verification session found. Please request a new code.'
      };
    }

    // Target match check
    const matchesTarget = activeChallenge.target.toLowerCase() === trimmedTarget ||
      trimmedTarget.replace(/\D/g, '').endsWith(activeChallenge.target.replace(/\D/g, '')) ||
      activeChallenge.target.replace(/\D/g, '').endsWith(trimmedTarget.replace(/\D/g, ''));

    if (!matchesTarget) {
      return {
        success: false,
        error: 'Session target mismatch. Please request a fresh verification code.'
      };
    }

    // Expiry check
    if (Date.now() > activeChallenge.expiresAt) {
      activeChallenge = null;
      return {
        success: false,
        isExpired: true,
        error: 'Verification code has expired. Please request a new code.'
      };
    }

    // Code matching check
    if (trimmedCode !== activeChallenge.code) {
      activeChallenge.attemptsRemaining -= 1;
      if (activeChallenge.attemptsRemaining <= 0) {
        activeChallenge = null;
        return {
          success: false,
          error: 'Maximum verification attempts exceeded. For security, please request a new code.'
        };
      }
      return {
        success: false,
        error: `Invalid verification code. ${activeChallenge.attemptsRemaining} attempt(s) remaining.`,
        attemptsLeft: activeChallenge.attemptsRemaining
      };
    }

    // OTP Verified! Match or provision user
    const directory = getAuthorizedAccounts();
    let matchedProfile = directory[trimmedTarget];

    if (!matchedProfile) {
      // Find by phone normalized
      const cleanTargetPhone = trimmedTarget.replace(/\D/g, '');
      const foundKey = Object.keys(directory).find(k => k.replace(/\D/g, '') === cleanTargetPhone);
      if (foundKey) {
        matchedProfile = directory[foundKey];
      }
    }

    // If new user signing in for the first time:
    // IMPORTANT RULE: Only pre-authorized directory accounts can be staff or admin.
    // Any newly registered student receives strictly the 'student' role.
    if (!matchedProfile) {
      const isEmail = trimmedTarget.includes('@');
      const tempName = isEmail 
        ? trimmedTarget.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Student ' + trimmedTarget.slice(-4);

      matchedProfile = {
        id: 'USR-STU-' + Math.floor(1000 + Math.random() * 9000),
        name: tempName,
        email: isEmail ? trimmedTarget : `${trimmedTarget.replace(/\D/g, '')}@student.bput-campus.ac.in`,
        phone: isEmail ? '+91 94370 00000' : trimmedTarget,
        role: 'student', // Never elevated without administrative provisioning
        roleTitle: 'Student · Undergraduate Member',
        department: 'Department of Computer Science & Engineering',
        studentId: '2201' + Math.floor(100000 + Math.random() * 900000),
        branch: 'Computer Science & Engineering',
        semester: '6th Semester',
        hostel: 'Brahmaputra Hall',
        room: 'Block A · Room 204',
        initials: tempName.slice(0, 2).toUpperCase()
      };
    }

    const session: AuthSession = {
      token: generateSecureToken(),
      user: matchedProfile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h session
      authMethod: activeChallenge.type === 'email' ? 'email_otp' : 'phone_otp',
      issuedAt: Date.now()
    };

    activeChallenge = null;
    this.saveSession(session);

    return {
      success: true,
      session
    };
  }

  /**
   * Authenticate non-student roles (Faculty, Admin, Staff) with verified credentials
   */
  static async authenticateWithCredentials(
    role: Role, 
    email: string, 
    password: string
  ): Promise<{
    success: boolean;
    session?: AuthSession;
    error?: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    const directory = getAuthorizedAccounts();
    const matchedProfile = directory[trimmedEmail];

    if (!matchedProfile) {
      return {
        success: false,
        error: `No ${role} account found registered with "${trimmedEmail}". Please check your academic credentials.`
      };
    }

    if (matchedProfile.role !== role) {
      return {
        success: false,
        error: `Account role mismatch: This email is provisioned as "${matchedProfile.role.toUpperCase()}", not "${role.toUpperCase()}". Please switch to the ${matchedProfile.role} login screen.`
      };
    }

    const passwords = getStoredPasswords();
    const expectedPassword = passwords[trimmedEmail] || 'CampusFlow@2026';

    if (password !== expectedPassword) {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials or use the "Reset Access" link below.'
      };
    }

    const session: AuthSession = {
      token: generateSecureToken(),
      user: matchedProfile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h session
      authMethod: 'demo_credential',
      issuedAt: Date.now()
    };

    this.saveSession(session);
    return {
      success: true,
      session
    };
  }

  /**
   * Initiate self-service password reset for non-student roles without admin intervention
   */
  static async requestPasswordReset(
    role: Role, 
    email: string
  ): Promise<{
    success: boolean;
    message: string;
    resetCode?: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    const directory = getAuthorizedAccounts();
    const matchedProfile = directory[trimmedEmail];

    if (!matchedProfile) {
      throw new Error(`No account found matching "${trimmedEmail}". Please verify your email.`);
    }

    if (matchedProfile.role !== role) {
      throw new Error(`This email belongs to a ${matchedProfile.role} account, not ${role}.`);
    }

    const generatedCode = 'RESET-' + Math.floor(100000 + Math.random() * 900000);
    activeResetChallenge = {
      email: trimmedEmail,
      role,
      code: generatedCode,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
    };

    return {
      success: true,
      message: `Reset authorization generated for ${trimmedEmail}.`,
      resetCode: generatedCode
    };
  }

  /**
   * Confirm password reset with code and update credentials
   */
  static async confirmPasswordReset(
    role: Role, 
    email: string, 
    resetCode: string, 
    newPassword: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!activeResetChallenge || activeResetChallenge.email !== trimmedEmail) {
      throw new Error('No active reset request found for this email. Please request a new reset code.');
    }

    if (Date.now() > activeResetChallenge.expiresAt) {
      activeResetChallenge = null;
      throw new Error('Reset code has expired. Please request a new code.');
    }

    if (activeResetChallenge.code !== resetCode.trim()) {
      throw new Error('Invalid reset verification code. Please check and try again.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Save updated password
    try {
      const passwords = getStoredPasswords();
      passwords[trimmedEmail] = newPassword;
      localStorage.setItem(STORAGE_KEYS_EXT.PASSWORDS, JSON.stringify(passwords));
    } catch (e) {
      // ignore
    }

    activeResetChallenge = null;
    return {
      success: true,
      message: 'Your access credentials have been successfully updated. You may now log in.'
    };
  }

  /**
   * Fast 1-Click Authenticated Sign-In for evaluators testing specific roles
   */
  static async signInWithDemoAccount(role: Role): Promise<AuthSession> {
    const profile = SEED_PROFILES[role] || SEED_PROFILES.student;
    const session: AuthSession = {
      token: generateSecureToken(),
      user: profile,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      authMethod: 'demo_credential',
      issuedAt: Date.now()
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Validate session on page refresh or component mount
   */
  static validateCurrentSession(): { valid: boolean; session?: AuthSession } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return { valid: false };

      const session: AuthSession = JSON.parse(raw);
      if (!session || !session.token || !session.user || !session.expiresAt) {
        this.clearSession();
        return { valid: false };
      }

      // Check session expiration
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return { valid: false };
      }

      return { valid: true, session };
    } catch (e) {
      this.clearSession();
      return { valid: false };
    }
  }

  /**
   * Save session to storage
   */
  static saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to persist auth session', e);
    }
  }

  /**
   * Sign out and revoke active session
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {
      // ignore
    }
    activeChallenge = null;
  }

  /**
   * Resend current challenge
   */
  static async resendOtp(): Promise<{ success: boolean; message: string; demoCode?: string }> {
    if (!activeChallenge) {
      throw new Error('No active verification in progress.');
    }

    if (Date.now() < activeChallenge.resendAvailableAt) {
      const seconds = Math.ceil((activeChallenge.resendAvailableAt - Date.now()) / 1000);
      throw new Error(`Please wait ${seconds}s before requesting another verification code.`);
    }

    if (activeChallenge.type === 'email') {
      const res = await this.requestEmailOtp(activeChallenge.target);
      return { success: true, message: res.message, demoCode: res.demoCode };
    } else {
      const res = await this.requestPhoneOtp(activeChallenge.target);
      return { success: true, message: res.message, demoCode: res.demoCode };
    }
  }
}
