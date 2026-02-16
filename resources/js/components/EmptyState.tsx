import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
            {icon ? (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    {icon}
                </div>
            ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg
                        className="w-7 h-7 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        />
                    </svg>
                </div>
            )}

            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>

            {description && (
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                    {description}
                </p>
            )}

            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
