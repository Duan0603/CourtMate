import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Spinner } from 'tamagui';
import { BasicInfoStep } from '../components/BasicInfoStep';
import { CategoriesStep } from '../components/CategoriesStep';
import { RulesStep } from '../components/RulesStep';
import { createTournament } from '../services/tournaments.api';

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
    categories: [],
    rulesText: '',
    rulesFile: null,
  });

  const updateData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await createTournament(formData, formData.rulesFile);
      alert('Tạo giải đấu thành công!');
      // TODO: Navigate back or to tournament details
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo giải đấu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <YStack flex={1} padding="$4" bg="$background" gap="$4">
        <YStack>
          <Text fontSize="$8" fontWeight="bold" color="$blue10">Tạo Giải Đấu Mới</Text>
          <Text color="$gray10">Bước {currentStep} / 3</Text>
        </YStack>

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
      </YStack>
    </ScrollView>
  );
};
