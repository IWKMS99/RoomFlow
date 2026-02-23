const pad = (value: number) => String(value).padStart(2, '0');

export const formatLocalDateTime = (date: Date, timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hh = pad(hours);
  const mm = pad(minutes);

  return `${year}-${month}-${day}T${hh}:${mm}:00`;
};
