import React, { useState, useRef, useCallback } from "react";
import { translations, scenarioMap } from "../components/demo-celler/translations";
import DemoHeader from "../components/demo-celler/DemoHeader";
import HeroSection from "../components/demo-celler/HeroSection";
import FeaturesSection from "../components/demo-celler/FeaturesSection";
import ExamplesPanel from "../components/demo-celler/ExamplesPanel";
import ChatPanel from "../components/demo-celler/ChatPanel";
import LeadPanel from "../components/demo-celler/LeadPanel";
import ContactForm from "../components/demo-celler/ContactForm";
import DemoFooter from "../components/demo-celler/DemoFooter";
import MobileBar from "../components/demo-celler/MobileBar";

export default function DemoCeller() {
  const [lang, setLang] = useState("ca");
  const [scenario, setScenario] = useState("libre");
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState({});
  const demoRef = useRef(null);
  const chatPanelRef = useRef(null);

  const t = translations[lang];

  // Initialize welcome message when language changes or on first load
  const getInitialMessages = useCallback(
    (newLang) => [{ role: "assistant", content: translations[newLang || lang].chatWelcome }],
    [lang]
  );

  // Reset chat when language changes
  const handleLangChange = (newLang) => {
    setLang(newLang);
    setMessages(getInitialMessages(newLang));
    setLeadData({});
    setScenario("libre");
  };

  // Initialize on first render
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages(getInitialMessages(lang));
    }
  }, []);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExampleClick = (exampleKey) => {
    const msgKey = exampleKey + "Msg";
    const message = t[msgKey];
    setScenario(scenarioMap[exampleKey] || "libre");
    
    // Send the message directly
    const userMsg = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    
    // Trigger send via chatPanel - we'll send it directly here
    sendToAgent(message, scenarioMap[exampleKey] || "libre", [...messages, userMsg]);
    
    scrollToDemo();
  };

  const sendToAgent = async (text, sc, allMessages) => {
    const payload = {
      language: lang,
      scenario: sc || scenario,
      winery: { name: "Celler Demo" },
      experiences: [
        {
          id: "exp_1",
          title_ca: "Tast amb maridatge",
          title_es: "Cata con maridaje",
          title_en: "Wine tasting with pairing",
          price: 42,
        },
      ],
      lead: { name: "", phone: "", email: "" },
      messages: allMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content })),
    };

    try {
      const res = await fetch("https://enllac-agent.onrender.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply_text || "..." },
      ]);
      handleAgentResponse(data);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ho sentim, hi ha hagut un error de connexió. Torna-ho a provar." },
      ]);
    }
  };

  const handleAgentResponse = (data) => {
    setLeadData((prev) => ({
      ...prev,
      language: data.language || lang,
      detected_intent: data.detected_intent || prev.detected_intent,
      people_count: data.people_count || prev.people_count,
      recommended_experience_id: data.recommended_experience_id || prev.recommended_experience_id,
      objection_detected: data.objection_detected || prev.objection_detected,
      lead_stage: data.lead_stage || prev.lead_stage,
      next_step: data.next_step || prev.next_step,
      ask_for_contact: data.ask_for_contact || prev.ask_for_contact,
      conversation_summary: data.conversation_summary || prev.conversation_summary,
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 sm:pb-0">
      <DemoHeader lang={lang} setLang={handleLangChange} t={t} />
      <HeroSection t={t} onDemoClick={scrollToDemo} />
      <FeaturesSection t={t} />

      {/* Demo Section */}
      <section ref={demoRef} className="py-16 sm:py-20 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Examples */}
            <div className="lg:col-span-3">
              <ExamplesPanel t={t} onExampleClick={handleExampleClick} />
            </div>

            {/* Center: Chat */}
            <div className="lg:col-span-5">
              <ChatPanel
                ref={chatPanelRef}
                t={t}
                lang={lang}
                scenario={scenario}
                messages={messages}
                setMessages={setMessages}
                onAgentResponse={handleAgentResponse}
              />
            </div>

            {/* Right: Lead Panel */}
            <div className="lg:col-span-4">
              <LeadPanel t={t} leadData={leadData} />
            </div>
          </div>
        </div>
      </section>

      <ContactForm t={t} />
      <DemoFooter t={t} />
      <MobileBar t={t} onDemoClick={scrollToDemo} />
    </div>
  );
}