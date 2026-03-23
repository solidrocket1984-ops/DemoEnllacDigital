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
  const [agentUrl, setAgentUrl] = useState("https://enllac-agent.onrender.com/chat");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAgentUrl() {
      try {
        const settings = await base44.entities.AppSettings.list();
        const urlSetting = settings.find((s) => s.key === "agent_endpoint_url");

        let url = (urlSetting?.value || "https://enllac-agent.onrender.com/chat").trim();

        if (!url.endsWith("/chat")) {
          url = url.replace(/\/+$/, "") + "/chat";
        }

        if (!cancelled) {
          setAgentUrl(url);
        }
      } catch (error) {
        console.error("Error cargando agent URL:", error);
      }
    }

    loadAgentUrl();

    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [pendingExample, loading, clearPendingExample]);

  const truncateText = (value, maxLength) => {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getLocalizedValue = (exp, type) => {
    if (type === "title") {
      if (lang === "ca") return exp.nombre_ca || exp.title_ca || exp.nombre_es || exp.title_es || exp.nombre_en || exp.title_en || "";
      if (lang === "es") return exp.nombre_es || exp.title_es || exp.nombre_ca || exp.title_ca || exp.nombre_en || exp.title_en || "";
      return exp.nombre_en || exp.title_en || exp.nombre_es || exp.title_es || exp.nombre_ca || exp.title_ca || "";
    }

    if (lang === "ca") return exp.descripcion_ca || exp.description_ca || exp.descripcion_es || exp.description_es || exp.descripcion_en || exp.description_en || "";
    if (lang === "es") return exp.descripcion_es || exp.description_es || exp.descripcion_ca || exp.description_ca || exp.descripcion_en || exp.description_en || "";
    return exp.descripcion_en || exp.description_en || exp.descripcion_es || exp.description_es || exp.descripcion_ca || exp.description_ca || "";
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    if (!text) setInput("");
    setLoading(true);

    try {
      const payload = {
        language: lang,
        scenario: scenario || "libre",
        winery: {
          name: winery?.nombre || winery?.name || "Oriol Rossell",
          slug: winery?.slug || "demo",
          brand_tone: truncateText(winery?.tono_marca || winery?.brand_tone || "", 300),
          short_description: truncateText(winery?.descripcion_corta || winery?.short_description || "", 600),
          value_proposition: truncateText(winery?.propuesta_valor || winery?.value_proposition || "", 500),
          faqs: truncateText(winery?.faqs_texto || winery?.faqs || "", 1800),
          recommendation_rules: truncateText(winery?.reglas_recomendacion || "", 700),
          objection_rules: truncateText(winery?.reglas_objeciones || "", 700)
        },
        experiences: (experiences || []).map((exp) => ({
          id: exp.experience_id || exp.id,
          title: getLocalizedValue(exp, "title"),
          description: truncateText(getLocalizedValue(exp, "description"), 500),
          price: exp.precio ?? exp.price ?? null,
          currency: exp.moneda || exp.currency || "EUR",
          duration: exp.duracion || exp.duration || null,
          min_people: exp.minimo_personas || exp.min_people || null,
          max_people: exp.maximo_personas || exp.max_people || null
        })),
        lead: { name: "", phone: "", email: "" },
        messages: newMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }))
      };

      console.log("Agent URL:", agentUrl);
      console.log("Payload sent to agent:", payload);

      const res = await fetch(agentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("Response status:", res.status);

      const rawText = await res.text();
      console.log("Raw response:", rawText);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${rawText}`);
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error("La resposta de l'agent no és un JSON vàlid");
      }

      console.log("Agent response data:", data);

      const assistantMsg = {
        role: "assistant",
        content: data.reply_text || "..."
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (onAgentResponse) {
        onAgentResponse(data, [...newMessages, assistantMsg]);
      }
    } catch (error) {
      console.error("Error calling agent:", error);

      let errorMessage =
        t.connectionError || "Hi ha hagut un error de connexió. Torna-ho a provar.";

      if (String(error?.message || "").includes("Failed to fetch")) {
        errorMessage =
          t.connectionError || "No s'ha pogut contactar amb l'assistent. Revisa l'endpoint o torna-ho a provar.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage
        }
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
              {winery?.nombre || winery?.name || "Oriol Rossell"}
            </p>
            <p className="text-[11px] text-stone-400">Assistent · Enllaç Digital</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[460px]"
      >
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