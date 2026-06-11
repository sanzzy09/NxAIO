"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/**
 * Suggestions Container
 * Provides a scrollable horizontal area for quick-action buttons.
 */
export function Suggestions({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollArea>) {
  return (
    <ScrollArea className={cn("w-full whitespace-nowrap", className)} {...props}>
      <div className="flex w-max space-x-2 p-1">
        {children}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
}

/**
 * Individual Suggestion Button
 * Styled as a pill with NxAIO premium branding.
 */
export function Suggestion({
  suggestion,
  onClick,
  className,
  ...props
}: {
  suggestion: string;
  onClick?: (suggestion: string) => void;
} & Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-widest border-primary/5 bg-background/50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm",
        className
      )}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {suggestion}
    </Button>
  );
}
