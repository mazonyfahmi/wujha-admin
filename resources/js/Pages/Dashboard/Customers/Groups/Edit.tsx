import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props { group: { id: number; code: string; name: string; is_user_defined: boolean }; }

export default function Edit({ group }: Props) {
    const { data, setData, put, processing, errors } = useForm({ code: group.code, name: group.name });
    const onSubmit = () => put(`/customer-groups/${group.id}`);

    return (
        <DashboardLayout title="Edit Customer Group">
            <Head title="Edit Customer Group" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground"><Link href="/customer-groups" className="hover:underline">Customer Groups</Link> / Edit</p>
                        <div className="flex items-center gap-3 mt-1"><h1 className="text-2xl font-bold">Edit Customer Group</h1>{!group.is_user_defined && <Badge variant="secondary">System</Badge>}</div></div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/customer-groups"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link></Button>
                        <Button onClick={onSubmit} disabled={processing}><Save className="h-4 w-4 mr-2" /> {processing ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
                <Card>
                    <CardHeader><CardTitle>Group Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Code *</Label><Input value={data.code} onChange={e => setData('code', e.target.value)} disabled={!group.is_user_defined} />{errors.code && <p className="text-xs text-destructive">{errors.code}</p>}</div>
                        <div className="space-y-2"><Label>Name *</Label><Input value={data.name} onChange={e => setData('name', e.target.value)} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
