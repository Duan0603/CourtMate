import React, { useState } from 'react';
import { YStack, XStack, H2, Paragraph, Label, Spinner, Text, ScrollView, View } from 'tamagui';
import { router } from 'expo-router';
import { useLogin } from '../src/features/auth/hooks/useLogin';
import { Input } from '../src/components';
import { ChevronLeft, CheckCircle2, User as UserIcon } from 'lucide-react-native';
import { UserRole, SportType } from '@courtmate/shared';

export default function EditProfileScreen() {
  const { user, updateProfile } = useLogin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State initialized with current user data
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.preferences?.location || '');
  
  // Player specific
  const [selectedSports, setSelectedSports] = useState<SportType[]>(user?.preferences?.sports || []);
  const [skillLevel, setSkillLevel] = useState(user?.preferences?.skillLevel || '');
  
  // Organizer specific
  const [clubName, setClubName] = useState(user?.preferences?.clubName || '');

  const handleSportToggle = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) return setError('Vui lòng nhập tên hiển thị');
    if (!city) return setError('Vui lòng chọn thành phố');

    if (user?.role === UserRole.PLAYER) {
      if (selectedSports.length === 0) return setError('Vui lòng chọn ít nhất 1 môn thể thao');
      if (!skillLevel) return setError('Vui lòng chọn trình độ');
    } else if (user?.role === UserRole.ORGANIZER) {
      if (!clubName.trim()) return setError('Vui lòng nhập tên CLB');
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        preferences: {
          location: city,
          sports: user?.role === UserRole.PLAYER ? selectedSports : undefined,
          skillLevel: user?.role === UserRole.PLAYER ? skillLevel : undefined,
          clubName: user?.role === UserRole.ORGANIZER ? clubName.trim() : undefined,
        },
      });
      router.back();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack f={1} bg="#fcf8fa" position="relative">
      
      {/* Header */}
      <XStack pt="$10" pb="$4" px="$5" ai="center" jc="space-between" bg="#ffffff" borderBottomWidth={1} borderBottomColor="rgba(124, 116, 122, 0.15)">
        <YStack w={40} h={40} jc="center" ai="flex-start" onPress={() => router.back()}>
          <ChevronLeft color="#1d4ed8" size={24} />
        </YStack>
        <H2 color="#1e293b" fow="700" fos={18}>Chỉnh sửa Hồ sơ</H2>
        <YStack w={40} h={40} />
      </XStack>

      <ScrollView f={1} p="$5">
        <YStack gap="$5" pb="$10">
          
          {error && (
            <YStack bg="rgba(179, 38, 30, 0.1)" p="$3" br="$4" borderWidth={1} borderColor="rgba(179, 38, 30, 0.3)">
              <Paragraph color="#b3261e" fow="600" fos="$3" ta="center">{error}</Paragraph>
            </YStack>
          )}

          {/* Avatar Preview */}
          <YStack ai="center" py="$4">
            <YStack w={80} h={80} br={40} bg="rgba(29, 78, 216, 0.1)" jc="center" ai="center" borderWidth={2} borderColor="#1d4ed8">
              <UserIcon color="#1d4ed8" size={32} />
            </YStack>
            <Text color="#1d4ed8" mt="$3" fow="600" fos={14}>Đổi ảnh đại diện</Text>
          </YStack>

          <YStack gap="$2">
            <Label color="#1e293b" fow="600">Tên hiển thị</Label>
            <Input
              placeholder="Nhập tên của bạn"
              value={name}
              onChangeText={setName}
              bg="#ffffff"
              borderColor="#7c747a"
              color="#1e293b"
              h={50}
            />
          </YStack>

          <YStack gap="$2">
            <Label color="#1e293b" fow="600">Khu vực hoạt động</Label>
            <XStack gap="$2" fw="wrap">
              {(['Da Nang', 'Ha Noi', 'Ho Chi Minh'] as const).map(c => {
                const label = c === 'Da Nang' ? 'Đà Nẵng' : c === 'Ha Noi' ? 'Hà Nội' : 'TP. HCM';
                const active = city === c;
                return (
                  <YStack
                    key={c}
                    bg={active ? '#1d4ed8' : '#ffffff'}
                    borderWidth={1}
                    borderColor={active ? '#1d4ed8' : '#7c747a'}
                    px="$4"
                    py="$3"
                    br="$10"
                    onPress={() => setCity(c)}
                  >
                    <Text color={active ? '#ffffff' : '#1e293b'} fow="600">{label}</Text>
                  </YStack>
                );
              })}
            </XStack>
          </YStack>

          {user?.role === UserRole.PLAYER && (
            <>
              <YStack gap="$3" mt="$2">
                <Label color="#1e293b" fow="600">Sở thích thể thao</Label>
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
                        bg={active ? 'rgba(29, 78, 216, 0.1)' : '#ffffff'}
                        borderWidth={2}
                        borderColor={active ? '#1d4ed8' : 'rgba(124, 116, 122, 0.2)'}
                        p="$3"
                        br="$4"
                        ai="center"
                        onPress={() => handleSportToggle(s.id)}
                      >
                        <Text fos={24} mb="$1">{s.icon}</Text>
                        <Text color="#1e293b" fow="600" fos={14}>{s.label}</Text>
                      </YStack>
                    );
                  })}
                </XStack>
              </YStack>

              <YStack gap="$3" mt="$2">
                <Label color="#1e293b" fow="600">Trình độ</Label>
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
                        bg={active ? '#1d4ed8' : '#ffffff'}
                        borderWidth={1}
                        borderColor={active ? '#1d4ed8' : '#7c747a'}
                        py="$3"
                        br="$4"
                        ai="center"
                        onPress={() => setSkillLevel(l.id)}
                      >
                        <Text color={active ? '#ffffff' : '#1e293b'} fow="600" fos={13}>{l.label}</Text>
                      </YStack>
                    );
                  })}
                </XStack>
              </YStack>
            </>
          )}

          {user?.role === UserRole.ORGANIZER && (
            <YStack gap="$2" mt="$2">
              <Label color="#1e293b" fow="600">Tên CLB / Tổ chức</Label>
              <Input
                placeholder="Nhập tên CLB của bạn"
                value={clubName}
                onChangeText={setClubName}
                bg="#ffffff"
                borderColor="#7c747a"
                color="#1e293b"
                h={50}
              />
            </YStack>
          )}

          <YStack
            mt="$6"
            bg={isSubmitting ? "rgba(29, 78, 216, 0.5)" : "#1d4ed8"}
            h={56}
            br="$4"
            jc="center"
            ai="center"
            onPress={isSubmitting ? undefined : handleSave}
            pressStyle={{ opacity: 0.8 }}
          >
            {isSubmitting ? <Spinner size="small" color="#ffffff" /> : (
              <XStack ai="center" gap="$2">
                <CheckCircle2 color="#ffffff" size={20} />
                <Text color="#ffffff" fow="800" fos={16} tt="uppercase">
                  Lưu thay đổi
                </Text>
              </XStack>
            )}
          </YStack>

        </YStack>
      </ScrollView>
    </YStack>
  );
}
