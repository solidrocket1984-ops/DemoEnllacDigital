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

function normalizeLower(value) {
  return safeNormalize(value).toLowerCase();
}

export function getStoredSector() {
  return safeStorage()?.getItem(STORAGE_KEYS.sector) || null;
}

export function setStoredSector(sector) {
  const normalized = normalizeLower(sector);
  if (!normalized) return;
  safeStorage()?.setItem(STORAGE_KEYS.sector, normalized);
}

export function getStoredAccountSlug() {
  return safeStorage()?.getItem(STORAGE_KEYS.accountSlug) || null;
}

export function setStoredAccountSlug(accountSlug) {
  const normalized = normalizeLower(accountSlug);
  if (!normalized) return;
  safeStorage()?.setItem(STORAGE_KEYS.accountSlug, normalized);
}

export function clearStoredAccountSlug() {
  safeStorage()?.removeItem(STORAGE_KEYS.accountSlug);
}

export function resolveDemoUrlState({ routeSector, querySector, queryAccount, selectedSector, selectedAccountSlug }) {
  return {
    routeSector: normalizeLower(routeSector) || null,
    querySector: normalizeLower(querySector) || null,
    queryAccount: normalizeLower(queryAccount) || null,
    selectedSector: normalizeLower(selectedSector) || null,
    selectedAccountSlug: normalizeLower(selectedAccountSlug) || null,
  };
}

export function buildDemoSearchParams({ currentSearch, routeSector, activeSectorId, activeAccountSlug }) {
  const next = new URLSearchParams(currentSearch);
  const normalizedRouteSector = normalizeLower(routeSector);
  const normalizedActiveSector = normalizeLower(activeSectorId) || "neutral";
  const normalizedActiveAccount = normalizeLower(activeAccountSlug) || "demo";

  if (normalizedRouteSector) {
    next.delete("sector");
  } else {
    next.set("sector", normalizedActiveSector);
  }

  next.set("account", normalizedActiveAccount);

  const currentString = new URLSearchParams(currentSearch).toString();
  const nextString = next.toString();
  return { changed: currentString !== nextString, next };
}
