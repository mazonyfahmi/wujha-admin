import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });
    const submit: FormEventHandler = (e) => { e.preventDefault(); post(route('password.confirm'), { onFinish: () => reset('password') }); };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Confirm Password</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">This is a secure area. Please confirm your password before continuing.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="password" type="password" className="pl-10 h-11 rounded-xl" value={data.password} onChange={e => setData('password', e.target.value)} autoFocus /></div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={processing}><ShieldCheck className="h-4 w-4 mr-2" /> Confirm</Button>
            </form>
        </GuestLayout>
    );
}
