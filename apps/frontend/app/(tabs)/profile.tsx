import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Award, Bell, CalendarDays, Camera, ChevronRight, LockKeyhole, LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../../src/services/uploads.api';

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

import { useRegistrations } from '../../src/features/registrations/hooks/useRegistrations';
import { tournamentsApi } from '../../src/features/tournaments/services/tournaments.api';
import { ScheduleCalendar } from '../../src/features/registrations/components/ScheduleCalendar';

export default function ProfileTab() {
  const { user, logout, updateProfile } = useLogin();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const prefs = (user?.preferences || {}) as any;
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(prefs.username || '');
  const [bio, setBio] = useState(prefs.bio || '');
  const [avatar, setAvatar] = useState(prefs.avatarUrl || DEFAULT_AVATAR);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [apiTournaments, setApiTournaments] = useState<any[]>([]);
  
  const { registrations, fetchRegistrations } = useRegistrations();
  const playerId = user?.id || (user as any)?._id;

  useEffect(() => {
    tournamentsApi.getTournaments({}).then(res => setApiTournaments(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setName(user?.name || '');
    setUsername(prefs.username || '');
    setBio(prefs.bio || '');
    setAvatar(prefs.avatarUrl || DEFAULT_AVATAR);
  }, [user?.name, prefs.username, prefs.bio, prefs.avatarUrl]);

  useEffect(() => {
    if (playerId) {
      fetchRegistrations(playerId);
    }
  }, [playerId, fetchRegistrations]);

  // Payment is completed outside this screen. Refresh when the schedule is
  // opened so registrations updated to PAID by the gateway callback appear
  // immediately instead of using the stale pre-payment state.
  useEffect(() => {
    if (view === 'schedule' && playerId) {
      fetchRegistrations(playerId);
    }
  }, [view, playerId, fetchRegistrations]);

  const closeSubview = () => router.setParams({ view: undefined as any });
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Cần quyền truy cập ảnh', 'Hãy cho phép CourtMate chọn ảnh đại diện.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) return Alert.alert('Ảnh quá lớn', 'Ảnh đại diện tối đa 5MB.');
    setUploadingAvatar(true);
    try { const uploaded = await uploadFile('avatar', { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType, file: (asset as any).file }); setAvatar(uploaded.url); }
    catch (error: any) { Alert.alert('Không thể tải ảnh', error.message || 'Vui lòng thử lại.'); }
    finally { setUploadingAvatar(false); }
  };
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
            <TouchableOpacity disabled={uploadingAvatar} onPress={pickAvatar} style={{ width: 104, height: 104, opacity: uploadingAvatar ? 0.6 : 1 }}>
              <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#FFFFFF' }} />
              <View style={{ position: 'absolute', right: 0, bottom: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F7FAFF' }}><Camera color="#FFFFFF" size={18} /></View>
            </TouchableOpacity>
            <Text style={{ color: BLUE, fontSize: 14, lineHeight: 20, fontWeight: '600', marginTop: 8 }}>{uploadingAvatar ? 'Đang tải ảnh…' : 'Đổi ảnh đại diện'}</Text>
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
        <ScheduleCalendar registrations={registrations} apiTournaments={apiTournaments} />
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
        {[['Đã đăng ký', String(registrations.length)], ['Hoàn thành', '0'], ['Đã lưu', String(user?.bookmarkedTournaments?.length || 0)]].map(([label, value], index) => <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderLeftWidth: index ? 1 : 0, borderLeftColor: BORDER }}><Text style={{ color: BLUE, fontSize: 20, lineHeight: 24, fontWeight: '600' }}>{value}</Text><Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{label}</Text></View>)}
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
