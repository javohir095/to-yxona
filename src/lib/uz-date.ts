export const UZ_MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export const UZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

export const UZ_WEEKDAYS = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];

export function formatUzDate(dateStr: string, opts?: { withYear?: boolean }) {
  const date = new Date(`${dateStr}T00:00:00`);
  const withYear = opts?.withYear ?? true;
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]}${withYear ? ` ${date.getFullYear()}` : ""}`;
}

export function formatUzDateShort(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getDate()} ${UZ_MONTHS_SHORT[date.getMonth()]}`;
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}
