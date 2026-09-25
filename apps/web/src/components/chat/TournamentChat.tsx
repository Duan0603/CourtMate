'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Minimize2, Maximize2 } from 'lucide-react';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import { Tournament } from '@courtmate/shared';

interface TournamentChatProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentChat: React.FC<TournamentChatProps> = ({
  tournament,
  isOpen,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const organizerId = tournament.organizer?.id || 'org-1';
  const organizerName = tournament.organizer?.name || 'Ban tổ chức';
  
  // Create a unique room for this user and this tournament's organizer
  const roomId = `chat_${tournament.id}_${user?.id || 'guest'}_${organizerId}`;

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user) return;

    const socket = getSocket();
    
    // Join room
    socket.emit('join_room', { roomId });

    // Listen for history
    socket.on('chat_history', (history: any[]) => {
      setMessages(history || []);
      scrollToBottom();
    });

    // Listen for new messages
    socket.on('receive_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, [isOpen, isAuthenticated, user, roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isAuthenticated || !user) return;

    const socket = getSocket();
    socket.emit('send_message', {
      roomId,
      senderId: user.id,
      senderName: user.name,
      receiverId: organizerId,
      content: inputValue,
    });

    setInputValue('');
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <span className="font-bold">Trò chuyện cùng BTC</span>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 text-center text-sm text-slate-500">
          Vui lòng đăng nhập để trò chuyện với Ban tổ chức.
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed right-6 z-50 bg-white shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${isMinimized ? 'bottom-6 w-72 rounded-t-2xl rounded-b-none' : 'bottom-6 w-80 sm:w-96 rounded-2xl h-[500px] max-h-[80vh] flex flex-col'}`}>
      {/* Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-primary to-primary-light text-white flex justify-between items-center shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{organizerName}</h4>
            <span className="text-[10px] text-white/80">Trực tuyến</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="hover:bg-white/20 p-1.5 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button className="hover:bg-white/20 p-1.5 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-[#1E1E1E] space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 mt-10">
                Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = user && msg.senderId === user.id;
                
                // Format time for mock status
                const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                
                return (
                  <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 max-w-[85%] text-[15px] leading-snug ${isMine ? 'bg-[#3B82F6] text-white rounded-2xl rounded-br-sm' : 'bg-[#303033] text-white rounded-2xl rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    {isMine && idx === messages.length - 1 && (
                      <span className="text-[11px] text-slate-500 mt-1 font-medium mr-1">
                        {time} - Delivered
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-[#1E1E1E] border-t border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 bg-[#303033] text-white border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-600 transition-all placeholder:text-slate-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
