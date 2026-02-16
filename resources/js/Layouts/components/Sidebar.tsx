
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen,
    ChevronRight, Star, Layers, UserCog
} from 'lucide-react';
import {
    IconDashboard, IconOrders, IconChat, IconCustomers,
    IconServices, IconCategories, IconBanners, IconSales,
    IconInvoices, IconRefunds, IconUsers, IconApi, IconSettings,
    IconGroups, IconReviews
} from './SidebarIcons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import ApplicationLogo from '@/components/ApplicationLogo';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    isMobile: boolean;
}

interface NavItem {
    label: string;
    href: string;
    icon: any;
    children?: NavItem[];
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Main',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
            { label: 'Orders', href: '/orders', icon: IconOrders },
            { label: 'Chat', href: '/chat', icon: IconChat },
        ]
    },
    {
        title: 'Management',
        items: [
            {
                label: 'Customers', href: '/customers', icon: IconCustomers,
                children: [
                    { label: 'All Customers', href: '/customers', icon: IconCustomers },
                    { label: 'Groups', href: '/customer-groups', icon: IconGroups },
                    { label: 'Reviews', href: '/reviews', icon: IconReviews },
                ],
            },
            { label: 'Services', href: '/services', icon: IconServices },
            { label: 'Categories', href: '/categories', icon: IconCategories },
            { label: 'Banners', href: '/banners', icon: IconBanners },
            {
                label: 'Sales', href: '/invoices', icon: IconSales,
                children: [
                    { label: 'Invoices', href: '/invoices', icon: IconInvoices },
                    { label: 'Refunds', href: '/refunds', icon: IconRefunds },
                ],
            },
        ]
    },
    {
        title: 'System',
        items: [
            { label: 'Users', href: '/users', icon: IconUsers },
            { label: 'API Tokens', href: '/api-tokens', icon: IconApi },
            { label: 'Settings', href: '/settings', icon: IconSettings },
        ]
    }
];

export function Sidebar({ open, setOpen, isMobile }: SidebarProps) {
    const { url } = usePage();
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    // Auto-open groups based on active URL
    useEffect(() => {
        const activeGroups = navSections
            .flatMap(section => section.items)
            .filter(item => item.children?.some(child => url.startsWith(child.href)))
            .map(item => item.label);
        setOpenGroups(prev => [...new Set([...prev, ...activeGroups])]);
    }, [url]);

    const toggleGroup = (label: string) => {
        setOpenGroups(prev =>
            prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    const NavContent = () => (
        <div className="flex flex-col h-full bg-card border-r shadow-sm">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b bg-card/50 backdrop-blur-sm">
                <Link href="/dashboard" className={cn("flex items-center gap-3 font-semibold text-lg tracking-tight transition-all duration-300", !open && !isMobile && "hidden")}>
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <ApplicationLogo className="w-6 h-6 text-primary" />
                    </div>
                    <span>WUJHA</span>
                </Link>
                {!isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", !open && "mx-auto")}>
                        {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="px-3 space-y-6">
                    <TooltipProvider delayDuration={0}>
                        {navSections.map((section, idx) => (
                            <div key={idx} className="space-y-1">
                                {section.title && open && (
                                    <h4 className="px-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                                        {section.title}
                                    </h4>
                                )}
                                {section.items.map((item) => {
                                    const isGroupActive = item.children?.some(child => isActive(child.href));

                                    if (item.children) {
                                        if (!open && !isMobile) {
                                            return (
                                                <Tooltip key={item.label}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={isGroupActive ? "secondary" : "ghost"}
                                                            className={cn(
                                                                "w-full justify-center h-9",
                                                                isGroupActive && "bg-primary/10 text-primary hover:bg-primary/15"
                                                            )}
                                                            size="icon"
                                                        >
                                                            <item.icon className="h-4 w-4" />
                                                            <span className="sr-only">{item.label}</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="font-medium">
                                                        {item.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }

                                        return (
                                            <Collapsible
                                                key={item.label}
                                                open={openGroups.includes(item.label)}
                                                onOpenChange={() => toggleGroup(item.label)}
                                                className="w-full"
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-between h-9 px-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground font-normal",
                                                            isGroupActive && "text-foreground font-medium bg-muted/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className={cn("h-4 w-4", isGroupActive ? "text-primary" : "text-muted-foreground")} />
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <ChevronRight
                                                            className={cn(
                                                                "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground/50",
                                                                openGroups.includes(item.label) ? "rotate-90" : ""
                                                            )}
                                                        />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="pl-9 space-y-0.5 mt-0.5 animate-collapsible-down overflow-hidden">
                                                    {item.children.map((child) => {
                                                        const isChildActive = isActive(child.href);
                                                        return (
                                                            <Button
                                                                key={child.href}
                                                                variant="ghost"
                                                                className={cn(
                                                                    "w-full justify-start h-8 px-2 text-sm font-normal text-muted-foreground hover:text-foreground",
                                                                    isChildActive && "bg-primary/5 text-primary hover:bg-primary/10 font-medium"
                                                                )}
                                                                asChild
                                                            >
                                                                <Link href={child.href}>
                                                                    {child.icon ? (
                                                                        <child.icon className={cn("mr-3 h-5 w-5", isChildActive ? "text-primary" : "text-muted-foreground")} />
                                                                    ) : (
                                                                        <div className={cn("w-1 h-1 rounded-full mr-3 bg-current opacity-40", isChildActive && "opacity-100")} />
                                                                    )}
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            </Button>
                                                        )
                                                    })}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        );
                                    }

                                    if (!open && !isMobile) {
                                        return (
                                            <Tooltip key={item.label}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant={isActive(item.href) ? "secondary" : "ghost"}
                                                        className={cn(
                                                            "w-full justify-center h-9",
                                                            isActive(item.href) && "bg-primary/10 text-primary hover:bg-primary/15"
                                                        )}
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link href={item.href}>
                                                            <item.icon className="h-5 w-5" />
                                                            <span className="sr-only">{item.label}</span>
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="font-medium">
                                                    {item.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }

                                    const active = isActive(item.href);
                                    return (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start h-9 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-normal",
                                                active && "bg-primary/10 text-primary hover:bg-primary/15 font-medium"
                                            )}
                                            asChild
                                        >
                                            <Link href={item.href}>
                                                <item.icon className={cn("mr-3 h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                                                <span>{item.label}</span>
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>
                        ))}
                    </TooltipProvider>
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 mt-auto border-t bg-card/50">
                {!open && !isMobile ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-full justify-center hover:bg-destructive/10 hover:text-destructive" asChild>
                                    <Link href="/logout" method="post" as="button">
                                        <LogOut className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Log Out</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <div className="flex items-center justify-between gap-2 px-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCog className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-medium truncate">Owner</span>
                                <span className="text-xs text-muted-foreground truncate">Admin</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive shrink-0" asChild>
                            <Link href="/logout" method="post" as="button">
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <NavContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside
            className={cn(
                "hidden border-r bg-background transition-all duration-300 ease-in-out md:block z-30",
                open ? "w-64" : "w-[60px]"
            )}
        >
            <NavContent />
        </aside>
    );
}
