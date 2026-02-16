import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Mail, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('verification.send')); };

    return (
        <GuestLayout>
            <Head title="Email Verification" />
            <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Mail className="h-7 w-7 text-primary" /></div>
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">Thanks for signing up! Please verify your email address by clicking the link we just sent you.</p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg text-center">A new verification link has been sent!</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={processing}>{processing ? 'Sending...' : 'Resend Verification Email'}</Button>
                <div className="text-center">
                    <Link href={route('logout')} method="post" as="button" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"><LogOut className="h-3.5 w-3.5" /> Log Out</Link>
                </div>
            </form>
        </GuestLayout>
    );
}
