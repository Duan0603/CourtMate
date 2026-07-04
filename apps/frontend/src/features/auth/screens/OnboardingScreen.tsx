import React, { useState } from 'react';
import { YStack, XStack, H2, H3, H4, Paragraph, Label, Spinner, View, Text } from 'tamagui';
import * as Location from 'expo-location';
import { Button, Input } from '../../../components';
import { useLogin } from '../hooks/useLogin';
import { UserRole, SportType } from '@courtmate/shared';
import { MapPin, Trophy, User as UserIcon, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react-native';

export const OnboardingScreen: React.FC = () => {
  const { updateProfile } = useLogin();
  
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

  const handleNextStep = () => {
    setError(null);
    if (step === 1 && role) setStep(2);
    else if (step === 2) {
      if (!name.trim()) return setError('Vui lòng nhập tên của bạn');
      if (!city) return setError('Vui lòng chọn thành phố');
      setStep(3);
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

  const renderProgressBar = () => (
    <XStack jc="space-between" ai="center" w="100%" mb="$6">
      {[1, 2, 3].map((s) => (
        <YStack key={s} f={1} mx="$1" h={4} br="$2" bg={s <= step ? '#C4F82A' : 'rgba(255,255,255,0.1)'} animation="quick" />
      ))}
    </XStack>
  );

  return (
    <YStack f={1} bg="#0A0A0A" position="relative">
      <View position="absolute" top={-50} right={-50} w={200} h={200} br={100} bg="#3B82F6" opacity={0.08} />
      
      <YStack f={1} p="$6" pt="$10" pb="$8" jc="space-between">
        <YStack>
          {renderProgressBar()}
          
          {error && (
            <YStack bg="rgba(239, 68, 68, 0.1)" p="$3" br="$4" mb="$4" borderWidth={1} borderColor="rgba(239, 68, 68, 0.3)">
              <Paragraph color="#F87171" fow="600" fos="$3" ta="center">{error}</Paragraph>
            </YStack>
          )}

          {/* STEP 1: ROLE */}
          {step === 1 && (
            <YStack gap="$5" animation="quick" enterStyle={{ opacity: 0, x: -10 }}>
              <YStack gap="$2">
                <H2 color="white" fontWeight="800">Chọn vai trò</H2>
                <Paragraph color="rgba(255,255,255,0.6)">Bạn tham gia CourtMate với mục đích gì?</Paragraph>
              </YStack>

              <YStack gap="$4">
                <YStack
                  borderWidth={2}
                  borderColor={role === UserRole.PLAYER ? '#C4F82A' : 'rgba(255,255,255,0.1)'}
                  bg={role === UserRole.PLAYER ? 'rgba(196, 248, 42, 0.1)' : 'rgba(20,20,20,0.6)'}
                  p="$5"
                  br="$6"
                  onPress={() => setRole(UserRole.PLAYER)}
                  animation="quick"
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack ai="center" gap="$4">
                    <YStack bg={role === UserRole.PLAYER ? '#C4F82A' : 'rgba(255,255,255,0.1)'} p="$3" br="$10">
                      <UserIcon color={role === UserRole.PLAYER ? '#0A0A0A' : 'white'} size={24} />
                    </YStack>
                    <YStack f={1}>
                      <H4 color="white" fow="700">Người chơi</H4>
                      <Paragraph color="rgba(255,255,255,0.5)" fos={13} mt="$1">Đăng ký tham gia giải đấu, quản lý hồ sơ và lịch thi đấu cá nhân</Paragraph>
                    </YStack>
                  </XStack>
                </YStack>

                <YStack
                  borderWidth={2}
                  borderColor={role === UserRole.ORGANIZER ? '#C4F82A' : 'rgba(255,255,255,0.1)'}
                  bg={role === UserRole.ORGANIZER ? 'rgba(196, 248, 42, 0.1)' : 'rgba(20,20,20,0.6)'}
                  p="$5"
                  br="$6"
                  onPress={() => setRole(UserRole.ORGANIZER)}
                  animation="quick"
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack ai="center" gap="$4">
                    <YStack bg={role === UserRole.ORGANIZER ? '#C4F82A' : 'rgba(255,255,255,0.1)'} p="$3" br="$10">
                      <Trophy color={role === UserRole.ORGANIZER ? '#0A0A0A' : 'white'} size={24} />
                    </YStack>
                    <YStack f={1}>
                      <H4 color="white" fow="700">Ban tổ chức</H4>
                      <Paragraph color="rgba(255,255,255,0.5)" fos={13} mt="$1">Tạo giải đấu, quản lý sân và lịch đặt</Paragraph>
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <YStack gap="$5" animation="quick" enterStyle={{ opacity: 0, x: 10 }}>
              <YStack gap="$2">
                <H2 color="white" fontWeight="800">Cập nhật hồ sơ</H2>
                <Paragraph color="rgba(255,255,255,0.6)">Thông tin này giúp chúng tôi cá nhân hóa trải nghiệm.</Paragraph>
              </YStack>

              <YStack gap="$2">
                <Label color="rgba(255,255,255,0.8)" fow="600">Tên hiển thị</Label>
                <Input
                  placeholder="Ví dụ: Quốc Toản"
                  value={name}
                  onChangeText={setName}
                  bg="rgba(255,255,255,0.05)"
                  borderColor="rgba(255,255,255,0.1)"
                  color="white"
                  h={50}
                />
              </YStack>

              <YStack gap="$2">
                <Label color="rgba(255,255,255,0.8)" fow="600">Khu vực hoạt động</Label>
                <XStack gap="$2" fw="wrap">
                  {(['Da Nang', 'Ha Noi', 'Ho Chi Minh'] as const).map(c => {
                    const label = c === 'Da Nang' ? 'Đà Nẵng' : c === 'Ha Noi' ? 'Hà Nội' : 'TP. HCM';
                    const active = city === c;
                    return (
                      <YStack
                        key={c}
                        bg={active ? '#C4F82A' : 'rgba(255,255,255,0.05)'}
                        borderWidth={1}
                        borderColor={active ? '#C4F82A' : 'rgba(255,255,255,0.1)'}
                        px="$4"
                        py="$3"
                        br="$10"
                        onPress={() => setCity(c)}
                      >
                        <Text color={active ? '#0A0A0A' : 'white'} fow="600">{label}</Text>
                      </YStack>
                    );
                  })}
                </XStack>
                <YStack mt="$2" onPress={detectLocation} pressStyle={{ opacity: 0.5 }}>
                  <XStack ai="center" gap="$2">
                    {isGpsLoading ? <Spinner size="small" color="#3B82F6" /> : <MapPin color="#3B82F6" size={16} />}
                    <Text color="#3B82F6" fow="600">Tự động định vị GPS</Text>
                  </XStack>
                </YStack>
                {gpsError && <Text color="#F87171" fos={12}>{gpsError}</Text>}
              </YStack>
            </YStack>
          )}

          {/* STEP 3: PREFS */}
          {step === 3 && (
            <YStack gap="$5" animation="quick" enterStyle={{ opacity: 0, x: 10 }}>
              <YStack gap="$2">
                <H2 color="white" fontWeight="800">Sở thích thể thao</H2>
                <Paragraph color="rgba(255,255,255,0.6)">Bạn quan tâm đến môn thể thao nào?</Paragraph>
              </YStack>

              {role === UserRole.PLAYER ? (
                <YStack gap="$5">
                  <YStack gap="$3">
                    <Label color="rgba(255,255,255,0.8)" fow="600">Chọn môn thể thao (có thể chọn nhiều)</Label>
                    <XStack gap="$3" fw="wrap">
                      {([
                        { id: SportType.BADMINTON, label: 'Cầu lông', icon: '🏸' },
                        { id: SportType.FOOTBALL, label: 'Bóng đá', icon: '⚽' },
                        { id: SportType.PICKLEBALL, label: 'Pickleball', icon: '🏓' },
                        { id: SportType.TENNIS, label: 'Tennis', icon: '🎾' }
                      ]).map(s => {
                        const active = selectedSports.includes(s.id);
                        return (
                          <YStack
                            key={s.id}
                            w="46%"
                            bg={active ? 'rgba(196, 248, 42, 0.1)' : 'rgba(255,255,255,0.05)'}
                            borderWidth={2}
                            borderColor={active ? '#C4F82A' : 'transparent'}
                            p="$4"
                            br="$4"
                            ai="center"
                            onPress={() => handleSportToggle(s.id)}
                          >
                            <Text fos={32} mb="$2">{s.icon}</Text>
                            <Text color="white" fow="600">{s.label}</Text>
                          </YStack>
                        );
                      })}
                    </XStack>
                  </YStack>

                  <YStack gap="$3">
                    <Label color="rgba(255,255,255,0.8)" fow="600">Trình độ của bạn</Label>
                    <XStack gap="$2" jc="space-between">
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
                            bg={active ? '#C4F82A' : 'rgba(255,255,255,0.05)'}
                            borderWidth={1}
                            borderColor={active ? '#C4F82A' : 'rgba(255,255,255,0.1)'}
                            py="$3"
                            br="$4"
                            ai="center"
                            onPress={() => setSkillLevel(l.id)}
                          >
                            <Text color={active ? '#0A0A0A' : 'white'} fow="600">{l.label}</Text>
                          </YStack>
                        );
                      })}
                    </XStack>
                  </YStack>
                </YStack>
              ) : (
                <YStack gap="$2">
                  <Label color="rgba(255,255,255,0.8)" fow="600">Tên CLB / Tổ chức</Label>
                  <Input
                    placeholder="Nhập tên CLB của bạn"
                    value={clubName}
                    onChangeText={setClubName}
                    bg="rgba(255,255,255,0.05)"
                    borderColor="rgba(255,255,255,0.1)"
                    color="white"
                    h={50}
                  />
                </YStack>
              )}
            </YStack>
          )}
        </YStack>

        {/* Bottom Fixed Navigation */}
        <XStack gap="$3" mt="$4">
          {step > 1 && (
            <YStack
              bg="rgba(255,255,255,0.1)"
              w={56}
              h={56}
              br="$4"
              jc="center"
              ai="center"
              onPress={() => setStep(step - 1)}
              pressStyle={{ opacity: 0.7 }}
            >
              <ChevronLeft color="white" size={24} />
            </YStack>
          )}
          <YStack
            f={1}
            bg={step === 1 && !role ? "rgba(196, 248, 42, 0.3)" : "#C4F82A"}
            h={56}
            br="$4"
            jc="center"
            ai="center"
            onPress={step === 3 ? handleSubmit : handleNextStep}
            disabled={isSubmitting || (step === 1 && !role)}
            pressStyle={{ opacity: 0.8 }}
          >
            {isSubmitting ? <Spinner size="small" color="#0A0A0A" /> : (
              <XStack ai="center" gap="$2">
                <Text color="#0A0A0A" fow="800" fos={16} tt="uppercase">
                  {step === 3 ? 'Hoàn tất' : 'Tiếp tục'}
                </Text>
                {step < 3 && <ChevronRight color="#0A0A0A" size={20} />}
                {step === 3 && <CheckCircle2 color="#0A0A0A" size={20} />}
              </XStack>
            )}
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default OnboardingScreen;
