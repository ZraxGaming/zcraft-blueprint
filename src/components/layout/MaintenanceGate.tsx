import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { siteConfig } from "@/config/siteEnv";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { loading: authLoading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Override maintenance mode in development/local environment
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  const isMaintenanceMode = !isDevelopment && siteConfig.features.maintenanceBanner && settings?.maintenance_mode === 'true';
  
  const maintenanceAllowedPaths = [
    "/maintenance",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/auth/discord/callback",
    "/admin",
  ];
  const isMaintenanceExempt = maintenanceAllowedPaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (authLoading || settingsLoading) return;
    if (isMaintenanceMode && !isAdmin && !isMaintenanceExempt) {
      navigate("/maintenance", { replace: true });
    }
  }, [authLoading, settingsLoading, isMaintenanceMode, isAdmin, isMaintenanceExempt, navigate]);

  // Show loading state while auth or settings are loading
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isMaintenanceMode && !isAdmin && !isMaintenanceExempt) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}
