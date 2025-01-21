import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import { LoginPage } from './pages/login';
import { ThemeProvider } from './providers/theme-provider';
import { Sidebar } from './components/layout/sidebar';
import { MobileNav } from './components/layout/mobile-nav';
import { useStore } from '@/lib/store';
import { DriversPage } from './pages/drivers';
import { OrganizationsPage } from './pages/organizations';
import { EmployeesPage } from './pages/employees';
import { PartnersPage } from './pages/partners';
import { ProfilePage } from './pages/profile';
import { SavedReportsPage } from './pages/saved-reports';
import { ReportsPage } from './pages/reports';
import { PartnerReportsPage } from './pages/partner-reports';
import { Toaster } from "@/components/ui/toaster";
import { useProfile } from '@/hooks/use-profile';

function App() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const { 
    currentPage, 
    setCurrentPage,
    sidebarCollapsed: collapsed, 
    setSidebarCollapsed: setCollapsed
  } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="admin-ui-theme">
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="admin-ui-theme">
      <BrowserRouter>
        <div className="flex min-h-screen relative md:pt-0 pt-[73px]">
          <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-width duration-300 border-r bg-background hidden md:block fixed top-0 bottom-0 left-0 z-30`}>
            <Sidebar
              collapsed={collapsed}
              onCollapse={() => setCollapsed(!collapsed)}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
            />
          </aside>
          <main className={`flex-1 min-w-0 pb-20 md:pb-0 ${collapsed ? 'md:ml-16' : 'md:ml-64'} transition-[margin] duration-300`}>
            <Routes>
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route 
                path="/partners" 
                element={profile?.role === 'Super' ? <PartnersPage /> : null} 
              />
              <Route path="/saved-reports" element={<SavedReportsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route 
                path="/partner-reports" 
                element={profile?.role === 'Super' ? <PartnerReportsPage /> : <Navigate to="/organizations" replace />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/organizations" replace />} />
            </Routes>
            <Toaster />
          </main>
          <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );

}
export default App;