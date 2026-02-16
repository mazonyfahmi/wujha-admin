import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { User, Mail, Lock, Save, Trash2, AlertTriangle, KeyRound, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared/PageHeader';

interface Props { mustVerifyEmail: boolean; status?: string; }

export default function Edit({ mustVerifyEmail, status }: Props) {
    const { props } = usePage();
    const auth = props.auth as { user: { id: number; name: string; email: string } };

    const profileForm = useForm({ name: auth.user.name, email: auth.user.email });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const deleteForm = useForm({ password: '' });

    const updateProfile: FormEventHandler = (e) => { e.preventDefault(); profileForm.patch(route('profile.update')); };
    const updatePassword: FormEventHandler = (e) => { e.preventDefault(); passwordForm.put(route('password.update'), { onSuccess: () => passwordForm.reset() }); };
    const deleteAccount: FormEventHandler = (e) => { e.preventDefault(); if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) deleteForm.delete(route('profile.destroy')); };

    return (
        <DashboardLayout title="Profile">
            <Head title="Profile" />
            <div className="space-y-6 max-w-3xl">
                <PageHeader title="Profile Settings" description="Manage your account settings and preferences" icon={User} />

                <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" /> Profile</TabsTrigger>
                        <TabsTrigger value="password"><Lock className="h-4 w-4 mr-2" /> Password</TabsTrigger>
                        <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive"><AlertTriangle className="h-4 w-4 mr-2" /> Danger</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xl">{auth.user.name?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                                    <div><CardTitle>{auth.user.name}</CardTitle><CardDescription>{auth.user.email}</CardDescription></div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={updateProfile} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} /></div>
                                            {profileForm.errors.name && <p className="text-xs text-destructive">{profileForm.errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" className="pl-10" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} /></div>
                                            {profileForm.errors.email && <p className="text-xs text-destructive">{profileForm.errors.email}</p>}
                                        </div>
                                    </div>

                                    {mustVerifyEmail && (
                                        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Email Verification Required</AlertTitle><AlertDescription>Your email address is unverified. Please check your inbox.</AlertDescription></Alert>
                                    )}
                                    {status === 'verification-link-sent' && (
                                        <Alert><AlertDescription>A new verification link has been sent to your email address.</AlertDescription></Alert>
                                    )}

                                    <Button type="submit" disabled={profileForm.processing}><Save className="h-4 w-4 mr-2" /> {profileForm.processing ? 'Saving...' : 'Save Changes'}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password">
                        <Card>
                            <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Ensure your account uses a strong password.</CardDescription></CardHeader>
                            <CardContent>
                                <form onSubmit={updatePassword} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" className="pl-10" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} /></div>
                                        {passwordForm.errors.current_password && <p className="text-xs text-destructive">{passwordForm.errors.current_password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" className="pl-10" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} /></div>
                                        {passwordForm.errors.password && <p className="text-xs text-destructive">{passwordForm.errors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" className="pl-10" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} /></div>
                                        {passwordForm.errors.password_confirmation && <p className="text-xs text-destructive">{passwordForm.errors.password_confirmation}</p>}
                                    </div>
                                    <Button type="submit" disabled={passwordForm.processing}><Save className="h-4 w-4 mr-2" /> {passwordForm.processing ? 'Updating...' : 'Update Password'}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="danger">
                        <Card className="border-destructive/30">
                            <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5" /> Delete Account</CardTitle><CardDescription>Once your account is deleted, all of its resources and data will be permanently deleted. Please download any data you wish to retain.</CardDescription></CardHeader>
                            <CardContent>
                                <form onSubmit={deleteAccount} className="space-y-4 max-w-sm">
                                    <div className="space-y-2">
                                        <Label>Confirm your password to delete</Label>
                                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" className="pl-10" placeholder="Enter your password" value={deleteForm.data.password} onChange={e => deleteForm.setData('password', e.target.value)} /></div>
                                        {deleteForm.errors.password && <p className="text-xs text-destructive">{deleteForm.errors.password}</p>}
                                    </div>
                                    <Button type="submit" variant="destructive" disabled={deleteForm.processing}><Trash2 className="h-4 w-4 mr-2" /> Delete Account Permanently</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
