import { getSectorDemoData } from "../config/demoSectorData.js";
import { mapWineryToBusinessProfile } from "./entityAdapters.js";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveAccountSector(account) {
  return normalize(account?.sector || account?.demo_sector || account?.sector_slug || account?.default_sector);
}

function toNumber(value, fallback = 9999) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getAccountDataMode(account) {
  return normalize(account?.demo_data_mode || account?.data_mode || account?.source_type);
}

function shouldTreatAsGenericByAccount(account) {
  return getAccountDataMode(account) === "sector_demo" || account?.is_generic_sector_demo === true;
}

function buildSectorDemoAccount(activeSector) {
  const sectorData = getSectorDemoData(activeSector);
  return {
    ...sectorData.account,
    sector: normalize(activeSector) || sectorData.account.sector || "neutral",
    source_type: "sector_demo",
    is_generic_sector_demo: true,
  };
}

function resolveAvailableAccounts({ sorted = [], normalizedSector, includeCrossSector = false }) {
  const inSector = sorted.filter((account) => {
    const accountSector = resolveAccountSector(account);
    if (!normalizedSector || normalizedSector === "neutral") return true;
    return !accountSector || accountSector === normalizedSector;
  });

  if (!includeCrossSector && normalizedSector && normalizedSector !== "neutral") return inSector;
  return inSector.length > 0 ? inSector : sorted;
}

export function getDefaultAccountBySector(settings = [], sector) {
  const wantedSector = normalize(sector);
  const sectorSetting = settings.find((item) => item.key === `default_demo_account_${wantedSector}`)?.value;
  const globalSetting = settings.find((item) => item.key === "default_demo_account_slug")?.value;
  return normalize(sectorSetting || globalSetting);
}

export function resolveDemoAccount({
  accounts = [],
  settings = [],
  activeSector,
  requestedAccountSlug,
  selectedAccountSlug,
  forceSourceType,
}) {
  const normalizedSector = normalize(activeSector) || "neutral";
  const defaultSlug = getDefaultAccountBySector(settings, normalizedSector);
  const explicitSlug = normalize(requestedAccountSlug) || normalize(selectedAccountSlug);
  const normalizedForceSourceType = normalize(forceSourceType);
  const forceSectorDemo = normalizedForceSourceType === "sector_demo";

  const sorted = [...accounts]
    .filter((account) => account?.activa !== false)
    .sort((a, b) => toNumber(a.prioridad_demo || a.demo_priority || a.orden_demo) - toNumber(b.prioridad_demo || b.demo_priority || b.orden_demo));

  const inSector = resolveAvailableAccounts({ sorted, normalizedSector, includeCrossSector: false });

  const bySlug = (list, slug) => list.find((account) => normalize(account.slug) === slug);
  const explicitPool = normalizedSector && normalizedSector !== "neutral" ? inSector : sorted;

  const explicitAccount = explicitSlug ? bySlug(explicitPool, explicitSlug) : null;

  const selectedBase44Account =
    explicitAccount ||
    (defaultSlug && bySlug(inSector, defaultSlug)) ||
    inSector.find((account) => account.demo_publica) ||
    inSector[0] ||
    sorted.find((account) => account.demo_publica) ||
    sorted[0] ||
    null;

  const shouldUseBase44 = Boolean(selectedBase44Account) && !forceSectorDemo && !shouldTreatAsGenericByAccount(selectedBase44Account);

  const account = shouldUseBase44 ? selectedBase44Account : buildSectorDemoAccount(normalizedSector);
  const sourceType = shouldUseBase44 ? "base44" : "sector_demo";
  const availableAccounts = shouldUseBase44 ? (inSector.length > 0 ? inSector : sorted) : [account, ...inSector.filter((item) => normalize(item.slug) !== normalize(account.slug))];

  return {
    account,
    businessProfile: mapWineryToBusinessProfile(account),
    availableAccounts,
    sourceType,
    isGenericSectorDemo: sourceType === "sector_demo",
  };
}

export function resolveDemoOffers({ sourceType, account, base44Experiences = [], activeSector }) {
  if (sourceType === "base44") return base44Experiences;
  return getSectorDemoData(activeSector || account?.sector).offers || [];
}
