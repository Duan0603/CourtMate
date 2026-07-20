import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, MessageCircle, Search, Send, UserRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { User } from '@courtmate/shared';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { authApi } from '../../src/features/auth/services/auth.api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const NAVY = '#00102F';
const BLUE = '#0077FF';
const YELLOW = '#FFC400';
const MUTED = '#52627A';
const BORDER = 'rgba(0,16,47,0.12)';

interface ChatMessage { _id: string; senderId: string; senderName: string; content: string; createdAt: string }

export default function ChatTab() {
  const { user, token, isAuthenticated } = useLogin();
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<User[]>([]);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef<ScrollView>(null);

  const loadFriends = useCallback(async (refresh = false) => {
    if (!token) return;
    refresh ? setRefreshing(true) : setLoading(true);
    try { setFriends(await authApi.getFriends(token)); } catch { setFriends([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { if (isAuthenticated) loadFriends(); }, [isAuthenticated, loadFriends]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const myId = user.id || (user as any)._id;
    const socket = io(API_URL, { transports: ['websocket'], forceNew: true });
    socketRef.current = socket;
    socket.on('connect', () => { setConnected(true); socket.emit('register_user', { userId: myId }); });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('chat_history', (history: ChatMessage[]) => { setMessages(history); setTimeout(() => messagesRef.current?.scrollToEnd({ animated: false }), 80); });
    socket.on('receive_message', (incoming: ChatMessage) => { setMessages(prev => [...prev, incoming]); setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 80); });
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    router.setParams({ chatting: activeFriend ? 'true' : undefined as any });
    if (!activeFriend || !connected || !user || !socketRef.current) return;
    const myId = user.id || (user as any)._id;
    const friendId = activeFriend.id || (activeFriend as any)._id;
    socketRef.current.emit('join_room', { roomId: [myId, friendId].sort().join('_') });
  }, [activeFriend, connected, user]);

  const sendMessage = () => {
    if (!message.trim() || !connected || !activeFriend || !user || !socketRef.current) return;
    const myId = user.id || (user as any)._id;
    const friendId = activeFriend.id || (activeFriend as any)._id;
    socketRef.current.emit('send_message', {
      roomId: [myId, friendId].sort().join('_'), senderId: myId,
      senderName: user.name || user.email.split('@')[0], receiverId: friendId, content: message.trim(),
    });
    setMessage('');
  };

  const visibleFriends = friends.filter(friend => `${friend.name} ${friend.email}`.toLowerCase().includes(query.toLowerCase()));

  if (!activeFriend) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text style={{ color: NAVY, fontSize: 28, lineHeight: 34, fontWeight: '600' }}>Cuộc trò chuyện</Text>
          {!!friends.length && (
            <View style={{ height: 48, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
              <Search color={MUTED} size={20} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Tìm người hoặc ban tổ chức" placeholderTextColor="#7B8AA3" style={{ flex: 1, color: NAVY, fontSize: 16, marginLeft: 10 }} />
            </View>
          )}
        </View>

        {loading ? <ActivityIndicator size="large" color={BLUE} style={{ marginTop: 64 }} /> : (
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFriends(true)} tintColor={BLUE} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {!visibleFriends.length ? (
              <View style={{ marginTop: 72, alignItems: 'center', paddingHorizontal: 24 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}><MessageCircle color={YELLOW} size={30} /></View>
                <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginTop: 24 }}>Chưa có cuộc trò chuyện</Text>
                <Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 8 }}>Khi bạn liên hệ với ban tổ chức, cuộc trò chuyện sẽ xuất hiện ở đây.</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginTop: 24 }}><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Khám phá giải đấu</Text></TouchableOpacity>
              </View>
            ) : (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' }}>
                {visibleFriends.map((friend, index) => {
                  const id = friend.id || (friend as any)._id;
                  const organizer = friend.role === 'ORGANIZER';
                  return (
                    <TouchableOpacity key={id} activeOpacity={0.75} onPress={() => setActiveFriend(friend)} style={{ minHeight: 76, padding: 12, flexDirection: 'row', alignItems: 'center', borderTopWidth: index ? 1 : 0, borderTopColor: BORDER, backgroundColor: index === 0 ? '#F1F6FD' : '#FFFFFF' }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}><UserRound color="#FFFFFF" size={22} /></View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }} numberOfLines={1}>{friend.name || friend.email.split('@')[0]}</Text>{organizer && <Award color={YELLOW} size={17} style={{ marginLeft: 6 }} />}</View>
                        <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }} numberOfLines={1}>{organizer ? 'Ban tổ chức · Nhấn để trò chuyện' : 'Vận động viên · Nhấn để trò chuyện'}</Text>
                      </View>
                      {index === 0 && <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: NAVY, fontSize: 14, fontWeight: '600' }}>1</Text></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  const friendId = activeFriend.id || (activeFriend as any)._id;
  const myId = user?.id || (user as any)?._id;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7FAFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top, backgroundColor: NAVY }}>
        <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity accessibilityLabel="Quay lại danh sách trò chuyện" onPress={() => setActiveFriend(null)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ArrowLeft color="#FFFFFF" size={24} /></TouchableOpacity>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}><UserRound color="#FFFFFF" size={20} /></View>
          <View style={{ flex: 1, marginLeft: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '600' }}>{activeFriend.name || activeFriend.email.split('@')[0]}</Text>{activeFriend.role === 'ORGANIZER' && <Award color={YELLOW} size={18} style={{ marginLeft: 6 }} />}</View><Text style={{ color: connected ? '#B8C7E0' : '#FFC4C0', fontSize: 14, lineHeight: 20 }}>{connected ? 'Đã kết nối' : 'Đang mất kết nối'}</Text></View>
        </View>
      </View>

      {!connected && <View style={{ backgroundColor: '#FFF2F1', paddingHorizontal: 16, paddingVertical: 8 }}><Text style={{ color: '#A62F27', fontSize: 14, lineHeight: 20 }}>Đang mất kết nối. Tin nhắn chưa thể gửi.</Text></View>}
      <ScrollView ref={messagesRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: messages.length ? 'flex-start' : 'center' }}>
        {!messages.length ? <Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>Bắt đầu cuộc trò chuyện với {activeFriend.name || 'người này'}.</Text> : messages.map(item => {
          const mine = item.senderId === myId;
          return <View key={item._id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%', backgroundColor: mine ? BLUE : '#FFFFFF', borderWidth: mine ? 0 : 1, borderColor: BORDER, borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}><Text style={{ color: mine ? '#FFFFFF' : NAVY, fontSize: 16, lineHeight: 24 }}>{item.content}</Text></View>;
        })}
      </ScrollView>
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8), backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER, flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput value={message} onChangeText={setMessage} placeholder="Nhập tin nhắn…" placeholderTextColor="#7B8AA3" multiline style={{ flex: 1, minHeight: 48, maxHeight: 112, borderRadius: 16, backgroundColor: '#F1F6FD', color: NAVY, fontSize: 16, paddingHorizontal: 16, paddingVertical: 12 }} />
        <TouchableOpacity accessibilityLabel="Gửi tin nhắn" disabled={!message.trim() || !connected} onPress={sendMessage} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: message.trim() && connected ? BLUE : '#B7C5D8', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}><Send color="#FFFFFF" size={21} /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
