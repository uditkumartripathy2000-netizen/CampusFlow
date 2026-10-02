import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Award, 
  Calendar, 
  Search,
  Building2,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { BonafideCertificate, RequestItem } from '../../types/index.ts';
import { BonafideCertificateModal } from '../common/BonafideCertificateModal.tsx';

interface MyDocumentsViewProps {
  onOpenWizard: (category?: 'bonafide') => void;
  onNavigateToVerify?: (certificateId: string) => void;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({
  onOpenWizard,
  onNavigateToVerify
}) => {
  const { 
    currentUser, 
    certificates, 
    requests, 
    recordCertificateDownload,
    setActiveVerificationCertId,
    setActiveTab
  } = useCampus();

  const [selectedCert, setSelectedCert] = useState<BonafideCertificate | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // 1. ISOLATION: Students must ONLY see documents issued to their own authenticated account
  const myCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchId = currentUser.studentId && cert.studentId === currentUser.studentId;
      const matchEmail = currentUser.email && cert.studentEmail?.toLowerCase() === currentUser.email.toLowerCase();
      // If student profile matches name as fallback
      const matchName = cert.studentName.toLowerCase() === currentUser.name.toLowerCase();
      return matchId || matchEmail || matchName;
    });
  }, [certificates, currentUser]);

  // Filtered by local search query
  const filteredCertificates = useMemo(() => {
    if (!docSearchQuery.trim()) return myCertificates;
    const q = docSearchQuery.toLowerCase();
    return myCertificates.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.purpose.toLowerCase().includes(q) ||
      c.programme.toLowerCase().includes(q) ||
      c.academicYear.toLowerCase().includes(q)
    );
  }, [myCertificates, docSearchQuery]);

  // 2. Active Bonafide Requests Lifecycle for this authenticated student
  const myBonafideRequests = useMemo(() => {
    return requests.filter(r => {
      if (r.category !== 'bonafide') return false;
      const matchId = currentUser.studentId && r.studentId === currentUser.studentId;
      const matchEmail = currentUser.email && r.studentEmail?.toLowerCase() === currentUser.email.toLowerCase();
      const matchName = r.studentName.toLowerCase() === currentUser.name.toLowerCase();
      return matchId || matchEmail || matchName;
    });
  }, [requests, currentUser]);

  const activeBonafideRequest = useMemo(() => {
    return myBonafideRequests.find(r => r.status !== 'closed' && r.status !== 'resolved') || 
           myBonafideRequests[0] || null;
  }, [myBonafideRequests]);

  const handleDownload = (cert: BonafideCertificate) => {
    recordCertificateDownload(cert.id);
    setSelectedCert(cert);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleVerify = (certId: string) => {
    if (onNavigateToVerify) {
      onNavigateToVerify(certId);
    } else {
      setActiveVerificationCertId(certId);
      setActiveTab('verification');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E9E5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight leading-snug">
              My Documents & Credentials
            </h2>
            <span className="text-xs font-mono bg-[#E6F5EF] text-[#0D8B65] px-2.5 py-1 rounded font-semibold border border-[#A2C4AF] leading-none">
              Student Portal
            </span>
          </div>
          <p className="text-sm text-[#5E6D64] leading-relaxed mt-1">
            Digitally signed institutional documents issued to {currentUser.name} ({currentUser.studentId || 'Reg No. 2201289140'})
          </p>
        </div>

        <button
          onClick={() => onOpenWizard('bonafide')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A2F] text-white rounded-xl text-sm font-semibold hover:bg-[#163328] transition-colors shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#9A7B38]" />
          <span>Request Bonafide Certificate</span>
        </button>
      </div>

      {/* REQUEST LIFECYCLE TRACKER (When Student has a Bonafide Request) */}
      {activeBonafideRequest && (
        <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E9E5]">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-[#202722] uppercase tracking-wider text-xs">
                Bonafide Certificate Request Tracker
              </span>
              <span className="text-[#5E6D64]">·</span>
              <span className="font-mono text-[#0D8B65] font-bold text-xs">{activeBonafideRequest.id}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5E6D64] font-medium leading-normal">
                Requested on {new Date(activeBonafideRequest.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#202722] mb-1.5 leading-snug">{activeBonafideRequest.title}</h4>
            <p className="text-sm text-[#5E6D64] leading-relaxed">{activeBonafideRequest.description}</p>
          </div>

          {/* 4-STAGE LIFECYCLE STEPPER */}
          {/* Submitted -> Under Review -> Approved -> Certificate Issued */}
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative">
              {/* Stage 1: Submitted */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                activeBonafideRequest.status !== 'closed'
                  ? 'bg-[#E6F5EF] border-[#A2C4AF] text-[#0D8B65]'
                  : 'bg-[#F7F8F6] border-[#E5E9E5] text-[#5E6D64]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">1. Submitted</span>
                  <CheckCircle2 className="w-4 h-4 text-[#0D8B65]" />
                </div>
                <div className="text-xs text-[#202722] font-semibold leading-normal">Application Registered</div>
                <div className="text-xs text-[#5E6D64] mt-0.5 leading-relaxed">ERP dues cleared</div>
              </div>

              {/* Stage 2: Under Review */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                activeBonafideRequest.status === 'assigned' || activeBonafideRequest.status === 'in_progress'
                  ? 'bg-[#FDF6EB] border-[#F1DFC4] text-[#8A5B15] ring-2 ring-[#8A5B15]/20'
                  : activeBonafideRequest.status === 'approved' || activeBonafideRequest.status === 'resolved'
                    ? 'bg-[#E6F5EF] border-[#A2C4AF] text-[#0D8B65]'
                    : 'bg-[#F7F8F6] border-[#E5E9E5] text-[#5E6D64]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">2. Under Review</span>
                  {(activeBonafideRequest.status === 'assigned' || activeBonafideRequest.status === 'in_progress') ? (
                    <Clock className="w-4 h-4 text-[#8A5B15] animate-pulse" />
                  ) : (activeBonafideRequest.status === 'approved' || activeBonafideRequest.status === 'resolved') ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0D8B65]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-dashed border-[#5E6D64]" />
                  )}
                </div>
                <div className="text-xs text-[#202722] font-semibold leading-normal">Academic Section</div>
                <div className="text-xs text-[#5E6D64] mt-0.5 leading-relaxed truncate">
                  {activeBonafideRequest.assignedStaff || 'Queue Reviewer'}
                </div>
              </div>

              {/* Stage 3: Approved */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                activeBonafideRequest.status === 'approved'
                  ? 'bg-[#E6F5EF] border-[#0D8B65] text-[#0D8B65] ring-2 ring-[#0D8B65]/20'
                  : activeBonafideRequest.status === 'resolved'
                    ? 'bg-[#E6F5EF] border-[#A2C4AF] text-[#0D8B65]'
                    : 'bg-[#F7F8F6] border-[#E5E9E5] text-[#5E6D64]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">3. Approved</span>
                  {activeBonafideRequest.status === 'approved' || activeBonafideRequest.status === 'resolved' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0D8B65]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-dashed border-[#5E6D64]" />
                  )}
                </div>
                <div className="text-xs text-[#202722] font-semibold leading-normal">Dean Authorization</div>
                <div className="text-xs text-[#5E6D64] mt-0.5 leading-relaxed truncate">
                  {activeBonafideRequest.details?.approvedBy || 'Office of Dean'}
                </div>
              </div>

              {/* Stage 4: Certificate Issued */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                activeBonafideRequest.status === 'resolved'
                  ? 'bg-[#1E3A2F] border-[#163328] text-white shadow-xs'
                  : 'bg-[#F7F8F6] border-[#E5E9E5] text-[#5E6D64]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${activeBonafideRequest.status === 'resolved' ? 'text-[#9A7B38]' : ''}`}>
                    4. Certificate Issued
                  </span>
                  {activeBonafideRequest.status === 'resolved' ? (
                    <Award className="w-4 h-4 text-[#9A7B38]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-dashed border-[#5E6D64]" />
                  )}
                </div>
                <div className={`text-xs font-semibold leading-normal ${activeBonafideRequest.status === 'resolved' ? 'text-white font-mono font-bold' : 'text-[#202722]'}`}>
                  {activeBonafideRequest.details?.certificateId || 'Pending Seal'}
                </div>
                <div className={`text-xs mt-0.5 leading-relaxed ${activeBonafideRequest.status === 'resolved' ? 'text-white/80' : 'text-[#5E6D64]'}`}>
                  Available in Repository
                </div>
              </div>
            </div>
          </div>

          {/* User Feedback Callout based on exact prompt specifications */}
          {(activeBonafideRequest.status === 'submitted' || activeBonafideRequest.status === 'assigned' || activeBonafideRequest.status === 'in_progress') && (
            <div className="p-4 sm:p-5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl text-sm text-[#8A5B15] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0 text-[#8A5B15]" />
                <span className="font-semibold text-sm leading-normal">
                  Your certificate request is being reviewed.
                </span>
              </div>
              <span className="text-xs font-mono text-[#8A5B15] font-semibold bg-white/60 px-3 py-1 rounded-md border border-[#F1DFC4]">
                Estimated SLA: {activeBonafideRequest.slaHours} hours
              </span>
            </div>
          )}

          {activeBonafideRequest.status === 'approved' && (
            <div className="p-4 sm:p-5 bg-[#E6F5EF] border border-[#A2C4AF] rounded-xl text-sm text-[#0D8B65] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0D8B65]" />
                <span className="font-semibold text-sm leading-normal">
                  Your request has been approved by the Dean of Academic Affairs. Certificate generation is being processed.
                </span>
              </div>
              <span className="text-xs font-mono font-semibold bg-white px-3 py-1 rounded-md border border-[#A2C4AF]">
                Authorized
              </span>
            </div>
          )}

          {activeBonafideRequest.status === 'closed' && activeBonafideRequest.details?.rejectionReason && (
            <div className="p-4 sm:p-5 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl text-sm text-[#992828] space-y-1.5">
              <div className="flex items-center gap-2.5 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-[#992828]" />
                <span className="text-sm">Application Returned / Rejected</span>
              </div>
              <p className="text-xs text-[#992828] leading-relaxed pl-7">
                {activeBonafideRequest.details.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ISSUED DOCUMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#202722] leading-snug">
              Issued Institutional Certificates ({myCertificates.length})
            </h3>
            <p className="text-sm text-[#5E6D64] leading-relaxed mt-0.5">
              Verified credentials officially authorized and downloadable for scholarship, visa, and institutional submissions
            </p>
          </div>

          {myCertificates.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E6D64]" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search issued documents..."
                className="pl-10 pr-4 py-2 bg-white border border-[#E5E9E5] rounded-xl text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F] w-72 shadow-2xs leading-normal"
              />
            </div>
          )}
        </div>

        {/* DOCUMENTS LIST / GRID */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map(cert => (
              <div 
                key={cert.id}
                className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs hover:border-[#1E3A2F]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & ID */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#E6F5EF] text-[#0D8B65] text-xs font-bold rounded-md border border-[#A2C4AF] leading-none">
                        VALID CREDENTIAL
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1E3A2F]">{cert.id}</span>
                    </div>

                    <span className="text-xs text-[#5E6D64] font-mono">
                      Issued {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & Purpose */}
                  <h4 className="text-base font-bold text-[#202722] mb-1 leading-snug">
                    Institutional Bonafide Certificate
                  </h4>
                  <p className="text-sm text-[#5E6D64] leading-relaxed mb-4">
                    <span className="font-semibold text-[#202722]">Purpose: </span>
                    {cert.purpose}
                  </p>

                  {/* Metadata chips */}
                  <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] mb-4">
                    <div>
                      <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Student:</span>
                      <span className="font-semibold text-sm text-[#202722] leading-snug block mt-0.5">{cert.studentName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Academic Session:</span>
                      <span className="font-semibold text-sm text-[#202722] leading-snug block mt-0.5">{cert.academicYear}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-[#5E6D64] font-medium leading-relaxed block">Authorized Signatory:</span>
                      <span className="font-medium text-xs text-[#202722] leading-relaxed block mt-0.5">{cert.authorizedSignatory.name} ({cert.authorizedSignatory.title})</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-[#E5E9E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#5E6D64] leading-normal">
                    {cert.downloadCount > 0 ? (
                      <span className="text-[#0D8B65] font-medium">Downloaded {cert.downloadCount} {cert.downloadCount === 1 ? 'time' : 'times'}</span>
                    ) : (
                      <span>Not downloaded yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(cert.id)}
                      className="px-3 py-2 bg-[#F7F8F6] hover:bg-[#E5E9E5] text-[#202722] text-xs font-semibold rounded-lg transition-colors border border-[#E5E9E5] flex items-center gap-1.5"
                      title="Inspect online verification record"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#0D8B65]" />
                      <span>Verify</span>
                    </button>

                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Certificate</span>
                    </button>

                    <button
                      onClick={() => handleDownload(cert)}
                      className="px-3.5 py-2 bg-[#9A7B38] hover:bg-[#85682C] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State when student has no issued documents */
          <div className="p-8 sm:p-12 text-center bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6F5EF] text-[#0D8B65] flex items-center justify-center mx-auto">
              <FileCheck className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h4 className="text-base font-bold text-[#202722] leading-snug">No Issued Documents Found</h4>
              <p className="text-sm text-[#5E6D64] mt-1.5 leading-relaxed">
                You currently have no active certificates issued to your account ({currentUser.studentId || '2201289140'}). 
                Submit a new Bonafide Certificate request to obtain an authorized institutional document.
              </p>
            </div>

            <button
              onClick={() => onOpenWizard('bonafide')}
              className="px-5 py-2.5 bg-[#1E3A2F] text-white text-sm font-semibold rounded-xl hover:bg-[#163328] transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#9A7B38]" />
              <span>Submit Bonafide Certificate Request</span>
            </button>
          </div>
        )}
      </div>

      {/* Institutional Document Standards Notice */}
      <div className="p-6 bg-[#FDFBF7] border border-[#E4E2D9] rounded-2xl text-xs space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-sm text-[#1E3A2F]">
          <Award className="w-5 h-5 text-[#9A7B38]" />
          <span>Collegiate Document Verification & Authenticity Policy</span>
        </div>
        <p className="text-xs sm:text-sm text-[#5E6D64] leading-relaxed">
          All bonafide certificates issued through CampusFlow undergo statutory ERP ledger verification and Dean approval. 
          Each document is assigned a unique institutional cryptographic reference ID (<span className="font-mono text-[#1E3A2F]">BPUT-BC-YYYY-XXXX</span>) 
          and can be verified anytime by external agencies, scholarship portals, and banks via the institutional verification URL.
        </p>
        <div className="text-xs font-mono text-[#8A5B15]">
          DEMO / HACKATHON PROTOTYPE: Credentials generated in this environment are for proof-of-concept testing.
        </div>
      </div>

      {/* MODAL: Full Institutional A4 Certificate Viewer */}
      {selectedCert && (
        <BonafideCertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          onNavigateToVerify={onNavigateToVerify}
        />
      )}
    </div>
  );
};
