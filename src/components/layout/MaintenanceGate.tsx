import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Navigate } from "react-router-dom";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();

  // Show loading state while auth or settings are loading
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isMaintenanceMode = settings?.maintenance_mode === 'true';

  if (isMaintenanceMode && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}