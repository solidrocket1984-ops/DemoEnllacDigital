import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import DemoChat from "../components/public/DemoChat";
import DemoLeadPanel from "../components/public/DemoLeadPanel";
import { translations } from "../components/demo-celler/translations";

export default function AdminSimulation() {
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [selectedWineryId, setSelectedWineryId] = useState(null);

  const { data: wineries = [] } = useQuery({
    queryKey: ["wineries"],
    queryFn: () => base44.entities.Winery.list(),
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences", selectedWineryId],
    queryFn: () => selectedWineryId ? base44.entities.Experience.filter({ winery_id: selectedWineryId }) : Promise.resolve([]),
    enabled: !!selectedWineryId,
  });

  const selectedWinery = wineries.find((w) => w.id === selectedWineryId);
  const t = translations[lang];

  useEffect(() => {
    if (wineries.length > 0 && !selectedWineryId) {
      const demoWinery = wineries.find((w) => w.demo_publica) || wineries[0];
      setSelectedWineryId(demoWinery?.id);
    }
  }, [wineries, selectedWineryId]);

  const handleAgentResponse = (data) => {
    setLeadData({
      language: data.language || lang,
      detected_intent: data.detected_intent || "",
      people_count: data.people_count || "",
      recommended_experience_id: data.recommended_experience_id || "",
      objection_detected: data.objection_detected || "",
      lead_stage: data.lead_stage || "",
      next_step: data.next_step || "",
      conversation_summary: data.conversation_summary || "",
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Simulació de l'assistent</h1>
          <p className="text-sm text-slate-500 mt-1">Prova el comportament de l'assistent amb diferents comptes</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Selecciona un compte</label>
          <select
            value={selectedWineryId || ""}
            onChange={(e) => setSelectedWineryId(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30"
          >
            {wineries.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nombre} {w.demo_publica ? "(Demo pública)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DemoLeadPanel t={t} leadData={leadData} experiences={experiences} />
          </div>
          <div className="lg:col-span-3">
            <DemoChat
              t={t}
              lang={lang}
              scenario={scenario}
              messages={messages}
              setMessages={setMessages}
              onAgentResponse={handleAgentResponse}
              pendingExample={null}
              clearPendingExample={() => {}}
              winery={selectedWinery}
              experiences={experiences}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}