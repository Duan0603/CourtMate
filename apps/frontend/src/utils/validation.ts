export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}
