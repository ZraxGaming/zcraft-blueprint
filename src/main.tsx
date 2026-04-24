import "./lib/consoleFilter";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { PostHogProvider, PostHogErrorBoundary, PostHogErrorBoundaryFallbackProps } from "@posthog/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initializeSentry } from "@/lib/sentry";
import { ensureIntegrityPulse } from "@/lib/_ig";
import { trackAnalyticsException } from "@/services/analyticsService";
import App from "./App.tsx";
import "./index.css";

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com",
  defaults: "2026-01-30",
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
} as const;

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() || "";

initializeSentry();
ensureIntegrityPulse();

function AppErrorFallback({ error, componentStack }: PostHogErrorBoundaryFallbackProps) {
  useEffect(() => {
    trackAnalyticsException(error, {
      componentStack,
      source: "posthog-error-boundary",
    });
  }, [error, componentStack]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">Oops!</h1>
        <p className="text-muted-foreground">Something went wrong. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  posthogKey ? (
    <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
      <PostHogErrorBoundary fallback={AppErrorFallback}>
        <App />
      </PostHogErrorBoundary>
    </PostHogProvider>
  ) : (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
);
