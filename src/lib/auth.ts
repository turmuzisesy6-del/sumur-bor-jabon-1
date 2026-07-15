const KEY = "sumur_bor_auth";
const PWD_KEY = "sumur_bor_pwd";
const DEFAULT_USER = "TURMUZI";
const DEFAULT_PWD = "JABON1";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function getPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PWD;
  return localStorage.getItem(PWD_KEY) || DEFAULT_PWD;
}

export function setPassword(pwd: string) {
  localStorage.setItem(PWD_KEY, pwd);
}

export function login(username: string, password: string): boolean {
  if (username.trim().toUpperCase() === DEFAULT_USER && password === getPassword()) {
    localStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
