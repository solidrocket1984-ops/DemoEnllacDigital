const STORAGE_KEYS = {
  sector: "demo:selected_sector",
  accountSlug: "demo:selected_account_slug",
};

function safeStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getStoredSector() {
  return safeStorage()?.getItem(STORAGE_KEYS.sector) || null;
}

export function setStoredSector(sector) {
  if (!sector) return;
  safeStorage()?.setItem(STORAGE_KEYS.sector, sector);
}

export function getStoredAccountSlug() {
  return safeStorage()?.getItem(STORAGE_KEYS.accountSlug) || null;
}

export function setStoredAccountSlug(accountSlug) {
  if (!accountSlug) return;
  safeStorage()?.setItem(STORAGE_KEYS.accountSlug, accountSlug);
}

export function clearStoredAccountSlug() {
  safeStorage()?.removeItem(STORAGE_KEYS.accountSlug);
}
