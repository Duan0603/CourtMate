export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isExpired(date: Date): boolean {
  return new Date().getTime() > date.getTime();
}
