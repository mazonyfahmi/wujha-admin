
import { DuotoneIcon } from "@/components/DuotoneIcon"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OrderStatsProps {
    stats: {
        total: number
        active: number
        completed: number
        canceled: number
    }
}

export function OrderStats({ stats }: OrderStatsProps) {
    const items = [
        {
            title: "Total Orders",
            value: stats.total,
            icon: (props: any) => <DuotoneIcon src="/icons/bag-4.528016.svg" {...props} />,
            description: "All time orders",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Active Orders",
            value: stats.active,
            icon: (props: any) => <DuotoneIcon src="/icons/clock-circle.528155.svg" {...props} />,
            description: "Pending & In Progress",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/20",
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: (props: any) => <DuotoneIcon src="/icons/check-circle.527633.svg" {...props} />,
            description: "Successfully issued",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-900/20",
        },
        {
            title: "Canceled",
            value: stats.canceled,
            icon: (props: any) => <DuotoneIcon src="/icons/close-circle.527651.svg" {...props} />,
            description: "Rejected or canceled",
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-100 dark:bg-red-900/20",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title} className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {item.title}
                            </p>
                            <span className="text-2xl font-bold">{item.value}</span>
                            <p className="text-xs text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                        <div className={cn("p-3 rounded-full", item.bg)}>
                            <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
