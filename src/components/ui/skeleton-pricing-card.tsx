"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * SkeletonPricingCard
 * 
 * A premium pricing card skeleton featuring:
 * - Plan header (name & price)
 * - Staggered feature lines with icons
 * - CTA button placeholder
 */
export function SkeletonPricingCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex w-full max-w-xs flex-col gap-8 rounded-[2.5rem] border border-primary/5 bg-card p-8 shadow-sm",
      className
    )}>
      {/* Header Area */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24 rounded-full opacity-60" />
        <div className="flex items-end gap-2">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="mb-2 h-4 w-16 opacity-40" />
        </div>
      </div>

      {/* Features List */}
      <div className="flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="size-5 shrink-0 rounded-full opacity-30" />
            <Skeleton 
              className="h-3.5 rounded-full" 
              style={{ width: `${Math.floor(Math.random() * (90 - 60 + 1) + 60)}%` }} 
            />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Skeleton className="h-14 w-full rounded-2xl opacity-80" />
    </div>
  )
}
