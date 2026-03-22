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

/**
 * Extract contact fields from agent data, supporting multiple field name variants
 */
function extractContactFields(agentData) {
  const contact = {};

  // Name variants
  const name =
    agentData.lead_name ||
    agentData.leadName ||
    agentData.name ||
    agentData.nombre ||
    agentData.nom ||
    agentData.fields_to_update?.lead_name ||
    agentData.fields_to_update?.name ||
    agentData.fields_to_update?.nombre ||
    agentData.fields_to_update?.nom ||
    null;
  if (name) contact.leadName = name;

  // Email variants
  const email =
    agentData.lead_email ||
    agentData.leadEmail ||
    agentData.email ||
    agentData.correu ||
    agentData.fields_to_update?.lead_email ||
    agentData.fields_to_update?.email ||
    agentData.fields_to_update?.correu ||
    null;
  if (email) contact.leadEmail = email;

  // Phone variants
  const phone =
    agentData.lead_phone ||
    agentData.leadPhone ||
    agentData.phone ||
    agentData.telefono ||
    agentData.telefon ||
    agentData.tel ||
    agentData.fields_to_update?.lead_phone ||
    agentData.fields_to_update?.phone ||
    agentData.fields_to_update?.telefono ||
    agentData.fields_to_update?.telefon ||
    null;
  if (phone) contact.leadPhone = phone;

  // Date variants
  const date =
    agentData.desired_date ||
    agentData.desiredDate ||
    agentData.fecha ||
    agentData.data_visita ||
    agentData.fields_to_update?.desired_date ||
    null;
  if (date) contact.desiredDate = date;

  return contact;
}

/**
 * Creates or updates a CapturedLead based on agent response
 */
export async function upsertLead({ agentData, messages, winery, experiences, scenario, lang, existingLeadId }) {
  if (!shouldSaveLead(agentData)) return null;

  const sessionId = getDemoSessionId();

  // Resolve experience name
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
    wineryName: winery?.nombre || winery?.name || "Celler Demo",
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
    // When updating, only overwrite contact fields if the new value is non-null
    const updatePayload = { ...leadPayload };
    if (!contactFields.leadName) delete updatePayload.leadName;
    if (!contactFields.leadEmail) delete updatePayload.leadEmail;
    if (!contactFields.leadPhone) delete updatePayload.leadPhone;
    const updated = await base44.entities.CapturedLead.update(existingLeadId, updatePayload);
    return updated;
  } else {
    const created = await base44.entities.CapturedLead.create(leadPayload);
    return created;
  }
}

/**
 * Simulate export to CRM / webhook
 */
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