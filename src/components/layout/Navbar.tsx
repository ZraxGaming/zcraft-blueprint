import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Copy, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { enabledNavLinks, siteConfig } from "@/config/siteEnv";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const isAuthPath =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/auth/callback" ||
    location.pathname === "/auth/discord/callback" ||
    location.pathname === "/verify-identity";

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const copyIP = () => {
    if (!siteConfig.features.copyIpButton) return;
    navigator.clipboard.writeText(siteConfig.playIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isAuthPath) {
    return (
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <span className="font-display text-lg font-bold text-gradient">{siteConfig.shortName}</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <span className="font-display text-lg font-bold text-gradient">{siteConfig.shortName}</span>
            </Link>

            <div className="hidden lg:flex items-center gap-0.5">
              {enabledNavLinks.map((link) => (
                link.external ? (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className="nav-link">
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn("nav-link", location.pathname === link.path && "active")}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {siteConfig.features.copyIpButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyIP}
                  className="gap-2 font-mono text-xs h-8"
                  aria-label={copied ? "IP copied to clipboard" : "Copy server IP address"}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {siteConfig.playIp}
                </Button>
              )}
              {siteConfig.features.discordButton && (
                <a
                  href={siteConfig.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                  aria-label={`Join ${siteConfig.name} Discord server`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              )}
              {siteConfig.features.themeToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}

              {user && userProfile ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-muted transition-colors text-sm"
                    aria-label={`Go to ${userProfile.username}'s profile`}
                  >
                    {userProfile.avatar_url && (
                      <img src={userProfile.avatar_url} alt={userProfile.username} className="h-6 w-6 rounded-full" />
                    )}
                    <span>{userProfile.username}</span>
                  </Link>
                  <Button variant="ghost" size="sm" className="h-8" onClick={logout} aria-label="Logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="h-8" asChild aria-label="Go to login page">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" className="btn-primary-gradient h-8" asChild aria-label="Go to register page">
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t bg-card animate-fade-in" id="mobile-menu">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {enabledNavLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-muted"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
                      location.pathname === link.path ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <div className="pt-4 border-t flex flex-col gap-2">
                {user && userProfile ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-center text-sm"
                    >
                      {userProfile.username}
                    </Link>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="flex-1 btn-primary-gradient" asChild>
                      <Link to="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
