import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Registration, CreateRegistrationDto, RegistrationStatus } from '@courtmate/shared';
import { registrationsApi } from '../services/registrations.api';

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async (playerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registrationsApi.getMyRegistrations(playerId);
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách đăng ký');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitRegistration = useCallback(async (dto: CreateRegistrationDto, playerId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newReg = await registrationsApi.create(dto, playerId);
      setRegistrations((prev) => [newReg, ...prev]);
      return newReg;
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const simulatePayment = useCallback(async (id: string) => {
    try {
      const updatedReg = await registrationsApi.updateStatus(id, RegistrationStatus.PAID);
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id || (reg as any)._id === id ? updatedReg : reg))
      );
    } catch (err: any) {
      console.error('Simulate payment error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể giả lập thanh toán');
    }
  }, []);

  return {
    registrations,
    isLoading,
    isSubmitting,
    error,
    fetchRegistrations,
    submitRegistration,
    simulatePayment,
  };
}
