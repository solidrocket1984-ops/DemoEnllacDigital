import { mapExperienceToService, mapWineryToBusinessProfile } from "./entityAdapters.js";
import { textToList } from "./textToList.js";

function normalizeSectorId(sector) {
  return String(sector?.id || sector || "neutral").trim().toLowerCase() || "neutral";
}

function normalizeMessages(messages = []) {
  return messages
    .filter((msg) => msg?.role === "user" || msg?.role === "assistant")
    .map((msg) => ({ role: msg.role, content: String(msg.content || "").trim() }))
    .filter((msg) => msg.content);
}

function nullable(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function mapExperienceForAgent(exp = {}, lang = "ca") {
  const title = exp[`nombre_${lang}`] || exp.nombre || exp.name || exp.title || "Experiència";
  const description = exp[`descripcion_${lang}`] || exp.descripcion || exp.description || "";

  return {
    id: exp.experience_id || exp.id,
    title,
    description,
    price: exp.precio ?? exp.price ?? null,
    currency: exp.moneda || exp.currency || "EUR",
    active: exp.activa !== false,
  };
}

export function buildAgentPayload({ lang, scenario, messages, sector, account, experiences = [], lead = {}, sourceType = "base44" }) {
  const businessProfile = mapWineryToBusinessProfile(account);
  const services = experiences.map(mapExperienceToService).filter(Boolean);
  const normalizedSector = normalizeSectorId(sector || account?.sector);
  const normalizedSourceType = String(sourceType || account?.source_type || "base44").trim().toLowerCase();
  const isGenericSectorDemo = normalizedSourceType === "sector_demo" || account?.is_generic_sector_demo === true;

  const faqs = textToList(account?.faqs_texto || account?.faqs || businessProfile?.faqs);
  const recommendationRules = textToList(account?.reglas_recomendacion || account?.recommendation_rules);
  const objectionRules = textToList(account?.reglas_objeciones || account?.objection_rules);
  const suggestedPrompts = textToList(account?.prompts_sugeridos || businessProfile?.suggestedPrompts);

  const cleanLead = {
    name: nullable(lead.name),
    phone: nullable(lead.phone),
    email: nullable(lead.email),
  };

  return {
    language: lang,
    scenario: scenario || "libre",
    sector: normalizedSector,
    businessContext: {
      id: businessProfile?.id || account?.id || null,
      name: businessProfile?.name,
      slug: businessProfile?.slug,
      sector: normalizedSector,
      claim: account?.claim || account?.hero_claim || "",
      subtitle: account?.subtitulo || account?.hero_subtitle || "",
      cta: account?.cta || "",
      tone: businessProfile?.tone || "",
      shortDescription: businessProfile?.shortDescription || "",
      valueProposition: businessProfile?.valueProposition || "",
      availableLanguages: account?.idiomas_disponibles || ["ca", "es", "en"],
      defaultLanguage: account?.idioma_defecto || lang,
      suggestedPrompts,
      faqs,
      recommendationRules,
      objectionRules,
      sourceType: normalizedSourceType,
      isGenericSectorDemo,
    },
    winery: {
      name: businessProfile?.name,
      slug: businessProfile?.slug,
      brand_tone: businessProfile?.tone,
      short_description: businessProfile?.shortDescription,
      value_proposition: businessProfile?.valueProposition,
      faqs,
      recommendation_rules: recommendationRules,
      objection_rules: objectionRules,
    },
    offers: services.map((service) => ({ id: service.id, name: service.name, description: service.description })),
    experiences: (experiences || []).map((exp) => mapExperienceForAgent(exp, lang)).filter((exp) => exp.id),
    leadContext: {
      sector: normalizedSector,
      accountSlug: businessProfile?.slug || account?.slug || null,
      accountName: businessProfile?.name || account?.nombre || account?.name || null,
    },
    lead: cleanLead,
    conversation: normalizeMessages(messages),
    messages: normalizeMessages(messages), // legacy compatibility
    metadata: {
      source: "public_demo",
      source_type: normalizedSourceType,
      sector: normalizedSector,
      account_slug: businessProfile?.slug,
      account_name: businessProfile?.name,
      is_generic_sector_demo: isGenericSectorDemo,
    },
  };
}
