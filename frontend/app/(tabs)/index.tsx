import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import GPSHeader from '@/components/Home/GPSHeader';
import SportScroll from '@/components/Home/SportScroll';
import MatchmakerCTA from '@/components/Home/MatchmakerCTA';
import { Users, MapPin, Calendar, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const [selectedSportId, setSelectedSportId] = useState('badminton');
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  // Mock data for featured matches nearby based on selected sport
  const getMockMatches = (sportId: string) => {
    const allMatches = [
      {
        id: '1',
        sportId: 'badminton',
        title: 'Giao lưu cầu lông đôi nam nữ',
        location: 'Sân Cầu Lông Kỳ Đồng, Q3',
        distance: '0.8 km',
        players: '3/4',
        time: '19:00 - 21:00 Hôm nay',
        level: 'Trung bình',
      },
      {
        id: '2',
        sportId: 'badminton',
        title: 'Tìm 1 nam gánh kèo trình khá',
        location: 'Sân Cầu Lông Viettel, Hẻm 285 CMT8',
        distance: '1.5 km',
        players: '3/4',
        time: '20:00 - 22:00 Hôm nay',
        level: 'Khá / Tốt',
      },
      {
        id: '3',
        sportId: 'basketball',
        title: 'Bóng rổ 3v3 nửa sân hội người cao tuổi',
        location: 'Sân Bóng Rổ Phú Thọ, Q11',
        distance: '2.1 km',
        players: '5/6',
        time: '17:30 - 19:30 Hôm nay',
        level: 'Mọi trình độ',
      },
      {
        id: '4',
        sportId: 'football',
        title: 'Cần 2 măng non đá sân 7 tối nay',
        location: 'Sân Bóng Đá mini HCA, Tân Bình',
        distance: '3.4 km',
        players: '12/14',
        time: '20:30 - 22:00 Hôm nay',
        level: 'Trung bình',
      },
      {
        id: '5',
        sportId: 'tennis',
        title: 'Kèo đơn nam tennis cuối tuần',
        location: 'CLB Tennis Lan Anh, Q10',
        distance: '1.2 km',
        players: '1/2',
        time: '08:00 - 10:00 Chủ Nhật',
        level: 'Khá',
      },
    ];

    return allMatches.filter(match => match.sportId === sportId);
  };

  const matches = getMockMatches(selectedSportId);

  return (
    <SafeAreaView style={styles.container}>
      {/* GPS Header & Search Bar */}
      <GPSHeader onSearch={handleSearch} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Quick Matchmaking Introduction */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTag}>ON-DEMAND MATCHING</Text>
            <Text style={styles.bannerTitle}>Tìm Bạn Chơi Thể Thao Tức Thì</Text>
            <Text style={styles.bannerDesc}>
              Hệ thống tự động tìm và kết nối những người chơi xung quanh vị trí của bạn trong bán kính 5km.
            </Text>
          </View>
          <View style={styles.bannerStats}>
            <View style={styles.statBox}>
              <Users size={16} color={Colors.dark.accent} />
              <Text style={styles.statVal}>342</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
            <View style={styles.statBox}>
              <MapPin size={16} color={Colors.dark.accent} />
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLabel}>Sân mở</Text>
            </View>
          </View>
        </View>

        {/* Sport Selection Slider */}
        <SportScroll 
          selectedSportId={selectedSportId} 
          onSelectSport={setSelectedSportId} 
        />

        {/* Recommended Match Cards Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kèo chờ quanh đây</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Xem thêm</Text>
            <ArrowRight size={14} color={Colors.dark.accent} />
          </TouchableOpacity>
        </View>

        {matches.length > 0 ? (
          matches.map((match) => (
            <View key={match.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{match.level}</Text>
                </View>
              </View>

              <View style={styles.matchDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={14} color={Colors.dark.textGray} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {match.location} ({match.distance})
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Calendar size={14} color={Colors.dark.textGray} />
                  <Text style={styles.detailText}>{match.time}</Text>
                </View>
              </View>

              <View style={styles.matchFooter}>
                <View style={styles.playerStats}>
                  <Users size={14} color={Colors.dark.accent} style={{ marginRight: 6 }} />
                  <Text style={styles.playerCount}>
                    Đang có <Text style={styles.boldText}>{match.players}</Text> thành viên
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateHeading}>Không tìm thấy kèo nào gần bạn</Text>
            <Text style={styles.emptyStateBody}>
              Không có sân chơi nào hoạt động xung quanh vị trí của bạn lúc này. Hãy thử chọn môn thể thao khác hoặc thay đổi phạm vi quét.
            </Text>
          </View>
        )}
        
        {/* Extra space for scrolling layout */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Primary CTA in Thumb Zone */}
      <View style={styles.ctaWrapper}>
        <MatchmakerCTA selectedSportId={selectedSportId} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerCard: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: Colors.dark.secondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerInfo: {
    flex: 2,
    marginRight: 10,
  },
  bannerTag: {
    color: Colors.dark.accent,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  bannerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 6,
  },
  bannerDesc: {
    color: Colors.dark.textGray,
    fontSize: 12,
    lineHeight: 16,
  },
  bannerStats: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: Colors.dark.border,
    paddingLeft: 12,
  },
  statBox: {
    alignItems: 'center',
    marginVertical: 4,
  },
  statVal: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statLabel: {
    color: Colors.dark.textGray,
    fontSize: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: Colors.dark.accent,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  matchCard: {
    backgroundColor: Colors.dark.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  levelText: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: '600',
  },
  matchDetails: {
    marginBottom: 14,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.dark.textGray,
    fontSize: 12,
    flex: 1,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCount: {
    color: Colors.dark.textGray,
    fontSize: 11,
  },
  boldText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  joinBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  joinBtnText: {
    color: Colors.dark.text,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateHeading: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateBody: {
    color: Colors.dark.textGray,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    paddingTop: 10,
  },
});
