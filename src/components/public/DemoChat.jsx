import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import ChatBubble from "../demo-celler/ChatBubble.jsx";

export default function DemoChat({ t, lang, scenario, messages, setMessages, onAgentResponse, pendingExample, clearPendingExample, winery, experiences }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (pendingExample && !loading) {
      sendMessage(pendingExample);
      clearPendingExample();
    }
  }, [pendingExample]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!text) setInput("");
    setLoading(true);

    try {
      const settings = await base44.entities.AppSettings.list();
      const urlSetting = settings.find((s) => s.key === "agent_endpoint_url");
      const agentUrl = urlSetting?.value || "https://enllac-agent.onrender.com/";

      const payload = {
        language: lang,
        scenario: scenario || "libre",
        winery: {
          name: winery?.nombre || "Celler Demo",
          slug: winery?.slug || "demo",
          brand_tone: winery?.tono_marca || "",
          brief_history: winery?.historia_breve || "",
          short_description: winery?.descripcion_corta || "",
          value_proposition: winery?.propuesta_valor || "",
          faqs: winery?.faqs_texto || "",
          recommendation_rules: winery?.reglas_recomendacion || "",
          objection_rules: winery?.reglas_objeciones || "",
        },
        experiences: (experiences || []).map((exp) => ({
          id: exp.experience_id,
          title_ca: exp.nombre_ca,
          title_es: exp.nombre_es,
          title_en: exp.nombre_en,
          description_ca: exp.descripcion_ca,
          description_es: exp.descripcion_es,
          description_en: exp.descripcion_en,
          price: exp.precio,
          currency: exp.moneda || "EUR",
          duration: exp.duracion,
          min_people: exp.minimo_personas,
          max_people: exp.maximo_personas,
        })),
        lead: { name: "", phone: "", email: "" },
        messages: newMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
      };

      const res = await fetch(agentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.reply_text || "..." };
      setMessages((prev) => [...prev, assistantMsg]);
      if (onAgentResponse) onAgentResponse(data);
    } catch (error) {
      console.error("Error calling agent:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ho sentim, hi ha hagut un error de connexió. Torna-ho a provar." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">ED</span>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-[#2D1B14]">{winery?.nombre || "Celler Demo"}</p>
            <p className="text-xs text-stone-500">Assistent intel·ligent</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">En línia</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[450px] max-h-[550px] bg-gradient-to-b from-white to-[#FDFCFA]">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-sm pl-9">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Escrivint...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-stone-100 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-5 py-3 text-sm text-[#2D1B14] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-[#722F37] text-white flex items-center justify-center hover:bg-[#5C252D] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}