import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, Bell, CalendarDays, Camera, ChevronRight, LockKeyhole, LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogin } from '../../src/features/auth/hooks/useLogin';

const NAVY = '#00102F';
const BLUE = '#0077FF';
const YELLOW = '#FFC400';
const MUTED = '#52627A';
const BORDER = 'rgba(0,16,47,0.12)';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85';

function LocalHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: NAVY }}>
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <TouchableOpacity accessibilityLabel="Quay lại" onPress={onBack} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ArrowLeft color="#FFFFFF" size={24} /></TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '600', marginLeft: 8 }}>{title}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon: Icon, label, detail, onPress, disabled = false, destructive = false }: any) {
  return (
    <TouchableOpacity disabled={disabled} activeOpacity={0.7} onPress={onPress} style={{ minHeight: 64, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: BORDER, opacity: disabled ? 0.55 : 1 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: destructive ? '#FFF2F1' : '#F1F6FD', alignItems: 'center', justifyContent: 'center' }}><Icon color={destructive ? '#E8483B' : BLUE} size={20} /></View>
      <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: destructive ? '#E8483B' : NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{label}</Text>{detail && <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{detail}</Text>}</View>
      {!destructive && (disabled ? <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>Sắp ra mắt</Text> : <ChevronRight color={MUTED} size={20} />)}
    </TouchableOpacity>
  );
}

export default function ProfileTab() {
  const { user, logout, updateProfile } = useLogin();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const prefs = (user?.preferences || {}) as any;
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(prefs.username || '');
  const [bio, setBio] = useState(prefs.bio || '');
  const [avatar, setAvatar] = useState(prefs.avatarUrl || DEFAULT_AVATAR);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setUsername(prefs.username || '');
    setBio(prefs.bio || '');
    setAvatar(prefs.avatarUrl || DEFAULT_AVATAR);
  }, [user?.name, prefs.username, prefs.bio, prefs.avatarUrl]);

  const closeSubview = () => router.setParams({ view: undefined as any });
  const saveProfile = async () => {
    if (!name.trim()) return Alert.alert('Thiếu họ và tên', 'Hãy nhập họ và tên trước khi lưu hồ sơ.');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), preferences: { ...prefs, username: username.trim(), bio: bio.trim(), avatarUrl: avatar } });
      Alert.alert('Đã lưu hồ sơ', 'Thông tin cá nhân của bạn đã được cập nhật.');
      closeSubview();
    } catch { Alert.alert('Không thể lưu hồ sơ', 'Kiểm tra thông tin rồi thử lại.'); }
    finally { setSaving(false); }
  };

  if (view === 'edit-profile') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
        <LocalHeader title="Chỉnh sửa hồ sơ" onBack={closeSubview} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <TouchableOpacity onPress={() => setAvatar(avatar === DEFAULT_AVATAR ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85' : DEFAULT_AVATAR)} style={{ width: 104, height: 104 }}>
              <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#FFFFFF' }} />
              <View style={{ position: 'absolute', right: 0, bottom: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F7FAFF' }}><Camera color="#FFFFFF" size={18} /></View>
            </TouchableOpacity>
            <Text style={{ color: BLUE, fontSize: 14, lineHeight: 20, fontWeight: '600', marginTop: 8 }}>Đổi ảnh đại diện</Text>
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16 }}>
            <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginBottom: 16 }}>Thông tin cá nhân</Text>
            {[{ label: 'Họ và tên', value: name, setter: setName, placeholder: 'Nhập họ và tên' }, { label: 'Tên người dùng', value: username, setter: setUsername, placeholder: '@tennguoidung' }].map(field => (
              <View key={field.label} style={{ marginBottom: 16 }}><Text style={{ color: NAVY, fontSize: 14, lineHeight: 20, fontWeight: '600', marginBottom: 8 }}>{field.label}</Text><TextInput value={field.value} onChangeText={field.setter} placeholder={field.placeholder} placeholderTextColor="#7B8AA3" style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#F7FAFF', color: NAVY, fontSize: 16, paddingHorizontal: 14 }} /></View>
            ))}
            <Text style={{ color: NAVY, fontSize: 14, lineHeight: 20, fontWeight: '600', marginBottom: 8 }}>Giới thiệu</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Chia sẻ đôi chút về bạn…" placeholderTextColor="#7B8AA3" multiline style={{ minHeight: 104, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#F7FAFF', color: NAVY, fontSize: 16, lineHeight: 24, padding: 14, textAlignVertical: 'top' }} />
          </View>
          <TouchableOpacity disabled={saving} onPress={saveProfile} style={{ height: 48, borderRadius: 12, backgroundColor: saving ? '#B7C5D8' : BLUE, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Lưu hồ sơ</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (view === 'schedule') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
        <LocalHeader title="Lịch thi đấu" onBack={closeSubview} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}><CalendarDays color={YELLOW} size={34} /></View>
          <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginTop: 24 }}>Chưa có lịch thi đấu</Text>
          <Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 8 }}>Các trận đấu và giải đã đăng ký sẽ xuất hiện tại đây khi ban tổ chức công bố lịch.</Text>
          <TouchableOpacity onPress={() => { closeSubview(); router.replace('/(tabs)/dashboard'); }} style={{ height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: BLUE, justifyContent: 'center', marginTop: 24 }}><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Khám phá giải đấu</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  const city = prefs.location === 'Ha Noi' ? 'Hà Nội' : prefs.location === 'Ho Chi Minh' ? 'TP. Hồ Chí Minh' : 'Đà Nẵng';
  const role = user?.role === 'ORGANIZER' ? 'Nhà tổ chức' : 'Vận động viên';
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F7FAFF' }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: NAVY, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: avatar }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FFFFFF' }} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '600', flexShrink: 1 }}>{user?.name || 'Thành viên CourtMate'}</Text>{user?.isVerified && <Award color={YELLOW} size={20} style={{ marginLeft: 6 }} />}</View>
            <Text style={{ color: '#B8C7E0', fontSize: 14, lineHeight: 20 }}>{username || user?.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}><MapPin color={YELLOW} size={16} /><Text style={{ color: '#B8C7E0', fontSize: 14, lineHeight: 20, marginLeft: 4 }}>{role} · {city}</Text></View>
          </View>
        </View>
        {bio ? <Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 24, marginTop: 16 }}>{bio}</Text> : null}
        <TouchableOpacity onPress={() => router.setParams({ view: 'edit-profile' })} style={{ height: 48, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Chỉnh sửa hồ sơ</Text></TouchableOpacity>
      </View>

      <View style={{ margin: 16, flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER }}>
        {[['Đã đăng ký', '0'], ['Hoàn thành', '0'], ['Đã lưu', String(user?.bookmarkedTournaments?.length || 0)]].map(([label, value], index) => <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderLeftWidth: index ? 1 : 0, borderLeftColor: BORDER }}><Text style={{ color: BLUE, fontSize: 20, lineHeight: 24, fontWeight: '600' }}>{value}</Text><Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{label}</Text></View>)}
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginBottom: 8 }}>Tài khoản</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, overflow: 'hidden' }}>
          <SettingRow icon={UserRound} label="Hồ sơ cá nhân" detail="Tên, ảnh đại diện và giới thiệu" onPress={() => router.setParams({ view: 'edit-profile' })} />
          <SettingRow icon={LockKeyhole} label="Bảo mật và mật khẩu" detail="Xác thực và bảo vệ tài khoản" disabled />
        </View>

        <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginTop: 24, marginBottom: 8 }}>Trải nghiệm</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16, overflow: 'hidden' }}>
          <SettingRow icon={Bell} label="Thông báo" detail="Email và thông báo đẩy" disabled />
          <SettingRow icon={CalendarDays} label="Lịch thi đấu" detail="Các giải và trận đấu đã đăng ký" onPress={() => router.setParams({ view: 'schedule' })} />
          <SettingRow icon={ShieldCheck} label="Quyền riêng tư" detail="Kiểm soát hiển thị hồ sơ" disabled />
        </View>

        <View style={{ marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 16 }}>
          <SettingRow icon={LogOut} label="Đăng xuất" destructive onPress={() => Alert.alert('Đăng xuất khỏi CourtMate?', 'Bạn cần đăng nhập lại để tiếp tục.', [{ text: 'Ở lại', style: 'cancel' }, { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } }])} />
        </View>
      </View>
    </ScrollView>
  );
}
