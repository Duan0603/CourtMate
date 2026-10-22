'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { User, UserRole } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/auth.api';
import { getSocket } from '../../lib/socket';

const MAX_MESSAGE_LENGTH = 2000;
const ACK_TIMEOUT_MS = 10000;
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

interface ChatMessage {
  _id: string;
  roomId?: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  // Client-only fields for optimistic messages
  clientMsgId?: string;
  status?: 'sending' | 'failed';
}

interface RecentChat extends User {
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

const getUserId = (u: User | null | undefined): string => u?.id || (u as any)?._id || '';
const dmRoomId = (a: string, b: string) => [a, b].sort().join('_');
const partnerOf = (roomId: string | undefined, myId: string) => {
  const ids = (roomId || '').split('_');
  return ids.length === 2 ? (ids[0] === myId ? ids[1] : ids[0]) : '';
};

function ChatContent() {
  const { user, token, isAuthenticated } = useAuth();
  const [friends,setFriends] = useState<User[]>([]);
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);
  const mobileConversationOpenRef = useRef(false);
  const messageStreamRef = useRef<HTMLDivElement>(null);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, ChatMessage>>({});
  const [unreadCountsMap, setUnreadCountsMap] = useState<Record<string, number>>({});
  const [newMessageBanner, setNewMessageBanner] = useState<{ senderId: string; senderName: string; content: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Refs mirror state for socket callbacks registered once per user (avoid stale closures)
  const activeFriendRef = useRef<User | null>(null);
  const activeRoomRef = useRef<string | null>(null);
  const friendsRef = useRef<User[]>([]);
  const ackTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const myId = getUserId(user);

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  const targetUserAvatar = searchParams.get('avatar');
  const targetUserRole = searchParams.get('role');

  useEffect(() => { mobileConversationOpenRef.current = mobileConversationOpen; }, [mobileConversationOpen]);

  useEffect(() => {
    activeFriendRef.current = activeFriend;
  }, [activeFriend]);

  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const stream = messageStreamRef.current;
      stream?.scrollTo({ top: stream.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 50);
  };

  // Load chat partners / friends from API, plus the partner passed in the URL
  useEffect(() => {
    if (!myId) return;
    let cancelled = false;

    async function loadFriends() {
      let list: User[] = [];
      try {
        list = await authApi.getFriends();
      } catch (e) {
        console.warn('Could not fetch friends from API:', e);
      }
      if (cancelled) return;

      const merge = (prev: User[], next: User[]) => {
        const merged = [...next];
        prev.forEach((f) => {
          if (!merged.some((m) => getUserId(m) === getUserId(f))) merged.push(f);
        });
        return merged;
      };

      if (targetUserId && targetUserId !== myId) {
        let target = list.find((u) => getUserId(u) === targetUserId);
        if (!target) {
          target = {
            id: targetUserId,
            name: targetUserName && targetUserName !== 'null' ? targetUserName : 'Người dùng',
            email: '',
            role: targetUserRole === UserRole.ORGANIZER ? UserRole.ORGANIZER : undefined,
            avatarUrl: targetUserAvatar || undefined,
          } as any;
          list = [target!, ...list];
        }
        setFriends((prev) => merge(prev, list));
        setActiveFriend(target!);
        setMobileConversationOpen(true);
      } else {
        setFriends((prev) => merge(prev, list));
        if (list.length > 0 && !activeFriendRef.current) {
          setActiveFriend(list[0]);
        }
      }
    }
    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [targetUserId, targetUserName, targetUserAvatar, targetUserRole, myId]);

  // Append a message unless we already have it (same server id)
  const appendMessageSafely = useCallback((incoming: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming]));
  }, []);

  const markRoomSeen = useCallback(() => {
    const roomId = activeRoomRef.current;
    if (!roomId || document.visibilityState !== 'visible') return;
    if (window.matchMedia('(max-width: 767px)').matches && !mobileConversationOpenRef.current) return;
    getSocket().emit('mark_seen', { roomId });
  }, []);

  useEffect(() => {
    if (!mobileConversationOpen) return;
    markRoomSeen();
    const stream = messageStreamRef.current;
    stream?.scrollTo({ top: stream.scrollHeight });
  }, [mobileConversationOpen, markRoomSeen]);

  const openConversation = useCallback((friend: User) => {
    const friendId = getUserId(friend);
    setActiveFriend(friend);
    setMobileConversationOpen(true);
    setUnreadCountsMap((prev) => ({ ...prev, [friendId]: 0 }));
    setNewMessageBanner((banner) => (banner?.senderId === friendId ? null : banner));
  }, []);

  // Socket.IO wiring — registered once per user; handlers read the refs above
  useEffect(() => {
    if (!myId) return;
    const socket = getSocket();

    const handleConnect = () => {
      setConnected(true);
      socket.emit('register_user', {});
      // Rooms are lost when the server restarts or the socket reconnects: re-join the open conversation
      if (activeRoomRef.current) {
        socket.emit('join_room', { roomId: activeRoomRef.current });
        markRoomSeen();
      }
    };
    const handleDisconnect = () => setConnected(false);

    const handleAuthError = (data: { message?: string }) => {
      setConnected(false);
      toast.error(data?.message || 'Không thể kết nối trò chuyện, vui lòng đăng nhập lại');
    };

    const handleChatHistory = (payload: { roomId: string; messages: ChatMessage[] }) => {
      if (!payload || payload.roomId !== activeRoomRef.current) return; // stale room
      const history = payload.messages || [];
      const historyIds = new Set(history.map((m) => m._id));
      const historyClientIds = new Set(history.map((m) => m.clientMsgId).filter(Boolean));
      // Optimistic messages the server already saved (ack lost on reconnect) are now confirmed
      historyClientIds.forEach((id) => {
        clearTimeout(ackTimersRef.current[id!]);
        delete ackTimersRef.current[id!];
      });
      // Merge rather than replace: keep live messages that arrived while history was loading
      // and optimistic messages the server hasn't saved yet
      setMessages((prev) => [
        ...history,
        ...prev.filter(
          (m) =>
            m.roomId === payload.roomId &&
            !historyIds.has(m._id) &&
            !(m.clientMsgId && historyClientIds.has(m.clientMsgId)),
        ),
      ]);
      const friendId = partnerOf(payload.roomId, myId);
      if (history.length > 0 && friendId) {
        setLastMessagesMap((prev) => ({ ...prev, [friendId]: history[history.length - 1] }));
      }
      scrollToBottom();
    };

    const handleChatError = (data: { message?: string }) => {
      toast.error(data?.message || 'Không thể mở cuộc trò chuyện');
    };

    // New message in a room this socket is in (from the partner, or from my other tab)
    const handleReceiveMessage = (incoming: ChatMessage) => {
      const friendId = partnerOf(incoming.roomId, myId);
      if (friendId) setLastMessagesMap((prev) => ({ ...prev, [friendId]: incoming }));
      if (incoming.roomId !== activeRoomRef.current) return;
      appendMessageSafely(incoming);
      if (incoming.senderId !== myId) markRoomSeen();
      scrollToBottom();
    };

    // Server confirmed our message: swap the optimistic copy for the saved one
    const handleMessageAck = (saved: ChatMessage) => {
      if (!saved.clientMsgId) return;
      clearTimeout(ackTimersRef.current[saved.clientMsgId]);
      delete ackTimersRef.current[saved.clientMsgId];
      const isPending = (m: ChatMessage) => !!m.status && m.clientMsgId === saved.clientMsgId;
      setMessages((prev) => {
        // No pending copy: history already brought the saved one in, or another room is open
        if (!prev.some(isPending)) return prev;
        return prev.filter((m) => m._id !== saved._id).map((m) => (isPending(m) ? saved : m));
      });
      const friendId = partnerOf(saved.roomId, myId);
      if (friendId) setLastMessagesMap((prev) => ({ ...prev, [friendId]: saved }));
    };

    const handleMessageError = (data: { clientMsgId?: string; message?: string }) => {
      if (data?.clientMsgId) {
        clearTimeout(ackTimersRef.current[data.clientMsgId]);
        delete ackTimersRef.current[data.clientMsgId];
        setMessages((prev) =>
          prev.map((m) => (m.clientMsgId === data.clientMsgId ? { ...m, status: 'failed' } : m)),
        );
      }
      toast.error(data?.message || 'Gửi tin nhắn thất bại');
    };

    const handleMessageSeen = ({ roomId, userId, seenAt }: { roomId: string; userId: string; seenAt: string }) => {
      if (userId === myId) {
        // Read from another tab of mine
        const friendId = partnerOf(roomId, myId);
        if (friendId) setUnreadCountsMap((prev) => ({ ...prev, [friendId]: 0 }));
        return;
      }
      if (roomId !== activeRoomRef.current) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId === myId && !m.status && !m.readAt ? { ...m, readAt: seenAt } : m)),
      );
    };

    const handleRecentChats = (recentChats: RecentChat[]) => {
      const chats = (recentChats || []).filter((rc) => getUserId(rc) && getUserId(rc) !== myId);
      setFriends((prev) => {
        const next = prev.map((f) => {
          const rc = chats.find((c) => getUserId(c) === getUserId(f));
          // Server data has the real name/avatar; URL-provided placeholders get replaced
          return rc ? { ...f, name: rc.name || f.name, avatarUrl: f.avatarUrl || rc.avatarUrl, role: f.role || rc.role } : f;
        });
        chats.forEach((rc) => {
          if (!next.some((f) => getUserId(f) === getUserId(rc))) next.push(rc);
        });
        return next;
      });
      setLastMessagesMap((prev) => {
        const map = { ...prev };
        chats.forEach((rc) => {
          if (rc.lastMessage) map[getUserId(rc)] = rc.lastMessage;
        });
        return map;
      });
      setUnreadCountsMap((prev) => {
        const map = { ...prev };
        const activeId = window.matchMedia('(max-width: 767px)').matches && !mobileConversationOpenRef.current ? '' : getUserId(activeFriendRef.current);
        chats.forEach((rc) => {
          map[getUserId(rc)] = getUserId(rc) === activeId ? 0 : rc.unreadCount || 0;
        });
        return map;
      });
    };

    // Sent to my personal room for every message addressed to me, wherever I am
    const handleNewMessageNotification = (incoming: ChatMessage) => {
      const senderId = incoming.senderId;
      if (senderId === myId) return;

      setLastMessagesMap((prev) => ({ ...prev, [senderId]: incoming }));

      // Add the sender to the sidebar if needed and move them to the top
      setFriends((prev) => {
        const existing = prev.find((f) => getUserId(f) === senderId);
        const others = prev.filter((f) => getUserId(f) !== senderId);
        const sender = existing || ({
          id: senderId,
          name: incoming.senderName || 'Người dùng mới',
          email: '',
          avatarUrl: DEFAULT_AVATAR,
        } as any);
        return [sender, ...others];
      });

      // Already looking at this conversation: receive_message handles the stream
      if (getUserId(activeFriendRef.current) === senderId && (!window.matchMedia('(max-width: 767px)').matches || mobileConversationOpenRef.current)) return;

      setUnreadCountsMap((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      setNewMessageBanner({
        senderId,
        senderName: incoming.senderName || 'Người dùng',
        content: incoming.content,
      });

      toast.custom((t) => (
        <div
          onClick={() => {
            const target = friendsRef.current.find((f) => getUserId(f) === senderId);
            if (target) openConversation(target);
            toast.dismiss(t.id);
          }}
          className={`${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-300 max-w-sm w-full bg-white shadow-2xl rounded-2xl border border-primary/30 p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary hover:shadow-lg`}
        >
          <div className="w-10 h-10 rounded-full bg-accent-baby text-primary flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-navy truncate">{incoming.senderName || 'Tin nhắn mới'}</p>
              <span className="text-[10px] text-primary font-bold ml-2 shrink-0">Xem ngay</span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">{incoming.content}</p>
          </div>
        </div>
      ), { id: `chat-${senderId}`, duration: 5000 });
    };

    // Mark the open conversation as read when the user comes back to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') markRoomSeen();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleDisconnect);
    socket.on('auth_error', handleAuthError);
    socket.on('chat_history', handleChatHistory);
    socket.on('chat_error', handleChatError);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_ack', handleMessageAck);
    socket.on('message_error', handleMessageError);
    socket.on('message_seen', handleMessageSeen);
    socket.on('recent_chats', handleRecentChats);
    socket.on('new_message_notification', handleNewMessageNotification);
    document.addEventListener('visibilitychange', handleVisibility);
    if (socket.connected) handleConnect();

    return () => {
      // Pass the handlers so listeners owned by other components (e.g. Navbar badge) stay attached
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleDisconnect);
      socket.off('auth_error', handleAuthError);
      socket.off('chat_history', handleChatHistory);
      socket.off('chat_error', handleChatError);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_ack', handleMessageAck);
      socket.off('message_error', handleMessageError);
      socket.off('message_seen', handleMessageSeen);
      socket.off('recent_chats', handleRecentChats);
      socket.off('new_message_notification', handleNewMessageNotification);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // `token`: a new token means getSocket() builds a new socket, so listeners must move to it
  }, [myId, token, appendMessageSafely, markRoomSeen, openConversation]);

  useEffect(() => {
    const timers = ackTimersRef.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  // Join room when active friend changes
  useEffect(() => {
    if (!activeFriend || !myId) return;
    const friendId = getUserId(activeFriend);

    // NEVER join a room with yourself
    if (friendId === myId) {
      setActiveFriend(null);
      return;
    }

    const roomId = dmRoomId(myId, friendId);
    if (activeRoomRef.current === roomId) return;
    activeRoomRef.current = roomId;
    setMessages([]);
    setUnreadCountsMap((prev) => ({ ...prev, [friendId]: 0 }));

    const socket = getSocket();
    socket.emit('join_room', { roomId });
    markRoomSeen();
  }, [activeFriend, myId, markRoomSeen]);

  const handleSelectFriend = (friend: User) => {
    openConversation(friend);
  };

  const emitMessage = (msg: ChatMessage) => {
    const clientMsgId = msg.clientMsgId!;
    getSocket().emit('send_message', { roomId: msg.roomId, content: msg.content, clientMsgId });
    // No ack in time (server down, socket stuck): let the user retry
    clearTimeout(ackTimersRef.current[clientMsgId]);
    ackTimersRef.current[clientMsgId] = setTimeout(() => {
      delete ackTimersRef.current[clientMsgId];
      setMessages((prev) =>
        prev.map((m) => (m.clientMsgId === clientMsgId && m.status === 'sending' ? { ...m, status: 'failed' } : m)),
      );
    }, ACK_TIMEOUT_MS);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || !activeFriend || !myId) return;
    if (content.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Tin nhắn tối đa ${MAX_MESSAGE_LENGTH} ký tự`);
      return;
    }

    const friendId = getUserId(activeFriend);
    const clientMsgId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newMsg: ChatMessage = {
      _id: clientMsgId,
      clientMsgId,
      roomId: dmRoomId(myId, friendId),
      senderId: myId,
      senderName: user?.name || 'VĐV',
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMsg]);
    setLastMessagesMap((prev) => ({ ...prev, [friendId]: newMsg }));
    emitMessage(newMsg);

    setInputText('');
    scrollToBottom();
  };

  const handleRetry = (msg: ChatMessage) => {
    const retry: ChatMessage = { ...msg, status: 'sending' };
    setMessages((prev) => prev.map((m) => (m.clientMsgId === msg.clientMsgId ? retry : m)));
    emitMessage(retry);
  };

  const filteredFriends = friends.filter((f) => {
    // Never show yourself in the contacts sidebar
    if (getUserId(f) === myId) return false;
    return `${f.name} ${f.email}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // People search on the server, so a conversation can start with anyone, not only existing contacts
  useEffect(() => {
    const q = searchQuery.trim();
    if (!myId || q.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const users = await authApi.searchUsers(q);
        if (!cancelled) setSearchResults(users);
      } catch {
        if (!cancelled) setSearchResults([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, myId]);

  const otherUsers = searchResults.filter(
    (u) => getUserId(u) !== myId && !friends.some((f) => getUserId(f) === getUserId(u)),
  );

  const handleStartChat = (target: User) => {
    setFriends((prev) => (prev.some((f) => getUserId(f) === getUserId(target)) ? prev : [target, ...prev]));
    setSearchQuery('');
    openConversation(target);
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="bg-white flex-1 flex items-center justify-center p-4 min-h-[calc(100dvh-var(--header-height))]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-ink p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-baby text-primary flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy">Đăng Nhập Để Trò Chuyện</h2>
          <p className="text-xs text-muted">
            Bạn cần đăng nhập để kết nối và gửi tin nhắn trực tiếp đến bạn chơi và ban tổ chức giải đấu.
          </p>
          <a
            href="/login"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition shadow-sm"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  const activeFriendId = activeFriend?.id || (activeFriend as any)?._id;

  return (
    <div className="cm-chat bg-white flex-1 flex flex-col">
      <div className="page-container py-4 flex-1 flex flex-col min-h-0">
        
        {/* Chat Desktop Split-view container */}
        <div className="flex-1 min-h-0 min-w-0 bg-white rounded-3xl border border-ink shadow-md flex overflow-hidden">
          
          {/* Left Pane: Contacts & Search (350px width) */}
          <div className={`${mobileConversationOpen ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 min-h-0 min-w-0 md:border-r border-ink flex-col bg-white`}>
            
            {/* Header & Search */}
            <div className="p-4 border-b border-ink bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy">Tin nhắn & Hội thoại</h2>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={`w-2 h-2 rounded-full ${connected ? 'bg-primary' : 'bg-primary animate-pulse'}`} />
                  <span>{connected ? 'Trực tuyến' : 'Sẵn sàng'}</span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm BTC, bạn bè hoặc người chơi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-ink">
              {filteredFriends.length === 0 && otherUsers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-muted">
                  <div className="w-full h-full border-2 border-dashed border-ink rounded-2xl flex flex-col items-center justify-center bg-white p-6">
                    <MessageSquare className="w-10 h-10 mb-3 text-muted" />
                    <p className="text-sm font-medium text-muted text-center">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-xs text-center mt-1">Hãy bắt đầu nhắn tin để khởi động cuộc trò chuyện nhé!</p>
                  </div>
                </div>
              ) : (
                <>
                {filteredFriends.map((friend, index) => {
                const friendId = friend.id || (friend as any)._id;
                const isActive = activeFriendId === friendId;
                const unreadCount = unreadCountsMap[friendId] || 0;
                
                // Get display last message from map or fallback
                let displayLastMsg = `Tin nhắn mới đến ${friend.name}`;
                let displayTime = '';
                
                const friendLastMsg = lastMessagesMap[friendId];
                if (friendLastMsg) {
                  const sender = friendLastMsg.senderId === myId ? 'Bạn' : friend.name.split(' ')[0];
                  displayLastMsg = `${sender}: ${friendLastMsg.content}`;
                  displayTime = new Date(friendLastMsg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }

                return (
                  <button
                    key={`${friendId}-${index}`}
                    onClick={() => handleSelectFriend(friend)}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition relative ${
                      isActive ? 'bg-white' : 'hover:bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={friend.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-bold text-navy truncate block">
                          {friend.name}
                        </strong>
                        {displayTime && (
                          <span className="text-[10px] text-muted shrink-0 whitespace-nowrap">
                            {displayTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-[11px] truncate ${unreadCount > 0 ? 'text-primary font-bold' : (!friendLastMsg ? 'text-primary italic' : 'text-muted')}`}>
                          {displayLastMsg}
                        </p>
                        {unreadCount > 0 && (
                          <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

                {otherUsers.length > 0 && (
                  <div>
                    <p className="px-3.5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                      Người dùng khác
                    </p>
                    {otherUsers.map((u) => (
                      <button
                        key={`search-${getUserId(u)}`}
                        onClick={() => handleStartChat(u)}
                        className="w-full p-3.5 flex items-center gap-3 text-left transition hover:bg-white"
                      >
                        <img
                          src={u.avatarUrl || DEFAULT_AVATAR}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs font-bold text-navy truncate block">{u.name}</strong>
                          <p className="text-[11px] text-primary italic mt-0.5">Bắt đầu trò chuyện</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                </>
              )}
            </div>

          </div>

          {/* Right Pane: Active Chat Room */}
          {activeFriend ? (
            <div className={`${mobileConversationOpen ? 'flex' : 'hidden md:flex'} flex-1 min-h-0 min-w-0 flex-col bg-white`}>
              
              {/* Chat Room Top Bar */}
              <div className="p-3 sm:p-4 border-b border-ink flex items-center justify-between bg-white">
                <div className="flex min-w-0 items-center gap-3">
                  <button type="button" aria-label="Quay lại danh sách hội thoại" onClick={() => setMobileConversationOpen(false)} className="cm-button md:hidden shrink-0"><ArrowLeft size={18} aria-hidden="true" /></button>
                  <img
                    src={activeFriend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={activeFriend.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-navy text-sm truncate">{activeFriend.name}</h3>
                      {activeFriend.role === UserRole.ORGANIZER && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-tan text-primary">
                          BTC
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-primary font-medium">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              {/* Notification Banner when message arrives from another friend while chatting */}
              {newMessageBanner && newMessageBanner.senderId !== activeFriendId && (
                <div className="mx-4 mt-3 p-3 bg-canvas border border-ink rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
                    <div className="text-xs truncate">
                      <span className="font-bold text-navy">{newMessageBanner.senderName}: </span>
                      <span className="text-muted italic">&ldquo;{newMessageBanner.content}&rdquo;</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <button
                      onClick={() => {
                        const target = friends.find(item => (item.id || (item as any)._id) === newMessageBanner.senderId);
                        if (target) {
                          handleSelectFriend(target);
                        }
                      }}
                      className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition shadow-xs"
                    >
                      Trả lời ngay
                    </button>
                    <button
                      onClick={() => setNewMessageBanner(null)}
                      className="p-1 text-muted hover:text-muted rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div ref={messageStreamRef} className="cm-chat-stream flex-1 min-h-0 min-w-0 p-3 sm:p-6 overflow-y-auto space-y-4 bg-white">
                {messages.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-primary rounded-2xl mx-auto max-w-sm mt-4 shadow-sm">
                    <img
                      src={activeFriend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                      alt={activeFriend.name}
                      className="w-12 h-12 rounded-full object-cover filter grayscale"
                    />
                    <div className="text-sm font-semibold text-white">
                      Tin nhắn mới đến {activeFriend.name}
                    </div>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === myId;
                  const isLastMine = isMine && index === messages.length - 1;
                  const sentAt = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md border-2 border-ink px-4 py-2.5 rounded-2xl text-[15px] leading-snug whitespace-pre-wrap break-words ${
                          isMine
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-accent-baby text-ink rounded-bl-sm shadow-sm'
                        } ${msg.status === 'sending' ? 'opacity-70' : ''} ${msg.status === 'failed' ? 'ring-2 ring-primary' : ''}`}
                      >
                        {msg.content}
                      </div>

                      {/* Failed messages always show a retry; otherwise the last one shows sent/seen */}
                      {isMine && msg.status === 'failed' ? (
                        <button
                          type="button"
                          onClick={() => handleRetry(msg)}
                          className="mt-1 mr-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          Gửi lỗi · Thử lại
                        </button>
                      ) : isLastMine && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-muted font-medium mr-1">
                          <span>
                            {msg.status === 'sending'
                              ? 'Đang gửi...'
                              : `${sentAt} - ${msg.readAt ? 'Đã đọc' : 'Đã gửi'}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Message Input Bar */}
              <div className="p-4 border-t border-ink bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={(e) => setInputText(e.target.value)}
                    aria-label="Nội dung tin nhắn"
                    className="cm-control flex-1 min-w-0 px-4 py-2.5 text-sm bg-white border border-ink rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-navy transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    aria-label="Gửi tin nhắn"
                    className="cm-button h-12 w-12 shrink-0 rounded-2xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition disabled:opacity-40 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="hidden md:flex flex-1 min-w-0 flex-col items-center justify-center bg-white p-8">
              <div className="w-full max-w-md border-2 border-dashed border-ink rounded-3xl p-10 flex flex-col items-center justify-center bg-white shadow-sm">
                <div className="w-16 h-16 rounded-full bg-accent-baby flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-1 text-center">Chào mừng đến với Trò chuyện</h3>
                <p className="text-sm text-muted text-center">Hãy bắt đầu nhắn tin với Ban tổ chức để khởi động cuộc trò chuyện nhé!</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[calc(100vh-65px)]">Đang tải...</div>}>
      <ChatContent />
    </Suspense>
  );
}

