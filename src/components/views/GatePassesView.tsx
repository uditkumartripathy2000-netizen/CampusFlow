import React, { useState } from 'react';
import { 
  Luggage, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Calendar, 
  Phone, 
  FileText, 
  AlertCircle, 
  Plus, 
  Eye, 
  ShieldCheck, 
  Check, 
  Printer, 
  X,
  Building2,
  ArrowRight,
  Info
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { GatePassRequest, IssuedGatePass } from '../../types/index.ts';
import { GatePassModal } from '../common/GatePassModal.tsx';

export const GatePassesView: React.FC = () => {
  const { 
    currentUser, 
    gatePassRequests, 
    issuedGatePasses, 
    createGatePassRequest, 
    activeGatePassModal, 
    setActiveGatePassModal 
  } = useCampus();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('16:00');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [expectedReturnTime, setExpectedReturnTime] = useState('20:00');
  const [contactNumber, setContactNumber] = useState(currentUser.phone || '+91 94371 88210');
  const [emergencyContact, setEmergencyContact] = useState('+91 94370 12345 (Guardian)');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter requests for the current student
  const studentRequests = gatePassRequests.filter(r => 
    r.studentId === currentUser.studentId || 
    r.studentEmail === currentUser.email
  );

  const activeIssuedPass = issuedGatePasses.find(p => 
    (p.studentId === currentUser.studentId || p.studentEmail === currentUser.email) && 
    p.status === 'VALID'
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!destination.trim()) {
      setValidationError('Please specify your destination.');
      return;
    }
    if (!reason.trim()) {
      setValidationError('Please explain the reason for outstation travel.');
      return;
    }
    if (new Date(`${departureDate}T${departureTime}`) >= new Date(`${expectedReturnDate}T${expectedReturnTime}`)) {
      setValidationError('Return date & time must be after the departure date & time.');
      return;
    }

    try {
      const created = createGatePassRequest({
        destination: destination.trim(),
        reason: reason.trim(),
        departureDate,
        departureTime,
        expectedReturnDate,
        expectedReturnTime,
        contactNumber: contactNumber.trim(),
        emergencyContact: emergencyContact.trim(),
        notes: notes.trim()
      });

      setFormSuccessMessage(`Gate pass request ${created.id} submitted! Status set to PENDING warden authorization.`);
      setIsRequestModalOpen(false);

      // Reset Form
      setDestination('');
      setReason('');
      setNotes('');
      setTimeout(() => setFormSuccessMessage(null), 6000);
    } catch (err: any) {
      setValidationError(err.message || 'Submission failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
              Digital Gate Pass & Outstation Clearance
            </h2>
            <span className="text-[11px] font-mono text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-0.5 rounded font-bold border border-[#A2C4AF]">
              SECURITY GATE 1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Student hostel outstation permissions, warden digital verification, and QR gate clearance
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#A2C4AF]" />
          <span>Apply for Outstation Pass</span>
        </button>
      </div>

      {/* Success Banner */}
      {formSuccessMessage && (
        <div className="p-4 bg-[#E6F5EF] border border-[#A2C4AF] rounded-2xl text-xs text-[#0D8B65] flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">{formSuccessMessage}</span>
          </div>
          <button onClick={() => setFormSuccessMessage(null)} className="p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Prominent Newly Approved Active Pass Card */}
      {activeIssuedPass && (
        <div className="bg-[#E6F5EF] border-2 border-[#0D8B65] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0D8B65] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Luggage className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-white text-[#0D8B65] px-2.5 py-0.5 rounded-md border border-[#A2C4AF]">
                  {activeIssuedPass.id}
                </span>
                <span className="text-xs font-bold text-[#0D8B65] uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your Gate Pass Has Been Approved!</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#202722]">
                Cleared for Travel: {activeIssuedPass.destination}
              </h3>
              <p className="text-xs text-[#5E6D64]">
                Permitted Window: <strong className="text-[#202722] font-mono">{activeIssuedPass.departureDate} ({activeIssuedPass.departureTime})</strong> until <strong className="text-[#202722] font-mono">{activeIssuedPass.expectedReturnDate} ({activeIssuedPass.expectedReturnTime})</strong>
              </p>
              <div className="text-[11px] text-[#5E6D64]">
                Warden Endorsement: <strong>{activeIssuedPass.approvingAuthority}</strong> ({activeIssuedPass.approvingRole})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveGatePassModal(activeIssuedPass)}
              className="px-5 py-2.5 bg-[#1E3A2F] hover:bg-[#163328] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#A2C4AF]" />
              <span>View Digital Gate Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Gate Pass History List */}
      <div className="bg-white border border-[#E5E9E5] rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
          <div>
            <h3 className="text-base font-bold text-[#202722]">Gate Pass Request History</h3>
            <p className="text-xs text-[#5E6D64]">Official outstation log associated with your authenticated student record</p>
          </div>
          <span className="text-xs text-[#5E6D64] font-mono font-semibold">
            {studentRequests.length} Record(s) Found
          </span>
        </div>

        {studentRequests.length === 0 ? (
          <div className="py-12 text-center text-[#5E6D64] text-xs space-y-2">
            <Luggage className="w-8 h-8 text-[#5E6D64]/40 mx-auto" />
            <p>You have not submitted any gate pass requests yet.</p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-[#0D8B65] hover:underline font-semibold"
            >
              Submit your first request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {studentRequests.map(req => {
              const matchingPass = issuedGatePasses.find(p => p.requestId === req.id);

              return (
                <div 
                  key={req.id}
                  className="p-4 sm:p-5 rounded-2xl border border-[#E5E9E5] hover:border-[#1E3A2F] transition-all bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-[#E6F5EF] text-[#0D8B65] px-2 py-0.5 rounded border border-[#A2C4AF]">
                        {req.id}
                      </span>
                      {req.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Warden Review</span>
                        </span>
                      )}
                      {req.status === 'PASS_ISSUED' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E6F5EF] text-[#0D8B65] border border-[#A2C4AF] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved & Pass Issued</span>
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8] inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Request Declined</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#202722]">
                      {req.destination}
                    </h4>

                    <p className="text-xs text-[#5E6D64] italic">
                      "{req.reason}"
                    </p>

                    <div className="text-xs text-[#5E6D64] flex flex-wrap gap-x-4 gap-y-1">
                      <span>Departure: <strong className="text-[#202722] font-mono">{req.departureDate} at {req.departureTime}</strong></span>
                      <span>Return: <strong className="text-[#202722] font-mono">{req.expectedReturnDate} by {req.expectedReturnTime}</strong></span>
                    </div>

                    {req.rejectionReason && (
                      <div className="text-xs text-[#992828] bg-[#FCEDEC] p-2 rounded-lg mt-1">
                        <strong>Decline Reason:</strong> {req.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {matchingPass ? (
                      <button
                        type="button"
                        onClick={() => setActiveGatePassModal(matchingPass)}
                        className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Pass ({matchingPass.id})</span>
                      </button>
                    ) : (
                      <div className="text-xs text-[#5E6D64] font-medium bg-white px-3 py-1.5 rounded-xl border border-[#E5E9E5]">
                        {req.status === 'PENDING' ? 'Decision Pending' : 'No Active Pass'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. REQUEST MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E9E5] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F5EF] text-[#0D8B65] flex items-center justify-center font-bold text-xs">
                  GP
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202722]">Outstation Gate Pass Request</h3>
                  <p className="text-[11px] text-[#5E6D64]">BPUT Hostel Welfare & Discipline Regulation</p>
                </div>
              </div>
              <button onClick={() => setIsRequestModalOpen(false)} className="p-1 text-[#5E6D64] hover:text-[#202722]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] text-[#992828] text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              
              {/* Readonly Student Identity Info */}
              <div className="p-3.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202722]">{currentUser.name}</span>
                  <span className="font-mono text-[#0D8B65] font-bold">ID: {currentUser.studentId}</span>
                </div>
                <div className="text-[11px] text-[#5E6D64]">
                  {currentUser.department} • {currentUser.hostel || 'Brahmaputra Hall'} ({currentUser.room || 'Block B · Room 314'})
                </div>
              </div>

              {/* Destination & Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">
                  Destination (City / Institution / Home Address) *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Bhubaneswar (Hackathon at SOA University) or Cuttack Home"
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">
                  Reason for Leaving Campus *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain purpose of travel (e.g. Academic competition, family visit, medical treatment)..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs sm:text-sm text-[#202722] focus:outline-none focus:border-[#1E3A2F]"
                />
              </div>

              {/* Departure & Return Date/Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Departure Time *</label>
                  <input
                    type="time"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Expected Return Time *</label>
                  <input
                    type="time"
                    required
                    value={expectedReturnTime}
                    onChange={(e) => setExpectedReturnTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Student Contact *</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Parent / Guardian Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202722] mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Faculty advisor informed, traveling via Vande Bharat Express"
                  className="w-full px-3.5 py-2 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl text-xs text-[#202722]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E9E5] text-xs font-semibold rounded-xl text-[#202722] hover:bg-[#F7F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A2F] hover:bg-[#163328] text-white text-xs font-semibold rounded-xl shadow-2xs"
                >
                  Submit Request for Warden Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Modal */}
      {activeGatePassModal && (
        <GatePassModal
          pass={activeGatePassModal}
          onClose={() => setActiveGatePassModal(null)}
        />
      )}
    </div>
  );
};
