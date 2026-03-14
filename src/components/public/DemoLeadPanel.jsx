import React from "react";
import { User, MessageSquare, Users, Lightbulb, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";

export default function DemoLeadPanel({ t, leadData, experiences }) {
  const hasData = Object.values(leadData).some((v) => v && v !== "");

  const getExperienceName = (expId) => {
    if (!expId) return null;
    const exp = experiences?.find((e) => e.experience_id === expId);
    return exp ? (exp.nombre_ca || exp.nombre_es || exp.nombre_en) : expId;
  };

  const fields = [
    { icon: User, label: t.leadLang, value: leadData.language, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: MessageSquare, label: t.leadIntent, value: leadData.detected_intent, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Users, label: t.leadPeople, value: leadData.people_count, color: "text-green-600", bg: "bg-green-50" },
    { icon: Lightbulb, label: t.leadExp, value: getExperienceName(leadData.recommended_experience_id), color: "text-amber-600", bg: "bg-amber-50" },
    { icon: AlertCircle, label: t.leadObjection, value: leadData.objection_detected, color: "text-red-600", bg: "bg-red-50" },
    { icon: TrendingUp, label: t.leadStage, value: leadData.lead_stage, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: ArrowRight, label: t.leadNextStep, value: leadData.next_step, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-[#722F37] to-[#5C252D]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t.leadPanelTitle}
        </h3>
      </div>

      <div className="p-5">
        {!hasData ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-sm text-stone-500">{t.leadEmpty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((f, i) => {
              const Icon = f.icon;
              return f.value && f.value !== t.notAvailable ? (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-500 mb-0.5">{f.label}</p>
                    <p className="text-sm font-semibold text-[#2D1B14]">{f.value}</p>
                  </div>
                </div>
              ) : null;
            })}
            {leadData.conversation_summary && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#FAF7F2] to-white border border-stone-200">
                <p className="text-xs font-medium text-stone-600 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.leadSummary}
                </p>
                <p className="text-sm text-[#2D1B14] leading-relaxed">
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