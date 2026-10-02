import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Wrench, 
  Luggage, 
  Calendar, 
  UtensilsCrossed, 
  IndianRupee, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Upload, 
  Info,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { RequestCategory, RequestPriority, RequestItem } from '../../types/index.ts';
import { CAMPUS_LOCATIONS } from '../../data/campusLocations.ts';

interface RequestWizardViewProps {
  initialCategory?: RequestCategory;
  initialCampusLocationId?: string;
  initialCampusLocationName?: string;
  onSuccess: (requestId: string) => void;
  onCancel: () => void;
}

export const RequestWizardView: React.FC<RequestWizardViewProps> = ({
  initialCategory = 'bonafide',
  initialCampusLocationId,
  initialCampusLocationName,
  onSuccess,
  onCancel,
}) => {
  const { 
    currentUser, 
    createRequest, 
    requests, 
    linkToIncident,
    getActiveUrgentRequest,
    checkUrgentEligibility 
  } = useCampus();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<RequestCategory>(initialCategory);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Severity / Priority Selection (Policy 1)
  // Routine = medium, Elevated = high, Critical Safety = urgent (subject to qualification)
  const [severityOption, setSeverityOption] = useState<'routine' | 'elevated' | 'critical'>('routine');
  const [urgentReason, setUrgentReason] = useState('');
  const [isEmergencySafetyRisk, setIsEmergencySafetyRisk] = useState(false);

  // Bonafide
  const [bonafidePurpose, setBonafidePurpose] = useState('National Scholarship Portal (NSP) Renewal');
  const [deliveryPreference, setDeliveryPreference] = useState<'digital' | 'counter'>('digital');

  // Maintenance
  const [maintenanceSubcategory, setMaintenanceSubcategory] = useState('Plumbing & Water Supply');
  const [selectedCampusLocationId, setSelectedCampusLocationId] = useState<string>(
    initialCampusLocationId || 'hostel_block_a'
  );
  const [hostelBlock, setHostelBlock] = useState(initialCampusLocationName || 'Student Hostel A (Brahmaputra Hall)');
  const [roomNumber, setRoomNumber] = useState('314');
  const [hasImageAttachment, setHasImageAttachment] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [detectedDuplicates, setDetectedDuplicates] = useState<RequestItem[]>([]);
  const [selectedIncidentLink, setSelectedIncidentLink] = useState<string | null>(null);

  // Leave & Gate Pass
  const [departureDate, setDepartureDate] = useState('2026-10-02');
  const [departureTime, setDepartureTime] = useState('17:30');
  const [returnDate, setReturnDate] = useState('2026-10-05');
  const [returnTime, setReturnTime] = useState('08:00');
  const [destination, setDestination] = useState('Cuttack, Odisha');
  const [leaveReason, setLeaveReason] = useState('Family social visit over long weekend');
  const [emergencyContact, setEmergencyContact] = useState('+91 94370 12345 (Parent)');

  // Timetable
  const [subject, setSubject] = useState('Distributed Systems & Cloud (CS-303)');
  const [classDate, setClassDate] = useState('2026-10-02');
  const [timetableQueryType, setTimetableQueryType] = useState('Room Clash / Schedule Overlap');

  // Mess
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('dinner');
  const [messCategory, setMessCategory] = useState('Quality & Taste');
  const [rating, setRating] = useState(4);

  // Fee Dues
  const [feeCategory, setFeeCategory] = useState('Semester Examination Fee Verification');
  const [academicTerm, setAcademicTerm] = useState('6th Semester 2026');

  // Form errors
  const [formError, setFormError] = useState<string | null>(null);

  // Check active urgent allowance for the current student
  const activeUrgentTicket = useMemo(() => {
    return getActiveUrgentRequest(currentUser.studentId || '2201289140');
  }, [getActiveUrgentRequest, currentUser.studentId, requests]);

  // Check eligibility for urgent classification based on current form values
  const urgentEligibility = useMemo(() => {
    return checkUrgentEligibility(category, {
      issueSubcategory: maintenanceSubcategory,
      reason: leaveReason,
      description: description + ' ' + title,
      isEmergencySafetyRisk
    });
  }, [checkUrgentEligibility, category, maintenanceSubcategory, leaveReason, description, title, isEmergencySafetyRisk]);

  // Calculate effective priority before final submission
  const effectivePriorityCalculation = useMemo(() => {
    if (severityOption === 'routine') {
      return { priority: 'medium' as RequestPriority, status: 'standard', note: 'Standard priority with regular department SLA.' };
    }
    if (severityOption === 'elevated') {
      return { priority: 'high' as RequestPriority, status: 'elevated', note: 'Time-sensitive issue queued for expedited staff action.' };
    }
    // severityOption === 'critical'
    if (!urgentEligibility.eligible) {
      return { 
        priority: 'medium' as RequestPriority, 
        status: 'ineligible', 
        note: urgentEligibility.reason 
      };
    }
    if (activeUrgentTicket) {
      return { 
        priority: 'high' as RequestPriority, 
        status: 'quota_reached', 
        note: `Active urgent slot currently in use by ticket ${activeUrgentTicket.id}. This request will be submitted at High priority and flagged for priority review by the duty supervisor.` 
      };
    }
    return { 
      priority: 'urgent' as RequestPriority, 
      status: 'approved_urgent', 
      note: 'Meets emergency criteria. Fast-track 12h SLA assigned with immediate staff alerts.' 
    };
  }, [severityOption, urgentEligibility, activeUrgentTicket]);

  // Duplicate maintenance report check
  const handleCheckDuplicates = () => {
    if (category === 'maintenance') {
      const matches = requests.filter(r => 
        r.category === 'maintenance' &&
        (r.details.hostelBlock === hostelBlock || r.details.issueSubcategory === maintenanceSubcategory) &&
        r.status !== 'closed'
      );
      setDetectedDuplicates(matches);
    }
  };

  const handleNextFromStep1 = (cat: RequestCategory) => {
    setCategory(cat);
    if (cat === 'bonafide') setTitle('Bonafide Certificate Request');
    else if (cat === 'maintenance') setTitle('Hostel Maintenance Issue');
    else if (cat === 'leave_gatepass') setTitle('Hostel Leave & Gate Pass');
    else if (cat === 'timetable') setTitle('Timetable / Lecture Query');
    else if (cat === 'mess') setTitle('Dining Hall & Mess Feedback');
    else if (cat === 'fee_dues') setTitle('Fee Reconciliation & Dues Query');
    setSeverityOption('routine');
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Please enter a request title / summary.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter detailed information for this request.');
      return;
    }
    if (severityOption === 'critical' && urgentEligibility.eligible && !urgentReason.trim()) {
      setFormError('Please state the specific safety hazard or essential outage reason for requesting Urgent priority.');
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = () => {
    if (isSubmitting) return; // Prevent race conditions & duplicate clicks
    setIsSubmitting(true);

    const detailsPayload: any = {
      isEmergencySafetyRisk
    };

    if (category === 'bonafide') {
      detailsPayload.purpose = bonafidePurpose;
      detailsPayload.deliveryPreference = deliveryPreference;
      detailsPayload.academicYear = '2026-2027';
      detailsPayload.erpFeeStatus = 'Cleared (Sample College ERP Record)';
    } else if (category === 'maintenance') {
      detailsPayload.issueSubcategory = maintenanceSubcategory;
      detailsPayload.hostelBlock = hostelBlock;
      detailsPayload.roomNumber = roomNumber;
      detailsPayload.campusLocationId = selectedCampusLocationId;
      detailsPayload.campusLocationName = CAMPUS_LOCATIONS.find(l => l.id === selectedCampusLocationId)?.name || hostelBlock;
      detailsPayload.hasImageAttachment = hasImageAttachment;
      detailsPayload.attachmentName = attachmentName;
      if (selectedIncidentLink) {
        detailsPayload.linkedIncidentId = selectedIncidentLink;
      }
    } else if (category === 'leave_gatepass') {
      detailsPayload.departureDate = departureDate;
      detailsPayload.departureTime = departureTime;
      detailsPayload.returnDate = returnDate;
      detailsPayload.returnTime = returnTime;
      detailsPayload.destination = destination;
      detailsPayload.reason = leaveReason;
      detailsPayload.emergencyContact = emergencyContact;
      detailsPayload.wardenApproved = false;
      detailsPayload.gateLoggedOut = false;
      detailsPayload.gateLoggedIn = false;
    } else if (category === 'timetable') {
      detailsPayload.subject = subject;
      detailsPayload.classDate = classDate;
      detailsPayload.queryType = timetableQueryType;
    } else if (category === 'mess') {
      detailsPayload.mealType = mealType;
      detailsPayload.messFeedbackCategory = messCategory;
      detailsPayload.rating = rating;
    } else if (category === 'fee_dues') {
      detailsPayload.feeCategory = feeCategory;
      detailsPayload.sampleBalance = '₹0 Outstanding (Sample Mock Data)';
      detailsPayload.academicTerm = academicTerm;
    }

    try {
      const created = createRequest({
        title,
        category,
        priority: severityOption === 'critical' ? 'urgent' : severityOption === 'elevated' ? 'high' : 'medium',
        priorityReason: urgentReason.trim() || undefined,
        description,
        details: detailsPayload,
      });

      if (selectedIncidentLink) {
        linkToIncident(created.id, selectedIncidentLink);
      }

      setCreatedRequestId(created.id);
      setStep(4);
    } catch (err) {
      console.error('Submission failed', err);
      setFormError('Submission encountered an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Wizard Header & Step Tracker */}
      <div className="bg-white border border-[#E4E2D9] rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#26312B] tracking-tight">Request Launcher</h2>
            <p className="text-xs text-[#65736A] mt-0.5">Submit campus requests with automated routing and fair priority management</p>
          </div>
          <button 
            onClick={onCancel}
            className="text-xs text-[#65736A] hover:text-[#26312B] px-3 py-1.5 rounded-lg border border-[#E4E2D9] hover:bg-[#F7F5F0] transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between relative pt-2">
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-[#E4E2D9] -z-0" />
          {[
            { num: 1, label: '1. Intent' },
            { num: 2, label: '2. Details & Urgency' },
            { num: 3, label: '3. Policy Review' },
            { num: 4, label: '4. Tracking ID' },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isDone 
                    ? 'bg-[#203B32] text-white' 
                    : isCurrent 
                      ? 'bg-white border-2 border-[#203B32] text-[#203B32]' 
                      : 'bg-[#F7F5F0] border border-[#E4E2D9] text-[#65736A]'
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium ${isCurrent ? 'text-[#203B32] font-semibold' : 'text-[#65736A]'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE REQUEST TYPE */}
      {step === 1 && (
        <div className="bg-white border border-[#E4E2D9] rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#26312B]">Step 1: Choose request category</h3>
            <p className="text-xs text-[#65736A] mt-0.5">Select the campus service you require to auto-route across departments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                id: 'bonafide' as RequestCategory,
                title: 'Bonafide Certificate',
                desc: 'Digital or counter study certificate for scholarships (NSP), education loan, or passport.',
                dept: 'Registrar Academic Section',
                icon: FileCheck,
              },
              {
                id: 'maintenance' as RequestCategory,
                title: 'Hostel Maintenance',
                desc: 'Plumbing, electrical, carpentry repairs with automated duplicate block detection.',
                dept: 'Works & Maintenance (FretBox)',
                icon: Wrench,
              },
              {
                id: 'leave_gatepass' as RequestCategory,
                title: 'Leave & Gate Pass',
                desc: 'Weekend or emergency outstation pass with warden authorization & security QR sync.',
                dept: 'Hostel Warden & Security Gate',
                icon: Luggage,
              },
              {
                id: 'timetable' as RequestCategory,
                title: 'Timetable / Class Query',
                desc: 'Room clashes, rescheduled lab sessions, or academic scheduling conflicts.',
                dept: 'Academic LMS & Class Scheduler',
                icon: Calendar,
              },
              {
                id: 'mess' as RequestCategory,
                title: 'Mess & Dining Feedback',
                desc: 'Report meal quality issues, serving delays, or suggest seasonal menu additions.',
                dept: 'Central Mess Committee',
                icon: UtensilsCrossed,
              },
              {
                id: 'fee_dues' as RequestCategory,
                title: 'Fee / Dues Query',
                desc: 'Payment reconciliation (SBI Collect/UPI) and caution deposit clearance query.',
                dept: 'Finance & Accounts Office',
                icon: IndianRupee,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNextFromStep1(item.id)}
                  className="p-4 rounded-xl border border-[#E4E2D9] hover:border-[#203B32] hover:bg-[#F7F5F0] text-left transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#DCE8DF] text-[#203B32] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#26312B] group-hover:text-[#203B32] transition-colors">{item.title}</h4>
                    <p className="text-xs text-[#65736A] leading-relaxed mt-1">{item.desc}</p>
                    <div className="text-[11px] text-[#65736A] mt-2 font-mono">Routes to: {item.dept}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: ENTER REQUIRED DETAILS & SEVERITY */}
      {step === 2 && (
        <div className="bg-white border border-[#E4E2D9] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2D9]">
            <div>
              <h3 className="text-sm font-bold text-[#26312B]">Step 2: Enter Request Details & Severity</h3>
              <p className="text-xs text-[#65736A]">Fill out the parameters and indicate the issue seriousness level.</p>
            </div>
            <span className="text-xs font-semibold text-[#203B32] uppercase px-2 py-0.5 rounded bg-[#DCE8DF]/60">
              {category.replace('_', ' ')}
            </span>
          </div>

          {formError && (
            <div className="p-3.5 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl flex items-start gap-2.5 text-xs text-[#992828]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {/* Common Field: Title */}
          <div>
            <label className="block text-xs font-semibold text-[#26312B] mb-1.5">
              Request Title / Summary *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pipeline seepage in washroom ceiling / Leave pass for medical visit"
              className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32] focus:bg-white transition-colors"
            />
          </div>

          {/* CATEGORY-SPECIFIC FORM FIELDS */}
          {/* A. Bonafide */}
          {category === 'bonafide' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              <div className="p-3.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl text-xs space-y-1">
                <div className="font-semibold text-[#26312B]">Student Identity Pre-Verified (Demo Profile)</div>
                <div className="text-xs text-[#65736A]">Name: {currentUser.name} · Reg No: {currentUser.studentId} · Sem: 6th</div>
                <div className="text-xs text-[#203B32] font-medium">ERP Dues Check: Cleared (Sample data)</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Certificate Purpose</label>
                <select
                  value={bonafidePurpose}
                  onChange={(e) => setBonafidePurpose(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32]"
                >
                  <option value="National Scholarship Portal (NSP) Renewal">National Scholarship Portal (NSP) Renewal</option>
                  <option value="State Scholarship Portal (Prerana / Medhabruti)">State Scholarship Portal (Prerana / Medhabruti)</option>
                  <option value="Passport Verification & Address Proof">Passport Verification & Address Proof</option>
                  <option value="Bank Education Loan Subsidy">Bank Education Loan Subsidy</option>
                  <option value="Summer Internship / Industrial Training NOC">Summer Internship / Industrial Training NOC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Issuance Preference</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryPreference('digital')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      deliveryPreference === 'digital'
                        ? 'bg-[#DCE8DF] text-[#203B32] border-[#203B32]'
                        : 'bg-white text-[#65736A] border-[#E4E2D9]'
                    }`}
                  >
                    <div className="font-semibold text-[#26312B]">Digital PDF Download</div>
                    <div className="text-[11px] text-[#65736A] mt-0.5">Instant download with Dean QR verification</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryPreference('counter')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      deliveryPreference === 'counter'
                        ? 'bg-[#DCE8DF] text-[#203B32] border-[#203B32]'
                        : 'bg-white text-[#65736A] border-[#E4E2D9]'
                    }`}
                  >
                    <div className="font-semibold text-[#26312B]">Physical Counter Collection</div>
                    <div className="text-[11px] text-[#65736A] mt-0.5">Collect stamped copy from Registrar Window 3</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* B. Maintenance with Duplicate Detection */}
          {category === 'maintenance' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              {/* Campus Building Selector (Mapped to GIS Map) */}
              <div>
                <label className="block text-xs font-semibold text-[#26312B] mb-1.5 flex items-center justify-between">
                  <span>Campus Building & Facility Location *</span>
                  <span className="text-[11px] text-[#0D8B65] font-semibold">GIS Map Synchronized</span>
                </label>
                <select
                  value={selectedCampusLocationId}
                  onChange={(e) => {
                    setSelectedCampusLocationId(e.target.value);
                    const loc = CAMPUS_LOCATIONS.find(l => l.id === e.target.value);
                    if (loc) {
                      setHostelBlock(loc.name);
                    }
                  }}
                  className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32]"
                >
                  {CAMPUS_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      [{loc.code}] {loc.name} · ({loc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Issue Subcategory</label>
                  <select
                    value={maintenanceSubcategory}
                    onChange={(e) => setMaintenanceSubcategory(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                  >
                    <option value="Plumbing & Water Supply">Plumbing & Water Supply</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Drinking Water & RO Plant">Drinking Water & RO Plant</option>
                    <option value="Carpentry & Doors">Carpentry & Doors</option>
                    <option value="Washroom Hygiene">Washroom Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Specific Room / Bay / Wing</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 314, 3rd Floor Washroom, or Lab Bay 2"
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                  />
                </div>
              </div>

              {/* Action: Check for similar reports */}
              <div className="p-3.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26312B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#203B32]" />
                    <span>Intelligent Incident Clustering</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckDuplicates}
                    className="px-2.5 py-1 bg-white border border-[#E4E2D9] hover:border-[#203B32] rounded-lg text-xs font-medium text-[#203B32] transition-colors"
                  >
                    Check for similar reports in {hostelBlock}
                  </button>
                </div>

                {detectedDuplicates.length > 0 && (
                  <div className="mt-2 space-y-2 pt-2 border-t border-[#E4E2D9]">
                    <div className="text-xs text-[#8A5B15] font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#8A5B15]" />
                      <span>{detectedDuplicates.length} existing reports detected in {hostelBlock}!</span>
                    </div>
                    <div className="space-y-1.5">
                      {detectedDuplicates.map(d => (
                        <div 
                          key={d.id}
                          onClick={() => setSelectedIncidentLink(d.linkedIncidentId || d.id)}
                          className={`p-2.5 rounded-lg border text-left text-xs cursor-pointer transition-colors ${
                            selectedIncidentLink === (d.linkedIncidentId || d.id)
                              ? 'bg-[#DCE8DF] border-[#203B32] text-[#203B32]'
                              : 'bg-white border-[#E4E2D9] hover:bg-neutral-50 text-[#26312B]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold">{d.id} · {d.details.roomNumber}</span>
                            <span className="text-[11px] uppercase font-mono">{d.status}</span>
                          </div>
                          <p className="text-xs text-[#65736A] truncate mt-0.5">{d.title}</p>
                        </div>
                      ))}
                    </div>
                    {selectedIncidentLink && (
                      <div className="text-xs text-[#203B32] font-medium flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Will link to Master Incident {selectedIncidentLink} to coordinate single repair.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Attachment */}
              <div>
                <label className="block text-xs font-semibold text-[#26312B] mb-1.5">
                  Photo Attachment (Optional)
                </label>
                <div 
                  onClick={() => {
                    setHasImageAttachment(true);
                    setAttachmentName('pipe_leak_evidence_314.jpg');
                  }}
                  className="p-3.5 border border-dashed border-[#E4E2D9] rounded-xl bg-[#F7F5F0] text-center cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#65736A] mx-auto mb-1" />
                  <span className="text-xs font-medium text-[#26312B]">
                    {hasImageAttachment ? `Attached: ${attachmentName}` : 'Click to simulate attaching site photo'}
                  </span>
                  <div className="text-[11px] text-[#65736A] mt-0.5">JPG or PNG up to 5MB</div>
                </div>
              </div>
            </div>
          )}

          {/* C. Leave & Gate Pass */}
          {category === 'leave_gatepass' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              <div className="p-3.5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl text-xs text-[#8A5B15] leading-relaxed">
                <strong>Warden Approval Requirement:</strong> Routine weekend outstation passes require authorized Warden review before the security gate QR is generated. Emergency medical travel will be prioritized for expedited gate clearance.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Departure Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-2/3 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                    />
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-1/3 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Return Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-2/3 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-1/3 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Cuttack, Odisha"
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Parent / Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 94370 12345"
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-2.5 py-1.5 text-xs text-[#26312B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* D. Timetable */}
          {category === 'timetable' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              <div className="p-3.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl text-xs space-y-1">
                <span className="font-semibold text-[#26312B]">Official LMS Roster Verification</span>
                <p className="text-xs text-[#65736A]">This query checks published class schedules and allocated rooms to resolve scheduling overlaps.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Class Date</label>
                  <input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full bg-[#F7F8F6] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* E. Mess */}
          {category === 'mess' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Meal Session</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`w-9 h-9 rounded-lg border text-xs font-bold transition-colors ${
                          rating >= star ? 'bg-[#FDF6EB] border-[#F1DFC4] text-[#8A5B15]' : 'bg-white border-[#E4E2D9] text-[#65736A]'
                        }`}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* F. Fee Dues */}
          {category === 'fee_dues' && (
            <div className="space-y-4 pt-2 border-t border-[#E4E2D9]">
              <div className="p-3.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl text-xs space-y-1">
                <span className="font-semibold text-[#26312B]">Sample College ERP Ledger Info</span>
                <p className="text-xs text-[#65736A]">This is seeded demonstration data. Balance figures do not represent live financial liability.</p>
                <div className="text-xs font-mono text-[#203B32]">Sample Ledger: Zero Tuition Dues Recorded</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312B] mb-1.5">Fee Query Category</label>
                <select
                  value={feeCategory}
                  onChange={(e) => setFeeCategory(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B]"
                >
                  <option value="Semester Examination Fee Verification">Semester Examination Fee Verification</option>
                  <option value="Hostel Caution Deposit Refund">Hostel Caution Deposit Refund</option>
                  <option value="SBI Collect Payment Discrepancy">SBI Collect Payment Discrepancy</option>
                  <option value="Mess Advance Adjustment">Mess Advance Adjustment</option>
                </select>
              </div>
            </div>
          )}

          {/* Common Description Field */}
          <div>
            <label className="block text-xs font-semibold text-[#26312B] mb-1.5">
              Detailed Description / Context *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details (dates, room number, symptoms) to expedite resolution..."
              className="w-full bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#203B32] focus:bg-white transition-colors"
            />
          </div>

          {/* PRIORITY 1: FAIR URGENT POLICY SELECTOR (How serious is the issue?) */}
          <div className="pt-4 border-t border-[#E4E2D9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#26312B]">
                  How serious is this issue?
                </label>
                <p className="text-xs text-[#65736A]">Campus policy reserves Urgent status for immediate safety hazards and essential utility breakdowns.</p>
              </div>
              <span className="text-[11px] text-[#65736A] font-mono">Fair Priority Policy</span>
            </div>

            {/* 3 Tier Seriousness Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Routine / Standard (Default) */}
              <button
                type="button"
                onClick={() => {
                  setSeverityOption('routine');
                  setUrgentReason('');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  severityOption === 'routine'
                    ? 'bg-[#DCE8DF] border-[#203B32] shadow-xs'
                    : 'bg-white border-[#E4E2D9] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#26312B]">Routine / Standard</span>
                  <span className="text-[11px] font-mono text-[#203B32] font-semibold">Medium</span>
                </div>
                <p className="text-[11px] text-[#65736A] leading-relaxed">
                  Normal maintenance, queries, or scheduled applications without safety risk.
                </p>
                <div className="text-[10px] text-[#65736A] mt-2 font-mono">Standard 24–48h SLA</div>
              </button>

              {/* Option 2: Elevated / Time-Sensitive */}
              <button
                type="button"
                onClick={() => {
                  setSeverityOption('elevated');
                  setUrgentReason('');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  severityOption === 'elevated'
                    ? 'bg-[#DCE8DF] border-[#203B32] shadow-xs'
                    : 'bg-white border-[#E4E2D9] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#26312B]">Time-Sensitive</span>
                  <span className="text-[11px] font-mono text-[#8A5B15] font-semibold">High</span>
                </div>
                <p className="text-[11px] text-[#65736A] leading-relaxed">
                  Impending deadlines or persistent disruption needing prioritized attention.
                </p>
                <div className="text-[10px] text-[#65736A] mt-2 font-mono">Expedited 24h SLA</div>
              </button>

              {/* Option 3: Critical Safety / Essential Outage */}
              <button
                type="button"
                onClick={() => setSeverityOption('critical')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  severityOption === 'critical'
                    ? 'bg-[#FCEDEC] border-[#992828] shadow-xs'
                    : 'bg-white border-[#E4E2D9] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#992828]">Safety / Major Outage</span>
                  <span className="text-[11px] font-mono text-[#992828] font-bold">Urgent</span>
                </div>
                <p className="text-[11px] text-[#65736A] leading-relaxed">
                  Flooding, fire hazard, power blackout, water cutoff, or medical emergency.
                </p>
                <div className="text-[10px] text-[#992828] mt-2 font-mono">12h Fast-Track SLA</div>
              </button>
            </div>

            {/* Critical Selection Review & Policy Details */}
            {severityOption === 'critical' && (
              <div className="space-y-3 pt-2">
                {/* 1. Ineligible Warning */}
                {!urgentEligibility.eligible && (
                  <div className="p-3.5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl text-xs text-[#8A5B15] space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Policy Notice: Category Not Eligible for Self-Classified Urgent Priority</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#26312B]/80">{urgentEligibility.reason}</p>
                    <p className="text-[11px] text-[#65736A] pt-1">
                      Your request will be submitted at standard priority. Duty staff can promote it if inspection warrants.
                    </p>
                  </div>
                )}

                {/* 2. Eligible, but Active Urgent Limit Reached */}
                {urgentEligibility.eligible && activeUrgentTicket && (
                  <div className="p-3.5 bg-[#FDF6EB] border border-[#F1DFC4] rounded-xl text-xs text-[#8A5B15] space-y-1.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Active Urgent Allowance In Use ({activeUrgentTicket.id})</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#26312B]/80">
                      Under campus policy, students may have at most <strong>1 active Urgent request</strong> at a time to prevent queue starvation.
                    </p>
                    <div className="p-2.5 bg-white/80 rounded-lg text-xs border border-[#F1DFC4] space-y-1">
                      <div className="font-medium text-[#26312B]">
                        Active Urgent Ticket: <span className="font-mono">{activeUrgentTicket.id}</span> ({activeUrgentTicket.title})
                      </div>
                      <div className="text-[#65736A]">
                        Your new report will be submitted at <strong>High Priority</strong> and automatically flagged for priority review by the duty supervisor.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Mandatory Reason Input for Urgent */}
                {urgentEligibility.eligible && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#992828]">
                      Justification for Urgent Classification *
                    </label>
                    <input
                      type="text"
                      value={urgentReason}
                      onChange={(e) => setUrgentReason(e.target.value)}
                      placeholder="Explain the imminent physical hazard or essential utility breakdown..."
                      className="w-full bg-[#FCEDEC]/40 border border-[#F5CBC8] rounded-xl px-3 py-2 text-xs text-[#26312B] focus:outline-none focus:border-[#992828]"
                      required
                    />
                    <p className="text-[11px] text-[#65736A]">
                      This reason will be recorded on the tamper-proof institutional audit timeline.
                    </p>
                  </div>
                )}

                {/* Emergency Contact Banner for True Danger */}
                <div className="p-3 bg-[#FCEDEC] border border-[#F5CBC8] rounded-xl flex items-center justify-between text-xs text-[#992828]">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>For immediate physical danger, fire, or medical crisis:</span>
                  </div>
                  <div className="font-mono font-bold">
                    Campus Ambulance: +91 661 2482 112 · Security: 100
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E4E2D9]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#65736A] hover:text-[#26312B]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Intent</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#203B32] hover:bg-[#172C25] text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & POLICY VERIFY */}
      {step === 3 && (
        <div className="bg-white border border-[#E4E2D9] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#26312B]">Step 3: Review and Confirm Submission</h3>
            <p className="text-xs text-[#65736A]">Verify the assigned department, effective priority, and audit payload before dispatching.</p>
          </div>

          <div className="border border-[#E4E2D9] rounded-xl divide-y divide-[#E4E2D9] text-xs">
            <div className="p-3.5 bg-[#F7F5F0] flex items-center justify-between">
              <span className="font-semibold text-[#26312B]">Category & Department</span>
              <span className="font-mono text-[#203B32] font-semibold uppercase">{category.replace('_', ' ')}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="text-[#65736A]">Request Title</span>
              <span className="font-semibold text-[#26312B]">{title}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="text-[#65736A]">Requester Identity</span>
              <span className="font-mono text-[#26312B]">{currentUser.name} ({currentUser.studentId})</span>
            </div>

            {/* Effective Priority Display */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[#65736A] block">Assigned Priority Status</span>
                <span className="text-[11px] text-[#65736A]">{effectivePriorityCalculation.note}</span>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${
                  effectivePriorityCalculation.priority === 'urgent'
                    ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]'
                    : effectivePriorityCalculation.priority === 'high'
                      ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]'
                      : 'bg-[#DCE8DF] text-[#203B32]'
                }`}>
                  {effectivePriorityCalculation.priority}
                </span>
                {effectivePriorityCalculation.status === 'quota_reached' && (
                  <div className="text-[10px] text-[#8A5B15] font-semibold mt-1 font-mono">
                    Priority Triage Flag Added
                  </div>
                )}
              </div>
            </div>

            {urgentReason && (
              <div className="p-3.5 bg-[#FCEDEC]/40 text-xs">
                <span className="text-[#992828] font-semibold block mb-0.5">Safety Justification:</span>
                <p className="text-xs text-[#26312B] leading-relaxed">{urgentReason}</p>
              </div>
            )}

            <div className="p-3.5">
              <span className="text-[#65736A] block mb-1">Description</span>
              <p className="text-xs text-[#26312B] bg-[#F7F5F0] p-3 rounded-lg leading-relaxed">{description}</p>
            </div>

            {selectedIncidentLink && (
              <div className="p-3.5 bg-[#DCE8DF]/50 text-[#203B32] flex items-center justify-between">
                <span>Cluster Incident:</span>
                <span className="font-mono font-semibold">Linked to {selectedIncidentLink}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#203B32] shrink-0 mt-0.5" />
            <div className="text-xs text-[#65736A] leading-relaxed">
              <strong className="text-[#26312B]">Audit Compliance:</strong> Once submitted, a permanent tracking record will be registered in the college operations bus. Reopening or editing this request will adhere to the active urgent limit.
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E4E2D9]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#65736A] hover:text-[#26312B] disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Details</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#203B32] hover:bg-[#172C25] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Queue...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm & Dispatch Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION & TRACKING ID */}
      {step === 4 && (
        <div className="bg-white border border-[#E4E2D9] rounded-2xl p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 bg-[#DCE8DF] text-[#203B32] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs uppercase font-mono font-semibold text-[#203B32] tracking-wider">Dispatched to Queue</span>
            <h3 className="text-xl font-bold text-[#26312B] mt-1">Request Successfully Submitted</h3>
            <p className="text-xs text-[#65736A] max-w-md mx-auto mt-1 leading-relaxed">
              Your request has been validated and queued for the appropriate campus department.
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F0] border border-[#E4E2D9] rounded-xl max-w-sm mx-auto text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#65736A]">Tracking ID:</span>
              <span className="font-mono font-bold text-sm text-[#203B32]">{createdRequestId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#65736A]">Initial Status:</span>
              <span className="font-medium text-[#8A5B15]">Submitted</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#65736A]">Assigned Priority:</span>
              <span className="font-mono font-semibold text-[#26312B] uppercase">
                {effectivePriorityCalculation.priority}
              </span>
            </div>
            {effectivePriorityCalculation.status === 'quota_reached' && (
              <div className="pt-2 border-t border-[#E4E2D9] text-[11px] text-[#8A5B15] leading-snug">
                <strong>Triage Notice:</strong> You had an active urgent request. This ticket was accepted at High Priority and flagged for priority review by the supervisor.
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onSuccess(createdRequestId!)}
              className="px-4 py-2.5 bg-[#203B32] hover:bg-[#172C25] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Track Request Timeline
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-white border border-[#E4E2D9] text-xs font-medium text-[#26312B] hover:bg-[#F7F5F0] rounded-xl transition-colors"
            >
              Return to Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
