const STORAGE_KEYS = {
  sector: "demo:selected_sector",
  accountSlug: "demo:selected_account_slug",
};

function safeStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function safeNormalize(value) {
  return String(value || "").trim();
}

export function getStoredSector() {
  return safeStorage()?.getItem(STORAGE_KEYS.sector) || null;
}

export function setStoredSector(sector) {
  const normalized = safeNormalize(sector).toLowerCase();
  if (!normalized) return;
  safeStorage()?.setItem(STORAGE_KEYS.sector, normalized);
}

export function getStoredAccountSlug() {
  return safeStorage()?.getItem(STORAGE_KEYS.accountSlug) || null;
}

export function setStoredAccountSlug(accountSlug) {
  const normalized = safeNormalize(accountSlug).toLowerCase();
  if (!normalized) return;
  safeStorage()?.setItem(STORAGE_KEYS.accountSlug, normalized);
}

export function clearStoredAccountSlug() {
  safeStorage()?.removeItem(STORAGE_KEYS.accountSlug);
}

export function resolveDemoUrlState({ routeSector, querySector, queryAccount, selectedSector, selectedAccountSlug }) {
  return {
    routeSector: safeNormalize(routeSector).toLowerCase() || null,
    querySector: safeNormalize(querySector).toLowerCase() || null,
    queryAccount: safeNormalize(queryAccount).toLowerCase() || null,
    selectedSector: safeNormalize(selectedSector).toLowerCase() || null,
    selectedAccountSlug: safeNormalize(selectedAccountSlug).toLowerCase() || null,
  };
}
