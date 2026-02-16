import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Service, getServiceColumns } from './components/ServiceColumns';
import { ServiceToolbar } from './components/ServiceToolbar';
import { ServiceDetailSheet } from './components/ServiceDetailSheet';
import { ServiceBulkActions } from './components/ServiceBulkActions';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { ServiceStats } from './components/ServiceStats';

interface Props {
    services: { data: Service[] };
    categories: { id: number; name: string }[];
    filters?: Record<string, string>;
}

export default function Index({ services, categories, filters = {} }: Props) {
    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState('');

    // UI state
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingBulkDeleteIds, setPendingBulkDeleteIds] = useState<number[]>([]);

    const data = useMemo(() => services?.data || [], [services]);

    // Handlers
    const handleDelete = useCallback((id: number) => {
        setPendingDeleteId(id);
        setPendingBulkDeleteIds([]);
        setDeleteDialogOpen(true);
    }, []);

    const handleBulkDelete = useCallback((ids: number[]) => {
        setPendingDeleteId(null);
        setPendingBulkDeleteIds(ids);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (pendingDeleteId) {
            router.delete(`/services/${pendingDeleteId}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPendingDeleteId(null);
                },
            });
        } else if (pendingBulkDeleteIds.length > 0) {
            router.post('/services/bulk-delete', { ids: pendingBulkDeleteIds }, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPendingBulkDeleteIds([]);
                    setRowSelection({});
                },
            });
        }
    }, [pendingDeleteId, pendingBulkDeleteIds]);

    const handleToggleStatus = useCallback((id: number, active: boolean) => {
        router.post(`/services/${id}/toggle-status`, { is_active: active }, {
            preserveScroll: true,
        });
    }, []);

    const handleBulkToggleStatus = useCallback((ids: number[], active: boolean) => {
        router.post('/services/bulk-toggle-status', { ids, is_active: active }, {
            preserveScroll: true,
            onSuccess: () => setRowSelection({}),
        });
    }, []);

    const handleRowClick = useCallback((service: Service) => {
        setSelectedService(service);
        setSheetOpen(true);
    }, []);

    const handleExport = useCallback(() => {
        // Export filtered/sorted data to CSV
        const headers = ["Name", "Category", "Type", "Price", "Status", "Duration"];
        const rows = table.getFilteredRowModel().rows.map((row) => {
            const s = row.original;
            return [
                s.name,
                s.category?.name || "",
                s.type,
                String(s.price),
                s.is_active ? "Active" : "Inactive",
                s.duration,
            ];
        });

        const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `services_export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, []);

    // Column definitions
    const columns = useMemo(
        () => getServiceColumns(handleDelete, handleToggleStatus, handleRowClick),
        [handleDelete, handleToggleStatus, handleRowClick]
    );

    // TanStack Table instance
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: (row, columnId, value) => {
            const search = value.toLowerCase();
            const s = row.original;
            return (
                s.name.toLowerCase().includes(search) ||
                s.description?.toLowerCase().includes(search) ||
                s.category?.name?.toLowerCase().includes(search) ||
                s.type?.toLowerCase().includes(search)
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

    const totalServices = data.length;
    const activeServices = data.filter((s) => s.is_active).length;

    return (
        <DashboardLayout>
            <Head title="Services" />

            <div className="space-y-6">
                <ServiceStats
                    total={totalServices}
                    active={activeServices}
                    inactive={totalServices - activeServices}
                />

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                    </div>
                    <Button asChild>
                        <Link href="/services/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Service
                        </Link>
                    </Button>
                </div>

                {/* Main Table Card */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Toolbar */}
                        <ServiceToolbar
                            table={table}
                            globalFilter={globalFilter}
                            onGlobalFilterChange={setGlobalFilter}
                            categories={categories}
                            onExport={handleExport}
                        />

                        {/* Data Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                                                data-state={row.getIsSelected() && "selected"}
                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => handleRowClick(row.original)}
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
                                            <TableCell colSpan={columns.length} className="h-32 text-center">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Package className="h-8 w-8" />
                                                    <p>No services found.</p>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href="/services/create">Add your first service</Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <DataTablePagination table={table} />
                    </CardContent>
                </Card>
            </div>

            {/* Detail Side Panel */}
            <ServiceDetailSheet
                service={selectedService}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {/* Bulk Actions Bar */}
            <ServiceBulkActions
                table={table}
                onBulkDelete={handleBulkDelete}
                onBulkToggleStatus={handleBulkToggleStatus}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            {pendingBulkDeleteIds.length > 0
                                ? `Are you sure you want to delete ${pendingBulkDeleteIds.length} service(s)? This action cannot be undone.`
                                : "Are you sure you want to delete this service? This action cannot be undone."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
