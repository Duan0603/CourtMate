import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Clock3,
  ExternalLink,
  MapPin,
  Share2,
  Trophy,
  Users,
} from 'lucide-react-native';
import { Tournament, TournamentStatus } from '@courtmate/shared';
import { tournamentsApi } from '../../src/features/tournaments/services/tournaments.api';
// Removed mock imports
import { useRegistrations } from '../../src/features/registrations/hooks/useRegistrations';
import { useLogin } from '../../src/features/auth/hooks/useLogin';

const COLORS = {
  navy: '#00102F',
  navySoft: '#061A3D',
  blue: '#0077FF',
  yellow: '#FFC400',
  canvas: '#F7FAFF',
  white: '#FFFFFF',
  text: '#00102F',
  muted: '#52627A',
  border: 'rgba(0,16,47,0.12)',
};

function formatFee(value: number) {
  return value > 0 ? `${value.toLocaleString('vi-VN')}đ` : 'Miễn phí';
}

function getMinFee(tournament: Tournament) {
  const fees = tournament.categories?.map((item) => item.fee).filter(Number.isFinite) ?? [];
  return fees.length ? Math.min(...fees) : tournament.registrationFee ?? 0;
}

function formatDate(value?: string | Date) {
  if (!value) return 'Đang cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Đang cập nhật' : date.toLocaleDateString('vi-VN');
}

export default function TournamentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  
  const { registrations, fetchRegistrations } = useRegistrations();
  const { user } = useLogin();
  const actualPlayerId = user?.id || (user as any)?._id;

  const loadTournament = async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(false);
    setImageFailed(false);

    try {
      const response = await tournamentsApi.getTournamentDetails(id);
      setTournament(((response as any).data || response) as Tournament);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTournament();
    if (actualPlayerId) {
      fetchRegistrations(actualPlayerId);
    }
  }, [id, actualPlayerId]);

  const isRegistered = registrations.some(reg => reg.tournamentId === id);

  const minFee = useMemo(() => (tournament ? getMinFee(tournament) : 0), [tournament]);
  const imageUrl = (tournament as any)?.image as string | undefined;
  const sourceUrl = tournament?.sourceUrl;
  const sourceName = tournament?.sourceName;
  const category = tournament?.categories?.[0]?.name || 'Mọi trình độ';
  const organizerName = tournament?.organizer?.name || 'Ban tổ chức giải';
  const isVerified = Boolean(tournament?.organizer?.isVerified);

  const openMap = () => {
    const location = tournament?.location || tournament?.city || 'Việt Nam';
    const query = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  const shareTournament = () => {
    NativeShare.share({
      title: tournament?.title || 'Giải đấu CourtMate',
      message: `${tournament?.title || 'Giải đấu CourtMate'}\n${tournament?.location || ''}`,
    });
  };

  const register = () => {
    if (!id) {
      Alert.alert('Chưa thể đăng ký', 'Không tìm thấy mã giải đấu.');
      return;
    }
    if (isRegistered) {
      router.push('/tracker');
      return;
    }
    router.push(`/register/${id}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.stateScreen, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.stateTitle}>Đang tải giải đấu</Text>
      </View>
    );
  }

  if (loadError || !tournament) {
    return (
      <View style={[styles.stateScreen, { paddingTop: insets.top }]}>
        <View style={styles.stateIcon}><Trophy color={COLORS.blue} size={30} /></View>
        <Text style={styles.stateHeading}>Không thể tải giải đấu</Text>
        <Text style={styles.stateBody}>Kiểm tra kết nối rồi thử tải lại thông tin.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={loadTournament}>
          <Text style={styles.primaryButtonText}>Tải lại giải đấu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backTextButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 60 }]}>
        <TouchableOpacity accessibilityLabel="Quay lại" style={styles.iconButton} onPress={() => router.back()}>
          <ChevronLeft color={COLORS.white} size={26} />
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <View style={styles.brandDot} />
          <Text style={styles.headerTitle}>CourtMate</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Chia sẻ giải đấu" style={styles.iconButton} onPress={shareTournament}>
          <Share2 color={COLORS.white} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 116 + insets.bottom }}
      >
        <View style={styles.hero}>
          {imageUrl && !imageFailed ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} onError={() => setImageFailed(true)} />
          ) : (
            <View style={styles.heroFallback}>
              <View style={styles.heroCircleLarge} />
              <View style={styles.heroCircleSmall} />
              <Trophy color={COLORS.yellow} size={58} strokeWidth={1.8} />
              <Text style={styles.fallbackLabel}>COURTMATE TOURNAMENT</Text>
            </View>
          )}
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            <View style={styles.statusPill}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>Đang mở đăng ký</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={3}>{tournament.title}</Text>
            <View style={styles.heroMeta}>
              <MapPin color={COLORS.white} size={17} />
              <Text style={styles.heroMetaText} numberOfLines={2}>{tournament.location || tournament.city}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.organizerCard}>
            <View style={styles.organizerMark}><Text style={styles.organizerInitial}>{organizerName.charAt(0)}</Text></View>
            <View style={styles.organizerCopy}>
              <Text style={styles.eyebrow}>Được tổ chức bởi</Text>
              <View style={styles.organizerNameRow}>
                <Text style={styles.organizerName} numberOfLines={1}>{organizerName}</Text>
                {isVerified && <BadgeCheck color={COLORS.yellow} fill={COLORS.navy} size={18} />}
              </View>
            </View>
          </View>

          {sourceUrl ? (
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={`Mở bài đăng gốc từ ${sourceName || 'Facebook'}`}
              style={styles.facebookSourceCard}
              onPress={() => Linking.openURL(sourceUrl)}
              activeOpacity={0.82}
            >
              <View style={styles.facebookIcon}>
                <Text style={styles.facebookIconText}>f</Text>
              </View>
              <View style={styles.facebookCopy}>
                <Text style={styles.facebookLabel}>Nguồn bài viết</Text>
                <Text style={styles.facebookName}>{sourceName || 'Facebook'}</Text>
                <Text style={styles.facebookUrl} numberOfLines={1}>
                  {sourceUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </Text>
              </View>
              <ExternalLink color={COLORS.blue} size={21} />
            </TouchableOpacity>
          ) : (
            <View style={styles.demoSourceCard}>
              <View style={styles.demoDot} />
              <View style={styles.facebookCopy}>
                <Text style={styles.demoSourceTitle}>Dữ liệu demo CourtMate</Text>
                <Text style={styles.demoSourceBody}>Giải này không có bài đăng Facebook gốc.</Text>
              </View>
            </View>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <CalendarDays color={COLORS.blue} size={22} />
              <Text style={styles.infoLabel}>Ngày thi đấu</Text>
              <Text style={styles.infoValue}>{formatDate(tournament.startDate)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <Users color={COLORS.blue} size={22} />
              <Text style={styles.infoLabel}>Trình độ</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{category}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <Clock3 color={COLORS.blue} size={22} />
              <Text style={styles.infoLabel}>Thể thức</Text>
              <Text style={styles.infoValue}>Loại trực tiếp</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tổng quan</Text>
          <View style={styles.card}>
            <Text style={styles.bodyText}>{tournament.description || 'Thông tin giải đấu đang được ban tổ chức cập nhật.'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Thông tin thi đấu</Text>
          <View style={styles.card}>
            <DetailRow label="Môn thi đấu" value={tournament.sport || 'Đang cập nhật'} />
            <DetailRow label="Hạng mục" value={category} />
            <DetailRow label="Tình trạng" value={tournament.slotsLimit ? (tournament as any).joinedSlots !== undefined ? `Còn ${Math.max(0, tournament.slotsLimit - (tournament as any).joinedSlots)} / ${tournament.slotsLimit} suất` : `${tournament.slotsLimit} vận động viên` : 'Đang cập nhật'} />
            <DetailRow label="Lệ phí" value={formatFee(minFee)} last />
          </View>

          <Text style={styles.sectionTitle}>Địa điểm</Text>
          <TouchableOpacity style={styles.locationCard} onPress={openMap} activeOpacity={0.8}>
            <View style={styles.mapIcon}><MapPin color={COLORS.white} size={24} /></View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle} numberOfLines={2}>{tournament.location || 'Địa điểm đang cập nhật'}</Text>
              <Text style={styles.locationHint}>Chạm để mở bản đồ</Text>
            </View>
            <ArrowRight color={COLORS.blue} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.feeBlock}>
          <Text style={styles.feeLabel}>Lệ phí từ</Text>
          <Text style={styles.feeValue}>{formatFee(minFee)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.registerButton, isRegistered && { backgroundColor: COLORS.muted }]} 
          onPress={register} 
          activeOpacity={0.85}
        >
          <Text style={styles.registerText}>{isRegistered ? 'Đã đăng ký (Xem)' : 'Đăng ký thi đấu'}</Text>
          {!isRegistered && <ArrowRight color={COLORS.white} size={20} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.canvas },
  scroll: { flex: 1 },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 8, justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerBrand: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.yellow, borderWidth: 3, borderColor: COLORS.blue },
  headerTitle: { color: COLORS.white, fontSize: 20, lineHeight: 24, fontWeight: '600' },
  hero: { height: 260, backgroundColor: COLORS.navySoft, position: 'relative', overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navySoft },
  heroCircleLarge: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', right: -65, top: -65 },
  heroCircleSmall: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0,119,255,0.18)', left: -25, bottom: -20 },
  fallbackLabel: { color: '#B8C7E0', marginTop: 12, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,16,47,0.48)' },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 20 },
  statusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: COLORS.yellow, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.navy },
  statusText: { color: COLORS.navy, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  heroTitle: { color: COLORS.white, fontSize: 28, lineHeight: 34, fontWeight: '600' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  heroMetaText: { flex: 1, color: '#E6EEFA', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  content: { padding: 16 },
  organizerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  organizerMark: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  organizerInitial: { color: COLORS.yellow, fontSize: 20, fontWeight: '600' },
  organizerCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  organizerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  organizerName: { flexShrink: 1, color: COLORS.text, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  facebookSourceCard: { minHeight: 84, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,119,255,0.24)', backgroundColor: '#EAF4FF', flexDirection: 'row', alignItems: 'center' },
  facebookIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#1877F2', alignItems: 'center', justifyContent: 'center' },
  facebookIconText: { color: COLORS.white, fontSize: 28, lineHeight: 32, fontWeight: '600' },
  facebookCopy: { flex: 1, marginHorizontal: 12 },
  facebookLabel: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  facebookName: { color: COLORS.text, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  facebookUrl: { color: COLORS.blue, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  demoSourceCard: { minHeight: 68, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center' },
  demoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.muted },
  demoSourceTitle: { color: COLORS.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  demoSourceBody: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  infoGrid: { marginTop: 16, flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 16 },
  infoCell: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  infoDivider: { width: 1, backgroundColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  infoValue: { color: COLORS.text, fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { color: COLORS.text, fontSize: 20, lineHeight: 24, fontWeight: '600', marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  bodyText: { color: COLORS.muted, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  detailRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 16 },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  detailValue: { flex: 1, textAlign: 'right', color: COLORS.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  locationCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  mapIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, marginHorizontal: 12 },
  locationTitle: { color: COLORS.text, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  locationHint: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, paddingHorizontal: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, shadowColor: COLORS.navy, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  feeBlock: { minWidth: 92 },
  feeLabel: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  feeValue: { color: COLORS.blue, fontSize: 20, lineHeight: 24, fontWeight: '600' },
  registerButton: { flex: 1, height: 52, borderRadius: 14, backgroundColor: COLORS.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  registerText: { color: COLORS.white, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  stateScreen: { flex: 1, backgroundColor: COLORS.canvas, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  stateIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#EAF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stateTitle: { color: COLORS.muted, fontSize: 16, lineHeight: 24, fontWeight: '600', marginTop: 14 },
  stateHeading: { color: COLORS.text, fontSize: 20, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
  stateBody: { color: COLORS.muted, fontSize: 16, lineHeight: 24, fontWeight: '400', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  primaryButton: { height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: COLORS.white, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  backTextButton: { minHeight: 44, justifyContent: 'center', marginTop: 8 },
  backText: { color: COLORS.blue, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
