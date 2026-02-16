import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface UserType {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    orders_count?: number;
    created_at?: string;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    user: UserType;
    last_message: Message | null;
    unread_count: number;
}

function getRelativeTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

interface ConversationListProps {
    conversations: Conversation[];
    selectedUserId: number | null;
    onSelectConversation: (user: UserType) => void;
    onNewChat: () => void;
}

export function ConversationList({
    conversations,
    selectedUserId,
    onSelectConversation,
    onNewChat,
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

    const filteredConversations = conversations.filter(
        (conv) =>
            conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 border-r flex flex-col bg-card">
            {/* Header */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        {totalUnread > 0 && (
                            <Badge variant="default" className="font-mono text-[10px] h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center">
                                {totalUnread}
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        onClick={onNewChat}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Chat
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-muted/50"
                    />
                </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
                <div className="py-1">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.user.id}
                            onClick={() => onSelectConversation(conv.user)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150',
                                'hover:bg-accent/50',
                                selectedUserId === conv.user.id
                                    ? 'bg-accent border-r-2 border-r-primary'
                                    : 'border-r-2 border-r-transparent'
                            )}
                        >
                            <div className="relative shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {getInitials(conv.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        'text-sm truncate',
                                        conv.unread_count > 0 ? 'font-semibold' : 'font-medium'
                                    )}>
                                        {conv.user.name}
                                    </span>
                                    {conv.last_message && (
                                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                            {getRelativeTime(conv.last_message.created_at)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className={cn(
                                        'text-xs truncate max-w-[160px]',
                                        conv.unread_count > 0
                                            ? 'text-foreground font-medium'
                                            : 'text-muted-foreground'
                                    )}>
                                        {conv.last_message?.content?.substring(0, 45) || 'No messages yet'}
                                    </p>
                                    {conv.unread_count > 0 && (
                                        <Badge className="h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 ml-1">
                                            {conv.unread_count}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="text-center text-muted-foreground py-16 px-6">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No conversations found</p>
                            <p className="text-xs mt-1 opacity-70">
                                {searchQuery ? 'Try a different search' : 'Start a new chat!'}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
