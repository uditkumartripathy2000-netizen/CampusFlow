import React, { useState } from 'react';
import { 
  GitMerge, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  FileCheck, 
  Wrench, 
  Luggage, 
  Building2, 
  Database, 
  GraduationCap, 
  Check, 
  AlertCircle,
  ExternalLink,
  QrCode,
  Sparkles,
  Info
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { SYSTEM_INTEGRATIONS } from '../../data/seedData.ts';

export const WorkflowMonitorView: React.FC = () => {
  const { 
    requests, 
    updateRequestStatus, 
    approveGatePass, 
    recordGateDeparture, 
    recordGateReturn,
    linkToIncident,
    triggerSimulatedSync,
    systemLastSynced 
  } = useCampus();

  const [selectedSystemId, setSelectedSystemId] = useState<string>('int-fretbox');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'bonafide' | 'maintenance' | 'gatepass'>('bonafide');

  // Simulated Interactive States for the 3 signature workflows
  // 1. Bonafide Simulator
  const [bonafideStep, setBonafideStep] = useState<number>(1);
  const [bonafideEligible, setBonafideEligible] = useState<boolean>(true);

  // 2. Hostel Water Leak Simulator
  const [leakStep, setLeakStep] = useState<number>(1);
  const [isClustered, setIsClustered] = useState<boolean>(true);

  // 3. Leave & Gate Pass Simulator
  const [gatePassStep, setGatePassStep] = useState<number>(1);

  const selectedSystem = SYSTEM_INTEGRATIONS.find(s => s.id === selectedSystemId) || SYSTEM_INTEGRATIONS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Signature Banner */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase bg-[#E6F5EF] text-[#0D8B65] font-semibold px-2 py-0.5 rounded">
                CAMPUSFLOW ORCHESTRATION ENGINE
              </span>
              <span className="text-xs text-[#5E6D64]">· Live State</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight mt-1">
              "Don't replace existing campus systems. Connect them."
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6D64] mt-1 max-w-3xl leading-relaxed">
              CampusFlow operates as a unified workflow layer above FretBox, College ERP, Academic LMS, and Manual Offices. 
              One student intent activates coordinated departmental actions with verifiable audit trails.
            </p>
          </div>

          <button
            onClick={triggerSimulatedSync}
            className="flex items-center gap-2 px-3 py-2 bg-[#F7F8F6] border border-[#E5E9E5] hover:bg-neutral-100 rounded-lg text-xs font-medium text-[#202722] self-start lg:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0D8B65]" />
            <span>Sync Telemetry ({systemLastSynced})</span>
          </button>
        </div>
      </div>

      {/* VISUAL WORKFLOW PIPELINE ARCHITECTURE */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#202722]">Orchestration Bus Architecture</h3>
            <p className="text-xs text-[#5E6D64]">How student intent flows through college systems to verified completion</p>
          </div>
          <span className="text-[11px] text-[#0D8B65] font-mono font-semibold">End-to-End Handshake</span>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
          {[
            { step: '01', title: 'Student Intent', sub: 'Single Portal / SMS', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '02', title: 'Classification', sub: 'Intent Resolver', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '03', title: 'Eligibility Check', sub: 'ERP & Policy Rules', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '04', title: 'Workflow Bus', sub: 'SLA & Routing Engine', color: 'border-[#0D8B65] bg-[#E6F5EF]' },
            { step: '05', title: 'Connected Depts', sub: 'FretBox / Office / Gate', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '06', title: 'Status Sync', sub: 'Bi-directional Bridge', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '07', title: 'Student Alerts', sub: 'In-App & SMS push', color: 'border-[#E5E9E5] bg-[#F7F8F6]' },
            { step: '08', title: 'Verified Finish', sub: 'Tamper-Proof Audit', color: 'border-[#0D8B65] bg-[#E6F5EF]' },
          ].map((node) => (
            <div
              key={node.step}
              className={`p-3.5 rounded-xl border ${node.color} flex flex-col justify-between text-left transition-all relative h-28 shadow-2xs`}
            >
              <span className="text-[10px] font-mono font-bold text-[#5E6D64]">{node.step}</span>
              <div className="my-1.5">
                <div className="text-xs font-bold text-[#202722] leading-tight">{node.title}</div>
                <div className="text-[10px] text-[#5E6D64] mt-0.5 leading-snug">{node.sub}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0D8B65] self-end opacity-90" />
            </div>
          ))}
        </div>
      </div>

      {/* CONNECTED SYSTEM NODES CATALOG EXPLORER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: System Nodes Selector (1 col) */}
        <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E9E5]">
            <h3 className="text-xs font-bold text-[#202722] uppercase tracking-wider">Connected System Nodes</h3>
            <span className="text-[10px] text-[#5E6D64]">Click to inspect</span>
          </div>

          <div className="space-y-2">
            {SYSTEM_INTEGRATIONS.map(sys => {
              const isSelected = selectedSystemId === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-[#E6F5EF] border-[#0D8B65] shadow-2xs' 
                      : 'bg-white border-[#E5E9E5] hover:bg-[#F7F8F6]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-[#202722]">{sys.name}</span>
                    <span className="text-[10px] font-mono text-[#0D8B65] font-semibold">{sys.status}</span>
                  </div>
                  <p className="text-[11px] text-[#5E6D64] line-clamp-1">{sys.purpose}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Telemetry & Handshake Info (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E9E5]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#202722]">{selectedSystem.name}</h3>
                <span className="text-[10px] font-mono bg-neutral-100 text-[#5E6D64] px-2 py-0.5 rounded font-medium">
                  {selectedSystem.status}
                </span>
              </div>
              <p className="text-xs text-[#5E6D64] mt-0.5">{selectedSystem.purpose}</p>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-[#5E6D64] block">Last Simulated Sync</span>
              <span className="font-mono font-medium text-[#0D8B65]">{selectedSystem.lastSimulatedSync}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Data Available */}
            <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
              <span className="font-bold text-[#202722] block mb-2">Synchronized Data Models</span>
              <ul className="space-y-1.5 text-[11px] text-[#5E6D64]">
                {selectedSystem.dataAvailable.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#0D8B65] font-bold">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions Supported */}
            <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5]">
              <span className="font-bold text-[#202722] block mb-2">Automated Actions Supported</span>
              <ul className="space-y-1.5 text-[11px] text-[#5E6D64]">
                {selectedSystem.actionsSupported.map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#0D8B65] font-bold">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-[#E5E9E5] flex items-center justify-between text-xs text-[#5E6D64]">
            <div className="truncate">
              <span className="text-[#5E6D64] font-mono mr-2">Endpoint:</span>
              <span className="font-mono text-[#202722]">{selectedSystem.endpointUrl}</span>
            </div>
            <span className="font-mono text-[11px] text-[#0D8B65] shrink-0 ml-2 font-semibold">Latency: {selectedSystem.syncLatencyMs}ms</span>
          </div>
        </div>
      </div>

      {/* 3 LIVE INTERACTIVE DEMONSTRABLE WORKFLOWS */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-6 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0D8B65] uppercase">Interactive Demonstrators</span>
            <span className="text-xs text-[#8A968D]">· Ready for Hackathon Judges</span>
          </div>
          <h3 className="text-lg font-bold text-[#202722] mt-0.5">
            Test The 3 End-to-End Operational Workflows
          </h3>
          <p className="text-xs text-[#5F6B62]">
            Click through each state transition to see multi-department coordination live.
          </p>
        </div>

        {/* Workflow Selector Tabs */}
        <div className="flex border-b border-[#E2E7E2] gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveWorkflowTab('bonafide')}
            className={`pb-2 transition-colors flex items-center gap-2 ${
              activeWorkflowTab === 'bonafide'
                ? 'border-b-2 border-[#0D8B65] text-[#0D8B65] font-semibold'
                : 'text-[#5F6B62] hover:text-[#202722]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>1. Bonafide Certificate Issuance</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('maintenance')}
            className={`pb-2 transition-colors flex items-center gap-2 ${
              activeWorkflowTab === 'maintenance'
                ? 'border-b-2 border-[#0D8B65] text-[#0D8B65] font-semibold'
                : 'text-[#5F6B62] hover:text-[#202722]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. Hostel Water Leak & Incident Clustering</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('gatepass')}
            className={`pb-2 transition-colors flex items-center gap-2 ${
              activeWorkflowTab === 'gatepass'
                ? 'border-b-2 border-[#0D8B65] text-[#0D8B65] font-semibold'
                : 'text-[#5F6B62] hover:text-[#202722]'
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>3. Leave + Gate Pass Terminal Scan</span>
          </button>
        </div>

        {/* WORKFLOW 1: BONAFIDE CERTIFICATE */}
        {activeWorkflowTab === 'bonafide' && (
          <div className="space-y-4">
            <div className="p-5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202722]">Workflow Execution Simulation: REQ-1045</span>
                <span className="text-xs font-mono font-semibold text-[#0D8B65]">Step {bonafideStep} of 4</span>
              </div>

              {/* Steps Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-3 rounded-lg border ${bonafideStep >= 1 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 1</span>
                  <span className="font-bold block mt-0.5">Student Intent</span>
                  <span className="text-[10px] text-[#5E6D64]">NSP Scholarship purpose</span>
                </div>

                <div className={`p-3 rounded-lg border ${bonafideStep >= 2 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 2</span>
                  <span className="font-bold block mt-0.5">ERP Dues Check</span>
                  <span className="text-[10px] text-[#5E6D64]">Zero dues verified</span>
                </div>

                <div className={`p-3 rounded-lg border ${bonafideStep >= 3 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 3</span>
                  <span className="font-bold block mt-0.5">Registrar Sign-Off</span>
                  <span className="text-[10px] text-[#5E6D64]">Mrs. Sunita Mohanty review</span>
                </div>

                <div className={`p-3 rounded-lg border ${bonafideStep >= 4 ? 'bg-[#E6F5EF] border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 4</span>
                  <span className="font-bold block mt-0.5">Digital Issuance</span>
                  <span className="text-[10px] text-[#0D8B65]">QR Seal Verified</span>
                </div>
              </div>

              {/* Dynamic Action Buttons for Workflow 1 */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {bonafideStep === 1 && (
                  <button
                    onClick={() => setBonafideStep(2)}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Simulate College ERP Eligibility Check →
                  </button>
                )}

                {bonafideStep === 2 && (
                  <button
                    onClick={() => setBonafideStep(3)}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Route to Office Desk & Approve →
                  </button>
                )}

                {bonafideStep === 3 && (
                  <button
                    onClick={() => {
                      setBonafideStep(4);
                      updateRequestStatus('REQ-1045', 'resolved', 'Digital certificate generated with Dean QR verification');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Generate Tamper-Proof Digital Certificate →
                  </button>
                )}

                {bonafideStep === 4 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#0D8B65] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Workflow Completed! Certificate dispatched to student portal.</span>
                    </span>
                    <button
                      onClick={() => setBonafideStep(1)}
                      className="text-xs text-[#5E6D64] underline hover:text-[#202722]"
                    >
                      Reset Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW 2: HOSTEL WATER LEAK & INCIDENT CLUSTERING */}
        {activeWorkflowTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="p-5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202722]">Workflow Execution Simulation: INC-408</span>
                <span className="text-xs font-mono font-semibold text-[#0D8B65]">Step {leakStep} of 4</span>
              </div>

              {/* Steps Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-3 rounded-lg border ${leakStep >= 1 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 1</span>
                  <span className="font-bold block mt-0.5">3 Complaints Filed</span>
                  <span className="text-[10px] text-[#5E6D64]">B-312, B-314, B-318</span>
                </div>

                <div className={`p-3 rounded-lg border ${leakStep >= 2 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 2</span>
                  <span className="font-bold block mt-0.5">Clustered to INC-408</span>
                  <span className="text-[10px] text-[#5E6D64]">Block B Riser Line</span>
                </div>

                <div className={`p-3 rounded-lg border ${leakStep >= 3 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 3</span>
                  <span className="font-bold block mt-0.5">Plumbing Repaired</span>
                  <span className="text-[10px] text-[#5E6D64]">Contractor solder repair</span>
                </div>

                <div className={`p-3 rounded-lg border ${leakStep >= 4 ? 'bg-[#E6F5EF] border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 4</span>
                  <span className="font-bold block mt-0.5">Bulk Verified Close</span>
                  <span className="text-[10px] text-[#0D8B65]">All 3 students notified</span>
                </div>
              </div>

              {/* Dynamic Action Buttons for Workflow 2 */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {leakStep === 1 && (
                  <button
                    onClick={() => setLeakStep(2)}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Detect Common Location & Cluster Complaints →
                  </button>
                )}

                {leakStep === 2 && (
                  <button
                    onClick={() => setLeakStep(3)}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Simulate Contractor Repair Completion (Er. Patra) →
                  </button>
                )}

                {leakStep === 3 && (
                  <button
                    onClick={() => {
                      setLeakStep(4);
                      updateRequestStatus('REQ-1042', 'resolved', 'INC-408 overhead pipeline joint soldered and pressure tested');
                      updateRequestStatus('REQ-1039', 'resolved', 'INC-408 overhead pipeline joint soldered and pressure tested');
                      updateRequestStatus('REQ-1038', 'resolved', 'INC-408 overhead pipeline joint soldered and pressure tested');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Broadcast Resolution Notice to Block B Residents →
                  </button>
                )}

                {leakStep === 4 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#0D8B65] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All 3 complaints automatically resolved in a single synchronous stroke!</span>
                    </span>
                    <button
                      onClick={() => setLeakStep(1)}
                      className="text-xs text-[#5E6D64] underline hover:text-[#202722]"
                    >
                      Reset Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW 3: LEAVE + GATE PASS */}
        {activeWorkflowTab === 'gatepass' && (
          <div className="space-y-4">
            <div className="p-5 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202722]">Workflow Execution Simulation: REQ-1050 (Udit Leave Pass)</span>
                <span className="text-xs font-mono font-semibold text-[#0D8B65]">Step {gatePassStep} of 4</span>
              </div>

              {/* Steps Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-3 rounded-lg border ${gatePassStep >= 1 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 1</span>
                  <span className="font-bold block mt-0.5">Leave Submitted</span>
                  <span className="text-[10px] text-[#5E6D64]">Weekend visit to Cuttack</span>
                </div>

                <div className={`p-3 rounded-lg border ${gatePassStep >= 2 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 2</span>
                  <span className="font-bold block mt-0.5">Warden Approval</span>
                  <span className="text-[10px] text-[#5E6D64]">Dr. P. Dash verified</span>
                </div>

                <div className={`p-3 rounded-lg border ${gatePassStep >= 3 ? 'bg-white border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 3</span>
                  <span className="font-bold block mt-0.5">Gate 1 Departure</span>
                  <span className="text-[10px] text-[#5E6D64]">QR Scanner #01 stamped</span>
                </div>

                <div className={`p-3 rounded-lg border ${gatePassStep >= 4 ? 'bg-[#E6F5EF] border-[#0D8B65] text-[#0D8B65]' : 'bg-neutral-100 text-[#5E6D64]'}`}>
                  <span className="font-mono text-[10px] block font-semibold">STEP 4</span>
                  <span className="font-bold block mt-0.5">Verified Return</span>
                  <span className="text-[10px] text-[#0D8B65]">Pass Closed Automatically</span>
                </div>
              </div>

              {/* Dynamic Action Buttons for Workflow 3 */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {gatePassStep === 1 && (
                  <button
                    onClick={() => {
                      setGatePassStep(2);
                      approveGatePass('REQ-1050');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Simulate Warden Approval (Dr. P. Dash) →
                  </button>
                )}

                {gatePassStep === 2 && (
                  <button
                    onClick={() => {
                      setGatePassStep(3);
                      recordGateDeparture('REQ-1050');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Simulate Gate 1 Scanner Tap-Out (Mr. Behera) →
                  </button>
                )}

                {gatePassStep === 3 && (
                  <button
                    onClick={() => {
                      setGatePassStep(4);
                      recordGateReturn('REQ-1050');
                    }}
                    className="px-3.5 py-2 bg-[#0D8B65] text-white rounded-lg text-xs font-semibold hover:bg-[#0b7756] transition-colors shadow-2xs"
                  >
                    Simulate Student Tap-In & Return Close →
                  </button>
                )}

                {gatePassStep === 4 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#0D8B65] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Security loop closed. In/Out timestamps verified without manual paper registers!</span>
                    </span>
                    <button
                      onClick={() => setGatePassStep(1)}
                      className="text-xs text-[#5E6D64] underline hover:text-[#202722]"
                    >
                      Reset Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
