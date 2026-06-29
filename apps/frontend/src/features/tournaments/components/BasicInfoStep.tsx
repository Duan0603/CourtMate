import React from 'react';
import { YStack, Label, XStack, Text } from 'tamagui';
import { Button, Input } from '../../../components';
import { SportType } from '@courtmate/shared';

interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const isFormValid = data.title && data.description && data.sport && data.location && data.city && data.time;

  return (
    <YStack gap="$4" flex={1}>
      <Text fontSize="$6" fontWeight="bold">Thông tin cơ bản</Text>
      
      <YStack>
        <Label>Tên giải đấu</Label>
        <Input 
          value={data.title} 
          onChangeText={(text: string) => updateData({ title: text })} 
          placeholder="Nhập tên giải đấu" 
        />
      </YStack>

      <YStack>
        <Label>Mô tả ngắn</Label>
        <Input 
          value={data.description} 
          onChangeText={(text: string) => updateData({ description: text })} 
          placeholder="Nhập mô tả" 
          multiline
          numberOfLines={3}
        />
      </YStack>

      <YStack>
        <Label>Môn Thể Thao</Label>
        <XStack gap="$2" flexWrap="wrap">
          {Object.values(SportType).map((sport) => (
            <Button 
              key={sport} 
              size="$3"
              theme={data.sport === sport ? 'active' : undefined}
              onPress={() => updateData({ sport })}
              bg={data.sport === sport ? '$blue10' : '$gray5'}
            >
              {sport}
            </Button>
          ))}
        </XStack>
      </YStack>

      <YStack>
        <Label>Thời gian tổ chức</Label>
        <Input 
          value={data.time} 
          onChangeText={(text: string) => updateData({ time: text })} 
          placeholder="Ví dụ: 15/10/2026 - 17/10/2026" 
        />
      </YStack>

      <YStack>
        <Label>Khu vực (Thành phố)</Label>
        <Input 
          value={data.city} 
          onChangeText={(text: string) => updateData({ city: text })} 
          placeholder="Ví dụ: Đà Nẵng" 
        />
      </YStack>

      <YStack>
        <Label>Địa điểm thi đấu cụ thể</Label>
        <Input 
          value={data.location} 
          onChangeText={(text: string) => updateData({ location: text })} 
          placeholder="Tên sân, địa chỉ cụ thể" 
        />
      </YStack>

      <Button mt="$4" theme="active" disabled={!isFormValid} onPress={onNext}>
        Tiếp tục
      </Button>
    </YStack>
  );
};

