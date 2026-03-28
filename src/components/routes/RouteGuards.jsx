import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { canAccessAdmin, canAccessClient } from "@/lib/access-control";

export function PublicRoute({ children }) {
  return children;
}

export function ClientRoute({ children }) {
  const { user, isAuthenticated, navigateToLogin, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return null;
  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }
  if (!canAccessClient(user)) {
    return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, navigateToLogin, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }
  if (!canAccessAdmin(user)) {
    return <Navigate to="/cliente" replace />;
  }
  return children;
}
