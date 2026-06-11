"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "cmdk";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, Monitor, Cpu, Sparkles, BrainCircuit } from "lucide-react";

/**
 * ModelSelector Components
 * Built on cmdk and Radix Dialog for premium accessibility and feel.
 */

const ModelSelectorContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function ModelSelector({ 
  children, 
  open: openProp, 
  onOpenChange 
}: { 
  children: React.ReactNode; 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void 
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  return (
    <ModelSelectorContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </ModelSelectorContext.Provider>
  );
}

export function ModelSelectorTrigger({ children, asChild, className }: { children: React.ReactNode; asChild?: boolean; className?: string }) {
  return <DialogTrigger asChild={asChild} className={className}>{children}</DialogTrigger>;
}

export function ModelSelectorContent({ children, className, title = "Select Model" }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <DialogContent className={cn("p-0 overflow-hidden border-none bg-transparent shadow-2xl sm:max-w-[450px]", className)}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <Command className="rounded-xl border border-primary/10 bg-card overflow-hidden">
        {children}
      </Command>
    </DialogContent>
  );
}

export function ModelSelectorInput({ placeholder }: { placeholder?: string }) {
  return (
    <div className="flex items-center border-b border-primary/5 px-4 h-12 gap-3" cmdk-input-wrapper="">
      <Search className="size-4 text-muted-foreground opacity-50" />
      <CommandInput 
        placeholder={placeholder} 
        className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm placeholder:text-muted-foreground/40 font-medium"
      />
    </div>
  );
}

export function ModelSelectorList({ children }: { children: React.ReactNode }) {
  return <CommandList className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">{children}</CommandList>;
}

export function ModelSelectorEmpty({ children }: { children: React.ReactNode }) {
  return <CommandEmpty className="py-12 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40">{children}</CommandEmpty>;
}

export function ModelSelectorGroup({ children, heading }: { children: React.ReactNode; heading?: string }) {
  return (
    <CommandGroup 
      heading={<span className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">{heading}</span>}
      className="space-y-1"
    >
      {children}
    </CommandGroup>
  );
}

export function ModelSelectorItem({ children, onSelect, value, className }: { children: React.ReactNode; onSelect?: () => void; value: string; className?: string }) {
  return (
    <CommandItem 
      onSelect={onSelect} 
      value={value}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
        "data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white",
        className
      )}
    >
      {children}
    </CommandItem>
  );
}

export function ModelSelectorLogo({ provider, className }: { provider: string; className?: string }) {
  const getIcon = () => {
    switch (provider.toLowerCase()) {
      case 'google': return <BrainCircuit className="size-3.5" />;
      case 'nvidia': return <Cpu className="size-3.5" />;
      case 'openai': return <Monitor className="size-3.5" />;
      case 'nex-agi': return <Sparkles className="size-3.5" />;
      case 'poolside': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12V21" />
          <path d="M12 12c0-3.5 1.5-5 5-5" />
          <path d="M12 12c0-3.5-1.5-5-5-5" />
          <path d="M12 12c0-3.5 0-5 0-5" />
          <path d="M7 7c2-1 4.5-1 10 0" />
        </svg>
      );
      default: return <Monitor className="size-3.5" />;
    }
  };

  return (
    <div className={cn("size-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white", className)}>
      {getIcon()}
    </div>
  );
}

export function ModelSelectorLogoGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex -space-x-1.5 ml-2 opacity-40 group-data-[selected=true]:opacity-100">{children}</div>;
}

export function ModelSelectorName({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold uppercase tracking-wider truncate flex-1">{children}</span>;
}
