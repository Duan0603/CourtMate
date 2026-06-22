import React, { useState } from 'react';
import { YStack, Label } from 'tamagui';
import { Button, Input } from '../../../components';

interface LoginFormProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (email.trim().length > 0) {
      onSubmit(email);
    }
  };

  return (
    <YStack gap="$3" w="100%" maxW={300}>
      <YStack>
        <Label col="$color">Email</Label>
        <Input 
          placeholder="Nhập email của bạn" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </YStack>
      <Button 
        mt="$4"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </YStack>
  );
};
