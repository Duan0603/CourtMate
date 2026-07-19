import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Image, 
  Alert, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { 
  User, 
  Shield, 
  Bell, 
  EyeOff, 
  ChevronRight, 
  ArrowLeft, 
  Camera, 
  Plus, 
  X, 
  Link2, 
  LogOut, 
  CheckCircle2, 
  Target, 
  Activity, 
  Trophy, 
  Sparkles, 
  Award,
  Calendar,
  Feather,
  Gamepad2,
  Trash2
} from 'lucide-react-native';
import gsap from 'gsap';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const DribbbleIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.49-11.05 1-11.6 8.56" />
  </Svg>
);

const FacebookIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);

const InstagramIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <Circle cx="12" cy="12" r="4" />
    <Circle cx="17.5" cy="6.5" r="1.5" fill={color} />
  </Svg>
);

const TwitterIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </Svg>
);

export default function ProfileTab() {
  const navigation = useNavigation<any>();
  const { user, logout, updateProfile } = useLogin();
  const { view: initialView } = useLocalSearchParams<{ view?: string }>();

  // Screen state
  const [currentView, setCurrentView] = useState<'SETTINGS' | 'EDIT_PROFILE' | 'SCHEDULE'>('SETTINGS');

  // GSAP Animation refs
  const settingsWrapperRef = useRef<View>(null);
  const editProfileWrapperRef = useRef<View>(null);
  const scheduleWrapperRef = useRef<View>(null);

  // Form states initialized with user preferences
  const [fullName, setFullName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.preferences?.username || '@amercer_elite');
  const [bio, setBio] = useState(user?.preferences?.bio || 'Competitive tennis player focused on agility and baseline power. Looking for local tournaments.');
  const [selectedSports, setSelectedSports] = useState<string[]>(user?.preferences?.sports || ['tennis', 'basketball']);
  const [socialLinks, setSocialLinks] = useState<{ id: string; url: string }[]>(() => {
    const links = [];
    const sLinks = user?.preferences?.socialLinks as any;
    if (sLinks?.instagram) {
      links.push({ id: '1', url: sLinks.instagram });
    }
    if (sLinks?.twitter) {
      links.push({ id: '2', url: sLinks.twitter });
    }
    if (sLinks?.facebook) {
      links.push({ id: '3', url: sLinks.facebook });
    }
    if (links.length === 0) {
      links.push({ id: '1', url: 'https://instagram.com/amercer' });
    }
    return links;
  });
  
  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMJuy6DPTqraCzbCGubSvOP_URsWJZHNJdT3BWRGY1bvEm9xwAyauxG6VpB7rC5XmVBCygMlDvVJOQ9_BDSklP_N-dAAw02nnphfApJqsPAJfaHESPRjgqKrLx25HLZnFe1tjkuVKicL5_Q364S_d6cpCuIdLDneJ62m--bp2QgHysZXK-s_lKzBN7gkQQ6h-Lrrnqe1Pn3PC_dzn1ncmbv98ZhfFCTz7NZyb8LktIbwbW85rjvAwLxuhbHTcn0axGUws92p08rM0';
  const [avatarUrl, setAvatarUrl] = useState(user?.preferences?.avatarUrl || defaultAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarsList = [
    defaultAvatar,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBasGFQDB6ZoYS4Cy_k3dB8mu-KgjU3E6NgBcul8DTergM3hD_z0i02jsw06YWmME9RVnyZfe49dQfjXYHMVw29G1reS890PaYGTrMgl3Be44MLwX3_pJpQ43tdoUHBuECWfUEIzm3aWPhybBcWOG15VsR52auDRMRhPH_ZiH3w4jYZoHggdEOuYw-7syw-hzVMTnXN2mG77Wpm9gdCygA62x7x1AZJOQbA5TQ_1m_8DRadC80CVsYgvrjfi0n21lsYN5LEiMSuSxA'
  ];

  const allSports = [
    { id: 'tennis', label: 'Tennis' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'football', label: 'Football' },
    { id: 'volleyball', label: 'Volleyball' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'pickleball', label: 'Pickleball' },
    { id: 'esports', label: 'Esports' }
  ];

  const isInitialMount = useRef(true);

  useEffect(() => {
    const targetView: 'SETTINGS' | 'EDIT_PROFILE' | 'SCHEDULE' = 
      initialView === 'edit-profile' ? 'EDIT_PROFILE' : 
      initialView === 'schedule' ? 'SCHEDULE' : 'SETTINGS';

    if (currentView === targetView) {
      isInitialMount.current = false;
      return;
    }

    const refs: Record<'SETTINGS' | 'EDIT_PROFILE' | 'SCHEDULE', React.RefObject<View>> = {
      SETTINGS: settingsWrapperRef,
      EDIT_PROFILE: editProfileWrapperRef,
      SCHEDULE: scheduleWrapperRef,
    };

    const prevRef = refs[currentView];
    const nextRef = refs[targetView];

    if (isInitialMount.current) {
      setCurrentView(targetView);
      if (Platform.OS === 'web') {
        Object.entries(refs).forEach(([key, ref]) => {
          if (key === targetView) {
            gsap.set(ref.current, { display: 'flex', opacity: 1, scale: 1, y: 0 });
          } else {
            gsap.set(ref.current, { display: 'none', opacity: 0 });
          }
        });
      }
    } else {
      if (Platform.OS === 'web') {
        const tl = gsap.timeline({
          onStart: () => {
            gsap.set(nextRef.current, { display: 'flex' });
          },
          onComplete: () => {
            gsap.set(prevRef.current, { display: 'none' });
            setCurrentView(targetView);
          }
        });

        tl.to(prevRef.current, {
          opacity: 0,
          scale: 0.95,
          y: targetView === 'SETTINGS' ? 15 : -15,
          duration: 0.25,
          ease: 'power2.inOut'
        });

        tl.fromTo(nextRef.current,
          { opacity: 0, scale: 0.95, y: targetView === 'SETTINGS' ? -15 : 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          '-=0.12'
        );
      } else {
        setCurrentView(targetView);
      }
    }
    isInitialMount.current = false;
  }, [initialView, currentView]);

  const getSportIcon = (sportId: string, color: string) => {
    const s = sportId.toLowerCase();
    if (s.includes('tennis')) return <Target color={color} size={14} />;
    if (s.includes('basketball')) return <DribbbleIcon color={color} size={14} />;
    if (s.includes('football')) return <Trophy color={color} size={14} />;
    if (s.includes('volleyball')) return <Sparkles color={color} size={14} />;
    if (s.includes('badminton')) return <Feather color={color} size={14} />;
    if (s.includes('pickleball')) return <Award color={color} size={14} />;
    if (s.includes('esports')) return <Gamepad2 color={color} size={14} />;
    return <Shield color={color} size={14} />;
  };

  const toggleSport = (sportId: string, add: boolean) => {
    const target = sportId.toLowerCase();
    if (add) {
      const matchedSport = allSports.find(sp => sp.id.toLowerCase() === target);
      const dbId = matchedSport ? matchedSport.id.toUpperCase() : sportId.toUpperCase();
      if (!selectedSports.some(s => s.toLowerCase() === target)) {
        setSelectedSports([...selectedSports, dbId]);
      }
    } else {
      setSelectedSports(selectedSports.filter(s => s.toLowerCase() !== target));
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { id: String(Date.now()), url: "" }]);
  };

  const updateSocialLink = (id: string, url: string) => {
    setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, url } : link));
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const handleAvatarChange = () => {
    const nextIdx = avatarUrl === avatarsList[0] ? 1 : 0;
    setAvatarUrl(avatarsList[nextIdx]);
    Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
  };

  const goToEditProfile = () => {
    router.setParams({ view: 'edit-profile' });
  };

  const goToSchedule = () => {
    router.setParams({ view: 'schedule' });
  };

  const goToSettings = () => {
    router.setParams({ view: undefined as any });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      return Alert.alert('Lỗi', 'Vui lòng nhập họ và tên.');
    }
    
    setIsSubmitting(true);
    try {
      const insta = socialLinks.find(link => link.url.toLowerCase().includes('instagram.com'))?.url || '';
      const twt = socialLinks.find(link => link.url.toLowerCase().includes('twitter.com') || link.url.toLowerCase().includes('x.com'))?.url || '';
      const fb = socialLinks.find(link => link.url.toLowerCase().includes('facebook.com') || link.url.toLowerCase().includes('fb.com'))?.url || '';

      await updateProfile({
        name: fullName.trim(),
        preferences: {
          ...user?.preferences,
          username: username.trim(),
          bio: bio.trim(),
          sports: selectedSports,
          avatarUrl: avatarUrl,
          socialLinks: {
            instagram: insta.trim(),
            twitter: twt.trim(),
            facebook: fb.trim()
          }
        }
      });
      Alert.alert('Thành công', 'Thông tin cá nhân đã được lưu!');
      goToSettings();
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể lưu thay đổi: ' + String(error.message || error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Main Container Wrapper */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: currentView === 'SETTINGS' ? 16 : 24 }}
      >
        <View className="max-w-md w-full mx-auto px-4">
          
          {/* Settings Main View */}
          <View 
            ref={settingsWrapperRef}
            style={Platform.OS === 'web' ? { width: '100%' } : { display: currentView === 'SETTINGS' ? 'flex' : 'none' }}
          >
            <View className="mb-6 mt-4">
              <Text className="text-3xl font-bold text-slate-900">Cài đặt</Text>
              <Text className="text-base text-slate-500 mt-1">Quản lý tài khoản và tuỳ chỉnh của bạn.</Text>
            </View>

            <View className="flex-col">
              {/* Profile Details */}
              <TouchableOpacity
                onPress={goToEditProfile}
                className="w-full flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-3 active:scale-[0.99]"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                    <User color="#2563eb" size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium text-slate-900">Hồ sơ cá nhân</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">Cập nhật thông tin cá nhân và tiểu sử</Text>
                  </View>
                </View>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>

              {/* Security & Password */}
              <TouchableOpacity
                onPress={() => Alert.alert('Bảo mật', 'Chức năng Bảo mật & Mật khẩu sẽ sớm ra mắt')}
                className="w-full flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-3 active:scale-[0.99]"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                    <Shield color="#2563eb" size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium text-slate-900">Bảo mật & Mật khẩu</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">Quản lý mật khẩu và xác thực 2 lớp</Text>
                  </View>
                </View>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity
                onPress={() => Alert.alert('Thông báo', 'Chức năng cấu hình Thông báo sẽ sớm ra mắt')}
                className="w-full flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-3 active:scale-[0.99]"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                    <Bell color="#2563eb" size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium text-slate-900">Thông báo</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">Cấu hình email, push và SMS</Text>
                  </View>
                </View>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>

              {/* Privacy */}
              <TouchableOpacity
                onPress={() => Alert.alert('Quyền riêng tư', 'Chức năng cấu hình Quyền riêng tư sẽ sớm ra mắt')}
                className="w-full flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-3 active:scale-[0.99]"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                    <EyeOff color="#2563eb" size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium text-slate-900">Quyền riêng tư</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">Kiểm soát ai được xem hồ sơ của bạn</Text>
                  </View>
                </View>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>

              {/* Lịch thi đấu */}
              <TouchableOpacity
                onPress={goToSchedule}
                className="w-full flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-3 active:scale-[0.99]"
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center">
                    <Calendar color="#2563eb" size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium text-slate-900">Lịch thi đấu</Text>
                    <Text className="text-sm text-slate-500 mt-0.5">Xem các trận đấu và giải đấu đã đăng ký</Text>
                  </View>
                </View>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await logout();
                    router.replace('/');
                  } catch (err) {
                    Alert.alert('Lỗi', 'Không thể đăng xuất: ' + String(err));
                  }
                }}
                className="w-full flex-row items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-200/50 shadow-sm mt-4 active:scale-[0.99]"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center">
                    <LogOut color="#ef4444" size={24} />
                  </View>
                  <View className="ml-4">
                    <Text className="text-lg font-semibold text-red-500">Đăng xuất</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Edit Profile Form View */}
          <View 
            ref={editProfileWrapperRef}
            style={Platform.OS === 'web' ? { width: '100%', display: 'none', opacity: 0, scale: 0.95 } as any : { display: currentView === 'EDIT_PROFILE' ? 'flex' : 'none' }}
          >
            {/* Inline header for Edit Profile view (shown when global top & bottom taskbars are hidden) */}
            <View className="flex-row items-center justify-between py-4 mb-4 border-b border-slate-200">
              <View className="flex-row items-center">
                <TouchableOpacity className="mr-3 p-1 rounded-full active:scale-95 transition-transform" onPress={goToSettings}>
                  <ArrowLeft color="#475569" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 tracking-tighter">Chỉnh sửa hồ sơ</Text>
              </View>
              <TouchableOpacity 
                onPress={isSubmitting ? undefined : handleSave} 
                className="bg-blue-600 px-5 py-2 rounded-full active:scale-95 transition-transform"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
            {/* Avatar Section */}
            <View className="bg-white border border-slate-200 rounded-xl p-6 items-center justify-center shadow-sm mb-4 mt-4">
              <TouchableOpacity 
                onPress={handleAvatarChange}
                className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm"
              >
                <Image source={avatarUrl === defaultAvatar ? require("../../assets/images/woman_avatar.png") : { uri: avatarUrl }} className="w-full h-full object-cover" />
                <View className="absolute inset-0 bg-slate-900/40 items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera color="#ffffff" size={32} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAvatarChange} className="mt-4">
                <Text className="text-sm font-semibold text-blue-600">Đổi ảnh đại diện</Text>
              </TouchableOpacity>
            </View>

            {/* Basic Info form */}
            <View className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-4">
              <Text className="text-xl font-semibold text-slate-900 mb-4">Thông tin cơ bản</Text>
              
              {/* Full Name */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Họ và tên</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                  className="bg-slate-50 w-full border-b-2 border-slate-200 focus:border-blue-600 p-3 text-slate-900 rounded-t"
                  placeholder="Nhập họ và tên"
                />
              </View>

              {/* Username */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Tên đăng nhập</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                  className="bg-slate-50 w-full border-b-2 border-slate-200 focus:border-blue-600 p-3 text-slate-900 rounded-t"
                  placeholder="@username"
                />
              </View>

              {/* Bio */}
              <View className="mb-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Tiểu sử</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                  className="bg-slate-50 w-full border border-slate-200 focus:border-blue-600 p-3 text-slate-900 rounded-lg text-sm"
                  placeholder="Giới thiệu về bản thân..."
                />
              </View>
            </View>

            {/* Favorite Sports Chips Card */}
            <View className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-slate-900">Môn thể thao yêu thích</Text>
                <TouchableOpacity className="p-1 hover:bg-slate-100 rounded-full" onPress={() => Alert.alert('Thông tin', 'Nhấn vào các gợi ý bên dưới để thêm môn thể thao yêu thích!')}>
                  <Plus color="#2563eb" size={20} />
                </TouchableOpacity>
              </View>
              
              {/* Selected Active Chips */}
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Đang chọn</Text>
              <View className="flex-row flex-wrap mb-4">
                {selectedSports.length === 0 ? (
                  <Text className="text-xs text-slate-400 italic py-2">Chưa chọn môn nào. Nhấn gợi ý bên dưới để thêm.</Text>
                ) : (
                  selectedSports.map(s => {
                    const matched = allSports.find(sport => sport.id.toLowerCase() === s.toLowerCase()) || { label: s, id: s };
                    return (
                      <TouchableOpacity 
                        key={matched.id}
                        onPress={() => toggleSport(matched.id, false)}
                        className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mr-2 mb-2"
                      >
                        {getSportIcon(matched.id, '#2563eb')}
                        <Text className="text-xs font-semibold text-blue-600 ml-1.5 mr-1">{matched.label}</Text>
                        <X color="rgba(37, 99, 235, 0.7)" size={12} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {/* Suggestions Inactive Chips */}
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Gợi ý thêm</Text>
              <View className="flex-row flex-wrap">
                {allSports.filter(s => !selectedSports.some(sel => sel.toLowerCase() === s.id.toLowerCase())).map(s => {
                  return (
                    <TouchableOpacity 
                      key={s.id}
                      onPress={() => toggleSport(s.id, true)}
                      className="flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 mr-2 mb-2"
                    >
                      {getSportIcon(s.id, '#64748B')}
                      <Text className="text-xs font-semibold text-slate-600 ml-1.5 mr-1">{s.label}</Text>
                      <Plus color="#64748b" size={12} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Social Links Card */}
            <View className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-slate-900">Mạng xã hội</Text>
                <TouchableOpacity 
                  onPress={addSocialLink} 
                  className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                >
                  <Plus color="#2563eb" size={14} />
                  <Text className="text-xs font-bold text-blue-600 ml-1">+ Mạng xã hội</Text>
                </TouchableOpacity>
              </View>

              {socialLinks.map((link) => {
                let IconComponent: any = Link2;
                let iconColor = "#64748b";
                const lowerUrl = link.url.toLowerCase();
                if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.com")) {
                  IconComponent = FacebookIcon;
                  iconColor = "#1877F2";
                } else if (lowerUrl.includes("instagram.com")) {
                  IconComponent = InstagramIcon;
                  iconColor = "#E4405F";
                } else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
                  IconComponent = TwitterIcon;
                  iconColor = "#1A1A1A";
                }

                return (
                  <View 
                    key={link.id} 
                    className="flex-row items-center border border-slate-200 focus-within:border-blue-600 mb-3 bg-slate-50 rounded-xl px-3 py-1"
                  >
                    <IconComponent color={iconColor} size={18} />
                    <TextInput
                      value={link.url}
                      onChangeText={(val) => updateSocialLink(link.id, val)}
                      style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                      className="flex-1 p-3 text-slate-900 text-sm font-medium"
                      placeholder="Nhập đường dẫn (Facebook, Instagram, X...)"
                    />
                    <TouchableOpacity 
                      onPress={() => removeSocialLink(link.id)}
                      className="p-2 active:scale-90 rounded-full hover:bg-red-50"
                    >
                      <Trash2 color="#ef4444" size={16} />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {socialLinks.length === 0 && (
                <Text className="text-xs text-slate-400 italic text-center py-4">Chưa có liên kết mạng xã hội nào. Nhấn "+ Mạng xã hội" để thêm.</Text>
              )}
            </View>
            
            {/* Save Button Card */}
            <TouchableOpacity
              onPress={isSubmitting ? undefined : handleSave}
              className="bg-blue-600 h-14 rounded-xl flex-row items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 color="#ffffff" size={20} className="mr-2" />
                  <Text className="text-white font-bold text-base uppercase tracking-wider ml-2">Lưu thay đổi</Text>
                </View>
              )}
            </TouchableOpacity>

          </View>

          {/* Lịch thi đấu Form View */}
          <View 
            ref={scheduleWrapperRef}
            style={Platform.OS === 'web' ? { width: '100%', display: 'none', opacity: 0, scale: 0.95 } as any : { display: currentView === 'SCHEDULE' ? 'flex' : 'none' }}
          >
            {/* Inline header for Schedule view */}
            <View className="flex-row items-center justify-between py-4 mb-4 border-b border-slate-200">
              <View className="flex-row items-center">
                <TouchableOpacity className="mr-3 p-1 rounded-full active:scale-95 transition-transform" onPress={goToSettings}>
                  <ArrowLeft color="#475569" size={24} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 tracking-tighter">Lịch thi đấu của tôi</Text>
              </View>
            </View>

            {/* List of schedule matches */}
            <View className="flex-col gap-3">
              {[
                {
                  id: 'sch-1',
                  title: 'Elite Clay Masters 2026',
                  sport: 'Tennis',
                  location: 'Metropolis Arena - Sân số 2',
                  date: '20 Tháng 7, 2026',
                  time: '08:00 AM',
                  matchType: 'Vòng 1 - Đơn nam',
                  status: 'Sắp diễn ra',
                  color: '#2563eb'
                },
                {
                  id: 'sch-2',
                  title: 'Pro City Hoop Series',
                  sport: 'Basketball',
                  location: 'Skyline Sports Complex - Sân A',
                  date: '24 Tháng 7, 2026',
                  time: '15:30 PM',
                  matchType: 'Vòng bảng - Trận 2',
                  status: 'Đang chuẩn bị',
                  color: '#22c55e'
                }
              ].map((match) => (
                <View 
                  key={match.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="bg-blue-50 px-2 py-[3px] rounded">
                      <Text className="text-[10px] text-blue-600 font-bold uppercase">{match.sport}</Text>
                    </View>
                    <View className="bg-orange-50 px-2 py-[3px] rounded-full">
                      <Text className="text-[10px] text-orange-600 font-bold">{match.status}</Text>
                    </View>
                  </View>

                  <Text className="text-base font-bold text-slate-900 mb-1">{match.title}</Text>
                  <Text className="text-sm text-slate-700 font-semibold mb-2">{match.matchType}</Text>
                  
                  <View className="flex-row items-center gap-1.5 mb-1.5">
                    <Calendar color="#64748b" size={13} />
                    <Text className="text-xs text-slate-500">{match.date} • {match.time}</Text>
                  </View>

                  <View className="flex-row items-center gap-1.5">
                    <Target color="#64748b" size={13} />
                    <Text className="text-xs text-slate-500" numberOfLines={1}>{match.location}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
