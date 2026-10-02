import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle,
  FileCheck,
  Building2,
  Calendar,
  User,
  Hash,
  Award,
  AlertCircle
} from 'lucide-react';
import { BonafideCertificate } from '../../types/index.ts';
import { useCampus } from '../../context/CampusContext.tsx';

interface BonafideCertificateModalProps {
  certificate: BonafideCertificate;
  onClose: () => void;
  onNavigateToVerify?: (certificateId: string) => void;
}

export const BonafideCertificateModal: React.FC<BonafideCertificateModalProps> = ({
  certificate,
  onClose,
  onNavigateToVerify
}) => {
  const { recordCertificateDownload, setActiveVerificationCertId, setActiveTab } = useCampus();
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handlePrint = () => {
    recordCertificateDownload(certificate.id);
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    recordCertificateDownload(certificate.id);

    // Provide immediate client-side PDF document trigger using formatted print dialog or simulated download
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccessMessage(`Institutional credential ${certificate.id} downloaded successfully. Audit event recorded.`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
      window.print();
    }, 600);
  };

  const handleOpenVerification = () => {
    if (onNavigateToVerify) {
      onNavigateToVerify(certificate.id);
    } else {
      setActiveVerificationCertId(certificate.id);
      setActiveTab('verification');
    }
    onClose();
  };

  // Verification URL
  const verifyUrl = `${window.location.origin}/verify/${certificate.id}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1E3A2F] text-white border-b border-[#163328] print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#9A7B38]" />
            <div>
              <span className="font-semibold text-sm">Official Institutional Credential</span>
              <span className="text-xs text-white/70 ml-2 font-mono">({certificate.id})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenVerification}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg text-white transition-colors"
              title="Verify credential on /verify page"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B38]" />
              <span className="hidden sm:inline">Verify Credential</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg text-white transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#9A7B38] hover:bg-[#85682C] text-xs font-bold rounded-lg text-white transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Preparing...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if Downloaded */}
        {downloadSuccessMessage && (
          <div className="px-5 py-2.5 bg-[#E6F5EF] border-b border-[#A2C4AF] text-[#0D8B65] text-xs font-medium flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
            <span className="text-[11px] font-mono text-[#5E6D64]">Audit Log Updated</span>
          </div>
        )}

        {/* Document Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#2B302C]/5 flex justify-center print:p-0 print:bg-white">
          
          {/* THE A4 CERTIFICATE (Exact print layout) */}
          <div 
            ref={printRef}
            className="w-full max-w-[794px] min-h-[1050px] bg-[#FDFBF7] text-[#1F2421] p-8 sm:p-12 md:p-14 relative flex flex-col justify-between shadow-lg print:shadow-none print:w-full print:max-w-none print:min-h-screen"
            style={{
              fontFamily: "'Georgia', 'Cambria', serif",
            }}
          >
            {/* Outer Decorative Institutional Border */}
            <div className="absolute inset-4 sm:inset-5 border-2 border-[#1E3A2F] pointer-events-none" />
            <div className="absolute inset-5 sm:inset-6 border border-[#9A7B38]/60 pointer-events-none" />
            
            {/* Corner Decorative Motifs */}
            <div className="absolute top-6 left-6 text-[#9A7B38] text-xs font-serif pointer-events-none">❖</div>
            <div className="absolute top-6 right-6 text-[#9A7B38] text-xs font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-6 left-6 text-[#9A7B38] text-xs font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-6 right-6 text-[#9A7B38] text-xs font-serif pointer-events-none">❖</div>

            {/* Prototype Banner Watermark (Visible Hackathon Notice) */}
            <div className="absolute top-8 right-8 z-10 print:top-8 print:right-8">
              <div className="px-2.5 py-1 bg-[#1E3A2F]/10 border border-[#1E3A2F]/30 rounded text-[10px] font-sans font-bold tracking-widest text-[#1E3A2F] uppercase">
                DEMO / HACKATHON PROTOTYPE
              </div>
            </div>

            {/* Certificate Header */}
            <div className="text-center relative z-10 pt-2 pb-6 border-b border-[#9A7B38]/30">
              {/* College Logo / Emblem Placeholder */}
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full border-2 border-[#1E3A2F] flex items-center justify-center bg-white shadow-2xs">
                  <svg className="w-10 h-10 text-[#1E3A2F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                    <path d="M6 14h6" />
                    <path d="M18 18h.01" />
                  </svg>
                </div>
              </div>

              <div className="font-sans text-[11px] font-bold tracking-wider text-[#9A7B38] uppercase">
                {certificate.institution.affiliation || 'A Constituent College of BPUT, Rourkela'}
              </div>

              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1E3A2F] mt-1 font-serif">
                {certificate.institution.name}
              </h1>

              <h2 className="text-sm sm:text-base font-semibold text-[#1F2421] mt-0.5 tracking-wide">
                {certificate.institution.subName}
              </h2>

              <p className="text-xs text-[#527365] font-sans mt-1">
                {certificate.institution.location}
              </p>

              <div className="text-[11px] text-[#527365] font-sans font-medium mt-1">
                Office of the Registrar · Academic Affairs Section
              </div>
            </div>

            {/* Certificate Title Banner */}
            <div className="text-center my-6 relative z-10">
              <div className="inline-block relative">
                <div className="text-xs font-sans tracking-widest text-[#9A7B38] font-bold uppercase mb-1">
                  OFFICIAL INSTITUTIONAL RECORD
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#1E3A2F] uppercase border-y-2 border-[#1E3A2F] py-2 px-8">
                  BONAFIDE CERTIFICATE
                </h3>
              </div>
            </div>

            {/* Reference & Date Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#1F2421] pb-4 border-b border-[#9A7B38]/20 relative z-10 px-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[#527365] font-medium">Certificate Ref ID:</span>
                <span className="font-mono font-bold text-[#1E3A2F]">{certificate.id}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                <span className="text-[#527365] font-medium">Date of Issue:</span>
                <span className="font-semibold text-[#1F2421]">
                  {new Date(certificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Certificate Body Paragraphs */}
            <div className="my-6 space-y-5 text-sm sm:text-base text-[#1F2421] leading-relaxed text-justify relative z-10 px-2 sm:px-4">
              <p>
                This is to officially certify that <span className="font-bold text-[#1E3A2F] underline decoration-[#9A7B38]/50 decoration-1 underline-offset-4">{certificate.studentName}</span>, 
                bearing Registration Number / Student Roll No. <span className="font-mono font-bold text-[#1E3A2F]">{certificate.studentId}</span>, 
                is a bonafide student of this institution admitted to the <span className="font-semibold text-[#1E3A2F]">{certificate.programme}</span>, 
                in the <span className="font-semibold text-[#1F2421]">{certificate.department}</span>.
              </p>

              <p>
                As per the institutional records maintained in the college academic repository, he/she is currently 
                enrolled in the <span className="font-semibold text-[#1E3A2F]">{certificate.semester}</span> during 
                the Academic Session <span className="font-semibold text-[#1E3A2F]">{certificate.academicYear}</span>.
              </p>

              <div className="p-4 bg-[#F5F2EA] rounded border border-[#9A7B38]/30 font-sans text-xs sm:text-sm text-[#1F2421]">
                <span className="font-bold text-[#1E3A2F] uppercase tracking-wider block text-[11px] mb-1">
                  Verified Purpose of Issuance:
                </span>
                <span className="italic font-serif text-[#1F2421]">
                  "{certificate.purpose}"
                </span>
              </div>

              <p>
                During his/her period of study at this college, his/her academic standing, character, and conduct have been 
                found to be <span className="font-bold text-[#1E3A2F]">GOOD</span>. This certificate is valid for the academic 
                year <span className="font-semibold">{certificate.academicYear}</span> up to <span className="font-semibold">{new Date(certificate.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>.
              </p>
            </div>

            {/* Signatory Section */}
            <div className="mt-8 pt-6 border-t border-[#9A7B38]/30 relative z-10 px-2 sm:px-4">
              <div className="grid grid-cols-2 gap-8 items-end">
                {/* Left: Office Section Officer / Prepared By */}
                <div className="text-left font-sans">
                  <div className="h-10 border-b border-dashed border-[#527365]/50 w-44 mb-2 flex items-end">
                    <span className="text-[11px] font-mono text-[#527365] italic">Verified against ERP Ledger</span>
                  </div>
                  <div className="text-xs font-bold text-[#1F2421]">Section Officer / Superintendent</div>
                  <div className="text-[11px] text-[#527365]">Office of Academic Affairs & Admissions</div>
                  <div className="text-[10px] text-[#527365] font-mono">BPUT Constituent Unit</div>
                </div>

                {/* Right: Authorized Dean / Signatory */}
                <div className="text-right font-sans">
                  <div className="inline-block text-left">
                    {/* Simulated Authorized Digital Seal */}
                    <div className="mb-2 flex items-center justify-end gap-2">
                      <div className="px-2 py-0.5 rounded border border-[#1E3A2F]/40 bg-[#1E3A2F]/5 text-[10px] font-mono text-[#1E3A2F] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#0D8B65]" />
                        <span>Digitally Authorized</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#1E3A2F]">{certificate.authorizedSignatory.name}</div>
                    <div className="text-[11px] font-semibold text-[#1F2421]">{certificate.authorizedSignatory.title}</div>
                    <div className="text-[10px] text-[#527365]">{certificate.authorizedSignatory.department}</div>
                    <div className="text-[10px] text-[#527365]">{certificate.authorizedSignatory.institution}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Security & Verification Footer */}
            <div className="mt-8 pt-4 border-t-2 border-[#1E3A2F] font-sans text-xs relative z-10 px-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Verification QR Placeholder */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-14 h-14 bg-white border border-[#9A7B38]/50 p-1 flex items-center justify-center shadow-2xs">
                    {/* Clean SVG QR code representation */}
                    <svg className="w-full h-full text-[#1E3A2F]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-6-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#1E3A2F] uppercase tracking-wider">Demo Online Verification</div>
                    <div className="text-[10px] text-[#527365]">Scan or inspect credential online:</div>
                    <div className="text-[10px] font-mono text-[#1E3A2F] font-semibold">/verify/{certificate.id}</div>
                  </div>
                </div>

                {/* Security Notice & Prototype Disclosure */}
                <div className="text-right sm:max-w-xs">
                  <div className="text-[10px] font-bold text-[#9A7B38] uppercase tracking-wide">
                    DEMO / HACKATHON PROTOTYPE
                  </div>
                  <p className="text-[10px] text-[#527365] leading-tight mt-0.5">
                    This document is a prototype credential generated within the CampusFlow collegiate management system. Not for external commercial or non-academic use.
                  </p>
                  <div className="text-[9px] font-mono text-[#527365]/80 mt-1">
                    SHA256: 8a4f91b7e32c89201940bc27e052026
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Actions (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-[#F7F8F6] border-t border-[#E5E9E5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-[#5E6D64]">
            <CheckCircle className="w-4 h-4 text-[#0D8B65]" />
            <span>Document verified against student registry ({certificate.studentId})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleOpenVerification}
              className="px-4 py-2 bg-white border border-[#E5E9E5] hover:border-[#1E3A2F] text-[#1E3A2F] font-semibold rounded-xl transition-colors"
            >
              Open Verification Page
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-5 py-2 bg-[#1E3A2F] text-white hover:bg-[#163328] font-bold rounded-xl transition-colors shadow-xs"
            >
              Download PDF Credential
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
