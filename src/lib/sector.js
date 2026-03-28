import { accessConfig } from "@/config/accessConfig";
import { sectorPresets } from "@/config/sectorPresets";

function normalizeSector(value) {
  return String(value || "").trim().toLowerCase();
}

export function getSettingValue(settings = [], key) {
  return settings.find((item) => item.key === key)?.value;
}

export function resolveSector({ routeSector, querySector, selectedSector, accountSector, userAccessSector, settings } = {}) {
  const defaultSectorSetting = getSettingValue(settings, "default_sector");
  const candidate =
    normalizeSector(routeSector) ||
    normalizeSector(querySector) ||
    normalizeSector(selectedSector) ||
    normalizeSector(accountSector) ||
    normalizeSector(userAccessSector) ||
    normalizeSector(defaultSectorSetting) ||
    normalizeSector(accessConfig.defaultSector);

  return sectorPresets[candidate] || sectorPresets.neutral;
}
