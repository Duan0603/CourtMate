import React, { createContext, useContext, useState, useMemo } from 'react';
import { Venue, MatchKeo, ChatChannel, UserMatch, SportType, ChatMessage } from '../types';
import { INITIAL_VENUES, INITIAL_KEO_LIST, INITIAL_CHATS, sound } from '../constants/MockData';

export interface Location {
  latitude: number;
  longitude: number;
}

interface MockDataContextType {
  userLocation: Location;
  venues: Venue[];
  keos: MatchKeo[];
  joinedMatchIds: string[];
  userMatches: UserMatch[];
  activeConversations: ChatChannel[];
  selectedSportFilter: SportType;
  setSelectedSportFilter: (sport: SportType) => void;
  toggleJoinKeo: (keoId: string) => void;
  bookVenueSlot: (venueId: string, slotTimes: string[], dateString: string) => boolean;
  sendChatMessage: (channelId: string, text: string) => void;
  triggerMockIncomingMessage: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const USER_MOCK_LOCATION: Location = {
  latitude: 21.0285,
  longitude: 105.8542,
};

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [keos, setKeos] = useState<MatchKeo[]>(INITIAL_KEO_LIST);
  const [joinedMatchIds, setJoinedMatchIds] = useState<string[]>([]);

  // Track booked slots: dateString -> { venueId -> Array of booked slot times }
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<Record<string, Record<string, string[]>>>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initial: Record<string, string[]> = {};
    INITIAL_VENUES.forEach(v => {
      const booked = v.slots.filter(s => s.isBooked).map(s => s.time);
      if (booked.length > 0) {
        initial[v.id] = booked;
      }
    });
    return { [todayStr]: initial };
  });

  const venues = useMemo(() => {
    const bookedForDate = bookedSlotsByDate[selectedDate] || {};
    return INITIAL_VENUES.map(venue => {
      const bookedTimes = bookedForDate[venue.id] || [];
      return {
        ...venue,
        slots: venue.slots.map(slot => ({
          ...slot,
          isBooked: bookedTimes.includes(slot.time)
        }))
      };
    });
  }, [selectedDate, bookedSlotsByDate]);
  const [selectedSportFilter, setSelectedSportFilter] = useState<SportType>('badminton');
  
  // Real active user states synced across features
  const [userMatches, setUserMatches] = useState<UserMatch[]>([
    {
      id: 'match-1',
      sport: 'badminton',
      venueName: 'Sân Cầu Lông Viettel Hẻm 285',
      address: 'Hẻm 285 Cách Mạng Tháng Tám, Quận 10',
      timeSlot: '18:00 - 20:00 Hôm nay',
      status: 'upcoming',
      type: 'booking',
      playersCount: 4
    }
  ]);

  const [activeConversations, setActiveConversations] = useState<ChatChannel[]>(INITIAL_CHATS);

  // Toggle joining a match (keo)
  const toggleJoinKeo = (keoId: string) => {
    const keo = keos.find(k => k.id === keoId);
    if (!keo) return;

    const isJoined = joinedMatchIds.includes(keoId);

    if (isJoined) {
      // Cancel match joining
      sound.playTap();
      setJoinedMatchIds(prev => prev.filter(id => id !== keoId));
      
      // Update keo status
      setKeos(prev => prev.map(k => k.id === keoId ? { ...k, status: 'waiting' } : k));

      // Remove from scheduled list
      setUserMatches(prev => prev.filter(m => m.id !== `match-keo-${keoId}`));

      // Update chat last message
      setActiveConversations(prev => prev.map(c => {
        if (c.sport === keo.sport) {
          return {
            ...c,
            lastMessage: `Hệ thống: Bạn đã hủy tham gia kèo.`,
            messages: [
              ...c.messages,
              {
                id: `msg-system-cancel-${Date.now()}`,
                sender: 'Courtmate Bot',
                isMe: false,
                text: `Bạn đã hủy tham gia kèo đấu của ${keo.hostName}.`,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return c;
      }));
    } else {
      // Join match
      sound.playSuccess();
      setJoinedMatchIds(prev => [...prev, keoId]);

      // Update keo status
      setKeos(prev => prev.map(k => k.id === keoId ? { ...k, status: 'joined' } : k));

      // Add to scheduled list
      const newMatch: UserMatch = {
        id: `match-keo-${keoId}`,
        sport: keo.sport,
        venueName: keo.venueName,
        address: `Sân vận động cách bạn ${keo.distance}km`,
        timeSlot: keo.timeSlot,
        status: 'upcoming',
        type: 'matchmaking',
        playersCount: keo.missingPlayers + 1
      };
      setUserMatches(prev => [newMatch, ...prev]);

      // Sync chat group
      setActiveConversations(prev => {
        const exists = prev.some(c => c.sport === keo.sport);
        if (exists) {
          return prev.map(c => {
            if (c.sport === keo.sport) {
              return {
                ...c,
                lastMessage: `Hệ thống: Bạn đã tham gia cùng ${keo.hostName}!`,
                unread: true,
                messages: [
                  ...c.messages,
                  {
                    id: `msg-system-${Date.now()}`,
                    sender: 'Courtmate Bot',
                    isMe: false,
                    text: `Chào mừng bạn đã tham gia kèo của ${keo.hostName} tại ${keo.venueName}. Chúc mọi người thi đấu vui vẻ!`,
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  }
                ]
              };
            }
            return c;
          });
        } else {
          const newChannel: ChatChannel = {
            id: `chat-${keoId}`,
            title: `Nhóm Ghép Cặp ${getSportLabel(keo.sport)}`,
            sport: keo.sport,
            venueNameList: keo.venueName,
            lastMessage: `Hệ thống: Bạn đã tham gia nhóm!`,
            time: 'Mới',
            unread: true,
            messages: [
              { id: '1', sender: keo.hostName, isMe: false, text: `Chào bồ nhé, may quá ghép được với bồ! Vô sân chơi bời nha.`, timestamp: 'Mới', avatar: keo.hostAvatar },
              { id: '2', sender: 'Bạn', isMe: true, text: `Chào mọi người! Sân sẵn sàng chưa, lát tớ đạp xe qua luôn nha`, timestamp: 'Mới' }
            ]
          };
          return [newChannel, ...prev];
        }
      });
    }
  };

  // Book a slot at a venue
  const bookVenueSlot = (venueId: string, slotTimes: string[], dateString: string): boolean => {
    const venue = INITIAL_VENUES.find(v => v.id === venueId);
    if (!venue) return false;

    // Check if slot is already booked
    const bookedForDate = bookedSlotsByDate[dateString] || {};
    const bookedTimes = bookedForDate[venueId] || [];
    
    const isAnyAlreadyBooked = slotTimes.some(time => bookedTimes.includes(time));
    if (isAnyAlreadyBooked) return false;

    sound.playSuccess();

    // Mark slot as booked
    setBookedSlotsByDate(prev => {
      const dateBookings = prev[dateString] || {};
      const venueBookings = dateBookings[venueId] || [];
      return {
        ...prev,
        [dateString]: {
          ...dateBookings,
          [venueId]: [...venueBookings, ...slotTimes]
        }
      };
    });

    const formattedDate = dateString.split('-').reverse().slice(0, 2).join('/');
    const slotTimesStr = slotTimes.join(', ');

    // Add to scheduled list
    const newMatch: UserMatch = {
      id: `match-book-${Date.now()}`,
      sport: venue.sport,
      venueName: venue.name,
      address: venue.address,
      timeSlot: `${slotTimesStr} ngày ${formattedDate}`,
      status: 'upcoming',
      type: 'booking',
      playersCount: 1
    };
    setUserMatches(prev => [newMatch, ...prev]);

    // Add corresponding chat with venue assistant
    const newChannel: ChatChannel = {
      id: `chat-venue-${Date.now()}`,
      title: `Đặt Sân - ${venue.name}`,
      sport: venue.sport,
      venueNameList: venue.name,
      lastMessage: `Tiếp tân: Đã nhận booking khung giờ ${slotTimes.join(' & ')}!`,
      time: 'Vừa xong',
      unread: true,
      messages: [
        { 
          id: '1', 
          sender: 'Tiếp tân đại lý', 
          isMe: false, 
          text: `Chào bạn! Cảm ơn đã đặt sân tại ${venue.name}. Khung giờ ${slotTimes.join(' & ')} ngày ${formattedDate} đã được kích hoạt, mã khóa check-in QR của bạn cũng đã khả dụng.`, 
          timestamp: 'Vừa xong',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120'
        }
      ]
    };
    setActiveConversations(prev => [newChannel, ...prev]);
    return true;
  };

  // Sending a chat message
  const sendChatMessage = (channelId: string, text: string) => {
    sound.playTap();
    setActiveConversations(prev => prev.map(channel => {
      if (channel.id === channelId) {
        return {
          ...channel,
          lastMessage: `Bạn: ${text}`,
          messages: [
            ...channel.messages,
            {
              id: `msg-me-${Date.now()}`,
              sender: 'Bạn',
              isMe: true,
              text: text,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return channel;
    }));
  };

  // Simulation: Incoming message
  const triggerMockIncomingMessage = () => {
    sound.playNotification();
    setActiveConversations(prev => {
      const exists = prev.some(c => c.sport === 'badminton');
      if (exists) {
        return prev.map(c => {
          if (c.sport === 'badminton') {
            return {
              ...c,
              lastMessage: 'Liên: Sân số 3 nha bồ ơi, tớ đang tới rồi!',
              unread: true,
              messages: [
                ...c.messages,
                {
                  id: `msg-mock-${Date.now()}`,
                  sender: 'Nguyễn Bích Liên',
                  isMe: false,
                  text: 'Sân số 3 nha bồ ơi, tớ đang tới rồi! Sắp hâm nóng cơ thể rồi nha 🏸',
                  timestamp: 'Vừa xong',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                }
              ]
            };
          }
          return c;
        });
      }
      return prev;
    });
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

  const value = useMemo(() => ({
    userLocation: USER_MOCK_LOCATION,
    venues,
    keos,
    joinedMatchIds,
    userMatches,
    activeConversations,
    selectedSportFilter,
    setSelectedSportFilter,
    toggleJoinKeo,
    bookVenueSlot,
    sendChatMessage,
    triggerMockIncomingMessage,
    selectedDate,
    setSelectedDate,
  }), [venues, keos, joinedMatchIds, userMatches, activeConversations, selectedSportFilter, selectedDate]);

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
