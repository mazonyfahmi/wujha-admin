
import { Order } from "../types"
import { orderStatusConfig } from "@/components/shared/StatusBadge"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DuotoneIcon } from "@/components/DuotoneIcon"
import { formatCurrency } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getStatusActions, getActionVariantClasses } from "./orderStatusActions"

interface OrderKanbanViewProps {
    orders: Order[]
    statusFlow: Record<string, string>
    statusColors: Record<string, string>
    onStatusChange: (orderId: number, newStatus: string) => void
    onDelete: (order: Order) => void
    onSelectOrder: (order: Order) => void
}

export function OrderKanbanView({
    orders,
    statusFlow,
    statusColors,
    onStatusChange,
    onDelete,
    onSelectOrder,
}: OrderKanbanViewProps) {
    const orderStatuses = Object.keys(orderStatusConfig)
    const groupedOrders = orderStatuses.reduce((acc, status) => {
        acc[status] = orders.filter((order) => order.status === status)
        return acc
    }, {} as Record<string, Order[]>)

    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${orderStatuses.length * 280}px` }}>
                {orderStatuses.map((status) => {
                    const items = groupedOrders[status] || []

                    return (
                        <div key={status} className={cn("flex-1 min-w-[280px] rounded-xl border p-3 flex flex-col h-[calc(100vh-220px)]", statusColors[status])}>
                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={status} type="order" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground bg-background/80 rounded-full px-2 py-0.5">
                                    {items.length}
                                </span>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-3 pr-2 pb-2">
                                    {items.map((order) => (
                                        <Card key={order.id} className="shadow-sm cursor-pointer hover:shadow-md transition-all group bg-card/60 hover:bg-card">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-sm leading-tight text-foreground">
                                                            {order.service?.name || "Unknown Service"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            #{order.id} • {order.customer?.full_name || order.customer?.name || "Unknown Customer"}
                                                        </p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <DuotoneIcon src="/icons/menu-dots.527810.svg" className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52">
                                                            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

                                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`#${order.id}`)}>
                                                                <DuotoneIcon src="/icons/copy.527658.svg" className="mr-2 h-4 w-4 opacity-70" /> Copy Order ID
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => onSelectOrder(order)}>
                                                                <DuotoneIcon src="/icons/eye.527702.svg" className="mr-2 h-4 w-4 opacity-70" /> View Details
                                                            </DropdownMenuItem>

                                                            {getStatusActions(order.status).length > 0 && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    {getStatusActions(order.status).map((action) => (
                                                                        <DropdownMenuItem
                                                                            key={action.targetStatus}
                                                                            onClick={() => onStatusChange(order.id, action.targetStatus)}
                                                                            className={getActionVariantClasses(action.variant)}
                                                                        >
                                                                            <DuotoneIcon src={action.icon} className="mr-2 h-4 w-4 opacity-70" /> {action.label}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </>
                                                            )}

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(order)}>
                                                                <DuotoneIcon src="/icons/trash-bin-trash.527928.svg" className="mr-2 h-4 w-4 opacity-70" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t mt-2">
                                                    <span className="text-sm font-bold text-primary">
                                                        {formatCurrency(order.price)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg border-muted-foreground/10 bg-muted/5">
                                            <p className="text-xs text-muted-foreground">No orders</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
