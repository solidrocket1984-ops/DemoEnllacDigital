import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database, User, Mail, Phone, Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const stageLabels = {
  new: "Nou", qualified: "Qualificat",
  contact_requested: "Vol contacte",
  handoff_ready: "Preparat",
  closed_demo: "Tancat",
};
const stageColors = {
  new: "bg-slate-100 text-slate-600",
  qualified: "bg-blue-100 text-blue-700",
  contact_requested: "bg-amber-100 text-amber-700",
  handoff_ready: "bg-purple-100 text-purple-700",
  closed_demo: "bg-emerald-100 text-emerald-700",
};
const intentLabels = {
  pareja: "Parella", grupo: "Grup", regalo: "Regal",
  english: "Tasting EN", libre: "Consulta lliure",
};

export default function LeadsDBModal({ open, onClose }) {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["captured-leads-modal"],
    queryFn: () => base44.entities.CapturedLead.list("-created_date", 20),
    enabled: open,
    refetchInterval: open ? 5000 : false,
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Base de dades · Leads captats</h2>
                  <p className="text-[11px] text-slate-400">Actualitzat automàticament · {leads.length} registres</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-stone-400 text-sm">
                  Carregant registres...
                </div>
              ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                  <Database className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Encara no hi ha leads</p>
                  <p className="text-xs mt-1">Inicia una conversa a la demo</p>
                </div>
              ) : (
                leads.map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-stone-50 border border-stone-100 rounded-xl p-4 hover:border-stone-200 transition-colors"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800">{lead.wineryName || "Demo"}</span>
                        {lead.leadStage && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stageColors[lead.leadStage] || "bg-slate-100 text-slate-600"}`}>
                            {stageLabels[lead.leadStage] || lead.leadStage}
                          </span>
                        )}
                        {lead.exportStatus === "exported" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {lead.created_date ? format(new Date(lead.created_date), "dd/MM HH:mm") : "—"}
                      </span>
                    </div>

                    {/* Contact data */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                      {lead.leadName && (
                        <span className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {lead.leadName}
                        </span>
                      )}
                      {lead.leadEmail && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {lead.leadEmail}
                        </span>
                      )}
                      {lead.leadPhone && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.leadPhone}
                        </span>
                      )}
                    </div>

                    {/* Intent / experience */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {lead.detectedIntent && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Sparkles className="w-3 h-3" />
                          {intentLabels[lead.detectedIntent] || lead.detectedIntent}
                        </span>
                      )}
                      {lead.recommendedExperienceName && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Calendar className="w-3 h-3" />
                          {lead.recommendedExperienceName}
                        </span>
                      )}
                      {lead.language && (
                        <span className="uppercase font-mono text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-400">
                          {lead.language}
                        </span>
                      )}
                    </div>

                    {lead.conversationSummary && (
                      <p className="mt-2 text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {lead.conversationSummary}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-stone-500">Dades en temps real · Base44 DB</span>
              </div>
              <a
                href="/admin/leads"
                className="text-[11px] text-[#722F37] hover:underline font-medium"
              >
                Veure tota la BBDD →
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}