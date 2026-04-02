/**
 * ============================================================
 * Structured Content Component - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_CONTENT_001__
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StructuredContentProps {
  content?: string | null;
  className?: string;
}

function isDivider(line: string) {
  const value = line.trim();
  return /^[-=*_~•]{3,}$/.test(value);
}

function isBullet(line: string) {
  return /^(\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(line);
}

function stripBullet(line: string) {
  return line.replace(/^(\s*[-*•]\s+|\s*\d+[.)]\s+)/, "").trim();
}

function isHeading(line: string) {
  const value = line.trim();
  return /^#{1,6}\s+/.test(value) || (/^[A-Z0-9][A-Z0-9\s:&/+\-!?.]{4,}$/.test(value) && value === value.toUpperCase());
}

function stripHeading(line: string) {
  return line.replace(/^#{1,6}\s+/, "").trim();
}

export function StructuredContent({ content, className }: StructuredContentProps) {
  if (!content?.trim()) {
    return null;
  }

  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trimEnd()).filter(Boolean);
        if (lines.length === 0) return null;

        if (lines.length === 1 && isDivider(lines[0])) {
          return <Separator key={`separator-${index}`} />;
        }

        if (lines.every(isBullet)) {
          const ordered = /^\s*\d+[.)]\s+/.test(lines[0]);
          const ListTag = ordered ? "ol" : "ul";
          return (
            <ListTag
              key={`list-${index}`}
              className={cn(
                "space-y-2 pl-6 text-muted-foreground",
                ordered ? "list-decimal" : "list-disc"
              )}
            >
              {lines.map((line, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`} className="leading-7">
                  {stripBullet(line)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (lines.length === 1 && isHeading(lines[0])) {
          return (
            <h3 key={`heading-${index}`} className="font-display text-2xl font-bold tracking-tight">
              {stripHeading(lines[0])}
            </h3>
          );
        }

        return (
          <div key={`paragraph-${index}`} className="space-y-3">
            {lines.map((line, lineIndex) =>
              isHeading(line) ? (
                <h3 key={`subheading-${index}-${lineIndex}`} className="font-display text-xl font-semibold tracking-tight">
                  {stripHeading(line)}
                </h3>
              ) : isDivider(line) ? (
                <Separator key={`inline-separator-${index}-${lineIndex}`} />
              ) : (
                <p key={`line-${index}-${lineIndex}`} className="text-muted-foreground leading-7 whitespace-pre-wrap">
                  {line}
                </p>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
