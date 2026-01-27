import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('animate-shimmer rounded-md', className)} />
);

export const TicketListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="p-4 rounded-lg bg-card border border-border animate-fade-in"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-muted" />
            <Skeleton className="h-6 w-16 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const TicketDetailSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-3">
      <Skeleton className="h-8 w-2/3 bg-muted" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full bg-muted" />
        <Skeleton className="h-6 w-20 rounded-full bg-muted" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-3/4 bg-muted" />
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg bg-card border border-border space-y-3">
          <Skeleton className="h-5 w-1/2 bg-muted" />
          <Skeleton className="h-20 w-full bg-muted" />
        </div>
      ))}
    </div>
  </div>
);
