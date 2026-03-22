import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Mail, Phone, Calendar, Sparkles, ChevronRight, Trash2, Send, Code2, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { simulateExport } from "../lib/leadService";

const stageColors = {
  new: "bg-slate-100 text-slate-600",
  qualified: "bg-blue-100 text-blue-700",
  contact_requested: "bg-amber-100 text-amber-700",
  handoff_ready: "bg-purple-100 text-purple-700",
  closed_demo: "bg-emerald-100 text-emerald-700",
};

const stageLabels = {
  new: "Nou",
  qualified: "Qualificat",
  contact_requested: "Vol contacte",
  handoff_ready: "Preparat",
  closed_demo: "Tancat",
};

const intentLabels = {
  pareja: "Parella",
  grupo: "Grup",
  regalo: "Regal",
  english: "Tasting EN",
  libre: "Consulta lliure",
};

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterLang, setFilterLang] = useState("all");
  const [filterWinery, setFilterWinery] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["captured-leads"],
    queryFn: () => base44.entities.CapturedLead.list("-created_date", 100),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CapturedLead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captured-leads"] });
      toast.success("Lead eliminat");
    },
  });

  const exportMutation = useMutation({
    mutationFn: (lead) => simulateExport(lead, settings),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["captured-leads"] });
      if (result.success) {
        toast.success("Lead exportat correctament");
      } else {
        toast.error("Error en l'exportació");
      }
    },
  });

  const wineryOptions = [...new Set(leads.map((l) => l.wineryName).filter(Boolean))];

  const filtered = leads.filter((lead) => {
    const matchSearch =
      !search ||
      lead.wineryName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.leadEmail?.toLowerCase().includes(search.toLowerCase()) ||
      lead.leadPhone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.conversationSummary?.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || lead.leadStage === filterStage;
    const matchLang = filterLang === "all" || lead.language === filterLang;
    const matchWinery = filterWinery === "all" || lead.wineryName === filterWinery;
    return matchSearch && matchStage && matchLang && matchWinery;
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads captats</h1>
            <p className="text-sm text-slate-500 mt-1">Leads generats durant les demos del producte</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">{leads.length} registres</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cercar leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-full sm:w-44 h-10">
              <SelectValue placeholder="Estat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els estats</SelectItem>
              <SelectItem value="new">Nou</SelectItem>
              <SelectItem value="qualified">Qualificat</SelectItem>
              <SelectItem value="contact_requested">Vol contacte</SelectItem>
              <SelectItem value="handoff_ready">Preparat</SelectItem>
              <SelectItem value="closed_demo">Tancat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger className="w-full sm:w-36 h-10">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els idiomes</SelectItem>
              <SelectItem value="ca">Català</SelectItem>
              <SelectItem value="es">Castellà</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          {wineryOptions.length > 1 && (
            <Select value={filterWinery} onValueChange={setFilterWinery}>
              <SelectTrigger className="w-full sm:w-44 h-10">
                <SelectValue placeholder="Celler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tots els cellers</SelectItem>
                {wineryOptions.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Carregant leads...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Encara no hi ha leads captats</p>
            <p className="text-xs mt-1">Inicia una conversa a la demo pública</p>
          </div>
        ) : (
          <>
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
            <div className="col-span-2">Nom</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Telèfon</div>
            <div className="col-span-2">Intenció</div>
            <div className="col-span-2">Experiència</div>
            <div className="col-span-1">Estat</div>
            <div className="col-span-1 text-right">Data</div>
          </div>

          <div className="grid gap-2">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => setSelectedLead(lead)}
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center px-4 py-3.5">
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 truncate">{lead.leadName || <span className="text-slate-300">—</span>}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="text-xs text-slate-600 truncate">{lead.leadEmail || <span className="text-slate-300">—</span>}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="text-xs text-slate-600">{lead.leadPhone || <span className="text-slate-300">—</span>}</span>
                  </div>
                  <div className="col-span-2">
                    {lead.detectedIntent ? (
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {intentLabels[lead.detectedIntent] || lead.detectedIntent}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-600 truncate block">{lead.recommendedExperienceName || <span className="text-slate-300">—</span>}</span>
                  </div>
                  <div className="col-span-1">
                    {lead.leadStage ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${stageColors[lead.leadStage] || "bg-slate-100 text-slate-600"}`}>
                        {stageLabels[lead.leadStage] || lead.leadStage}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-[11px] text-slate-400">
                      {lead.created_date ? format(new Date(lead.created_date), "dd/MM HH:mm") : "—"}
                    </span>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{lead.leadName || lead.leadEmail || lead.leadPhone || lead.wineryName || "Lead anònim"}</p>
                      {lead.leadStage && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${stageColors[lead.leadStage] || "bg-slate-100 text-slate-600"}`}>
                          {stageLabels[lead.leadStage] || lead.leadStage}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{lead.created_date ? format(new Date(lead.created_date), "dd/MM HH:mm") : "—"}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {lead.leadEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.leadEmail}</span>}
                    {lead.leadPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.leadPhone}</span>}
                    {lead.detectedIntent && <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />{intentLabels[lead.detectedIntent] || lead.detectedIntent}</span>}
                    {lead.recommendedExperienceName && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{lead.recommendedExperienceName}</span>}
                  </div>
                </div>

                {/* Actions row */}
                <div className="px-4 py-2 border-t border-slate-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); exportMutation.mutate(lead); }}
                    className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Export CRM
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); if (confirm("Eliminar lead?")) deleteMutation.mutate(lead.id); }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead detail dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => { setSelectedLead(null); setShowJson(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detall del lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-5 mt-2">
              {/* Status row */}
              <div className="flex flex-wrap gap-2">
                {selectedLead.leadStage && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[selectedLead.leadStage] || "bg-slate-100 text-slate-600"}`}>
                    {stageLabels[selectedLead.leadStage] || selectedLead.leadStage}
                  </span>
                )}
                {selectedLead.exportStatus && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedLead.exportStatus === "exported" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedLead.exportStatus === "exported" ? "Exportat" : "Pendent d'exportar"}
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto">
                  {selectedLead.created_date ? format(new Date(selectedLead.created_date), "dd/MM/yyyy HH:mm:ss") : "—"}
                </span>
              </div>

              {/* Key data */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Celler", value: selectedLead.wineryName },
                  { label: "Idioma", value: selectedLead.language?.toUpperCase() },
                  { label: "Intenció", value: intentLabels[selectedLead.detectedIntent] || selectedLead.detectedIntent },
                  { label: "Persones", value: selectedLead.peopleCount },
                  { label: "Experiència", value: selectedLead.recommendedExperienceName },
                  { label: "Objecció", value: selectedLead.objectionDetected },
                  { label: "Nom", value: selectedLead.leadName },
                  { label: "Email", value: selectedLead.leadEmail },
                  { label: "Telèfon", value: selectedLead.leadPhone },
                  { label: "Data desitjada", value: selectedLead.desiredDate },
                ].filter((f) => f.value).map((f, i) => (
                  <div key={i} className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-[10px] text-stone-400 mb-0.5">{f.label}</p>
                    <p className="text-sm font-medium text-slate-800">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {selectedLead.conversationSummary && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Resum de conversa</p>
                  <p className="text-sm text-slate-700 bg-stone-50 p-4 rounded-xl leading-relaxed">
                    {selectedLead.conversationSummary}
                  </p>
                </div>
              )}

              {/* Session ID */}
              <div className="text-[10px] text-slate-400 font-mono">
                Session: {selectedLead.sessionId}
              </div>

              {/* JSON */}
              <div>
                <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)} className="mb-3">
                  <Code2 className="w-4 h-4 mr-2" />
                  {showJson ? "Amagar JSON" : "Veure JSON complet"}
                </Button>
                {showJson && (
                  <pre className="text-[10px] bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(selectedLead, null, 2)}
                  </pre>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t">
                <Button
                  onClick={() => { exportMutation.mutate(selectedLead); setSelectedLead(null); }}
                  className="bg-[#722F37] hover:bg-[#5C252D]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Simular enviament CRM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { if (confirm("Eliminar lead?")) { deleteMutation.mutate(selectedLead.id); setSelectedLead(null); } }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}