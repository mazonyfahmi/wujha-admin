import { useState } from 'react';
import { Order } from '../types';
import { getOrderColumns } from './OrderColumns';
import { OrderToolbar } from './OrderToolbar';
import { OrderBulkActions } from './OrderBulkActions';
import {
    ColumnFiltersState, SortingState, VisibilityState, RowSelectionState,
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/shared/DataTablePagination';

interface OrderTableViewProps {
    orders: Order[];
    statusFlow: Record<string, string>;
    onStatusChange: (orderId: number, newStatus: string) => void;
    onDelete: (order: Order) => void;
    onSelectOrder: (order: Order) => void;
}

export function OrderTableView({
    orders, statusFlow, onStatusChange, onDelete, onSelectOrder,
}: OrderTableViewProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = getOrderColumns({ onStatusChange, onDelete, onSelectOrder });

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const o = row.original;
            return (
                String(o.id).includes(search) ||
                (o.service?.name || '').toLowerCase().includes(search) ||
                (o.customer?.full_name || o.customer?.name || '').toLowerCase().includes(search) ||
                o.status.toLowerCase().includes(search) ||
                (o.payment_method || '').toLowerCase().includes(search)
            );
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            <OrderToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => onSelectOrder(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <OrderBulkActions table={table} onDelete={onDelete} />
        </div>
    );
}
