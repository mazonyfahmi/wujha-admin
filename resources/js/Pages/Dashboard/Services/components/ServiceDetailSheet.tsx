import { Service } from "./ServiceColumns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link } from "@inertiajs/react";
import { Edit, Trash2, Clock, Star, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceDetailSheetProps {
    service: Service | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number, active: boolean) => void;
}

const typeConfig: Record<string, { label: string; emoji: string }> = {
    visa: { label: "Visa", emoji: "🛂" },
    passport: { label: "Passport", emoji: "📘" },
    document: { label: "Document", emoji: "📄" },
    travel: { label: "Travel", emoji: "✈️" },
    other: { label: "Other", emoji: "📦" },
};

export function ServiceDetailSheet({ service, open, onOpenChange, onDelete, onToggleStatus }: ServiceDetailSheetProps) {
    if (!service) return null;

    const config = typeConfig[service.type] || typeConfig.other;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl">Service Details</SheetTitle>
                    <SheetDescription>View and manage service information</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        {service.image_url ? (
                            <img src={service.image_url} alt={service.name} className="object-cover w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <Package className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                        )}
                        {service.is_popular && (
                            <Badge className="absolute top-3 right-3 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                <Star className="w-3 h-3 mr-1 fill-current" /> Popular
                            </Badge>
                        )}
                    </div>

                    {/* Title & Status */}
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(service.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={service.is_active}
                                    onCheckedChange={(checked: boolean) => onToggleStatus(service.id, checked)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                                <span className={`text-sm font-medium ${service.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                    {service.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {service.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                        )}
                    </div>

                    <Separator />

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                            <Badge variant="outline">{service.category?.name}</Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                            <div className="flex items-center gap-1.5">
                                <span>{config.emoji}</span>
                                <span className="text-sm font-medium">{config.label}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
                            <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{service.duration}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                            <span className="text-sm font-mono text-muted-foreground">#{service.id}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button asChild className="flex-1">
                            <Link href={`/services/${service.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Service
                            </Link>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => onDelete(service.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
