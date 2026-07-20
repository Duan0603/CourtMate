import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BasicInfoStep } from '../components/BasicInfoStep';
import { CategoriesStep } from '../components/CategoriesStep';
import { RulesStep } from '../components/RulesStep';
import { createTournament } from '../services/tournaments.api';
import { Typography } from '../../../components/ui/Typography';

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

