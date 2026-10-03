import React from 'react';
import { 
  Home, 
  MapPin, 
  Map,
  FileText, 
  Bell, 
  LayoutDashboard, 
  GitMerge, 
  Puzzle, 
  Smartphone, 
  CalendarRange, 
  Settings,
  ShieldCheck,
  Award,
  LogOut,
  Luggage,
  GraduationCap
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { isTicketAssignedToFaculty } from '../../utils/ticketRouting.ts';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    role, 
    requests, 
    notices, 
    certificates,
    gatePassRequests,
    issuedGatePasses,
    currentUser,
    logout,
    isOfflineSimulated 
  } = useCampus();

  const openRequestsCount = requests.filter(r => {
    if (role === 'student') {
      const isMine = r.studentId === currentUser.studentId || r.studentEmail === currentUser.email;
      return isMine && r.status !== 'closed' && r.status !== 'resolved';
    }
    if (role === 'faculty') {
      const isAssigned = isTicketAssignedToFaculty(r, currentUser);
      return isAssigned && r.status !== 'closed' && r.status !== 'resolved';
    }
    return r.status !== 'closed' && r.status !== 'resolved';
  }).length;

  const unreadNoticesCount = notices.filter(n => !n.isRead).length;

  const myDocsCount = certificates.filter(c => 
    c.studentId === currentUser.studentId || c.studentEmail === currentUser.email
  ).length;

  const bonafidePendingCount = requests.filter(r => 
    r.category === 'bonafide' && (r.status === 'submitted' || r.status === 'assigned' || r.status === 'approved')
  ).length;

  const pendingGatePassCount = (gatePassRequests || []).filter(r => r.status === 'PENDING').length;
  const myActivePassesCount = (issuedGatePasses || []).filter(p => 
    (p.studentId === currentUser.studentId || p.studentName === currentUser.name) && 
    p.status === 'VALID'
  ).length;

  // STRICT ROLE-BASED NAVIGATION ITEMS
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      badge: null,
      visibleFor: ['student', 'admin', 'staff']
    },
    {
      id: 'campus_map',
      label: 'Campus Map',
      icon: Map,
      badge: 'Live GIS',
      isFeature: true,
      visibleFor: ['student', 'faculty', 'admin', 'staff']
    },
    {
      id: 'my_campus',
      label: 'Campus Info',
      icon: MapPin,
      badge: null,
      visibleFor: ['student', 'faculty', 'admin', 'staff']
    },
    {
      id: 'requests',
      label: role === 'student' ? 'My Requests' : role === 'faculty' ? 'Assigned Tickets' : 'Requests Queue',
      icon: FileText,
      badge: openRequestsCount > 0 ? `${openRequestsCount}` : null,
      visibleFor: ['student', 'faculty', 'admin', 'staff']
    },
    {
      id: 'gate_passes',
      label: role === 'student' ? 'Digital Gate Pass' : 'Gate Passes',
      icon: Luggage,
      badge: myActivePassesCount > 0 ? `${myActivePassesCount} active` : null,
      visibleFor: ['student', 'admin']
    },
    {
      id: 'my_documents',
      label: 'My Documents',
      icon: Award,
      badge: myDocsCount > 0 ? `${myDocsCount}` : null,
      visibleFor: ['student']
    },
    {
      id: 'faculty_dashboard',
      label: 'Faculty Authorization',
      icon: GraduationCap,
      badge: pendingGatePassCount > 0 ? `${pendingGatePassCount} pending` : null,
      visibleFor: ['faculty', 'admin', 'staff']
    },
    {
      id: 'notices',
      label: 'Notices',
      icon: Bell,
      badge: unreadNoticesCount > 0 ? `${unreadNoticesCount}` : null,
      visibleFor: ['student', 'faculty', 'admin', 'staff']
    },
    {
      id: 'admin_dashboard',
      label: role === 'staff' ? 'Academic Desk' : 'Admin Console',
      icon: LayoutDashboard,
      badge: bonafidePendingCount > 0 ? `${bonafidePendingCount} new` : null,
      visibleFor: ['admin', 'staff']
    },
    {
      id: 'workflow_monitor',
      label: 'Workflow Monitor',
      icon: GitMerge,
      badge: 'Engine',
      isFeature: true,
      visibleFor: ['admin']
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Puzzle,
      badge: '6 Nodes',
      visibleFor: ['admin']
    },
    {
      id: 'rollout',
      label: 'Rollout Plan',
      icon: CalendarRange,
      badge: null,
      visibleFor: ['admin']
    },
    {
      id: 'accessibility',
      label: 'Accessibility & SMS',
      icon: Smartphone,
      badge: isOfflineSimulated ? 'Offline' : null,
      visibleFor: ['admin']
    },
    {
      id: 'settings',
      label: 'Profile & Security',
      icon: Settings,
      badge: null,
      visibleFor: ['student', 'faculty', 'admin', 'staff']
    }
  ].filter(item => item.visibleFor.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F7F8F6] border-r border-[#E5E9E5] flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand & Tagline Header */}
        <div>
          <div className="p-6 border-b border-[#E5E9E5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0D8B65] flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
                CF
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-[#202722] tracking-tight leading-snug">CampusFlow</h1>
                <p className="text-xs text-[#5E6D64] leading-relaxed mt-0.5">One campus. One connected experience.</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-230px)]">
            <div className="px-3 pt-1 pb-1 text-xs font-bold text-[#5E6D64] uppercase tracking-wider">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group text-left leading-normal
                    ${isActive 
                      ? 'bg-white text-[#0D8B65] font-semibold border border-[#E5E9E5] shadow-2xs' 
                      : 'text-[#5E6D64] hover:text-[#202722] hover:bg-neutral-200/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D8B65]' : 'text-[#5E6D64] group-hover:text-[#202722]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-md font-mono tabular-nums shrink-0 ml-2 font-semibold leading-none
                      ${item.isFeature 
                        ? 'bg-[#E6F5EF] text-[#0D8B65]'
                        : isActive 
                          ? 'bg-[#F7F8F6] text-[#202722]' 
                          : 'bg-neutral-200/70 text-[#5E6D64]'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: Demo Persona Card */}
        <div className="p-6 border-t border-[#E5E9E5] bg-[#F7F8F6]">
          <div className="p-4 bg-white border border-[#E5E9E5] rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E6F5EF] text-[#0D8B65] font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#202722] leading-snug truncate">{currentUser.name}</div>
                <div className="text-xs text-[#5E6D64] leading-normal truncate mt-0.5">{currentUser.roleTitle}</div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-[#E5E9E5] flex items-center justify-between text-xs text-[#5E6D64] leading-normal">
              <span className="font-mono">BPUT Gateway</span>
              <button
                onClick={logout}
                className="text-[#992828] hover:underline font-semibold flex items-center gap-1"
                title="End authenticated session"
              >
                <LogOut className="w-3 h-3" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
