import React from 'react';
import { YStack, Label, XStack, Text } from 'tamagui';
import { Button, Input } from '../../../components';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

interface RulesStepProps {
  data: any;
  updateData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const RulesStep: React.FC<RulesStepProps> = ({ data, updateData, onSubmit, onBack, isLoading }) => {
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) return Alert.alert('File quá lớn', 'Điều lệ PDF tối đa 10MB.');
    updateData({ rulesFile: { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/pdf', file: asset.file } });
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
        <Label>Hoặc tải lên điều lệ PDF (tối đa 10MB)</Label>
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
