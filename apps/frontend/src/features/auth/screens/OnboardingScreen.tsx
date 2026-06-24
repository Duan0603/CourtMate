import React, { useState } from 'react';
import { YStack, XStack, H2, H3, H4, Paragraph, Label, Spinner } from 'tamagui';
import * as Location from 'expo-location';
import { Button, Input } from '../../../components';
import { useLogin } from '../hooks/useLogin';
import { UserRole, SportType } from '@courtmate/shared';

export const OnboardingScreen: React.FC = () => {
  const { updateProfile, isLoading } = useLogin();
  
  // Wizard steps: 1 = Role, 2 = Details & Location, 3 = Preferences
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [role, setRole] = useState<UserRole.PLAYER | UserRole.ORGANIZER>(UserRole.PLAYER);
  const [name, setName] = useState('');
  const [city, setCity] = useState<'Da Nang' | 'Ha Noi' | 'Ho Chi Minh' | ''>('');
  
  // GPS State
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  // Player Prefs
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('');

  // Organizer Prefs
  const [clubName, setClubName] = useState('');

  // Location request helper
  const detectLocation = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(false);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Quyền truy cập GPS bị từ chối. Vui lòng chọn thành phố thủ công.');
        setIsGpsLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationData.coords;

      // Pilot cities coordinates mapping
      // Da Nang: ~16.0, ~108.2
      // Hanoi: ~21.0, ~105.8
      // Ho Chi Minh: ~10.8, ~106.6
      let detected: 'Da Nang' | 'Ha Noi' | 'Ho Chi Minh' | null = null;

      if (latitude >= 15.5 && latitude <= 16.5 && longitude >= 107.5 && longitude <= 108.5) {
        detected = 'Da Nang';
      } else if (latitude >= 20.5 && latitude <= 21.5 && longitude >= 105.0 && longitude <= 106.5) {
        detected = 'Ha Noi';
      } else if (latitude >= 10.0 && latitude <= 11.5 && longitude >= 106.0 && longitude <= 107.5) {
        detected = 'Ho Chi Minh';
      }

      if (detected) {
        setCity(detected);
        setGpsSuccess(true);
      } else {
        setGpsError('Bạn đang ở ngoài khu vực hỗ trợ của CourtMate (Đà Nẵng, Hà Nội, TP.HCM). Vui lòng chọn thành phố thủ công.');
      }
    } catch (err) {
      console.error('Error detecting location', err);
      setGpsError('Không thể tự động phát hiện vị trí. Vui lòng chọn thủ công.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        setError('Vui lòng nhập họ và tên của bạn');
        return;
      }
      if (!city) {
        setError('Vui lòng chọn thành phố hoạt động chính');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSportToggle = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate Step 3
    if (role === UserRole.PLAYER) {
      if (selectedSports.length === 0) {
        setError('Vui lòng chọn ít nhất 1 môn thể thao');
        return;
      }
      if (!skillLevel) {
        setError('Vui lòng chọn trình độ chơi của bạn');
        return;
      }
    } else {
      if (!clubName.trim()) {
        setError('Vui lòng nhập tên câu lạc bộ hoặc tổ chức');
        return;
      }
    }

    try {
      const payload = {
        name: name.trim(),
        role,
        preferences: {
          location: city,
          sports: role === UserRole.PLAYER ? selectedSports : [],
          skillLevel: role === UserRole.PLAYER ? skillLevel : undefined,
          clubName: role === UserRole.ORGANIZER ? clubName.trim() : undefined,
        },
      };
      await updateProfile(payload);
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu thông tin onboarding. Vui lòng thử lại.');
    }
  };

  return (
    <YStack f={1} bg="$background" p="$6" jc="center" ai="center">
      <YStack w="100%" maxW={340} gap="$5">
        
        {/* Step Indicator */}
        <XStack jc="center" gap="$2" mb="$2">
          {[1, 2, 3].map((s) => (
            <YStack
              key={s}
              w={s === step ? 32 : 12}
              h={6}
              br="$1"
              bg={s === step ? '$themeColor' : '$borderColor'}
              animation="quick"
            />
          ))}
        </XStack>

        {error && (
          <YStack bg="$red3" p="$3" br="$4" borderWidth={1} borderColor="$red7">
            <Paragraph col="$red10" fow="600" fos="$3" ta="center">{error}</Paragraph>
          </YStack>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <YStack gap="$4">
            <YStack ai="center" gap="$1" mb="$2">
              <H3 col="$color" fontWeight="800" ta="center">Bạn tham gia với tư cách nào?</H3>
              <Paragraph col="$colorMuted" ta="center" fos="$2">
                Vai trò này sẽ được khóa cố định sau khi hoàn thành.
              </Paragraph>
            </YStack>

            <YStack gap="$3">
              {/* Player Role Card */}
              <YStack
                borderWidth={2}
                borderColor={role === UserRole.PLAYER ? '$themeColor' : '$borderColor'}
                bg={role === UserRole.PLAYER ? '$themeColorHover' : '$backgroundHover'}
                p="$4"
                br="$5"
                onPress={() => setRole(UserRole.PLAYER)}
                gap="$2"
              >
                <XStack ai="center" gap="$3">
                  <Paragraph fontSize={28}>🏸</Paragraph>
                  <YStack f={1}>
                    <H4 col="$color" fow="700">Người chơi (Player)</H4>
                    <Paragraph col="$colorMuted" fos="$2" lh={16}>
                      Tìm bạn chơi nhanh chóng, tham gia trận đấu xung quanh, chia sẻ kỹ năng thể thao.
                    </Paragraph>
                  </YStack>
                </XStack>
              </YStack>

              {/* Organizer Role Card */}
              <YStack
                borderWidth={2}
                borderColor={role === UserRole.ORGANIZER ? '$themeColor' : '$borderColor'}
                bg={role === UserRole.ORGANIZER ? '$themeColorHover' : '$backgroundHover'}
                p="$4"
                br="$5"
                onPress={() => setRole(UserRole.ORGANIZER)}
                gap="$2"
              >
                <XStack ai="center" gap="$3">
                  <Paragraph fontSize={28}>🏆</Paragraph>
                  <YStack f={1}>
                    <H4 col="$color" fow="700">Ban tổ chức (Organizer)</H4>
                    <Paragraph col="$colorMuted" fos="$2" lh={16}>
                      Tạo giải đấu phong trào, quản lý danh sách vận động viên và đặt lịch sân trực tuyến.
                    </Paragraph>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>

            <Button mt="$3" onPress={handleNextStep}>
              Tiếp tục
            </Button>
          </YStack>
        )}

        {/* STEP 2: PERSONAL DETAILS & LOCATION */}
        {step === 2 && (
          <YStack gap="$4">
            <YStack ai="center" gap="$1" mb="$2">
              <H3 col="$color" fontWeight="800" ta="center">Thông tin cơ bản</H3>
              <Paragraph col="$colorMuted" ta="center" fos="$2">
                Hãy cho mọi người biết tên của bạn và thành phố bạn sống.
              </Paragraph>
            </YStack>

            <YStack gap="$3">
              <YStack gap="$1">
                <Label col="$color" fow="600">Họ và tên</Label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChangeText={setName}
                />
              </YStack>

              <YStack gap="$2">
                <Label col="$color" fow="600">Thành phố hoạt động chính</Label>
                
                {/* Custom City Buttons */}
                <XStack gap="$2" jc="space-between">
                  {(['Da Nang', 'Ha Noi', 'Ho Chi Minh'] as const).map((c) => {
                    const label = c === 'Da Nang' ? 'Đà Nẵng' : c === 'Ha Noi' ? 'Hà Nội' : 'TP. HCM';
                    const active = city === c;
                    return (
                      <Button
                        key={c}
                        f={1}
                        theme={active ? 'active' : 'alt2'}
                        borderWidth={active ? 2 : 1}
                        borderColor={active ? '$themeColor' : '$borderColor'}
                        onPress={() => {
                          setCity(c);
                          setGpsSuccess(false);
                          setGpsError(null);
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </XStack>

                {/* GPS Detection */}
                <Button
                  mt="$2"
                  theme="alt1"
                  onPress={detectLocation}
                  disabled={isGpsLoading}
                >
                  {isGpsLoading ? (
                    <XStack ai="center" gap="$2">
                      <Spinner size="small" color="$color" />
                      <Paragraph col="$color" fos="$2">Đang định vị...</Paragraph>
                    </XStack>
                  ) : (
                    '📍 Tự động định vị GPS'
                  )}
                </Button>

                {gpsSuccess && (
                  <Paragraph col="$green10" fos="$1" fow="600" ta="center">
                    Đã định vị thành công! Thành phố được chọn: {city === 'Da Nang' ? 'Đà Nẵng' : city === 'Ha Noi' ? 'Hà Nội' : 'TP. Hồ Chí Minh'}
                  </Paragraph>
                )}

                {gpsError && (
                  <Paragraph col="$yellow10" fos="$1" fow="600" ta="center" lh={14}>
                    ⚠️ {gpsError}
                  </Paragraph>
                )}
              </YStack>
            </YStack>

            <XStack gap="$3" mt="$3">
              <Button f={1} theme="alt2" onPress={handlePrevStep}>
                Quay lại
              </Button>
              <Button f={1} onPress={handleNextStep}>
                Tiếp tục
              </Button>
            </XStack>
          </YStack>
        )}

        {/* STEP 3: PREFERENCES */}
        {step === 3 && (
          <YStack gap="$4">
            {role === UserRole.PLAYER ? (
              // Player Preferences
              <YStack gap="$4">
                <YStack ai="center" gap="$1" mb="$2">
                  <H3 col="$color" fontWeight="800" ta="center">Môn chơi & Trình độ</H3>
                  <Paragraph col="$colorMuted" ta="center" fos="$2">
                    Giúp kết nối bạn với những trận đấu vừa sức nhất.
                  </Paragraph>
                </YStack>

                {/* Sports Grid */}
                <YStack gap="$2">
                  <Label col="$color" fow="600">Chọn các môn thể thao (Chọn nhiều)</Label>
                  <XStack fw="wrap" gap="$2">
                    {([
                      { id: SportType.BADMINTON, label: 'Cầu lông', icon: '🏸' },
                      { id: SportType.FOOTBALL, label: 'Bóng đá', icon: '⚽' },
                      { id: SportType.PICKLEBALL, label: 'Pickleball', icon: '🏓' },
                      { id: SportType.TENNIS, label: 'Tennis', icon: '🎾' },
                    ]).map((s) => {
                      const selected = selectedSports.includes(s.id);
                      return (
                        <Button
                          key={s.id}
                          theme={selected ? 'active' : 'alt2'}
                          borderWidth={selected ? 2 : 1}
                          borderColor={selected ? '$themeColor' : '$borderColor'}
                          onPress={() => handleSportToggle(s.id)}
                          px="$3"
                          py="$2"
                        >
                          <XStack ai="center" gap="$2">
                            <Paragraph fontSize={16}>{s.icon}</Paragraph>
                            <Paragraph col="$color" fos="$2">{s.label}</Paragraph>
                          </XStack>
                        </Button>
                      );
                    })}
                  </XStack>
                </YStack>

                {/* Skill Level Selection */}
                <YStack gap="$2">
                  <Label col="$color" fow="600">Trình độ chơi của bạn</Label>
                  <XStack gap="$2">
                    {([
                      { id: 'Beginner', label: 'Mới chơi', desc: 'Nhập môn' },
                      { id: 'Intermediate', label: 'Trung bình', desc: 'Đã chơi lâu' },
                      { id: 'Advanced', label: 'Nâng cao', desc: 'Có giải đấu' },
                    ] as const).map((l) => {
                      const active = skillLevel === l.id;
                      return (
                        <Button
                          key={l.id}
                          f={1}
                          theme={active ? 'active' : 'alt2'}
                          borderWidth={active ? 2 : 1}
                          borderColor={active ? '$themeColor' : '$borderColor'}
                          onPress={() => setSkillLevel(l.id)}
                          py="$3"
                          h="auto"
                        >
                          <YStack ai="center">
                            <Paragraph col="$color" fow="700" fos="$2">{l.label}</Paragraph>
                            <Paragraph col={active ? '$color' : '$colorMuted'} fos="$1" ta="center">
                              {l.desc}
                            </Paragraph>
                          </YStack>
                        </Button>
                      );
                    })}
                  </XStack>
                </YStack>
              </YStack>
            ) : (
              // Organizer Preferences
              <YStack gap="$4">
                <YStack ai="center" gap="$1" mb="$2">
                  <H3 col="$color" fontWeight="800" ta="center">Thông tin câu lạc bộ</H3>
                  <Paragraph col="$colorMuted" ta="center" fos="$2">
                    Tên hiển thị của ban tổ chức khi đăng giải đấu.
                  </Paragraph>
                </YStack>

                <YStack gap="$1">
                  <Label col="$color" fow="600">Tên Câu lạc bộ / Đơn vị tổ chức</Label>
                  <Input
                    placeholder="Ví dụ: Da Nang Pickleball Club"
                    value={clubName}
                    onChangeText={setClubName}
                  />
                </YStack>
              </YStack>
            )}

            <XStack gap="$3" mt="$3">
              <Button f={1} theme="alt2" onPress={handlePrevStep} disabled={isLoading}>
                Quay lại
              </Button>
              <Button f={1} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? <Spinner size="small" color="$color" /> : 'Hoàn tất'}
              </Button>
            </XStack>
          </YStack>
        )}

      </YStack>
    </YStack>
  );
};

export default OnboardingScreen;
