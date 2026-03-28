import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Code2, Send, User, Mail, Phone } from "lucide-react";

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

const statusColors = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  exported: "bg-emerald-100 text-emerald-700 border-emerald-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

export default function LeadSavedCard({ savedLead, onExport }) {
  const [showJson, setShowJson] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (!savedLead) return null;

  const hasContact = savedLead.leadName || savedLead.leadEmail || savedLead.leadPhone;
  const exportStatus = savedLead.exportStatus || "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Lead guardat a BBDD ✓</p>
            <p className="text-[10px] text-emerald-600">
              Base de dades interna · {savedLead.created_date ? new Date(savedLead.created_date).toLocaleTimeString("ca", { hour: "2-digit", minute: "2-digit" }) : "Temps real"}
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusColors[exportStatus]}`}>
          {exportStatus === "exported" ? "Exportat" : exportStatus === "error" ? "Error" : "Pendent"}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Contact data — always visible if present */}
        {hasContact && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Dades de contacte captades</p>
            {savedLead.leadName && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">{savedLead.leadName}</span>
              </div>
            )}
            {savedLead.leadEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-700">{savedLead.leadEmail}</span>
              </div>
            )}
            {savedLead.leadPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-700">{savedLead.leadPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Key fields grid */}
        <div className="grid grid-cols-2 gap-2">
          {savedLead.wineryName && (
            <div className="col-span-2 flex items-center gap-2 p-2 bg-[#FAF7F2] rounded-lg">
              <Database className="w-3.5 h-3.5 text-[#722F37] shrink-0" />
              <span className="text-xs text-stone-500">Celler:</span>
              <span className="text-xs font-semibold text-[#2D1B14]">{savedLead.wineryName}</span>
            </div>
          )}
          {savedLead.detectedIntent && (
            <div className="flex flex-col gap-0.5 p-2 bg-stone-50 rounded-lg">
              <span className="text-[10px] text-stone-400">Intenció</span>
              <span className="text-xs font-medium text-slate-700">{intentLabels[savedLead.detectedIntent] || savedLead.detectedIntent}</span>
            </div>
          )}
          {savedLead.leadStage && (
            <div className="flex flex-col gap-0.5 p-2 bg-stone-50 rounded-lg">
              <span className="text-[10px] text-stone-400">Estat</span>
              <span className="text-xs font-medium text-slate-700">{stageLabels[savedLead.leadStage] || savedLead.leadStage}</span>
            </div>
          )}
          {savedLead.peopleCount && (
            <div className="flex flex-col gap-0.5 p-2 bg-stone-50 rounded-lg">
              <span className="text-[10px] text-stone-400">Persones</span>
              <span className="text-xs font-medium text-slate-700">{savedLead.peopleCount}</span>
            </div>
          )}
          {savedLead.recommendedExperienceName && (
            <div className="flex flex-col gap-0.5 p-2 bg-stone-50 rounded-lg">
              <span className="text-[10px] text-stone-400">Experiència</span>
              <span className="text-xs font-medium text-slate-700 truncate">{savedLead.recommendedExperienceName}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {savedLead.conversationSummary && (
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-100">
            <p className="text-[10px] text-stone-400 mb-1">Resum de conversa</p>
            <p className="text-xs text-[#2D1B14] leading-relaxed">{savedLead.conversationSummary}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Code2 className="w-3 h-3" />
            JSON
          </button>

          {onExport && exportStatus !== "exported" && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Send className="w-3 h-3" />
              Simular enviament CRM
            </button>
          )}

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 ml-auto px-2 py-1.5 rounded-lg text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* JSON viewer */}
        <AnimatePresence>
          {showJson && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <pre className="text-[10px] bg-slate-900 text-emerald-400 rounded-xl p-4 overflow-x-auto leading-relaxed max-h-48">
                {JSON.stringify({
                  id: savedLead.id,
                  sessionId: savedLead.sessionId,
                  wineryName: savedLead.wineryName,
                  leadName: savedLead.leadName,
                  leadEmail: savedLead.leadEmail,
                  leadPhone: savedLead.leadPhone,
                  language: savedLead.language,
                  detectedIntent: savedLead.detectedIntent,
                  leadStage: savedLead.leadStage,
                  peopleCount: savedLead.peopleCount,
                  recommendedExperienceName: savedLead.recommendedExperienceName,
                  conversationSummary: savedLead.conversationSummary,
                  exportStatus: savedLead.exportStatus,
                  created_date: savedLead.created_date,
                }, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* More details */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                {savedLead.desiredDate && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-stone-400">Data desitjada</span>
                    <span className="text-xs font-medium text-slate-700">{savedLead.desiredDate}</span>
                  </div>
                )}
                {savedLead.objectionDetected && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-stone-400">Objecció</span>
                    <span className="text-xs font-medium text-slate-700">{savedLead.objectionDetected}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[10px] text-stone-400">ID Sessió</span>
                  <span className="text-[10px] font-mono text-slate-500">{savedLead.sessionId?.slice(0, 16)}...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-stone-500">Guardat a Base44 DB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 text-stone-400" />
          <span className="text-[10px] text-stone-400">Exportable a CRM / Sheets</span>
        </div>
      </div>
    </motion.div>
  );
}