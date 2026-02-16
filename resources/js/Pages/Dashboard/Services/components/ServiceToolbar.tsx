import { Table } from "@tanstack/react-table";
import { Search, X, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTableViewOptions } from "@/components/shared/DataTableViewOptions";
import { Service } from "./ServiceColumns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface Category { id: number; name: string; }

interface ServiceToolbarProps {
    table: Table<Service>;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    categories: Category[];
    onExport: () => void;
}

const typeOptions = [
    { value: "visa", label: "🛂 Visa" },
    { value: "passport", label: "📘 Passport" },
    { value: "document", label: "📄 Document" },
    { value: "travel", label: "✈️ Travel" },
    { value: "other", label: "📦 Other" },
];

export function ServiceToolbar({
    table,
    globalFilter,
    onGlobalFilterChange,
    categories,
    onExport,
}: ServiceToolbarProps) {
    const isFiltered = table.getState().columnFilters.length > 0 || globalFilter !== "";

    const categoryFilter = (table.getColumn("category")?.getFilterValue() as string[]) || [];
    const typeFilter = (table.getColumn("type")?.getFilterValue() as string[]) || [];
    const statusFilter = (table.getColumn("is_active")?.getFilterValue() as string) || "all";

    const toggleCategoryFilter = (categoryId: string) => {
        const current = [...categoryFilter];
        const index = current.indexOf(categoryId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(categoryId);
        }
        table.getColumn("category")?.setFilterValue(current.length ? current : undefined);
    };

    const toggleTypeFilter = (type: string) => {
        const current = [...typeFilter];
        const index = current.indexOf(type);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(type);
        }
        table.getColumn("type")?.setFilterValue(current.length ? current : undefined);
    };

    const resetFilters = () => {
        table.resetColumnFilters();
        onGlobalFilterChange("");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={globalFilter}
                            onChange={(e) => onGlobalFilterChange(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    {/* Category Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Category
                                {categoryFilter.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {categoryFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2" align="start">
                            <div className="space-y-1">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                                        onClick={() => toggleCategoryFilter(String(cat.id))}
                                    >
                                        <Checkbox
                                            checked={categoryFilter.includes(String(cat.id))}
                                            className="pointer-events-none"
                                        />
                                        <span className="text-sm">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Type Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed hidden md:flex">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Type
                                {typeFilter.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                        {typeFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2" align="start">
                            <div className="space-y-1">
                                {typeOptions.map((type) => (
                                    <div
                                        key={type.value}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                                        onClick={() => toggleTypeFilter(type.value)}
                                    >
                                        <Checkbox
                                            checked={typeFilter.includes(type.value)}
                                            className="pointer-events-none"
                                        />
                                        <span className="text-sm">{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(v) => table.getColumn("is_active")?.setFilterValue(v === "all" ? undefined : v)}>
                        <SelectTrigger className="w-[120px] h-9 hidden lg:flex">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {isFiltered && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2 lg:px-3">
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9" onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
        </div>
    );
}
