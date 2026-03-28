export function mapWineryToBusinessProfile(winery) {
  if (!winery) return null;
  return {
    id: winery.id,
    name: winery.nombre || winery.name || "Demo Account",
    slug: winery.slug || "demo",
    isActive: Boolean(winery.activa),
    isPublicDemo: Boolean(winery.demo_publica),
    shortDescription: winery.descripcion_corta || winery.short_description || "",
    tone: winery.tono_marca || winery.brand_tone || "",
    history: winery.historia_breve || winery.brief_history || "",
    valueProposition: winery.propuesta_valor || winery.value_proposition || "",
    faqs: winery.faqs_texto || winery.faqs || "",
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
