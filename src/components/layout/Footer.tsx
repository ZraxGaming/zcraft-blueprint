import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const footerLinks = {
  Server: [
    { name: "Home", path: "/" },
    { name: "Play", path: "/play" },
    { name: "Status", path: "https://status.z-craft.xyz", external: true },
    { name: "Rules", path: "/rules" },
    { name: "Bans", path: "https://bans.z-craft.xyz", external: true },
  ],
  Community: [
    { name: "Forums", path: "/forums" },
    { name: "News", path: "/news" },
    { name: "Changelogs", path: "/events" },
    { name: "Staff", path: "/staff" },
  ],
  Resources: [
    { name: "Wiki", path: "https://wiki.z-craft.xyz", external: true },
    { name: "Support", path: "/support" },
    { name: "Appeal", path: "https://appeal.z-craft.xyz", external: true },
    { name: "Store", path: "https://store.z-craft.xyz", external: true },
  ],
  Legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ],
};

const socialLinks = [
  { name: "Discord", label: "Discord", url: "https://discord.z-craft.xyz" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">Z</span>
              </div>
              <span className="font-display text-xl font-bold text-gradient">ZCraft</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The ultimate Minecraft experience. Join thousands of players today!
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title={social.name}
                  aria-label={social.name}
                >
                  <span className="text-xs font-medium">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold mb-4 text-foreground">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {link.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Copyright 2026 ZCraft. Not affiliated with Mojang AB.
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            play.zcraftmc.xyz | Version 1.21.4
          </p>
        </div>
      </div>
    </footer>
  );
}
