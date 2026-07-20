import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Image, Alert, StyleSheet, Dimensions, Platform } from 'react-native';
import {
  Trophy, Users, BarChart2, MapPin, Calendar, Search, Filter, Plus,
  Download, Check, X, LogOut, Settings, ChevronRight, ChevronDown,
  TrendingUp, DollarSign, Briefcase, Activity, Globe, ArrowLeft,
  Share2, Edit2, Play, Circle, Menu, Info
} from 'lucide-react-native';
import { useLogin } from '../src/features/auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';
import { router } from 'expo-router';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

// ==========================================
// MOCK DATA STRUCTURES & LOCAL STATES
// ==========================================

interface TournamentCategory {
  name: string;
  fee: number;
  maxParticipants: number;
}

interface Tournament {
  id: string;
  title: string;
  location: string;
  sport: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  participantsLimit: number;
  registeredCount: number;
  description: string;
  rules: string;
  categories: TournamentCategory[];
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  division: string;
  rating: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Match {
  id: string;
  round: 'Quarterfinals' | 'Semifinals' | 'Finals';
  court: string;
  status: 'UPCOMING' | 'LIVE' | 'FINAL' | 'COMPLETED';
  player1Id: string;
  player2Id: string;
  score1: number[];
  score2: number[];
  winnerId?: string;
  chairUmpire: string;
  timeSlot?: string;
}

export default function AdminScreen() {
  const { user, logout, isAuthenticated, isLoading } = useLogin();

  // Navigation & UI States
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'tournaments' | 'officials' | 'analytics' | 'regional' | 'settings'>('dashboard');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [activeTournamentTab, setActiveTournamentTab] = useState<'overview' | 'players' | 'matches' | 'bracket' | 'schedule' | 'results' | 'settings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Search & Filter States
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [playerFilterTab, setPlayerFilterTab] = useState<'All' | 'Pending' | 'Approved'>('All');

  // Bracket Interactive Panel State
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [editMatchStatus, setEditMatchStatus] = useState<'UPCOMING' | 'LIVE' | 'FINAL'>('UPCOMING');
  const [editCourt, setEditCourt] = useState('');
  const [editUmpire, setEditUmpire] = useState('');
  const [editSetScores, setEditSetScores] = useState({
    p1: ['', '', ''],
    p2: ['', '', '']
  });

  // Top level data states
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 't-1',
      title: 'Global Elite Invitational',
      location: 'Miami, FL (Pro Circuit)',
      sport: 'Tennis',
      startDate: '2026-10-12',
      endDate: '2026-10-20',
      status: 'ACTIVE',
      participantsLimit: 128,
      registeredCount: 128,
      description: 'The flagship event of the local tennis pro circuit bringing together top seeded players.',
      rules: 'Standard ITF rules apply. Matches are best of 3 sets with a match tiebreak in the third set.',
      categories: [
        { name: "Men's Singles Pro", fee: 1500000, maxParticipants: 64 },
        { name: "Women's Singles Pro", fee: 1500000, maxParticipants: 64 }
      ]
    },
    {
      id: 't-2',
      title: 'Summer City Open 2024',
      location: 'Metro Tennis Center, Downtown',
      sport: 'Tennis',
      startDate: '2026-08-15',
      endDate: '2026-08-20',
      status: 'ACTIVE',
      participantsLimit: 128,
      registeredCount: 124,
      description: 'Annual outdoor tournament open to local residents and club members across all age divisions.',
      rules: 'ITF rules. Standard tiebreak at 6-6 in all sets. Best of 3 sets.',
      categories: [
        { name: "Men's Open Singles", fee: 500000, maxParticipants: 64 },
        { name: "Women's Open Singles", fee: 500000, maxParticipants: 64 }
      ]
    },
    {
      id: 't-3',
      title: 'Junior Winter Classic',
      location: 'Orlando Tennis Center',
      sport: 'Tennis',
      startDate: '2026-10-15',
      endDate: '2026-10-18',
      status: 'UPCOMING',
      participantsLimit: 64,
      registeredCount: 32,
      description: 'Junior developmental event supporting under-18 prospects and junior divisions.',
      rules: 'Junior rules apply. No-ad scoring, 10-point tiebreak instead of third set.',
      categories: [
        { name: "Boys U18 Singles", fee: 300000, maxParticipants: 32 },
        { name: "Girls U18 Singles", fee: 300000, maxParticipants: 32 }
      ]
    },
    {
      id: 't-4',
      title: 'Elite Masters Series',
      location: 'Virtual / Mixed Venues',
      sport: 'Pickleball',
      startDate: '2026-11-02',
      endDate: '2026-11-08',
      status: 'UPCOMING',
      participantsLimit: 32,
      registeredCount: 12,
      description: 'Pickleball championship for advanced players, doubles and singles.',
      rules: 'USAPA regulations. Best 2 out of 3 games to 11 points (win by 2).',
      categories: [
        { name: "Men's Pro Singles", fee: 400000, maxParticipants: 16 },
        { name: "Women's Pro Singles", fee: 400000, maxParticipants: 16 }
      ]
    },
    {
      id: 't-5',
      title: 'Pro-Am Regional Final',
      location: 'Miami Beach Courts',
      sport: 'Badminton',
      startDate: '2026-10-12',
      endDate: '2026-10-15',
      status: 'ACTIVE',
      participantsLimit: 16,
      registeredCount: 16,
      description: 'Final showdown of the regional badminton circuit.',
      rules: 'BWF standard rules. Best of 3 games to 21 points.',
      categories: [
        { name: "Men's Doubles", fee: 800000, maxParticipants: 8 },
        { name: "Mixed Doubles", fee: 800000, maxParticipants: 8 }
      ]
    }
  ]);

  const [players, setPlayers] = useState<Record<string, Player[]>>({
    't-2': [
      { id: 'p-1', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', division: "Men's Singles Pro", rating: '11.4', status: 'PENDING' },
      { id: 'p-2', name: 'Sarah Jenkins', avatar: '', division: "Women's Open", rating: '9.2', status: 'PENDING' },
      { id: 'p-3', name: 'Elena Rodriguez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', division: "Women's Pro", rating: '#4 Seed', status: 'APPROVED' },
      { id: 'p-4', name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', division: "Men's Open", rating: 'Unseeded', status: 'APPROVED' },
      { id: 'p-5', name: 'Alexander Zverev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', division: "Men's Singles Pro", rating: '#1 Seed', status: 'APPROVED' },
      { id: 'p-6', name: 'Taylor Fritz', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80', division: "Men's Singles Pro", rating: '#5 Seed', status: 'APPROVED' },
      { id: 'p-7', name: 'Holger Rune', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80', division: "Men's Singles Pro", rating: '#8 Seed', status: 'APPROVED' },
      { id: 'p-8', name: 'Daniil Medvedev', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', division: "Men's Singles Pro", rating: '#4 Seed', status: 'APPROVED' }
    ]
  });

  const [matches, setMatches] = useState<Record<string, Match[]>>({
    't-2': [
      // Quarterfinals
      { id: 'm-101', round: 'Quarterfinals', court: 'Court 1', status: 'LIVE', player1Id: 'p-5', player2Id: 'p-6', score1: [6, 4], score2: [4, 2], chairUmpire: 'Carlos Bernardes', timeSlot: '10:00 AM' },
      { id: 'm-102', round: 'Quarterfinals', court: 'Court 3', status: 'FINAL', player1Id: 'p-7', player2Id: 'p-8', score1: [4, 6, 3], score2: [6, 3, 6], winnerId: 'p-8', chairUmpire: 'Eva Asderaki', timeSlot: '11:30 AM' },
      { id: 'm-103', round: 'Quarterfinals', court: 'Court 2', status: 'COMPLETED', player1Id: 'p-3', player2Id: 'p-2', score1: [6, 6], score2: [2, 1], winnerId: 'p-3', chairUmpire: 'Kader Nouni', timeSlot: '01:00 PM' },
      { id: 'm-104', round: 'Quarterfinals', court: 'Center Court', status: 'UPCOMING', player1Id: 'p-1', player2Id: 'p-4', score1: [], score2: [], chairUmpire: 'Marijana Veljovic', timeSlot: '03:00 PM' },
      // Semifinals
      { id: 'm-201', round: 'Semifinals', court: 'Center Court', status: 'UPCOMING', player1Id: 'tbd-101', player2Id: 'p-8', score1: [], score2: [], chairUmpire: 'Carlos Bernardes', timeSlot: 'Tomorrow 2:00 PM' },
      { id: 'm-202', round: 'Semifinals', court: 'Grandstand', status: 'UPCOMING', player1Id: 'p-3', player2Id: 'tbd-104', score1: [], score2: [], chairUmpire: 'Kader Nouni', timeSlot: 'Tomorrow 4:00 PM' },
      // Finals
      { id: 'm-301', round: 'Finals', court: 'Center Court', status: 'UPCOMING', player1Id: 'tbd-201', player2Id: 'tbd-202', score1: [], score2: [], chairUmpire: 'Eva Asderaki', timeSlot: 'Sunday 3:00 PM' }
    ]
  });

  // Action Handlers
  const handleApprovePlayer = (tournamentId: string, playerId: string) => {
    setPlayers(prev => {
      const list = prev[tournamentId] || [];
      const updated = list.map(p => p.id === playerId ? { ...p, status: 'APPROVED' as const } : p);
      return { ...prev, [tournamentId]: updated };
    });
  };

  const handleRejectPlayer = (tournamentId: string, playerId: string) => {
    setPlayers(prev => {
      const list = prev[tournamentId] || [];
      const updated = list.map(p => p.id === playerId ? { ...p, status: 'REJECTED' as const } : p);
      return { ...prev, [tournamentId]: updated };
    });
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatchId(match.id);
    setEditMatchStatus(match.status === 'COMPLETED' ? 'FINAL' : match.status);
    setEditCourt(match.court);
    setEditUmpire(match.chairUmpire);

    // Fill in set scores (or leave blank if none)
    const p1Scores = ['', '', ''];
    const p2Scores = ['', '', ''];
    match.score1.forEach((val, index) => { p1Scores[index] = String(val); });
    match.score2.forEach((val, index) => { p2Scores[index] = String(val); });
    setEditSetScores({ p1: p1Scores, p2: p2Scores });
  };

  const handleSaveScore = (tournamentId: string) => {
    if (!selectedMatchId) return;

    const parseSetScores = (arr: string[]) => {
      return arr.map(val => parseInt(val, 10)).filter(val => !isNaN(val));
    };

    setMatches(prev => {
      const list = prev[tournamentId] || [];
      const updated = list.map(m => {
        if (m.id === selectedMatchId) {
          const s1 = parseSetScores(editSetScores.p1);
          const s2 = parseSetScores(editSetScores.p2);

          // Determine winner (simple logic based on sets won)
          let winnerId = m.winnerId;
          if (editMatchStatus === 'FINAL' && s1.length > 0 && s2.length > 0) {
            let p1Wins = 0;
            let p2Wins = 0;
            for (let i = 0; i < s1.length; i++) {
              if (s1[i] > s2[i]) p1Wins++;
              else if (s2[i] > s1[i]) p2Wins++;
            }
            if (p1Wins > p2Wins) {
              winnerId = m.player1Id;
            } else if (p2Wins > p1Wins) {
              winnerId = m.player2Id;
            }
          }

          return {
            ...m,
            court: editCourt,
            chairUmpire: editUmpire,
            status: (editMatchStatus === 'FINAL' ? 'COMPLETED' : editMatchStatus) as 'UPCOMING' | 'LIVE' | 'FINAL' | 'COMPLETED',
            score1: s1,
            score2: s2,
            winnerId
          };
        }
        return m;
      });

      // Automatically cascade winners if final score was saved
      const targetMatch = updated.find(m => m.id === selectedMatchId);
      if (targetMatch && targetMatch.status === 'COMPLETED' && targetMatch.winnerId) {
        // Find if this match determines players for subsequent rounds
        if (selectedMatchId === 'm-101') {
          const semi = updated.find(m => m.id === 'm-201');
          if (semi) semi.player1Id = targetMatch.winnerId;
        } else if (selectedMatchId === 'm-102') {
          const semi = updated.find(m => m.id === 'm-201');
          if (semi) semi.player2Id = targetMatch.winnerId;
        } else if (selectedMatchId === 'm-103') {
          const semi = updated.find(m => m.id === 'm-202');
          if (semi) semi.player1Id = targetMatch.winnerId;
        } else if (selectedMatchId === 'm-104') {
          const semi = updated.find(m => m.id === 'm-202');
          if (semi) semi.player2Id = targetMatch.winnerId;
        } else if (selectedMatchId === 'm-201') {
          const final = updated.find(m => m.id === 'm-301');
          if (final) final.player1Id = targetMatch.winnerId;
        } else if (selectedMatchId === 'm-202') {
          const final = updated.find(m => m.id === 'm-301');
          if (final) final.player2Id = targetMatch.winnerId;
        }
      }

      return { ...prev, [tournamentId]: updated };
    });

    Alert.alert("Thành công", "Đã cập nhật tỉ số trận đấu!");
    setSelectedMatchId(null); // Close sidebar
  };

  const handleAutoAdvance = (tournamentId: string) => {
    if (!selectedMatchId) return;

    // Auto populate random winning score and complete
    setEditMatchStatus('FINAL');
    setEditSetScores({
      p1: ['6', '4', '6'],
      p2: ['3', '6', '2']
    });

    // Trigger save score directly via timeout to simulate automatic update
    setTimeout(() => {
      handleSaveScore(tournamentId);
    }, 100);
  };

  // Redirect guard
  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || (user?.role !== 'REGIONAL_ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user?.role, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-light">
        <Text className="text-primary font-semibold text-base">Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  // Sidebar link actions
  const handleSidebarTabPress = (tab: 'dashboard' | 'tournaments' | 'officials' | 'analytics' | 'regional' | 'settings') => {
    setActiveSidebarTab(tab);
    setSelectedTournamentId(null); // Return to list view when clicking main tabs
    setIsSidebarOpen(false);
  };

  const getPlayerName = (tournamentId: string, id: string) => {
    if (id.startsWith('tbd-')) {
      const matchNum = id.split('-')[1];
      return `Chưa xác định (thắng trận ${matchNum})`;
    }
    const list = players[tournamentId] || [];
    const player = list.find(p => p.id === id);
    return player ? player.name : 'Chưa xác định';
  };

  const getPlayerAvatar = (tournamentId: string, id: string) => {
    if (id.startsWith('tbd-')) return '';
    const list = players[tournamentId] || [];
    const player = list.find(p => p.id === id);
    return player ? player.avatar : '';
  };

  // Filtered Tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(tournamentSearchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(tournamentSearchQuery.toLowerCase());
    const matchesSport = sportFilter === 'All' || t.sport.toLowerCase() === sportFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesSport && matchesStatus;
  });

  const sidebarTabLabels: Record<typeof activeSidebarTab, string> = {
    dashboard: 'Tổng quan',
    tournaments: 'Giải đấu',
    officials: 'Trọng tài',
    analytics: 'Phân tích',
    regional: 'Khu vực Việt Nam',
    settings: 'Cài đặt'
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Đang diễn ra',
    UPCOMING: 'Sắp diễn ra',
    COMPLETED: 'Đã kết thúc',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    LIVE: 'Trực tiếp',
    FINAL: 'Hoàn tất'
  };

  const roundLabels: Record<string, string> = {
    Quarterfinals: 'Tứ kết',
    Semifinals: 'Bán kết',
    Finals: 'Chung kết'
  };

  const playerFilterLabels: Record<typeof playerFilterTab, string> = {
    All: 'Tất cả',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt'
  };

  const formatShortDate = (value: string) =>
    new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

  return (
    <View className="flex-1 flex-row bg-slate-50 relative">

      {/* ==========================================
          RESPONSIVE SIDEBAR
          ========================================== */}
      <View className={`bg-slate-900 border-r border-slate-800 z-50 md:flex flex-col justify-between absolute md:relative h-full transition-all duration-300 ${isSidebarOpen ? 'left-0 w-64' : '-left-64 w-64 md:left-0'}`}>
        <View className="p-lg">
          {/* Brand Logo & Header */}
          <View className="flex-row items-center space-x-3 mb-xl">
            <View className="w-10 h-10 rounded-xl bg-blue-vibrant justify-center items-center">
              <Trophy color="#FFFFFF" size={22} />
            </View>
            <View className="ml-sm">
              <Text className="text-white font-extrabold text-lg leading-tight">CourtMate</Text>
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Cổng quản trị</Text>
            </View>
          </View>

          {/* Nav Categories */}
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-md">Trung tâm điều hành</Text>
          <View className="space-y-sm mb-lg">
            <TouchableOpacity
              onPress={() => handleSidebarTabPress('dashboard')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'dashboard' ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <BarChart2 color={activeSidebarTab === 'dashboard' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'dashboard' ? 'text-white' : 'text-slate-400'}`}>Tổng quan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSidebarTabPress('tournaments')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'tournaments' || selectedTournamentId ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <Trophy color={activeSidebarTab === 'tournaments' || selectedTournamentId ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'tournaments' || selectedTournamentId ? 'text-white' : 'text-slate-400'}`}>Giải đấu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSidebarTabPress('officials')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'officials' ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <Briefcase color={activeSidebarTab === 'officials' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'officials' ? 'text-white' : 'text-slate-400'}`}>Trọng tài</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSidebarTabPress('analytics')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'analytics' ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <Activity color={activeSidebarTab === 'analytics' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'analytics' ? 'text-white' : 'text-slate-400'}`}>Phân tích</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSidebarTabPress('regional')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'regional' ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <Globe color={activeSidebarTab === 'regional' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'regional' ? 'text-white' : 'text-slate-400'}`}>Khu vực Việt Nam</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-md">Quản trị</Text>
          <View className="space-y-sm">
            <TouchableOpacity
              onPress={() => handleSidebarTabPress('settings')}
              className={`flex-row items-center p-md rounded-xl space-x-3 ${activeSidebarTab === 'settings' ? 'bg-blue-vibrant' : 'hover:bg-slate-800'}`}
            >
              <Settings color={activeSidebarTab === 'settings' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text className={`font-semibold ml-sm text-sm ${activeSidebarTab === 'settings' ? 'text-white' : 'text-slate-400'}`}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sidebar Footer User Card */}
        <View className="p-lg border-t border-slate-800 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-full bg-slate-700 justify-center items-center overflow-hidden">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
                className="w-full h-full"
              />
            </View>
            <View className="ml-sm">
              <Text className="text-white font-bold text-sm leading-tight">{user?.name || 'Cổng quản trị'}</Text>
              <Text className="text-slate-400 text-xs">{user?.role === UserRole.SUPER_ADMIN ? 'Quyền quản trị tối cao' : 'Quyền quản trị khu vực'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/'); }} className="p-xs hover:bg-slate-800 rounded-md">
            <LogOut color="#EF4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          MAIN AREA CONTENT
          ========================================== */}
      <View className="flex-1 flex-col">
        {/* Top Header Bar */}
        <View className="h-16 border-b border-slate-200 bg-white px-lg flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-xs">
              <Menu color="#334155" size={24} />
            </TouchableOpacity>
            {selectedTournamentId && (
              <TouchableOpacity
                onPress={() => setSelectedTournamentId(null)}
                className="flex-row items-center space-x-1.5 p-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <ArrowLeft color="#475569" size={16} />
                <Text className="text-slate-600 font-bold ml-1 text-sm">Quay lại</Text>
              </TouchableOpacity>
            )}
            <Text className="text-slate-800 font-extrabold text-xl ml-sm">
              {selectedTournamentId ? 'Chi tiết giải đấu' : sidebarTabLabels[activeSidebarTab]}
            </Text>
          </View>

          <View className="flex-row items-center space-x-4">
            <Text className="text-slate-500 font-medium text-sm hidden sm:block">Phiên làm việc: {user?.email}</Text>
            <View className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center">
              <Trophy color="#1D4ED8" size={16} />
            </View>
          </View>
        </View>

        {/* Content Renderers */}
        <ScrollView className="flex-1 p-lg" contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ========================================================
              RENDER TAB: DASHBOARD (Organizer Dashboard - Image 1)
              ======================================================== */}
          {!selectedTournamentId && activeSidebarTab === 'dashboard' && (
            <View className="space-y-lg">
              <View className="flex-row justify-between items-center flex-wrap gap-sm">
                <View>
                  <Text className="text-slate-900 font-extrabold text-3xl">Bảng điều khiển ban tổ chức</Text>
                  <Text className="text-slate-500 text-sm mt-1">Tổng quan hiệu suất nền tảng, giải đang hoạt động và hoạt động trận đấu gần đây.</Text>
                </View>
                <View className="flex-row items-center space-x-3 gap-sm">
                  <TouchableOpacity className="flex-row items-center bg-white border border-slate-200 px-lg py-md rounded-xl space-x-2">
                    <Download color="#475569" size={18} />
                    <Text className="text-slate-700 font-bold ml-2">Xuất báo cáo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveSidebarTab('tournaments');
                      setSelectedTournamentId(null);
                    }}
                    className="flex-row items-center bg-blue-vibrant px-lg py-md rounded-xl space-x-2"
                  >
                    <Plus color="#FFFFFF" size={18} />
                    <Text className="text-white font-bold ml-2">Tạo giải đấu</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Metrics Cards Grid */}
              <View className="flex-row flex-wrap gap-lg">
                {/* Card 1 */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm relative overflow-hidden">
                  <View className="flex-row justify-between items-center mb-md">
                    <View className="w-12 h-12 bg-blue-50 rounded-xl justify-center items-center">
                      <Trophy color="#1D4ED8" size={24} />
                    </View>
                    <View className="bg-green-50 px-2 py-1 rounded-full flex-row items-center">
                      <TrendingUp color="#22C55E" size={12} />
                      <Text className="text-green-success font-bold text-xs ml-1">+12%</Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 font-bold text-sm uppercase">Tổng số giải đấu</Text>
                  <Text className="text-slate-950 font-extrabold text-4xl mt-xs">1,248</Text>
                </View>

                {/* Card 2 */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm relative overflow-hidden">
                  <View className="flex-row justify-between items-center mb-md">
                    <View className="w-12 h-12 bg-emerald-50 rounded-xl justify-center items-center">
                      <Users color="#059669" size={24} />
                    </View>
                    <View className="bg-green-50 px-2 py-1 rounded-full flex-row items-center">
                      <TrendingUp color="#22C55E" size={12} />
                      <Text className="text-green-success font-bold text-xs ml-1">+8.4%</Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 font-bold text-sm uppercase">Người chơi hoạt động</Text>
                  <Text className="text-slate-950 font-extrabold text-4xl mt-xs">45,912</Text>
                </View>

                {/* Card 3 */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm relative overflow-hidden">
                  <View className="flex-row justify-between items-center mb-md">
                    <View className="w-12 h-12 bg-amber-50 rounded-xl justify-center items-center">
                      <DollarSign color="#D97706" size={24} />
                    </View>
                    <View className="bg-green-50 px-2 py-1 rounded-full flex-row items-center">
                      <TrendingUp color="#22C55E" size={12} />
                      <Text className="text-green-success font-bold text-xs ml-1">+22%</Text>
                    </View>
                  </View>
                  <Text className="text-slate-500 font-bold text-sm uppercase">Doanh thu tháng</Text>
                  <Text className="text-slate-950 font-extrabold text-4xl mt-xs">3,2 tỷ đ</Text>
                </View>
              </View>

              {/* Chart & Upcoming Section */}
              <View className="flex-row flex-wrap gap-lg">
                {/* Registration Chart Card */}
                <View className="flex-[2] min-w-[320px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-xl">
                    <Text className="text-slate-900 font-extrabold text-lg">Tăng trưởng đăng ký</Text>
                    <View className="flex-row bg-slate-100 p-1 rounded-lg">
                      <TouchableOpacity className="px-3 py-1.5 rounded-md bg-white shadow-xs">
                        <Text className="text-slate-800 font-bold text-xs">1W</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="px-3 py-1.5 rounded-md">
                        <Text className="text-slate-500 font-bold text-xs">1M</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="px-3 py-1.5 rounded-md">
                        <Text className="text-slate-500 font-bold text-xs">1Y</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* SVG Chart Drawing */}
                  <View className="h-64 justify-center items-center w-full relative">
                    <Svg width="100%" height="200" viewBox="0 0 500 200" className="w-full h-full">
                      <Defs>
                        <SvgLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.4" />
                          <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
                        </SvgLinearGradient>
                      </Defs>
                      {/* Grid Lines */}
                      <Path d="M 0 50 L 500 50 M 0 100 L 500 100 M 0 150 L 500 150" stroke="#F1F5F9" strokeWidth="1" />
                      {/* Gradient Filled Area */}
                      <Path
                        d="M 0 160 Q 100 130 200 90 T 400 40 L 500 10 L 500 200 L 0 200 Z"
                        fill="url(#gradient)"
                      />
                      {/* Stroke Line */}
                      <Path
                        d="M 0 160 Q 100 130 200 90 T 400 40 L 500 10"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.5"
                      />
                    </Svg>
                  </View>
                </View>

                {/* Upcoming List Card */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-xl">
                    <Text className="text-slate-900 font-extrabold text-lg">Sắp diễn ra</Text>
                    <Calendar color="#475569" size={18} />
                  </View>

                  <View className="space-y-lg flex-1">
                    {[
                      { date: 'TH10 12', title: 'Chung kết khu vực Pro-Am', venue: 'Cụm sân Mỹ Đình' },
                      { date: 'TH10 15', title: 'Giải trẻ mùa đông', venue: 'Trung tâm Tennis Đà Nẵng' },
                      { date: 'TH11 02', title: 'Elite Masters Series', venue: 'Nhiều cụm sân' }
                    ].map((item, idx) => (
                      <View key={idx} className="flex-row items-center border border-slate-100 p-md rounded-xl mb-4 bg-slate-50">
                        <View className="bg-white border border-slate-200 w-14 h-14 rounded-xl justify-center items-center p-sm">
                          <Text className="text-slate-400 font-bold text-[9px] uppercase leading-none">{item.date.split(' ')[0]}</Text>
                          <Text className="text-slate-800 font-extrabold text-base leading-none mt-1">{item.date.split(' ')[1]}</Text>
                        </View>
                        <View className="ml-md flex-1">
                          <Text className="text-slate-900 font-bold text-sm leading-tight">{item.title}</Text>
                          <Text className="text-slate-400 text-xs mt-1 flex-row items-center">
                            <MapPin size={10} color="#94A3B8" /> {item.venue}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Recent Match Activities List */}
              <View className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-md">
                <View className="px-xl py-lg border-b border-slate-200 flex-row justify-between items-center">
                  <Text className="text-slate-900 font-extrabold text-lg">Hoạt động trận đấu gần đây</Text>
                  <TouchableOpacity onPress={() => handleSidebarTabPress('tournaments')}>
                    <Text className="text-blue-vibrant font-bold text-sm">Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                <View className="overflow-x-auto">
                  <View className="min-w-[770px]">
                    {/* Header */}
                    <View className="flex-row bg-slate-50 px-xl py-md border-b border-slate-200 items-center">
                      <View style={{ width: 100 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Mã trận</Text>
                      </View>
                      <View style={{ width: 200 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Giải đấu</Text>
                      </View>
                      <View style={{ width: 220 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Vận động viên</Text>
                      </View>
                      <View style={{ width: 130 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Trạng thái</Text>
                      </View>
                      <View style={{ width: 120 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase text-right">Tỉ số/Kết quả</Text>
                      </View>
                    </View>
                    {/* Rows */}
                    {[
                      { id: '#MT-8902', name: 'Vòng loại Pro-Am', p1: 'J. Doe', p2: 'M. Smith', status: 'Đang thi đấu', color: 'bg-amber-50 text-amber-700 border border-amber-200', score: '6-4,  3-2' },
                      { id: '#MT-8901', name: 'Bán kết City League', p1: 'A. Wang', p2: 'K. Lee', status: 'Hoàn tất', color: 'bg-green-50 text-green-700 border border-green-200', score: '6-2,  6-4' }
                    ].map((item, idx) => (
                      <View key={idx} className="flex-row px-xl py-md items-center border-b border-slate-100">
                        <View style={{ width: 100 }}>
                          <Text className="text-slate-700 font-semibold text-sm">{item.id}</Text>
                        </View>
                        <View style={{ width: 200 }}>
                          <Text className="text-slate-900 font-bold text-sm">{item.name}</Text>
                        </View>
                        <View style={{ width: 220 }} className="flex-row items-center">
                          <View className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden mr-2">
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' }} className="w-full h-full" />
                          </View>
                          <Text className="text-slate-800 font-medium text-sm">{item.p1} vs {item.p2}</Text>
                        </View>
                        <View style={{ width: 130 }}>
                          <View className={`px-3 py-1 rounded-full self-start ${item.color}`}>
                            <Text className="text-[10px] font-bold uppercase leading-none">{item.status}</Text>
                          </View>
                        </View>
                        <View style={{ width: 120 }}>
                          <Text className="text-slate-900 font-bold text-sm text-right">{item.score}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================
              RENDER TAB: TOURNAMENTS DIRECTORY (Image 4)
              ======================================================== */}
          {!selectedTournamentId && activeSidebarTab === 'tournaments' && (
            <View className="space-y-lg">
              <View className="flex-row justify-between items-center flex-wrap gap-sm">
                <View>
                  <Text className="text-slate-900 font-extrabold text-3xl">Danh sách giải đấu</Text>
                  <Text className="text-slate-500 text-sm mt-1">Quản lý và theo dõi các giải đấu đang hoạt động trên toàn khu vực.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newId = `t-${tournaments.length + 1}`;
                    const newT: Tournament = {
                      id: newId,
                      title: 'Giải đấu mới',
                      location: 'Trung tâm thể thao khu vực 5',
                      sport: 'Badminton',
                      startDate: '2026-09-01',
                      endDate: '2026-09-05',
                      status: 'UPCOMING',
                      participantsLimit: 32,
                      registeredCount: 0,
                      description: 'Giải đấu mẫu vừa được tạo.',
                      rules: 'Áp dụng điều lệ tiêu chuẩn.',
                      categories: [{ name: 'Đơn mở rộng', fee: 200000, maxParticipants: 32 }]
                    };
                    setTournaments([...tournaments, newT]);
                    Alert.alert("Thành công", "Đã tạo giải đấu mẫu mới!");
                  }}
                  className="flex-row items-center bg-blue-vibrant px-lg py-md rounded-xl space-x-2"
                >
                  <Plus color="#FFFFFF" size={18} />
                  <Text className="text-white font-bold ml-2">+ Tạo giải đấu</Text>
                </TouchableOpacity>
              </View>

              {/* Filters Bar */}
              <View className="flex-row flex-wrap gap-md items-center justify-between bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
                <View className="flex-row flex-wrap gap-sm items-center flex-1 max-w-lg">
                  <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-md py-sm flex-1 mr-sm min-w-[200px]">
                    <Search color="#94A3B8" size={18} />
                    <TextInput
                      value={tournamentSearchQuery}
                      onChangeText={setTournamentSearchQuery}
                      placeholder="Tìm kiếm giải đấu..."
                      className="ml-sm flex-1 text-slate-800 text-sm outline-none"
                    />
                  </View>

                  {/* Sport Filter */}
                  <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-md py-sm mr-sm">
                    <Text className="text-slate-600 font-bold text-sm mr-2">Môn:</Text>
                    <select
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      className="bg-transparent text-slate-800 text-sm font-semibold outline-none border-none cursor-pointer"
                      style={{ paddingRight: '4px' }}
                    >
                      <option value="All">Tất cả môn</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Pickleball">Pickleball</option>
                    </select>
                  </View>

                  {/* Status Filter */}
                  <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-md py-sm">
                    <Text className="text-slate-600 font-bold text-sm mr-2">Trạng thái:</Text>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-slate-800 text-sm font-semibold outline-none border-none cursor-pointer"
                    >
                      <option value="All">Tất cả trạng thái</option>
                      <option value="ACTIVE">Đang diễn ra</option>
                      <option value="UPCOMING">Sắp diễn ra</option>
                      <option value="COMPLETED">Đã kết thúc</option>
                    </select>
                  </View>
                </View>

                <TouchableOpacity className="flex-row items-center border border-slate-200 px-lg py-sm rounded-xl space-x-2">
                  <Filter color="#475569" size={16} />
                  <Text className="text-slate-700 font-bold ml-1 text-sm">Sửa hàng loạt</Text>
                </TouchableOpacity>
              </View>

              {/* Tournament Table Grid */}
              <View className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <View className="overflow-x-auto">
                  <View className="min-w-[1020px]">
                    {/* Header */}
                    <View className="flex-row bg-slate-50 px-xl py-md border-b border-slate-200 items-center">
                      <View style={{ width: 50 }} className="justify-center items-center">
                        <View className="w-5 h-5 rounded-full border border-slate-300" />
                      </View>
                      <View style={{ width: 300 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Tên giải đấu</Text>
                      </View>
                      <View style={{ width: 120 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Môn</Text>
                      </View>
                      <View style={{ width: 150 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Thời gian</Text>
                      </View>
                      <View style={{ width: 180 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Vận động viên</Text>
                      </View>
                      <View style={{ width: 120 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Trạng thái</Text>
                      </View>
                      <View style={{ width: 100 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Thao tác</Text>
                      </View>
                    </View>

                    {/* Body */}
                    {filteredTournaments.map((t) => {
                      const pct = Math.round((t.registeredCount / t.participantsLimit) * 100);
                      const isFull = t.registeredCount >= t.participantsLimit;

                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => {
                            setSelectedTournamentId(t.id);
                            setActiveTournamentTab('overview');
                          }}
                          className="flex-row px-xl py-lg items-center border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          {/* Checkbox Column */}
                          <View style={{ width: 50 }} className="justify-center items-center">
                            <View className="w-5 h-5 rounded-full border border-slate-300" />
                          </View>

                          {/* Tournament Name & Location (with Trophy Icon) */}
                          <View style={{ width: 300 }} className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl bg-blue-50 justify-center items-center mr-3">
                              <Trophy color="#1D4ED8" size={18} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-slate-900 font-extrabold text-sm">{t.title}</Text>
                              <Text className="text-slate-400 text-xs mt-1 flex-row items-center">
                                <MapPin size={10} color="#94A3B8" /> {t.location}
                              </Text>
                            </View>
                          </View>

                          {/* Sport Column */}
                          <View style={{ width: 120 }}>
                            <Text className="text-slate-700 font-semibold text-sm">{t.sport}</Text>
                          </View>

                          {/* Date Column */}
                          <View style={{ width: 150 }}>
                            <Text className="text-slate-700 font-semibold text-sm">
                              {formatShortDate(t.startDate)} - {formatShortDate(t.endDate)}
                            </Text>
                          </View>

                          {/* Participants Column */}
                          <View style={{ width: 180 }} className="pr-md">
                            <View className="flex-row justify-between items-center mb-1">
                              <Text className="text-slate-900 font-bold text-xs">{t.registeredCount} / {t.participantsLimit}</Text>
                              <Text className="text-slate-400 font-bold text-xs">{pct}%</Text>
                            </View>
                            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <View
                                className={`h-full ${isFull ? 'bg-orange-highlight' : 'bg-blue-vibrant'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </View>
                          </View>

                          {/* Status Column */}
                          <View style={{ width: 120 }}>
                            <View className={`px-3 py-1 rounded-full self-start ${t.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border border-blue-200' : t.status === 'UPCOMING' ? 'bg-slate-50 text-slate-700 border border-slate-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                              <Text className="text-[10px] font-bold uppercase leading-none">{statusLabels[t.status]}</Text>
                            </View>
                          </View>

                          {/* Actions Column */}
                          <View style={{ width: 100 }}>
                            <Text className="text-blue-vibrant font-bold text-xs">Quản lý</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {filteredTournaments.length === 0 && (
                      <View className="p-2xl items-center">
                        <Info size={40} color="#94A3B8" />
                        <Text className="text-slate-400 font-semibold mt-md">Không tìm thấy giải đấu nào tương ứng</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================
              RENDER TAB: TOURNAMENT DETAILS (Image 2 & 3)
              ======================================================== */}
          {selectedTournamentId && (
            (() => {
              const tourney = tournaments.find(t => t.id === selectedTournamentId);
              if (!tourney) return null;

              const tourneyPlayers = players[selectedTournamentId] || [];
              const tourneyMatches = matches[selectedTournamentId] || [];

              return (
                <View className="space-y-lg relative">

                  {/* Tournament Detail Header */}
                  <View className="flex-row justify-between items-center flex-wrap gap-sm bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                    <View className="flex-row items-center space-x-4">
                      <View className="w-14 h-14 bg-blue-50 rounded-2xl justify-center items-center">
                        <Trophy color="#1D4ED8" size={28} />
                      </View>
                      <View className="ml-md">
                        <View className="flex-row items-center space-x-2">
                          <View className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-bold uppercase leading-none">{statusLabels[tourney.status]}</Text>
                          </View>
                          <Text className="text-slate-400 text-xs font-semibold">
                            {formatShortDate(tourney.startDate)} - {formatShortDate(tourney.endDate)}
                          </Text>
                        </View>
                        <Text className="text-slate-900 font-extrabold text-2xl mt-1 leading-tight">{tourney.title}</Text>
                        <Text className="text-slate-400 text-xs mt-1 flex-row items-center">
                          <MapPin size={10} color="#94A3B8" /> {tourney.location}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-3 gap-sm">
                      <TouchableOpacity className="flex-row items-center bg-white border border-slate-200 px-lg py-md rounded-xl space-x-2">
                        <Share2 color="#475569" size={16} />
                        <Text className="text-slate-700 font-bold ml-1">Chia sẻ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setActiveTournamentTab('settings')}
                        className="flex-row items-center bg-blue-vibrant px-lg py-md rounded-xl space-x-2"
                      >
                        <Edit2 color="#FFFFFF" size={16} />
                        <Text className="text-white font-bold ml-1">Sửa chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sub-Navigation Tabs */}
                  <View className="flex-row border-b border-slate-200 overflow-x-auto">
                    {[
                      { id: 'overview', name: 'Tổng quan' },
                      { id: 'players', name: 'Vận động viên' },
                      { id: 'matches', name: 'Trận đấu' },
                      { id: 'bracket', name: 'Nhánh đấu' },
                      { id: 'schedule', name: 'Lịch thi đấu' },
                      { id: 'results', name: 'Kết quả' },
                      { id: 'settings', name: 'Cài đặt' }
                    ].map((tab) => {
                      const isActive = activeTournamentTab === tab.id;
                      return (
                        <TouchableOpacity
                          key={tab.id}
                          onPress={() => setActiveTournamentTab(tab.id as any)}
                          className={`pb-md px-lg border-b-2 mr-md ${isActive ? 'border-blue-vibrant' : 'border-transparent'}`}
                        >
                          <Text className={`font-bold text-sm ${isActive ? 'text-blue-vibrant' : 'text-slate-400'}`}>{tab.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* ========================================================
                      SUB-TAB: OVERVIEW
                      ======================================================== */}
                  {activeTournamentTab === 'overview' && (
                    <View className="flex-row flex-wrap gap-lg">
                      <View className="flex-[2] min-w-[300px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm space-y-lg">
                        <View>
                          <Text className="text-slate-900 font-extrabold text-lg mb-sm">Giới thiệu giải đấu</Text>
                          <Text className="text-slate-600 text-sm leading-relaxed">{tourney.description}</Text>
                        </View>
                        <View>
                          <Text className="text-slate-900 font-extrabold text-lg mb-sm">Điều lệ giải</Text>
                          <Text className="text-slate-600 text-sm leading-relaxed">{tourney.rules}</Text>
                        </View>
                      </View>

                      <View className="flex-1 min-w-[260px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm space-y-lg">
                        <Text className="text-slate-900 font-extrabold text-lg mb-sm">Hạng mục & Lệ phí</Text>
                        <View className="space-y-md">
                          {tourney.categories.map((c, idx) => (
                            <View key={idx} className="bg-slate-50 border border-slate-100 p-md rounded-xl flex-row justify-between items-center">
                              <View>
                                <Text className="text-slate-900 font-bold text-sm">{c.name}</Text>
                                <Text className="text-slate-400 text-xs mt-1">Giới hạn: {c.maxParticipants} VĐV</Text>
                              </View>
                              <Text className="text-blue-vibrant font-extrabold text-sm">{c.fee.toLocaleString('vi-VN')} đ</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: PLAYERS (Image 2)
                      ======================================================== */}
                  {activeTournamentTab === 'players' && (
                    <View className="space-y-lg">
                      {/* Sub-Filters */}
                      <View className="flex-row flex-wrap gap-md items-center justify-between bg-white border border-slate-200 p-md rounded-2xl shadow-sm">
                        <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-md py-sm flex-1 max-w-sm mr-md min-w-[200px]">
                          <Search color="#94A3B8" size={18} />
                          <TextInput
                            value={playerSearchQuery}
                            onChangeText={setPlayerSearchQuery}
                            placeholder="Tìm vận động viên theo tên, ID hoặc CLB..."
                            className="ml-sm flex-1 text-slate-800 text-sm outline-none"
                          />
                        </View>

                        <View className="flex-row items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                          {(['All', 'Pending', 'Approved'] as const).map((tab) => {
                            const count = tab === 'All'
                              ? tourneyPlayers.length
                              : tab === 'Pending'
                                ? tourneyPlayers.filter(p => p.status === 'PENDING').length
                                : tourneyPlayers.filter(p => p.status === 'APPROVED').length;
                            const isActive = playerFilterTab === tab;
                            return (
                              <TouchableOpacity
                                key={tab}
                                onPress={() => setPlayerFilterTab(tab)}
                                className={`px-4 py-2 rounded-lg ${isActive ? 'bg-white shadow-xs' : ''}`}
                              >
                                <Text className={`font-bold text-xs ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {playerFilterLabels[tab]} ({count})
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Players Grid */}
                      <View className="flex-row flex-wrap gap-lg">
                        {tourneyPlayers
                          .filter(p => {
                            const matchesSearch = p.name.toLowerCase().includes(playerSearchQuery.toLowerCase());
                            const matchesTab = playerFilterTab === 'All' ||
                              (playerFilterTab === 'Pending' && p.status === 'PENDING') ||
                              (playerFilterTab === 'Approved' && p.status === 'APPROVED');
                            return matchesSearch && matchesTab;
                          })
                          .map((p) => {
                            const isPending = p.status === 'PENDING';
                            return (
                              <View key={p.id} className="w-[280px] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-col justify-between p-lg relative">
                                <View className="flex-row justify-between items-start mb-md">
                                  <View className="flex-row items-center space-x-3">
                                    <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center overflow-hidden border border-slate-100">
                                      {p.avatar ? (
                                        <Image source={{ uri: p.avatar }} className="w-full h-full" />
                                      ) : (
                                        <Text className="text-blue-vibrant font-extrabold text-sm text-center w-full leading-none">
                                          {p.name.split(' ').map(n => n[0]).join('')}
                                        </Text>
                                      )}
                                    </View>
                                    <View className="ml-sm">
                                      <Text className="text-slate-900 font-extrabold text-sm">{p.name}</Text>
                                      <Text className="text-slate-400 text-xs mt-0.5">ID: {p.id.toUpperCase()}</Text>
                                    </View>
                                  </View>

                                  <View className={`px-2 py-0.5 rounded-md border ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    <Text className="text-[9px] font-bold uppercase leading-none">{statusLabels[p.status]}</Text>
                                  </View>
                                </View>

                                <View className="border-t border-b border-slate-100 py-md my-md flex-row justify-between items-center">
                                  <View>
                                    <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Hạng mục</Text>
                                    <Text className="text-slate-800 font-bold text-xs mt-1">{p.division}</Text>
                                  </View>
                                  <View className="items-end">
                                    <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Xếp hạng</Text>
                                    <Text className="text-blue-vibrant font-extrabold text-xs mt-1">{p.rating}</Text>
                                  </View>
                                </View>

                                {/* Action Buttons */}
                                {isPending ? (
                                  <View className="flex-row items-center space-x-2 gap-sm">
                                    <TouchableOpacity
                                      onPress={() => handleRejectPlayer(selectedTournamentId, p.id)}
                                      className="flex-1 border border-red-200 bg-red-50 py-sm rounded-lg items-center"
                                    >
                                    <Text className="text-red-600 font-bold text-xs">Từ chối</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => handleApprovePlayer(selectedTournamentId, p.id)}
                                      className="flex-1 bg-blue-vibrant py-sm rounded-lg items-center"
                                    >
                                      <Text className="text-white font-bold text-xs">Duyệt</Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <TouchableOpacity className="w-full bg-slate-50 border border-slate-200 py-sm rounded-lg items-center">
                                    <Text className="text-slate-600 font-bold text-xs">Quản lý đăng ký</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: BRACKETS (Image 3)
                      ======================================================== */}
                  {activeTournamentTab === 'bracket' && (
                    <View className="flex-row relative">

                      {/* Tree Layout View */}
                      <View className="flex-1 bg-slate-50 border border-slate-200 p-xl rounded-2xl shadow-sm min-h-[450px]">
                        <View className="flex-row justify-between items-center mb-xl">
                          <View>
                            <Text className="text-slate-900 font-extrabold text-xl">Đơn nam chuyên nghiệp - Masters 1000</Text>
                            <Text className="text-slate-400 text-xs mt-0.5">Sơ đồ tứ kết và bán kết</Text>
                          </View>
                          <TouchableOpacity className="flex-row items-center bg-blue-vibrant px-lg py-sm rounded-xl">
                            <Text className="text-white font-bold text-xs">Tự động đi tiếp</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Visual Brackets Tree */}
                        <ScrollView horizontal contentContainerStyle={{ paddingRight: 60 }} className="flex-row">

                          {/* Quarterfinals Round */}
                          <View className="space-y-lg mr-xl w-[260px] justify-around">
                            <Text className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-2 self-center">Tứ kết</Text>
                            {tourneyMatches.filter(m => m.round === 'Quarterfinals').map(m => {
                              const isSelected = selectedMatchId === m.id;
                              const isCompleted = m.status === 'COMPLETED';

                              return (
                                <TouchableOpacity
                                  key={m.id}
                                  onPress={() => handleSelectMatch(m)}
                                  className={`p-md bg-white border rounded-2xl shadow-sm mb-lg ${isSelected ? 'border-blue-vibrant ring-2 ring-blue-100' : 'border-slate-200'}`}
                                >
                                  <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-400 font-bold text-[10px]">Trận {m.id.split('-')[1]} • {m.court}</Text>
                                    <View className={`px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-50 text-red-600 border border-red-100' : isCompleted ? 'bg-slate-50 text-slate-500 border border-slate-100' : 'bg-slate-50 text-slate-400'}`}>
                                      <Text className="text-[8px] font-extrabold uppercase leading-none">{statusLabels[m.status]}</Text>
                                    </View>
                                  </View>

                                  {/* P1 Row */}
                                  <View className="flex-row justify-between items-center py-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player1Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player1Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player1Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player1Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score1.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score1[idx] > m.score2[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>

                                  {/* P2 Row */}
                                  <View className="flex-row justify-between items-center py-1 border-t border-slate-50 mt-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player2Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player2Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player2Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player2Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score2.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score2[idx] > m.score1[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* Connector lines simulation */}
                          <View className="w-10 justify-around items-center h-full hidden md:flex">
                            <View className="h-[120px] w-full border-r-2 border-t-2 border-b-2 border-slate-200 mr-2" />
                            <View className="h-[120px] w-full border-r-2 border-t-2 border-b-2 border-slate-200 mr-2" />
                          </View>

                          {/* Semifinals Round */}
                          <View className="space-y-lg mr-xl w-[260px] justify-around">
                            <Text className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-2 self-center text-center">Bán kết</Text>
                            {tourneyMatches.filter(m => m.round === 'Semifinals').map(m => {
                              const isSelected = selectedMatchId === m.id;
                              const isCompleted = m.status === 'COMPLETED';

                              return (
                                <TouchableOpacity
                                  key={m.id}
                                  onPress={() => handleSelectMatch(m)}
                                  className={`p-md bg-white border rounded-2xl shadow-sm mb-lg ${isSelected ? 'border-blue-vibrant ring-2 ring-blue-100' : 'border-slate-200'}`}
                                >
                                  <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-400 font-bold text-[10px]">Trận {m.id.split('-')[1]} • {m.court}</Text>
                                    <View className={`px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-50 text-red-600 border border-red-100' : isCompleted ? 'bg-slate-50 text-slate-500 border border-slate-100' : 'bg-slate-50 text-slate-400'}`}>
                                      <Text className="text-[8px] font-extrabold uppercase leading-none">{statusLabels[m.status]}</Text>
                                    </View>
                                  </View>

                                  {/* P1 Row */}
                                  <View className="flex-row justify-between items-center py-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player1Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player1Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player1Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player1Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score1.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score1[idx] > m.score2[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>

                                  {/* P2 Row */}
                                  <View className="flex-row justify-between items-center py-1 border-t border-slate-50 mt-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player2Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player2Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player2Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player2Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score2.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score2[idx] > m.score1[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* Connector lines simulation */}
                          <View className="w-10 justify-around items-center h-full hidden md:flex">
                            <View className="h-[200px] w-full border-r-2 border-t-2 border-b-2 border-slate-200 mr-2" />
                          </View>

                          {/* Finals Round */}
                          <View className="space-y-lg w-[260px] justify-around">
                            <Text className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-2 self-center text-center">Chung kết</Text>
                            {tourneyMatches.filter(m => m.round === 'Finals').map(m => {
                              const isSelected = selectedMatchId === m.id;
                              const isCompleted = m.status === 'COMPLETED';

                              return (
                                <TouchableOpacity
                                  key={m.id}
                                  onPress={() => handleSelectMatch(m)}
                                  className={`p-md bg-white border rounded-2xl shadow-sm ${isSelected ? 'border-blue-vibrant ring-2 ring-blue-100' : 'border-slate-200'}`}
                                >
                                  <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-slate-400 font-bold text-[10px]">Trận {m.id.split('-')[1]} • {m.court}</Text>
                                    <View className={`px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-50 text-red-600 border border-red-100' : isCompleted ? 'bg-slate-50 text-slate-500 border border-slate-100' : 'bg-slate-50 text-slate-400'}`}>
                                      <Text className="text-[8px] font-extrabold uppercase leading-none">{statusLabels[m.status]}</Text>
                                    </View>
                                  </View>

                                  {/* P1 Row */}
                                  <View className="flex-row justify-between items-center py-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player1Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player1Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player1Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player1Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score1.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score1[idx] > m.score2[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>

                                  {/* P2 Row */}
                                  <View className="flex-row justify-between items-center py-1 border-t border-slate-50 mt-1">
                                    <View className="flex-row items-center space-x-2 flex-1">
                                      <View className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden mr-sm">
                                        {getPlayerAvatar(selectedTournamentId, m.player2Id) ? (
                                          <Image source={{ uri: getPlayerAvatar(selectedTournamentId, m.player2Id) }} className="w-full h-full" />
                                        ) : null}
                                      </View>
                                      <Text className={`text-xs flex-1 ${m.winnerId === m.player2Id ? 'font-extrabold text-slate-900' : m.winnerId ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                                        {getPlayerName(selectedTournamentId, m.player2Id)}
                                      </Text>
                                    </View>
                                    <View className="flex-row space-x-1 ml-sm">
                                      {m.score2.map((val, idx) => (
                                        <Text key={idx} className={`text-xs w-4 text-center font-bold ${m.score2[idx] > m.score1[idx] ? 'text-blue-vibrant' : 'text-slate-400'}`}>{val}</Text>
                                      ))}
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                        </ScrollView>
                      </View>

                      {/* ========================================================
                          RIGHT PANEL: MATCH DETAILS EDIT SIDEBAR (Image 3)
                          ======================================================== */}
                      {selectedMatchId && (() => {
                        const m = tourneyMatches.find(x => x.id === selectedMatchId);
                        if (!m) return null;

                        return (
                          <View className="w-80 bg-white border border-slate-200 p-xl rounded-2xl shadow-lg ml-lg flex-col justify-between space-y-md z-30">
                            <View className="space-y-lg">
                              <View className="flex-row justify-between items-center border-b border-slate-100 pb-md">
                                <View>
                                  <Text className="text-slate-900 font-extrabold text-base">Chi tiết trận đấu</Text>
                                  <Text className="text-slate-400 text-xs mt-0.5">{roundLabels[m.round]} ({m.id.toUpperCase()})</Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedMatchId(null)} className="p-sm bg-slate-50 hover:bg-slate-100 rounded-lg">
                                  <X color="#475569" size={16} />
                                </TouchableOpacity>
                              </View>

                              {/* Configurations */}
                              <Text className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Cấu hình</Text>
                              <View className="space-y-md">
                                <View>
                                  <Text className="text-slate-600 font-bold text-xs mb-2">Trạng thái</Text>
                                  <select
                                    value={editMatchStatus}
                                    onChange={(e) => setEditMatchStatus(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-semibold outline-none cursor-pointer"
                                  >
                                    <option value="UPCOMING">Sắp diễn ra</option>
                                    <option value="LIVE">Trực tiếp</option>
                                    <option value="FINAL">Hoàn tất</option>
                                  </select>
                                </View>

                                <View>
                                  <Text className="text-slate-600 font-bold text-xs mb-2">Phân sân</Text>
                                  <input
                                    type="text"
                                    value={editCourt}
                                    onChange={(e) => setEditCourt(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-medium outline-none"
                                  />
                                </View>

                                <View>
                                  <Text className="text-slate-600 font-bold text-xs mb-2">Trọng tài chính</Text>
                                  <input
                                    type="text"
                                    value={editUmpire}
                                    onChange={(e) => setEditUmpire(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-medium outline-none"
                                  />
                                </View>
                              </View>

                              {/* Score Management */}
                              <Text className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mt-md">Quản lý tỉ số</Text>
                              <View className="space-y-sm bg-slate-50 border border-slate-100 p-md rounded-xl">
                                <View className="flex-row justify-between items-center mb-sm">
                                  <Text className="text-slate-800 font-bold text-xs flex-1 truncate pr-sm">{getPlayerName(selectedTournamentId, m.player1Id)}</Text>
                                  <View className="flex-row space-x-2">
                                    {[0, 1, 2].map(idx => (
                                      <input
                                        key={idx}
                                        type="number"
                                        maxLength={2}
                                        value={editSetScores.p1[idx]}
                                        onChange={(e) => {
                                          const copy = [...editSetScores.p1];
                                          copy[idx] = e.target.value;
                                          setEditSetScores({ ...editSetScores, p1: copy });
                                        }}
                                        className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-center text-slate-900 font-bold text-xs outline-none"
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View className="flex-row justify-between items-center">
                                  <Text className="text-slate-800 font-bold text-xs flex-1 truncate pr-sm">{getPlayerName(selectedTournamentId, m.player2Id)}</Text>
                                  <View className="flex-row space-x-2">
                                    {[0, 1, 2].map(idx => (
                                      <input
                                        key={idx}
                                        type="number"
                                        maxLength={2}
                                        value={editSetScores.p2[idx]}
                                        onChange={(e) => {
                                          const copy = [...editSetScores.p2];
                                          copy[idx] = e.target.value;
                                          setEditSetScores({ ...editSetScores, p2: copy });
                                        }}
                                        className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-center text-slate-900 font-bold text-xs outline-none"
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>
                            </View>

                            {/* Panel Action Buttons */}
                            <View className="flex-row items-center space-x-2 gap-sm pt-xl border-t border-slate-100 mt-xl">
                              <TouchableOpacity
                                onPress={() => handleAutoAdvance(selectedTournamentId)}
                                className="flex-1 bg-white border border-slate-200 py-md rounded-xl items-center"
                              >
                                <Text className="text-slate-700 font-bold text-xs">Tự động đi tiếp</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleSaveScore(selectedTournamentId)}
                                className="flex-1 bg-blue-vibrant py-md rounded-xl items-center"
                              >
                                <Text className="text-white font-bold text-xs">Lưu tỉ số</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: MATCHES
                      ======================================================== */}
                  {activeTournamentTab === 'matches' && (
                    <View className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <View className="px-xl py-lg border-b border-slate-200">
                        <Text className="text-slate-900 font-extrabold text-lg">Danh sách các trận đấu</Text>
                      </View>
                      <View className="p-xl space-y-md">
                        {tourneyMatches.map((m) => (
                          <View key={m.id} className="flex-row justify-between items-center border border-slate-100 p-md rounded-xl bg-slate-50">
                            <View>
                              <Text className="text-slate-900 font-bold text-sm">Trận {m.id.split('-')[1]} ({roundLabels[m.round]})</Text>
                              <Text className="text-slate-400 text-xs mt-1">Trọng tài: {m.chairUmpire} | Sân: {m.court}</Text>
                            </View>
                            <View className="flex-row items-center space-x-4">
                              <Text className="text-slate-800 font-extrabold text-sm mr-md">
                                {getPlayerName(selectedTournamentId, m.player1Id)} vs {getPlayerName(selectedTournamentId, m.player2Id)}
                              </Text>
                              <View className={`px-2 py-0.5 rounded ${m.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                <Text className="text-[10px] font-bold uppercase">{statusLabels[m.status]}</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: SCHEDULE
                      ======================================================== */}
                  {activeTournamentTab === 'schedule' && (
                    <View className="bg-white border border-slate-200 rounded-2xl shadow-sm p-xl space-y-lg">
                      <Text className="text-slate-900 font-extrabold text-lg border-b border-slate-100 pb-sm">Lịch thi đấu dự kiến</Text>
                      <View className="space-y-md">
                        <View className="flex-row items-start">
                          <View className="w-2 h-2 rounded-full bg-blue-vibrant mt-2 mr-3" />
                          <View className="flex-1">
                            <Text className="text-slate-800 font-bold text-sm">Ngày 1: Vòng 1 & 2</Text>
                            <Text className="text-slate-500 text-xs mt-1">Thi đấu tất cả các cặp đấu để chọn ra top 16.</Text>
                          </View>
                        </View>
                        <View className="flex-row items-start">
                          <View className="w-2 h-2 rounded-full bg-blue-vibrant mt-2 mr-3" />
                          <View className="flex-1">
                            <Text className="text-slate-800 font-bold text-sm">Ngày 2: Vòng Tứ kết & Bán kết</Text>
                            <Text className="text-slate-500 text-xs mt-1">Thi đấu tại sân số 1, 2, 3 và Sân Trung tâm.</Text>
                          </View>
                        </View>
                        <View className="flex-row items-start">
                          <View className="w-2 h-2 rounded-full bg-blue-vibrant mt-2 mr-3" />
                          <View className="flex-1">
                            <Text className="text-slate-800 font-bold text-sm">Ngày 3: Chung kết & Trao giải</Text>
                            <Text className="text-slate-500 text-xs mt-1">Bắt đầu từ 3:00 PM tại Sân Trung tâm.</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: RESULTS
                      ======================================================== */}
                  {activeTournamentTab === 'results' && (
                    <View className="bg-white border border-slate-200 rounded-2xl shadow-sm p-xl space-y-lg">
                      <Text className="text-slate-900 font-extrabold text-lg border-b border-slate-100 pb-sm">Kết quả giải đấu</Text>
                      <View className="items-center py-xl bg-slate-50 border border-slate-100 rounded-xl space-y-md">
                        <Trophy size={48} color="#D97706" />
                        <View className="items-center">
                          <Text className="text-slate-900 font-extrabold text-lg">Chung kết & Xếp hạng</Text>
                          <Text className="text-slate-500 text-xs mt-1">Danh sách nhà vô địch sẽ được cập nhật sau khi trận đấu cuối cùng kết thúc.</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* ========================================================
                      SUB-TAB: SETTINGS
                      ======================================================== */}
                  {activeTournamentTab === 'settings' && (
                    <View className="bg-white border border-slate-200 rounded-2xl shadow-sm p-xl space-y-lg">
                      <Text className="text-slate-900 font-extrabold text-lg border-b border-slate-100 pb-sm">Cài đặt thông tin giải đấu</Text>

                      <View className="space-y-md max-w-lg">
                        <View>
                          <Text className="text-slate-600 font-bold text-xs mb-2">Tên giải đấu</Text>
                          <input
                            type="text"
                            value={tourney.title}
                            onChange={(e) => {
                              const updated = tournaments.map(t => t.id === selectedTournamentId ? { ...t, title: e.target.value } : t);
                              setTournaments(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-semibold outline-none"
                          />
                        </View>

                        <View>
                          <Text className="text-slate-600 font-bold text-xs mb-2">Địa điểm</Text>
                          <input
                            type="text"
                            value={tourney.location}
                            onChange={(e) => {
                              const updated = tournaments.map(t => t.id === selectedTournamentId ? { ...t, location: e.target.value } : t);
                              setTournaments(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-medium outline-none"
                          />
                        </View>

                        <View>
                          <Text className="text-slate-600 font-bold text-xs mb-2">Môn thể thao</Text>
                          <input
                            type="text"
                            value={tourney.sport}
                            onChange={(e) => {
                              const updated = tournaments.map(t => t.id === selectedTournamentId ? { ...t, sport: e.target.value } : t);
                              setTournaments(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-md text-slate-800 text-sm font-medium outline-none"
                          />
                        </View>

                        <TouchableOpacity
                          onPress={() => Alert.alert("Thành công", "Đã lưu cài đặt giải đấu!")}
                          className="bg-blue-vibrant py-md rounded-xl items-center self-start px-xl mt-md"
                        >
                          <Text className="text-white font-bold text-sm">Lưu thay đổi</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                </View>
              );
            })()
          )}

          {/* ========================================================
              RENDER TAB: MATCH OFFICIALS (Placeholder)
              ======================================================== */}
          {!selectedTournamentId && activeSidebarTab === 'officials' && (
            <View className="bg-white border border-slate-200 rounded-2xl shadow-sm p-xl space-y-md">
              <Text className="text-slate-900 font-extrabold text-xl">Danh sách trọng tài</Text>
              <Text className="text-slate-500 text-sm">Danh sách trọng tài chính và giám sát chuyên môn trong khu vực.</Text>
              <View className="py-2xl border-t border-slate-100 items-center justify-center">
                <Briefcase size={36} color="#94A3B8" />
                <Text className="text-slate-400 font-semibold mt-md">Danh sách đang được cập nhật</Text>
              </View>
            </View>
          )}

          {/* ========================================================
              RENDER TAB: ANALYTICS (Placeholder)
              ======================================================== */}
          {!selectedTournamentId && activeSidebarTab === 'analytics' && (
            <View className="space-y-lg">
              {/* Header */}
              <View className="flex-row justify-between items-center flex-wrap gap-sm">
                <View>
                  <Text className="text-slate-900 font-extrabold text-3xl">Phân tích hiệu suất</Text>
                  <Text className="text-slate-500 text-sm mt-1">Theo dõi doanh thu, người chơi và mức độ tham gia theo thời gian thực.</Text>
                </View>
                <View className="flex-row items-center space-x-3 gap-sm flex-wrap">
                  <View className="flex-row items-center border border-slate-200 bg-white rounded-xl px-md py-sm">
                    <Calendar color="#475569" size={16} />
                    <select className="bg-transparent text-slate-800 text-sm font-semibold outline-none border-none ml-2 cursor-pointer">
                      <option>30 ngày qua</option>
                      <option>7 ngày qua</option>
                      <option>Năm vừa rồi</option>
                    </select>
                  </View>
                  <View className="flex-row items-center border border-slate-200 bg-white rounded-xl px-md py-sm">
                    <Globe color="#475569" size={16} />
                    <select className="bg-transparent text-slate-800 text-sm font-semibold outline-none border-none ml-2 cursor-pointer">
                      <option>Tất cả khu vực</option>
                      <option>Đà Nẵng</option>
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                    </select>
                  </View>
                  <TouchableOpacity className="flex-row items-center bg-blue-vibrant px-lg py-md rounded-xl space-x-2">
                    <Download color="#FFFFFF" size={16} />
                    <Text className="text-white font-bold ml-1 text-sm">Xuất báo cáo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* KPI cards */}
              <View className="flex-row flex-wrap gap-lg">
                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-md">
                    <Text className="text-slate-400 text-xs font-bold uppercase">Tổng doanh thu</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center">
                      <DollarSign color="#1D4ED8" size={16} />
                    </View>
                  </View>
                  <Text className="text-slate-950 font-extrabold text-3xl">12,1 tỷ đ</Text>
                  <View className="flex-row items-center mt-2">
                    <TrendingUp color="#22C55E" size={12} />
                    <Text className="text-green-success font-bold text-xs ml-1">+12,5% so với kỳ trước</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-md">
                    <Text className="text-slate-400 text-xs font-bold uppercase">Người chơi hoạt động</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center">
                      <Users color="#1D4ED8" size={16} />
                    </View>
                  </View>
                  <Text className="text-slate-950 font-extrabold text-3xl">12,450</Text>
                  <View className="flex-row items-center mt-2">
                    <TrendingUp color="#22C55E" size={12} />
                    <Text className="text-green-success font-bold text-xs ml-1">+8,2% so với kỳ trước</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-md">
                    <Text className="text-slate-400 text-xs font-bold uppercase">Giải đấu</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center">
                      <Trophy color="#1D4ED8" size={16} />
                    </View>
                  </View>
                  <Text className="text-slate-950 font-extrabold text-3xl">342</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-red-500 font-bold text-xs">-2,1% so với kỳ trước</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-md">
                    <Text className="text-slate-400 text-xs font-bold uppercase">Tương tác trung bình</Text>
                    <View className="w-8 h-8 bg-blue-50 rounded-lg justify-center items-center">
                      <Activity color="#1D4ED8" size={16} />
                    </View>
                  </View>
                  <Text className="text-slate-950 font-extrabold text-3xl">4h 12m</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-slate-400 font-bold text-xs">Không đổi</Text>
                  </View>
                </View>
              </View>

              {/* Chart trends + Demographics */}
              <View className="flex-row flex-wrap gap-lg">
                {/* Growth Trends chart */}
                <View className="flex-[2] min-w-[320px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-xl">
                    <Text className="text-slate-900 font-extrabold text-lg">Xu hướng tăng trưởng</Text>
                    <View className="flex-row bg-slate-100 p-1 rounded-lg">
                      <TouchableOpacity className="px-3 py-1.5 rounded-md bg-white shadow-xs">
                        <Text className="text-slate-800 font-bold text-xs">Doanh thu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="px-3 py-1.5 rounded-md">
                        <Text className="text-slate-500 font-bold text-xs">Đăng ký</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* SVG Chart Outline with monthly nodes */}
                  <View className="h-64 justify-center items-center w-full relative">
                    <Svg width="100%" height="200" viewBox="0 0 500 200" className="w-full h-full">
                      <Defs>
                        <SvgLinearGradient id="gradient-blue-2" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.4" />
                          <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
                        </SvgLinearGradient>
                      </Defs>
                      <Path d="M 0 40 L 500 40 M 0 80 L 500 80 M 0 120 L 500 120 M 0 160 L 500 160" stroke="#F1F5F9" strokeWidth="1" />
                      <Path
                        d="M 20 160 Q 80 120 150 130 T 280 80 T 400 95 T 480 30 L 480 200 L 20 200 Z"
                        fill="url(#gradient-blue-2)"
                      />
                      <Path
                        d="M 20 160 Q 80 120 150 130 T 280 80 T 400 95 T 480 30"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.5"
                      />

                      {/* Interactive circles */}
                      <SvgCircle cx="20" cy="160" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="95" cy="130" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="160" cy="132" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="230" cy="98" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="308" cy="78" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="390" cy="92" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                      <SvgCircle cx="480" cy="30" r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                    </Svg>
                  </View>
                  <View className="flex-row justify-between px-md mt-sm">
                    {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((m) => (
                      <Text key={m} className="text-slate-400 font-bold text-xs">{m}</Text>
                    ))}
                  </View>
                </View>

                {/* Demographics ring chart */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm flex-col justify-between">
                  <Text className="text-slate-900 font-extrabold text-lg mb-md">Nhân khẩu học</Text>

                  <View className="h-48 justify-center items-center relative">
                    <Svg width={168} height={168} viewBox="0 0 200 200">
                      <SvgCircle cx="100" cy="100" r="64" stroke="#E2E8F0" strokeWidth="18" fill="transparent" />
                      <SvgCircle cx="100" cy="100" r="64" stroke="#2563EB" strokeWidth="18" fill="transparent" strokeDasharray="181 402" strokeDashoffset="0" strokeLinecap="round" />
                      <SvgCircle cx="100" cy="100" r="64" stroke="#3B82F6" strokeWidth="18" fill="transparent" strokeDasharray="121 402" strokeDashoffset="-181" strokeLinecap="round" />
                      <SvgCircle cx="100" cy="100" r="64" stroke="#94A3B8" strokeWidth="18" fill="transparent" strokeDasharray="100 402" strokeDashoffset="-302" strokeLinecap="round" />
                    </Svg>
                    <View className="absolute inset-0 justify-center items-center px-8">
                      <Text className="text-slate-900 font-extrabold text-xl leading-tight text-center">45%</Text>
                      <Text className="text-slate-500 font-bold text-[10px] uppercase mt-1 text-center leading-tight">Chuyên nghiệp</Text>
                    </View>
                  </View>

                  <View className="space-y-sm mt-md">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-blue-vibrant mr-sm" />
                        <Text className="text-slate-600 font-medium text-sm">Chuyên nghiệp</Text>
                      </View>
                      <Text className="text-slate-950 font-bold text-sm">45%</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-blue-500 mr-sm" />
                        <Text className="text-slate-600 font-medium text-sm">Phong trào</Text>
                      </View>
                      <Text className="text-slate-950 font-bold text-sm">30%</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-slate-300 mr-sm" />
                        <Text className="text-slate-600 font-medium text-sm">Học sinh sinh viên</Text>
                      </View>
                      <Text className="text-slate-950 font-bold text-sm">25%</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Top Performing Categories */}
              <View className="bg-white border border-slate-200 rounded-2xl shadow-sm p-xl space-y-md">
                <View className="flex-row justify-between items-center mb-md border-b border-slate-100 pb-md">
                  <Text className="text-slate-900 font-extrabold text-lg">Hạng mục nổi bật</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-vibrant font-bold text-sm flex-row items-center">
                      Xem báo cáo đầy đủ <ChevronRight size={14} className="ml-1" />
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-md">
                  {[
                    { title: "Đơn nam chuyên nghiệp", info: "Tennis • 1.204 đang hoạt động", amount: "3,1 tỷ đ", change: "+15% so với năm trước", rank: "Hạng #1" }
                  ].map((cat, idx) => (
                    <View key={idx} className="flex-row justify-between items-center border border-slate-100 p-md rounded-xl bg-slate-50">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 justify-center items-center mr-3">
                          <Trophy color="#2563EB" size={18} />
                        </View>
                        <View>
                          <Text className="text-slate-900 font-extrabold text-sm">{cat.title}</Text>
                          <Text className="text-slate-400 text-xs mt-1">{cat.info}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className="items-end mr-xl">
                          <Text className="text-slate-900 font-extrabold text-sm">{cat.amount}</Text>
                          <Text className="text-green-success font-bold text-[10px] mt-0.5">{cat.change}</Text>
                        </View>
                        <View className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                          <Text className="text-blue-700 font-bold text-xs">{cat.rank}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {!selectedTournamentId && activeSidebarTab === 'regional' && (
            <View className="space-y-lg">
              {/* Header */}
              <View className="flex-row justify-between items-center flex-wrap gap-sm">
                <View>
                  <Text className="text-slate-900 font-extrabold text-3xl">Khu vực Việt Nam</Text>
                  <Text className="text-slate-500 text-sm mt-1">Quản lý sân đấu, ban tổ chức và giải đang diễn ra tại các khu vực trong nước.</Text>
                </View>
                <View className="flex-row items-center space-x-3 gap-sm">
                  <TouchableOpacity className="flex-row items-center bg-white border border-slate-200 px-lg py-md rounded-xl space-x-2">
                    <Download color="#475569" size={18} />
                    <Text className="text-slate-700 font-bold ml-2">Xuất báo cáo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center bg-blue-vibrant px-lg py-md rounded-xl space-x-2">
                    <Plus color="#FFFFFF" size={18} />
                    <Text className="text-white font-bold ml-2">+ Khu vực mới</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* KPI cards */}
              <View className="flex-row flex-wrap gap-lg">
                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <Text className="text-slate-400 text-xs font-bold uppercase">Sân đang hoạt động</Text>
                  <View className="flex-row items-baseline mt-md">
                    <Text className="text-slate-950 font-extrabold text-3xl">142</Text>
                    <Text className="text-green-success font-bold text-xs ml-2">~12%</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <Text className="text-slate-400 text-xs font-bold uppercase">Ban tổ chức</Text>
                  <View className="flex-row items-baseline mt-md">
                    <Text className="text-slate-950 font-extrabold text-3xl">87</Text>
                    <Text className="text-green-success font-bold text-xs ml-2">~5%</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <Text className="text-slate-400 text-xs font-bold uppercase">Giải đang diễn ra</Text>
                  <View className="flex-row items-baseline mt-md">
                    <Text className="text-slate-950 font-extrabold text-3xl">14</Text>
                    <Text className="text-slate-400 font-bold text-xs ml-2">Tuần này</Text>
                  </View>
                </View>

                <View className="flex-1 min-w-[220px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <Text className="text-slate-400 text-xs font-bold uppercase">Doanh thu khu vực</Text>
                  <View className="flex-row items-baseline mt-md">
                    <Text className="text-slate-950 font-extrabold text-3xl">30 tỷ đ</Text>
                    <Text className="text-green-success font-bold text-xs ml-2">~8%</Text>
                  </View>
                </View>
              </View>

              {/* Geographic Overview & Approvals */}
              <View className="flex-row flex-wrap gap-lg">
                {/* Geographic map Card */}
                <View className="flex-[2] min-w-[320px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm">
                  <View className="flex-row justify-between items-center mb-xl">
                    <Text className="text-slate-900 font-extrabold text-lg">Tổng quan địa lý</Text>
                    <select className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg p-sm outline-none cursor-pointer">
                      <option>Toàn Việt Nam</option>
                      <option>Miền Bắc</option>
                      <option>Miền Trung</option>
                      <option>Miền Nam</option>
                    </select>
                  </View>

                  {/* SVG stylized map outline with pins */}
                  <View className="h-72 justify-center items-center w-full relative bg-slate-950 rounded-xl overflow-hidden">
                    <Svg width="100%" height="220" viewBox="0 0 400 220" className="w-full h-full">
                      <Path d="M 20 60 Q 60 50 100 40 T 180 50 T 260 70 T 320 60 T 380 40" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
                      <Path d="M 40 120 Q 80 100 120 130 T 220 100 T 320 110 T 360 120" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />

                      <SvgCircle cx="120" cy="70" r="10" fill="#2563EB" fillOpacity="0.2" />
                      <SvgCircle cx="120" cy="70" r="4" fill="#2563EB" />

                      <SvgCircle cx="150" cy="110" r="12" fill="#3B82F6" fillOpacity="0.2" />
                      <SvgCircle cx="150" cy="110" r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />

                      <SvgCircle cx="210" cy="65" r="10" fill="#2563EB" fillOpacity="0.2" />
                      <SvgCircle cx="210" cy="65" r="4" fill="#2563EB" />

                      <SvgCircle cx="280" cy="100" r="14" fill="#D97706" fillOpacity="0.2" />
                      <SvgCircle cx="280" cy="100" r="6" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />

                      <SvgCircle cx="180" cy="150" r="8" fill="#2563EB" fillOpacity="0.2" />
                      <SvgCircle cx="180" cy="150" r="3" fill="#2563EB" />
                    </Svg>

                    {/* Zoom / Navigation Controls */}
                    <View className="absolute bottom-4 right-4 bg-white border border-slate-200 rounded-lg p-sm space-y-md shadow-sm">
                      <TouchableOpacity className="w-8 h-8 justify-center items-center border-b border-slate-100">
                        <Text className="text-slate-800 font-extrabold text-lg">+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="w-8 h-8 justify-center items-center border-b border-slate-100">
                        <Text className="text-slate-800 font-extrabold text-lg">-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="w-8 h-8 justify-center items-center">
                        <Globe size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Approvals list card */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm flex-col justify-between">
                  <View className="flex-row justify-between items-center mb-xl border-b border-slate-100 pb-sm">
                    <Text className="text-slate-900 font-extrabold text-lg">Chờ phê duyệt</Text>
                    <View className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      <Text className="text-amber-700 font-bold text-xs">3 mới</Text>
                    </View>
                  </View>

                  <View className="space-y-lg flex-1">
                    {[
                      { id: 'app-1', title: 'Học viện Tennis Đà Nẵng', desc: 'Đăng ký sân mới', location: 'Đà Nẵng' },
                      { id: 'app-2', title: 'Nguyễn Minh Anh', desc: 'Nâng hạng giấy phép tổ chức', location: 'Hà Nội' },
                      { id: 'app-3', title: 'Cụm sân Thủ Đức', desc: 'Cập nhật sức chứa cơ sở', location: 'TP. Hồ Chí Minh' }
                    ].map((app) => (
                      <View key={app.id} className="border border-slate-100 p-md rounded-xl mb-4 bg-slate-50 flex-col space-y-md">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text className="text-slate-900 font-bold text-sm leading-tight">{app.title}</Text>
                            <Text className="text-slate-400 text-xs mt-1 font-semibold">{app.desc}</Text>
                            <Text className="text-slate-400 text-[10px] mt-0.5">{app.location}</Text>
                          </View>

                          <View className="flex-row items-center space-x-2 ml-sm">
                            <TouchableOpacity className="w-8 h-8 bg-white border border-slate-200 rounded-lg justify-center items-center hover:bg-red-50 mr-1">
                              <X color="#EF4444" size={14} />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-8 h-8 bg-blue-vibrant rounded-lg justify-center items-center hover:bg-blue-700">
                              <Check color="#FFFFFF" size={14} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {!selectedTournamentId && activeSidebarTab === 'settings' && (
            <View className="space-y-lg">
              {/* Header */}
              <View className="flex-row justify-between items-center border-b border-slate-200 pb-lg">
                <View>
                  <Text className="text-slate-900 font-extrabold text-3xl">Cài đặt & cấu hình</Text>
                  <Text className="text-slate-500 text-sm mt-1">Cấu hình thiết lập chung, hiệu suất hệ thống và nhật ký kiểm toán.</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-white border border-slate-200 rounded-xl justify-center items-center">
                  <Settings color="#475569" size={20} />
                </TouchableOpacity>
              </View>

              {/* Control Center */}
              <Text className="text-slate-900 font-extrabold text-xl mt-md">Trung tâm kiểm soát</Text>
              <Text className="text-slate-500 text-sm mt-xs">Quản lý người dùng, quản trị viên, hạng mục thể thao và cấu hình hệ thống.</Text>

              <View className="flex-row flex-wrap gap-lg">
                {/* Stats list card */}
                <View className="flex-[2] min-w-[320px] flex-col space-y-md">
                  <View className="flex-row flex-wrap gap-md">
                    <View className="flex-1 min-w-[140px] bg-white border border-slate-200 p-lg rounded-2xl shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <Users size={16} color="#64748B" className="mr-2" />
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1">Tổng người dùng</Text>
                      </View>
                      <Text className="text-slate-950 font-extrabold text-2xl">24,592</Text>
                    </View>
                    <View className="flex-1 min-w-[140px] bg-white border border-slate-200 p-lg rounded-2xl shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <Globe size={16} color="#64748B" className="mr-2" />
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1">Quản trị viên</Text>
                      </View>
                      <Text className="text-slate-950 font-extrabold text-2xl">128</Text>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-md">
                    <View className="flex-1 min-w-[140px] bg-white border border-slate-200 p-lg rounded-2xl shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <Trophy size={16} color="#64748B" className="mr-2" />
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1">Hạng mục</Text>
                      </View>
                      <Text className="text-slate-950 font-extrabold text-2xl">14</Text>
                    </View>
                    <View className="flex-1 min-w-[140px] bg-white border border-red-200 bg-red-50/20 p-lg rounded-2xl shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <Info size={16} color="#EF4444" className="mr-2" />
                        <Text className="text-red-500 font-bold text-xs uppercase tracking-wider ml-1">Cảnh báo</Text>
                      </View>
                      <Text className="text-red-600 font-extrabold text-2xl">3</Text>
                    </View>
                  </View>
                </View>

                {/* System status */}
                <View className="flex-1 min-w-[280px] bg-white border border-slate-200 p-xl rounded-2xl shadow-sm space-y-lg">
                  <View className="flex-row justify-between items-center mb-sm">
                    <Text className="text-slate-900 font-extrabold text-base">Trạng thái hệ thống</Text>
                    <View className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      <Text className="text-[10px] font-bold uppercase leading-none">Trực tuyến</Text>
                    </View>
                  </View>

                  <View className="space-y-md">
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-slate-500 font-medium text-xs">Tải máy chủ</Text>
                        <Text className="text-slate-900 font-bold text-xs">42%</Text>
                      </View>
                      <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <View className="h-full bg-blue-vibrant" style={{ width: '42%' }} />
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center mt-3">
                      <Text className="text-slate-500 font-medium text-xs">Độ trễ cơ sở dữ liệu</Text>
                      <Text className="text-slate-900 font-bold text-xs">18ms</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Recent Audit Logs Table */}
              <View className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-md">
                <View className="px-xl py-lg border-b border-slate-200 flex-row justify-between items-center">
                  <Text className="text-slate-900 font-extrabold text-lg">Nhật ký kiểm toán gần đây</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-vibrant font-bold text-sm">Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                <View className="overflow-x-auto">
                  <View className="min-w-[780px]">
                    {/* Header */}
                    <View className="flex-row bg-slate-50 px-xl py-md border-b border-slate-200 items-center">
                      <View style={{ width: 150 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Thời gian</Text>
                      </View>
                      <View style={{ width: 150 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Admin</Text>
                      </View>
                      <View style={{ width: 180 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Hành động</Text>
                      </View>
                      <View style={{ width: 200 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Đối tượng</Text>
                      </View>
                      <View style={{ width: 100 }}>
                        <Text className="text-slate-400 font-bold text-xs uppercase">Trạng thái</Text>
                      </View>
                    </View>

                    {/* Rows */}
                    {[
                      { time: '2026-07-20 14:32:01', admin: 'John S.', adminInitials: 'JS', action: 'Cập nhật quyền', target: 'Vai trò: Quản lý khu vực', status: 'Thành công', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
                      { time: '2026-07-20 13:15:44', admin: 'Alice K.', adminInitials: 'AK', action: 'Xóa hạng mục', target: 'Môn: Paddleball', status: 'Thành công', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
                      { time: '2026-07-20 11:05:12', admin: 'Hệ thống', adminInitials: 'SYS', action: 'Đồng bộ cấu hình lỗi', target: 'Cổng API', status: 'Thất bại', color: 'bg-red-50 text-red-700 border border-red-200' }
                    ].map((log, idx) => (
                      <View key={idx} className="flex-row px-xl py-md items-center border-b border-slate-100">
                        <View style={{ width: 150 }}>
                          <Text className="text-slate-500 font-medium text-xs">{log.time}</Text>
                        </View>
                        <View style={{ width: 150 }} className="flex-row items-center">
                          <View className="w-6 h-6 rounded-full bg-slate-200 justify-center items-center mr-2">
                            <Text className="text-slate-700 font-bold text-[9px]">{log.adminInitials}</Text>
                          </View>
                          <Text className="text-slate-900 font-bold text-xs">{log.admin}</Text>
                        </View>
                        <View style={{ width: 180 }}>
                          <Text className="text-slate-700 font-medium text-xs">{log.action}</Text>
                        </View>
                        <View style={{ width: 200 }}>
                          <Text className="text-slate-700 font-semibold text-xs">{log.target}</Text>
                        </View>
                        <View style={{ width: 100 }}>
                          <View className={`px-2.5 py-0.5 rounded-full self-start ${log.color}`}>
                            <Text className="text-[9px] font-bold uppercase leading-none">{log.status}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* General Account info & Log out */}
              <View className="bg-slate-50 border border-slate-200 rounded-2xl p-xl flex-row justify-between items-center mt-lg">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-3">
                    <Users color="#2563EB" size={24} />
                  </View>
                  <View>
                    <Text className="text-slate-900 font-extrabold text-sm">Account Manager</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">{user?.name || user?.email} ({user?.role})</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={async () => { await logout(); router.replace('/'); }}
                  className="bg-red-50 border border-red-200 py-sm px-lg rounded-xl flex-row items-center"
                >
                  <LogOut color="#EF4444" size={16} />
                  <Text className="text-red-600 font-bold text-xs ml-2">Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}
