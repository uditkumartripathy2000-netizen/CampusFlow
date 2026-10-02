/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { AuthPage } from './components/auth/AuthPage.tsx';
import { OverviewView } from './components/views/OverviewView.tsx';
import { CampusMapView } from './components/views/CampusMapView.tsx';
import { MyRequestsView } from './components/views/MyRequestsView.tsx';
import { RequestWizardView } from './components/views/RequestWizardView.tsx';
import { AdminDashboardView } from './components/views/AdminDashboardView.tsx';
import { FacultyDashboardView } from './components/views/FacultyDashboardView.tsx';
import { GatePassesView } from './components/views/GatePassesView.tsx';
import { WorkflowMonitorView } from './components/views/WorkflowMonitorView.tsx';
import { NoticesView } from './components/views/NoticesView.tsx';
import { AccessibilityView } from './components/views/AccessibilityView.tsx';
import { IntegrationsView } from './components/views/IntegrationsView.tsx';
import { RolloutPlanView } from './components/views/RolloutPlanView.tsx';
import { MyCampusView } from './components/views/MyCampusView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { MyDocumentsView } from './components/views/MyDocumentsView.tsx';
import { VerificationView } from './components/views/VerificationView.tsx';
import { RequestCategory, Role } from './types/index.ts';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const CampusFlowApp: React.FC = () => {
  const { 
    isAuthenticated,
    authenticate,
    activeTab, 
    setActiveTab, 
    selectedRequestId, 
    setSelectedRequestId,
    role,
    activeVerificationCertId,
    setActiveVerificationCertId,
    activeMapLocationId
  } = useCampus();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<RequestCategory | undefined>(undefined);
  const [wizardLocation, setWizardLocation] = useState<{ id: string; name: string } | undefined>(undefined);
  const [deniedRouteInfo, setDeniedRouteInfo] = useState<{ path: string; role: Role } | null>(null);

  const getInitialRoleFromPath = (): Role | undefined => {
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (path.includes('/student') || hash.includes('#/student')) return 'student';
    if (path.includes('/faculty') || hash.includes('#/faculty')) return 'faculty';
    if (path.includes('/admin') || hash.includes('#/admin')) return 'admin';
    return undefined;
  };

  // Check initial URL pathname or hash for /verify/:certificateId and role route guards
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      
      if (path.startsWith('/verify/') || hash.startsWith('#/verify/')) {
        const certId = decodeURIComponent((path.startsWith('/verify/') ? path.replace('/verify/', '') : hash.replace('#/verify/', '')).trim());
        if (certId) {
          setActiveVerificationCertId(certId);
          setActiveTab('verification');
        }
        return;
      }

      // If user is authenticated, evaluate protected routes: /student, /faculty, /admin
      if (isAuthenticated) {
        if (path === '/student' || hash === '#/student') {
          if (role !== 'student' && role !== 'admin') {
            setDeniedRouteInfo({ path: '/student', role });
          } else {
            setDeniedRouteInfo(null);
            if (activeTab === 'faculty_dashboard' || activeTab === 'admin_dashboard') {
              setActiveTab('overview');
            }
          }
        } else if (path === '/faculty' || hash === '#/faculty') {
          if (role !== 'faculty' && role !== 'admin' && role !== 'staff') {
            setDeniedRouteInfo({ path: '/faculty', role });
          } else {
            setDeniedRouteInfo(null);
            setActiveTab('faculty_dashboard');
          }
        } else if (path === '/admin' || hash === '#/admin') {
          if (role !== 'admin' && role !== 'staff') {
            setDeniedRouteInfo({ path: '/admin', role });
          } else {
            setDeniedRouteInfo(null);
            setActiveTab('admin_dashboard');
          }
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [isAuthenticated, role, setActiveTab, setActiveVerificationCertId, activeTab]);

  // Sync address bar URL with active role dashboard
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      if (activeTab === 'faculty_dashboard') {
        window.history.replaceState({}, '', '/faculty');
      } else if (activeTab === 'admin_dashboard' || activeTab === 'workflow_monitor' || activeTab === 'integrations' || activeTab === 'rollout') {
        window.history.replaceState({}, '', '/admin');
      } else if (role === 'student' && (activeTab === 'overview' || activeTab === 'requests' || activeTab === 'my_documents' || activeTab === 'gate_passes')) {
        window.history.replaceState({}, '', '/student');
      }
    } catch (e) {
      // ignore
    }
  }, [activeTab, role, isAuthenticated]);

  const handleOpenWizard = (category?: RequestCategory, location?: { id: string; name: string }) => {
    setWizardCategory(category);
    setWizardLocation(location);
    setIsWizardOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setSelectedRequestId(id);
    setActiveTab('requests');
  };

  const handleNavigateToVerify = (certificateId: string) => {
    setActiveVerificationCertId(certificateId);
    setActiveTab('verification');
    try {
      window.history.pushState({}, '', `/verify/${encodeURIComponent(certificateId)}`);
    } catch (e) {
      // ignore
    }
  };

  // If user is unauthenticated and not on the public verification registry
  if (!isAuthenticated && activeTab !== 'verification') {
    return (
      <AuthPage 
        onAuthenticated={authenticate} 
        onNavigateToPublicVerify={() => setActiveTab('verification')} 
        initialRole={getInitialRoleFromPath()}
      />
    );
  }

  // If unauthenticated visitor is accessing public verification
  if (!isAuthenticated && activeTab === 'verification') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-8">
        <VerificationView 
          initialCertificateId={activeVerificationCertId}
          onBackToPortal={() => setActiveTab('overview')}
        />
      </div>
    );
  }

  // AUTHORIZATION CHECK: Block unauthorized routes/components by role
  const isTabAuthorizedForRole = (tab: string, userRole: Role): boolean => {
    if (userRole === 'admin') return true;
    if (userRole === 'student') {
      const allowed = ['overview', 'campus_map', 'my_campus', 'requests', 'gate_passes', 'my_documents', 'notices', 'settings', 'verification'];
      return allowed.includes(tab);
    }
    if (userRole === 'faculty') {
      const allowed = ['faculty_dashboard', 'campus_map', 'my_campus', 'notices', 'settings', 'verification'];
      return allowed.includes(tab);
    }
    if (userRole === 'staff') {
      const allowed = ['overview', 'campus_map', 'my_campus', 'requests', 'admin_dashboard', 'faculty_dashboard', 'notices', 'settings', 'verification'];
      return allowed.includes(tab);
    }
    return false;
  };

  const isCurrentTabPermitted = isTabAuthorizedForRole(activeTab, role);
  const isAccessBlocked = deniedRouteInfo !== null || !isCurrentTabPermitted;

  const returnToAuthorizedTab = () => {
    setDeniedRouteInfo(null);
    if (role === 'faculty') setActiveTab('faculty_dashboard');
    else if (role === 'admin' || role === 'staff') setActiveTab('admin_dashboard');
    else setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#202722] flex flex-col font-sans">
      <div className="flex flex-1 min-h-screen">
        {/* Persistent Desktop Sidebar / Mobile Drawer */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            isMobileMenuOpen={isMobileMenuOpen} 
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {/* If Request Wizard is explicitly open */}
            {isWizardOpen ? (
              <RequestWizardView
                initialCategory={wizardCategory}
                initialCampusLocationId={wizardLocation?.id}
                initialCampusLocationName={wizardLocation?.name}
                onSuccess={(newId) => {
                  setIsWizardOpen(false);
                  setWizardLocation(undefined);
                  setSelectedRequestId(newId);
                  setActiveTab('requests');
                }}
                onCancel={() => {
                  setIsWizardOpen(false);
                  setWizardLocation(undefined);
                }}
              />
            ) : isAccessBlocked ? (
              /* Unauthorized Route Guard */
              <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-[#F5CBC8] rounded-3xl shadow-sm text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-[#FCEDEC] text-[#992828] flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#202722]">
                  Access Denied: Protected Route Restricted
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6D64] leading-relaxed">
                  {deniedRouteInfo ? (
                    <>
                      Attempted access to protected route <span className="font-mono font-bold text-[#992828]">{deniedRouteInfo.path}</span> was denied. 
                      Your authenticated account possesses the role <span className="font-mono font-bold text-[#202722] uppercase">{deniedRouteInfo.role}</span>, 
                      which is not authorized to enter this dashboard.
                    </>
                  ) : (
                    <>
                      Your current active role profile (<span className="font-mono font-bold text-[#202722] uppercase">{role}</span>) 
                      is not authorized to view the requested section (<span className="font-mono font-bold text-[#202722]">{activeTab.replace('_', ' ')}</span>). 
                      Institutional permissions strictly partition student documents, faculty reviews, and administrative consoles.
                    </>
                  )}
                </p>
                <div className="pt-2">
                  <button
                    onClick={returnToAuthorizedTab}
                    className="px-5 py-2.5 bg-[#1E3A2F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#163328] transition-colors shadow-2xs inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Authorized {role.toUpperCase()} Workspace</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewView
                    onOpenWizard={handleOpenWizard}
                    onOpenRequestDetail={handleOpenDetail}
                  />
                )}

                {activeTab === 'campus_map' && (
                  <CampusMapView 
                    initialLocationId={activeMapLocationId}
                    onOpenWizardWithLocation={(locId, locName) => {
                      handleOpenWizard('maintenance', { id: locId, name: locName });
                    }}
                  />
                )}

                {activeTab === 'my_campus' && <MyCampusView />}

                {activeTab === 'requests' && (
                  <MyRequestsView
                    onOpenWizard={() => handleOpenWizard()}
                    selectedId={selectedRequestId}
                    onSelectId={(id) => setSelectedRequestId(id)}
                  />
                )}

                {activeTab === 'gate_passes' && (
                  <GatePassesView />
                )}

                {activeTab === 'my_documents' && (
                  <MyDocumentsView
                    onOpenWizard={(category) => handleOpenWizard(category || 'bonafide')}
                    onNavigateToVerify={handleNavigateToVerify}
                  />
                )}

                {activeTab === 'faculty_dashboard' && (
                  <FacultyDashboardView />
                )}

                {activeTab === 'admin_dashboard' && (
                  <AdminDashboardView
                    onOpenRequestDetail={handleOpenDetail}
                  />
                )}

                {activeTab === 'workflow_monitor' && <WorkflowMonitorView />}

                {activeTab === 'notices' && <NoticesView />}

                {activeTab === 'integrations' && <IntegrationsView />}

                {activeTab === 'accessibility' && <AccessibilityView />}

                {activeTab === 'rollout' && <RolloutPlanView />}

                {activeTab === 'settings' && <SettingsView />}

                {activeTab === 'verification' && (
                  <VerificationView 
                    initialCertificateId={activeVerificationCertId}
                    onBackToPortal={() => {
                      if (role === 'faculty') setActiveTab('faculty_dashboard');
                      else if (role === 'admin' || role === 'staff') setActiveTab('admin_dashboard');
                      else setActiveTab('overview');
                    }}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CampusProvider>
      <CampusFlowApp />
    </CampusProvider>
  );
}
