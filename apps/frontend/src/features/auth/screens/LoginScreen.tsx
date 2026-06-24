import React, { useState } from 'react';
import { YStack, H2, Paragraph, Label, Spinner } from 'tamagui';
import { useLogin } from '../hooks/useLogin';
import { Button, Input } from '../../../components';

export const LoginScreen: React.FC = () => {
  const { requestOtp, verifyOtp, isLoading } = useLogin();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    setError(null);
    try {
      await requestOtp(email.trim().toLowerCase());
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Không thể yêu cầu mã OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (code.trim().length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }
    setError(null);
    try {
      await verifyOtp(email.trim().toLowerCase(), code.trim());
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  return (
    <YStack f={1} ai="center" jc="center" bg="$background" p="$6" gap="$4">
      <YStack w="100%" maxW={320} gap="$5">
        <YStack ai="center" gap="$2" mb="$2">
          <H2 col="$color" fontWeight="800">CourtMate</H2>
          <Paragraph col="$colorMuted" ta="center">
            {step === 'email' 
              ? 'Nhập email để nhận mã OTP đăng nhập' 
              : `Chúng tôi đã gửi mã OTP 6 chữ số tới email ${email}`}
          </Paragraph>
        </YStack>

        {error && (
          <YStack bg="$red3" p="$3" br="$4" borderWidth={1} borderColor="$red7">
            <Paragraph col="$red10" fow="600" fos="$3" ta="center">{error}</Paragraph>
          </YStack>
        )}

        {step === 'email' ? (
          <YStack gap="$3">
            <YStack gap="$1">
              <Label col="$color" fow="600">Email</Label>
              <Input
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={isLoading}
              />
            </YStack>
            <Button
              mt="$3"
              onPress={handleRequestOtp}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="small" color="$color" /> : 'Gửi mã OTP'}
            </Button>
          </YStack>
        ) : (
          <YStack gap="$3">
            <YStack gap="$1">
              <Label col="$color" fow="600">Mã xác thực OTP</Label>
              <Input
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                disabled={isLoading}
                ta="center"
                fontSize={20}
              />
            </YStack>
            <Button
              mt="$3"
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="small" color="$color" /> : 'Xác nhận đăng nhập'}
            </Button>
            <Button
              theme="alt2"
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              disabled={isLoading}
            >
              Quay lại nhập email
            </Button>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};

export default LoginScreen;
