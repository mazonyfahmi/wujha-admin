import { ColumnDef } from "@tanstack/react-table";
import { Link, router } from "@inertiajs/react";
import { ArrowUpDown, Star, Package, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    image_url: string | null;
    is_active: boolean;
    is_popular: boolean;
    type: string;
    category_id: number;
    category: { id: number; name: string };
    images_count?: number;
}

const typeConfig: Record<string, { label: string; emoji: string }> = {
    visa: { label: "Visa", emoji: "🛂" },
    passport: { label: "Passport", emoji: "📘" },
    document: { label: "Document", emoji: "📄" },
    travel: { label: "Travel", emoji: "✈️" },
    other: { label: "Other", emoji: "📦" },
};

export function getServiceColumns(
    onDelete: (id: number) => void,
    onToggleStatus: (id: number, active: boolean) => void,
    onRowClick: (service: Service) => void,
): ColumnDef<Service>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Service
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const service = row.original;
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        {service.image_url ? (
                            <img src={service.image_url} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate">{service.name}</span>
                                {service.is_popular && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{service.duration}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="font-normal">
                    {row.original.category?.name}
                </Badge>
            ),
            filterFn: (row, id, value) => {
                return value.includes(String(row.original.category_id));
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const config = typeConfig[row.original.type] || typeConfig.other;
                return (
                    <div className="flex items-center gap-1.5">
                        <span>{config.emoji}</span>
                        <span className="text-sm">{config.label}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.original.type);
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mr-4">
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-right font-medium tabular-nums">
                    {formatCurrency(row.original.price)}
                </div>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const service = row.original;
                return (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch
                            checked={service.is_active}
                            onCheckedChange={(checked) => onToggleStatus(service.id, checked)}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                        <span className={`text-xs font-medium ${service.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                            {service.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                if (value === "all") return true;
                return value === "active" ? row.original.is_active : !row.original.is_active;
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const service = row.original;
                return (
                    <div className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onRowClick(service)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/services/${service.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(service.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}
