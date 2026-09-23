import { apiClient } from './api-client';

export type PaymentProvider = 'PAYOS' | 'MOMO' | 'VNPAY';

export interface PaymentResponse {
  orderId: string;
  registrationId: string;
  provider: PaymentProvider;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  payUrl?: string;
  qrCodeUrl?: string;
}

export const paymentsApi = {
  async create(registrationId: string, provider: PaymentProvider): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>('/payments', { registrationId, provider });
  },

  async status(orderId: string): Promise<PaymentResponse> {
    return apiClient.get<PaymentResponse>(`/payments/${encodeURIComponent(orderId)}`);
  },
};
