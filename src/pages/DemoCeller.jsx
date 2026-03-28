import React, { useEffect, useRef, useState } from "react";
import { Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ChatPanel from "@/components/demo-celler/ChatPanel";
import DemoFooter from "@/components/demo-celler/DemoFooter";
import DemoHeader from "@/components/demo-celler/DemoHeader";
import DemoHero from "@/components/demo-celler/DemoHero";
import ExamplesPanel from "@/components/demo-celler/ExamplesPanel";
import FlowSteps from "@/components/demo-celler/FlowSteps";
import LeadPanel from "@/components/demo-celler/LeadPanel";
import LeadSavedCard from "@/components/demo-celler/LeadSavedCard";
import LeadsDBModal from "@/components/demo-celler/LeadsDBModal";
import MobileBar from "@/components/demo-celler/MobileBar";
import { scenarioMap, translations } from "@/components/demo-celler/translations";
import { brandConfig } from "@/config/brandConfig";
import { mapExperienceToService, mapWineryToBusinessProfile } from "@/lib/entityAdapters";
import { resolveSector } from "@/lib/sector";
import { getDemoSessionId, resetDemoSessionId } from "@/lib/useDemoSession";
import { simulateExport, upsertLead } from "@/lib/leadService";

export default function DemoCeller() {
  const { sector: routeSector } = useParams();
  const activeSector = resolveSector({ routeSector });
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [pendingExample, setPendingExample] = useState(null);
  const [savedLead, setSavedLead] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [showLeadsDB, setShowLeadsDB] = useState(false);
  const demoRef = useRef(null);
  const t = translations[lang];

  const { data: wineries = [] } = useQuery({ queryKey: ["wineries-public"], queryFn: () => base44.entities.Winery.list() });
  const activeWinery = wineries.find((w) => w.demo_publica && w.activa) || wineries.find((w) => w.activa) || null;
  const businessProfile = mapWineryToBusinessProfile(activeWinery);

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences-public", activeWinery?.id],
    queryFn: () => (activeWinery ? base44.entities.Experience.filter({ winery_id: activeWinery.id, activa: true }) : Promise.resolve([])),
    enabled: !!activeWinery,
  });
  const services = experiences.map(mapExperienceToService);

  const { data: settings = [] } = useQuery({ queryKey: ["settings"], queryFn: () => base44.entities.AppSettings.list() });

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = businessProfile ? translations[lang].chatWelcome.replace("Celler Demo", businessProfile.name || "Demo") : translations[lang].chatWelcome;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
    }
  }, [businessProfile]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    const welcomeMsg = businessProfile ? translations[newLang].chatWelcome.replace("Celler Demo", businessProfile.name || "Demo") : translations[newLang].chatWelcome;
    setMessages([{ role: "assistant", content: welcomeMsg }]);
    setLeadData({});
    setScenario("libre");
    setPendingExample(null);
    resetDemoSessionId();
    setSavedLead(null);
    setCurrentLeadId(null);
  };

  const handleAgentResponse = async (data, currentMessages) => {
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
      lead_name: merged.lead_name || merged.name || merged.nombre || merged.nom || leadData.lead_name,
      lead_email: merged.lead_email || merged.email || merged.correu || leadData.lead_email,
      lead_phone: merged.lead_phone || merged.phone || merged.telefono || merged.telefon || leadData.lead_phone,
      desired_date: merged.desired_date || merged.fecha || merged.data_visita || leadData.desired_date,
    };
    setLeadData(updatedLead);
    const saved = await upsertLead({ agentData: data, messages: currentMessages, winery: activeWinery, experiences, scenario, lang, existingLeadId: currentLeadId });
    if (saved) {
      setSavedLead(saved);
      setCurrentLeadId(saved.id);
    }
  };

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handleExampleClick = (exampleKey) => {
    setScenario(scenarioMap[exampleKey] || "libre");
    setPendingExample(t[`${exampleKey}Msg`]);
    scrollToDemo();
  };
  const handleExportLead = async () => {
    if (!savedLead) return;
    const result = await simulateExport(savedLead, settings);
    if (result.success) setSavedLead((prev) => ({ ...prev, exportStatus: "exported", destinationType: "crm" }));
  };

  const wineryDisplay = activeWinery || { nombre: "Demo Account", slug: "demo" };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 sm:pb-0">
      <DemoHeader lang={lang} setLang={handleLangChange} winery={wineryDisplay} />
      <DemoHero t={t} onDemoClick={scrollToDemo} winery={wineryDisplay} />
      <FlowSteps t={t} />
      <section ref={demoRef} className="py-12 sm:py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#722F37]/8 text-[#722F37] text-xs font-medium mb-3"><span className="w-1.5 h-1.5 rounded-full bg-[#722F37] animate-pulse" />{brandConfig.demoChat.sectionLabel}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D1B14]">{activeSector.name} · {businessProfile?.name || "Demo"}</h2>
            <p className="text-sm text-stone-500 mt-1">{brandConfig.demoChat.sectionSubtitle}</p>
            <button onClick={() => setShowLeadsDB(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"><Database className="w-3.5 h-3.5" />Veure BBDD de leads captats</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-2"><ExamplesPanel t={t} onExampleClick={handleExampleClick} /></div>
            <div className="lg:col-span-5"><ChatPanel t={t} lang={lang} scenario={scenario} messages={messages} setMessages={setMessages} onAgentResponse={handleAgentResponse} pendingExample={pendingExample} clearPendingExample={() => setPendingExample(null)} winery={wineryDisplay} experiences={services} demoSessionId={getDemoSessionId()} /></div>
            <div className="lg:col-span-5 space-y-4"><LeadPanel t={t} leadData={leadData} experiences={services} /><LeadSavedCard savedLead={savedLead} onExport={savedLead?.exportStatus !== "exported" ? handleExportLead : null} /></div>
          </div>
        </div>
      </section>
      <LeadsDBModal open={showLeadsDB} onClose={() => setShowLeadsDB(false)} />
      <DemoFooter lang={lang} />
      <MobileBar t={t} onDemoClick={scrollToDemo} />
    </div>
  );
}
