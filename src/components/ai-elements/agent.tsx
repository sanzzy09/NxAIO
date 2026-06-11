"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bot, Terminal, Code2 } from "lucide-react";

export function Agent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[2.5rem] border border-primary/5 bg-card/50 p-6 space-y-6 backdrop-blur-xl shadow-2xl animate-fade-in-up",
        className
      )}
      {...props}
    />
  );
}

export function AgentHeader({
  name,
  model,
  className,
  ...props
}: React.ComponentProps<"div"> & { name: string; model?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-2xl">
          <Bot className="size-5" />
        </div>
        <h3 className="text-xl font-bold font-headline tracking-tight">{name}</h3>
      </div>
      {model && (
        <Badge variant="secondary" className="bg-background/50 border border-primary/5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {model}
        </Badge>
      )}
    </div>
  );
}

export function AgentContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-8", className)} {...props} />;
}

export function AgentInstructions({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { children: string }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">System Instructions</h4>
      <div className="p-5 rounded-[1.5rem] bg-secondary/20 border border-primary/5 text-sm text-muted-foreground leading-relaxed font-medium">
        {children}
      </div>
    </div>
  );
}

export function AgentTools({ className, ...props }: React.ComponentProps<typeof Accordion>) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Available Utilities</h4>
      <Accordion type="multiple" className={cn("space-y-2", className)} {...props} />
    </div>
  );
}

export function AgentTool({
  tool,
  value,
  className,
  ...props
}: React.ComponentProps<typeof AccordionItem> & { tool: any; value: string }) {
  return (
    <AccordionItem
      value={value}
      className={cn("border border-primary/5 bg-background/40 rounded-2xl px-4 overflow-hidden shadow-sm", className)}
      {...props}
    >
      <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold font-headline text-foreground hover:text-indigo-600 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/5 rounded-lg text-indigo-600">
            <Terminal className="size-3.5" />
          </div>
          <span className="uppercase tracking-wider text-[11px]">{value}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-4">
        <div className="space-y-2">
           <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
        </div>
        {tool.parameters && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Input Schema</p>
            <pre className="p-4 rounded-xl bg-black/80 text-cyan-400 text-[10px] font-mono overflow-x-auto border border-white/5 shadow-inner">
              {JSON.stringify(tool.parameters, null, 2)}
            </pre>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function AgentOutput({
  schema,
  className,
  ...props
}: React.ComponentProps<"div"> & { schema: string }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Response Protocol</h4>
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/5 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-5 rounded-[1.5rem] bg-indigo-600/5 border border-indigo-600/10 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="size-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">Logic Structure</span>
          </div>
          <pre className="text-[11px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {schema}
          </pre>
        </div>
      </div>
    </div>
  );
}