import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { BasicInfoStep } from '../components/BasicInfoStep';
import { CategoriesStep } from '../components/CategoriesStep';
import { RulesStep } from '../components/RulesStep';
import { createTournament } from '../services/tournaments.api';
import { Typography } from '../../../components/ui/Typography';
import { uploadFile } from '../../../services/uploads.api';

export const CreateTournamentScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    sport: '',
    time: '',
    location: '',
    city: '',
    registrationFee: '',
    slotsLimit: '',
    categories: [],
    rulesText: '',
    rulesFile: null,
    bannerFile: null,
  });

  const updateData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const [bannerUpload, rulesUpload] = await Promise.all([
        formData.bannerFile ? uploadFile('tournament-banner', formData.bannerFile) : Promise.resolve(null),
        formData.rulesFile ? uploadFile('rules', formData.rulesFile) : Promise.resolve(null),
      ]);
      await createTournament({ ...formData, coverImage: bannerUpload?.url, rulesFileUrl: rulesUpload?.url }, undefined);
      Alert.alert(
        '🎉 Tạo giải đấu thành công!',
        'Giải đấu của bạn đã được tạo và đang chờ duyệt.',
        [{ text: 'Về trang quản lý', onPress: () => router.replace('/organizer' as any) }],
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Không thể tạo giải đấu', 'Có lỗi xảy ra, vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View className="flex-1 p-lg bg-surface space-y-md">
        <View className="mb-md">
          <Typography variant="headline-lg-mobile" color="navy" className="mb-xs">Tạo Giải Đấu Mới</Typography>
          <Typography variant="body-md" color="navy" className="opacity-70">Bước {currentStep} / 3</Typography>
        </View>

        <View className="flex-row items-center space-x-sm mb-lg">
          {[1, 2, 3].map((step) => (
            <View key={step} className="flex-1 h-1 rounded-full overflow-hidden bg-gray-border">
              <View 
                className={`h-full ${step <= currentStep ? 'bg-blue-vibrant' : 'bg-transparent'}`} 
              />
            </View>
          ))}
        </View>

        {currentStep === 1 && (
          <BasicInfoStep data={formData} updateData={updateData} onNext={handleNext} />
        )}

        {currentStep === 2 && (
          <CategoriesStep data={formData} updateData={updateData} onNext={handleNext} onBack={handleBack} />
        )}

        {currentStep === 3 && (
          <RulesStep 
            data={formData} 
            updateData={updateData} 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            isLoading={isLoading} 
          />
        )}
      </View>
    </ScrollView>
  );
};
