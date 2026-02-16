import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('register'), { onFinish: () => reset('password', 'password_confirmation') }); };

    return (
        <GuestLayout>
            <Head title="Register" />
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-sm text-gray-500 mt-1">Register for Wujha Admin</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="name" className="pl-10 h-11 rounded-xl" value={data.name} onChange={e => setData('name', e.target.value)} autoFocus required /></div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="email" type="email" className="pl-10 h-11 rounded-xl" value={data.email} onChange={e => setData('email', e.target.value)} required /></div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="password" type="password" className="pl-10 h-11 rounded-xl" value={data.password} onChange={e => setData('password', e.target.value)} required /></div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="password_confirmation" type="password" className="pl-10 h-11 rounded-xl" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required /></div>
                    {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Link href={route('login')} className="text-sm text-primary hover:underline">Already registered?</Link>
                    <Button type="submit" className="rounded-xl" disabled={processing}><UserPlus className="h-4 w-4 mr-2" /> Register</Button>
                </div>
            </form>
        </GuestLayout>
    );
}
