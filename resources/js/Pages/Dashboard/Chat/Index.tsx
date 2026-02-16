import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

import { ConversationList, type Conversation, type UserType, type Message } from './components/ConversationList';
import { MessageThread } from './components/MessageThread';
import { MessageInput } from './components/MessageInput';
import { UserInfoPanel } from './components/UserInfoPanel';
import { NewChatDialog } from './components/NewChatDialog';
import { ChatEmptyState } from './components/ChatEmptyState';

interface UserInfo extends UserType {
    orders_count?: number;
    orders_total?: number;
    last_order_at?: string;
}

interface Props {
    conversations: Conversation[];
}

export default function Index({ conversations: initialConversations }: Props) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load messages for a user
    const loadMessages = useCallback(async (user: UserType) => {
        setSelectedUser(user as UserInfo);
        setLoading(true);
        try {
            const res = await axios.get(`/chat/${user.id}/messages`);
            const data = res.data;
            setMessages(data.messages?.data ?? data.messages ?? []);
            // Enrich selected user with stats from backend
            if (data.user) {
                setSelectedUser(data.user);
            }
            // Update the unread count for this conversation
            setConversations(prev =>
                prev.map(c =>
                    c.user.id === user.id ? { ...c, unread_count: 0 } : c
                )
            );
        } catch {
            console.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedUser) return;
        const content = newMessage;
        setNewMessage('');
        try {
            const res = await axios.post(`/chat/${selectedUser.id}/send`, {
                content,
                type: 'text',
            });
            setMessages(prev => [...prev, res.data]);
            // Update the conversation in the sidebar
            setConversations(prev => {
                const exists = prev.find(c => c.user.id === selectedUser.id);
                if (exists) {
                    return prev.map(c =>
                        c.user.id === selectedUser.id
                            ? { ...c, last_message: res.data }
                            : c
                    );
                }
                // New conversation — add it
                return [
                    {
                        user: selectedUser,
                        last_message: res.data,
                        unread_count: 0,
                    },
                    ...prev,
                ];
            });
        } catch {
            setNewMessage(content); // restore on error
            console.error('Failed to send message');
        }
    }, [newMessage, selectedUser]);

    // Poll for new messages every 10s
    useEffect(() => {
        if (!selectedUser) return;

        const poll = async () => {
            const lastMsg = messages[messages.length - 1];
            const since = lastMsg?.created_at;
            try {
                const res = await axios.get(`/chat/${selectedUser.id}/poll`, {
                    params: { since },
                });
                if (res.data.messages?.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMsgs = res.data.messages.filter(
                            (m: Message) => !existingIds.has(m.id)
                        );
                        return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
                    });

                    // Update unread count for this user
                    setConversations(prev =>
                        prev.map(c =>
                            c.user.id === selectedUser.id
                                ? { ...c, unread_count: 0, last_message: res.data.messages[res.data.messages.length - 1] }
                                : c
                        )
                    );
                }
            } catch {
                // Silently fail polling
            }
        };

        pollingRef.current = setInterval(poll, 10000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [selectedUser?.id, messages.length]);

    // Handle selecting a user from the new chat dialog
    const handleNewChatUser = useCallback(
        (user: UserType) => {
            loadMessages(user);
        },
        [loadMessages]
    );

    const existingUserIds = conversations.map(c => c.user.id);

    return (
        <DashboardLayout title="Chat">
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-130px)] rounded-xl border bg-card overflow-hidden shadow-sm">
                {/* Conversations Sidebar */}
                <ConversationList
                    conversations={conversations}
                    selectedUserId={selectedUser?.id ?? null}
                    onSelectConversation={loadMessages}
                    onNewChat={() => setShowNewChat(true)}
                />

                {/* Chat Area */}
                {selectedUser ? (
                    <>
                        <div className="flex-1 flex flex-col min-w-0">
                            <MessageThread
                                user={selectedUser}
                                messages={messages}
                                loading={loading}
                                onToggleInfo={() => setShowInfo(!showInfo)}
                                showInfo={showInfo}
                            />

                            {/* Message Input */}
                            <MessageInput
                                value={newMessage}
                                onChange={setNewMessage}
                                onSend={sendMessage}
                                disabled={loading}
                            />
                        </div>

                        {/* User Info Panel */}
                        {showInfo && (
                            <UserInfoPanel
                                user={selectedUser}
                                onClose={() => setShowInfo(false)}
                            />
                        )}
                    </>
                ) : (
                    <ChatEmptyState />
                )}

                {/* New Chat Dialog */}
                <NewChatDialog
                    open={showNewChat}
                    onOpenChange={setShowNewChat}
                    onSelectUser={handleNewChatUser}
                    existingUserIds={existingUserIds}
                />
            </div>
        </DashboardLayout>
    );
}
