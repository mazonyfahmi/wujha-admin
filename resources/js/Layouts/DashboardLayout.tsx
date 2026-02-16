
import { PropsWithChildren, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
// import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps extends PropsWithChildren {
    title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-muted/40 font-sans antialiased text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                isMobile={false}
            />

            {/* Mobile Sidebar (controlled by Header/Mobile state) */}
            <Sidebar
                open={mobileOpen}
                setOpen={setMobileOpen}
                isMobile={true}
            />

            <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out">
                <Header onOpenSidebar={() => setMobileOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

            {/* <Toaster /> */}
        </div>
    );
}
