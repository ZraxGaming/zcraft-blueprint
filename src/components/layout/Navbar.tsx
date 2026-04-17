import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Copy, Check, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { enabledNavLinks, siteConfig } from "@/config/siteEnv";

/**
 * Sleek sticky navbar with a centered logo that overflows the bar by 4px.
 * Left: primary nav links. Right: actions (IP, theme, auth).
 */
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

  // Split nav links into left + right of the logo (max 3 each side for desktop balance).
  const leftLinks = enabledNavLinks.slice(0, Math.ceil(enabledNavLinks.length / 2));
  const rightLinks = enabledNavLinks.slice(Math.ceil(enabledNavLinks.length / 2));

  const renderNavLink = (link: typeof enabledNavLinks[number]) => {
    const active = location.pathname === link.path;
    const className = cn(
      "relative text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground",
      active && "text-foreground",
    );
    return link.external ? (
      <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className={className}>
        {link.name}
        {active && <span className="absolute -bottom-1 left-0 h-px w-full bg-primary" aria-hidden="true" />}
      </a>
    ) : (
      <Link key={link.path} to={link.path} className={className}>
        {link.name}
        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute -bottom-1 left-0 h-px w-full bg-primary"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50">
      <nav
        className="relative border-b border-border/50 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
        aria-label="Primary"
      >
        <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* LEFT NAV */}
          <div className="hidden flex-1 items-center gap-7 lg:flex">
            {leftLinks.map(renderNavLink)}
          </div>

          {/* CENTERED LOGO — overflows ~4px below the navbar */}
          <Link
            to="/"
            aria-label={`${siteConfig.name} home`}
            className="absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-[calc(100%-4px)]"
          >
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card/90 p-1.5 shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.55)] backdrop-blur"
            >
              <span
                className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <img
                src={siteConfig.logo}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain"
              />
            </motion.div>
          </Link>

          {/* Mobile: small inline logo so the bar isn't empty */}
          <Link to="/" className="lg:hidden flex items-center" aria-label={`${siteConfig.name} home`}>
            <img src={siteConfig.logo} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            <span className="ml-2 font-display text-base font-bold text-gradient">{siteConfig.shortName}</span>
          </Link>

          {/* RIGHT NAV */}
          <div className="hidden flex-1 items-center justify-end gap-7 lg:flex">
            {rightLinks.map(renderNavLink)}
          </div>

          {/* ACTIONS */}
          <div className="ml-2 flex items-center gap-2">
            {siteConfig.features.copyIpButton && (
              <Button
                variant="ghost"
                onClick={copyIP}
                className="hidden md:inline-flex h-9 gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 text-xs font-mono"
                aria-label={copied ? "Server IP copied" : "Copy server IP"}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : siteConfig.playIp}
              </Button>
            )}

            {siteConfig.features.themeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9 rounded-full border border-border/60 bg-card/60"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {user && userProfile ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full">
                    <Link to="/admin" aria-label="Admin dashboard">
                      <Shield className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Link
                  to="/profile"
                  className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 text-sm"
                  aria-label="Open profile"
                >
                  {userProfile.avatar_url && (
                    <img src={userProfile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                  )}
                  <span className="max-w-[100px] truncate">{userProfile.username}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out" className="h-9 w-9 rounded-full">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" className="btn-primary-gradient hidden sm:inline-flex" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Bottom hairline glow under the centered logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur"
          >
            <div className="space-y-1 px-4 py-4">
              {enabledNavLinks.map((link) => {
                const active = location.pathname === link.path;
                const cls = cn(
                  "block rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-primary/10 text-primary",
                );
                return link.external ? (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setIsOpen(false)}>
                    {link.name}
                  </a>
                ) : (
                  <Link key={link.path} to={link.path} className={cls} onClick={() => setIsOpen(false)}>
                    {link.name}
                  </Link>
                );
              })}
              <div className="grid grid-cols-2 gap-2 pt-3">
                {siteConfig.features.copyIpButton && (
                  <Button onClick={copyIP} variant="outline" className="w-full">
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy IP"}
                  </Button>
                )}
                {siteConfig.features.themeToggle && (
                  <Button onClick={toggleTheme} variant="outline" className="w-full">
                    {isDark ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
                    Theme
                  </Button>
                )}
                {!user && (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild className="btn-primary-gradient w-full">
                      <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for the overflowing logo so page content doesn't get covered */}
      <div className="h-3" aria-hidden="true" />
    </header>
  );
}
