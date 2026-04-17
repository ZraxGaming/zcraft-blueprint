import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Copy, Check, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { enabledNavLinks, siteConfig } from "@/config/siteEnv";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { user, userProfile, logout, isAdmin } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored !== "light";
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const copyIP = () => {
    navigator.clipboard.writeText(siteConfig.playIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4">

        <div className="flex h-16 items-center justify-between">

          {/* LEFT - LOGO */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={siteConfig.logo}
                alt="logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER - NAV */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {enabledNavLinks.map(link =>
              link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition",
                    location.pathname === link.path && "text-foreground"
                  )}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition",
                    location.pathname === link.path && "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* RIGHT - ACTIONS */}
          <div className="flex items-center gap-2">

            {/* IP */}
            {siteConfig.features.copyIpButton && (
              <Button
                variant="ghost"
                onClick={copyIP}
                className="hidden md:flex h-9 px-3 text-xs font-mono border border-border/60 bg-card/50"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : siteConfig.playIp}
              </Button>
            )}

            {/* THEME */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border border-border/60 bg-card/50"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* USER */}
            {user && userProfile ? (
              <div className="flex items-center gap-2">

                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-1" />
                    </Link>
                  </Button>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 h-9 rounded-xl border border-border/60 bg-card/50"
                >
                  {userProfile.avatar_url && (
                    <img
                      src={userProfile.avatar_url}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline">{userProfile.username}</span>
                </Link>

                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>

              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" className="btn-primary-gradient" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}

            {/* MOBILE MENU */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>

          </div>

        </div>
      </div>

      {/* MOBILE */}
      {isOpen && (
        <div className="lg:hidden border-t bg-card/95">
          <div className="px-4 py-4 space-y-2">

            {enabledNavLinks.map(link =>
              link.external ? (
                <a key={link.path} href={link.path}
                  className="block px-4 py-2 rounded-lg hover:bg-muted">
                  {link.name}
                </a>
              ) : (
                <Link key={link.path} to={link.path}
                  className="block px-4 py-2 rounded-lg hover:bg-muted">
                  {link.name}
                </Link>
              )
            )}

            <div className="pt-4 border-t space-y-2">
              <Button onClick={copyIP} className="w-full">
                Copy IP
              </Button>
              <Button onClick={toggleTheme} className="w-full">
                Toggle Theme
              </Button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
