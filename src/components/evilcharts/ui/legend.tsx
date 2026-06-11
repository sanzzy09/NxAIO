"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type ChartLegendVariant = "default" | "minimal"

export const ChartLegend = RechartsPrimitive.Legend

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> & {
    selected?: string | null
    onSelectChange?: (name: string | null) => void
    isClickable?: boolean
    nameKey?: string
    variant?: ChartLegendVariant
  }
>(({ payload, className, onSelectChange, selected }, ref) => {
  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-6 pt-4", className)}
    >
      {payload.map((entry: any, index) => (
        <button
          key={index}
          onClick={() => onSelectChange?.(selected === entry.value ? null : entry.value)}
          className={cn(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
            selected && selected !== entry.value ? "opacity-30" : "opacity-100"
          )}
        >
          <div
            className="size-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground hover:text-primary">{entry.value}</span>
        </button>
      ))}
    </div>
  )
})
