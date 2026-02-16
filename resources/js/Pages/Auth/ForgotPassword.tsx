import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('password.email')); };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">Enter your email and we'll send you a reset link.</p>
            </div>

            {status && <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="email" type="email" className="pl-10 h-11 rounded-xl" value={data.email} onChange={e => setData('email', e.target.value)} autoFocus /></div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={processing}><Send className="h-4 w-4 mr-2" /> {processing ? 'Sending...' : 'Send Reset Link'}</Button>
            </form>
        </GuestLayout>
    );
}
