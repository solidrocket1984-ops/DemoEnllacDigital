import React from "react";
import { motion } from "framer-motion";
import { Eye, User, Mail, Phone } from "lucide-react";

export default function LeadPanel({ t, leadData, experiences = [] }) {
  const getExperienceName = () => {
    const expId = leadData.recommended_experience_id;
    if (!expId) return null;
    const match = experiences.find((exp) => (exp.experience_id || exp.id) === expId);
    if (!match) return expId;
    return match.nombre_ca || match.nombre_es || match.nombre_en || expId;
  };

  const humanize = (key, value) => {
    if (value === null || value === undefined || value === "") return t.notAvailable || "—";
    const maps = {
      detected_intent: { pareja: "Parella", grupo: "Grup", regalo: "Regal", practica: "Consulta pràctica" },
      objection_detected: { none: "Cap" },
      lead_stage: {
        new: "Nou", qualified: "Qualificat",
        contact_requested: "Contacte demanat",
        handoff_ready: "Preparat per derivar",
        closed_demo: "Tancat",
      },
      next_step: {
        ask_contact: "Demanar contacte",
        recommend_experience: "Recomanar experiència",
        handoff: "Derivar",
        retry: "Tornar-ho a provar",
      },
    };
    return maps[key]?.[value] || value;
  };

  const fields = [
    { key: "detected_intent", label: t.leadIntent || "Intenció", value: leadData.detected_intent },
    { key: "people_count", label: t.leadPeople || "Persones", value: leadData.people_count },
    { key: "recommended_experience_id", label: t.leadExp || "Experiència", value: getExperienceName() },
    { key: "lead_stage", label: t.leadStage || "Estat", value: leadData.lead_stage },
    { key: "next_step", label: t.leadNextStep || "Pròxim pas", value: leadData.next_step },
  ];

  const hasData = Object.values(leadData).some((v) => v !== null && v !== undefined && v !== "");
  const hasContact = leadData.lead_name || leadData.lead_email || leadData.lead_phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white flex items-center gap-2">
        <Eye className="w-4 h-4 text-[#722F37]" />
        <h3 className="text-sm font-semibold text-[#2D1B14]">{t.leadPanelTitle || "Lead detectat"}</h3>
        {hasData && (
          <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>

      <div className="p-4">
        {!hasData ? (
          <p className="text-xs text-stone-400 text-center py-6">{t.leadEmpty || "Encara no s'ha detectat cap lead."}</p>
        ) : (
          <div className="space-y-3">
            {/* Contact data — highlighted */}
            {hasContact && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Dades de contacte captades</p>
                {leadData.lead_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-800">{leadData.lead_name}</span>
                  </div>
                )}
                {leadData.lead_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-800">{leadData.lead_email}</span>
                  </div>
                )}
                {leadData.lead_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-800">{leadData.lead_phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Intent/stage fields */}
            {fields.map((f, i) => (
              <div key={i} className="flex justify-between items-start gap-3">
                <span className="text-xs text-stone-500 shrink-0">{f.label}</span>
                <span className="text-xs font-medium text-[#2D1B14] text-right">
                  {humanize(f.key, f.value)}
                </span>
              </div>
            ))}

            {leadData.conversation_summary && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-500 block mb-1">{t.leadSummary || "Resum"}</span>
                <p className="text-xs text-[#2D1B14] leading-relaxed bg-[#FAF7F2] rounded-lg p-3">
                  {leadData.conversation_summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}