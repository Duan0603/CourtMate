import React, { useState } from 'react';
import { YStack, XStack, H1, H2, Paragraph, Label, Spinner, Text, View } from 'tamagui';
import { useLogin } from '../hooks/useLogin';
import { Input } from '../../../components';
import { Check, Target, Activity, Star, Eye, EyeOff } from 'lucide-react-native';
import { Alert, KeyboardAvoidingView, Platform, Dimensions, useWindowDimensions, ImageBackground, ScrollView, LayoutAnimation, UIManager, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Premium Google Icon
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.76 14.93 1 12 1 7.37 1 3.4 3.66 1.45 7.56l3.88 3C6.27 7.7 8.91 5.04 12 5.04z" />
    <Path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.63z" />
    <Path fill="#FBBC05" d="M5.33 14.44A7.16 7.16 0 0 1 4.9 12c0-.87.15-1.7.43-2.44L1.45 6.56C.52 8.42 0 10.51 0 12c0 1.49.52 3.58 1.45 5.44l3.88-3z" />
    <Path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.09 0-5.73-2.66-6.67-5.52l-3.88 3C3.4 20.34 7.37 23 12 23z" />
  </Svg>
);

const theme = {
  background: '#f9fbe5',
  surfaceContainerLowest: '#ffffff',
  surface: '#f9fbe5',
  surfaceContainerHigh: '#e7ead4',
  primary: '#506600',
  onPrimary: '#ffffff',
  onSurface: '#1a1d10',
  onSurfaceVariant: '#444933',
  outlineVariant: '#c4c9ac',
  outline: '#747a60',
  secondary: '#565e74',
  onSecondary: '#ffffff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

const sports = [
  { id: 'caulong', name: 'Cầu lông', icon: Activity },
  { id: 'pickleball', name: 'Pickleball', icon: Target },
  { id: 'tennis', name: 'Tennis', icon: Star },
];

export const LoginScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { updateProfile, mockGoogleLogin } = useLogin();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, password?: string, agreed?: string, general?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggleMode = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
      setErrors({});
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Vui lòng nhập email' });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Thành công', `Mã OTP khôi phục (Mock) đã được gửi đến:\n${email}`, [
        { text: 'OK', onPress: () => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setMode('login');
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
          });
        }}
      ]);
    }, 1000);
  };

  const handleSubmit = async () => {
    let newErrors: any = {};
    let hasError = false;

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên của bạn';
      hasError = true;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = 'Vui lòng nhập email';
      hasError = true;
    }
    if (!password.trim() || password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
      hasError = true;
    }
    if (mode === 'signup' && !agreed) {
      newErrors.agreed = 'Bạn cần đồng ý với các Điều khoản';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    setTimeout(async () => {
      try {
        if (mode === 'signup') {
          await updateProfile({ name: name.trim() });
          Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
            { text: 'OK', onPress: handleToggleMode }
          ]);
        } else {
          Alert.alert('Thành công', 'Đăng nhập thành công!');
        }
      } catch (err: any) {
        setErrors({ general: err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

  const formContent = (
    <Animated.View style={{ width: '100%', maxWidth: mode === 'login' ? 440 : 480, opacity: fadeAnim }}>
      <YStack 
        w="100%"
        bg={mode === 'login' && isDesktop ? 'transparent' : theme.surfaceContainerLowest}
      br={16}
      borderWidth={mode === 'login' && isDesktop ? 0 : 1}
      borderColor="rgba(196, 201, 172, 0.3)"
      p={mode === 'login' && isDesktop ? "$0" : "$4"}
      style={mode === 'login' && isDesktop ? {} : { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
    >
      {/* Branding */}
      <YStack ai={mode === 'login' || mode === 'forgot_password' ? "flex-start" : "center"} mb="$4">
        <H1 color={mode === 'login' || mode === 'forgot_password' ? theme.onSurface : theme.primary} fontWeight="800" fos={mode === 'login' || mode === 'forgot_password' ? 32 : 36} lh={40} ls={-1}>
          {mode === 'login' ? 'Chào mừng trở lại' : mode === 'forgot_password' ? 'Quên mật khẩu' : 'CourtMate'}
        </H1>
        <Paragraph color={theme.onSurfaceVariant} fos={14} mt="$1.5" ta={mode === 'login' || mode === 'forgot_password' ? 'left' : 'center'}>
          {mode === 'login' ? 'Đăng nhập nhanh chóng bằng tài khoản Google của bạn.' : mode === 'forgot_password' ? 'Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.' : 'Bắt đầu hành trình chinh phục các trận đấu gay cấn cùng CourtMate ngay hôm nay.'}
        </Paragraph>
      </YStack>

      <YStack gap="$2.5">
        {/* Error Alert */}
        {errors.general && (
          <YStack bg={theme.errorContainer} p="$2" br={8} mb="$2">
            <Paragraph color={theme.error} fow="600" fos={12} ta="center">{errors.general}</Paragraph>
          </YStack>
        )}

        {/* --- INPUTS --- */}
        {mode === 'signup' && (
          <YStack gap="$1.5">
            <Label color={theme.onSurface} fow="600" fos={14} py={0} m={0}>
              Họ và tên <Text color={theme.error}>*</Text>
            </Label>
            <Input
              placeholder="Điền tên của bạn..." placeholderTextColor={theme.onSurfaceVariant}
              value={name} onChangeText={setName} disabled={isSubmitting}
              borderWidth={1} borderColor={errors.name ? theme.error : theme.outlineVariant}
              bg={theme.surfaceContainerLowest} color={theme.onSurface}
              focusStyle={{ borderColor: theme.primary, borderWidth: 1 }}
              h={56} br={12} px="$3" fos={15}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            {errors.name && <Text color={theme.error} fos={12} ml="$1">{errors.name}</Text>}
          </YStack>
        )}

        <YStack gap="$1.5">
          <Label color={mode === 'login' ? theme.onSurfaceVariant : theme.onSurface} fow="600" fos={14} py={0} m={0}>
            Email <Text color={theme.error}>*</Text>
          </Label>
          <Input
            ref={emailRef}
            placeholder="Điền email của bạn..." placeholderTextColor={theme.onSurfaceVariant}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" disabled={isSubmitting}
            borderWidth={1} borderColor={errors.email ? theme.error : theme.outlineVariant}
            bg={theme.surfaceContainerLowest} color={theme.onSurface}
            focusStyle={{ borderColor: theme.primary, borderWidth: 1 }}
            h={56} br={12} px="$3" fos={15}
            returnKeyType={mode === 'forgot_password' ? "done" : "next"}
            onSubmitEditing={() => {
              if (mode === 'forgot_password') {
                handleSendOTP();
              } else {
                passwordRef.current?.focus();
              }
            }}
            blurOnSubmit={mode === 'forgot_password'}
          />
          {errors.email && <Text color={theme.error} fos={12} ml="$1">{errors.email}</Text>}
        </YStack>

        {mode !== 'forgot_password' && (
          <YStack gap="$1.5">
            <XStack jc="space-between" ai="center">
              <Label color={mode === 'login' ? theme.onSurfaceVariant : theme.onSurface} fow="600" fos={14} py={0} m={0}>
                Mật khẩu <Text color={theme.error}>*</Text>
              </Label>
              {mode === 'login' && (
                <Text cursor="pointer" color={theme.primary} fos={14} fow="500" onPress={() => {
                  Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setMode('forgot_password');
                    setErrors({});
                    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
                  });
                }}>Quên mật khẩu?</Text>
              )}
            </XStack>
            <View position="relative" w="100%">
              <Input
                ref={passwordRef}
                placeholder="Điền mật khẩu của bạn..." placeholderTextColor={theme.onSurfaceVariant}
                value={password} onChangeText={setPassword} secureTextEntry={!showPassword} disabled={isSubmitting}
                borderWidth={1} borderColor={errors.password ? theme.error : theme.outlineVariant}
                bg={theme.surfaceContainerLowest} color={theme.onSurface}
                focusStyle={{ borderColor: theme.primary, borderWidth: 1 }}
                h={56} br={12} px="$3" pr="$10" fos={15}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <View position="absolute" right={12} top={16} cursor="pointer" onPress={() => setShowPassword(!showPassword)} style={{ opacity: password.length > 0 ? 1 : 0.4 }}>
                {showPassword ? <EyeOff color={theme.onSurfaceVariant} size={24} /> : <Eye color={theme.onSurfaceVariant} size={24} />}
              </View>
            </View>
            {errors.password && <Text color={theme.error} fos={12} ml="$1">{errors.password}</Text>}
          </YStack>
        )}

        {/* --- SIGNUP BOTTOM: Terms --- */}
        {mode === 'signup' && (
          <YStack gap="$1">
            <XStack ai="flex-start" gap="$2" mt="$2">
              <View cursor="pointer" w={16} h={16} br={4} mt={2} borderWidth={1} borderColor={errors.agreed ? theme.error : (agreed ? theme.primary : theme.outlineVariant)} bg={agreed ? theme.primary : theme.surface} ai="center" jc="center" onPress={() => setAgreed(!agreed)}>
                {agreed && <Check color="#fff" size={12} strokeWidth={3} />}
              </View>
              <Paragraph color={theme.onSurfaceVariant} fos={12} flex={1}>
                Tôi đồng ý với các <Text cursor="pointer" color={theme.primary} fow="600">Điều khoản dịch vụ</Text> và <Text cursor="pointer" color={theme.primary} fow="600">Chính sách bảo mật</Text>.
              </Paragraph>
            </XStack>
            {errors.agreed && <Text color={theme.error} fos={12} ml="$6">{errors.agreed}</Text>}
          </YStack>
        )}

        {/* --- MAIN SUBMIT BUTTON --- */}
        <View
          focusable={true} cursor="pointer"
          bg={theme.primary} h={56} br={12} jc="center" ai="center" mt={mode === 'login' ? "$2" : "$4"}
          onPress={isSubmitting ? undefined : (mode === 'forgot_password' ? handleSendOTP : handleSubmit)} pressStyle={{ opacity: 0.9 }}
        >
          {isSubmitting ? (
            <Spinner size="small" color={theme.onPrimary} />
          ) : (
            <Text color={theme.onPrimary} fow="700" fos={16}>{mode === 'login' ? 'Đăng nhập' : mode === 'forgot_password' ? 'Gửi OTP' : 'Đăng ký tài khoản'}</Text>
          )}
        </View>

        {mode !== 'forgot_password' && (
          <>
            {/* --- BOTTOM: Divider & Google Button --- */}
            <XStack ai="center" gap="$3" my="$2">
              <View f={1} h={1} bg={theme.outlineVariant} opacity={0.3} />
              <Text color={theme.onSurfaceVariant} fos={11} fow="500" tt="uppercase" ls={0.5}>Hoặc</Text>
              <View f={1} h={1} bg={theme.outlineVariant} opacity={0.3} />
            </XStack>
            <View
              focusable={true} cursor="pointer"
              h={56} br={12} borderWidth={1} borderColor={theme.outlineVariant}
              bg={theme.surfaceContainerLowest} jc="center" ai="center"
              onPress={() => {
                setIsSubmitting(true);
                setTimeout(async () => {
                  await mockGoogleLogin();
                  setIsSubmitting(false);
                }, 1000);
              }}
              pressStyle={{ bg: theme.surfaceContainerHigh }}
            >
              <XStack ai="center" gap="$2">
                <GoogleIcon />
                <Text color={theme.onSurface} fow="600" fos={14}>Tiếp tục với Google</Text>
              </XStack>
            </View>
          </>
        )}

        {/* --- BOTTOM LINK --- */}
        <YStack ai="center" mt="$4" mb="$1" gap="$2">
          {mode === 'forgot_password' ? (
            <Paragraph color={theme.onSurfaceVariant} cursor='pointer' fos={14}>
              Nhớ mật khẩu?{' '}
              <Text cursor="pointer" color={theme.primary} fow="700" onPress={() => {
                Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setMode('login');
                  setErrors({});
                  Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
                });
              }} style={{ textDecorationLine: 'none' }}>
                Quay lại đăng nhập
              </Text>
            </Paragraph>
          ) : (
            <Paragraph color={theme.onSurfaceVariant} cursor='pointer' fos={14}>
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <Text cursor="pointer" color={theme.primary} fow="700" onPress={handleToggleMode} style={{ textDecorationLine: 'none' }}>
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </Text>
            </Paragraph>
          )}

          {onBack && (
            <Paragraph color={theme.onSurfaceVariant} cursor="pointer" fos={14} mt="$2">
              <Text cursor="pointer" color={theme.secondary} fow="600" onPress={onBack}>
                ← Quay lại trang bắt đầu
              </Text>
            </Paragraph>
          )}
        </YStack>

      </YStack>
    </YStack>
    </Animated.View>
  );

  if (isDesktop) {
    return (
      <View flex={1} flexDirection="row" bg={theme.surfaceContainerLowest}>
        <View flex={1} bg={theme.surfaceContainerHigh}>
          <ImageBackground
            source={require('../../../../assets/images/registration_header.png')}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            resizeMode="cover"
          >
            <View position="absolute" inset={0} bg="rgba(0,0,0,0.5)" />
            <View 
              bg="rgba(255,255,255,0.1)" borderWidth={1} borderColor="rgba(255,255,255,0.2)" br={16} 
              p={32} w="100%" maxWidth={450} style={{ backdropFilter: 'blur(10px)' }}
            >
              <H2 color={theme.onPrimary} fow="800" fos={40} lh={48} ls={-0.5} mb="$3">Vượt mọi giới hạn</H2>
              <Paragraph color="rgba(255,255,255,0.9)" fos={18} lh={28}>
                Tham gia mạng lưới hơn 10,000 vận động viên. Đặt sân, tìm kiếm đối thủ và nâng cao trình độ của bạn ngay hôm nay.
              </Paragraph>
            </View>
          </ImageBackground>
        </View>

        <View flex={1} jc="center" ai="center" bg={theme.surfaceContainerLowest}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, width: '100%' }} showsVerticalScrollIndicator={false}>
            {formContent}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground
        source={require('../../../../assets/images/registration_header.png')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View position="absolute" inset={0} bg="rgba(0,0,0,0.5)" />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }} showsVerticalScrollIndicator={false} bounces={false}>
          {formContent}
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
