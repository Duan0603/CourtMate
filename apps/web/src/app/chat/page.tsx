'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquare, 
  Search, 
  Send, 
  CheckCheck, 
  ShieldCheck, 
  User as UserIcon, 
  Smile, 
  Paperclip, 
  Award,
  Circle,
  Bell,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { User, UserRole } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/auth.api';
import { getSocket } from '../../lib/socket';

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

function ChatContent() {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [connected, setConnected] = useState(false);
  const [lastSeenByFriend, setLastSeenByFriend] = useState<string | null>(null);
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, ChatMessage>>({});
  const [unreadCountsMap, setUnreadCountsMap] = useState<Record<string, number>>({});
  const [newMessageBanner, setNewMessageBanner] = useState<{ senderId: string; senderName: string; content: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use a ref to track activeFriend inside socket callbacks to avoid stale closures
  const activeFriendRef = useRef<User | null>(null);
  const myId = user?.id || (user as any)?._id || '';

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  const targetUserAvatar = searchParams.get('avatar');

  // Keep the ref in sync
  useEffect(() => {
    activeFriendRef.current = activeFriend;
  }, [activeFriend]);

  // Load chat partners / friends from API
  useEffect(() => {
    async function loadFriends() {
      try {
        let list: User[] = [];
        try {
          list = await authApi.getFriends();
        } catch (e) {
          console.warn('Could not fetch friends from API, using fallback:', e);
        }

        if (targetUserId && targetUserId !== myId) {
          const found = list.find((u) => u.id === targetUserId || (u as any)._id === targetUserId);
          if (found) {
            setFriends(list);
            setActiveFriend(found);
          } else {
            const parsedName = targetUserName && targetUserName !== 'null' ? targetUserName : 'Ban tổ chức';
            const mockTarget: User = {
              id: targetUserId,
              name: parsedName,
              email: '',
              role: UserRole.ORGANIZER,
              avatarUrl: targetUserAvatar || undefined,
            } as any;
            list = [mockTarget, ...list];
            setFriends(list);
            setActiveFriend(mockTarget);
          }
        } else {
          setFriends(list);
          if (list.length > 0 && !activeFriendRef.current) {
            setActiveFriend(list[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadFriends();
  }, [targetUserId, targetUserName, targetUserAvatar, myId]);

  // Helper to safely append a message without duplication
  const appendMessageSafely = useCallback((incoming: ChatMessage) => {
    setMessages((prev) => {
      // 1. Check if message already exists by ID
      if (prev.some(m => m._id === incoming._id)) return prev;

      // 2. Check if matching optimistic message (same sender + same content within 5 seconds)
      const matchingIdx = prev.findIndex(m =>
        m.senderId === incoming.senderId &&
        m.content === incoming.content &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(incoming.createdAt).getTime()) < 5000
      );

      if (matchingIdx !== -1) {
        const next = [...prev];
        next[matchingIdx] = incoming;
        return next;
      }

      return [...prev, incoming];
    });
  }, []);

  // Connect to Socket.IO — register once, use refs for activeFriend
  useEffect(() => {
    if (!myId) return;
    const socket = getSocket();

    const registerUser = () => {
      setConnected(true);
      socket.emit('register_user', { userId: myId });
    };

    if (socket.connected) {
      registerUser();
    } else {
      socket.on('connect', registerUser);
    }

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    // Chat history for the current room
    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history || []);
      const currentFriend = activeFriendRef.current;
      if (history && history.length > 0 && currentFriend) {
        const friendId = currentFriend.id || (currentFriend as any)._id;
        setLastMessagesMap(prev => ({
          ...prev,
          [friendId]: history[history.length - 1]
        }));
      }
      scrollToBottom();
    });

    // Receive message in the current room
    socket.on('receive_message', (incoming: ChatMessage) => {
      // Ignore if it's from me (sender already did optimistic update)
      if (incoming.senderId === myId) return;

      const currentFriend = activeFriendRef.current;
      const currentFriendId = currentFriend?.id || (currentFriend as any)?._id;
      
      // If we are currently chatting with this person
      if (currentFriend && (incoming.senderId === currentFriendId || (incoming as any).roomId?.includes(currentFriendId))) {
        appendMessageSafely(incoming);
        setLastMessagesMap(prev => ({
          ...prev,
          [currentFriendId]: incoming
        }));
        scrollToBottom();
      }
    });

    // Server confirmed our sent message — update temporary optimistic ID
    socket.on('message_ack', (savedMsg: ChatMessage) => {
      setMessages((prev) =>
        prev.map(m =>
          (m.senderId === myId && m.content === savedMsg.content && m._id.startsWith('msg-') && !m._id.includes('-' + savedMsg._id))
            ? { ...m, _id: savedMsg._id }
            : m
        )
      );
    });

    socket.on('message_seen', ({ userId, lastMessageId }: { userId: string; lastMessageId: string }) => {
      const currentFriend = activeFriendRef.current;
      if (currentFriend && (currentFriend.id === userId || (currentFriend as any)._id === userId)) {
        setLastSeenByFriend(lastMessageId);
      }
    });

    // Handle recent chats loading
    socket.on('recent_chats', (recentChats: any[]) => {
      setFriends(prev => {
        const newFriends = [...prev];
        recentChats.forEach(rc => {
          // NEVER add yourself as a chat partner
          if (rc.id === myId || (rc as any)._id === myId) return;
          if (!newFriends.find(f => f.id === rc.id || (f as any)._id === rc.id)) {
            newFriends.push(rc);
          }
        });
        
        setLastMessagesMap(prevMap => {
          const map = { ...prevMap };
          recentChats.forEach(rc => {
            if (rc.id === myId || (rc as any)._id === myId) return;
            if (rc.lastMessage) {
              map[rc.id] = rc.lastMessage;
            }
          });
          return map;
        });
        
        return newFriends;
      });
    });

    // Global notification when a new message arrives from any user
    socket.on('new_message_notification', (incoming: any) => {
      const senderId = incoming.senderId;
      
      // Ignore notifications from yourself
      if (senderId === myId) return;
      
      const currentFriend = activeFriendRef.current;
      const currentFriendId = currentFriend?.id || (currentFriend as any)?._id;

      // Update last messages map for the sidebar preview
      setLastMessagesMap(prev => ({
        ...prev,
        [senderId]: incoming
      }));

      // If sender is not in friends list, add them to sidebar; move them to top
      setFriends(prev => {
        const exists = prev.some(f => (f.id || (f as any)._id) === senderId);
        if (!exists) {
          return [{
            id: senderId,
            name: incoming.senderName || 'Người dùng mới',
            email: '',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            role: 'PLAYER' as any,
          } as any, ...prev];
        }
        const senderFriend = prev.find(f => (f.id || (f as any)._id) === senderId);
        const others = prev.filter(f => (f.id || (f as any)._id) !== senderId);
        return senderFriend ? [senderFriend, ...others] : prev;
      });

      // CASE 1: We are ALREADY looking at this sender's chat
      if (currentFriend && currentFriendId === senderId) {
        appendMessageSafely(incoming);
        scrollToBottom();
      } else {
        // CASE 2: Message from someone else (or no active chat)
        // 1. Increment unread count badge for this sender
        setUnreadCountsMap(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));

        // 2. Set new message banner on top of the chat area
        setNewMessageBanner({
          senderId,
          senderName: incoming.senderName || 'Người dùng',
          content: incoming.content,
        });

        // 3. Show rich interactive Toast popup
        toast.custom((t) => (
          <div
            onClick={() => {
              setFriends(currentList => {
                const target = currentList.find(f => (f.id || (f as any)._id) === senderId);
                if (target) {
                  setActiveFriend(target);
                  setUnreadCountsMap(p => ({ ...p, [senderId]: 0 }));
                  setNewMessageBanner(null);
                }
                return currentList;
              });
              toast.dismiss(t.id);
            }}
            className={`${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-300 max-w-sm w-full bg-white shadow-2xl rounded-2xl border border-primary/30 p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary hover:shadow-lg`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-navy truncate">{incoming.senderName || 'Tin nhắn mới'}</p>
                <span className="text-[10px] text-primary font-bold ml-2 shrink-0">Xem ngay</span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">{incoming.content}</p>
            </div>
          </div>
        ), { duration: 5000 });
      }
    });

    return () => {
      socket.off('connect', registerUser);
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('message_ack');
      socket.off('message_seen');
      socket.off('new_message_notification');
      socket.off('recent_chats');
    };
  }, [myId, appendMessageSafely]); // Only depend on myId, use activeFriendRef inside handlers

  // Join room when active friend changes
  useEffect(() => {
    if (!activeFriend || !myId) return;
    const friendId = activeFriend.id || (activeFriend as any)._id;
    
    // NEVER join a room with yourself
    if (friendId === myId) {
      setActiveFriend(null);
      return;
    }
    
    const roomId = [myId, friendId].sort().join('_');
    const socket = getSocket();

    socket.emit('join_room', { roomId });
    socket.emit('mark_seen', { roomId, userId: myId, lastMessageId: 'all' });
    setMessages([]);
    setLastSeenByFriend(null);
  }, [activeFriend, myId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSelectFriend = (friend: User) => {
    setActiveFriend(friend);
    const friendId = friend.id || (friend as any)._id;
    setUnreadCountsMap(prev => ({
      ...prev,
      [friendId]: 0,
    }));
    if (newMessageBanner?.senderId === friendId) {
      setNewMessageBanner(null);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeFriend) return;

    const friendId = activeFriend.id || (activeFriend as any)._id;
    const roomId = [myId, friendId].sort().join('_');
    const socket = getSocket();

    const newMsg: ChatMessage = {
      _id: `msg-${Date.now()}`,
      senderId: myId,
      senderName: user?.name || 'VĐV',
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update with double-submit guard
    setMessages((prev) => {
      const isDuplicate = prev.some(m =>
        m.senderId === myId &&
        m.content === newMsg.content &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 600
      );
      if (isDuplicate) return prev;
      return [...prev, newMsg];
    });
    setLastMessagesMap(prev => ({
      ...prev,
      [friendId]: newMsg
    }));

    socket.emit('send_message', {
      roomId,
      senderId: myId,
      senderName: user?.name || 'VĐV',
      receiverId: friendId,
      content: inputText.trim(),
    });

    setInputText('');
    scrollToBottom();
  };

  const filteredFriends = friends.filter((f) => {
    const fId = f.id || (f as any)._id;
    // Never show yourself in the contacts sidebar
    if (fId === myId) return false;
    return `${f.name} ${f.email}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated && !user) {
    return (
      <div className="bg-[#F8FAFC] flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-65px)]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy">Đăng Nhập Để Trò Chuyện</h2>
          <p className="text-xs text-slate-500">
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
    <div className="bg-[#F8FAFC] flex-1 flex flex-col h-[calc(100vh-65px)]">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
        
        {/* Chat Desktop Split-view container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-md flex overflow-hidden">
          
          {/* Left Pane: Contacts & Search (350px width) */}
          <div className="w-80 sm:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
            
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy">Tin nhắn & Hội thoại</h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <span>{connected ? 'Trực tuyến' : 'Sẵn sàng'}</span>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm BTC hoặc bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredFriends.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400">
                  <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 p-6">
                    <MessageSquare className="w-10 h-10 mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500 text-center">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-xs text-center mt-1">Hãy bắt đầu nhắn tin để khởi động cuộc trò chuyện nhé!</p>
                  </div>
                </div>
              ) : (
                filteredFriends.map((friend, index) => {
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
                      isActive ? 'bg-[#EFF4FF]' : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={friend.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-bold text-navy truncate block">
                          {friend.name}
                        </strong>
                        {displayTime && (
                          <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                            {displayTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-[11px] truncate ${unreadCount > 0 ? 'text-primary font-bold' : (!friendLastMsg ? 'text-primary/70 italic' : 'text-slate-500')}`}>
                          {displayLastMsg}
                        </p>
                        {unreadCount > 0 && (
                          <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              }))}
            </div>

          </div>

          {/* Right Pane: Active Chat Room */}
          {activeFriend ? (
            <div className="flex-1 flex flex-col bg-white">
              
              {/* Chat Room Top Bar */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={activeFriend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={activeFriend.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-navy text-sm">{activeFriend.name}</h3>
                      {activeFriend.role === UserRole.ORGANIZER && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          BTC
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">Đang hoạt động</span>
                  </div>
                </div>
              </div>

              {/* Notification Banner when message arrives from another friend while chatting */}
              {newMessageBanner && newMessageBanner.senderId !== activeFriendId && (
                <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                    <div className="text-xs truncate">
                      <span className="font-bold text-navy">{newMessageBanner.senderName}: </span>
                      <span className="text-slate-600 italic">&ldquo;{newMessageBanner.content}&rdquo;</span>
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
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                {messages.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-[#23272F] rounded-2xl mx-auto max-w-sm mt-4 shadow-sm">
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

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-[15px] leading-snug ${
                          isMine
                            ? 'bg-[#3B82F6] text-white rounded-br-sm'
                            : 'bg-[#303033] text-white rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Seen / Delivered receipt indicator */}
                      {isLastMine && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-medium mr-1">
                          {lastSeenByFriend ? (
                            <>
                              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - Đã đọc</span>
                            </>
                          ) : (
                            <>
                              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - Đã gửi</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Message Input Bar */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-navy transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 rounded-2xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition disabled:opacity-40 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
              <div className="w-full max-w-md border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-white shadow-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-1 text-center">Chào mừng đến với Trò chuyện</h3>
                <p className="text-sm text-slate-500 text-center">Hãy bắt đầu nhắn tin với Ban tổ chức để khởi động cuộc trò chuyện nhé!</p>
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

