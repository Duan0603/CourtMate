import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, H2, H3, H4, Paragraph, Spinner, View, Text, ScrollView, TamaguiElement } from 'tamagui';
import * as Location from 'expo-location';
import { Button, Input } from '../../../components';
import { useLogin } from '../hooks/useLogin';
import { UserRole, SportType } from '@courtmate/shared';
import { MapPin, Trophy, User as UserIcon, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Star, Activity } from 'lucide-react-native';
import { useWindowDimensions, Platform, KeyboardAvoidingView } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import gsap from 'gsap';

// Theme configuration matching the dashboard
const theme = {
  background: '#fcf8fa',
  surface: '#ffffff',
  primary: '#1d4ed8',
  onPrimary: '#ffffff',
  onSurface: '#1e293b',
  onSurfaceVariant: '#475569',
  outlineVariant: '#cbd5e1',
  outline: '#7c747a',
  error: '#b3261e',
  errorContainer: '#fde8e8',
};

// Custom SVG Icons for Sports
const BadmintonIcon = ({ color, size = 32 }: { color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="16" cy="8" r="5.5" stroke={color} strokeWidth="1.8" />
    <Line x1="16" y1="2.5" x2="16" y2="13.5" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="10.5" y1="8" x2="21.5" y2="8" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="13.5" y1="4.5" x2="18.5" y2="11.5" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="18.5" y1="4.5" x2="13.5" y2="11.5" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="12.1" y1="11.9" x2="6.5" y2="17.5" stroke={color} strokeWidth="1.8" />
    <Line x1="6.5" y1="17.5" x2="4" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <Path d="M7.5 10c0 0-2-2.5-3-1s1 3.5 3 3.5c2 0 3-2 3-3.5S7.5 10 7.5 10z" stroke={color} strokeWidth="1.2" />
    <Circle cx="7.5" cy="11.5" r="1.5" fill={color} />
  </Svg>
);

const FootballIcon = ({ color, size = 32 }: { color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.8" />
    <Path d="M12 2.5v4.5l-4 2.5v4.5M12 2.5l4.5 3.5-1 4.5" stroke={color} strokeWidth="1.2" />
    <Path d="M12 7l3.5 2.5-1.5 4-4 0.5-2.5-3.5L12 7z" fill={color} opacity={0.15} stroke={color} strokeWidth="1.2" />
    <Path d="M8 14l-4 2.5M16 14l4 2.5M12 18v3.5M4 7.5l4-1.5M20 7.5l-4-1.5" stroke={color} strokeWidth="1.2" />
  </Svg>
);

const PickleballIcon = ({ color, size = 32 }: { color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 4.5h6a4 4 0 014 4v3.5a4 4 0 01-4 4H8a4 4 0 01-4-4V8.5a4 4 0 014-4z" stroke={color} strokeWidth="1.8" />
    <Path d="M11 16v5.5M13 16v5.5" stroke={color} strokeWidth="1.8" />
    <Rect x="10.5" y="20.5" width="3" height="1.5" rx="0.5" fill={color} />
    <Circle cx="16" cy="16" r="3.5" stroke={color} strokeWidth="1.2" />
    <Circle cx="16" cy="14.5" r="0.5" fill={color} />
    <Circle cx="14.5" cy="16" r="0.5" fill={color} />
    <Circle cx="17.5" cy="16" r="0.5" fill={color} />
    <Circle cx="16" cy="17.5" r="0.5" fill={color} />
  </Svg>
);

const TennisIcon = ({ color, size = 32 }: { color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth="1.8" />
    <Line x1="10" y1="4" x2="10" y2="16" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="7" y1="5.5" x2="13" y2="14.5" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="13" y1="5.5" x2="7" y2="14.5" stroke={color} strokeWidth="0.8" opacity={0.6} />
    <Line x1="14.2" y1="14.2" x2="18.5" y2="18.5" stroke={color} strokeWidth="1.8" />
    <Line x1="18.5" y1="18.5" x2="20.5" y2="20.5" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <Circle cx="17" cy="7" r="3.5" stroke={color} strokeWidth="1.2" />
    <Path d="M14.5 7.5a2.5 2.5 0 014.5-1" stroke={color} strokeWidth="0.8" opacity={0.7} />
  </Svg>
);

const FLOATING_ICONS = [
  { Icon: Trophy, top: '12%', left: '10%', size: 36 },
  { Icon: Activity, top: '35%', right: '12%', size: 32 },
  { Icon: Star, top: '65%', left: '15%', size: 34 },
  { Icon: Sparkles, top: '82%', right: '10%', size: 32 },
];

export const OnboardingScreen: React.FC = () => {
  const { updateProfile } = useLogin();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [role, setRole] = useState<UserRole.PLAYER | UserRole.ORGANIZER | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState<'Da Nang' | 'Ha Noi' | 'Ho Chi Minh' | ''>('');
  
  // GPS State
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Player Prefs
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('');

  // Organizer Prefs
  const [clubName, setClubName] = useState('');

  // GSAP animation refs
  const formCardRef = useRef<TamaguiElement>(null);
  const storyTitleRef = useRef<TamaguiElement>(null);
  const storyTextRef = useRef<TamaguiElement>(null);
  const storyIconRef = useRef<TamaguiElement>(null);
  const emojiRefs = useRef<any[]>([]);

  // Step change transition handler
  const handleNextStep = () => {
    setError(null);
    if (step === 1 && role) {
      if (Platform.OS === 'web') {
        gsap.to(formCardRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            setStep(2);
            gsap.set(formCardRef.current, { x: 30, opacity: 0 });
            gsap.to(formCardRef.current, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!name.trim()) return setError('Vui lòng nhập tên của bạn');
      if (!city) return setError('Vui lòng chọn thành phố');
      
      if (Platform.OS === 'web') {
        gsap.to(formCardRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            setStep(3);
            gsap.set(formCardRef.current, { x: 30, opacity: 0 });
            gsap.to(formCardRef.current, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      } else {
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      if (Platform.OS === 'web') {
        gsap.to(formCardRef.current, {
          x: 30,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            setStep(prev => prev - 1);
            gsap.set(formCardRef.current, { x: -30, opacity: 0 });
            gsap.to(formCardRef.current, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      } else {
        setStep(prev => prev - 1);
      }
    }
  };

  // Lock validation flag for the current step
  const isCurrentStepValid = (() => {
    if (step === 1) return role !== null;
    if (step === 2) return name.trim().length > 0 && city !== '';
    if (step === 3) {
      if (role === UserRole.PLAYER) {
        return selectedSports.length > 0 && skillLevel !== '';
      } else {
        return clubName.trim().length > 0;
      }
    }
    return false;
  })();

  const detectLocation = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Vui lòng chọn thủ công.');
        return;
      }
      const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = locationData.coords;
      let detected: 'Da Nang' | 'Ha Noi' | 'Ho Chi Minh' | null = null;
      if (latitude >= 15.5 && latitude <= 16.5) detected = 'Da Nang';
      else if (latitude >= 20.5 && latitude <= 21.5) detected = 'Ha Noi';
      else if (latitude >= 10.0 && latitude <= 11.5) detected = 'Ho Chi Minh';

      if (detected) setCity(detected);
      else setGpsError('Ngoài vùng phục vụ.');
    } catch (err) {
      setGpsError('Lỗi GPS.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleSportToggle = (sport: SportType) => {
    if (selectedSports.includes(sport)) setSelectedSports(selectedSports.filter((s) => s !== sport));
    else setSelectedSports([...selectedSports, sport]);
  };

  const handleSubmit = async () => {
    setError(null);
    if (role === UserRole.PLAYER) {
      if (selectedSports.length === 0) return setError('Chọn ít nhất 1 môn');
      if (!skillLevel) return setError('Chọn trình độ');
    } else {
      if (!clubName.trim()) return setError('Nhập tên CLB');
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        role,
        preferences: {
          location: city,
          sports: role === UserRole.PLAYER ? selectedSports : [],
          skillLevel: role === UserRole.PLAYER ? skillLevel : undefined,
          clubName: role === UserRole.ORGANIZER ? clubName.trim() : undefined,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Storytelling dynamic texts
  const storyData = {
    1: {
      title: 'Chọn vai trò phù hợp',
      description: 'Bạn muốn tham gia CourtMate với tư cách là một cầu thủ năng động (Player) để thi đấu, hay nhà tổ chức (Organizer) để vận hành giải đấu chuyên nghiệp?',
      emoji: '🏆',
      subtext: 'BƯỚC 1: XÁC ĐỊNH VAI TRÒ'
    },
    2: {
      title: 'Giới thiệu bản thân',
      description: 'Cập nhật tên hiển thị và khu vực hoạt động để hệ thống kết nối bạn với những sân đấu và câu lạc bộ thể thao gần nhất.',
      emoji: '📍',
      subtext: 'BƯỚC 2: THÔNG TIN HỒ SƠ'
    },
    3: {
      title: role === UserRole.ORGANIZER ? 'Thông tin tổ chức' : 'Sở thích thể thao',
      description: role === UserRole.ORGANIZER 
        ? 'Cập nhật tên câu lạc bộ hoặc tổ chức để bắt đầu quản lý lịch đặt sân và vận hành các sự kiện thể thao.'
        : 'Chọn các môn thể thao bạn yêu thích và trình độ hiện tại để nhận các đề xuất trận đấu và đối thủ phù hợp.',
      emoji: role === UserRole.ORGANIZER ? '🏢' : '🏸',
      subtext: 'BƯỚC 3: SỞ THÍCH CHI TIẾT'
    }
  };

  const activeStory = storyData[step as 1 | 2 | 3];

  // GSAP storytelling animations
  useEffect(() => {
    if (Platform.OS === 'web' && isDesktop) {
      gsap.fromTo([storyIconRef.current, storyTitleRef.current, storyTextRef.current],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [step, isDesktop]);

  // Floating background icons
  useEffect(() => {
    if (Platform.OS === 'web' && isDesktop) {
      emojiRefs.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            x: 'random(-20, 20)',
            y: 'random(-25, 25)',
            rotation: 'random(-30, 30)',
            duration: 'random(4, 7)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.2
          });
        }
      });
    }
  }, [isDesktop]);

  const renderProgressBar = () => (
    <XStack jc="space-between" ai="center" w="100%" mb="$5">
      {[1, 2, 3].map((s) => (
        <YStack 
          key={s} 
          f={1} 
          mx="$1" 
          h={5} 
          br={2.5} 
          bg={s <= step ? theme.primary : 'rgba(226, 232, 240, 0.8)'} 
          style={{ transition: 'background-color 0.25s' }}
        />
      ))}
    </XStack>
  );

  const renderFormContent = () => (
    <YStack ref={formCardRef} f={1} jc="space-between" w="100%" style={{ opacity: 1 }}>
      {/* Top Section */}
      <YStack gap="$3" w="100%">
        {/* Progress Bar */}
        {renderProgressBar()}

        {error && (
          <YStack bg={theme.errorContainer} p="$3" br={12} mb="$2" borderWidth={1} borderColor="rgba(179, 38, 30, 0.15)" w="100%">
            <Paragraph color={theme.error} fow="600" fos={13} ta="center">{error}</Paragraph>
          </YStack>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <YStack gap="$4" w="100%">
            <YStack gap="$1" mb="$2">
              <H2 color={theme.onSurface} fontWeight="800" fos={isDesktop ? 28 : 24}>Chọn vai trò</H2>
              <Paragraph color={theme.onSurfaceVariant} fos={14}>Bạn tham gia CourtMate với mục đích gì?</Paragraph>
            </YStack>

            <YStack gap="$3" w="100%">
              <YStack
                borderWidth={2}
                borderColor={role === UserRole.PLAYER ? theme.primary : 'rgba(226, 232, 240, 0.8)'}
                bg={role === UserRole.PLAYER ? 'rgba(29, 78, 216, 0.04)' : theme.surface}
                p="$4"
                br={16}
                onPress={() => setRole(UserRole.PLAYER)}
                cursor="pointer"
                pressStyle={{ scale: 0.98 }}
                hoverStyle={Platform.OS === 'web' ? {
                  scale: 1.015,
                  borderColor: theme.primary,
                  shadowColor: 'rgba(29, 78, 216, 0.1)',
                  shadowOpacity: 0.05,
                  shadowRadius: 12
                } : {}}
                style={{ transition: 'all 0.25s', shadowColor: '#1e293b', shadowOpacity: role === UserRole.PLAYER ? 0.03 : 0, shadowRadius: 8 }}
              >
                <XStack ai="center" gap="$4">
                  <YStack bg={role === UserRole.PLAYER ? theme.primary : 'rgba(29, 78, 216, 0.08)'} p="$3" br={12} style={{ transition: 'all 0.25s' }}>
                    <UserIcon color={role === UserRole.PLAYER ? '#ffffff' : theme.primary} size={24} />
                  </YStack>
                  <YStack f={1}>
                    <H4 color={theme.onSurface} fow="700" fos={16}>Người chơi</H4>
                    <Paragraph color={theme.onSurfaceVariant} fos={13} mt="$1">Đăng ký tham gia giải đấu, quản lý hồ sơ và lịch thi đấu cá nhân</Paragraph>
                  </YStack>
                </XStack>
              </YStack>

              <YStack
                borderWidth={2}
                borderColor={role === UserRole.ORGANIZER ? theme.primary : 'rgba(226, 232, 240, 0.8)'}
                bg={role === UserRole.ORGANIZER ? 'rgba(29, 78, 216, 0.04)' : theme.surface}
                p="$4"
                br={16}
                onPress={() => setRole(UserRole.ORGANIZER)}
                cursor="pointer"
                pressStyle={{ scale: 0.98 }}
                hoverStyle={Platform.OS === 'web' ? {
                  scale: 1.015,
                  borderColor: theme.primary,
                  shadowColor: 'rgba(29, 78, 216, 0.1)',
                  shadowOpacity: 0.05,
                  shadowRadius: 12
                } : {}}
                style={{ transition: 'all 0.25s', shadowColor: '#1e293b', shadowOpacity: role === UserRole.ORGANIZER ? 0.03 : 0, shadowRadius: 8 }}
              >
                <XStack ai="center" gap="$4">
                  <YStack bg={role === UserRole.ORGANIZER ? theme.primary : 'rgba(29, 78, 216, 0.08)'} p="$3" br={12} style={{ transition: 'all 0.25s' }}>
                    <Trophy color={role === UserRole.ORGANIZER ? '#ffffff' : theme.primary} size={24} />
                  </YStack>
                  <YStack f={1}>
                    <H4 color={theme.onSurface} fow="700" fos={16}>Ban tổ chức</H4>
                    <Paragraph color={theme.onSurfaceVariant} fos={13} mt="$1">Tạo giải đấu, quản lý sân và lịch đặt</Paragraph>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        )}

        {/* STEP 2: PROFILE DETAILS */}
        {step === 2 && (
          <YStack gap="$4" w="100%">
            <YStack gap="$1" mb="$2">
              <H2 color={theme.onSurface} fontWeight="800" fos={isDesktop ? 28 : 24}>Cập nhật hồ sơ</H2>
              <Paragraph color={theme.onSurfaceVariant} fos={14}>Thông tin này giúp chúng tôi cá nhân hóa trải nghiệm.</Paragraph>
            </YStack>

            <YStack gap="$1.5" w="100%">
              <Paragraph color={theme.onSurface} fow="600" fos={14} style={Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : undefined}>
                Tên hiển thị *
              </Paragraph>
              <Input
                placeholder="Ví dụ: Quốc Toản"
                value={name}
                onChangeText={setName}
                bg={theme.surface}
                borderColor={theme.outlineVariant}
                color={theme.onSurface}
                focusStyle={{ borderColor: theme.primary, borderWidth: 1 }}
                h={52}
                br={12}
                px="$3"
                fos={15}
                w="100%"
                style={{ transition: 'border-color 0.2s' } as any}
              />
            </YStack>

            <YStack gap="$1.5" w="100%">
              <Paragraph color={theme.onSurface} fow="600" fos={14} style={Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : undefined}>
                Khu vực hoạt động *
              </Paragraph>
              <XStack gap="$2" fw="wrap" w="100%">
                {(['Da Nang', 'Ha Noi', 'Ho Chi Minh'] as const).map(c => {
                  const label = c === 'Da Nang' ? 'Đà Nẵng' : c === 'Ha Noi' ? 'Hà Nội' : 'TP. HCM';
                  const active = city === c;
                  return (
                    <YStack
                      key={c}
                      bg={active ? theme.primary : theme.surface}
                      borderWidth={1}
                      borderColor={active ? theme.primary : theme.outlineVariant}
                      px="$4"
                      py="$2.5"
                      br={12}
                      cursor="pointer"
                      onPress={() => setCity(c)}
                      hoverStyle={Platform.OS === 'web' && !active ? { scale: 1.03, borderColor: theme.primary } : {}}
                      style={{ transition: 'all 0.2s' }}
                      pressStyle={{ scale: 0.96 }}
                    >
                      <Text color={active ? '#ffffff' : theme.onSurface} fow="600" fos={14}>{label}</Text>
                    </YStack>
                  );
                })}
              </XStack>
              <YStack mt="$2" onPress={detectLocation} cursor="pointer" pressStyle={{ opacity: 0.6 }} style={{ alignSelf: 'flex-start' }}>
                <XStack ai="center" gap="$1.5">
                  {isGpsLoading ? <Spinner size="small" color={theme.primary} /> : <MapPin color={theme.primary} size={16} />}
                  <Text color={theme.primary} fow="600" fos={13}>Tự động định vị GPS</Text>
                </XStack>
              </YStack>
              {gpsError && <Text color={theme.error} fos={12} mt="$1" ml="$1">{gpsError}</Text>}
            </YStack>
          </YStack>
        )}

        {/* STEP 3: SPORTS PREFERENCES */}
        {step === 3 && (
          <YStack gap="$3" w="100%">
            <YStack gap="$1" mb="$1.5">
              <H2 color={theme.onSurface} fontWeight="800" fos={isDesktop ? 26 : 22}>
                {role === UserRole.ORGANIZER ? 'Thông tin tổ chức' : 'Sở thích thể thao'}
              </H2>
              <Paragraph color={theme.onSurfaceVariant} fos={13.5}>
                {role === UserRole.ORGANIZER ? 'Nhập tên tổ chức để bắt đầu hành trình của bạn.' : 'Bạn quan tâm đến môn thể thao nào?'}
              </Paragraph>
            </YStack>

            {role === UserRole.PLAYER ? (
              <YStack gap="$3" w="100%">
                <YStack gap="$1.5" w="100%">
                  <Paragraph color={theme.onSurface} fow="600" fos={14} style={Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : undefined}>
                    Chọn môn thể thao (Có thể chọn nhiều) *
                  </Paragraph>
                  <XStack gap="$2.5" fw="wrap" jc="space-between" w="100%">
                    {([
                      { id: SportType.BADMINTON, label: 'Cầu lông', Icon: BadmintonIcon },
                      { id: SportType.FOOTBALL, label: 'Bóng đá', Icon: FootballIcon },
                      { id: SportType.PICKLEBALL, label: 'Pickleball', Icon: PickleballIcon },
                      { id: SportType.TENNIS, label: 'Tennis', Icon: TennisIcon }
                    ]).map(s => {
                      const active = selectedSports.includes(s.id);
                      const iconColor = active ? theme.primary : '#64748b';
                      return (
                        <YStack
                          key={s.id}
                          w="48%"
                          h={84}
                          bg={active ? 'rgba(29, 78, 216, 0.04)' : theme.surface}
                          borderWidth={2}
                          borderColor={active ? theme.primary : 'rgba(226, 232, 240, 0.8)'}
                          p="$2.5"
                          br={14}
                          ai="center"
                          jc="center"
                          cursor="pointer"
                          onPress={() => handleSportToggle(s.id)}
                          hoverStyle={Platform.OS === 'web' && !active ? { scale: 1.02, borderColor: theme.primary } : {}}
                          style={{ transition: 'all 0.2s' }}
                          pressStyle={{ scale: 0.97 }}
                        >
                          <s.Icon color={iconColor} size={30} />
                          <Text color={theme.onSurface} fow="600" fos={13.5} mt="$1.5">{s.label}</Text>
                        </YStack>
                      );
                    })}
                  </XStack>
                </YStack>

                <YStack gap="$1.5" w="100%">
                  <Paragraph color={theme.onSurface} fow="600" fos={14} style={Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : undefined}>
                    Trình độ của bạn *
                  </Paragraph>
                  <XStack gap="$2" jc="space-between" w="100%">
                    {([
                      { id: 'Beginner', label: 'Nhập môn' },
                      { id: 'Intermediate', label: 'Trung bình' },
                      { id: 'Advanced', label: 'Nâng cao' }
                    ] as const).map(l => {
                      const active = skillLevel === l.id;
                      return (
                        <YStack
                          key={l.id}
                          f={1}
                          bg={active ? theme.primary : theme.surface}
                          borderWidth={1}
                          borderColor={active ? theme.primary : theme.outlineVariant}
                          py="$2"
                          br={12}
                          ai="center"
                          cursor="pointer"
                          onPress={() => setSkillLevel(l.id)}
                          hoverStyle={Platform.OS === 'web' && !active ? { scale: 1.03, borderColor: theme.primary } : {}}
                          style={{ transition: 'all 0.2s' }}
                          pressStyle={{ scale: 0.96 }}
                        >
                          <Text color={active ? '#ffffff' : theme.onSurface} fow="600" fos={13}>{l.label}</Text>
                        </YStack>
                      );
                    })}
                  </XStack>
                </YStack>
              </YStack>
            ) : (
              <YStack gap="$2" mt="$2" w="100%">
                <Paragraph color={theme.onSurface} fow="600" fos={14} style={Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : undefined}>
                  Tên CLB / Tổ chức *
                </Paragraph>
                <Input
                  placeholder="Nhập tên CLB của bạn"
                  value={clubName}
                  onChangeText={setClubName}
                  bg={theme.surface}
                  borderColor={theme.outlineVariant}
                  color={theme.onSurface}
                  focusStyle={{ borderColor: theme.primary, borderWidth: 1 }}
                  h={52}
                  br={12}
                  px="$3"
                  fos={15}
                  w="100%"
                  style={{ transition: 'border-color 0.2s' } as any}
                />
              </YStack>
            )}
          </YStack>
        )}
      </YStack>

      {/* Navigation Buttons (Bottom Section) */}
      <XStack gap="$3" pt="$4" w="100%">
        {step > 1 && (
          <YStack
            bg="rgba(226, 232, 240, 0.8)"
            w={56}
            h={56}
            br={16}
            jc="center"
            ai="center"
            cursor="pointer"
            onPress={handlePrevStep}
            pressStyle={{ opacity: 0.7 }}
            hoverStyle={Platform.OS === 'web' ? { bg: 'rgba(203, 213, 225, 0.9)', scale: 1.02 } : {}}
            style={{ transition: 'all 0.2s' }}
          >
            <ChevronLeft color={theme.onSurface} size={24} />
          </YStack>
        )}
        <YStack
          f={1}
          bg={isCurrentStepValid ? theme.primary : '#cbd5e1'}
          h={56}
          br={16}
          jc="center"
          ai="center"
          onPress={isCurrentStepValid ? (step === 3 ? handleSubmit : handleNextStep) : undefined}
          disabled={isSubmitting || !isCurrentStepValid}
          hoverStyle={Platform.OS === 'web' && isCurrentStepValid ? {
            bg: '#172554',
            scale: 1.015
          } : {}}
          style={isCurrentStepValid ? {
            shadowColor: '#1d4ed8',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            cursor: 'pointer',
            transition: 'all 0.25s'
          } : { cursor: 'not-allowed', transition: 'all 0.25s' }}
          pressStyle={isCurrentStepValid ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? <Spinner size="small" color="#ffffff" /> : (
            <XStack ai="center" gap="$2">
              <Text color={isCurrentStepValid ? '#ffffff' : '#94a3b8'} fow="700" fos={15} tt="uppercase" ls={0.5}>
                {step === 3 ? 'Hoàn tất' : 'Tiếp tục'}
              </Text>
              {step < 3 && <ChevronRight color={isCurrentStepValid ? '#ffffff' : '#94a3b8'} size={18} />}
              {step === 3 && <CheckCircle2 color={isCurrentStepValid ? '#ffffff' : '#94a3b8'} size={18} />}
            </XStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  );

  if (isDesktop) {
    return (
      <View flex={1} w="100%" jc="center" ai="center" bg={theme.background}>
        {/* Widescreen Storytelling Dialog */}
        <XStack 
          w="90%" 
          maxWidth={900} 
          minHeight={660}
          bg={theme.surface} 
          br={24} 
          borderWidth={1}
          borderColor="rgba(226, 232, 240, 0.8)"
          alignSelf="center"
          style={{
            shadowColor: '#1e293b',
            shadowOpacity: 0.08,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 12 },
            elevation: 5,
            overflow: 'hidden'
          }}
        >
          {/* Left side Storytelling Pane */}
          <YStack 
            flex={1} 
            minWidth={0}
            flexShrink={1}
            bg={theme.primary} 
            p="$7" 
            jc="space-between" 
            position="relative"
            style={Platform.OS === 'web' ? {
              backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
              overflow: 'hidden'
            } : { overflow: 'hidden' }}
          >
            {/* Background overlay */}
            <View position="absolute" top={0} bottom={0} left={0} right={0} bg="rgba(0,0,0,0.06)" pointerEvents="none" />
            
            {/* Floating Lucide Icons */}
            {Platform.OS === 'web' && FLOATING_ICONS.map(({ Icon, top, right, left, size }, index) => (
              <View
                key={index}
                ref={(el) => (emojiRefs.current[index] = el)}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  right,
                  opacity: 0.12,
                  userSelect: 'none',
                  pointerEvents: 'none'
                } as any}
              >
                <Icon size={size} color="#ffffff" />
              </View>
            ))}

            {/* Top Brand Logo */}
            <XStack ai="center" gap="$2">
              <Sparkles size={16} color="#ffffff" />
              <Text color="#ffffff" fow="800" fos={14} ls={1} tt="uppercase">CourtMate</Text>
            </XStack>

            {/* Dynamic Middle Content */}
            <YStack gap="$4" style={{ zIndex: 2 }}>
              <View 
                ref={storyIconRef}
                w={64} 
                h={64} 
                br={32} 
                bg="rgba(255, 255, 255, 0.12)" 
                jc="center" 
                ai="center"
                borderWidth={1.5}
                borderColor="rgba(255, 255, 255, 0.25)"
              >
                <Text fos={28}>{activeStory.emoji}</Text>
              </View>
              <YStack gap="$2">
                <Text color="#ffffff" opacity={0.65} fow="800" fos={11} ls={1.2}>{activeStory.subtext}</Text>
                <H3 ref={storyTitleRef} color="#ffffff" fow="900" fos={30} lh={38} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{activeStory.title}</H3>
                <Paragraph ref={storyTextRef} color="#ffffff" opacity={0.9} fos={14} lh={22} mt="$1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {activeStory.description}
                </Paragraph>
              </YStack>
            </YStack>

            {/* Bottom Tagline */}
            <Text color="#ffffff" opacity={0.4} fos={11} fow="500">© 2026 CourtMate Sports App</Text>
          </YStack>

          {/* Right side Form Pane */}
          <YStack 
            flex={1.2} 
            minWidth={0}
            flexShrink={1}
            p="$8" 
            jc="space-between" 
            bg={theme.surface}
          >
            {renderFormContent()}
          </YStack>
        </XStack>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }} showsVerticalScrollIndicator={false} bounces={false}>
        <YStack 
          w="100%" 
          maxWidth={440} 
          bg={theme.surface} 
          br={24} 
          p="$5.5" 
          borderWidth={1}
          borderColor="rgba(226, 232, 240, 0.8)"
          minWidth={0}
          style={{
            shadowColor: '#1e293b',
            shadowOpacity: 0.05,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4
          }}
        >
          {renderFormContent()}
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;
