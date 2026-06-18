import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MapPin, Star, Calendar, Users, Info, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Arena, MatchPending } from '@/hooks/useMockData';

interface MatchBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  selectedArena: Arena | null;
  joinedMatchIds: string[];
  onToggleJoin: (matchId: string) => void;
  onClose?: () => void;
}

export default function MatchBottomSheet({
  sheetRef,
  selectedArena,
  joinedMatchIds,
  onToggleJoin,
  onClose,
}: MatchBottomSheetProps) {
  // Snap points: 18% (mini peek), 55% (half screen details)
  const snapPoints = useMemo(() => ['20%', '55%'], []);

  if (!selectedArena) {
    return null;
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.sheetIndicator}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.arenaName} numberOfLines={1}>
              {selectedArena.name}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{selectedArena.rating}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.distanceText}>Cách {selectedArena.distance} km</Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color={Colors.dark.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Address and details */}
        <View style={styles.addressContainer}>
          <MapPin size={14} color={Colors.dark.textGray} />
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedArena.address}
          </Text>
        </View>

        {/* Matches Section Scrollable */}
        <BottomSheetScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Các kèo đang chờ ghép</Text>

          {selectedArena.activeMatches.length > 0 ? (
            selectedArena.activeMatches.map((match) => {
              const isJoined = joinedMatchIds.includes(match.id);
              
              return (
                <View key={match.id} style={styles.matchCard}>
                  <View style={styles.matchMeta}>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{match.level}</Text>
                    </View>
                  </View>

                  <View style={styles.hostRow}>
                    <Text style={styles.hostLabel}>Trưởng nhóm: </Text>
                    <Text style={styles.hostName}>{match.hostName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Calendar size={14} color={Colors.dark.textGray} />
                      <Text style={styles.infoText}>{match.time}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Users size={14} color={Colors.dark.textGray} />
                      <Text style={styles.infoText}>
                        Sĩ số: {isJoined ? match.playersCount + 1 : match.playersCount}/{match.maxPlayers}
                      </Text>
                    </View>
                  </View>

                  {match.note ? (
                    <View style={styles.noteContainer}>
                      <Info size={12} color={Colors.dark.textGray} style={{ marginTop: 2 }} />
                      <Text style={styles.noteText}>{match.note}</Text>
                    </View>
                  ) : null}

                  {/* One-touch Join/Cancel Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isJoined ? styles.cancelBtn : styles.joinBtn
                    ]}
                    onPress={() => onToggleJoin(match.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.actionBtnText,
                      isJoined ? styles.cancelBtnText : styles.joinBtnText
                    ]}>
                      {isJoined ? 'HỦY KÈO CHỜ' : 'THAM GIA NGAY'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Hiện chưa có kèo đấu nào đang chờ.</Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.dark.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sheetIndicator: {
    backgroundColor: Colors.dark.textGray,
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  arenaName: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  dot: {
    color: Colors.dark.textGray,
    marginHorizontal: 6,
  },
  distanceText: {
    color: Colors.dark.textGray,
    fontSize: 13,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  addressText: {
    color: Colors.dark.textGray,
    fontSize: 12,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  matchCard: {
    backgroundColor: Colors.dark.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    marginBottom: 12,
  },
  matchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  levelText: {
    color: Colors.dark.text,
    fontSize: 9,
    fontWeight: '600',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostLabel: {
    color: Colors.dark.textGray,
    fontSize: 12,
  },
  hostName: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: Colors.dark.textGray,
    fontSize: 12,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.secondary,
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  noteText: {
    color: Colors.dark.textGray,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  actionBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtn: {
    backgroundColor: Colors.dark.accent,
  },
  cancelBtn: {
    backgroundColor: Colors.dark.destructive,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  joinBtnText: {
    color: '#000000',
  },
  cancelBtnText: {
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textGray,
    fontSize: 13,
  },
});
