const KEY = "jabon_portal_pelanggan_id";

export const getPortalId = () =>
  typeof window === "undefined" ? null : localStorage.getItem(KEY);

export const setPortalId = (id: string) => localStorage.setItem(KEY, id);

export const clearPortalId = () => localStorage.removeItem(KEY);

const CACHE = "jabon_portal_cache";
export const readCache = <T,>(): T | null => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(CACHE) || "null"); } catch { return null; }
};
export const writeCache = (v: unknown) => {
  try { localStorage.setItem(CACHE, JSON.stringify(v)); } catch { /* quota */ }
};
