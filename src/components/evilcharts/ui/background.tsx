"use client"

import * as React from "react"

export type BackgroundVariant = "dots" | "grid" | "none"

export function ChartBackground({ variant }: { variant: BackgroundVariant }) {
  if (variant === "none") return null

  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      {variant === "dots" && (
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,var(--primary)_1px,transparent_1px)] bg-[size:24px_24px]" />
      )}
      {variant === "grid" && (
        <div className="h-full w-full bg-[linear-gradient(to_right,var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] bg-[size:24px_24px]" />
      )}
    </div>
  )
}
