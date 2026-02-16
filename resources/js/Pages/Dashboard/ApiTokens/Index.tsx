import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Key, Plus, Trash2, Copy, Check, MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

interface ApiToken { id: number; name: string; abilities: string[]; last_used_at: string | null; expires_at: string | null; is_active: boolean; created_at: string; }
interface Props { tokens: ApiToken[]; availableAbilities: Record<string, string>; }

export default function Index({ tokens, availableAbilities }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
    const [expiresAt, setExpiresAt] = useState('');
    const [newToken, setNewToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await axios.post('/api-tokens', { name: tokenName, abilities: selectedAbilities, expires_at: expiresAt || null });
            setNewToken(res.data.token); setTokenName(''); setSelectedAbilities([]); setExpiresAt('');
            router.reload({ only: ['tokens'] });
        } catch { } finally { setCreating(false); }
    };

    const handleDelete = (id: number) => { if (confirm('Revoke this token?')) router.delete(`/api-tokens/${id}`); };
    const copyToken = () => { navigator.clipboard.writeText(newToken); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const toggleAbility = (ability: string) => {
        setSelectedAbilities(prev => prev.includes(ability) ? prev.filter(a => a !== ability) : [...prev, ability]);
    };

    return (
        <DashboardLayout title="API Tokens">
            <Head title="API Tokens" />
            <div className="space-y-6">
                <PageHeader title="API Tokens" description={`${tokens.length} tokens`} icon={Key} actions={<Button onClick={() => { setNewToken(''); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Create Token</Button>} />

                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Abilities</TableHead><TableHead>Last Used</TableHead><TableHead>Expires</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {tokens.map(t => (
                                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell><div className="flex items-center gap-2"><Key className="h-4 w-4 text-primary" /><span className="font-medium">{t.name}</span></div></TableCell>
                                    <TableCell><div className="flex flex-wrap gap-1">{t.abilities.slice(0, 3).map(a => <Badge key={a} variant="outline" className="text-xs">{availableAbilities[a] || a}</Badge>)}{t.abilities.length > 3 && <Badge variant="outline" className="text-xs">+{t.abilities.length - 3}</Badge>}</div></TableCell>
                                    <TableCell className="text-muted-foreground">{t.last_used_at ? formatDate(t.last_used_at) : 'Never'}</TableCell>
                                    <TableCell className="text-muted-foreground">{t.expires_at ? formatDate(t.expires_at) : 'Never'}</TableCell>
                                    <TableCell className="text-center"><Badge variant={t.is_active ? 'success' : 'destructive'}>{t.is_active ? 'Active' : 'Revoked'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="mr-2 h-4 w-4" /> Revoke</DropdownMenuItem></DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tokens.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No API tokens created yet</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle>Create API Token</DialogTitle><DialogDescription>Generate a new API token for external integrations.</DialogDescription></DialogHeader>
                        {newToken ? (
                            <div className="space-y-4">
                                <Alert><AlertDescription>Copy this token now — it won't be shown again.</AlertDescription></Alert>
                                <div className="flex gap-2"><Input value={newToken} readOnly className="font-mono text-sm" /><Button variant="outline" size="icon" onClick={copyToken}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
                                <DialogFooter><Button onClick={() => setCreateOpen(false)}>Done</Button></DialogFooter>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Token Name *</Label><Input value={tokenName} onChange={e => setTokenName(e.target.value)} placeholder="e.g. Mobile App" /></div>
                                <div className="space-y-2"><Label>Abilities</Label>
                                    <div className="grid grid-cols-2 gap-2">{Object.entries(availableAbilities).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer text-sm"><Checkbox checked={selectedAbilities.includes(key)} onCheckedChange={() => toggleAbility(key)} />{label}</label>
                                    ))}</div>
                                </div>
                                <div className="space-y-2"><Label>Expiration Date</Label><Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
                                <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={creating || !tokenName}>{creating ? 'Creating...' : 'Create'}</Button></DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
