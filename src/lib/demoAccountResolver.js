import { mapWineryToBusinessProfile } from "@/lib/entityAdapters";

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

function buildNeutralFallback(activeSector) {
  return {
    id: "fallback-neutral",
    nombre: "Demo Account",
    slug: "demo",
    activa: true,
    demo_publica: true,
    sector: activeSector || "neutral",
    prioridad_demo: 9999,
    claim: "Assistència intel·ligent adaptable a múltiples sectors.",
    descripcion_corta: "Compte demo neutral per validar el flux complet.",
    idiomas_disponibles: ["ca", "es", "en"],
    idioma_defecto: "ca",
  };
}

export function getDefaultAccountBySector(settings = [], sector) {
  const wantedSector = normalize(sector);
  const sectorSetting = settings.find((item) => item.key === `default_demo_account_${wantedSector}`)?.value;
  const globalSetting = settings.find((item) => item.key === "default_demo_account_slug")?.value;
  return normalize(sectorSetting || globalSetting);
}

export function resolveDemoAccount({ accounts = [], settings = [], activeSector, requestedAccountSlug }) {
  const normalizedSector = normalize(activeSector);
  const defaultSlug = getDefaultAccountBySector(settings, normalizedSector);
  const explicitSlug = normalize(requestedAccountSlug);

  const sorted = [...accounts]
    .filter((account) => account?.activa !== false)
    .sort((a, b) => toNumber(a.prioridad_demo || a.demo_priority || a.orden_demo) - toNumber(b.prioridad_demo || b.demo_priority || b.orden_demo));

  const inSector = sorted.filter((account) => {
    const accountSector = resolveAccountSector(account);
    if (!normalizedSector || normalizedSector === "neutral") return true;
    return !accountSector || accountSector === normalizedSector;
  });

  const bySlug = (list, slug) => list.find((account) => normalize(account.slug) === slug);

  const resolved =
    (explicitSlug && bySlug(sorted, explicitSlug)) ||
    (defaultSlug && bySlug(inSector, defaultSlug)) ||
    inSector.find((account) => account.demo_publica) ||
    inSector[0] ||
    sorted.find((account) => account.demo_publica) ||
    sorted[0] ||
    buildNeutralFallback(normalizedSector);

  return {
    account: resolved,
    businessProfile: mapWineryToBusinessProfile(resolved),
    availableAccounts: inSector.length > 0 ? inSector : sorted,
  };
}
