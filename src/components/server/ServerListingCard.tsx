import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteEnv";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
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

  // ✅ LIMIT TO 4 BUTTONS (as requested)
  const navLinks = siteConfig.navLinks.slice(0, 4);

  return (
    <header className="sticky top-0 z-50">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

          {/* LEFT — LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src={siteConfig.logo}
              alt="logo"
              className="h-12 w-auto object-contain hover:scale-105 transition"
            />
          </Link>

          {/* CENTER — MAIN NAV */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              return link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-sm font-medium transition hover:text-primary",
                    active && "text-primary"
                  )}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition hover:text-primary",
                    active && "text-primary"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* RIGHT — USER / SETTINGS */}
          <div className="flex items-center gap-2">

            {/* THEME */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* AUTH */}
            {user && userProfile ? (
              <>
                {isAdmin && (
                  <Button size="icon" variant="outline" asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border"
                >
                  {userProfile.avatar_url && (
                    <img
                      src={userProfile.avatar_url}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm truncate max-w-[100px]">
                    {userProfile.username}
                  </span>
                </Link>

                <Button size="icon" variant="ghost" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}

            {/* MOBILE MENU BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-2">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.path}
                href={link.path}
                className="block py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
