import React from 'react';
import { YStack, Label, XStack, Text } from 'tamagui';
import { Button, Input } from '../../../components';

interface RulesStepProps {
  data: any;
  updateData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const RulesStep: React.FC<RulesStepProps> = ({ data, updateData, onSubmit, onBack, isLoading }) => {
  // Hàm giả lập chọn file (mock)
  const handlePickFile = () => {
    updateData({ 
      rulesFile: { 
        uri: 'file://mock-path/rules.pdf', 
        name: 'rules.pdf', 
        type: 'application/pdf' 
      } 
    });
    alert('Đã chọn file: rules.pdf (Mock)');
  };

  const hasRules = !!data.rulesText || !!data.rulesFile;

  return (
    <YStack gap="$4" flex={1}>
      <Text fontSize="$6" fontWeight="bold">Điều lệ giải đấu</Text>
      
      <YStack>
        <Label>Nhập điều lệ trực tiếp (Tùy chọn)</Label>
        <Input 
          value={data.rulesText} 
          onChangeText={(text: string) => updateData({ rulesText: text })} 
          placeholder="Nhập các quy định, thể thức thi đấu..." 
          multiline
          numberOfLines={6}
        />
      </YStack>

      <YStack gap="$2" mt="$2">
        <Label>Hoặc tải lên file điều lệ (PDF/Image)</Label>
        <Button onPress={handlePickFile} bg="$gray5">
          {data.rulesFile ? `Đã chọn: ${data.rulesFile.name}` : 'Chọn File...'}
        </Button>
      </YStack>

      <XStack gap="$3" mt="$4">
        <Button flex={1} onPress={onBack} disabled={isLoading}>
          Quay lại
        </Button>
        <Button flex={1} theme="active" disabled={!hasRules || isLoading} onPress={onSubmit}>
          {isLoading ? 'Đang tạo...' : 'Tạo Giải Đấu'}
        </Button>
      </XStack>
    </YStack>
  );
};

