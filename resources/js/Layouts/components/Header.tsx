
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
    onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
    const user = (usePage().props as any).auth?.user;
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
                <img src="/icons/hamburger-menu.527725.svg" alt="Menu" className="h-5 w-5 dark:invert" />
                <span className="sr-only">Toggle Menu</span>
            </Button>

            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <img
                            src="/icons/magnifer.528378.svg"
                            alt="Search"
                            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:invert"
                        />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </form>

                <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? (
                        <img src="/icons/sun.svg" alt="Light mode" className="h-5 w-5 dark:invert" />
                    ) : (
                        <img src="/icons/moon.528415.svg" alt="Dark mode" className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <Button variant="ghost" size="icon">
                    <img src="/icons/bell.527619.svg" alt="Notifications" className="h-5 w-5 dark:invert" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center cursor-pointer">
                                <img src="/icons/user.527961.svg" alt="Profile" className="mr-2 h-4 w-4 dark:invert" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center cursor-pointer">
                                <img src="/icons/settings.528592.svg" alt="Settings" className="mr-2 h-4 w-4 dark:invert" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/logout" method="post" as="button" className="w-full flex items-center cursor-pointer">
                                <img src="/icons/logout.527786.svg" alt="Logout" className="mr-2 h-4 w-4 dark:invert" />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
