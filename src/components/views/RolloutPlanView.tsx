import React from 'react';
import { 
  CalendarRange, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Building2, 
  Users, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export const RolloutPlanView: React.FC = () => {
  const phases = [
    {
      phase: 'Phase 01',
      title: 'Targeted Pilot Launch',
      duration: 'Weeks 1 – 3',
      target: 'Brahmaputra Hall (Block B) & Bonafide Academic Workflow',
      activities: [
        'Deploy CampusFlow client on campus subnet for 180 Block B students',
        'Digitize Bonafide Certificate workflow with single-click Dean office sign-off',
        'Verify zero-dues automated validation against College ERP test sandbox'
      ],
      deliverables: 'Functional pilot loop, warden onboarding feedback, baseline latency stats'
    },
    {
      phase: 'Phase 02',
      title: 'Minimum Data Schema Import',
      duration: 'Weeks 4 – 5',
      target: 'Institutional Identity & Room Mapping',
      activities: [
        'Import student registration records (B.Tech CSE/ECE/EE/ME batches)',
        'Map room numbers, wing prefects, and hostel wardens from FretBox export',
        'Set up automated reconciliation scripts to eliminate duplicate student records'
      ],
      deliverables: 'Clean unified campus identity index without duplicating core ERP data'
    },
    {
      phase: 'Phase 03',
      title: 'SLA & Multi-Role Governance',
      duration: 'Weeks 6 – 7',
      target: 'Administrative Section, Hostel Supervisors & Security Posts',
      activities: [
        'Configure SLA targets (12h for emergency repairs, 24h for routine, 48h for bonafide)',
        'Role-based permissions: Warden approval gates, security scanner tap-out permissions',
        'Set up automatic incident clustering rules for identical room/corridor reports'
      ],
      deliverables: 'Legally vetted proctorial rules and escalation matrices'
    },
    {
      phase: 'Phase 04',
      title: 'System Integration & API Bridges',
      duration: 'Weeks 8 – 10',
      target: 'FretBox, College ERP, Academic LMS & National SMS Gateway',
      activities: [
        'Mount authorized REST/OAuth webhook adapters for FretBox ticket creation',
        'Connect LMS timetable schedule feed to detect lecture hall conflicts',
        'Activate SMS Shortcode (56161) for feature-phone students without active data'
      ],
      deliverables: 'High-availability bi-directional synchronization bus'
    },
    {
      phase: 'Phase 05',
      title: 'Stakeholder Enablement & Training',
      duration: 'Weeks 11 – 12',
      target: 'Wardens, Office Superintendents, Student Council',
      activities: [
        'Hands-on workshops for non-technical hostel wardens and gate security guards',
        'Distribute quick-reference guides for Warden-Assisted Kiosk entry',
        'Conduct campus-wide awareness drive across student hostels and mess halls'
      ],
      deliverables: '100% staff certification on queue management and status transitions'
    },
    {
      phase: 'Phase 06',
      title: 'Campus-Wide Rollout & KPI Benchmarking',
      duration: 'Week 13 onwards',
      target: 'Full BPUT Constituent Campus (5,000+ Students)',
      activities: [
        'Full cutover from physical complaint registers to unified digital orchestration',
        'Track median turnaround time, SLA compliance percentage, and student NPS',
        'Quarterly governance review with University Registrar and Dean of Student Welfare'
      ],
      deliverables: 'Fully operational institutional workflow infrastructure'
    },
  ];

  const risksAndMitigations = [
    {
      risk: 'Inaccurate or Stale Source ERP Data',
      impact: 'High',
      mitigation: 'CampusFlow treats ERP as read-only ledger. When students dispute balance records, a specialized query workflow routes directly to the Finance Desk for human audit.'
    },
    {
      risk: 'Staff Adoption Inertia & Preference for Paper Slips',
      impact: 'High',
      mitigation: 'Keep interface extremely lean with 1-click status transitions and automated pre-filled SMS templates. Eliminate duplicate administrative reporting.'
    },
    {
      risk: 'Unreliable Campus Wi-Fi & 2G Edge Connectivity',
      impact: 'Medium',
      mitigation: 'Built-in offline queuing caching drafts in browser memory, paired with a lightweight 2-way SMS shortcode engine (FB MENU, FB STATUS).'
    },
    {
      risk: 'Data Privacy & Student Record Confidentiality',
      impact: 'Critical',
      mitigation: 'Strict role-based access control. Maintenance staff only view room numbers and issue descriptions; medical leave reasons are restricted strictly to the Warden.'
    },
    {
      risk: 'Duplicate Maintenance Complaints for Same Leak',
      impact: 'Medium',
      mitigation: 'Automated clustering algorithm detects identical location/subcategory reports in the same block, merging them into Master Incidents (e.g. INC-408).'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            Institutional Rollout Plan & Risk Governance
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            A practical, phased deployment roadmap tailored for BPUT constituent colleges in Odisha
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono bg-[#E6F5EF] text-[#0D8B65] font-semibold px-2.5 py-1 rounded-md">
            12-WEEK PILOT TO FULL ROLLOUT
          </span>
        </div>
      </div>

      {/* 6-PHASE ROADMAP */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#202722] uppercase tracking-wider">
          Phased Implementation Framework
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((p) => (
            <div 
              key={p.phase} 
              className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-mono font-bold text-[#0D8B65]">{p.phase}</span>
                  <span className="text-[#5E6D64] font-mono">{p.duration}</span>
                </div>

                <h4 className="text-sm font-bold text-[#202722] mb-1">{p.title}</h4>
                <div className="text-[11px] font-medium text-[#5E6D64] mb-3">Scope: {p.target}</div>

                <ul className="space-y-1.5 text-xs text-[#5E6D64] mb-4">
                  {p.activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#0D8B65] font-bold">·</span>
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E5E9E5] text-[11px] text-[#5E6D64]">
                <strong className="text-[#202722]">Outcome:</strong> {p.deliverables}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RISKS AND MITIGATIONS MATRIX */}
      <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#202722]">Risk & Mitigation Matrix</h3>
            <p className="text-xs text-[#5E6D64]">Proactive strategies addressing real institutional friction points</p>
          </div>
          <ShieldAlert className="w-5 h-5 text-[#8A5B15]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] border-b border-[#E5E9E5] text-[#5E6D64]">
                <th className="py-3 px-4 font-semibold">Identified Risk Factor</th>
                <th className="py-3 px-4 font-semibold">Impact</th>
                <th className="py-3 px-4 font-semibold">CampusFlow Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E5]">
              {risksAndMitigations.map((r, i) => (
                <tr key={i} className="hover:bg-[#F7F8F6] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#202722] max-w-xs">
                    {r.risk}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      r.impact === 'Critical' ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]' :
                      r.impact === 'High' ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]' : 'bg-[#F7F8F6] text-[#5E6D64] border border-[#E5E9E5]'
                    }`}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5E6D64] leading-relaxed">
                    {r.mitigation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
