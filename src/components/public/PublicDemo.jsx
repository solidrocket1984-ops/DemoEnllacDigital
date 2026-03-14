import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import DemoHeader from "./DemoHeader";
import DemoHero from "./DemoHero";
import DemoChat from "./DemoChat";
import DemoLeadPanel from "./DemoLeadPanel";
import DemoCTA from "./DemoCTA";
import DemoFooter from "./DemoFooter";
import { translations, scenarioMap } from "./translations";

export default function PublicDemo() {
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [pendingExample, setPendingExample] = useState(null);
  const chatRef = React.useRef(null);

  const t = translations[lang];

  const { data: demoWinery } = useQuery({
    queryKey: ["demoWinery"],
    queryFn: async () => {
      const res = await base44.entities.Winery.filter({ demo_publica: true, activa: true });
      return res[0] || null;
    },
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["demoExperiences", demoWinery?.id],
    queryFn: () => base44.entities.Experience.filter({ winery_id: demoWinery.id, activa: true }),
    enabled: !!demoWinery?.id,
  });

  useEffect(() => {
    setMessages([{ role: "assistant", content: t.chatWelcome }]);
  }, [lang]);

  const handleExampleClick = (exampleKey) => {
    const mapped = scenarioMap[exampleKey];
    if (mapped) {
      setScenario(mapped);
      setPendingExample(t[exampleKey]);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
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

  const clearPendingExample = () => setPendingExample(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white">
      <DemoHeader lang={lang} setLang={setLang} t={t} />
      <DemoHero t={t} onDemoClick={() => chatRef.current?.scrollIntoView({ behavior: "smooth" })} />

      <section ref={chatRef} className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#2D1B14] mb-4">{t.situationsTitle}</h3>
                <div className="space-y-3">
                  {["example1", "example2", "example3", "example4"].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleExampleClick(key)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-stone-200/60 hover:border-[#722F37]/25 transition-all text-sm font-medium text-[#2D1B14]"
                    >
                      {t[key]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-4 leading-relaxed">{t.situationsHint}</p>
              </div>

              <DemoLeadPanel t={t} leadData={leadData} experiences={experiences} />
            </div>

            <div className="lg:col-span-2">
              <DemoChat
                t={t}
                lang={lang}
                scenario={scenario}
                messages={messages}
                setMessages={setMessages}
                onAgentResponse={handleAgentResponse}
                pendingExample={pendingExample}
                clearPendingExample={clearPendingExample}
                winery={demoWinery}
                experiences={experiences}
              />
            </div>
          </div>
        </div>
      </section>

      <DemoCTA t={t} />
      <DemoFooter t={t} />
    </div>
  );
}