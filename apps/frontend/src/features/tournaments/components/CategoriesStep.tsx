import React, { useState } from 'react';
import { YStack, Label, XStack, Text } from 'tamagui';
import { Button, Input } from '../../../components';

interface CategoriesStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const CategoriesStep: React.FC<CategoriesStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [categories, setCategories] = useState<any[]>(data.categories || []);
  const [newCatName, setNewCatName] = useState('');
  const [newCatFee, setNewCatFee] = useState('');

  const handleAddCategory = () => {
    if (newCatName && newCatFee) {
      const updatedCategories = [
        ...categories, 
        { name: newCatName, fee: parseInt(newCatFee, 10), maxParticipants: null }
      ];
      setCategories(updatedCategories);
      updateData({ categories: updatedCategories });
      setNewCatName('');
      setNewCatFee('');
    }
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    updateData({ categories: updatedCategories });
  };

  const isFormValid = categories.length > 0;

  return (
    <YStack gap="$4" flex={1}>
      <Text fontSize="$6" fontWeight="bold">Hạng mục thi đấu & Lệ phí</Text>
      
      <YStack gap="$2" paddingBottom="$4" borderBottomWidth={1} borderColor="$gray5">
        <YStack>
          <Label>Tên hạng mục</Label>
          <Input 
            value={newCatName} 
            onChangeText={setNewCatName} 
            placeholder="Ví dụ: Đơn Nam, Đôi Nam Nữ" 
          />
        </YStack>

        <YStack>
          <Label>Lệ phí tham gia (VNĐ)</Label>
          <Input 
            value={newCatFee} 
            onChangeText={setNewCatFee} 
            placeholder="Ví dụ: 150000" 
            keyboardType="numeric"
          />
        </YStack>

        <Button mt="$2" onPress={handleAddCategory} disabled={!newCatName || !newCatFee}>
          Thêm hạng mục
        </Button>
      </YStack>

      <YStack gap="$3" mt="$2" flex={1}>
        <Text fontWeight="bold">Danh sách hạng mục đã thêm:</Text>
        {categories.length === 0 ? (
          <Text color="$gray10">Chưa có hạng mục nào.</Text>
        ) : (
          categories.map((cat, index) => (
            <XStack key={index} justifyContent="space-between" alignItems="center" bg="$gray2" p="$3" borderRadius="$2">
              <YStack>
                <Text fontWeight="bold">{cat.name}</Text>
                <Text color="$blue10">{cat.fee.toLocaleString()} VNĐ</Text>
              </YStack>
              <Button size="$2" theme="active" bg="$red10" onPress={() => handleRemoveCategory(index)}>
                Xóa
              </Button>
            </XStack>
          ))
        )}
      </YStack>

      <XStack gap="$3" mt="$4">
        <Button flex={1} onPress={onBack}>
          Quay lại
        </Button>
        <Button flex={1} theme="active" disabled={!isFormValid} onPress={onNext}>
          Tiếp tục
        </Button>
      </XStack>
    </YStack>
  );
};
