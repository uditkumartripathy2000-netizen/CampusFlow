import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  User, 
  FileText, 
  Award,
  Hash,
  ExternalLink,
  Info
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { BonafideCertificate } from '../../types/index.ts';

interface VerificationViewProps {
  initialCertificateId?: string | null;
  onBackToPortal?: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  initialCertificateId,
  onBackToPortal
}) => {
  const { certificates, setActiveTab } = useCampus();

  const [searchId, setSearchId] = useState<string>(() => {
    // If passed in prop or URL parameter
    if (initialCertificateId) return initialCertificateId;
    // Check URL path like /verify/BPUT-BC-2026-8491
    const pathParts = window.location.pathname.split('/');
    const verifyIdx = pathParts.indexOf('verify');
    if (verifyIdx !== -1 && pathParts[verifyIdx + 1]) {
      return decodeURIComponent(pathParts[verifyIdx + 1]);
    }
    // Check URL hash like #/verify/BPUT-BC-2026-8491
    if (window.location.hash.includes('/verify/')) {
      const parts = window.location.hash.split('/verify/');
      if (parts[1]) return decodeURIComponent(parts[1]);
    }
    return 'BPUT-BC-2026-8491'; // Default realistic demo certificate
  });

  const [submittedQuery, setSubmittedQuery] = useState<string>(searchId);

  useEffect(() => {
    if (initialCertificateId) {
      setSearchId(initialCertificateId);
      setSubmittedQuery(initialCertificateId);
    }
  }, [initialCertificateId]);

  // Find matching certificate
  const matchedCertificate = certificates.find(
    c => c.id.trim().toUpperCase() === submittedQuery.trim().toUpperCase()
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSubmittedQuery(searchId.trim());
    // Update browser URL / state cleanly without reloading
    try {
      window.history.pushState({}, '', `/verify/${encodeURIComponent(searchId.trim())}`);
    } catch (e) {
      // ignore
    }
  };

  const handleQuickTest = (id: string) => {
    setSearchId(id);
    setSubmittedQuery(id);
    try {
      window.history.pushState({}, '', `/verify/${encodeURIComponent(id)}`);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
        <button
          onClick={() => {
            if (onBackToPortal) {
              onBackToPortal();
            } else {
              setActiveTab('overview');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#202722] hover:bg-[#E5E9E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#5E6D64]" />
          <span>Back to CampusFlow Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded font-semibold border border-[#A2C4AF]">
            Public Verification Portal
          </span>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white border border-[#E5E9E5] rounded-3xl shadow-xs overflow-hidden">
        
        {/* Verification Header */}
        <div className="p-6 sm:p-8 bg-[#1E3A2F] text-white text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-[#9A7B38] flex items-center justify-center mx-auto text-[#9A7B38]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="text-xs font-mono tracking-widest text-[#9A7B38] uppercase font-bold">
            BIJU PATNAIK UNIVERSITY OF TECHNOLOGY, ODISHA
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            Institutional Document Verification Registry
          </h2>
          <p className="text-xs text-white/70 max-w-lg mx-auto leading-relaxed">
            Verify the authenticity of digital certificates issued by Government College of Engineering, Kalahandi
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-[#E5E9E5] bg-[#F7F8F6]">
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E6D64]" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate Reference ID (e.g. BPUT-BC-2026-8491)"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] shadow-2xs font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1E3A2F] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#163328] transition-colors shadow-2xs shrink-0"
            >
              Verify Now
            </button>
          </form>

          {/* Quick test buttons for demo evaluators */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap text-[11px] text-[#5E6D64]">
            <span>Try demo IDs:</span>
            <button
              type="button"
              onClick={() => handleQuickTest('BPUT-BC-2026-8491')}
              className="font-mono text-[#0D8B65] hover:underline bg-white px-2 py-0.5 rounded border border-[#E5E9E5]"
            >
              BPUT-BC-2026-8491 (Udit)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('BPUT-BC-2026-7215')}
              className="font-mono text-[#0D8B65] hover:underline bg-white px-2 py-0.5 rounded border border-[#E5E9E5]"
            >
              BPUT-BC-2026-7215 (Manish)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('BPUT-BC-INVALID-9999')}
              className="font-mono text-[#992828] hover:underline bg-white px-2 py-0.5 rounded border border-[#E5E9E5]"
            >
              Invalid ID Test
            </button>
          </div>
        </div>

        {/* VERIFICATION RESULT PANEL */}
        <div className="p-6 sm:p-8">
          {matchedCertificate ? (
            /* VALID RECORD FOUND */
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className="p-4 bg-[#E6F5EF] border border-[#A2C4AF] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D8B65] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0D8B65] uppercase tracking-wider block">
                      Status: Valid / Verified
                    </span>
                    <span className="text-sm font-bold text-[#202722]">
                      Institutional Credential Verified in University Registry
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono font-bold text-[#1E3A2F] bg-white px-3 py-1 rounded-lg border border-[#A2C4AF]">
                    {matchedCertificate.id}
                  </span>
                </div>
              </div>

              {/* Exact Data Display Required by Specification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                
                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Certificate ID
                  </span>
                  <span className="font-mono font-bold text-base text-[#1E3A2F] mt-0.5 block">
                    {matchedCertificate.id}
                  </span>
                </div>

                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Student Name
                  </span>
                  <span className="font-bold text-base text-[#202722] mt-0.5 block">
                    {matchedCertificate.studentName}
                  </span>
                </div>

                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Programme
                  </span>
                  <span className="font-semibold text-[#202722] mt-0.5 block">
                    {matchedCertificate.programme}
                  </span>
                </div>

                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Academic Year
                  </span>
                  <span className="font-semibold text-[#202722] mt-0.5 block">
                    {matchedCertificate.academicYear} ({matchedCertificate.semester})
                  </span>
                </div>

                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Issue Date
                  </span>
                  <span className="font-semibold text-[#202722] mt-0.5 block">
                    {new Date(matchedCertificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                  <span className="text-[11px] font-bold text-[#5E6D64] uppercase block">
                    Verification Status
                  </span>
                  <span className="font-bold text-[#0D8B65] mt-0.5 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACTIVE & VALID (AUTHENTIC RECORD)</span>
                  </span>
                </div>
              </div>

              {/* Verified Issuing Authority */}
              <div className="p-4 bg-white rounded-xl border border-[#E5E9E5] text-xs space-y-1">
                <span className="font-bold text-[#202722] block">Issuing Authority:</span>
                <p className="text-[#5E6D64]">
                  {matchedCertificate.authorizedSignatory.name}, {matchedCertificate.authorizedSignatory.title} · {matchedCertificate.institution.name}
                </p>
                <p className="text-[11px] text-[#5E6D64]">
                  Affiliation: {matchedCertificate.institution.affiliation} · Location: {matchedCertificate.institution.location}
                </p>
              </div>

              {/* SPECIFICATION MANDATORY PROMINENT DISCLAIMER */}
              <div className="p-4 bg-[#FDF6EB] border border-[#F1DFC4] rounded-2xl text-center space-y-1">
                <span className="text-xs sm:text-sm font-bold tracking-wide text-[#8A5B15] uppercase block">
                  DEMO VERIFICATION — NOT AN OFFICIAL INSTITUTIONAL CREDENTIAL
                </span>
                <p className="text-xs text-[#8A5B15]/90 max-w-xl mx-auto leading-relaxed">
                  This verification response is simulated as part of the CampusFlow hackathon prototype demonstration. 
                  In production, this verification is anchored to the institution's authenticated registrar ledger.
                </p>
              </div>

            </div>
          ) : (
            /* INVALID / NOT FOUND (Exact specification requirement) */
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FCEDEC] text-[#992828] flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#992828]">
                  Certificate not found.
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6D64] max-w-md mx-auto mt-1 leading-relaxed">
                  The certificate reference number <span className="font-mono font-bold text-[#202722]">"{submittedQuery}"</span> was not found in the official registry.
                </p>
              </div>

              <div className="p-4 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl max-w-md mx-auto text-xs text-[#5E6D64] text-left space-y-1">
                <span className="font-bold text-[#202722] block">Verification Checklist:</span>
                <p>• Verify the exact ID from the printed document header (e.g. BPUT-BC-2026-8491).</p>
                <p>• Ensure there are no typographical errors or missing dashes.</p>
                <p>• Only documents approved and officially generated by the Dean are registered.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#5E6D64]">
        Office of the Registrar · Academic Affairs Section · Biju Patnaik University of Technology, Odisha
      </div>
    </div>
  );
};
