export const normalizeDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (date: Date, locale = 'ru-RU'): string =>
  date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return normalizeDate(new Date());
  }
  return normalizeDate(new Date(year, month - 1, day));
};
