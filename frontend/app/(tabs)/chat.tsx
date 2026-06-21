import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Image, 
  Modal, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  MessageSquare, 
  Send, 
  MapPin, 
  Map, 
  X, 
  Compass, 
  QrCode, 
  PhoneCall, 
  Check,
  Info
} from 'lucide-react-native';
import { useMockData } from '@/hooks/useMockData';
import { ChatChannel, UserMatch, SportType } from '@/types';

export default function ChatScreen() {
  const { 
    venues,
    userMatches, 
    activeConversations, 
    sendChatMessage,
    triggerMockIncomingMessage 
  } = useMockData();

  const [activeTab, setActiveTab] = useState<'schedule' | 'chat'>('schedule');
  const [selectedChat, setSelectedChat] = useState<ChatChannel | null>(null);
  const [inputText, setInputText] = useState('');
  
  // Modals / Overlay states
  const [selectedTicketMatch, setSelectedTicketMatch] = useState<UserMatch | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (selectedChat) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedChat, selectedChat?.messages.length]);

  const handleTabChange = (tab: 'schedule' | 'chat') => {
    setActiveTab(tab);
  };

  const handleOpenChat = (chat: ChatChannel) => {
    setSelectedChat(chat);
  };

  const handleBackToChatList = () => {
    setSelectedChat(null);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;
    sendChatMessage(selectedChat.id, inputText);
    setInputText('');
  };

  const handleCallHost = (hostName: string) => {
    Alert.alert('Gọi điện', `Đang kết nối cuộc gọi đến tiếp tân/trưởng nhóm: ${hostName}...`);
  };

  const getSportEmoji = (sport: SportType) => {
    switch (sport) {
      case 'badminton': return '🏸';
      case 'soccer': return '⚽';
      case 'basketball': return '🏀';
      case 'tennis': return '🎾';
      case 'tabletennis': return '🏓';
    }
  };

  const getSportLabel = (sport: SportType) => {
    switch (sport) {
      case 'badminton': return 'Cầu lông';
      case 'soccer': return 'Bóng đá';
      case 'basketball': return 'Bóng rổ';
      case 'tennis': return 'Tennis';
      case 'tabletennis': return 'Bóng bàn';
    }
  };

  // Find dynamic chat matching the selectedChat ID to get up-to-date messages
  const currentChat = selectedChat 
    ? activeConversations.find(c => c.id === selectedChat.id) || selectedChat 
    : null;

  const matchedVenue = useMemo(() => {
    if (!currentChat) return null;
    return venues.find(v => v.name === currentChat.venueNameList || currentChat.title.includes(v.name));
  }, [currentChat, venues]);

  const matchedUserMatch = useMemo(() => {
    if (!currentChat) return null;
    return userMatches.find(m => m.venueName === (matchedVenue?.name || currentChat.venueNameList));
  }, [currentChat, userMatches, matchedVenue]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      
      {/* 1. ACTIVE CONVERSATION SCREEN (Detail view when a channel is selected) */}
      {currentChat ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-background"
        >
          {/* Active chat header with Quick commands */}
          <View className="flex-shrink-0 bg-secondary/80 border-b border-borderGray p-3 flex-col gap-2.5">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={handleBackToChatList}
                className="py-1 px-2"
                activeOpacity={0.7}
              >
                <Text className="text-xs text-accent font-semibold">◀ Trở lại</Text>
              </TouchableOpacity>
              
              <View className="flex-1 px-4 items-center">
                <Text className="text-xs font-black text-white text-center truncate max-w-[170px]" numberOfLines={1}>
                  {currentChat.title}
                </Text>
                <Text className="text-[10px] text-textGray text-center truncate max-w-[170px] mt-0.5" numberOfLines={1}>
                  {getSportLabel(currentChat.sport)}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleCallHost(currentChat.title.includes('Đặt Sân') ? 'Tiếp tân đại lý' : 'Trưởng nhóm kèo')}
                className="w-8 h-8 rounded-full bg-background border border-borderGray items-center justify-center"
                activeOpacity={0.7}
              >
                <PhoneCall size={14} color="#39FF14" />
              </TouchableOpacity>
            </View>

            {/* ERGONOMICS: TWO FLOATING QUICK ACTION BUTTONS */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowLocationModal(true)}
                className="flex-1 bg-background border border-borderGray py-2 rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
                activeOpacity={0.8}
              >
                <Map size={12} color="#39FF14" />
                <Text className="text-white text-[10px] font-bold">Vị trí đồng đội</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowVenueModal(true)}
                className="flex-1 bg-background border border-borderGray py-2 rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
                activeOpacity={0.8}
              >
                <MapPin size={12} color="#39FF14" />
                <Text className="text-white text-[10px] font-bold">Thông tin sân đặt</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message bubble stream */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 bg-[#0a0d14] px-4"
            contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="self-center my-2 bg-background border border-borderGray px-3 py-1 rounded-full">
              <Text className="text-[9px] text-textGray text-center">
                🛡️ Chat bảo mật được kích hoạt khi ghép kèo thành công
              </Text>
            </View>

            {currentChat.messages.map((message) => (
              <View 
                key={message.id}
                className={`flex-row gap-2.5 max-w-[85%] ${message.isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!message.isMe && (
                  <Image 
                    source={{ uri: message.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60" }} 
                    className="w-8 h-8 rounded-full border border-borderGray object-cover"
                  />
                )}
                <View className="flex-col">
                  {!message.isMe && (
                    <Text className="text-[9px] text-textGray mb-0.5 pl-1 font-bold">{message.sender}</Text>
                  )}
                  <View className={`p-3 rounded-2xl shadow-sm ${
                    message.isMe 
                      ? 'bg-accent rounded-tr-none' 
                      : 'bg-secondary border border-borderGray rounded-tl-none'
                  }`}>
                    <Text className={`text-xs leading-normal font-medium ${message.isMe ? 'text-black' : 'text-white'}`}>
                      {message.text}
                    </Text>
                  </View>
                  <Text className={`text-[8px] text-textGray mt-1 pl-1 ${message.isMe ? 'text-right pr-1' : ''}`}>
                    {message.timestamp}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Simulation Tool Trigger Button */}
          <View className="bg-[#0a0d14] py-1 items-center">
            <TouchableOpacity 
              className="bg-accent/10 border border-accent/25 rounded-full py-1.5 px-4 active:scale-95" 
              onPress={triggerMockIncomingMessage}
              activeOpacity={0.7}
            >
              <Text className="text-accent text-[9px] font-bold">⚡ GIẢ LẬP TIN NHẮN ĐẾN</Text>
            </TouchableOpacity>
          </View>

          {/* Messaging bottom keyboard input */}
          <View className="flex-shrink-0 bg-secondary border-t border-borderGray px-3 py-2 flex-row gap-2 items-center pb-8">
            <TextInput
              placeholder="Nhập nội dung tin nhắn..."
              placeholderTextColor="#8E8E93"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              className="flex-1 bg-background border border-borderGray rounded-2xl px-4 py-2.5 text-xs text-white"
              keyboardAppearance="dark"
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-2xl items-center justify-center ${inputText.trim() ? 'bg-accent' : 'bg-background border border-borderGray'}`}
              activeOpacity={0.8}
            >
              <Send size={16} color={inputText.trim() ? '#000000' : '#8E8E93'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* 2. MAIN LIST SCREEN (When no channel is selected) */
        <View className="flex-1">
          {/* Double Segmented Control Header */}
          <View className="flex-shrink-0 bg-secondary/60 p-3 border-b border-borderGray">
            <View className="flex-row bg-background p-1 rounded-xl border border-borderGray">
              <TouchableOpacity
                onPress={() => handleTabChange('schedule')}
                className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 active:scale-95 ${
                  activeTab === 'schedule'
                    ? 'bg-accent'
                    : 'bg-transparent'
                }`}
                activeOpacity={0.8}
              >
                <Calendar size={12} color={activeTab === 'schedule' ? '#000000' : '#8E8E93'} />
                <Text className={`text-xs font-bold ${
                  activeTab === 'schedule' ? 'text-black' : 'text-textGray'
                }`}>
                  Lịch hẹn của tôi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTabChange('chat')}
                className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 active:scale-95 relative ${
                  activeTab === 'chat'
                    ? 'bg-accent'
                    : 'bg-transparent'
                }`}
                activeOpacity={0.8}
              >
                <MessageSquare size={12} color={activeTab === 'chat' ? '#000000' : '#8E8E93'} />
                <Text className={`text-xs font-bold ${
                  activeTab === 'chat' ? 'text-black' : 'text-textGray'
                }`}>
                  Hộp thư Chat
                </Text>
                {activeConversations.some(c => c.unread) && (
                  <View className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-destructive" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* TAB CONTENT 1: Lịch Hẹn */}
          {activeTab === 'schedule' && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[10px] text-textGray uppercase font-black tracking-widest">
                  Lịch hẹn sắp đấu ({userMatches.length})
                </Text>
              </View>

              {userMatches.length > 0 ? (
                userMatches.map((match) => (
                  <View 
                    key={match.id}
                    className="bg-secondary border border-borderGray rounded-2xl p-4 mb-4 relative overflow-hidden"
                  >
                    {/* Background radial highlight */}
                    <View className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />

                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl p-1 bg-background rounded-lg">{getSportEmoji(match.sport)}</Text>
                        <View>
                          <Text className="text-xs font-black text-white">{getSportLabel(match.sport)}</Text>
                          <Text className="text-[8px] bg-background text-textGray border border-borderGray px-1.5 py-0.5 rounded font-bold uppercase mt-1 self-start">
                            {match.type === 'matchmaking' ? 'Ghép Đồng Đội' : 'Đại Lý Đặt Sân'}
                          </Text>
                        </View>
                      </View>

                      <View className="bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                        <Text className="text-[9px] font-bold text-accent uppercase">Sắp diễn ra</Text>
                      </View>
                    </View>

                    {/* Court Details */}
                    <View className="space-y-1.5 text-xs text-white">
                      <View className="flex-row items-start gap-1.5 mb-1">
                        <MapPin size={14} color="#39FF14" className="mt-0.5" />
                        <Text className="font-semibold text-white leading-snug flex-1">{match.venueName}</Text>
                      </View>
                      <Text className="text-[10px] text-textGray pl-5">{match.address}</Text>
                      <View className="flex-row items-center gap-1.5 pl-5 mt-1">
                        <Calendar size={12} color="#8E8E93" />
                        <Text className="text-[11px] font-medium text-white">{match.timeSlot}</Text>
                      </View>
                    </View>

                    {/* Match Action elements */}
                    <View className="pt-3 border-t border-background flex-row justify-between items-center mt-3">
                      <View className="flex-row -space-x-1.5 overflow-hidden">
                        <Image className="inline-block h-5 w-5 rounded-full border border-background object-cover" source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60" }} />
                        <Image className="inline-block h-5 w-5 rounded-full border border-background object-cover" source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=60" }} />
                        <Image className="inline-block h-5 w-5 rounded-full border border-background object-cover" source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60" }} />
                        <View className="h-5 w-5 rounded-full bg-background items-center justify-center border border-borderGray">
                          <Text className="text-accent text-[8px] font-bold">+{match.playersCount}</Text>
                        </View>
                      </View>

                      <View className="flex-row gap-1.5">
                        <TouchableOpacity
                          onPress={() => setSelectedTicketMatch(match)}
                          className="bg-background border border-borderGray py-1.5 px-3 rounded-xl flex-row items-center gap-1 active:scale-95"
                          activeOpacity={0.8}
                        >
                          <QrCode size={12} color="#FFFFFF" />
                          <Text className="text-white text-[10px] font-bold">Vé vào sân</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => { 
                            const targetChat = activeConversations.find(c => c.sport === match.sport) || activeConversations[0];
                            handleOpenChat(targetChat);
                          }}
                          className="bg-accent py-1.5 px-3 rounded-xl flex-row items-center gap-1 active:scale-95"
                          activeOpacity={0.8}
                        >
                          <Text className="text-black text-[10px] font-bold">Vào Chat</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="text-center py-10 border border-dashed border-borderGray rounded-2xl items-center mt-4">
                  <Text className="text-2xl mb-2">📅</Text>
                  <Text className="text-xs text-white font-bold">Bạn chưa có lịch hẹn thể thao nào.</Text>
                  <Text className="text-[10px] text-textGray mt-1">Hãy ra Trang chủ ghép kèo hoặc Đặt Sân nhé!</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* TAB CONTENT 2: Hộp Thư Chat */}
          {activeTab === 'chat' && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <View className="p-4 py-2 border-b border-background">
                <Text className="text-[10px] text-textGray uppercase font-black tracking-widest">
                  Hộp thư nhóm ({activeConversations.length})
                </Text>
              </View>

              <View className="divide-y divide-[#121212]">
                {activeConversations.map((chat) => (
                  <TouchableOpacity 
                    key={chat.id}
                    onPress={() => handleOpenChat(chat)}
                    className={`flex-row gap-3 p-4 items-center active:bg-secondary/40 ${chat.unread ? 'bg-accent/[0.01]' : 'bg-secondary/20'}`}
                    activeOpacity={0.8}
                  >
                    {/* Custom avatar badge mapping */}
                    <View className="relative flex-shrink-0">
                      <View className="w-12 h-12 rounded-2xl bg-secondary border border-borderGray items-center justify-center relative">
                        <Text className="text-xl">{getSportEmoji(chat.sport)}</Text>
                        <View className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                          <View className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <View className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-secondary" />
                        </View>
                      </View>
                    </View>

                    <View className="flex-1 min-w-0">
                      <View className="flex-row justify-between items-center mb-0.5">
                        <Text className={`text-xs truncate ${chat.unread ? 'font-bold text-white' : 'font-semibold text-white/95'}`} numberOfLines={1}>
                          {chat.title}
                        </Text>
                        <Text className="text-[10px] text-textGray">{chat.time}</Text>
                      </View>
                      <Text className="text-[11px] text-textGray truncate" numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                    </View>

                    {chat.unread && (
                      <View className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* 3. TICKET QR MODAL POPUP */}
      <Modal
        visible={selectedTicketMatch !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedTicketMatch(null)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View className="w-full max-w-[320px] bg-secondary border border-borderGray rounded-3xl overflow-hidden">
            {/* Ticket Header */}
            <View className="flex-row justify-between items-center bg-background py-3.5 px-5 border-b border-borderGray">
              <Text className="text-white text-xs font-bold tracking-wider">VÉ CHECK-IN VÀO SÂN</Text>
              <TouchableOpacity onPress={() => setSelectedTicketMatch(null)} className="p-1">
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Ticket Info */}
            {selectedTicketMatch && (
              <View className="p-5">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white text-xs font-bold">
                    {getSportEmoji(selectedTicketMatch.sport)} {getSportLabel(selectedTicketMatch.sport)}
                  </Text>
                  <View className="bg-accent/10 border border-accent/20 py-0.5 px-2 rounded-md">
                    <Text className="text-accent text-[8px] font-bold">
                      {selectedTicketMatch.type === 'booking' ? 'ĐẠI LÝ ĐẶT SÂN' : 'GHÉP ĐỒNG ĐỘI'}
                    </Text>
                  </View>
                </View>

                <Text className="text-white text-base font-bold mb-3">{selectedTicketMatch.venueName}</Text>
                
                <View className="mb-2">
                  <Text className="text-[9px] text-textGray font-bold tracking-wider uppercase">KHUNG GIỜ:</Text>
                  <Text className="text-white text-xs font-medium mt-1">{selectedTicketMatch.timeSlot}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-[9px] text-textGray font-bold tracking-wider uppercase">ĐỊA CHỈ:</Text>
                  <Text className="text-white text-xs font-medium mt-1 leading-4" numberOfLines={2}>
                    {selectedTicketMatch.address}
                  </Text>
                </View>

                {/* Mock QR Area */}
                <View className="align-center items-center py-4 border-y border-borderGray border-dashed mb-3">
                  <View className="p-3 bg-white rounded-2xl shadow-xl">
                    <View className="w-[130px] h-[130px] bg-white items-center justify-center relative">
                      {/* Corners */}
                      <View className="absolute top-0 left-0 w-7 h-7 border-t-8 border-l-8 border-black" />
                      <View className="absolute top-0 right-0 w-7 h-7 border-t-8 border-r-8 border-black" />
                      <View className="absolute bottom-0 left-0 w-7 h-7 border-b-8 border-l-8 border-black" />
                      <View className="absolute bottom-0 right-0 w-7 h-7 border-b-8 border-r-8 border-black" />
                      
                      {/* Center block */}
                      <View className="w-12 h-12 border-4 border-black rounded" />
                      
                      {/* Brand Label inside QR */}
                      <Text className="absolute bottom-2 text-[9px] font-black text-black tracking-widest uppercase">
                        CourtMate
                      </Text>
                    </View>
                  </View>
                  <Text className="text-textGray text-[9px] text-center mt-3">
                    Đưa mã này cho tiếp tân tại quầy check-in
                  </Text>
                </View>

                <View className="flex-row items-center justify-center gap-1.5">
                  <Info size={12} color="#8E8E93" />
                  <Text className="text-textGray text-[10px]">Vui lòng có mặt đúng giờ quy định trên vé.</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 4. POPOVER OVERLAY 1: Xem vị trí bạn chơi (Modal) */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View className="flex-1 bg-black/85 justify-center items-center p-4">
          <View className="w-full max-w-[300px] bg-secondary border border-borderGray rounded-3xl p-5 overflow-hidden">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-1.5">
                <Compass size={14} color="#39FF14" className="animate-pulse" />
                <Text className="text-white text-xs font-bold uppercase">Vị trí thực tế</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLocationModal(false)} className="p-1">
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {currentChat?.title.includes('Đặt Sân') ? (
              <>
                {/* Simulated Map for Venue */}
                <View className="h-44 bg-background border border-borderGray rounded-xl relative overflow-hidden mb-3">
                  <View className="absolute inset-0 opacity-10 bg-[radial-gradient(#ccff00_1px,transparent_1px)]" style={{ backgroundSize: '12px 12px' } as any} />
                  
                  {/* Me central position */}
                  <View className="absolute top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 items-center">
                    <View className="relative">
                      <View className="absolute -inset-2 bg-sky-400/20 rounded-full animate-ping" />
                      <View className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-background" />
                    </View>
                    <Text className="text-[7px] text-white bg-slate-900 border border-slate-800 px-1 py-0.2 rounded mt-0.5 font-bold">Bạn</Text>
                  </View>

                  {/* Venue location pin */}
                  <View className="absolute top-[35%] left-[70%] items-center">
                    <View className="w-6 h-6 rounded-full bg-accent items-center justify-center border border-black shadow-lg">
                      <Text className="text-xs">🏟️</Text>
                    </View>
                    <Text className="text-[7px] bg-background border border-borderGray px-1 py-0.2 rounded text-white mt-0.5 font-bold">
                      {matchedVenue?.name.substring(0, 15) || 'Sân Cầu Lông'}... ({matchedVenue?.distance || '0.8'}km)
                    </Text>
                  </View>
                </View>
                <Text className="text-[10px] text-textGray leading-4 text-center">
                  Vị trí của bạn so với sân đặt. Khoảng cách địa lý thực tế là {matchedVenue?.distance || '0.8'} km. Đường đi thuận tiện qua Google Maps.
                </Text>
              </>
            ) : (
              <>
                {/* Simulated Map for Matchmaking Group */}
                <View className="h-44 bg-background border border-borderGray rounded-xl relative overflow-hidden mb-3">
                  <View className="absolute inset-0 opacity-10 bg-[radial-gradient(#ccff00_1px,transparent_1px)]" style={{ backgroundSize: '12px 12px' } as any} />
                  
                  {/* Me central position */}
                  <View className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 items-center">
                    <View className="relative">
                      <View className="absolute -inset-2 bg-sky-400/20 rounded-full animate-ping" />
                      <View className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-background" />
                    </View>
                    <Text className="text-[7px] text-white bg-slate-900 border border-slate-800 px-1 py-0.2 rounded mt-0.5">Bạn</Text>
                  </View>

                  {/* Person 1 location pin */}
                  <View className="absolute top-[20%] left-[20%] items-center">
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40" }} 
                      className="w-6 h-6 rounded-full border border-accent object-cover"
                    />
                    <Text className="text-[7px] bg-background border border-borderGray px-1 py-0.2 rounded text-white mt-0.5">Quân (0.6km)</Text>
                  </View>

                  {/* Person 2 location pin */}
                  <View className="absolute top-[60%] left-[75%] items-center">
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40" }} 
                      className="w-6 h-6 rounded-full border border-accent object-cover"
                    />
                    <Text className="text-[7px] bg-background border border-borderGray px-1 py-0.2 rounded text-white mt-0.5">Sơn (1.1km)</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-textGray leading-4 text-center">
                  Các thành viên đều bật GPS chia sẻ vị trí thực tế trên sân giúp đồng đội dễ dàng định vị tìm nhau.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 5. POPOVER OVERLAY 2: Xem thông tin sân đã đặt (Modal) */}
      <Modal
        visible={showVenueModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVenueModal(false)}
      >
        <View className="flex-1 bg-black/85 justify-center items-center p-4">
          <View className="w-full max-w-[300px] bg-secondary border border-borderGray rounded-3xl p-5 overflow-hidden">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-1.5">
                <MapPin size={14} color="#39FF14" />
                <Text className="text-white text-xs font-bold uppercase">Sân đã đặt</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVenueModal(false)} className="p-1">
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {currentChat && (
              <View className="space-y-3">
                <Image 
                  source={{ uri: matchedVenue?.imageUrl || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300" }}
                  className="h-24 w-full rounded-xl bg-background object-cover mb-2"
                />
                
                <View className="mb-2">
                  <Text className="text-xs font-bold text-white">{matchedVenue?.name || currentChat.venueNameList}</Text>
                  <Text className="text-[10px] text-textGray mt-0.5">{matchedVenue?.address || 'Hẻm 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM'}</Text>
                </View>

                <View className="p-3 bg-background rounded-xl border border-borderGray space-y-1.5 mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[11px] text-textGray">📅 Thời gian:</Text>
                    <Text className="text-[11px] font-semibold text-accent">
                      {matchedUserMatch?.timeSlot || '18:00 - 20:00 Hôm nay'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[11px] text-textGray">🏟️ Chi tiết sân:</Text>
                    <Text className="text-[11px] font-semibold text-white">
                      {matchedUserMatch?.type === 'booking' ? 'Sân số 3' : 'Khu vực thi đấu'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[11px] text-textGray">💵 Thanh toán:</Text>
                    <View className="flex-row items-center gap-0.5">
                      <Check size={10} color="#10B981" />
                      <Text className="text-[11px] font-semibold text-emerald-400">
                        {matchedUserMatch?.type === 'booking' ? 'Đã trả trước' : 'Trả sau / Chia đầu người'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Call reception button */}
                <TouchableOpacity 
                  onPress={() => handleCallHost(currentChat.title.includes('Đặt Sân') ? 'Tiếp tân đại lý' : 'Host / Trưởng nhóm')}
                  className="w-full py-2.5 bg-background border border-borderGray rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
                  activeOpacity={0.8}
                >
                  <PhoneCall size={12} color="#39FF14" />
                  <Text className="text-white text-[10px] font-bold">
                    Gọi điện {currentChat.title.includes('Đặt Sân') ? 'Tiếp tân đại lý' : 'Host / Trưởng nhóm'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
