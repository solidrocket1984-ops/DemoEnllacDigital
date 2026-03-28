import { accessConfig } from "@/config/accessConfig";
import { sectorPresets } from "@/config/sectorPresets";

export function resolveSector({ routeSector, userAccessSector, override } = {}) {
  const candidate = override || routeSector || userAccessSector || accessConfig.defaultSector;
  return sectorPresets[candidate] || sectorPresets.neutral;
}
