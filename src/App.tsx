import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { PageTransition } from "@/components/ui/PageTransition";
import Index from "./pages/Index";
import PlayPage from "./pages/PlayPage";
import ForumsPage from "./pages/ForumsPage";
import ForumCategoryPage from "./pages/ForumCategoryPage";
import ForumThreadPage from "./pages/ForumThreadPage";
import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import RulesPage from "./pages/RulesPage";
import SupportPage from "./pages/SupportPage";
import StatusPage from "./pages/StatusPage";
import StorePage from "./pages/StorePage";
import StaffPage from "./pages/StaffPage";
import EventsPage from "./pages/ChangelogsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ServerListings from "./pages/ServerListings";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminForumsPage from "./pages/admin/AdminForumsPage";
import AdminWikiPage from "./pages/admin/AdminWikiPage";
import AdminChangelogsPage from "./pages/admin/AdminChangelogsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import MaintenancePage from "./pages/MaintenancePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DiscordRedirectPage from "./pages/DiscordRedirectPage";
import DiscordCallbackPage from "./pages/DiscordCallbackPage";
import NotFound from "./pages/NotFound";
import { MaintenanceGate } from "@/components/layout/MaintenanceGate";
import { useState, useEffect } from "react";

// ClientOnly component to prevent SSR issues with localStorage-dependent contexts
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

// SSR-safe component that renders static content
function SSRSafeApp() {
  return (
    <div>
      <h1>ZCraft Network</h1>
      <p>Loading...</p>
    </div>
  );
}

const queryClient = new QueryClient();

// Admin route protection component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ClientOnly>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MaintenanceGate>
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/play" element={<PlayPage />} />
                    <Route path="/server-listings" element={<ServerListings />} />
                    <Route path="/forums" element={<ForumsPage />} />
                    <Route path="/forums/:slug" element={<ForumCategoryPage />} />
                    <Route path="/forums/:slug/:threadId" element={<ForumThreadPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:slug" element={<NewsArticlePage />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/status" element={<StatusPage />} />
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/staff" element={<StaffPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/discord" element={<DiscordRedirectPage />} />
                    <Route path="/auth/discord/callback" element={<DiscordCallbackPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                    <Route path="/admin/news" element={<AdminRoute><AdminNewsPage /></AdminRoute>} />
                    <Route path="/admin/forums" element={<AdminRoute><AdminForumsPage /></AdminRoute>} />
                    <Route path="/admin/wiki" element={<AdminRoute><AdminWikiPage /></AdminRoute>} />
                    <Route path="/admin/changelogs" element={<AdminRoute><AdminChangelogsPage /></AdminRoute>} />
                    <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </MaintenanceGate>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </ClientOnly>
  </QueryClientProvider>
);

export default App;
export { SSRSafeApp };
