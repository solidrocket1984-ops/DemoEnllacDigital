import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import DemoHeader from "../demo-celler/DemoHeader";
import DemoHero from "../demo-celler/DemoHero";
import DemoFeatures from "../demo-celler/FeaturesSection";
import DemoCTA from "../demo-celler/DemoCTA";
import DemoFooter from "../demo-celler/DemoFooter";
import DemoChat from "./DemoChat";
import DemoLeadPanel from "./DemoLeadPanel";
import { translations, scenarioMap } from "../demo-celler/translations";

export default function PublicDemo() {
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [pendingExample, setPendingExample] = useState(null);
  const chatRef = useRef(null);

  const { data: wineries = [] } = useQuery({
    queryKey: ["wineries"],
    queryFn: () => base44.entities.Winery.list(),
  });

  const demoWinery = wineries.find((w) => w.demo_publica) || wineries[0];

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences", demoWinery?.id],
    queryFn: () => demoWinery ? base44.entities.Experience.filter({ winery_id: demoWinery.id, activa: true }) : Promise.resolve([]),
    enabled: !!demoWinery,
  });

  const t = translations[lang];

  const scrollToChat = () => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleExampleClick = (key) => {
    setScenario(scenarioMap[key] || "libre");
    setPendingExample(t[key]);
    scrollToChat();
  };

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
    <div className="min-h-screen bg-white">
      <DemoHeader lang={lang} setLang={setLang} t={t} />
      <DemoHero t={t} onDemoClick={scrollToChat} />
      <DemoFeatures t={t} />

      <section ref={chatRef} className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-[#2D1B14] mb-4">{t.situationsTitle}</h3>
                <div className="space-y-2.5">
                  {["example1", "example2", "example3", "example4"].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleExampleClick(key)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-br from-[#FAF7F2] to-white hover:from-[#F5F0E8] hover:to-[#FAF7F2] border border-stone-200/60 hover:border-[#722F37]/30 hover:shadow-sm transition-all text-sm font-medium text-[#2D1B14]"
                    >
                      {t[key]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-4 leading-relaxed">{t.situationsHint}</p>
              </div>

              <DemoLeadPanel t={t} leadData={leadData} experiences={experiences} />
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <DemoChat
                t={t}
                lang={lang}
                scenario={scenario}
                messages={messages}
                setMessages={setMessages}
                onAgentResponse={handleAgentResponse}
                pendingExample={pendingExample}
                clearPendingExample={() => setPendingExample(null)}
                winery={demoWinery}
                experiences={experiences}
              />
            </div>
          </div>
        </div>
      </section>

      <DemoCTA t={t} />
      <DemoFooter t={t} lang={lang} />
    </div>
  );
}