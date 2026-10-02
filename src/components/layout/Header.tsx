import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Wifi, 
  WifiOff, 
  Menu, 
  X, 
  ChevronDown,
  Building2,
  GraduationCap,
  Wrench,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  User
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { Role } from '../../types/index.ts';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { 
    role, 
    currentUser, 
    logout,
    notices, 
    activeTab, 
    setActiveTab,
    searchQuery, 
    setSearchQuery,
    isOfflineSimulated,
    setIsOfflineSimulated 
  } = useCampus();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadNoticesCount = notices.filter(n => !n.isRead).length;

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'campus_map': return 'Campus Map';
      case 'my_campus': return 'Campus Info';
      case 'requests': return role === 'student' ? 'My Requests' : 'Requests Queue';
      case 'gate_passes': return 'Digital Gate Passes';
      case 'my_documents': return 'My Documents';
      case 'verification': return 'Verification Registry';
      case 'notices': return 'Notices';
      case 'faculty_dashboard': return 'Faculty Authorization Desk';
      case 'admin_dashboard': return role === 'staff' ? 'Academic Desk' : 'Admin Console';
      case 'workflow_monitor': return 'Workflow Monitor';
      case 'integrations': return 'Integrations';
      case 'accessibility': return 'Accessibility';
      case 'rollout': return 'Rollout Plan';
      case 'settings': return 'Profile & Security';
      default: return 'Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F7F8F6] border-b border-[#E5E9E5] px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Zone: Brand + Mobile trigger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onMobileMenuToggle} 
            className="lg:hidden p-2 text-[#5E6D64] hover:text-[#202722] rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-bold text-lg tracking-tight text-[#202722] whitespace-nowrap">
              CampusFlow
            </span>
            <span className="hidden sm:inline text-sm text-[#5E6D64]">/</span>
            <span className="hidden sm:inline text-sm font-semibold text-[#5E6D64] whitespace-nowrap">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Center Zone: Quick Search (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E6D64]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'requests' && e.target.value.trim().length > 0) {
                  setActiveTab('requests');
                }
              }}
              placeholder="Search request ID (e.g. REQ-1042), title, room..."
              className="w-full bg-white border border-[#E5E9E5] rounded-xl pl-10 pr-4 py-2 text-sm text-[#202722] placeholder:text-[#5E6D64] focus:outline-none focus:border-[#0D8B65] transition-all shadow-2xs leading-normal"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E6D64] hover:text-[#202722]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Zone: Controls, Demo Persona Switcher & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Simulated Offline Toggle */}
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            title={isOfflineSimulated ? "Simulating offline connectivity (Click to restore)" : "Simulate offline / weak connectivity"}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              isOfflineSimulated 
                ? 'bg-[#FDF6EB] text-[#8A5B15] border-[#F1DFC4]' 
                : 'bg-white text-[#5E6D64] border-[#E5E9E5] hover:bg-[#F7F8F6]'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#8A5B15] animate-pulse" />
                <span>Offline Demo</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#0D8B65]" />
                <span className="text-[#5E6D64]">Online</span>
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-[#5E6D64] hover:text-[#202722] bg-white border border-[#E5E9E5] rounded-xl hover:border-[#0D8B65]/40 transition-colors shadow-2xs"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNoticesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0D8B65] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {unreadNoticesCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E9E5] rounded-2xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5] mb-3">
                  <span className="text-xs font-bold text-[#202722]">Official Bulletins ({notices.length})</span>
                  <button 
                    onClick={() => {
                      setActiveTab('notices');
                      setIsNotificationOpen(false);
                    }}
                    className="text-xs text-[#0D8B65] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notices.slice(0, 4).map(notice => (
                    <div 
                      key={notice.id}
                      onClick={() => {
                        setActiveTab('notices');
                        setIsNotificationOpen(false);
                      }}
                      className="p-3 rounded-xl hover:bg-[#F7F8F6] cursor-pointer transition-colors text-left border border-transparent hover:border-[#E5E9E5]"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] text-[#5E6D64] mb-1">
                        <span className="font-semibold text-[#0D8B65] uppercase">{notice.category}</span>
                        <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#202722] line-clamp-1">{notice.title}</h4>
                      <p className="text-xs text-[#5E6D64] line-clamp-2 mt-0.5 leading-relaxed">{notice.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Menu & Sign Out */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#E5E9E5] hover:border-[#1E3A2F]/40 rounded-xl transition-colors text-left shadow-2xs"
              aria-label="User Account Menu"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                role === 'student'
                  ? 'bg-[#E6F5EF] text-[#0D8B65]'
                  : role === 'faculty'
                    ? 'bg-[#EEF4F9] text-[#234E70]'
                    : role === 'staff'
                      ? 'bg-[#EEF4F9] text-[#234E70]'
                      : 'bg-[#FDF6EB] text-[#8A5B15]'
              }`}>
                {currentUser.initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#202722] leading-snug">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#5E6D64]">
                  {role === 'student' ? 'Student' : role === 'faculty' ? 'Faculty' : role === 'staff' ? 'Staff' : 'Administrator'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5E6D64]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E9E5] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
                {/* Account Details Header */}
                <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] mb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#202722] truncate">{currentUser.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      role === 'student'
                        ? 'bg-[#E6F5EF] text-[#0D8B65]'
                        : role === 'faculty'
                          ? 'bg-[#EEF4F9] text-[#234E70]'
                          : role === 'staff'
                            ? 'bg-[#EEF4F9] text-[#234E70]'
                            : 'bg-[#FDF6EB] text-[#8A5B15]'
                    }`}>
                      {role}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5E6D64] truncate">{currentUser.email}</div>
                  {currentUser.studentId && (
                    <div className="text-[10px] font-mono text-[#5E6D64]">Reg No: {currentUser.studentId}</div>
                  )}
                  <div className="text-[10px] text-[#5E6D64] truncate">{currentUser.department}</div>
                </div>

                {/* Quick Navigation Items */}
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg text-[#202722] hover:bg-[#F7F8F6] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#5E6D64]" />
                    <span>Account Settings & Security</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('campus_map');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg text-[#202722] hover:bg-[#F7F8F6] transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#5E6D64]" />
                    <span>Campus Map Directory</span>
                  </button>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2 mt-2 border-t border-[#E5E9E5]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FCEDEC] hover:bg-[#fbdad7] text-[#992828] rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of CampusFlow</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
