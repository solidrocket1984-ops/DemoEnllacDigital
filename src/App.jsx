import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import DemoCeller from './pages/DemoCeller';
import AdminDashboard from './pages/AdminDashboard';
import AdminWineries from './pages/AdminWineries';
import AdminWineryEdit from './pages/AdminWineryEdit';
import AdminExperiences from './pages/AdminExperiences';
import AdminFAQs from './pages/AdminFAQs';
import AdminSimulation from './pages/AdminSimulation';
import AdminSettings from './pages/AdminSettings';
import AdminLeads from './pages/AdminLeads';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
  <Route path="/" element={<Navigate to="/demo" replace />} />

  {/* Ruta principal bona */}
  <Route path="/demo" element={<DemoCeller />} />

  {/* Compatibilitat amb rutes antigues */}
  <Route path="/DemoCeller" element={<Navigate to="/demo" replace />} />
  <Route path="/PublicDemoPage" element={<Navigate to="/demo" replace />} />

  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/wineries" element={<AdminWineries />} />
  <Route path="/admin/winery/:id" element={<AdminWineryEdit />} />
  <Route path="/admin/experiences" element={<AdminExperiences />} />
  <Route path="/admin/faqs" element={<AdminFAQs />} />
  <Route path="/admin/simulation" element={<AdminSimulation />} />
  <Route path="/admin/settings" element={<AdminSettings />} />
  <Route path="/admin/leads" element={<AdminLeads />} />

  {/* Compatibilitat amb rutes admin antigues */}
  <Route path="/AdminDashboard" element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="/AdminWineries" element={<Navigate to="/admin/wineries" replace />} />
  <Route path="/AdminWineryEdit" element={<Navigate to="/admin/wineries" replace />} />
  <Route path="/AdminExperiences" element={<Navigate to="/admin/experiences" replace />} />
  <Route path="/AdminFAQs" element={<Navigate to="/admin/faqs" replace />} />
  <Route path="/AdminSimulation" element={<Navigate to="/admin/simulation" replace />} />
  <Route path="/AdminSettings" element={<Navigate to="/admin/settings" replace />} />

  <Route path="*" element={<PageNotFound />} />
</Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App