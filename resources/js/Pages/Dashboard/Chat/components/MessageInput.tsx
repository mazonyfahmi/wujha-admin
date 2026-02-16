import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export function MessageInput({ value, onChange, onSend, disabled }: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSend();
        }
    };

    return (
        <div className="px-4 py-3 border-t bg-card/80 backdrop-blur-sm shrink-0">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 mb-0.5 text-muted-foreground hover:text-foreground"
                    disabled={disabled}
                >
                    <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[40px] max-h-[120px] resize-none rounded-xl pr-4 bg-muted/50 border-muted-foreground/10 focus:bg-background transition-colors"
                        rows={1}
                        disabled={disabled}
                    />
                </div>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-full shrink-0 mb-0.5 shadow-sm"
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
