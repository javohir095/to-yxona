const LOGIN_DOMAIN = "toyxona.local";

export const LOGIN_PATTERN = /^[a-zA-Z0-9_.]+$/;

export function loginToEmail(login: string): string {
  return `${login.trim().toLowerCase()}@${LOGIN_DOMAIN}`;
}

export function emailToLogin(email: string | null): string {
  if (!email) return "—";
  return email.endsWith(`@${LOGIN_DOMAIN}`) ? email.slice(0, -(`@${LOGIN_DOMAIN}`.length)) : email;
}
