import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableViewOptions } from '@/components/shared/DataTableViewOptions';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import {
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Order } from '../types';

interface OrderToolbarProps {
    table: Table<Order>;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Payment Confirmation', value: 'payment_confirmation' },
    { label: 'Review', value: 'review' },
    { label: 'Sent to Agent', value: 'sent_to_agent' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Issued', value: 'issued' },
    { label: 'Completed', value: 'completed' },
    { label: 'Canceled', value: 'canceled' },
    { label: 'Rejected', value: 'rejected' },
];

const paymentOptions = [
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Mada', value: 'mada' },
    { label: 'Apple Pay', value: 'apple_pay' },
    { label: 'Cash', value: 'cash' },
];

function FacetedFilter({ column, title, options }: { column: any; title: string; options: { label: string; value: string }[] }) {
    const selectedValues = new Set((column?.getFilterValue() as string[]) || []);
    const filterCount = selectedValues.size;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <DuotoneIcon src="/icons/filter.527709.svg" className="mr-2 h-3.5 w-3.5" />
                    {title}
                    {filterCount > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {filterCount}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" align="start">
                <div className="space-y-1">
                    {options.map((option) => {
                        const isSelected = selectedValues.has(option.value);
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    const newSet = new Set(selectedValues);
                                    if (isSelected) newSet.delete(option.value);
                                    else newSet.add(option.value);
                                    const arr = Array.from(newSet);
                                    column?.setFilterValue(arr.length ? arr : undefined);
                                }}
                                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors ${isSelected ? 'bg-accent' : ''}`}
                            >
                                <div className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                    {isSelected && <span className="text-[10px]">✓</span>}
                                </div>
                                {option.label}
                            </button>
                        );
                    })}
                    {filterCount > 0 && (
                        <>
                            <Separator className="my-1" />
                            <button
                                onClick={() => column?.setFilterValue(undefined)}
                                className="flex items-center justify-center w-full rounded-md px-2 py-1.5 text-sm hover:bg-accent text-muted-foreground transition-colors"
                            >
                                Clear filters
                            </button>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function OrderToolbar({ table, globalFilter, setGlobalFilter }: OrderToolbarProps) {
    const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0;

    const handleExportCSV = () => {
        const rows = table.getFilteredRowModel().rows;
        const headers = ['ID', 'Service', 'Customer', 'Status', 'Payment', 'Price', 'Created'];
        const csv = [
            headers.join(','),
            ...rows.map(row => {
                const o = row.original;
                return [
                    o.id,
                    `"${o.service?.name || ''}"`,
                    `"${o.customer?.full_name || o.customer?.name || ''}"`,
                    o.status,
                    o.payment_method,
                    o.price,
                    o.created_at,
                ].join(',');
            }),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
                <div className="relative">
                    <DuotoneIcon src="/icons/magnifer.528378.svg" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 h-8 w-[150px] lg:w-[250px]"
                    />
                </div>
                <FacetedFilter column={table.getColumn('status')} title="Status" options={statusOptions} />
                <FacetedFilter column={table.getColumn('payment_method')} title="Payment" options={paymentOptions} />
                {isFiltered && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3" onClick={() => { table.resetColumnFilters(); setGlobalFilter(''); }}>
                        Reset <DuotoneIcon src="/icons/close-circle.527651.svg" className="ml-2 h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8" onClick={handleExportCSV}>
                    <DuotoneIcon src="/icons/download-minimalistic.527693.svg" className="mr-2 h-3.5 w-3.5" /> Export
                </Button>
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}
