'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [connected, setConnected] = useState(false);
  const [lastSeenByFriend, setLastSeenByFriend] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = user?.id || '';

  // Load chat partners / friends
  useEffect(() => {
    async function loadFriends() {
      try {
        const list = await authApi.getFriends();
        setFriends(list);
        if (list.length > 0 && !activeFriend) {
          setActiveFriend(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadFriends();
  }, [activeFriend]);

  // Connect to Socket.IO
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('register_user', { userId: myId });
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on('receive_message', (incoming: ChatMessage) => {
      setMessages((prev) => [...prev, incoming]);
      scrollToBottom();
    });

    socket.on('message_seen', ({ userId, lastMessageId }: { userId: string; lastMessageId: string }) => {
      if (activeFriend && (activeFriend.id === userId || (activeFriend as any)._id === userId)) {
        setLastSeenByFriend(lastMessageId);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_history');
      socket.off('receive_message');
      socket.off('message_seen');
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
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có bạn bè hoặc ban tổ chức nào trong danh bạ.
                </div>
              ) : (
                filteredFriends.map((friend) => {
                const isActive = activeFriend?.id === friend.id;
                return (
                  <button
                    key={friend.id}
                    onClick={() => setActiveFriend(friend)}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition ${
                      isActive ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={friend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={friend.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-navy truncate block">
                          {friend.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">12:30</span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {friend.role === UserRole.ORGANIZER ? 'Ban tổ chức giải đấu' : 'Vận động viên'}
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
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === myId;
                  const isLastMine = isMine && index === messages.length - 1;

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white text-navy border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Seen receipt indicator */}
                      {isLastMine && lastSeenByFriend && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-medium">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Đã xem</span>
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageSquare className="w-12 h-12 mb-3" />
              <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
