"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const kbdKeys = {
  command: "⌘",
  shift: "⇧",
  ctrl: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌫",
  escape: "⎋",
  tab: "⇥",
  capslock: "⇪",
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
  help: "?",
  space: "␣",
} as const;

export type KbdKey = keyof typeof kbdKeys;

/**
 * Kbd Component
 * 
 * Displays keyboard shortcuts and key combinations.
 * Aligned with NxAIO Bone White / Deep Shadow Grey theme.
 */
const Kbd = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { variant?: "default" | "light" }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-mono text-[10px] font-bold tracking-widest transition-all select-none",
        variant === "default" 
          ? "bg-secondary/40 border-primary/5 text-muted-foreground/70 shadow-sm" 
          : "bg-background border-primary/10 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
Kbd.displayName = "Kbd";

const KbdAbbr = ({ 
  keyValue, 
  title, 
  children, 
  className 
}: { 
  keyValue?: KbdKey; 
  title?: string; 
  children?: React.ReactNode; 
  className?: string 
}) => {
  const content = keyValue ? kbdKeys[keyValue] : children;
  return (
    <abbr
      title={title || (keyValue ? keyValue.charAt(0).toUpperCase() + keyValue.slice(1) : undefined)}
      className={cn("no-underline opacity-50 font-mono", className)}
    >
      {content}
    </abbr>
  );
};
KbdAbbr.displayName = "Kbd.Abbr";

const KbdContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <span className={cn("text-[10px] font-bold", className)}>{children}</span>;
};
KbdContent.displayName = "Kbd.Content";

const KbdComponent = Object.assign(Kbd, {
  Abbr: KbdAbbr,
  Content: KbdContent,
});

export { KbdComponent as Kbd };
