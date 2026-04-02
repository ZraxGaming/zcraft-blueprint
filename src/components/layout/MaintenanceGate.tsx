import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Navigate, useLocation } from "react-router-dom";
import { siteConfig } from "@/config/siteEnv";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const location = useLocation();

  // Show loading state while auth or settings are loading
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isMaintenanceMode = siteConfig.features.maintenanceBanner && settings?.maintenance_mode === 'true';
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

  if (isMaintenanceMode && !isAdmin && !isMaintenanceExempt) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}
