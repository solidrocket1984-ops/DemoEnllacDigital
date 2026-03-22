import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { translations, scenarioMap } from "../components/demo-celler/translations";
import DemoHeader from "../components/demo-celler/DemoHeader";
import DemoHero from "../components/demo-celler/DemoHero";
import FlowSteps from "../components/demo-celler/FlowSteps";
import ExamplesPanel from "../components/demo-celler/ExamplesPanel";
import ChatPanel from "../components/demo-celler/ChatPanel";
import LeadPanel from "../components/demo-celler/LeadPanel";
import LeadSavedCard from "../components/demo-celler/LeadSavedCard";
import DemoFooter from "../components/demo-celler/DemoFooter";
import MobileBar from "../components/demo-celler/MobileBar";
import { upsertLead, simulateExport } from "../lib/leadService";
import { getDemoSessionId, resetDemoSessionId } from "../lib/useDemoSession";

export default function DemoCeller() {
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [pendingExample, setPendingExample] = useState(null);
  const [savedLead, setSavedLead] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const demoRef = useRef(null);

  const t = translations[lang];

  // Load demo winery (the one marked as demo_publica)
  const { data: wineries = [] } = useQuery({
    queryKey: ["wineries-public"],
    queryFn: () => base44.entities.Winery.list(),
  });

  const activeWinery = wineries.find((w) => w.demo_publica && w.activa) || wineries.find((w) => w.activa) || null;

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences-public", activeWinery?.id],
    queryFn: () => activeWinery ? base44.entities.Experience.filter({ winery_id: activeWinery.id, activa: true }) : Promise.resolve([]),
    enabled: !!activeWinery,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = activeWinery
        ? translations[lang].chatWelcome.replace("Celler Demo", activeWinery.nombre || "Celler Demo")
        : translations[lang].chatWelcome;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
    }
  }, [activeWinery]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    const welcomeMsg = activeWinery
      ? translations[newLang].chatWelcome.replace("Celler Demo", activeWinery.nombre || "Celler Demo")
      : translations[newLang].chatWelcome;
    setMessages([{ role: "assistant", content: welcomeMsg }]);
    setLeadData({});
    setScenario("libre");
    setPendingExample(null);
    // New session on lang change
    resetDemoSessionId();
    setSavedLead(null);
    setCurrentLeadId(null);
  };

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExampleClick = (exampleKey) => {
    const msgKey = exampleKey + "Msg";
    const message = t[msgKey];
    setScenario(scenarioMap[exampleKey] || "libre");
    setPendingExample(message);
    scrollToDemo();
  };

  const handleAgentResponse = async (data, currentMessages) => {
    // Merge fields_to_update if present
    const merged = { ...data, ...(data.fields_to_update || {}) };

    const updatedLead = {
      language: merged.language ?? lang,
      detected_intent: merged.detected_intent ?? leadData.detected_intent,
      people_count: merged.people_count ?? leadData.people_count,
      recommended_experience_id: merged.recommended_experience_id ?? leadData.recommended_experience_id,
      objection_detected: merged.objection_detected ?? leadData.objection_detected,
      lead_stage: merged.lead_stage ?? leadData.lead_stage,
      next_step: merged.next_step ?? leadData.next_step,
      ask_for_contact: merged.ask_for_contact ?? leadData.ask_for_contact,
      conversation_summary: merged.conversation_summary ?? leadData.conversation_summary,
      // Contact fields — accept many variants
      lead_name: merged.lead_name || merged.name || merged.nombre || merged.nom || leadData.lead_name,
      lead_email: merged.lead_email || merged.email || merged.correu || leadData.lead_email,
      lead_phone: merged.lead_phone || merged.phone || merged.telefono || merged.telefon || leadData.lead_phone,
      desired_date: merged.desired_date || merged.fecha || merged.data_visita || leadData.desired_date,
    };
    setLeadData(updatedLead);

    // Auto-save lead
    const saved = await upsertLead({
      agentData: data,
      messages: currentMessages,
      winery: activeWinery,
      experiences,
      scenario,
      lang,
      existingLeadId: currentLeadId,
    });

    if (saved) {
      setSavedLead(saved);
      setCurrentLeadId(saved.id);
    }
  };

  const handleExportLead = async () => {
    if (!savedLead) return;
    const result = await simulateExport(savedLead, settings);
    if (result.success) {
      setSavedLead((prev) => ({ ...prev, exportStatus: "exported", destinationType: "crm" }));
    }
  };

  const wineryDisplay = activeWinery || { nombre: "Celler Demo", slug: "demo" };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 sm:pb-0">
      <DemoHeader lang={lang} setLang={handleLangChange} t={t} winery={wineryDisplay} />

      <DemoHero t={t} onDemoClick={scrollToDemo} winery={wineryDisplay} />
      <FlowSteps t={t} />

      <section ref={demoRef} className="py-12 sm:py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section label */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#722F37]/8 text-[#722F37] text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#722F37] animate-pulse" />
              Demo en viu · Conversa real
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D1B14]">
              Prova l'assistent de {wineryDisplay.nombre}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Escriu o escull un exemple. Veuràs la conversa, la detecció del lead i el guardado automàtic.
            </p>
          </div>

          {/* Main demo grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Examples */}
            <div className="lg:col-span-2">
              <ExamplesPanel t={t} onExampleClick={handleExampleClick} />
            </div>

            {/* Chat */}
            <div className="lg:col-span-5">
              <ChatPanel
                t={t}
                lang={lang}
                scenario={scenario}
                messages={messages}
                setMessages={setMessages}
                onAgentResponse={handleAgentResponse}
                pendingExample={pendingExample}
                clearPendingExample={() => setPendingExample(null)}
                winery={wineryDisplay}
                experiences={experiences}
              />
            </div>

            {/* Right panel: Lead detected + Lead saved */}
            <div className="lg:col-span-5 space-y-4">
              <LeadPanel t={t} leadData={leadData} experiences={experiences} />
              <LeadSavedCard
                savedLead={savedLead}
                onExport={savedLead?.exportStatus !== "exported" ? handleExportLead : null}
              />
            </div>
          </div>
        </div>
      </section>

      <DemoFooter t={t} lang={lang} />
      <MobileBar t={t} onDemoClick={scrollToDemo} />
    </div>
  );
}