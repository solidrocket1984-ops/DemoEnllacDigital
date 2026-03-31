import { base44 } from "@/api/base44Client";
import { getDemoSessionId } from "./useDemoSession";

function shouldSaveLead(agentData) {
  const merged = { ...agentData, ...(agentData.fields_to_update || {}) };
  return !!(
    merged.detected_intent ||
    merged.people_count ||
    merged.recommended_experience_id ||
    merged.lead_stage ||
    merged.conversation_summary ||
    merged.ask_for_contact ||
    merged.lead_name || merged.name || merged.nombre || merged.nom ||
    merged.lead_email || merged.email || merged.correu ||
    merged.lead_phone || merged.phone || merged.telefono || merged.telefon
  );
}

function extractContactFields(agentData) {
  const contact = {};
  const merged = { ...agentData, ...(agentData.fields_to_update || {}) };

  const name = merged.lead_name || merged.leadName || merged.name || merged.nombre || merged.nom || null;
  if (name) contact.leadName = name;

  const email = merged.lead_email || merged.leadEmail || merged.email || merged.correu || null;
  if (email) contact.leadEmail = email;

  const phone = merged.lead_phone || merged.leadPhone || merged.phone || merged.telefono || merged.telefon || merged.tel || null;
  if (phone) contact.leadPhone = phone;

  const date = merged.desired_date || merged.desiredDate || merged.fecha || merged.data_visita || null;
  if (date) contact.desiredDate = date;

  return contact;
}

function mergeWithoutEmpty(previous = {}, next = {}) {
  const merged = { ...previous };
  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined || value === "") continue;
    merged[key] = value;
  }
  return merged;
}

export async function upsertLead({ agentData, messages, winery, experiences, scenario, lang, existingLeadId, sector, accountSlug, accountName }) {
  if (!shouldSaveLead(agentData)) return null;

  const sessionId = getDemoSessionId();

  let experienceName = null;
  const expId = agentData.recommended_experience_id || agentData.fields_to_update?.recommended_experience_id;
  if (expId && experiences?.length > 0) {
    const match = experiences.find((e) => (e.experience_id || e.id) === expId);
    experienceName = match?.nombre_ca || match?.nombre_es || match?.nombre_en || match?.name || expId;
  }

  const contactFields = extractContactFields(agentData);

  const leadPayload = {
    sessionId,
    source: "public_demo",
    wineryId: winery?.id || winery?.slug || "demo",
    wineryName: winery?.nombre || winery?.name || accountName || "Demo Account",
    accountSlug: accountSlug || winery?.slug || "demo",
    accountName: accountName || winery?.nombre || winery?.name || "Demo Account",
    sector: sector || winery?.sector || "neutral",
    language: agentData.language || lang,
    scenario: scenario || "libre",
    detectedIntent: agentData.detected_intent || agentData.fields_to_update?.detected_intent || null,
    recommendedExperienceId: expId || null,
    recommendedExperienceName: experienceName,
    peopleCount: agentData.people_count || agentData.fields_to_update?.people_count || null,
    objectionDetected: agentData.objection_detected || agentData.fields_to_update?.objection_detected || null,
    leadStage: agentData.lead_stage || agentData.fields_to_update?.lead_stage || null,
    nextStep: agentData.next_step || agentData.fields_to_update?.next_step || null,
    askForContact: agentData.ask_for_contact ?? agentData.fields_to_update?.ask_for_contact ?? false,
    conversationSummary: agentData.conversation_summary || agentData.fields_to_update?.conversation_summary || null,
    conversationMessages: JSON.stringify(messages || []),
    rawAgentResponse: JSON.stringify(agentData),
    destinationType: "database",
    exportStatus: "pending",
    ...contactFields,
  };

  if (existingLeadId) {
    return base44.entities.CapturedLead.update(existingLeadId, leadPayload);
  }

  return base44.entities.CapturedLead.create(leadPayload);
}

export async function simulateExport(lead, settings = []) {
  const webhookSetting = settings.find((s) => s.key === "export_webhook_url");
  const webhookUrl = webhookSetting?.value;

  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  }
  await base44.entities.CapturedLead.update(lead.id, { exportStatus: "exported", destinationType: "crm" });
  return { success: true };
}