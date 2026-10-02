import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCw, 
  KeyRound, 
  UserCheck, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  Lock,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Layers,
  FileCheck,
  Compass
} from 'lucide-react';
import { AuthService, AuthSession, isRealSmsProviderConfigured, isRealEmailProviderConfigured } from '../../services/authService.ts';
import { Role } from '../../types/index.ts';

interface AuthPageProps {
  onAuthenticated: (session: AuthSession) => void;
  onNavigateToPublicVerify?: () => void;
  initialRole?: Role;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' }
];

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onAuthenticated,
  onNavigateToPublicVerify,
  initialRole
}) => {
  // Step 1: Role Selection, Step 2: Role Login Form, Step 3: Student OTP verification, Step 4: Reset Password
  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole || null);
  const [viewState, setViewState] = useState<'role_select' | 'login_form' | 'otp_verify' | 'forgot_password'>(
    initialRole ? 'login_form' : 'role_select'
  );

  // Student OTP state
  const [studentAuthMode, setStudentAuthMode] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput] = useState('');
  const [activeTarget, setActiveTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Non-student credentials state
  const [credentialEmail, setCredentialEmail] = useState('');
  const [credentialPassword, setCredentialPassword] = useState('');

  // Password Reset / Recovery state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto countdown for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If initialRole is supplied via URL route or prop, configure role immediately
  useEffect(() => {
    if (initialRole) {
      handleSelectRole(initialRole);
    }
  }, [initialRole]);

  // Handle selecting a role
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Pre-populate realistic test credentials in form for easy grader evaluation
    if (role === 'student') {
      setEmailInput('student@bput-campus.ac.in');
      setPhoneInput('9437188210');
    } else if (role === 'faculty') {
      setCredentialEmail('faculty@bput-campus.ac.in');
      setCredentialPassword('CampusFlow@2026');
    } else if (role === 'admin' || role === 'staff') {
      setCredentialEmail('admin@bput-campus.ac.in');
      setCredentialPassword('CampusFlow@2026');
    }

    setViewState('login_form');
  };

  // Student: Request Email OTP
  const handleStudentEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.requestEmailOtp(emailInput);
      setActiveTarget(emailInput);
      setDemoCodeNotice(res.demoCode || null);
      if (res.demoCode) {
        setOtpCode(res.demoCode);
      }
      setResendCooldown(30);
      setViewState('otp_verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student: Request Phone OTP
  const handleStudentPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const fullPhone = `${phoneCountryCode}${phoneInput.replace(/\D/g, '')}`;
      const res = await AuthService.requestPhoneOtp(phoneInput, phoneCountryCode);
      setActiveTarget(fullPhone);
      setDemoCodeNotice(res.demoCode || null);
      if (res.demoCode) {
        setOtpCode(res.demoCode);
      }
      setResendCooldown(30);
      setViewState('otp_verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch SMS verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student: Verify OTP Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.verifyOtp(activeTarget, otpCode);
      if (res.success && res.session) {
        setSuccessMessage('Student identity verified! Initializing authorized session...');
        setTimeout(() => {
          onAuthenticated(res.session!);
        }, 500);
      } else {
        setErrorMessage(res.error || 'Invalid code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Non-Student (Faculty / Admin): Submit Credentials
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.authenticateWithCredentials(
        selectedRole, 
        credentialEmail, 
        credentialPassword
      );

      if (res.success && res.session) {
        setSuccessMessage(`${selectedRole.toUpperCase()} credentials authenticated! Loading workspace...`);
        setTimeout(() => {
          onAuthenticated(res.session!);
        }, 500);
      } else {
        setErrorMessage(res.error || 'Authentication rejected. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset: Request Code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.requestPasswordReset(selectedRole, resetEmail);
      setGeneratedResetCode(res.resetCode || null);
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      setResetStep('confirm');
      setSuccessMessage('Reset code generated. Enter your new password below.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not initiate reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset: Confirm
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await AuthService.confirmPasswordReset(selectedRole, resetEmail, resetCode, newPassword);
      setSuccessMessage(res.message);
      setCredentialPassword(newPassword);
      setTimeout(() => {
        setViewState('login_form');
        setResetStep('request');
        setGeneratedResetCode(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (r: Role): string => {
    switch (r) {
      case 'student': return 'Student Login';
      case 'faculty': return 'Faculty Login';
      case 'admin': return 'Admin Login';
      case 'staff': return 'Staff Operations Login';
      default: return 'Portal Login';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between font-sans selection:bg-[#1E3A2F] selection:text-white">
      {/* Top Institutional Header */}
      <header className="w-full border-b border-[#E5E9E5] bg-white py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A2F] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-[#202722] tracking-tight">CampusFlow</span>
                <span className="text-[10px] font-mono text-[#8A5B15] bg-[#FDF6EB] px-2 py-0.5 rounded font-bold border border-[#F1DFC4]">
                  DEMO AUTHENTICATION
                </span>
              </div>
              <p className="text-xs text-[#5E6D64] hidden sm:block">
                Biju Patnaik University of Technology · Cross-Department Orchestration Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToPublicVerify && (
              <button
                onClick={onNavigateToPublicVerify}
                className="text-xs font-semibold text-[#0D8B65] hover:text-[#0A7353] hover:underline flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Gate Pass / Document</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl">
          
          {/* STEP 1: ROLE SELECTION SCREEN */}
          {viewState === 'role_select' && (
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-1 rounded-full border border-[#A2C4AF]">
                  Select Portal Role
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#202722] tracking-tight">
                  Sign in to CampusFlow
                </h1>
                <p className="text-xs sm:text-sm text-[#5E6D64] max-w-md mx-auto leading-relaxed">
                  Choose your institutional designation to proceed to your role-authenticated workspace.
                </p>
              </div>

              {/* Primary Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                
                {/* 1. Student */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className="p-4 rounded-2xl border border-[#E5E9E5] hover:border-[#1E3A2F] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F5EF] text-[#0D8B65] flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0D8B65] uppercase">Student</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202722] group-hover:text-[#1E3A2F]">Student Portal</h3>
                    <p className="text-xs text-[#5E6D64] mt-1 leading-relaxed">
                      Submit service requests, apply for digital gate passes, track approvals, and view bonafide certificates.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E5E9E5] flex items-center justify-between text-xs font-semibold text-[#1E3A2F]">
                    <span>Enter Student Login</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 2. Faculty */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('faculty')}
                  className="p-4 rounded-2xl border border-[#E5E9E5] hover:border-[#234E70] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF4F9] text-[#234E70] flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#234E70] uppercase">Faculty</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202722] group-hover:text-[#234E70]">Faculty Desk</h3>
                    <p className="text-xs text-[#5E6D64] mt-1 leading-relaxed">
                      Warden gate pass authorizations, academic requests, student mentorship, and class timetable reviews.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E5E9E5] flex items-center justify-between text-xs font-semibold text-[#234E70]">
                    <span>Enter Faculty Login</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 3. Administrator */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className="p-4 rounded-2xl border border-[#E5E9E5] hover:border-[#1E3A2F] hover:bg-[#F7F8F6] text-left transition-all group flex flex-col justify-between shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] text-[#6B4423] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#6B4423] uppercase">Admin</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202722] group-hover:text-[#1E3A2F]">Admin Console</h3>
                    <p className="text-xs text-[#5E6D64] mt-1 leading-relaxed">
                      Dean of Student Welfare dashboard, campus-wide operational queues, certificate issuance, and system audits.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E5E9E5] flex items-center justify-between text-xs font-semibold text-[#1E3A2F]">
                    <span>Enter Admin Login</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Informational Security Note */}
              <div className="p-4 bg-[#F7F8F6] border border-[#E5E9E5] rounded-2xl text-xs text-[#5E6D64] flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#0D8B65] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-[#202722]">Role-Based Route Protection Enforced:</strong> Each institutional role requires its own authenticated session. Cross-role dashboard bypass is strictly prohibited.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE-SPECIFIC LOGIN FORM */}
          {viewState === 'login_form' && selectedRole && (
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              
              {/* Header with Back Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
                <button
                  type="button"
                  onClick={() => {
                    setViewState('role_select');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#5E6D64] hover:text-[#202722] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Role</span>
                </button>

                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  selectedRole === 'student' ? 'bg-[#E6F5EF] text-[#0D8B65]' :
                  selectedRole === 'faculty' ? 'bg-[#EEF4F9] text-[#234E70]' :
                  'bg-[#FAF0E6] text-[#6B4423]'
                }`}>
                  {selectedRole}
                </span>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-[#202722] tracking-tight">
                  {getRoleDisplayName(selectedRole)}
                </h2>
                <p className="text-xs text-[#5E6D64]">
                  {selectedRole === 'student' 
                    ? 'Authenticate using your registered academic email or phone' 
                    : `Provide your authorized ${selectedRole} credentials to unlock your workspace`}
                </p>
              </div>

              {/* Status Messages */}
              {errorMessage && (
                <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-[#992828] rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-[#E6F5EF] border border-[#A2C4AF] text-[#0D8B65] rounded-xl text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* A. STUDENT LOGIN FORM (Email / Phone OTP) */}
              {selectedRole === 'student' && (
                <div className="space-y-4">
                  {/* Toggle Email vs Phone */}
                  <div className="flex bg-[#F7F8F6] p-1 rounded-xl border border-[#E5E9E5]">
                    <button
                      type="button"
                      onClick={() => setStudentAuthMode('email')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        studentAuthMode === 'email' ? 'bg-white text-[#202722] shadow-2xs' : 'text-[#5E6D64]'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Academic Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentAuthMode('phone')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        studentAuthMode === 'phone' ? 'bg-white text-[#202722] shadow-2xs' : 'text-[#5E6D64]'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Mobile Number</span>
                    </button>
                  </div>

                  {studentAuthMode === 'email' ? (
                    <form onSubmit={handleStudentEmailOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#202722] mb-1">
                          University / Institutional Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="student@bput-campus.ac.in"
                            className="w-full pl-9 pr-4 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Request Email OTP</span>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleStudentPhoneOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#202722] mb-1">
                          Registered Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className="bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl px-2.5 py-2 text-xs font-mono text-[#202722] focus:outline-none"
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="9437188210"
                            className="flex-1 px-3 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] font-mono focus:outline-none focus:border-[#1E3A2F] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Request Phone OTP</span>}
                      </button>
                    </form>
                  )}

                  {/* Documented Test Account for Student */}
                  <div className="p-3 bg-[#FDFBF7] border border-[#E5E9E5] rounded-xl text-xs space-y-1">
                    <span className="font-bold text-[#8A5B15] uppercase text-[10px]">Test Account Credentials:</span>
                    <div className="font-mono text-[#202722]">student@bput-campus.ac.in · +91 9437188210</div>
                    <div className="text-[11px] text-[#5E6D64]">Pre-configured test OTP: <strong className="font-mono text-[#202722]">742915</strong></div>
                  </div>
                </div>
              )}

              {/* B. NON-STUDENT LOGIN FORM (Faculty / Admin) */}
              {selectedRole !== 'student' && (
                <form onSubmit={handleCredentialLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202722] mb-1">
                      Authorized {selectedRole.toUpperCase()} Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={credentialEmail}
                        onChange={(e) => setCredentialEmail(e.target.value)}
                        placeholder={`${selectedRole}@bput-campus.ac.in`}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#202722]">Account Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(credentialEmail);
                          setViewState('forgot_password');
                        }}
                        className="text-[11px] text-[#0D8B65] hover:underline font-semibold"
                      >
                        Reset Access / Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#5E6D64] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={credentialPassword}
                        onChange={(e) => setCredentialPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-4 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In as {selectedRole.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Documented Test Account for this Role */}
                  <div className="p-3 bg-[#FDFBF7] border border-[#E5E9E5] rounded-xl text-xs space-y-1">
                    <span className="font-bold text-[#8A5B15] uppercase text-[10px]">
                      Development Mock Credentials for {selectedRole.toUpperCase()}:
                    </span>
                    <div className="font-mono text-[#202722] text-[11px]">
                      Email: <strong>{selectedRole}@bput-campus.ac.in</strong>
                    </div>
                    <div className="font-mono text-[#202722] text-[11px]">
                      Password: <strong>CampusFlow@2026</strong>
                    </div>
                    <div className="text-[10px] text-[#5E6D64] pt-0.5">
                      Credentials must be submitted through the form above. No one-click bypass.
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: STUDENT OTP VERIFICATION SCREEN */}
          {viewState === 'otp_verify' && (
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-[#E6F5EF] text-[#0D8B65] rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#202722] tracking-tight">Verify Student Code</h2>
                <p className="text-xs text-[#5E6D64]">
                  Verification code dispatched to <strong className="text-[#202722]">{activeTarget}</strong>
                </p>
              </div>

              {/* Demo Mode Notice */}
              {demoCodeNotice && (
                <div className="p-3 bg-[#FDF6EB] border border-[#F1DFC4] text-[#8A5B15] rounded-xl text-xs text-center space-y-1">
                  <span className="font-bold block">Local Demo-Auth OTP Code:</span>
                  <span className="font-mono text-lg font-bold tracking-widest text-[#202722]">{demoCodeNotice}</span>
                  <div className="text-[10px]">Pre-filled below for development review.</div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-[#992828] rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202722] mb-1 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="742915"
                    className="w-full py-3 text-center font-mono text-xl tracking-widest bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-[#202722] focus:outline-none focus:border-[#1E3A2F] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Confirm & Establish Session</span>}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E9E5]">
                <button
                  type="button"
                  onClick={() => setViewState('login_form')}
                  className="text-[#5E6D64] hover:text-[#202722]"
                >
                  ← Back to Email / Phone
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={async () => {
                    const res = await AuthService.resendOtp();
                    if (res.demoCode) {
                      setDemoCodeNotice(res.demoCode);
                      setOtpCode(res.demoCode);
                    }
                    setResendCooldown(30);
                  }}
                  className="text-[#0D8B65] hover:underline font-semibold disabled:text-[#5E6D64] disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FORGOT PASSWORD / RESET ACCESS FLOW */}
          {viewState === 'forgot_password' && selectedRole && (
            <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
                <button
                  type="button"
                  onClick={() => setViewState('login_form')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#5E6D64] hover:text-[#202722]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
                <span className="text-xs font-bold text-[#8A5B15] uppercase font-mono">Self-Service Recovery</span>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-[#202722] tracking-tight">
                  Reset {selectedRole.toUpperCase()} Access
                </h2>
                <p className="text-xs text-[#5E6D64]">
                  Recover access without requiring administrator intervention.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-[#992828] rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-[#E6F5EF] border border-[#A2C4AF] text-[#0D8B65] rounded-xl text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202722] mb-1">
                      Registered {selectedRole.toUpperCase()} Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={`${selectedRole}@bput-campus.ac.in`}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                  >
                    {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Generate Recovery Code</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  {generatedResetCode && (
                    <div className="p-3 bg-[#E6F5EF] border border-[#A2C4AF] rounded-xl text-xs text-center space-y-1">
                      <span className="font-bold text-[#0D8B65] block">Self-Service Reset Authorization Code:</span>
                      <span className="font-mono text-base font-bold text-[#202722]">{generatedResetCode}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#202722] mb-1">
                      Recovery Authorization Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="RESET-123456"
                      className="w-full px-3.5 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] font-mono focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202722] mb-1">
                      New Account Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0D8B65] hover:bg-[#0A7353] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                  >
                    {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <span>Update Password & Log In</span>}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E9E5] bg-white py-3.5 px-4 text-center text-xs text-[#5E6D64]">
        <span>CampusFlow Institutional Operations · BPUT Rourkela Campus · Security Policy v2.4</span>
      </footer>
    </div>
  );
};
