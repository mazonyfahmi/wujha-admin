
import { Link } from '@inertiajs/react';
import { MoreHorizontal, Edit, Trash2, Eye, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';

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
}

interface ServiceCardProps {
    service: Service;
    onDelete: (id: number) => void;
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full group transition-all hover:shadow-md">
            <div className="relative aspect-video bg-muted">
                {service.image_url ? (
                    <img
                        src={service.image_url}
                        alt={service.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/30">
                        <span className="text-4xl font-light opacity-20">{service.name.charAt(0)}</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    {service.is_popular && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                            <Star className="w-3 h-3 mr-1 fill-current" /> Popular
                        </Badge>
                    )}
                    <Badge variant={service.is_active ? 'default' : 'destructive'} className={service.is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                        {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 text-xs font-normal text-muted-foreground">
                            {service.category.name}
                        </Badge>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1" title={service.name}>
                            {service.name}
                        </h3>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {service.description || "No description provided."}
                </p>

                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {service.type === 'visa' && <span>🛂 Visa</span>}
                        {service.type === 'passport' && <span>📘 Passport</span>}
                        {service.type === 'travel' && <span>✈️ Travel</span>}
                        {!['visa', 'passport', 'travel'].includes(service.type) && <span>📄 {service.type}</span>}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/5 mt-auto">
                <div className="font-bold text-lg text-primary">
                    {formatCurrency(service.price)}
                </div>

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Link href={`/services/${service.id}/edit`}>
                            <Edit className="w-4 h-4" />
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/services/${service.id}`}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/services/${service.id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Service
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(service.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
}
