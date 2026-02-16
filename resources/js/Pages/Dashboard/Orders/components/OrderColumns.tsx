import { ColumnDef } from '@tanstack/react-table';
import { Order } from '../types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getStatusActions, getActionVariantClasses } from './orderStatusActions';

const paymentMethodLabels: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    mada: 'Mada',
    apple_pay: 'Apple Pay',
    cash: 'Cash',
};

interface OrderColumnsOptions {
    onStatusChange: (orderId: number, newStatus: string) => void;
    onDelete: (order: Order) => void;
    onSelectOrder: (order: Order) => void;
}

export function getOrderColumns({ onStatusChange, onDelete, onSelectOrder }: OrderColumnsOptions): ColumnDef<Order>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'id',
            header: ({ column }) => (
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Order <DuotoneIcon src="/icons/sort-vertical.528638.svg" className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs font-medium">#{row.getValue('id')}</span>,
        },
        {
            id: 'service',
            accessorFn: (row) => row.service?.name || 'Unknown',
            header: ({ column }) => (
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Service <DuotoneIcon src="/icons/sort-vertical.528638.svg" className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate font-medium">{row.original.service?.name || 'Unknown'}</div>
            ),
        },
        {
            id: 'customer',
            accessorFn: (row) => row.customer?.full_name || row.customer?.name || 'Guest',
            header: ({ column }) => (
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Customer <DuotoneIcon src="/icons/sort-vertical.528638.svg" className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => {
                const customer = row.original.customer;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{customer?.full_name || customer?.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {customer?.id}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                const name = (row.original.customer?.full_name || row.original.customer?.name || '').toLowerCase();
                return name.includes(value.toLowerCase());
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.getValue('status')} type="order" />,
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true;
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: 'payment_method',
            header: 'Payment',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {paymentMethodLabels[row.getValue('payment_method') as string] || row.getValue('payment_method')}
                </span>
            ),
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true;
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: 'price',
            header: ({ column }) => (
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Price <DuotoneIcon src="/icons/sort-vertical.528638.svg" className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('price'));
                return <div className="font-medium tabular-nums">{formatCurrency(amount)}</div>;
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Created <DuotoneIcon src="/icons/sort-vertical.528638.svg" className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground">{formatDateTime(row.getValue('created_at'))}</div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const order = row.original;
                const actions = getStatusActions(order.status);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">Open menu</span>
                                <DuotoneIcon src="/icons/menu-dots.527810.svg" className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`#${order.id}`)}>
                                <DuotoneIcon src="/icons/copy.527658.svg" className="mr-2 h-4 w-4 opacity-70" /> Copy Order ID
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onSelectOrder(order)}>
                                <DuotoneIcon src="/icons/eye.527702.svg" className="mr-2 h-4 w-4 opacity-70" /> View Details
                            </DropdownMenuItem>

                            {actions.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    {actions.map((action) => (
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
                                <DuotoneIcon src="/icons/trash-bin-trash.527928.svg" className="mr-2 h-4 w-4 opacity-70" /> Delete Order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
