"use client"

import React, { useMemo } from "react"
import { EvilRadialChart } from "@/components/evilcharts/ui/evil-radial-chart"
import { type ChartConfig } from "@/components/evilcharts/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BarChart3, Mail, Eraser, Music, Info, Zap } from "lucide-react"

const ROLE_LIMITS = {
  tempmail: { free: 3, pro: 25, sultan: 50 },
  remover: { free: 3, pro: 10, sultan: 20 },
  music: { free: 5, pro: 15, sultan: 30 }
}

export function UsageAnalytics({ profile }: { profile: any }) {
  const role = (profile?.role as "free" | "pro" | "sultan") || "free"

  // 1. Temp-Mail Stats
  const mailStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const usage = profile?.tempMailUsage || { count: 0, lastReset: today }
    const limit = ROLE_LIMITS.tempmail[role]
    const count = usage.lastReset === today ? usage.count : 0
    const remaining = Math.max(0, limit - count)
    return {
      data: [
        { name: "Complete", value: count },
        { name: "Remaining", value: remaining }
      ],
      current: count,
      limit: limit
    }
  }, [profile, role])

  // 2. BG Remover Stats
  const removerStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const usage = profile?.removerUsage || { count: 0, lastReset: today }
    const limit = ROLE_LIMITS.remover[role]
    const count = usage.lastReset === today ? usage.count : 0
    const remaining = Math.max(0, limit - count)
    return {
      data: [
        { name: "Complete", value: count },
        { name: "Remaining", value: remaining }
      ],
      current: count,
      limit: limit
    }
  }, [profile, role])

  // 3. AI Music Stats
  const musicStats = useMemo(() => {
    const usage = profile?.musicUsage || { count: 0, weekStart: new Date().toISOString() }
    const weekStart = new Date(usage.weekStart)
    const now = new Date()
    const diff = now.getTime() - weekStart.getTime()
    const isReset = diff > 7 * 24 * 60 * 60 * 1000
    const count = isReset ? 0 : usage.count
    const limit = ROLE_LIMITS.music[role]
    const remaining = Math.max(0, limit - count)
    return {
      data: [
        { name: "Complete", value: count },
        { name: "Remaining", value: remaining }
      ],
      current: count,
      limit: limit
    }
  }, [profile, role])

  const chartConfig: ChartConfig = {
    Complete: { label: "Used Credits", color: "#10b981" },
    Remaining: { label: "Bandwidth Left", color: "#334155" }
  }

  const renderQuotaCard = (title: string, icon: any, stats: any, desc: string, color: string) => (
    <div className="flex flex-col p-8 rounded-[2.5rem] bg-secondary/20 border border-primary/5 hover:border-primary/10 transition-all">
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
          innerRadius="70%"
          outerRadius="100%"
          barSize={18}
          glowingBars={["Complete"]}
          hideTooltip
        />
      </div>

      <div className="mt-4 pt-6 border-t border-primary/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
         <span className="text-muted-foreground opacity-40">Consumed: {stats.current}</span>
         <span className="text-primary">{((stats.current / stats.limit) * 100).toFixed(0)}% Utilized</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3 px-2">
         <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
           <BarChart3 className="size-5" />
         </div>
         <div>
            <h3 className="text-2xl font-bold font-headline tracking-tight">Utility Quotas & Analytics</h3>
            <p className="text-sm text-muted-foreground">Detailed bandwidth monitoring for your identity tier.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderQuotaCard("Temp-Mail", <Mail className="size-5" />, mailStats, "Daily Identity Reset", "text-indigo-600")}
        {renderQuotaCard("BG Remover", <Eraser className="size-5" />, removerStats, "Daily AI GPU Units", "text-pink-600")}
        {renderQuotaCard("AI Music", <Music className="size-5" />, musicStats, "Weekly Audio Studio", "text-blue-600")}
      </div>

      <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
        <Info className="size-5 text-indigo-600 mt-0.5 opacity-60" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/60">Quota Intelligence</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your limits are automatically refreshed based on the {role === 'free' ? 'Starter' : role} tier protocols. Sultan members enjoy 5x higher bandwidth and priority GPU queues.
          </p>
        </div>
      </div>
    </div>
  )
}
