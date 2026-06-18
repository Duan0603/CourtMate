/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Venue, MatchKeo, ChatChannel, SportIcon } from '../types';

// Sport List
export const SPORTS_LIST: SportIcon[] = [
  { id: 'badminton', name: 'Cầu lông', emoji: '🏸' },
  { id: 'soccer', name: 'Bóng đá', emoji: '⚽' },
  { id: 'basketball', name: 'Bóng rổ', emoji: '🏀' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'tabletennis', name: 'Bóng bàn', emoji: '🏓' },
];

// Sample Venues
export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Sân Cầu Lông Viettel Hẻm 285',
    sport: 'badminton',
    rating: 4.8,
    reviewsCount: 142,
    distance: 0.8,
    address: 'Hẻm 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM',
    pricePerHour: 80000,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60',
    slots: [
      { time: '05:00 - 06:00', isBooked: true, price: 60000 },
      { time: '06:00 - 07:00', isBooked: false, price: 80000 },
      { time: '07:00 - 08:00', isBooked: false, price: 80000 },
      { time: '08:00 - 09:00', isBooked: true, price: 80000 },
      { time: '15:00 - 16:00', isBooked: false, price: 85000 },
      { time: '16:00 - 17:00', isBooked: true, price: 90000 },
      { time: '17:00 - 18:00', isBooked: false, price: 110000 },
      { time: '18:00 - 19:00', isBooked: false, price: 110000 },
      { time: '19:00 - 20:00', isBooked: false, price: 110000 },
      { time: '20:00 - 21:00', isBooked: true, price: 100000 },
    ],
    location: {
      latitude: 21.0315,
      longitude: 105.8512,
    },
  },
  {
    id: 'venue-2',
    name: 'Sân Bóng Đá Kỳ Hòa Landmark',
    sport: 'soccer',
    rating: 4.9,
    reviewsCount: 230,
    distance: 1.2,
    address: 'Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
    pricePerHour: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    slots: [
      { time: '16:00 - 17:00', isBooked: false, price: 300000 },
      { time: '17:00 - 18:00', isBooked: true, price: 380000 },
      { time: '18:00 - 19:00', isBooked: false, price: 420000 },
      { time: '19:00 - 20:00', isBooked: false, price: 420000 },
      { time: '20:00 - 21:00', isBooked: false, price: 380000 },
      { time: '21:00 - 22:00', isBooked: true, price: 300000 },
    ],
    location: {
      latitude: 21.0245,
      longitude: 105.8612,
    },
  },
  {
    id: 'venue-3',
    name: 'CLB Bóng Rổ Thống Nhất',
    sport: 'basketball',
    rating: 4.6,
    reviewsCount: 98,
    distance: 2.1,
    address: 'Lê Đại Hành, Phường 15, Quận 11, TP.HCM',
    pricePerHour: 200000,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60',
    slots: [
      { time: '17:00 - 18:00', isBooked: false, price: 180000 },
      { time: '18:00 - 19:00', isBooked: false, price: 200000 },
      { time: '19:00 - 20:00', isBooked: true, price: 200000 },
      { time: '20:00 - 21:00', isBooked: false, price: 200000 },
    ],
    location: {
      latitude: 21.0185,
      longitude: 105.8452,
    },
  },
  {
    id: 'venue-4',
    name: 'Sân Tennis Khang An',
    sport: 'tennis',
    rating: 4.7,
    reviewsCount: 74,
    distance: 2.7,
    address: 'Phan Văn Trị, Phường 10, Gò Vấp, TP.HCM',
    pricePerHour: 180000,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60',
    slots: [
      { time: '06:00 - 08:00', isBooked: false, price: 150000 },
      { time: '08:00 - 10:00', isBooked: true, price: 150000 },
      { time: '16:00 - 18:00', isBooked: false, price: 180000 },
      { time: '18:00 - 20:00', isBooked: false, price: 220000 },
    ],
    location: {
      latitude: 21.0365,
      longitude: 105.8392,
    },
  },
  {
    id: 'venue-5',
    name: 'Sân Bóng Bàn Học Viện TDTT',
    sport: 'tabletennis',
    rating: 4.5,
    reviewsCount: 52,
    distance: 3.2,
    address: 'Nguyễn Trãi, Quận 5, TP.HCM',
    pricePerHour: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500&auto=format&fit=crop&q=60',
    slots: [
      { time: '14:00 - 15:00', isBooked: false, price: 50000 },
      { time: '15:00 - 16:00', isBooked: false, price: 50000 },
      { time: '16:00 - 17:00', isBooked: true, price: 50000 },
      { time: '17:00 - 18:00', isBooked: false, price: 50000 },
    ],
    location: {
      latitude: 21.0265,
      longitude: 105.8442,
    },
  },
];

// Sample Pending Matchmaking Keos
export const INITIAL_KEO_LIST: MatchKeo[] = [
  {
    id: 'keo-1',
    title: 'Kèo Đôi Nam Nữ - Giao Lưu Cọ Sát',
    hostName: 'Trần Minh Quân',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    sport: 'badminton',
    level: 'Trung bình',
    distance: 0.6,
    missingPlayers: 2,
    timeSlot: '18:00 - 20:00 Hôm nay',
    venueName: 'Sân Cầu Lông Viettel Hẻm 285',
    status: 'waiting',
  },
  {
    id: 'keo-2',
    title: 'Tìm 3 Cầu Sân Kỳ Hòa Landmark',
    hostName: 'Lê Hoàng Hải',
    hostAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
    sport: 'soccer',
    level: 'Khá',
    distance: 1.1,
    missingPlayers: 3,
    timeSlot: '19:30 - 21:00 Hôm nay',
    venueName: 'Sân Khang An - Sân 5A',
    status: 'waiting',
  },
  {
    id: 'keo-3',
    title: 'Bóng rổ 3x3 - Chia đội ném rổ',
    hostName: 'Nguyễn Thủy Tiên',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sport: 'basketball',
    level: 'Cơ bản',
    distance: 1.8,
    missingPlayers: 1,
    timeSlot: '17:00 - 19:00 Ngày mai',
    venueName: 'Sân Bóng Rổ Kỳ Hòa',
    status: 'waiting',
  },
];

// Sample chats
export const INITIAL_CHATS: ChatChannel[] = [
  {
    id: 'chat-1',
    title: 'Kèo Cầu Lông Viettel [2 - 4]',
    sport: 'badminton',
    venueNameList: 'Sân Cầu Lông Viettel Hẻm 285',
    lastMessage: 'Quân: Tí tớ mang thêm 1 cặp vợt sơ cua nhé!',
    time: '12:30',
    unread: true,
    messages: [
      { id: '1', sender: 'Trần Minh Quân', isMe: false, text: 'Chào mọi người, kèo hôm nay 18:00 nhé!', timestamp: '12:00', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      { id: '2', sender: 'Thanh Sơn', isMe: false, text: 'Ok nha, mình đem cầu Thành Công nha', timestamp: '12:05', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { id: '3', sender: 'Bạn', isMe: true, text: 'Tuyệt vời, sân số mấy vậy Quân ơi?', timestamp: '12:15' },
      { id: '4', sender: 'Trần Minh Quân', isMe: false, text: 'Quân: Tí tớ mang thêm 1 cặp vợt sơ cua nhé! Sân số 3 nha bạn.', timestamp: '12:30', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    ],
  },
];

// React Native Haptic Stub / Sound utility
export const sound = {
  playTap: () => {
    // Stub
    console.log('[Sound] playTap');
  },
  playRadar: () => {
    // Stub
    console.log('[Sound] playRadar');
  },
  playSuccess: () => {
    // Stub
    console.log('[Sound] playSuccess');
  },
  playNotification: () => {
    // Stub
    console.log('[Sound] playNotification');
  },
};
