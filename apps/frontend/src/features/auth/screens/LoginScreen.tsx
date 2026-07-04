import React, { useState } from 'react';
import { YStack, XStack, H1, Paragraph, Label, Spinner, Text, View } from 'tamagui';
import { useLogin } from '../hooks/useLogin';
import { Input } from '../../../components';
import { Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { requestOtp, verifyOtp } = useLogin();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp(email.trim().toLowerCase());
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Không thể yêu cầu mã OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (code.trim().length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), code.trim());
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack f={1} bg="#0A0A0A" position="relative">
      {/* Background Glow Effects */}
      <View
        position="absolute"
        top={-100}
        left={-100}
        w={300}
        h={300}
        br={150}
        bg="#C4F82A"
        opacity={0.08}
      />
      <View
        position="absolute"
        bottom={100}
        right={-100}
        w={250}
        h={250}
        br={125}
        bg="#3B82F6"
        opacity={0.08}
      />

      {/* Main Content */}
      <YStack f={1} jc="flex-end" p="$6" pb="$8" gap="$6">
        
        {/* Header Section */}
        <YStack gap="$2" mb="$4">
          <Text color="#C4F82A" fow="800" fos={14} tt="uppercase" ls={2}>
            Tham gia ngay
          </Text>
          <H1 color="white" fontWeight="900" fos={42} lh={46}>
            CourtMate.
          </H1>
          <Paragraph color="rgba(255,255,255,0.6)" fos={16} mt="$2">
            Tìm đối thủ & Đặt sân thể thao nhanh nhất quanh bạn.
          </Paragraph>
        </YStack>

        {/* Glassmorphism Form Card */}
        <YStack
          bg="rgba(20, 20, 20, 0.85)"
          br="$8"
          p="$5"
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.08)"
          gap="$4"
        >
          {error && (
            <YStack bg="rgba(239, 68, 68, 0.1)" p="$3" br="$4" borderWidth={1} borderColor="rgba(239, 68, 68, 0.3)">
              <Paragraph color="#F87171" fow="600" fos="$3" ta="center">{error}</Paragraph>
            </YStack>
          )}

          {step === 'email' ? (
            <YStack gap="$4">
              <YStack gap="$2">
                <Label color="rgba(255,255,255,0.8)" fow="600" fos={14}>Email của bạn</Label>
                <XStack ai="center" bg="rgba(0,0,0,0.3)" br="$4" borderWidth={1} borderColor="rgba(255,255,255,0.1)" px="$3">
                  <Mail color="rgba(255,255,255,0.5)" size={20} />
                  <Input
                    f={1}
                    placeholder="email@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={isSubmitting}
                    borderWidth={0}
                    bg="transparent"
                    color="white"
                    focusStyle={{ borderWidth: 0 }}
                    h={50}
                  />
                </XStack>
              </YStack>

              <YStack
                bg={isSubmitting ? "rgba(196, 248, 42, 0.5)" : "#C4F82A"}
                br="$4"
                h={56}
                jc="center"
                ai="center"
                onPress={isSubmitting ? undefined : handleRequestOtp}
                pressStyle={{ scale: 0.98, opacity: 0.8 }}
                animation="quick"
              >
                {isSubmitting ? (
                  <Spinner size="small" color="#0A0A0A" />
                ) : (
                  <XStack ai="center" gap="$2">
                    <Text color="#0A0A0A" fow="800" fos={16} tt="uppercase">Nhận mã OTP</Text>
                    <ArrowRight color="#0A0A0A" size={20} />
                  </XStack>
                )}
              </YStack>
            </YStack>
          ) : (
            <YStack gap="$4">
              <YStack gap="$2">
                <Label color="rgba(255,255,255,0.8)" fow="600" fos={14}>Nhập mã OTP (6 số)</Label>
                <XStack ai="center" bg="rgba(0,0,0,0.3)" br="$4" borderWidth={1} borderColor="rgba(255,255,255,0.1)" px="$3">
                  <KeyRound color="rgba(255,255,255,0.5)" size={20} />
                  <Input
                    f={1}
                    placeholder="• • • • • •"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoCapitalize="none"
                    disabled={isSubmitting}
                    borderWidth={0}
                    bg="transparent"
                    color="white"
                    focusStyle={{ borderWidth: 0 }}
                    h={50}
                    ta="center"
                    fos={24}
                    ls={8}
                    fow="700"
                  />
                </XStack>
                <Text color="rgba(255,255,255,0.5)" fos={12} ta="center" mt="$1">
                  Mã OTP đã được gửi tới {email}
                </Text>
              </YStack>

              <YStack
                bg={isSubmitting ? "rgba(196, 248, 42, 0.5)" : "#C4F82A"}
                br="$4"
                h={56}
                jc="center"
                ai="center"
                onPress={isSubmitting ? undefined : handleVerifyOtp}
                pressStyle={{ scale: 0.98, opacity: 0.8 }}
                animation="quick"
              >
                {isSubmitting ? (
                  <Spinner size="small" color="#0A0A0A" />
                ) : (
                  <Text color="#0A0A0A" fow="800" fos={16} tt="uppercase">Xác nhận Đăng nhập</Text>
                )}
              </YStack>

              <YStack
                h={44}
                jc="center"
                ai="center"
                onPress={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                }}
                disabled={isSubmitting}
                pressStyle={{ opacity: 0.5 }}
              >
                <XStack ai="center" gap="$2">
                  <ArrowLeft color="rgba(255,255,255,0.6)" size={16} />
                  <Text color="rgba(255,255,255,0.6)" fow="600">Đổi email khác</Text>
                </XStack>
              </YStack>
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
};

export default LoginScreen;
