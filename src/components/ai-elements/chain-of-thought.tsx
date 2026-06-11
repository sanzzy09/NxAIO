"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  BrainCircuit, 
  CheckCircle2, 
  Loader2, 
  Circle,
  Zap
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
        "flex w-full items-center justify-between gap-2 py-3 px-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 border border-primary/5 text-muted-foreground hover:text-foreground transition-all group",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-500/10">
          <BrainCircuit className="size-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Neural Thinking Process</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
          <Zap className="size-2.5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Logic Active</span>
        </div>
        <ChevronDown className={cn("size-3.5 transition-transform duration-500 opacity-40 group-hover:opacity-100", context?.open && "rotate-180")} />
      </div>
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
      <div className="pt-4 pb-6 space-y-5 border-l-2 border-primary/10 ml-6 pl-8">
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
    <div className={cn("space-y-2 animate-fade-in-up relative", status === "pending" && "opacity-40", className)} {...props}>
      {/* Connector Node */}
      <div className="absolute -left-[35px] top-1.5 size-3 rounded-full bg-background border-2 border-primary/20" />
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "shrink-0 p-1.5 rounded-lg border shadow-sm transition-all",
          status === "active" ? "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 animate-pulse" : 
          status === "complete" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : 
          "text-muted-foreground bg-secondary border-primary/5"
        )}>
          {Icon ? <Icon className="size-3.5" /> : 
           status === "active" ? <Loader2 className="size-3.5 animate-spin" /> :
           status === "complete" ? <CheckCircle2 className="size-3.5" /> :
           <Circle className="size-3.5" />}
        </div>
        <span className="text-xs font-bold font-headline leading-none tracking-tight">{label}</span>
      </div>
      {description && <p className="text-[11px] text-muted-foreground leading-relaxed pl-8 opacity-70 font-medium">{description}</p>}
      {children && <div className="pl-8">{children}</div>}
    </div>
  );
}

export function ChainOfThoughtSearchResults({
  children,
  className,
  ...props
}) {
  return (
    <div className={cn("flex flex-wrap gap-2 pt-2", className)} {...props}>
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
      className={cn("bg-background border border-primary/5 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm hover:border-indigo-500/20 transition-all", className)}
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
    <div className={cn("space-y-3", className)} {...props}>
      <div className="rounded-[1.5rem] overflow-hidden border border-primary/5 bg-secondary/10 shadow-lg">
        {children}
      </div>
      {caption && <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 text-center leading-relaxed px-4">{caption}</p>}
    </div>
  );
}
