import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from "react-router-dom";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import { AdminRoute, ClientRoute, PublicRoute } from "@/components/routes/RouteGuards";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import PageNotFound from "@/lib/PageNotFound";
import { queryClientInstance } from "@/lib/query-client";
import AccessPage from "@/pages/AccessPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminExperiences from "@/pages/AdminExperiences";
import AdminFAQs from "@/pages/AdminFAQs";
import AdminLeads from "@/pages/AdminLeads";
import AdminSettings from "@/pages/AdminSettings";
import AdminSimulation from "@/pages/AdminSimulation";
import AdminWineries from "@/pages/AdminWineries";
import AdminWineryEdit from "@/pages/AdminWineryEdit";
import ClientPortal from "@/pages/ClientPortal";
import DemoCeller from "@/pages/DemoCeller";
import PublicHome from "@/pages/PublicHome";
import SectorLanding from "@/pages/SectorLanding";


const LegacyBusinessRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/business/${id}`} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }

  if (authError?.type === "user_not_registered") return <UserNotRegisteredError />;

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><PublicHome /></PublicRoute>} />
      <Route path="/sectores/:sector" element={<PublicRoute><SectorLanding /></PublicRoute>} />
      <Route path="/demo" element={<PublicRoute><DemoCeller /></PublicRoute>} />
      <Route path="/demo/:sector" element={<PublicRoute><DemoCeller /></PublicRoute>} />
      <Route path="/acceso" element={<PublicRoute><AccessPage /></PublicRoute>} />

      <Route path="/cliente/*" element={<ClientRoute><ClientPortal /></ClientRoute>} />

      <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/accounts" element={<AdminRoute><AdminWineries /></AdminRoute>} />
      <Route path="/admin/business/:id" element={<AdminRoute><AdminWineryEdit /></AdminRoute>} />
      <Route path="/admin/services" element={<AdminRoute><AdminExperiences /></AdminRoute>} />
      <Route path="/admin/faqs" element={<AdminRoute><AdminFAQs /></AdminRoute>} />
      <Route path="/admin/simulation" element={<AdminRoute><AdminSimulation /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />

      <Route path="/DemoCeller" element={<Navigate to="/demo" replace />} />
      <Route path="/PublicDemoPage" element={<Navigate to="/demo" replace />} />
      <Route path="/admin/wineries" element={<Navigate to="/admin/accounts" replace />} />
      <Route path="/admin/winery/:id" element={<LegacyBusinessRedirect />} />
      <Route path="/admin/experiences" element={<Navigate to="/admin/services" replace />} />
      <Route path="/AdminDashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/AdminWineries" element={<Navigate to="/admin/accounts" replace />} />
      <Route path="/AdminExperiences" element={<Navigate to="/admin/services" replace />} />
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
        <Router><AuthenticatedApp /></Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
