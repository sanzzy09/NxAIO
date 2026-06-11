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
        <svg viewBox="0 0 24 24" fill="none" className="size-3.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" fill="currentColor"/>
          <path d="M12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16Z" fill="currentColor"/>
        </svg>
      );
      case 'openai': return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        </svg>
      );
      case 'nex-agi': return <Sparkles className="size-3.5 text-indigo-400" />;
      case 'poolside': return (
        <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12a14.5 14.5 0 0 0 0 10M12 12c-4 0-7 2-8 6M12 12c4 0 7 2 8 6M12 12c0-4.5 3-8 8-8M12 12c0-4.5-3-8-8-8M12 12c0-4 0-10 0-10" />
        </svg>
      );
      case 'openrouter': return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
          <rect x="4" y="4" width="16" height="16" rx="2" fillOpacity="0.2"/>
          <rect x="8" y="8" width="8" height="8" rx="1"/>
        </svg>
      );
      case 'owl': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
          <path d="M12 2C9 2 7 4 7 7C7 10 9 12 12 12C15 12 17 10 17 7C17 4 15 2 12 2Z" />
          <path d="M7 7C4 7 2 10 2 14C2 18 5 22 12 22C19 22 22 18 22 14C22 10 20 7 17 7" />
          <circle cx="9.5" cy="7" r="1" fill="currentColor"/>
          <circle cx="14.5" cy="7" r="1" fill="currentColor"/>
        </svg>
      );
      case 'sourceful': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path d="M2 17L12 22L22 17" />
          <path d="M2 12L12 17L22 12" />
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
