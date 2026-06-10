import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * SkeletonCard
 * 
 * A media-rich skeleton card pattern featuring a banner area,
 * header text lines, body content lines, and footer actions.
 */
export function SkeletonCard() {
  return (
    <Card className="w-full max-w-sm gap-0 overflow-hidden py-0 border-primary/5 shadow-sm">
      <Skeleton className="h-32 w-full rounded-none opacity-40" />
      <CardHeader className="gap-2 pt-4 px-6">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2 opacity-60" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-6">
        <Skeleton className="h-3 w-full opacity-50" />
        <Skeleton className="h-3 w-full opacity-50" />
        <Skeleton className="h-3 w-4/5 opacity-50" />
      </CardContent>
      <CardFooter className="justify-between pt-4 pb-4 px-6">
        <Skeleton className="h-8 w-24 rounded-xl opacity-70" />
        <Skeleton className="size-8 rounded-xl opacity-70" />
      </CardFooter>
    </Card>
  )
}
