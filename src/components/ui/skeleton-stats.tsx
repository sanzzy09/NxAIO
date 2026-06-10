"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * SkeletonStats
 * 
 * A premium stat card skeleton pattern featuring:
 * - Icon and label placeholder
 * - Large numeric value placeholder
 * - Small trend/description placeholder
 * 
 * Specifically adapted for the NxAIO Bone White theme.
 */
export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {/* 2 Single Stat Cards */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div 
          key={i} 
          className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl opacity-20" />
            <Skeleton className="h-3 w-24 rounded-full opacity-30" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl opacity-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16 rounded-full opacity-20" />
            <Skeleton className="h-3 w-24 rounded-full opacity-10" />
          </div>
        </div>
      ))}
      
      {/* 1 Double-Width Stat Card */}
      <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-4 sm:col-span-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl opacity-20" />
          <Skeleton className="h-3 w-32 rounded-full opacity-30" />
        </div>
        <div className="flex items-baseline gap-4">
          <Skeleton className="h-12 w-40 rounded-xl opacity-40" />
          <Skeleton className="h-4 w-28 rounded-full opacity-10" />
        </div>
      </div>
    </div>
  )
}
