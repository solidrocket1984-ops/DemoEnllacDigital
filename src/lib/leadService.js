import { base44 } from "@/api/base44Client";
import { getDemoSessionId } from "./useDemoSession";

/**
 * Determines if agent response contains enough signal to save/update a lead
 */
function shouldSaveLead(agentData) {
  return !!(
    agentData.detected_intent ||
    agentData.people_count ||
    agentData.recommended_experience_id ||
    agentData.lead_stage ||
    agentData.conversation_summary ||
    agentData.ask_for_contact
  );
}

/**
 * Creates or updates a CapturedLead based on agent response
 */
export async function upsertLead({ agentData, messages, winery, experiences, scenario, lang, existingLeadId }) {
  if (!shouldSaveLead(agentData)) return null;

  const sessionId = getDemoSessionId();

  // Resolve experience name
  let experienceName = null;
  if (agentData.recommended_experience_id && experiences?.length > 0) {
    const match = experiences.find(
      (e) => (e.experience_id || e.id) === agentData.recommended_experience_id
    );
    experienceName = match?.nombre_ca || match?.nombre_es || match?.nombre_en || match?.name || agentData.recommended_experience_id;
  }

  const leadPayload = {
    sessionId,
    source: "demo",
    wineryId: winery?.id || winery?.slug || "demo",
    wineryName: winery?.nombre || winery?.name || "Celler Demo",
    language: agentData.language || lang,
    scenario: scenario || "libre",
    detectedIntent: agentData.detected_intent || null,
    recommendedExperienceId: agentData.recommended_experience_id || null,
    recommendedExperienceName: experienceName,
    peopleCount: agentData.people_count || null,
    objectionDetected: agentData.objection_detected || null,
    leadStage: agentData.lead_stage || null,
    nextStep: agentData.next_step || null,
    askForContact: agentData.ask_for_contact || false,
    conversationSummary: agentData.conversation_summary || null,
    conversationMessages: JSON.stringify(messages || []),
    rawAgentResponse: JSON.stringify(agentData),
    destinationType: "database",
    exportStatus: "pending",
  };

  // Extract contact data from conversation if agent provides it
  if (agentData.lead_name) leadPayload.leadName = agentData.lead_name;
  if (agentData.lead_phone) leadPayload.leadPhone = agentData.lead_phone;
  if (agentData.lead_email) leadPayload.leadEmail = agentData.lead_email;
  if (agentData.desired_date) leadPayload.desiredDate = agentData.desired_date;

  try {
    if (existingLeadId) {
      const updated = await base44.entities.CapturedLead.update(existingLeadId, leadPayload);
      return updated;
    } else {
      const created = await base44.entities.CapturedLead.create(leadPayload);
      return created;
    }
  } catch (err) {
    console.error("Error saving lead:", err);
    return null;
  }
}

/**
 * Simulate export to CRM / webhook
 */
export async function simulateExport(lead, settings = []) {
  const webhookSetting = settings.find((s) => s.key === "export_webhook_url");
  const webhookUrl = webhookSetting?.value;

  try {
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    }
    await base44.entities.CapturedLead.update(lead.id, { exportStatus: "exported", destinationType: "crm" });
    return { success: true };
  } catch (err) {
    await base44.entities.CapturedLead.update(lead.id, { exportStatus: "error" });
    return { success: false, error: err.message };
  }
}