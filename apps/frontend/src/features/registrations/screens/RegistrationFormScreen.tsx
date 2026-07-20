import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationForm } from '../components/RegistrationForm';
import { ChevronLeft, ClipboardList } from 'lucide-react-native';
import { Typography } from '../../../components/ui/Typography';

export const RegistrationFormScreen: React.FC = () => {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const { submitRegistration, isSubmitting, error } = useRegistrations();

  const handleFormSubmit = (formData: any) => {
    const params = new URLSearchParams({
      playerName: formData.playerName,
      contactPhone: formData.contactPhone,
      skillLevel: formData.skillLevel,
      paymentMethod: formData.paymentMethod,
    });
    if (formData.partnerName) {
      params.append('partnerName', formData.partnerName);
    }
    router.push(`/payment/${tournamentId}?${params.toString()}` as any);
  };

  return (
    <View className="flex-1 bg-background">
      
      {/* Header */}
      <View className="flex-row items-center p-md pt-2xl bg-surface border-b border-outline-variant/30 space-x-md">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full border border-outline-variant/30 items-center justify-center bg-surface-container-lowest"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#1d4ed8" size={24} />
        </TouchableOpacity>
        <Typography variant="headline-md" className="flex-1 text-primary font-bold">
          Đăng ký thi đấu
        </Typography>
      </View>

      <ScrollView className="flex-1 p-md" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="space-y-xl mt-md">
          <View className="items-center space-y-sm mb-sm">
            <View className="w-16 h-16 rounded-full bg-primary/10 justify-center items-center mb-xs">
              <ClipboardList color="#1d4ed8" size={28} />
            </View>
            <Typography variant="headline-lg" className="text-primary font-bold text-center">
              Hoàn thiện hồ sơ
            </Typography>
          </View>

          <View className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 }}>
            <RegistrationForm
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
              errorMessage={error}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegistrationFormScreen;
