"use client";

import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/**
 * AI Context Components
 * Track and visualize token usage, context limits, and cost estimation.
 */

interface LanguageModelUsage {
  cachedInputTokens: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

interface ContextState {
  maxTokens: number;
  usedTokens: number;
  usage: LanguageModelUsage;
  modelId?: string;
}

const ContextContext = React.createContext<ContextState | null>(null);

function useContextData() {
  const context = React.useContext(ContextContext);
  if (!context) {
    throw new Error("AI Context components must be used within a <Context />");
  }
  return context;
}

export function Context({
  children,
  maxTokens = 128000,
  usedTokens = 0,
  usage = {
    cachedInputTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
  },
  modelId,
  className,
  ...props
}: {
  children: React.ReactNode;
  maxTokens?: number;
  usedTokens?: number;
  usage?: Partial<LanguageModelUsage>;
  modelId?: string;
} & React.ComponentPropsWithoutRef<typeof HoverCard>) {
  const state = React.useMemo(
    () => ({
      maxTokens,
      usedTokens,
      usage: {
        cachedInputTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        reasoningTokens: 0,
        totalTokens: 0,
        ...usage,
      },
      modelId,
    }),
    [maxTokens, usedTokens, usage, modelId]
  );

  return (
    <ContextContext.Provider value={state}>
      <HoverCard openDelay={0} closeDelay={100} {...props}>
        {children}
      </HoverCard>
    </ContextContext.Provider>
  );
}

export function ContextTrigger({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { usedTokens, maxTokens } = useContextData();
  const percentage = ((usedTokens / maxTokens) * 100).toFixed(1);

  return (
    <HoverCardTrigger asChild>
      <button
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/5 hover:bg-secondary transition-colors text-[10px] font-bold uppercase tracking-wider",
          className
        )}
        {...props}
      >
        {children || (
          <>
            <span>{percentage}%</span>
            <div className="relative size-3">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  strokeDasharray={`${(usedTokens / maxTokens) * 251.2} 251.2`}
                  className="text-indigo-600 transition-all duration-500"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </>
        )}
      </button>
    </HoverCardTrigger>
  );
}

export function ContextContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof HoverCardContent>) {
  return (
    <HoverCardContent
      className={cn(
        "w-72 p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-primary/10 rounded-[1.5rem] shadow-2xl",
        className
      )}
      {...props}
    >
      <div className="flex flex-col">{children}</div>
    </HoverCardContent>
  );
}

export function ContextContentHeader({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { usedTokens, maxTokens } = useContextData();
  const percentage = ((usedTokens / maxTokens) * 100).toFixed(1);

  return (
    <div className={cn("p-4 space-y-3 border-b border-primary/5", className)} {...props}>
      {children || (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold font-headline">{percentage}%</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {formatTokens(usedTokens)} / {formatTokens(maxTokens)}
            </span>
          </div>
          <Progress value={parseFloat(percentage)} className="h-1.5 bg-secondary/50" />
        </>
      )}
    </div>
  );
}

export function ContextContentBody({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("p-4 space-y-3", className)} {...props}>
      {children}
    </div>
  );
}

const formatTokens = (n: number) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};

// Simulated cost rates (per 1K tokens)
const COST_RATES = {
  input: 0.0005,
  output: 0.0015,
};

function UsageRow({ label, value, cost }: { label: string; value: number; cost?: number }) {
  if (value === 0 && !cost) return null;
  return (
    <div className="flex items-center justify-between text-xs font-medium">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold">{formatTokens(value)}</span>
        {cost !== undefined && (
          <>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-muted-foreground">${cost.toFixed(4)}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function ContextInputUsage() {
  const { usage } = useContextData();
  return <UsageRow label="Input" value={usage.inputTokens} cost={usage.inputTokens * (COST_RATES.input / 1000)} />;
}

export function ContextOutputUsage() {
  const { usage } = useContextData();
  return <UsageRow label="Output" value={usage.outputTokens} cost={usage.outputTokens * (COST_RATES.output / 1000)} />;
}

export function ContextReasoningUsage() {
  const { usage } = useContextData();
  return <UsageRow label="Reasoning" value={usage.reasoningTokens} />;
}

export function ContextCacheUsage() {
  const { usage } = useContextData();
  return <UsageRow label="Cached" value={usage.cachedInputTokens} />;
}

export function ContextContentFooter({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { usage } = useContextData();
  const totalCost = (usage.inputTokens * COST_RATES.input + usage.outputTokens * COST_RATES.output) / 1000;

  return (
    <div className={cn("p-4 bg-secondary/30 flex items-center justify-between", className)} {...props}>
      {children || (
        <>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total cost</span>
          <span className="text-sm font-bold font-headline">${totalCost.toFixed(4)}</span>
        </>
      )}
    </div>
  );
}
