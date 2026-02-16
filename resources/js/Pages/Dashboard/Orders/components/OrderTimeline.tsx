import { DuotoneIcon } from '@/components/DuotoneIcon';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
    currentStatus: string;
}

const steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'payment_confirmation', label: 'Payment' },
    { key: 'review', label: 'Review' },
    { key: 'sent_to_agent', label: 'Sent to Agent' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'issued', label: 'Issued' },
];

const terminalStatuses = ['completed', 'canceled', 'rejected'];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
    const isTerminal = terminalStatuses.includes(currentStatus);
    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    const activeIndex = isTerminal ? steps.length : currentIndex;

    return (
        <div className="py-2">
            <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" />
                {/* Progress line */}
                <div
                    className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                    style={{
                        width: activeIndex >= steps.length - 1
                            ? 'calc(100% - 32px)'
                            : `calc(${(activeIndex / (steps.length - 1)) * 100}% - ${activeIndex > 0 ? 0 : 16}px)`,
                    }}
                />
                {steps.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isCurrent = index === activeIndex;
                    return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 relative z-10">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                                    isCompleted
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : isCurrent
                                            ? 'border-primary bg-background text-primary'
                                            : 'border-muted bg-background text-muted-foreground',
                                )}
                            >
                                {isCompleted ? (
                                    <DuotoneIcon src="/icons/check-circle.527633.svg" className="h-4 w-4" />
                                ) : (
                                    <DuotoneIcon
                                        src="/icons/record.528508.svg"
                                        className={cn('h-3 w-3', isCurrent && 'text-primary')}
                                    />
                                )}
                            </div>
                            <span className={cn(
                                'text-[10px] font-medium text-center max-w-[60px] leading-tight',
                                isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground',
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {isTerminal && (
                <div className="mt-3 text-center">
                    <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                        currentStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            currentStatus === 'canceled' ? 'bg-red-500/10 text-red-600' :
                                'bg-orange-500/10 text-orange-600',
                    )}>
                        {currentStatus === 'completed' ? '✓ Completed' :
                            currentStatus === 'canceled' ? '✗ Canceled' :
                                '✗ Rejected'}
                    </span>
                </div>
            )}
        </div>
    );
}
