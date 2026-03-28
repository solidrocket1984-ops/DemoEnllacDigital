import { textToList } from "./textToList.js";
function safeJsonParse(rawValue, fallback = null) {
  if (!rawValue) return fallback;
  if (typeof rawValue === "object") return rawValue;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

export function mapWineryToBusinessProfile(winery) {
  if (!winery) return null;
  return {
    id: winery.id,
    name: winery.nombre || winery.name || "Demo Account",
    slug: winery.slug || "demo",
    sector: winery.sector || winery.demo_sector || "neutral",
    isActive: Boolean(winery.activa),
    isPublicDemo: Boolean(winery.demo_publica),
    priority: Number(winery.prioridad_demo || winery.demo_priority || winery.orden_demo || 9999),
    claim: winery.claim || winery.hero_claim || "",
    subtitle: winery.subtitulo || winery.hero_subtitle || "",
    shortDescription: winery.descripcion_corta || winery.short_description || "",
    tone: winery.tono_marca || winery.brand_tone || "",
    history: winery.historia_breve || winery.brief_history || "",
    valueProposition: winery.propuesta_valor || winery.value_proposition || "",
    faqs: textToList(winery.faqs_texto || winery.faqs),
    cta: winery.cta || "",
    suggestedPrompts: textToList(safeJsonParse(winery.prompts_sugeridos, winery.prompts_sugeridos || [])),
    heroOverride: safeJsonParse(winery.hero_override, null),
    endpointOverride: winery.agent_endpoint_override || "",
    tokenOverride: winery.agent_token_override || "",
    compatibilityRaw: winery,
  };
}

export function mapExperienceToService(exp) {
  if (!exp) return null;
  return {
    id: exp.id,
    businessId: exp.winery_id,
    name: exp.nombre || exp.name,
    description: exp.descripcion || exp.description,
    active: exp.activa !== false,
    compatibilityRaw: exp,
  };
}

export function toAgentPayload({ businessProfile, services, scenario, lang, messages }) {
  return {
    business_profile: {
      name: businessProfile?.name,
      slug: businessProfile?.slug,
      tone: businessProfile?.tone,
      short_description: businessProfile?.shortDescription,
      history: businessProfile?.history,
      value_proposition: businessProfile?.valueProposition,
      faqs: businessProfile?.faqs,
    },
    services: (services || []).map((service) => ({ id: service.id, name: service.name, description: service.description })),
    scenario,
    language: lang,
    messages,
  };
}
