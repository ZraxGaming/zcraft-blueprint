import { useState } from "react";
import { Moon, Sun, User, Shield, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button"; // <-- safer import (fix if needed)

export function Navbar() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <nav className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT — LOGO */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="ZCraft Logo"
            className="h-12 w-auto object-contain transition-transform hover:scale-105"
          />
        </div>

        {/* CENTER — MAIN NAV (MAX 4 BUTTONS) */}
        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-sm font-medium">
            Play
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Rules
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Store
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Vote
          </Button>
        </div>

        {/* RIGHT — USER / ADMIN / SETTINGS */}
        <div className="flex items-center gap-2">

          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <Shield className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDark}>
            {dark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

        </div>

      </div>
    </nav>
  );
}
