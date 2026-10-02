import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  User, 
  ShieldCheck, 
  Database, 
  Check, 
  Smartphone, 
  Building2, 
  AlertCircle,
  LogOut 
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { Role } from '../../types/index.ts';

export const SettingsView: React.FC = () => {
  const { 
    role, 
    setRole, 
    currentUser, 
    requests, 
    notices, 
    resetToSeedData,
    isAccessibilityMode,
    setIsAccessibilityMode 
  } = useCampus();

  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReset = () => {
    resetToSeedData();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            CampusFlow System Preferences
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Configure persona profiles, local demo data state, and accessibility preferences
          </p>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-[#E6F5EF] border border-[#0D8B65] text-[#0D8B65] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4" />
          <span>Demo database reset to default seeded state successfully!</span>
        </div>
      )}

      {/* 1. Persona Profile Card */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#0D8B65]" />
            <h3 className="text-sm font-bold text-[#202722]">Active User Identity</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#0D8B65] uppercase">
            {role}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-[#5E6D64] block uppercase font-semibold">Full Name</span>
            <div className="font-semibold text-sm text-[#202722] mt-0.5">{currentUser.name}</div>
          </div>

          <div>
            <span className="text-[10px] text-[#5E6D64] block uppercase font-semibold">Role & Department</span>
            <div className="font-medium text-[#202722] mt-0.5">{currentUser.roleTitle}</div>
            <div className="text-[11px] text-[#5E6D64]">{currentUser.department}</div>
          </div>

          {currentUser.studentId && (
            <div>
              <span className="text-[10px] text-[#5E6D64] block uppercase font-semibold">BPUT University Registration</span>
              <div className="font-mono font-semibold text-[#202722] mt-0.5">{currentUser.studentId}</div>
            </div>
          )}

          {currentUser.hostel && (
            <div>
              <span className="text-[10px] text-[#5E6D64] block uppercase font-semibold">Residential Allotment</span>
              <div className="font-medium text-[#202722] mt-0.5">{currentUser.hostel} · {currentUser.room}</div>
            </div>
          )}
        </div>

        {/* Role Security & Authorized Clearance Policy */}
        <div className="pt-3 border-t border-[#E5E9E5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#202722] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0D8B65]" />
              <span>Role Verification & Security Clearance</span>
            </span>
            <span className="text-[11px] font-mono text-[#0D8B65] bg-[#E6F5EF] px-2 py-0.5 rounded font-semibold border border-[#A2C4AF]">
              Directory Verified
            </span>
          </div>

          <p className="text-xs text-[#5E6D64] leading-relaxed">
            Your account role (<strong className="text-[#202722] uppercase">{role}</strong>) is permanently bound to your authenticated institutional credentials. 
            Elevated privileges (Staff or Administrator) are provisioned through controlled administrative approval and cannot be modified from the client browser.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-[#5E6D64]">
              Session Status: <span className="font-semibold text-[#0D8B65]">Active (24h validity)</span>
            </div>
            <button
              onClick={useCampus().logout}
              className="px-3.5 py-1.5 bg-[#FCEDEC] hover:bg-[#F5CBC8] text-[#992828] text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Active Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Local Demo Storage & Reset */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0D8B65]" />
            <h3 className="text-sm font-bold text-[#202722]">Browser Persistence & State</h3>
          </div>
          <span className="text-xs text-[#5E6D64] font-mono">localStorage</span>
        </div>

        <p className="text-xs text-[#5E6D64] leading-relaxed">
          All ticket transitions, audit timelines, offline drafts, and published notices are saved locally in your browser memory for stateful demonstration.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <span className="text-[10px] text-[#5E6D64] uppercase block font-semibold">Saved Requests</span>
            <span className="text-lg font-bold font-mono text-[#202722]">{requests.length}</span>
          </div>

          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <span className="text-[10px] text-[#5E6D64] uppercase block font-semibold">Active Bulletins</span>
            <span className="text-lg font-bold font-mono text-[#202722]">{notices.length}</span>
          </div>

          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
            <span className="text-[10px] text-[#5E6D64] uppercase block font-semibold">Adapter Health</span>
            <span className="text-xs font-semibold text-[#0D8B65] mt-1 block">6 Handshakes OK</span>
          </div>
        </div>

        <div className="pt-2">
          {showConfirmReset ? (
            <div className="p-3.5 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl text-xs space-y-2">
              <p className="font-semibold text-[#992828]">
                Reset all requests, notices, and notes back to the clean initial demo state?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-[#992828] hover:bg-[#802020] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-white border border-[#E5E9E5] text-[#202722] rounded-lg text-xs font-medium hover:bg-[#F7F8F6] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FCEDEC] hover:bg-[#F5CBC8]/60 text-[#992828] border border-[#F5CBC8] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data to Initial Seeds</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
