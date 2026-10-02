import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Lock
} from 'lucide-react';
import { IssuedGatePass } from '../../types/index.ts';

interface GatePassModalProps {
  pass: IssuedGatePass;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ pass, onClose }) => {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (pass.status) {
      case 'VALID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F5EF] text-[#0D8B65] border border-[#A2C4AF] inline-flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CLEARED FOR GATE EXIT</span>
          </span>
        );
      case 'ALREADY_USED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-300 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>ALREADY USED / RETURN COMPLETED</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4] inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>PASS WINDOW EXPIRED</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8] inline-flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" />
            <span>PASS REVOKED</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF9F5] border border-[#E5E9E5] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Modal Controls Top Bar (Hidden on print) */}
        <div className="p-4 bg-white border-b border-[#E5E9E5] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E6F5EF] text-[#0D8B65] flex items-center justify-center font-bold text-xs">
              GP
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#202722]">Official Digital Gate Pass</h3>
              <p className="text-[11px] text-[#5E6D64]">BPUT Institutional Security Movement Credential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#F7F8F6] hover:bg-[#E5E9E5] text-[#202722] text-xs font-semibold rounded-xl border border-[#E5E9E5] transition-colors flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#0D8B65]" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#5E6D64] hover:text-[#202722] rounded-xl hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Pass Ticket */}
        <div ref={printableRef} className="p-5 sm:p-7 space-y-5 print:p-0">
          
          {/* Ticket Header */}
          <div className="bg-[#1E3A2F] text-white p-5 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 transform skew-x-12 -mr-8 pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A2C4AF] tracking-wider uppercase">
                  <span>CampusFlow Official Pass</span>
                  <span>•</span>
                  <span>Gate 1 Security</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                  Biju Patnaik University of Technology
                </h2>
                <p className="text-[11px] text-[#DCE8DF] mt-0.5">
                  Student Campus Outstation & Gate Exit Clearance
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[#A2C4AF] block uppercase">Pass Serial</span>
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {pass.id}
                </span>
              </div>
            </div>

            {/* Status Pill in Header */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <div className="text-[11px] text-[#DCE8DF]">
                Issued: <strong className="text-white font-mono">{new Date(pass.issuedAt).toLocaleString()}</strong>
              </div>
              <div>{getStatusBadge()}</div>
            </div>
          </div>

          {/* Student Identity Card Section */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-[#E5E9E5]">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F5EF] text-[#0D8B65] font-bold text-base flex items-center justify-center shrink-0 border border-[#A2C4AF]">
                {pass.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-[#202722] truncate">
                  {pass.studentName}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#5E6D64] mt-0.5">
                  <span className="font-mono font-semibold text-[#0D8B65]">Reg: {pass.studentId}</span>
                  <span>•</span>
                  <span>{pass.department}</span>
                </div>
                <div className="text-[11px] text-[#5E6D64] mt-0.5">
                  Residential: <span className="font-medium text-[#202722]">{pass.hostel} ({pass.room})</span>
                </div>
              </div>
            </div>

            {/* Travel Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                <div className="text-[10px] uppercase font-bold text-[#5E6D64] flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-[#0D8B65]" />
                  <span>Destination</span>
                </div>
                <div className="font-bold text-[#202722] text-xs leading-snug">
                  {pass.destination}
                </div>
              </div>

              <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
                <div className="text-[10px] uppercase font-bold text-[#5E6D64] flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3 text-[#0D8B65]" />
                  <span>Student Contact</span>
                </div>
                <div className="font-mono font-bold text-[#202722] text-xs">
                  {pass.contactNumber}
                </div>
              </div>
            </div>

            {/* Travel Timing Windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EEF4F9] rounded-xl border border-[#C8DCED]">
                <div className="text-[10px] uppercase font-bold text-[#234E70] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#234E70]" />
                  <span>Permitted Departure</span>
                </div>
                <div className="text-xs font-bold text-[#202722] font-mono mt-1">
                  {pass.departureDate} at {pass.departureTime}
                </div>
              </div>

              <div className="p-3 bg-[#FDF6EB] rounded-xl border border-[#F1DFC4]">
                <div className="text-[10px] uppercase font-bold text-[#8A5B15] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8A5B15]" />
                  <span>Expected Return Window</span>
                </div>
                <div className="text-xs font-bold text-[#202722] font-mono mt-1">
                  {pass.expectedReturnDate} by {pass.expectedReturnTime}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] text-xs">
              <span className="text-[10px] font-bold text-[#5E6D64] uppercase block mb-0.5">Authorized Reason:</span>
              <p className="text-xs text-[#202722] leading-relaxed italic">{pass.reason}</p>
            </div>
          </div>

          {/* Security Verification & QR Section */}
          <div className="bg-white border-2 border-dashed border-[#A2C4AF] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Authority & Security Check Info */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-[#0D8B65] uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Token Verification</span>
              </div>
              <div className="font-mono text-sm font-bold text-[#1E3A2F] tracking-wide select-all bg-[#E6F5EF] px-2.5 py-1 rounded-lg border border-[#A2C4AF] inline-block">
                {pass.verificationToken}
              </div>
              <p className="text-[10px] text-[#5E6D64] max-w-xs leading-normal">
                Present this code or QR at Gate 1 Main Entrance. Security guard terminal will register departure timestamp.
              </p>
              <div className="text-[10px] text-[#5E6D64] pt-1">
                Authorized By: <strong className="text-[#202722]">{pass.approvingAuthority}</strong> ({pass.approvingRole})
              </div>
            </div>

            {/* Right: SVG QR Code */}
            <div className="p-2.5 bg-white border border-[#E5E9E5] rounded-xl shadow-2xs shrink-0 flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="shape-rendering-crispEdges">
                {/* Visual SVG QR Pattern Representation */}
                <rect width="100" height="100" fill="#FFFFFF" />
                {/* Top Left Corner Marker */}
                <rect x="6" y="6" width="26" height="26" fill="#1E3A2F" rx="3" />
                <rect x="10" y="10" width="18" height="18" fill="#FFFFFF" rx="2" />
                <rect x="14" y="14" width="10" height="10" fill="#1E3A2F" rx="1.5" />
                {/* Top Right Corner Marker */}
                <rect x="68" y="6" width="26" height="26" fill="#1E3A2F" rx="3" />
                <rect x="72" y="10" width="18" height="18" fill="#FFFFFF" rx="2" />
                <rect x="76" y="14" width="10" height="10" fill="#1E3A2F" rx="1.5" />
                {/* Bottom Left Corner Marker */}
                <rect x="6" y="68" width="26" height="26" fill="#1E3A2F" rx="3" />
                <rect x="10" y="72" width="18" height="18" fill="#FFFFFF" rx="2" />
                <rect x="14" y="76" width="10" height="10" fill="#1E3A2F" rx="1.5" />
                {/* Dense Data Dots */}
                <rect x="36" y="10" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="10" width="6" height="6" fill="#1E3A2F" />
                <rect x="56" y="10" width="6" height="6" fill="#1E3A2F" />
                <rect x="36" y="20" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="26" width="6" height="6" fill="#1E3A2F" />
                <rect x="36" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="56" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="68" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="78" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="88" y="36" width="6" height="6" fill="#1E3A2F" />
                <rect x="10" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="20" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="36" y="46" width="14" height="14" fill="#0D8B65" rx="2" />
                <rect x="54" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="64" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="74" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="84" y="46" width="6" height="6" fill="#1E3A2F" />
                <rect x="36" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="56" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="68" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="78" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="88" y="68" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="78" width="6" height="6" fill="#1E3A2F" />
                <rect x="56" y="78" width="6" height="6" fill="#1E3A2F" />
                <rect x="68" y="78" width="6" height="6" fill="#1E3A2F" />
                <rect x="78" y="78" width="6" height="6" fill="#1E3A2F" />
                <rect x="88" y="78" width="6" height="6" fill="#1E3A2F" />
                <rect x="36" y="88" width="6" height="6" fill="#1E3A2F" />
                <rect x="46" y="88" width="6" height="6" fill="#1E3A2F" />
                <rect x="68" y="88" width="6" height="6" fill="#1E3A2F" />
                <rect x="88" y="88" width="6" height="6" fill="#1E3A2F" />
              </svg>
              <span className="text-[9px] font-mono text-[#5E6D64] mt-1 font-semibold">SCAN AT GATE</span>
            </div>
          </div>

          {/* Movement Log (if departure or return recorded) */}
          {(pass.departureLoggedAt || pass.returnLoggedAt) && (
            <div className="p-3 bg-[#FDFBF7] border border-[#E5E9E5] rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#8A5B15] uppercase tracking-wider block">
                Gate Movement Log
              </span>
              {pass.departureLoggedAt && (
                <div className="flex items-center justify-between text-[#202722]">
                  <span>Campus Departure Logged:</span>
                  <span className="font-mono font-bold text-[#0D8B65]">
                    {new Date(pass.departureLoggedAt).toLocaleTimeString()} ({pass.departureLoggedBy || 'Security'})
                  </span>
                </div>
              )}
              {pass.returnLoggedAt && (
                <div className="flex items-center justify-between text-[#202722]">
                  <span>Campus Return Logged:</span>
                  <span className="font-mono font-bold text-[#234E70]">
                    {new Date(pass.returnLoggedAt).toLocaleTimeString()} ({pass.returnLoggedBy || 'Security'})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer Terms */}
          <div className="text-[10px] text-[#5E6D64] text-center leading-relaxed">
            Non-transferable institutional pass. Issued subject to BPUT Hostel Discipline Regulations and curfew adherence.
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-[#E5E9E5] flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E9E5] text-[#202722] text-xs font-semibold rounded-xl hover:bg-[#F7F8F6] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
