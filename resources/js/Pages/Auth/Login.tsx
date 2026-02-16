import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, LogIn, CheckCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('login'), { onFinish: () => reset('password') }); };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-sm text-gray-500 mt-1">Sign in to Wujha Admin Panel</p>
            </div>

            {status && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input id="email" type="email" className="pl-10 h-11 rounded-xl" placeholder="admin@wujha.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input id="password" type="password" className="pl-10 h-11 rounded-xl" placeholder="Enter your password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={data.remember} onCheckedChange={(v) => setData('remember', v === true)} />
                        <span className="text-sm text-gray-500">Remember me</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
                    )}
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30" disabled={processing}>
                    {processing ? 'Signing in...' : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
                </Button>
            </form>
        </GuestLayout>
    );
}
