'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  Circle
} from 'lucide-react';
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = user?.id || '';

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  const targetUserAvatar = searchParams.get('avatar');

  // Load chat partners / friends
  useEffect(() => {
    async function loadFriends() {
      try {
        // Clear mock data as requested, only show people we actually chat with
        let list: User[] = [];
        
        // If we have a target user ID from URL, make sure they are active
        if (targetUserId && targetUserId !== myId) {
          const found = list.find((u) => u.id === targetUserId || (u as any)._id === targetUserId);
          if (found) {
            setFriends(list);
            setActiveFriend(found);
          } else {
            // Inject the mock user from query params so we can chat with them
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
          if (list.length > 0 && !activeFriend) {
            setActiveFriend(list[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadFriends();
  }, [targetUserId, targetUserName, targetUserAvatar]);

  // Connect to Socket.IO
  useEffect(() => {
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

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
      if (history.length > 0 && activeFriend) {
        setLastMessagesMap(prev => ({
          ...prev,
          [activeFriend.id]: history[history.length - 1]
        }));
      }
      scrollToBottom();
    });

    socket.on('receive_message', (incoming: ChatMessage) => {
      // Only append if it's from someone else to prevent duplicates since we do optimistic updates
      if (incoming.senderId !== myId) {
        setMessages((prev) => [...prev, incoming]);
        if (activeFriend) {
          setLastMessagesMap(prev => ({
            ...prev,
            [activeFriend.id]: incoming
          }));
        }
        scrollToBottom();
      }
    });

    socket.on('message_seen', ({ userId, lastMessageId }: { userId: string; lastMessageId: string }) => {
      if (activeFriend && (activeFriend.id === userId || (activeFriend as any)._id === userId)) {
        setLastSeenByFriend(lastMessageId);
      }
    });

    // Handle recent chats loading
    socket.on('recent_chats', (recentChats: any[]) => {
      setFriends(prev => {
        // We only want to append recent chats if they aren't already in the list
        // (to preserve the target user injected from the tournament if they have no chat history)
        const newFriends = [...prev];
        recentChats.forEach(rc => {
          if (!newFriends.find(f => f.id === rc.id || (f as any)._id === rc.id)) {
            newFriends.push(rc);
          }
        });
        
        // Also update last messages map for these
        setLastMessagesMap(prevMap => {
          const map = { ...prevMap };
          recentChats.forEach(rc => {
            if (rc.lastMessage) {
              map[rc.id] = rc.lastMessage;
            }
          });
          return map;
        });
        
        return newFriends;
      });
    });

    // Handle global notifications when a new message arrives from any user
    socket.on('new_message_notification', (incoming: any) => {
      const senderId = incoming.senderId;
      
      // 1. Update last messages map
      setLastMessagesMap(prev => ({
        ...prev,
        [senderId]: incoming
      }));

      // 2. If sender is not in friends list, add them to sidebar dynamically
      setFriends(prev => {
        const exists = prev.some(f => f.id === senderId || (f as any)._id === senderId);
        if (!exists) {
          return [{
            id: senderId,
            name: incoming.senderName || 'Người dùng mới',
            email: '',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            role: 'PLAYER' as any,
          } as any, ...prev];
        }
        return prev;
      });
      
      // If we are currently chatting with this user but for some reason receive_message didn't catch it
      if (activeFriend && (activeFriend.id === senderId || (activeFriend as any)._id === senderId)) {
        setMessages(prev => {
          if (!prev.find(m => m._id === incoming._id)) {
            return [...prev, incoming];
          }
          return prev;
        });
        scrollToBottom();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('message_seen');
      socket.off('new_message_notification');
      socket.off('recent_chats');
    };
  }, [myId, activeFriend]);

  // Join room when active friend changes
  useEffect(() => {
    if (!activeFriend) return;
    const friendId = activeFriend.id || (activeFriend as any)._id;
    const roomId = [myId, friendId].sort().join('_');
    const socket = getSocket();

    socket.emit('join_room', { roomId });
    socket.emit('mark_seen', { roomId, userId: myId, lastMessageId: 'all' });
    setMessages([]);
    setLastSeenByFriend(null);
  }, [activeFriend, myId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
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
    setTimeout(scrollToBottom, 50);
  };

  const filteredFriends = friends.filter((f) =>
    `${f.name} ${f.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                // Fix mock data issue where multiple friends might have same ID
                const isActive = activeFriend?.id === friend.id && activeFriend?.name === friend.name;
                
                // Get display last message from map or fallback
                let displayLastMsg = `Tin nhắn mới đến ${friend.name}`;
                let displayTime = '';
                
                const friendLastMsg = lastMessagesMap[friend.id];
                if (friendLastMsg) {
                  const sender = friendLastMsg.senderId === myId ? 'Bạn' : friend.name.split(' ')[0];
                  displayLastMsg = `${sender}: ${friendLastMsg.content}`;
                  displayTime = new Date(friendLastMsg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }

                return (
                  <button
                    key={`${friend.id}-${index}`}
                    onClick={() => setActiveFriend(friend)}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition ${
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

                      <p className={`text-[11px] truncate mt-0.5 ${!friendLastMsg ? 'text-primary/70 italic' : 'text-slate-500'}`}>
                        {displayLastMsg}
                      </p>
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
