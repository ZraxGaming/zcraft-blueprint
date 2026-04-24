import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { siteConfig } from "@/config/siteEnv";
import { ensureIntegrityPulse, getIntegritySnapshot, onIntegrityChange } from "@/lib/_ig";
import { useState } from "react";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { loading: authLoading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [forcedMaintenance, setForcedMaintenance] = useState(() => getIntegritySnapshot()?.forced ?? false);
  
  // Override maintenance mode in development/local environment
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  const isMaintenanceMode = !isDevelopment && siteConfig.features.maintenanceBanner && settings?.maintenance_mode === 'true';
  const isForcedMode = !isDevelopment && forcedMaintenance === true;
  
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
    ensureIntegrityPulse();
    return onIntegrityChange((state) => setForcedMaintenance(Boolean(state?.forced)));
  }, []);

  useEffect(() => {
    if (authLoading || settingsLoading) return;
    if ((isMaintenanceMode || isForcedMode) && !isAdmin && !isMaintenanceExempt) {
      navigate("/maintenance", { replace: true });
    }
  }, [authLoading, settingsLoading, isMaintenanceMode, isForcedMode, isAdmin, isMaintenanceExempt, navigate]);

  // Show loading state while auth or settings are loading
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((isMaintenanceMode || isForcedMode) && !isAdmin && !isMaintenanceExempt) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}
