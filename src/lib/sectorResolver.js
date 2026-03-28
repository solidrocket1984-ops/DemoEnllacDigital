import { accessConfig } from "../config/accessConfig.js";
import { sectorPresets } from "../config/sectorPresets.js";

function normalizeSector(value) {
  return String(value || "").trim().toLowerCase();
}

export function getSettingValue(settings = [], key) {
  return settings.find((item) => item.key === key)?.value;
}

export function resolveSectorId({
  routeSector,
  querySector,
  selectedSector,
  defaultSector,
  settings,
} = {}) {
  const defaultSectorSetting = getSettingValue(settings, "default_sector");
  const fallbackSector = normalizeSector(defaultSector) || normalizeSector(accessConfig.defaultSector) || "neutral";

  const orderedCandidates = [
    normalizeSector(routeSector),
    normalizeSector(querySector),
    normalizeSector(selectedSector),
    normalizeSector(defaultSectorSetting),
    fallbackSector,
  ].filter(Boolean);

  return orderedCandidates.find((candidate) => sectorPresets[candidate]) || "neutral";
}

export function resolveSector(input = {}) {
  const sectorId = resolveSectorId(input);
  return sectorPresets[sectorId] || sectorPresets.neutral;
}
