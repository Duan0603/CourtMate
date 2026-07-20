import React from 'react';
import { YStack, Label, XStack, Text } from 'tamagui';
import { Button, Input } from '../../../components';
import { SportType } from '@courtmate/shared';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image } from 'react-native';

interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const isFormValid = data.title && data.description && data.sport && data.location && data.city && data.time && data.registrationFee;

  return (
    <YStack gap="$4" flex={1}>
      <Text fontSize="$6" fontWeight="bold">Thông tin cơ bản</Text>

      <YStack gap="$2">
        <Label>Banner giải đấu (JPG, PNG hoặc WebP; tối đa 8MB)</Label>
        {data.bannerFile?.uri && <Image source={{ uri: data.bannerFile.uri }} style={{ width: '100%', height: 160, borderRadius: 14 }} resizeMode="cover" />}
        <Button onPress={async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) return Alert.alert('Cần quyền truy cập ảnh', 'Hãy cho phép CourtMate chọn banner từ thư viện.');
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: true, aspect: [16, 9] });
          if (result.canceled) return;
          const asset = result.assets[0];
          if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024) return Alert.alert('Ảnh quá lớn', 'Banner tối đa 8MB.');
          updateData({ bannerFile: { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType, file: (asset as any).file } });
        }}>{data.bannerFile ? 'Đổi banner' : 'Chọn banner'}</Button>
      </YStack>
      
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

      <XStack gap="$3">
        <YStack flex={1}>
          <Label>Lệ phí tổng (VNĐ) *</Label>
          <Input 
            value={data.registrationFee || ''} 
            onChangeText={(text: string) => updateData({ registrationFee: text })} 
            placeholder="Ví dụ: 200000" 
            keyboardType="numeric"
          />
        </YStack>
        <YStack flex={1}>
          <Label>Giới hạn suất đăng ký</Label>
          <Input 
            value={data.slotsLimit || ''} 
            onChangeText={(text: string) => updateData({ slotsLimit: text })} 
            placeholder="Ví dụ: 32" 
            keyboardType="numeric"
          />
        </YStack>
      </XStack>

      <Button mt="$4" theme="active" disabled={!isFormValid} onPress={onNext}>
        Tiếp tục
      </Button>
    </YStack>
  );
};
