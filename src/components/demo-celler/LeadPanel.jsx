import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, User, Mail, Phone, Sparkles, Users, Calendar, MessageSquare, ChevronRight } from "lucide-react";

export default function LeadPanel({ t, leadData, experiences = [] }) {
  const getExperienceName = () => {
    const expId = leadData.recommended_experience_id;
    if (!expId) return null;
    const match = experiences.find((exp) => (exp.experience_id || exp.id) === expId);
    if (!match) return expId;
    return match.nombre_ca || match.nombre_es || match.nombre_en || expId;
  };

  const hasContact = leadData.lead_name || leadData.lead_email || leadData.lead_phone;
  const hasMeta = leadData.detected_intent || leadData.people_count || leadData.lead_stage;
  const hasData = hasContact || hasMeta || leadData.conversation_summary;

  const stageLabels = {
    new: "Nou", qualified: "Qualificat",
    contact_requested: "Vol contacte",
    handoff_ready: "Preparat",
    closed_demo: "Tancat",
  };

  const intentLabels = {
    pareja: "Parella", grupo: "Grup", regalo: "Regal",
    english: "Tasting EN", libre: "Consulta lliure",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white flex items-center gap-2">
        <Eye className="w-4 h-4 text-[#722F37]" />
        <h3 className="text-sm font-semibold text-[#2D1B14]">{t.leadPanelTitle}</h3>
        {hasData && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Detectant…
          </span>
        )}
      </div>

      <div className="p-4">
        {!hasData ? (
          <div className="text-center py-8">
            <Eye className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="text-xs text-stone-400">{t.leadEmpty}</p>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Contact block — highlighted */}
            <AnimatePresence>
              {hasContact && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-[#722F37]/5 border border-[#722F37]/15 rounded-xl space-y-2"
                >
                  <p className="text-[10px] font-semibold text-[#722F37] uppercase tracking-wide flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Dades de contacte captades
                  </p>
                  {leadData.lead_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#722F37]/60 shrink-0" />
                      <span className="text-xs font-semibold text-[#2D1B14]">{leadData.lead_name}</span>
                    </div>
                  )}
                  {leadData.lead_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#722F37]/60 shrink-0" />
                      <span className="text-xs text-slate-700">{leadData.lead_email}</span>
                    </div>
                  )}
                  {leadData.lead_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#722F37]/60 shrink-0" />
                      <span className="text-xs text-slate-700">{leadData.lead_phone}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Meta fields */}
            {hasMeta && (
              <div className="space-y-2">
                {leadData.language && (
                  <Row label={t.leadLang} value={leadData.language?.toUpperCase()} />
                )}
                {leadData.detected_intent && (
                  <Row
                    label={t.leadIntent}
                    value={intentLabels[leadData.detected_intent] || leadData.detected_intent}
                    icon={<Sparkles className="w-3 h-3 text-amber-500" />}
                  />
                )}
                {leadData.people_count && (
                  <Row
                    label={t.leadPeople}
                    value={leadData.people_count}
                    icon={<Users className="w-3 h-3 text-slate-400" />}
                  />
                )}
                {getExperienceName() && (
                  <Row
                    label={t.leadExp}
                    value={getExperienceName()}
                    icon={<ChevronRight className="w-3 h-3 text-slate-400" />}
                  />
                )}
                {leadData.desired_date && (
                  <Row
                    label="Data desitjada"
                    value={leadData.desired_date}
                    icon={<Calendar className="w-3 h-3 text-slate-400" />}
                  />
                )}
                {leadData.lead_stage && (
                  <Row
                    label={t.leadStage}
                    value={stageLabels[leadData.lead_stage] || leadData.lead_stage}
                  />
                )}
                {leadData.objection_detected && (
                  <Row label={t.leadObjection} value={leadData.objection_detected} />
                )}
                {leadData.next_step && (
                  <Row label={t.leadNextStep} value={leadData.next_step} />
                )}
              </div>
            )}

            {/* Summary */}
            {leadData.conversation_summary && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                  <MessageSquare className="w-3 h-3" />
                  {t.leadSummary}
                </span>
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

function Row({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center gap-3 py-1 border-b border-stone-50 last:border-0">
      <span className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
        {icon}
        {label}
      </span>
      <span className="text-xs font-medium text-[#2D1B14] text-right">{value}</span>
    </div>
  );
}