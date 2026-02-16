import { cn } from '@/lib/utils';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
    showHeader?: boolean;
}

export function TableSkeleton({
    rows = 8,
    columns = 5,
    className,
    showHeader = true,
}: TableSkeletonProps) {
    return (
        <div className={cn('w-full animate-pulse', className)}>
            {/* Header */}
            {showHeader && (
                <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/30 rounded-t-lg">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div
                            key={`header-${i}`}
                            className="h-4 bg-muted-foreground/10 rounded"
                            style={{ width: `${Math.floor(Math.random() * 40 + 60)}px` }}
                        />
                    ))}
                </div>
            )}

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={cn(
                                'h-4 rounded',
                                colIndex === 0
                                    ? 'bg-muted-foreground/15 w-24'
                                    : 'bg-muted-foreground/10',
                            )}
                            style={{
                                width: colIndex === 0 ? undefined : `${Math.floor(Math.random() * 60 + 40)}px`,
                                animationDelay: `${rowIndex * 50}ms`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
