import React, { useEffect, useState, useCallback } from 'react';
import { View, YStack, Text, ScrollView, Spinner, XStack, Button } from 'tamagui';
import { RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tournament, Registration, RegistrationStatus } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { registrationsApi } from '../services/registrations.api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OrganizerDashboardScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournaments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken') || '';
      const result = await tournamentsApi.getMyOrganizedTournaments(token);
      setTournaments(result.data);
      if (result.data.length > 0 && !selectedTournamentId) {
        setSelectedTournamentId(result.data[0].id || (result.data[0] as any)._id);
      }
    } catch (error) {
      console.error('Error fetching organized tournaments:', error);
    } finally {
      setLoadingTournaments(false);
      setRefreshing(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const fetchRegistrations = useCallback(async (tournamentId: string) => {
    setLoadingRegistrations(true);
    try {
      const result = await registrationsApi.getRegistrationsByTournament(tournamentId);
      setRegistrations(result);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchRegistrations(selectedTournamentId);
    }
  }, [selectedTournamentId, fetchRegistrations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
    if (selectedTournamentId) {
      fetchRegistrations(selectedTournamentId);
    }
  };

  const handleUpdateStatus = async (regId: string, status: RegistrationStatus) => {
    try {
      await registrationsApi.updateStatus(regId, status);
      // Update local state
      setRegistrations(prev => prev.map(r => r.id === regId || (r as any)._id === regId ? { ...r, status } : r));
      Alert.alert('Thành công', `Đã cập nhật trạng thái thành ${status}`);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <YStack padding="$4" paddingBottom="$0">
        <Text fontSize="$8" fontWeight="bold" color="$blue10">
          Quản lý giải đấu
        </Text>
        <Text fontSize="$3" color="$gray10" marginTop="$1">
          Dành cho Ban tổ chức
        </Text>
      </YStack>

      {loadingTournaments ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </View>
      ) : tournaments.length === 0 ? (
        <YStack padding="$4" alignItems="center" marginTop="$10">
          <Text fontSize="$5" color="$gray10" textAlign="center">
            Bạn chưa tổ chức giải đấu nào.
          </Text>
        </YStack>
      ) : (
        <YStack flex={1}>
          {/* Horizontal list of tournaments */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} padding="$4" maxHeight={80}>
            <XStack space="$3">
              {tournaments.map((t) => {
                const tId = t.id || (t as any)._id;
                const isSelected = selectedTournamentId === tId;
                return (
                  <Button
                    key={tId}
                    size="$3"
                    backgroundColor={isSelected ? '$blue10' : '$gray5'}
                    color={isSelected ? 'white' : 'black'}
                    onPress={() => setSelectedTournamentId(tId)}
                  >
                    {t.title}
                  </Button>
                );
              })}
            </XStack>
          </ScrollView>

          {/* Registrations List */}
          <YStack flex={1} backgroundColor="white" borderTopLeftRadius="$4" borderTopRightRadius="$4" padding="$4">
            <Text fontSize="$5" fontWeight="bold" marginBottom="$4">
              Danh sách đăng ký
            </Text>

            {loadingRegistrations ? (
              <View flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" color="$blue10" />
              </View>
            ) : (
              <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                {registrations.length === 0 ? (
                  <Text textAlign="center" color="$gray10" marginTop="$4">
                    Chưa có đăng ký nào.
                  </Text>
                ) : (
                  <YStack space="$3">
                    {registrations.map(reg => {
                      const regId = reg.id || (reg as any)._id;
                      return (
                        <View key={regId} borderWidth={1} borderColor="$gray5" borderRadius="$3" padding="$3">
                          <XStack justifyContent="space-between">
                            <YStack flex={1}>
                              <Text fontWeight="bold">{reg.playerName}</Text>
                              <Text color="$gray10" fontSize="$2">SĐT: {reg.contactPhone}</Text>
                              <Text color="$blue10" fontSize="$3" marginTop="$1">Trình độ: {reg.skillLevel}</Text>
                            </YStack>
                            <YStack alignItems="flex-end" justifyContent="center">
                              <Text 
                                color={
                                  reg.status === RegistrationStatus.APPROVED ? '$green10' :
                                  reg.status === RegistrationStatus.REJECTED ? '$red10' :
                                  '$orange10'
                                }
                                fontWeight="bold"
                                marginBottom="$2"
                              >
                                {reg.status.toUpperCase()}
                              </Text>
                              {reg.status === RegistrationStatus.PENDING && (
                                <XStack space="$2">
                                  <Button size="$2" backgroundColor="$green8" color="white" onPress={() => handleUpdateStatus(regId, RegistrationStatus.APPROVED)}>
                                    Duyệt
                                  </Button>
                                  <Button size="$2" backgroundColor="$red8" color="white" onPress={() => handleUpdateStatus(regId, RegistrationStatus.REJECTED)}>
                                    Từ chối
                                  </Button>
                                </XStack>
                              )}
                            </YStack>
                          </XStack>
                        </View>
                      );
                    })}
                  </YStack>
                )}
                <View height={40} />
              </ScrollView>
            )}
          </YStack>
        </YStack>
      )}
    </SafeAreaView>
  );
};
