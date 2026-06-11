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
      case 'nvidia': return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-12c-2.48 0-4.5 2.02-4.5 4.5S8.02 17 10.5 17c.56 0 1.1-.11 1.6-.3l-1.1-1.1c-.16.03-.33.05-.5.05-1.65 0-3-1.35-3-3s1.35-3 3-3c.27 0 .53.05.77.13L12.5 8.5c-.6-.32-1.28-.5-2-.5zm3 2c-.56 0-1.1.11-1.6.3l1.1 1.1c.16-.03.33-.05.5-.05 1.65 0 3 1.35 3 3s-1.35 3-3 3c-.27 0-.53-.05-.77-.13l-1.23 1.23c.6.32 1.28.5 2 .5 2.48 0 4.5-2.02 4.5-4.5s-2.02-4.5-4.5-4.5z" />
        </svg>
      );
      case 'openai': return <Monitor className="size-3.5" />;
      case 'nex-agi': return <Sparkles className="size-3.5" />;
      case 'poolside': return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
          <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM11.25 7a.75.75 0 011.5 0v2.25h2.25a.75.75 0 010 1.5H12.75V13c0 .324.083.628.23.893l.07.122 1.2 1.8a.75.75 0 11-1.248.83l-.071-.107-1.115-1.672-1.115 1.672a.75.75 0 01-1.32-.723l.071-.107 1.2-1.8a1.5 1.5 0 00.3-1.015V10.75H8.75a.75.75 0 010-1.5h2.25V7z" />
        </svg>
      );
      case 'openrouter': return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
          <path d="M2 2h20v20H2V2zm10 15a4 4 0 100-8 4 4 0 000 8z" fillRule="evenodd" clipRule="evenodd" />
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
