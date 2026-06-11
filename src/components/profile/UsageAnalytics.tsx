"use client"

import React, { useMemo } from "react"
import { EvilRadialChart } from "@/components/evilcharts/ui/evil-radial-chart"
import { type ChartConfig } from "@/components/evilcharts/ui/chart"
import { BarChart3, Mail, Eraser, Music, Info, Zap } from "lucide-react"
import { getWIBDate } from "@/lib/utils"

const ROLE_LIMITS = {
  tempmail: { free: 3, pro: 25, sultan: 50 },
  remover: { free: 3, pro: 10, sultan: 20 },
  music: { free: 5, pro: 15, sultan: 30 }
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
    return {
      data: [
        { name: "Consumed", value: count },
        { name: "Bandwidth", value: remaining }
      ],
      current: count,
      limit: limit
    }
  }, [profile, role])

  // 2. BG Remover Stats (Daily WIB reset)
  const removerStats = useMemo(() => {
    const todayWIB = getWIBDate();
    const usage = profile?.removerUsage || { count: 0, lastReset: todayWIB }
    const limit = ROLE_LIMITS.remover[role]
    const count = (usage.lastReset === todayWIB) ? (usage.count || 0) : 0
    const remaining = Math.max(0, limit - count)
    return {
      data: [
        { name: "Consumed", value: count },
        { name: "Bandwidth", value: remaining }
      ],
      current: count,
      limit: limit
    }
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
    return {
      data: [
        { name: "Consumed", value: count },
        { name: "Bandwidth", value: remaining }
      ],
      current: count,
      limit: limit
    }
  }, [profile, role])

  const chartConfig: ChartConfig = {
    Consumed: { label: "Used", color: "hsl(var(--primary))" },
    Bandwidth: { label: "Available", color: "hsl(var(--muted))" }
  }

  const renderQuotaCard = (title: string, icon: any, stats: any, desc: string, color: string) => (
    <div className="flex flex-col p-8 rounded-[2.5rem] bg-secondary/20 border border-primary/5 hover:border-primary/10 transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-background border border-primary/5 ${color}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold font-headline">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">{desc}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold font-headline">{stats.limit - stats.current}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Left</p>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] relative">
        <EvilRadialChart
          data={stats.data}
          dataKey="value"
          nameKey="name"
          chartConfig={chartConfig}
          variant="semi"
          innerRadius="65%"
          outerRadius="100%"
          barSize={16}
          cornerRadius={10}
          glowingBars={["Consumed"]}
          hideTooltip
        />
      </div>

      <div className="mt-4 pt-6 border-t border-primary/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
         <span className="text-muted-foreground opacity-40">Consumed: {stats.current} / {stats.limit}</span>
         <span className={stats.current >= stats.limit ? "text-destructive" : "text-primary"}>
           {((stats.current / stats.limit) * 100).toFixed(0)}% Utilized
         </span>
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
            <h3 className="text-2xl font-bold font-headline tracking-tight">Utility Quotas & Analytics</h3>
            <p className="text-sm text-muted-foreground">Daily limits reset at 00:00 WIB (Asia/Jakarta).</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderQuotaCard("Temp-Mail", <Mail className="size-5" />, mailStats, "Daily Identity Rotation", "text-indigo-600")}
        {renderQuotaCard("BG Remover", <Eraser className="size-5" />, removerStats, "Daily AI GPU Units", "text-pink-600")}
        {renderQuotaCard("AI Music", <Music className="size-5" />, musicStats, "Weekly Audio Sessions", "text-blue-600")}
      </div>

      <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
        <Info className="size-5 text-primary/40 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Quota Intelligence</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your limits refresh automatically based on your current tier. {role === 'sultan' ? 'You are enjoying elite-tier bandwidth.' : 'Upgrade your identity to sultan for 10x higher quotas and priority processing.'}
          </p>
        </div>
      </div>
    </div>
  )
}
