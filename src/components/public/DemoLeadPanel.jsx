import React from "react";
import { Eye } from "lucide-react";

export default function DemoLeadPanel({ t, leadData, experiences }) {
  const fields = [
    { label: t.leadLang, value: leadData.language },
    { label: t.leadIntent, value: leadData.detected_intent },
    { label: t.leadPeople, value: leadData.people_count },
    { label: t.leadExp, value: leadData.recommended_experience_id },
    { label: t.leadObjection, value: leadData.objection_detected },
    { label: t.leadStage, value: leadData.lead_stage },
    { label: t.leadNextStep, value: leadData.next_step },
  ];

  const hasData = Object.values(leadData).some((v) => v && v !== "");

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white flex items-center gap-2">
        <Eye className="w-4 h-4 text-[#722F37]" />
        <h3 className="text-sm font-semibold text-[#2D1B14]">{t.leadPanelTitle}</h3>
      </div>

      <div className="p-4">
        {!hasData ? (
          <p className="text-xs text-stone-400 text-center py-6">{t.leadEmpty}</p>
        ) : (
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={i} className="flex justify-between items-start gap-3">
                <span className="text-xs text-stone-500 shrink-0">{f.label}</span>
                <span className="text-xs font-medium text-[#2D1B14] text-right">
                  {f.value || t.notAvailable}
                </span>
              </div>
            ))}
            {leadData.conversation_summary && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-500 block mb-1">{t.leadSummary}</span>
                <p className="text-xs text-[#2D1B14] leading-relaxed bg-[#FAF7F2] rounded-lg p-3">
                  {leadData.conversation_summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}