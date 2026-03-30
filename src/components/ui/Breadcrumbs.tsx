import React from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs || crumbs.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList" className="bg-transparent py-3">
      <ol className="container mx-auto px-4 flex items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li
            key={i}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {c.href ? (
              <a href={c.href} className="hover:underline" itemProp="item">
                <span itemProp="name">{c.label}</span>
              </a>
            ) : (
              <span itemProp="name" aria-current="page">
                {c.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
            {i < crumbs.length - 1 && <span className="mx-2" aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
