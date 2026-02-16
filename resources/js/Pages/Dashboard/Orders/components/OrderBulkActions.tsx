import { Table } from '@tanstack/react-table';
import { Order } from '../types';
import { Button } from '@/components/ui/button';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import { router } from '@inertiajs/react';

interface OrderBulkActionsProps {
    table: Table<Order>;
    onDelete: (order: Order) => void;
}

export function OrderBulkActions({ table, onDelete }: OrderBulkActionsProps) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const count = selectedRows.length;

    if (count === 0) return null;

    const handleBulkDelete = () => {
        selectedRows.forEach(row => onDelete(row.original));
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 rounded-xl border bg-card/95 backdrop-blur-sm shadow-2xl px-5 py-3">
                <span className="text-sm font-medium tabular-nums">
                    {count} order{count > 1 ? 's' : ''} selected
                </span>
                <div className="h-5 w-px bg-border" />
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8"
                >
                    <DuotoneIcon src="/icons/trash-bin-trash.527928.svg" className="mr-2 h-3.5 w-3.5" /> Delete
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => table.toggleAllRowsSelected(false)}
                    className="h-8"
                >
                    <DuotoneIcon src="/icons/close-circle.527651.svg" className="mr-2 h-3.5 w-3.5" /> Clear
                </Button>
            </div>
        </div>
    );
}
