<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $adminId = auth()->id();

        $conversations = User::where('role', 'user')
            ->where(function ($q) {
                $q->whereHas('sentMessages')
                  ->orWhereHas('receivedMessages');
            })
            ->withCount(['sentMessages as unread_count' => function ($query) use ($adminId) {
                $query->where('receiver_id', $adminId)
                      ->where('is_read', false);
            }])
            ->with(['sentMessages' => function ($query) {
                $query->latest()->take(1);
            }, 'receivedMessages' => function ($query) {
                $query->latest()->take(1);
            }])
            ->withCount('orders')
            ->get()
            ->map(function ($user) {
                $lastSent = $user->sentMessages->first();
                $lastReceived = $user->receivedMessages->first();

                $lastMessage = null;
                if ($lastSent && $lastReceived) {
                    $lastMessage = $lastSent->created_at > $lastReceived->created_at
                        ? $lastSent
                        : $lastReceived;
                } else {
                    $lastMessage = $lastSent ?? $lastReceived;
                }

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'orders_count' => $user->orders_count,
                        'created_at' => $user->created_at,
                    ],
                    'last_message' => $lastMessage,
                    'unread_count' => $user->unread_count,
                ];
            })
            ->sortByDesc(function ($item) {
                return $item['last_message']?->created_at;
            })
            ->values();

        return Inertia::render('Dashboard/Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Search users for starting new conversations.
     */
    public function users(Request $request)
    {
        $search = $request->get('search', '');
        $adminId = auth()->id();

        $users = User::where('role', 'user')
            ->where('id', '!=', $adminId)
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($users);
    }

    public function messages(User $user)
    {
        $admin = auth()->user();

        // Mark all messages from this user as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $admin->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = Message::where(function ($query) use ($user, $admin) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $admin->id);
        })->orWhere(function ($query) use ($user, $admin) {
            $query->where('sender_id', $admin->id)
                ->where('receiver_id', $user->id);
        })
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // User info with order stats
        $userInfo = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'orders_count' => $user->orders()->count(),
            'orders_total' => $user->orders()->sum('price'),
            'last_order_at' => $user->orders()->latest()->value('created_at'),
        ];

        return response()->json([
            'user' => $userInfo,
            'messages' => $messages,
        ]);
    }

    /**
     * Poll for new messages in a conversation.
     */
    public function poll(Request $request, User $user)
    {
        $admin = auth()->user();
        $since = $request->get('since'); // ISO timestamp

        $query = Message::where(function ($q) use ($user, $admin) {
            $q->where('sender_id', $user->id)
              ->where('receiver_id', $admin->id);
        })->orWhere(function ($q) use ($user, $admin) {
            $q->where('sender_id', $admin->id)
              ->where('receiver_id', $user->id);
        });

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at', 'asc')->get();

        // Mark received messages as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $admin->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Get updated unread counts for sidebar
        $totalUnread = Message::where('receiver_id', $admin->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'messages' => $messages,
            'total_unread' => $totalUnread,
        ]);
    }

    public function send(Request $request, User $user)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'string|in:text,image',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $user->id,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
        ]);

        return response()->json($message);
    }
}
