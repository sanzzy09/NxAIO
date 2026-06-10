import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function SkeletonTextStack({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}
