import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs || crumbs.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className="border-b border-border/40 bg-background/40 py-3 backdrop-blur"
    >
      <ol className="container mx-auto flex flex-wrap items-center gap-1.5 px-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li
              key={`${c.label}-${i}`}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {i === 0 && <Home className="h-3 w-3 opacity-70" aria-hidden="true" />}
              {c.href && !last ? (
                <Link
                  to={c.href}
                  className="transition-colors hover:text-foreground"
                  itemProp="item"
                >
                  <span itemProp="name">{c.label}</span>
                </Link>
              ) : (
                <span itemProp="name" aria-current={last ? "page" : undefined} className={last ? "text-foreground" : undefined}>
                  {c.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
              {!last && <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
