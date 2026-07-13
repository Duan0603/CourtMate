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
  Award
} from 'lucide-react-native';
import gsap from 'gsap';
import { useLogin } from '../../src/features/auth/hooks/useLogin';
import { router, useLocalSearchParams } from 'expo-router';

export default function ProfileTab() {
  const { user, logout, updateProfile } = useLogin();
  const { view: initialView } = useLocalSearchParams<{ view?: string }>();

  // Screen state
  const [currentView, setCurrentView] = useState<'SETTINGS' | 'EDIT_PROFILE'>('SETTINGS');

  // GSAP Animation refs
  const settingsWrapperRef = useRef<View>(null);
  const editProfileWrapperRef = useRef<View>(null);

  // Form states initialized with user preferences
  const [fullName, setFullName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.preferences?.username || '@amercer_elite');
  const [bio, setBio] = useState(user?.preferences?.bio || 'Competitive tennis player focused on agility and baseline power. Looking for local tournaments.');
  const [selectedSports, setSelectedSports] = useState<string[]>(user?.preferences?.sports || ['tennis', 'basketball']);
  const [instagramUrl, setInstagramUrl] = useState(user?.preferences?.socialLinks?.instagram || 'https://instagram.com/amercer');
  const [twitterUrl, setTwitterUrl] = useState(user?.preferences?.socialLinks?.twitter || '');
  
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
    if (initialView === 'edit-profile') {
      if (currentView !== 'EDIT_PROFILE') {
        if (isInitialMount.current) {
          setCurrentView('EDIT_PROFILE');
          if (Platform.OS === 'web') {
            gsap.set(settingsWrapperRef.current, { display: 'none', opacity: 0 });
            gsap.set(editProfileWrapperRef.current, { display: 'flex', opacity: 1, scale: 1, y: 0 });
          }
        } else {
          if (Platform.OS === 'web') {
            const tl = gsap.timeline({
              onStart: () => {
                gsap.set(editProfileWrapperRef.current, { display: 'flex' });
              },
              onComplete: () => {
                gsap.set(settingsWrapperRef.current, { display: 'none' });
                setCurrentView('EDIT_PROFILE');
              }
            });
            
            tl.to(settingsWrapperRef.current, {
              opacity: 0,
              scale: 0.95,
              y: -15,
              duration: 0.3,
              ease: 'power2.inOut'
            });
            
            tl.fromTo(editProfileWrapperRef.current,
              { opacity: 0, scale: 0.95, y: 15 },
              { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' },
              '-=0.15'
            );
          } else {
            setCurrentView('EDIT_PROFILE');
          }
        }
      }
    } else {
      if (currentView !== 'SETTINGS') {
        if (Platform.OS === 'web') {
          const tl = gsap.timeline({
            onStart: () => {
              gsap.set(settingsWrapperRef.current, { display: 'flex' });
            },
            onComplete: () => {
              gsap.set(editProfileWrapperRef.current, { display: 'none' });
              setCurrentView('SETTINGS');
            }
          });
          
          tl.to(editProfileWrapperRef.current, {
            opacity: 0,
            scale: 0.95,
            y: 15,
            duration: 0.3,
            ease: 'power2.inOut'
          });
          
          tl.fromTo(settingsWrapperRef.current,
            { opacity: 0, scale: 0.95, y: -15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            '-=0.15'
          );
        } else {
          setCurrentView('SETTINGS');
        }
      }
    }
    isInitialMount.current = false;
  }, [initialView]);

  const getSportIcon = (sportId: string, color: string) => {
    const s = sportId.toLowerCase();
    if (s.includes('tennis')) return <Target color={color} size={14} />;
    if (s.includes('basketball')) return <Activity color={color} size={14} />;
    if (s.includes('football')) return <Trophy color={color} size={14} />;
    if (s.includes('volleyball')) return <Sparkles color={color} size={14} />;
    if (s.includes('badminton') || s.includes('pickleball')) return <Award color={color} size={14} />;
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

  const handleAvatarChange = () => {
    const nextIdx = avatarUrl === avatarsList[0] ? 1 : 0;
    setAvatarUrl(avatarsList[nextIdx]);
    Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
  };

  const goToEditProfile = () => {
    router.setParams({ view: 'edit-profile' });
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
      await updateProfile({
        name: fullName.trim(),
        preferences: {
          ...user?.preferences,
          username: username.trim(),
          bio: bio.trim(),
          sports: selectedSports,
          avatarUrl: avatarUrl,
          socialLinks: {
            instagram: instagramUrl.trim(),
            twitter: twitterUrl.trim()
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
    <View className="flex-grow bg-[#F8FAFC]">
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
                <Image source={{ uri: avatarUrl }} className="w-full h-full object-cover" />
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
              <Text className="text-xl font-semibold text-slate-900 mb-4">Mạng xã hội</Text>
              
              {/* Instagram */}
              <View className="flex-row items-center border-b-2 border-slate-200 focus-within:border-blue-600 mb-4 bg-slate-50 rounded-t px-3">
                <Link2 color="#64748b" size={18} />
                <TextInput
                  value={instagramUrl}
                  onChangeText={setInstagramUrl}
                  style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                  className="flex-1 p-3 text-slate-900"
                  placeholder="Instagram URL"
                />
              </View>

              {/* Twitter/X */}
              <View className="flex-row items-center border-b-2 border-slate-200 focus-within:border-blue-600 bg-slate-50 rounded-t px-3">
                <Link2 color="#64748b" size={18} />
                <TextInput
                  value={twitterUrl}
                  onChangeText={setTwitterUrl}
                  style={Platform.OS === 'web' ? { outline: 'none' } as any : undefined}
                  className="flex-1 p-3 text-slate-900"
                  placeholder="Twitter/X URL"
                />
              </View>
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

        </View>
      </ScrollView>
    </View>
  );
}
