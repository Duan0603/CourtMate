/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SportType = 'badminton' | 'soccer' | 'basketball' | 'tennis' | 'tabletennis';

export interface SportIcon {
  id: SportType;
  name: string;
  emoji: string;
}

export interface Venue {
  id: string;
  name: string;
  sport: SportType;
  rating: number;
  reviewsCount: number;
  distance: number;
  address: string;
  pricePerHour: number;
  imageUrl: string;
  slots: TimeSlot[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  price: number;
}

export interface MatchKeo {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  sport: SportType;
  level: 'Cơ bản' | 'Trung bình' | 'Khá' | 'Chuyên nghiệp';
  distance: number;
  missingPlayers: number;
  timeSlot: string;
  venueName: string;
  status: 'waiting' | 'joined' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface ChatChannel {
  id: string;
  title: string;
  sport: SportType;
  venueNameList: string;
  messages: ChatMessage[];
  lastMessage: string;
  time: string;
  unread: boolean;
}

export interface UserMatch {
  id: string;
  sport: SportType;
  venueName: string;
  address: string;
  timeSlot: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'matchmaking' | 'booking';
  playersCount: number;
}
