import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, Text, Input, Button, ScrollView, Spinner, View } from 'tamagui';
import { Send, MessageSquare, ShieldAlert, ArrowLeft, User as UserIcon, Shield, Bell } from 'lucide-react-native';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { authApi } from '../../src/features/auth/services/auth.api';
import { User } from '@courtmate/shared';
import { io, Socket } from 'socket.io-client';
import { KeyboardAvoidingView, Platform, RefreshControl, Vibration, Animated } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface SocketMessage {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

import { useIsFocused } from '@react-navigation/native';
import gsap from 'gsap';

export default function ChatTab() {
  const { user, token, isAuthenticated } = useLogin();
  const isFocused = useIsFocused();
  const containerRef = useRef<any>(null);

  const [friends, setFriends] = useState<User[]>([]);
  const [activeFriend, setActiveFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isFocused]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const tabbar = document.querySelector('div[style*="height: 80px"]') || document.querySelector('div[role="tablist"]') || document.querySelector('nav');
      if (tabbar) {
        if (isFocused && activeFriend !== null) {
          gsap.to(tabbar, {
            opacity: 0,
            y: 80,
            duration: 0.25,
            display: 'none',
            overwrite: 'auto'
          });
        } else {
          gsap.to(tabbar, {
            opacity: 0.95,
            y: 0,
            duration: 0.25,
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            overwrite: 'auto'
          });
        }
      }
    }
    
    return () => {
      if (Platform.OS === 'web') {
        const tabbar = document.querySelector('div[style*="height: 80px"]') || document.querySelector('div[role="tablist"]') || document.querySelector('nav');
        if (tabbar) {
          gsap.set(tabbar, {
            opacity: 0.95,
            y: 0,
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          });
        }
      }
    };
  }, [activeFriend, isFocused]);

  // In-app Notification Banner State
  const [activeNotification, setActiveNotification] = useState<{ senderName: string; content: string } | null>(null);
  const bannerAnim = useRef(new Animated.Value(-150)).current; // Start offscreen (-150px)

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<any>(null);
  const notificationTimeoutRef = useRef<any>(null);

  // Load Friends list
  const loadFriends = async (refresh = false) => {
    if (!token) return;
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingFriends(true);
    }
    try {
      const data = await authApi.getFriends(token);
      setFriends(data);
    } catch (e) {
      console.error('[Chat] Failed to load friends:', e);
    } finally {
      setIsLoadingFriends(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadFriends();
    }
  }, [isAuthenticated, token]);

  // Persistent Socket Connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const myId = user.id || (user as any)._id;
    console.log(`[Chat] Connecting global socket at: ${API_URL}`);

    const socket = io(API_URL, {
      transports: ['websocket'],
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Chat] Socket connected, registering user:', myId);
      setIsConnected(true);
      socket.emit('register_user', { userId: myId });

      // If there is already an active friend on reconnect, join the room
      if (activeFriend) {
        const friendId = activeFriend.id || (activeFriend as any)._id;
        const roomId = [myId, friendId].sort().join('_');
        socket.emit('join_room', { roomId });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Chat] Socket disconnected');
      setIsConnected(false);
    });

    socket.on('chat_history', (history: SocketMessage[]) => {
      console.log(`[Chat] Loaded history: ${history.length} messages`);
      setMessages(history);
      setTimeout(scrollToBottom, 150);
    });

    socket.on('receive_message', (message: SocketMessage) => {
      console.log('[Chat] Received message in room:', message);
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    // Listen to global notifications
    socket.on('new_message_notification', (msg: SocketMessage) => {
      if (msg.senderId === myId) return;

      // Only notify if we are NOT currently chatting with the sender
      const isChattingWithSender = activeFriend && (activeFriend.id || (activeFriend as any)._id) === msg.senderId;
      if (!isChattingWithSender) {
        triggerNotificationBanner(msg.senderName, msg.content);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[Chat] Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      console.log('[Chat] Disconnecting socket...');
      socket.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  // Join Room when activeFriend changes
  useEffect(() => {
    if (!socketRef.current || !isConnected || !user) return;

    if (activeFriend) {
      const myId = user.id || (user as any)._id;
      const friendId = activeFriend.id || (activeFriend as any)._id;
      const roomId = [myId, friendId].sort().join('_');

      console.log(`[Chat] Joining room: ${roomId}`);
      socketRef.current.emit('join_room', { roomId });
    } else {
      setMessages([]);
    }
  }, [activeFriend, isConnected]);

  // Trigger Slide Down Notification Banner
  const triggerNotificationBanner = (senderName: string, content: string) => {
    setActiveNotification({ senderName, content });
    
    // Play short vibration feedback
    Vibration.vibrate(100);

    // Slide down animation (translateY: 0 is visible at top: 20)
    Animated.spring(bannerAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    // Reset timeout to auto-hide
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => {
      hideNotificationBanner();
    }, 4000);
  };

  const hideNotificationBanner = () => {
    Animated.timing(bannerAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveNotification(null);
    });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !isConnected || !user || !activeFriend) return;

    const myId = user.id || (user as any)._id;
    const friendId = activeFriend.id || (activeFriend as any)._id;
    const roomId = [myId, friendId].sort().join('_');

    const payload = {
      roomId,
      senderId: myId,
      senderName: user.name || user.email.split('@')[0],
      receiverId: friendId,
      content: inputText.trim(),
    };

    console.log('[Chat] Emitting send_message:', payload);
    socketRef.current.emit('send_message', payload);
    setInputText('');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'PLAYER': return 'Vận động viên';
      case 'ORGANIZER': return 'Nhà tổ chức';
      case 'REGIONAL_ADMIN': return 'Admin Vùng';
      case 'SUPER_ADMIN': return 'Super Admin';
      default: return 'Thành viên';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'REGIONAL_ADMIN':
        return '#059669'; // Emerald
      case 'ORGANIZER':
        return '#2563EB'; // Blue
      default:
        return '#476F62'; // Green Muted
    }
  };

  // Render Friend List Screen
  if (activeFriend === null) {
    return (
      <YStack f={1} bg="#fcf8fa" paddingTop="$8">
        
        {/* Sliding Notification Banner */}
        {activeNotification && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 20,
              left: 16,
              right: 16,
              zIndex: 9999,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              shadowColor: '#1d4ed8',
              shadowOpacity: 0.15,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5,
              borderWidth: 1.5,
              borderColor: 'rgba(29, 78, 216, 0.15)',
              transform: [{ translateY: bannerAnim }],
            }}
          >
            <XStack gap="$3" ai="center">
              <View w={36} h={36} br={18} bg="rgba(29, 78, 216, 0.1)" jc="center" ai="center">
                <Bell color="#1d4ed8" size={18} />
              </View>
              <YStack f={1}>
                <Text color="#1e293b" fos={14} fow="800">{activeNotification.senderName}</Text>
                <Text color="#45464d" fos={13} numberOfLines={1} mt="$0.5">{activeNotification.content}</Text>
              </YStack>
              <Button size="$2.5" bg="#1d4ed8" color="#FFFFFF" br={12} onPress={() => {
                const found = friends.find(f => (f.name || f.email.split('@')[0]) === activeNotification.senderName);
                if (found) {
                  setActiveFriend(found);
                  hideNotificationBanner();
                }
              }}>
                Xem
              </Button>
            </XStack>
          </Animated.View>
        )}

        {/* Header */}
        <XStack px="$5" py="$4" bg="#FFFFFF" borderBottomWidth={1} borderBottomColor="rgba(29, 78, 216, 0.08)" ai="center" jc="space-between">
          <YStack>
            <Text color="#1e293b" fos={20} fow="800">Đoạn chat</Text>
          </YStack>
          <MessageSquare color="#1d4ed8" size={24} />
        </XStack>

        {isLoadingFriends ? (
          <YStack f={1} jc="center" ai="center" gap="$3">
            <Spinner size="large" color="#1d4ed8" />
            <Text color="#45464d" fos={14}>Đang tải đoạn chat...</Text>
          </YStack>
        ) : (
          <ScrollView 
            f={1} 
            p="$4"
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadFriends(true)} />}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {friends.length === 0 ? (
              <YStack ai="center" jc="center" py="$10" gap="$3" opacity={0.6}>
                <UserIcon color="#7c747a" size={48} />
                <Text color="#45464d" fos={15} ta="center">Chưa có cuộc hội thoại nào.</Text>
              </YStack>
            ) : (
              friends.map((friend) => {
                const friendId = friend.id || (friend as any)._id;
                const roleLabel = getRoleLabel(friend.role);
                const roleColor = getRoleColor(friend.role);
                
                return (
                  <XStack 
                    key={friendId} 
                    p="$4" 
                    bg="#FFFFFF" 
                    br={16} 
                    ai="center" 
                    jc="space-between"
                    borderWidth={1}
                    borderColor="rgba(29, 78, 216, 0.08)"
                    style={{
                      shadowColor: '#1d4ed8',
                      shadowOpacity: 0.03,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 1,
                    }}
                    onPress={() => setActiveFriend(friend)}
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <XStack ai="center" gap="$3">
                      <YStack w={48} h={48} br={24} bg="rgba(29, 78, 216, 0.1)" jc="center" ai="center" borderWidth={1} borderColor="rgba(29, 78, 216, 0.2)">
                        {friend.role === 'SUPER_ADMIN' || friend.role === 'REGIONAL_ADMIN' ? (
                          <Shield color="#1d4ed8" size={22} />
                        ) : (
                          <UserIcon color="#1d4ed8" size={22} />
                        )}
                      </YStack>
                      
                      <YStack>
                        <Text color="#1e293b" fos={16} fow="800">
                          {friend.name || friend.email.split('@')[0]}
                        </Text>
                        <Text color={roleColor} fos={12} fow="600" mt="$0.5">
                          {roleLabel}
                        </Text>
                      </YStack>
                    </XStack>
                  </XStack>
                );
              })
            )}
          </ScrollView>
        )}
      </YStack>
    );
  }

  // Render Private Chat Room Screen
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <YStack f={1} bg="#fcf8fa" paddingTop="$8">
        
        {/* Sliding Notification Banner inside Room (for other conversations) */}
        {activeNotification && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 20,
              left: 16,
              right: 16,
              zIndex: 9999,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              shadowColor: '#1d4ed8',
              shadowOpacity: 0.15,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5,
              borderWidth: 1.5,
              borderColor: 'rgba(29, 78, 216, 0.15)',
              transform: [{ translateY: bannerAnim }],
            }}
          >
            <XStack gap="$3" ai="center">
              <View w={36} h={36} br={18} bg="rgba(29, 78, 216, 0.1)" jc="center" ai="center">
                <Bell color="#1d4ed8" size={18} />
              </View>
              <YStack f={1}>
                <Text color="#1e293b" fos={14} fow="800">{activeNotification.senderName}</Text>
                <Text color="#45464d" fos={13} numberOfLines={1} mt="$0.5">{activeNotification.content}</Text>
              </YStack>
              <Button size="$2.5" bg="#1d4ed8" color="#FFFFFF" br={12} onPress={() => {
                const found = friends.find(f => (f.name || f.email.split('@')[0]) === activeNotification.senderName);
                if (found) {
                  setActiveFriend(found);
                  hideNotificationBanner();
                }
              }}>
                Xem
              </Button>
            </XStack>
          </Animated.View>
        )}

        {/* Header */}
        <XStack px="$4" py="$3" bg="#FFFFFF" borderBottomWidth={1} borderBottomColor="rgba(29, 78, 216, 0.08)" ai="center" gap="$3">
          <Button 
            circular 
            size="$3.5" 
            chromeless 
            onPress={() => setActiveFriend(null)} 
            icon={<ArrowLeft color="#1e293b" size={20} />} 
          />
          <YStack f={1}>
            <Text color="#1e293b" fos={16} fow="700" numberOfLines={1}>
              {activeFriend.name || activeFriend.email.split('@')[0]}
            </Text>
            <XStack ai="center" gap="$1.5" mt="$0.5">
              <View w={8} h={8} br={4} bg={isConnected ? '#10B981' : '#EF4444'} />
              <Text color="#45464d" fos={11}>
                {getRoleLabel(activeFriend.role)}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Connection Offline Banner */}
        {!isConnected && (
          <XStack bg="rgba(239, 68, 68, 0.06)" p="$2" borderBottomWidth={1} borderBottomColor="rgba(239, 68, 68, 0.12)" ai="center" jc="center" gap="$2">
            <ShieldAlert color="#EF4444" size={14} />
            <Text color="#EF4444" fos={11} fow="600">
              Mất kết nối server. Tin nhắn không thể gửi trực tiếp.
            </Text>
          </XStack>
        )}

        {/* Message List */}
        <ScrollView 
          ref={scrollViewRef}
          f={1} 
          px="$4" 
          py="$3" 
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.length === 0 ? (
            <YStack ai="center" jc="center" py="$10" gap="$2" opacity={0.6}>
              <MessageSquare color="#7c747a" size={40} />
              <Text color="#45464d" fos={13} ta="center">Gửi tin nhắn để bắt đầu cuộc trò chuyện!</Text>
            </YStack>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === (user?.id || (user as any)?._id);
              const isLast = msg === messages[messages.length - 1];
              return (
                <YStack key={msg._id || Math.random().toString()} ai={isMe ? 'flex-end' : 'flex-start'} w="100%">
                  <View 
                    bg={isMe ? '#1d4ed8' : '#FFFFFF'} 
                    p="$3" 
                    br={18} 
                    borderBottomLeftRadius={isMe ? 18 : 4}
                    borderBottomRightRadius={isMe ? 4 : 18}
                    maxWidth="75%"
                    style={{
                      shadowColor: '#000',
                      shadowOpacity: 0.02,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 1,
                    }}
                  >
                    <Text color={isMe ? '#FFFFFF' : '#1e293b'} fos={14} lh={20}>
                      {msg.content}
                    </Text>
                  </View>
                  {isMe && isLast && (
                    <XStack mt="$1" ai="center" gap="$1" opacity={0.7} px="$1">
                      <Text color="#7c747a" fos={10} fow="600">Đã xem</Text>
                    </XStack>
                  )}
                </YStack>
              );
            })
          )}
        </ScrollView>

        {/* Input Bar */}
        <XStack p="$4" bg="#FFFFFF" borderTopWidth={1} borderTopColor="rgba(29, 78, 216, 0.08)" gap="$3" ai="center">
          <Input
            flex={1}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isConnected ? "Nhập tin nhắn..." : "Mất kết nối server..."}
            placeholderTextColor="#7c747a"
            color="#1e293b"
            bg="#f0edef"
            h={48}
            br={24}
            px="$4"
            borderWidth={0}
            focusStyle={{ borderColor: '#1d4ed8', borderWidth: 1, bg: '#FFFFFF' }}
            disabled={!isConnected}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <Button
            circular
            w={48}
            h={48}
            bg="#1d4ed8"
            onPress={handleSendMessage}
            pressStyle={{ scale: 0.95 }}
            disabled={!inputText.trim() || !isConnected}
            disabledStyle={{ bg: '#7c747a', opacity: 0.8 }}
            icon={<Send color="#FFFFFF" size={18} />}
          />
        </XStack>

      </YStack>
    </KeyboardAvoidingView>
  );
}
