"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  BrainCircuit, 
  CheckCircle2, 
  Loader2, 
  Circle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ChainOfThoughtContext = React.createContext<{ open: boolean } | null>(null);

export function ChainOfThought({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & { defaultOpen?: boolean }) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  return (
    <ChainOfThoughtContext.Provider value={{ open }}>
      <CollapsiblePrimitive.Root
        open={open}
        onOpenChange={setOpen}
        className={cn("w-full space-y-2", className)}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ChainOfThoughtContext.Provider>
  );
}

export function ChainOfThoughtHeader({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>) {
  const context = React.useContext(ChainOfThoughtContext);
  
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-2 py-2 text-muted-foreground hover:text-foreground transition-colors group",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
          <BrainCircuit className="size-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Thinking Process</span>
      </div>
      <ChevronDown className={cn("size-3 transition-transform duration-300 opacity-40 group-hover:opacity-100", context?.open && "rotate-180")} />
    </CollapsiblePrimitive.Trigger>
  );
}

export function ChainOfThoughtContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn(
        "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="pt-2 pb-4 space-y-4 border-l border-primary/5 ml-4 pl-6">
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
}

export function ChainOfThoughtStep({
  icon: Icon,
  label,
  description,
  status = "complete",
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ElementType;
  label?: string;
  description?: string;
  status?: "complete" | "active" | "pending";
}) {
  return (
    <div className={cn("space-y-2 animate-fade-in-up", status === "pending" && "opacity-40", className)} {...props}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "shrink-0 p-1 rounded-md",
          status === "active" ? "text-indigo-600 animate-pulse" : 
          status === "complete" ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {Icon ? <Icon className="size-3.5" /> : 
           status === "active" ? <Loader2 className="size-3.5 animate-spin" /> :
           status === "complete" ? <CheckCircle2 className="size-3.5" /> :
           <Circle className="size-3.5" />}
        </div>
        <span className="text-xs font-bold font-headline leading-none">{label}</span>
      </div>
      {description && <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">{description}</p>}
      {children && <div className="pl-7">{children}</div>}
    </div>
  );
}

export function ChainOfThoughtSearchResults({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap gap-2 pt-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ChainOfThoughtSearchResult({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Badge>) {
  return (
    <Badge
      variant="secondary"
      className={cn("bg-background/50 border border-primary/5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5", className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

export function ChainOfThoughtImage({
  caption,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { caption?: string }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="rounded-2xl overflow-hidden border border-primary/5 bg-secondary/10">
        {children}
      </div>
      {caption && <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 text-center">{caption}</p>}
    </div>
  );
}
