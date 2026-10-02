import React, { useState } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Layers, 
  Check, 
  Info,
  Server,
  Zap
} from 'lucide-react';
import { SYSTEM_INTEGRATIONS } from '../../data/seedData.ts';
import { useCampus } from '../../context/CampusContext.tsx';

export const IntegrationsView: React.FC = () => {
  const { triggerSimulatedSync, systemLastSynced } = useCampus();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { status: string; latency: number; timestamp: string }>>({});

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestResult(prev => ({
        ...prev,
        [id]: {
          status: 'SUCCESS 200 OK — Handshake Verified',
          latency: Math.floor(20 + Math.random() * 45),
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      setTestingId(null);
      triggerSimulatedSync();
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            Campus Integration & Adapter Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            CampusFlow does not replace source databases; it acts as an intelligent orchestration bus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5E6D64]">Global Status:</span>
          <span className="text-xs font-semibold text-[#0D8B65] flex items-center gap-1.5 bg-[#E6F5EF] px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#0D8B65] inline-block animate-pulse" />
            <span>6 Connected (Demo Mode)</span>
          </span>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="p-4 sm:p-5 bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0D8B65] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5E6D64] leading-relaxed">
          <strong className="text-[#202722]">Source-of-Truth Architecture:</strong> FretBox remains the authoritative owner of hostel rooms and maintenance tickets; College ERP retains definitive tuition ledgers and registrations; LMS manages official class timetables. CampusFlow bridges student requests and provides bi-directional status updates across all nodes.
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SYSTEM_INTEGRATIONS.map(sys => {
          const isTesting = testingId === sys.id;
          const result = testResult[sys.id];

          return (
            <div 
              key={sys.id}
              className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between hover:border-[#0D8B65]/40 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E6F5EF] text-[#0D8B65] font-bold text-xs flex items-center justify-center font-mono shadow-2xs">
                      {sys.logoText}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#202722]">{sys.name}</h3>
                      <span className="text-[10px] font-mono text-[#0D8B65] font-semibold">{sys.status}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5E6D64] leading-relaxed mb-4">
                  {sys.purpose}
                </p>

                {/* Data Available */}
                <div className="space-y-3 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5E6D64] block mb-1">Authoritative Data</span>
                    <ul className="space-y-1 text-[11px] text-[#5E6D64]">
                      {sys.dataAvailable.slice(0, 2).map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#0D8B65]">·</span>
                          <span className="truncate">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5E6D64] block mb-1">Supported Actions</span>
                    <ul className="space-y-1 text-[11px] text-[#5E6D64]">
                      {sys.actionsSupported.slice(0, 2).map((a, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#0D8B65]">→</span>
                          <span className="truncate">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Test & Telemetry Area */}
              <div className="pt-3 border-t border-[#E5E9E5] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#5E6D64]">
                  <span>Last Sync: {sys.lastSimulatedSync}</span>
                  <span className="font-mono">Avg: {sys.syncLatencyMs}ms</span>
                </div>

                {result && (
                  <div className="p-2.5 bg-[#E6F5EF] rounded-xl border border-[#0D8B65]/40 text-[10px] text-[#0D8B65] font-mono">
                    {result.status} ({result.latency}ms) at {result.timestamp}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleTestConnection(sys.id)}
                    disabled={isTesting}
                    className="flex-1 py-2 bg-[#F7F8F6] hover:bg-neutral-100 border border-[#E5E9E5] rounded-xl text-xs font-semibold text-[#202722] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#0D8B65] ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing Handshake...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
