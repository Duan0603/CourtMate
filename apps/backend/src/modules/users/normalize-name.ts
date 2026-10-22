/**
 * Search key for a person's name: lowercase, Vietnamese diacritics removed, spaces collapsed.
 * "Nguyễn Văn Đức" -> "nguyen van duc", so typing without accents still finds people.
 */
export function normalizeName(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
