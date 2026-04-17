import { Button } from "@/components/ui/button";
import { Moon, Sun, User, Shield, MessageCircle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <nav className="w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT — Logo */}
        <div className="flex items-center">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
            <img
              src="/logo.png"
              alt="ZCraft Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
        </div>

        {/* CENTER — Nav Buttons (max 4) */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <Button variant="ghost">Play</Button>
          <Button variant="ghost">Servers</Button>
          <Button variant="ghost">Store</Button>
          <Button variant="ghost">Rules</Button>
        </div>

        {/* RIGHT — Icon Controls */}
        <div className="flex items-center gap-1">
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
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

      </div>
    </nav>
  );
}
