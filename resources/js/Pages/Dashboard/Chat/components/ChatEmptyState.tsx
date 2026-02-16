import { MessageSquare } from 'lucide-react';

export function ChatEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5">
            <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <MessageSquare className="h-9 w-9 text-primary/40" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/20 animate-pulse" />
            </div>
            <div className="text-center max-w-xs">
                <p className="font-semibold text-foreground text-base">Your Messages</p>
                <p className="text-sm mt-1.5 leading-relaxed">
                    Select a conversation from the sidebar or start a new chat to begin messaging
                </p>
            </div>
        </div>
    );
}
