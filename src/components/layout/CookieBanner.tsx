import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/siteEnv";

const CONSENT_KEY = "cookie-consent-dismissed";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!siteConfig.features.cookieBanner) {
      setVisible(false);
      return;
    }
    const dismissed = localStorage.getItem(CONSENT_KEY);
    setVisible(dismissed !== "true");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="border-t border-border/60 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center">
        <div className="flex-1 text-sm leading-6 text-muted-foreground">
          This site uses browser storage and cookies for sign-in, UI preferences, sidebar state, and basic site features.
          <Link to="/privacy" className="text-primary hover:underline ml-1">
            Read the privacy policy
          </Link>
          .
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border/60 bg-card/60"
            onClick={() => {
              localStorage.setItem(CONSENT_KEY, "true");
              setVisible(false);
            }}
          >
            Dismiss
          </Button>
          <Button
            className="btn-primary-gradient"
            onClick={() => {
              localStorage.setItem(CONSENT_KEY, "true");
              setVisible(false);
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
