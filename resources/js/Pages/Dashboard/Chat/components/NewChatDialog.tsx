import { useState, useEffect } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';
import type { UserType } from './ConversationList';

function getInitials(name: string): string {
    return name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
}

interface NewChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectUser: (user: UserType) => void;
    existingUserIds: number[];
}

export function NewChatDialog({ open, onOpenChange, onSelectUser, existingUserIds }: NewChatDialogProps) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setSearch('');
            setUsers([]);
            return;
        }
        // Load initial users
        fetchUsers('');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const timeout = setTimeout(() => fetchUsers(search), 300);
        return () => clearTimeout(timeout);
    }, [search, open]);

    const fetchUsers = async (query: string) => {
        setLoading(true);
        try {
            const res = await axios.get('/chat/users', { params: { search: query } });
            setUsers(res.data);
        } catch {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (user: UserType) => {
        onSelectUser(user);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 gap-0">
                <DialogHeader className="px-4 pt-4 pb-3">
                    <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>

                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9"
                            autoFocus
                        />
                    </div>
                </div>

                <ScrollArea className="max-h-[350px] border-t">
                    {loading && (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-3.5 w-28" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && users.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No users found</p>
                            <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                        </div>
                    )}
                    {!loading && users.map((user) => {
                        const hasConversation = existingUserIds.includes(user.id);
                        return (
                            <button
                                key={user.id}
                                onClick={() => handleSelect(user)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                            >
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{user.name}</span>
                                        {hasConversation && (
                                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                                Existing
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </button>
                        );
                    })}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
