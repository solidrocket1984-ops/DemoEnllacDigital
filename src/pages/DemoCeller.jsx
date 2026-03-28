import React, { useEffect, useMemo, useRef, useState } from "react";
import { Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
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
import { sectorPresets } from "@/config/sectorPresets";
import { clearStoredAccountSlug, getStoredAccountSlug, getStoredSector, resolveDemoUrlState, setStoredAccountSlug, setStoredSector } from "@/lib/demoState";
import { resolveDemoAccount } from "@/lib/demoAccountResolver";
import { resolveSector } from "@/lib/sectorResolver";
import { resetDemoSessionId } from "@/lib/useDemoSession";
import { simulateExport, upsertLead } from "@/lib/leadService";
import { useAuth } from "@/lib/AuthContext";
import { resolveClientAccess } from "@/lib/access-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DemoCeller() {
  const { sector: routeSector } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySector = searchParams.get("sector");
  const queryAccount = searchParams.get("account");
  const urlState = resolveDemoUrlState({ routeSector, querySector, queryAccount, selectedSector: getStoredSector(), selectedAccountSlug: getStoredAccountSlug() });

  const { user } = useAuth();
  const access = resolveClientAccess(user);

  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [pendingExample, setPendingExample] = useState(null);
  const [savedLead, setSavedLead] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [showLeadsDB, setShowLeadsDB] = useState(false);
  const [selectedSector, setSelectedSector] = useState(() => getStoredSector());
  const [selectedAccountSlug, setSelectedAccountSlug] = useState(() => getStoredAccountSlug());

  const demoRef = useRef(null);
  const t = translations[lang];

  const { data: wineries = [] } = useQuery({ queryKey: ["wineries-public"], queryFn: () => base44.entities.Winery.list() });
  const { data: settings = [] } = useQuery({ queryKey: ["settings"], queryFn: () => base44.entities.AppSettings.list() });

  const activeSector = useMemo(
    () =>
      resolveSector({
        routeSector: urlState.routeSector || routeSector,
        querySector: urlState.querySector || querySector,
        selectedSector,
        defaultSector: access?.sector,
        settings,
      }),
    [routeSector, querySector, selectedSector, access?.sector, settings]
  );

  const { account: activeAccount, businessProfile, availableAccounts } = useMemo(
    () =>
      resolveDemoAccount({
        accounts: wineries,
        settings,
        activeSector: activeSector.id,
        requestedAccountSlug: urlState.queryAccount || queryAccount,
        selectedAccountSlug,
      }),
    [wineries, settings, activeSector.id, queryAccount, selectedAccountSlug]
  );

  useEffect(() => {
    setStoredSector(activeSector.id);
  }, [activeSector.id]);

  useEffect(() => {
    if (activeAccount?.slug) setStoredAccountSlug(activeAccount.slug);
  }, [activeAccount?.slug]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("account", activeAccount?.slug || "demo");
    if (!routeSector) next.set("sector", activeSector.id);
    setSearchParams(next, { replace: true });
  }, [activeAccount?.slug, activeSector.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences-public", activeAccount?.id],
    queryFn: () => (activeAccount?.id ? base44.entities.Experience.filter({ winery_id: activeAccount.id, activa: true }) : Promise.resolve([])),
    enabled: Boolean(activeAccount?.id),
  });

  useEffect(() => {
    if (messages.length > 0) return;
    const welcome = (t.chatWelcome || "Hola").replace("Celler Demo", businessProfile?.name || "Demo Account");
    setMessages([{ role: "assistant", content: welcome }]);
  }, [businessProfile?.name, t.chatWelcome, messages.length]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    const welcome = (translations[newLang]?.chatWelcome || "Hola").replace("Celler Demo", businessProfile?.name || "Demo Account");
    setMessages([{ role: "assistant", content: welcome }]);
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
    const saved = await upsertLead({
      agentData: data,
      messages: currentMessages,
      winery: activeAccount,
      experiences,
      scenario,
      lang,
      existingLeadId: currentLeadId,
      sector: activeSector.id,
      accountSlug: activeAccount?.slug,
      accountName: businessProfile?.name,
    });
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

  const handleSectorChange = (nextSector) => {
    setSelectedSector(nextSector);
    clearStoredAccountSlug();
    setSelectedAccountSlug("");
  };

  const handleAccountChange = (slug) => {
    setSelectedAccountSlug(slug);
    setStoredAccountSlug(slug);
    resetDemoSessionId();
    setLeadData({});
    setSavedLead(null);
    setCurrentLeadId(null);
  };

  const sectorSpecific = sectorPresets[activeSector.id] || sectorPresets.neutral;
  const promptsFromAccount = Array.isArray(businessProfile?.suggestedPrompts) && businessProfile.suggestedPrompts.length > 0 ? businessProfile.suggestedPrompts : null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 sm:pb-0">
      <DemoHeader lang={lang} setLang={handleLangChange} winery={activeAccount} sector={activeSector} />
      <DemoHero t={{ ...t, heroTitle: businessProfile?.claim || sectorSpecific.heroTitle, heroSubtitle: businessProfile?.subtitle || sectorSpecific.heroSubtitle, heroBtn1: businessProfile?.cta || sectorSpecific.cta }} onDemoClick={scrollToDemo} winery={activeAccount} sector={activeSector} />
      <FlowSteps t={t} />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white border border-stone-200 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-stone-500 mb-1">Sector</p>
            <Select value={activeSector.id} onValueChange={handleSectorChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(sectorPresets).map((sectorId) => <SelectItem key={sectorId} value={sectorId}>{sectorPresets[sectorId].name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-stone-500 mb-1">Cliente demo</p>
            <Select value={activeAccount?.slug || "demo"} onValueChange={handleAccountChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableAccounts.map((account) => (
                  <SelectItem key={account.id || account.slug} value={account.slug || "demo"}>
                    {(account.nombre || account.name || "Demo")} {account.demo_publica ? "· pública" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section ref={demoRef} className="py-12 sm:py-16 bg-white scroll-mt-16 mt-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#722F37]/8 text-[#722F37] text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#722F37] animate-pulse" />
              {brandConfig.demoChat.sectionLabel}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D1B14]">{activeSector.name} · {businessProfile?.name || "Demo"}</h2>
            <p className="text-sm text-stone-500 mt-1">{businessProfile?.shortDescription || brandConfig.demoChat.sectionSubtitle}</p>
            <button onClick={() => setShowLeadsDB(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"><Database className="w-3.5 h-3.5" />Veure BBDD de leads captats</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-2"><ExamplesPanel t={t} onExampleClick={handleExampleClick} promptOverrides={promptsFromAccount || sectorSpecific.prompts} /></div>
            <div className="lg:col-span-5"><ChatPanel t={t} lang={lang} scenario={scenario} messages={messages} setMessages={setMessages} onAgentResponse={handleAgentResponse} pendingExample={pendingExample} clearPendingExample={() => setPendingExample(null)} account={activeAccount} experiences={experiences} settings={settings} sector={activeSector} /></div>
            <div className="lg:col-span-5 space-y-4"><LeadPanel t={t} leadData={leadData} experiences={experiences} /><LeadSavedCard savedLead={savedLead} onExport={savedLead?.exportStatus !== "exported" ? handleExportLead : null} /></div>
          </div>
        </div>
      </section>
      <LeadsDBModal open={showLeadsDB} onClose={() => setShowLeadsDB(false)} />
      <DemoFooter lang={lang} />
      <MobileBar t={t} onDemoClick={scrollToDemo} />
    </div>
  );
}
