const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export type PaymentProvider = 'PAYOS' | 'MOMO';
export type PaymentResponse = { orderId: string; registrationId: string; provider: PaymentProvider; amount: number; status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'; payUrl?: string };

export const paymentsApi = {
  async create(registrationId: string, provider: PaymentProvider, token: string): Promise<PaymentResponse> {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ registrationId, provider }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || 'Không thể tạo giao dịch thanh toán');
    return body;
  },
  async status(orderId: string, token: string): Promise<PaymentResponse> {
    const response = await fetch(`${API_URL}/payments/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || 'Không thể kiểm tra thanh toán');
    return body;
  },
};
