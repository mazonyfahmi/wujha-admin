import { Table } from "@tanstack/react-table";
import { Trash2, ToggleLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Service } from "./ServiceColumns";

interface ServiceBulkActionsProps {
    table: Table<Service>;
    onBulkDelete: (ids: number[]) => void;
    onBulkToggleStatus: (ids: number[], active: boolean) => void;
}

export function ServiceBulkActions({ table, onBulkDelete, onBulkToggleStatus }: ServiceBulkActionsProps) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCount = selectedRows.length;

    if (selectedCount === 0) return null;

    const selectedIds = selectedRows.map((row) => row.original.id);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 shadow-lg">
                <span className="text-sm font-medium text-muted-foreground mr-2">
                    {selectedCount} selected
                </span>
                <div className="h-4 w-px bg-border" />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkToggleStatus(selectedIds, true)}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Activate
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkToggleStatus(selectedIds, false)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Deactivate
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onBulkDelete(selectedIds)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
                <div className="h-4 w-px bg-border" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.toggleAllRowsSelected(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
