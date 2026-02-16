import { useRef, useEffect, useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { UserType, Message } from './ConversationList';

/* ─── Helpers ─── */

function getDateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatMsgTime(d: string): string {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string): string {
    return name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
}

/* ─── SVG Icon Components (for reuse) ─── */

const Icons = {
    filePlus: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" x2="12" y1="18" y2="12" />
            <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
    ),
    checkCircle: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    flag: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
        </svg>
    ),
    moreVertical: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    ),
    download: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    ),
    userMinus: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" x2="22" y1="11" y2="11" />
        </svg>
    ),
    block: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.9 4.9 14.2 14.2" />
        </svg>
    ),
    cart: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    file: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    ),
    chat: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
    ),
};

/* ─── Status / Priority Config ─── */

type ConversationStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';

const STATUS_CONFIG: Record<ConversationStatus, { label: string; dot: string; badge: string }> = {
    open: { label: 'Open', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    in_progress: { label: 'In Progress', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    resolved: { label: 'Resolved', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    closed: { label: 'Closed', dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400' },
};

const PRIORITY_CONFIG: Record<ConversationPriority, { label: string; dot: string; badge: string }> = {
    low: { label: 'Low', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400' },
    medium: { label: 'Medium', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    high: { label: 'High', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    urgent: { label: 'Urgent', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

/* ─── Component ─── */

interface MessageThreadProps {
    user: UserType;
    messages: Message[];
    loading: boolean;
    onToggleInfo: () => void;
    showInfo: boolean;
}

export function MessageThread({ user, messages, loading, onToggleInfo, showInfo }: MessageThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ─── State ───
    const [status, setStatus] = useState<ConversationStatus>('open');
    const [priority, setPriority] = useState<ConversationPriority>('low');
    const [showCaseDialog, setShowCaseDialog] = useState(false);
    const [activeCase, setActiveCase] = useState<string | null>(null);
    const [caseInput, setCaseInput] = useState('');

    // Reset state when user changes
    useEffect(() => {
        setStatus('open');
        setPriority('low');
        setActiveCase(null);
    }, [user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Group messages by date
    const messagesByDate: { date: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
        const dateKey = new Date(msg.created_at).toDateString();
        const lastGroup = messagesByDate[messagesByDate.length - 1];
        if (lastGroup && new Date(lastGroup.messages[0].created_at).toDateString() === dateKey) {
            lastGroup.messages.push(msg);
        } else {
            messagesByDate.push({ date: dateKey, messages: [msg] });
        }
    });

    const handleCreateCase = () => {
        if (caseInput.trim()) {
            setActiveCase(caseInput.trim());
            setCaseInput('');
            setShowCaseDialog(false);
            setStatus('in_progress');
        }
    };

    const handleCloseCase = () => {
        setActiveCase(null);
        setStatus('resolved');
    };

    const handleExportChat = () => {
        const text = messages.map(m => `[${formatMsgTime(m.created_at)}] ${m.sender_id === user.id ? user.name : 'Admin'}: ${m.content}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${user.name}-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusCfg = STATUS_CONFIG[status];
    const priorityCfg = PRIORITY_CONFIG[priority];

    return (
        <>
            {/* ── Chat Header ── */}
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b bg-card shrink-0 gap-2">
                {/* Left: User Info */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{user.name}</h3>
                            {/* Status Badge */}
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap', statusCfg.badge)}>
                                {statusCfg.label}
                            </span>
                            {/* Priority Badge — hide if Low */}
                            {priority !== 'low' && (
                                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-flex', priorityCfg.badge)}>
                                    ⚡ {priorityCfg.label}
                                </span>
                            )}
                            {/* Active Case Badge */}
                            {activeCase && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hidden sm:inline-flex max-w-[120px] truncate">
                                    📋 {activeCase}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate hidden sm:block">{user.email}</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

                    {/* Create Case / Close Case */}
                    {!activeCase ? (
                        <button
                            onClick={() => setShowCaseDialog(true)}
                            className="h-8 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                            title="Create Case"
                        >
                            {Icons.filePlus}
                            <span className="hidden sm:inline">Case</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleCloseCase}
                            className="h-8 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            title="Close Case"
                        >
                            {Icons.checkCircle}
                            <span className="hidden sm:inline">Close</span>
                        </button>
                    )}

                    <div className="h-4 w-px bg-border mx-0.5 sm:mx-1 hidden sm:block" />

                    {/* Status Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-8 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Change Status"
                            >
                                <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', statusCfg.dot)} />
                                <span className="hidden sm:inline">Status</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {(Object.entries(STATUS_CONFIG) as [ConversationStatus, typeof statusCfg][]).map(([key, cfg]) => (
                                <DropdownMenuItem
                                    key={key}
                                    className={cn('cursor-pointer', status === key && 'bg-accent')}
                                    onClick={() => setStatus(key)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                                        {cfg.label}
                                    </div>
                                    {status === key && Icons.check}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Priority Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-8 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Set Priority"
                            >
                                {Icons.flag}
                                <span className="hidden sm:inline">Priority</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {(Object.entries(PRIORITY_CONFIG) as [ConversationPriority, typeof priorityCfg][]).map(([key, cfg]) => (
                                <DropdownMenuItem
                                    key={key}
                                    className={cn('cursor-pointer', priority === key && 'bg-accent')}
                                    onClick={() => setPriority(key)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                                        {cfg.label}
                                    </div>
                                    {priority === key && Icons.check}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-border mx-0.5 sm:mx-1 hidden sm:block" />

                    {/* More Options (includes View Orders, Export, Assign, Block) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="More Options"
                            >
                                {Icons.moreVertical}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => { window.location.href = '/orders'; }}>
                                <span className="mr-2">{Icons.cart}</span>
                                View Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={handleExportChat}>
                                <span className="mr-2">{Icons.download}</span>
                                Export Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <span className="mr-2">{Icons.userMinus}</span>
                                Assign to Agent
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                <span className="mr-2">{Icons.block}</span>
                                Block User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Info Toggle */}
                    <button
                        onClick={onToggleInfo}
                        className={cn(
                            'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                            showInfo
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        title="User Info"
                    >
                        {Icons.info}
                    </button>
                </div>
            </div>

            {/* ── Messages Area ── */}
            <ScrollArea className="flex-1 px-3 sm:px-6 py-4">
                <div className="flex flex-col gap-1">
                    {/* Active Case Banner */}
                    {activeCase && (
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 mb-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                            <span className="text-indigo-600 dark:text-indigo-400 shrink-0">{Icons.file}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Active Case</p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-500 truncate">{activeCase}</p>
                            </div>
                            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap', statusCfg.badge)}>
                                {statusCfg.label}
                            </span>
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-6 py-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                                    <div className="space-y-2">
                                        <Skeleton className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-56' : 'w-44')} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading &&
                        messagesByDate.map((group) => (
                            <div key={group.date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-5">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="h-px bg-border flex-1" />
                                        <span className="text-[10px] font-medium text-muted-foreground bg-card px-3 py-1 rounded-full border shrink-0">
                                            {getDateSeparator(group.messages[0].created_at)}
                                        </span>
                                        <div className="h-px bg-border flex-1" />
                                    </div>
                                </div>
                                {group.messages.map((msg) => {
                                    const isMe = msg.sender_id !== user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex mb-2 animate-in fade-in slide-in-from-bottom-1 duration-200',
                                                isMe ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[85%] sm:max-w-[65%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm',
                                                    isMe
                                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                        : 'bg-muted/80 text-foreground rounded-bl-sm border'
                                                )}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                    {msg.content}
                                                </p>
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-1 mt-1',
                                                        isMe ? 'justify-end' : 'justify-start'
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'text-[10px]',
                                                            isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {formatMsgTime(msg.created_at)}
                                                    </span>
                                                    {isMe &&
                                                        (msg.is_read ? (
                                                            <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                                                        ) : (
                                                            <Check className="h-3 w-3 text-primary-foreground/60" />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    {!loading && messages.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                                <span className="text-muted-foreground">{Icons.chat}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">Start the conversation</p>
                            <p className="text-xs text-muted-foreground mt-1">Send a message to {user.name}</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* ── Create Case Dialog ── */}
            <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Case</DialogTitle>
                        <DialogDescription>
                            Create a support case for <strong>{user.name}</strong>. Give it a descriptive name to track the issue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="case-name" className="text-sm font-medium leading-none">
                                Case Name
                            </label>
                            <Input
                                id="case-name"
                                placeholder="e.g. Payment issue, Delivery problem..."
                                value={caseInput}
                                onChange={(e) => setCaseInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateCase()}
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowCaseDialog(false); setCaseInput(''); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCase} disabled={!caseInput.trim()}>
                            Create Case
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
