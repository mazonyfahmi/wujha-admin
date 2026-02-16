import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import ApplicationLogo from '@/components/ApplicationLogo';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-primary to-indigo-800 p-5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl" />
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-auto max-w-[280px] object-contain brightness-0 invert" />
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-white/50 text-xs mt-6">
                    © {new Date().getFullYear()} Wujha Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
