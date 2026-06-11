"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

export type TooltipRoundness = "none" | "sm" | "md" | "lg" | "full"
export type TooltipVariant = "default" | "glass"

export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
    nameKey?: string
    roundness?: TooltipRoundness
    variant?: TooltipVariant
  }
>(({ active, payload, className, nameKey }, ref) => {
  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-primary/10 bg-card/90 px-3 py-2 text-[10px] font-bold uppercase tracking-widest shadow-2xl backdrop-blur-md",
        className
      )}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color || item.payload.fill }}
          />
          <span className="text-muted-foreground">{item.name || item.dataKey}:</span>
          <span className="text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  )
})
