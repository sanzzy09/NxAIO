"use client"

import React, { useMemo } from "react"
import { BarChart3, Mail, Eraser, Music, Info, BrainCircuit, Zap } from "lucide-react"
import { getWIBDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const ROLE_LIMITS = {
  tempmail: { free: 3, pro: 25, sultan: 50 },
  remover: { free: 3, pro: 10, sultan: 20 },
  music: { free: 5, pro: 15, sultan: 30 },
  ai: { free: 64000, pro: 256000, sultan: 1000000 }
}

export function UsageAnalytics({ profile }: { profile: any }) {
  const role = (profile?.role as "free" | "pro" | "sultan") || "free"

  // 1. Temp-Mail Stats (Daily WIB reset)
  const mailStats = useMemo(() => {
    const todayWIB = getWIBDate();
    const usage = profile?.tempMailUsage || { count: 0, lastReset: todayWIB }
    const limit = ROLE_LIMITS.tempmail[role]
    const count = (usage.lastReset === todayWIB) ? (usage.count || 0) : 0
    const remaining = Math.max(0, limit - count)
    const percentage = (remaining / limit) * 100
    return { current: count, limit: limit, remaining, percentage }
  }, [profile, role])

  // 2. BG Remover Stats (Daily WIB reset)
  const removerStats = useMemo(() => {
    const todayWIB = getWIBDate();
    const usage = profile?.removerUsage || { count: 0, lastReset: todayWIB }
    const limit = ROLE_LIMITS.remover[role]
    const count = (usage.lastReset === todayWIB) ? (usage.count || 0) : 0
    const remaining = Math.max(0, limit - count)
    const percentage = (remaining / limit) * 100
    return { current: count, limit: limit, remaining, percentage }
  }, [profile, role])

  // 3. AI Music Stats (Weekly rolling reset)
  const musicStats = useMemo(() => {
    const usage = profile?.musicUsage || { count: 0, weekStart: new Date().toISOString() }
    const weekStart = new Date(usage.weekStart)
    const now = new Date()
    const diff = now.getTime() - weekStart.getTime()
    const isReset = diff > 7 * 24 * 60 * 60 * 1000
    const count = isReset ? 0 : (usage.count || 0)
    const limit = ROLE_LIMITS.music[role]
    const remaining = Math.max(0, limit - count)
    const percentage = (remaining / limit) * 100
    return { current: count, limit: limit, remaining, percentage }
  }, [profile, role])

  // 4. AI Token Stats (Daily WIB reset)
  const aiStats = useMemo(() => {
    const todayWIB = getWIBDate();
    const usage = profile?.aiUsage || { tokens: 0, lastReset: todayWIB }
    const limit = ROLE_LIMITS.ai[role]
    const tokens = (usage.lastReset === todayWIB) ? (usage.tokens || 0) : 0
    const remaining = Math.max(0, limit - tokens)
    const percentage = (remaining / limit) * 100
    return { current: tokens, limit: limit, remaining, percentage }
  }, [profile, role])

  const formatTokens = (n: number) => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  };

  const renderQuotaBar = (title: string, icon: any, stats: any, color: string, resetLabel: string, isTokens = false) => (
    <div className="space-y-4 p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 group transition-all hover:bg-secondary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl bg-background border border-primary/5 transition-transform group-hover:scale-110", color)}>
            {icon}
          </div>
          <span className="text-sm font-bold font-headline uppercase tracking-tight">{title}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{resetLabel}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={stats.percentage} 
          className="h-2 bg-background/50 border border-primary/5"
          indicatorClassName={cn(
            "transition-all duration-1000",
            stats.percentage < 20 ? "bg-destructive" : stats.percentage < 50 ? "bg-orange-500" : "bg-primary"
          )}
        />
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Zap className="size-3 text-primary/40" />
            <span>Capacity: {isTokens ? formatTokens(stats.remaining) : stats.remaining} {isTokens ? 'Tokens' : 'Units'} Available</span>
          </div>
          <span className={cn(
            stats.percentage < 20 ? "text-destructive" : "text-primary/40"
          )}>
            {stats.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3 px-2">
         <div className="p-2 bg-primary/10 text-primary rounded-xl">
           <BarChart3 className="size-5" />
         </div>
         <div>
            <h3 className="text-2xl font-bold font-headline tracking-tight">Utility Quotas</h3>
            <p className="text-sm text-muted-foreground font-medium">Real-time capacity tracking for your {role} identity.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderQuotaBar("NexAgent Tokens", <BrainCircuit className="size-4" />, aiStats, "text-blue-600", "Daily Reset", true)}
        {renderQuotaBar("Temp-Mail IDs", <Mail className="size-4" />, mailStats, "text-indigo-600", "Daily Reset")}
        {renderQuotaBar("Background Removal", <Eraser className="size-4" />, removerStats, "text-pink-600", "Daily Reset")}
        {renderQuotaBar("AI Music Studio", <Music className="size-4" />, musicStats, "text-blue-600", "Weekly Reset")}
      </div>

      <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
        <Info className="size-5 text-primary/40 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Intelligent Throttling</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            Capacities start full and drain as you perform logic operations. All metrics reset automatically at 00:00 WIB. Upgrade to Sultan tier to expand your bandwidth by up to 20x.
          </p>
        </div>
      </div>
    </div>
  )
}
