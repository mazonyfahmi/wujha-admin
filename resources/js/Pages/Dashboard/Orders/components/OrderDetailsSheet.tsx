
import { Order } from "../types"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { StatusBadge, orderStatusConfig } from "@/components/shared/StatusBadge"
import { OrderTimeline } from "./OrderTimeline"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderDetailsSheetProps {
    order: Order | null
    isOpen: boolean
    onClose: () => void
    onStatusChange: (orderId: number, newStatus: string) => void
    paymentMethods: Record<string, string>
}

export function OrderDetailsSheet({
    order,
    isOpen,
    onClose,
    onStatusChange,
    paymentMethods,
}: OrderDetailsSheetProps) {
    if (!order) return null

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Order #{order.id}</SheetTitle>
                    <SheetDescription>
                        Created on {formatDateTime(order.created_at)}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-100px)] pr-4">
                    <div className="space-y-6 py-6">
                        {/* Order Lifecycle Timeline */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Order Progress</Label>
                            <OrderTimeline currentStatus={order.status} />
                        </div>

                        <Separator />

                        {/* Status Section */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={order.status} type="order" />
                                <Select
                                    value={order.status}
                                    onValueChange={(value) => onStatusChange(order.id, value)}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(orderStatusConfig).map(([key, cfg]) => (
                                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Service Details */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Service Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Service Name</p>
                                    <p className="font-medium leading-none">{order.service?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Price</p>
                                    <p className="font-medium leading-none">{formatCurrency(order.price)}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Customer Details */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Name</p>
                                    <p className="font-medium leading-none">{order.customer?.full_name || order.customer?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Customer ID</p>
                                    <p className="font-mono leading-none">#{order.customer?.id}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Details */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Payment Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Method</p>
                                    <p className="font-medium leading-none">
                                        {paymentMethods[order.payment_method] || order.payment_method}
                                    </p>
                                </div>
                                {order.payment_proof_url && (
                                    <div className="col-span-2 space-y-2">
                                        <p className="text-muted-foreground">Payment Proof</p>
                                        <div className="border rounded-lg overflow-hidden bg-muted/20">
                                            <img
                                                src={order.payment_proof_url}
                                                alt="Payment proof"
                                                className="w-full h-auto object-contain max-h-[300px]"
                                            />
                                        </div>
                                        <a
                                            href={order.payment_proof_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-primary hover:underline block"
                                        >
                                            View original image
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.notes && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-medium">Notes</h4>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {order.notes}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
