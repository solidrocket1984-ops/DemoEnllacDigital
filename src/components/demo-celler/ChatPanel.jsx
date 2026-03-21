import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import ChatBubble from "./ChatBubble.jsx";

export default function ChatPanel({
  t,
  lang,
  scenario,
  messages,
  setMessages,
  onAgentResponse,
  pendingExample,
  clearPendingExample,
  winery,
  experiences
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

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
      const agentUrl = urlSetting?.value || "https://enllac-agent.onrender.com/chat";

      const payload = {
        language: lang,
        scenario: scenario || "libre",
        winery: {
          name: winery?.nombre || winery?.name || "Celler Demo",
          slug: winery?.slug || "demo",
          brand_tone: winery?.tono_marca || winery?.brand_tone || "",
          brief_history: winery?.historia_breve || winery?.brief_history || "",
          short_description: winery?.descripcion_corta || winery?.short_description || "",
          value_proposition: winery?.propuesta_valor || winery?.value_proposition || "",
          faqs: winery?.faqs_texto || winery?.faqs || "",
          recommendation_rules: winery?.reglas_recomendacion || "",
          objection_rules: winery?.reglas_objeciones || "",
        },
        experiences: (experiences || []).map((exp) => ({
          id: exp.experience_id || exp.id,
          title_ca: exp.nombre_ca || exp.title_ca,
          title_es: exp.nombre_es || exp.title_es,
          title_en: exp.nombre_en || exp.title_en,
          description_ca: exp.descripcion_ca || exp.description_ca,
          description_es: exp.descripcion_es || exp.description_es,
          description_en: exp.descripcion_en || exp.description_en,
          price: exp.precio || exp.price,
          currency: exp.moneda || exp.currency || "EUR",
          duration: exp.duracion || exp.duration,
          min_people: exp.minimo_personas || exp.min_people,
          max_people: exp.maximo_personas || exp.max_people,
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

      if (onAgentResponse) {
        onAgentResponse(data);
      }
    } catch (error) {
      console.error("Error calling agent:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t.connectionError || "Hi ha hagut un error de connexió. Torna-ho a provar."
        },
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">ED</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2D1B14]">
              {winery?.nombre || winery?.name || "Celler Demo"}
            </p>
            <p className="text-[11px] text-stone-400">Assistent · Enllaç Digital</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[460px]">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{t.typing || "Escrivint..."}</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-stone-100 bg-[#FDFCFA]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-[#2D1B14] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[#722F37] text-white flex items-center justify-center hover:bg-[#5C252D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}