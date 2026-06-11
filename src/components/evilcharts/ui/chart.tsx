"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig }
>(({ className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("relative", className)} {...props}>
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(([key, item]) => {
                const color = item.color || "var(--primary)"
                return `--color-${key}-0: ${color};`
              })
              .join("\n"),
          }}
        />
        {children}
      </div>
    </ChartContext.Provider>
  )
})

export const getColorsCount = (config: any) => 1

export const LoadingIndicator = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/5 z-10 rounded-full animate-pulse">
      <div className="w-1/2 h-1/2 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  )
}
