import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token, email, password: '', password_confirmation: '',
    });
    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') }); };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-sm text-gray-500 mt-1">Choose a new password for your account.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="email" type="email" className="pl-10 h-11 rounded-xl" value={data.email} onChange={e => setData('email', e.target.value)} /></div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="password" type="password" className="pl-10 h-11 rounded-xl" value={data.password} onChange={e => setData('password', e.target.value)} autoFocus /></div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="password_confirmation" type="password" className="pl-10 h-11 rounded-xl" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} /></div>
                    {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={processing}><KeyRound className="h-4 w-4 mr-2" /> {processing ? 'Resetting...' : 'Reset Password'}</Button>
            </form>
        </GuestLayout>
    );
}
