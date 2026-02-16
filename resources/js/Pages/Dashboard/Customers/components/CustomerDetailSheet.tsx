import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { formatDate, cn } from '@/lib/utils';
import {
    Mail, Phone, Calendar, ShoppingBag, Shield, ShieldOff,
    CheckCircle, Edit, ExternalLink,
} from 'lucide-react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    gender: 'male' | 'female' | 'other' | null;
    status: boolean;
    is_suspended: boolean;
    is_verified: boolean;
    orders_count: number;
    created_at: string;
    avatar: string | null;
}

interface CustomerDetailSheetProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onToggleSuspension: (id: number) => void;
}

export function CustomerDetailSheet({ customer, isOpen, onClose, onToggleSuspension }: CustomerDetailSheetProps) {
    if (!customer) return null;

    const genderLabels: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[480px]">
                <SheetHeader>
                    <SheetTitle>Customer Profile</SheetTitle>
                    <SheetDescription>View customer details and activity</SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-100px)] pr-4">
                    <div className="space-y-6 py-6">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {customer.avatar && <AvatarImage src={customer.avatar} />}
                                <AvatarFallback className={cn(
                                    'text-lg font-semibold',
                                    customer.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{customer.full_name}</h3>
                                    {customer.is_verified && (
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={customer.status ? 'success' : 'destructive'}>
                                        {customer.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {customer.is_suspended && (
                                        <Badge variant="warning">Suspended</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{customer.email}</p>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{customer.phone || '—'}</p>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Gender</p>
                                    <p className="font-medium">{customer.gender ? genderLabels[customer.gender] : '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Customer ID</p>
                                    <p className="font-mono font-medium">#{customer.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Orders</p>
                                    <div className="flex items-center gap-1.5">
                                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="font-medium">{customer.orders_count}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Joined</p>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="font-medium">{formatDate(customer.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" asChild className="justify-start">
                                    <Link href={`/customers/${customer.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Customer
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="justify-start">
                                    <Link href={`/customers/${customer.id}`}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Full Profile
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onToggleSuspension(customer.id)}
                                    className="justify-start"
                                >
                                    {customer.is_suspended ? (
                                        <><Shield className="mr-2 h-4 w-4" /> Unsuspend</>
                                    ) : (
                                        <><ShieldOff className="mr-2 h-4 w-4" /> Suspend</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
