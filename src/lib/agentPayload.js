import { mapExperienceToService, mapWineryToBusinessProfile } from "@/lib/entityAdapters";

function normalizeSectorId(sector) {
  return String(sector?.id || sector || "neutral").trim().toLowerCase() || "neutral";
}

function normalizeMessages(messages = []) {
  return messages
    .filter((msg) => msg?.role === "user" || msg?.role === "assistant")
    .map((msg) => ({ role: msg.role, content: String(msg.content || "") }));
}

export function buildAgentPayload({ lang, scenario, messages, sector, account, experiences = [] }) {
  const businessProfile = mapWineryToBusinessProfile(account);
  const services = experiences.map(mapExperienceToService).filter(Boolean);
  const normalizedSector = normalizeSectorId(sector);

  return {
    language: lang,
    scenario: scenario || "libre",
    sector: normalizedSector,
    businessContext: {
      ...businessProfile,
      claim: account?.claim || account?.hero_claim || "",
      subtitle: account?.subtitulo || account?.hero_subtitle || "",
      cta: account?.cta || "",
      priority: account?.prioridad_demo || account?.demo_priority || null,
      availableLanguages: account?.idiomas_disponibles || ["ca", "es", "en"],
      defaultLanguage: account?.idioma_defecto || lang,
      rawType: "Winery",
    },
    winery: {
      name: businessProfile?.name,
      slug: businessProfile?.slug,
      brand_tone: businessProfile?.tone,
      short_description: businessProfile?.shortDescription,
      value_proposition: businessProfile?.valueProposition,
      faqs: businessProfile?.faqs,
      recommendation_rules: account?.reglas_recomendacion || "",
      objection_rules: account?.reglas_objeciones || "",
    },
    offers: services.map((service) => ({ id: service.id, name: service.name, description: service.description })),
    experiences: (experiences || []).map((exp) => ({
      id: exp.id,
      winery_id: exp.winery_id,
      name: exp.nombre || exp.name,
      description: exp.descripcion || exp.description,
      price: exp.precio ?? exp.price ?? null,
      active: exp.activa !== false,
    })),
    messages: normalizeMessages(messages),
    lead: { name: "", phone: "", email: "" },
    metadata: {
      account_slug: businessProfile?.slug,
      account_name: businessProfile?.name,
      sector: normalizedSector,
      source: "public_demo",
    },
  };
}
