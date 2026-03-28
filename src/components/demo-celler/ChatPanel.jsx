import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import ChatBubble from "./ChatBubble.jsx";
import { buildAgentPayload } from "@/lib/agentPayload";
import { postToAgent, toFriendlyMessage } from "@/lib/agentClient";
import { resolveAgentConfig } from "@/lib/agentEndpointResolver";

function getAssistantText(data, fallback) {
  return data?.reply_text || data?.reply || data?.message || fallback;
}


function buildChatErrorMessage(error, fallbackMessage) {
  const base = fallbackMessage || "Error de connexió amb l'assistent.";
  switch (error?.code) {
    case "NETWORK":
      return `${base} (problema de red/CORS).`;
    case "TIMEOUT":
      return `${base} (timeout de backend).`;
    case "BACKEND_4XX":
      return `${base} (backend inválido / petición rechazada).`;
    case "BACKEND_5XX":
      return `${base} (backend caído temporalmente).`;
    default:
      return base;
  }
}

export default function ChatPanel({
  t,
  lang,
  scenario,
  messages,
  setMessages,
  onAgentResponse,
  pendingExample,
  clearPendingExample,
  account,
  experiences,
  settings,
  sector,
  sourceType,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState("");
  const [retryBuffer, setRetryBuffer] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (pendingExample && !loading) {
      sendMessage(pendingExample);
      clearPendingExample();
    }
  }, [pendingExample, loading, clearPendingExample]);

  const appendAssistantMessage = (content) => {
    if (!content) return;
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  const sendMessage = async (text, { isRetry = false } = {}) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const shouldAppendUserMessage = !isRetry;
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const outgoingMessages = shouldAppendUserMessage
      ? [...messages, { role: "user", content: trimmed }]
      : [...messages];

    if (shouldAppendUserMessage) {
      setMessages(outgoingMessages);
      setRetryBuffer(trimmed);
    }

    if (!text || !isRetry) setInput("");
    setLoading(true);
    setLastError("");

    try {
      const payload = buildAgentPayload({
        lang,
        scenario,
        messages: outgoingMessages,
        sector,
        account,
        experiences,
        sourceType,
      });

      const agentConfig = resolveAgentConfig({ settings, account });
      const { data } = await postToAgent({ agentConfig, payload, requestId });

      const assistantText = getAssistantText(data, t?.connectionError || "No he rebut una resposta útil.");
      appendAssistantMessage(assistantText);
      if (onAgentResponse) onAgentResponse(data, [...outgoingMessages, { role: "assistant", content: assistantText }]);
      setRetryBuffer("");
    } catch (error) {
      console.error("Agent request failed", {
        requestId,
        account: account?.slug,
        sector: sector?.id || sector,
        code: error?.code,
        status: error?.status,
        url: error?.url,
        detail: error?.detail,
        message: error?.message,
        stack: error?.stack,
      });
      const fallback = t?.connectionError || "Error de connexió amb l'assistent.";
      const friendly = toFriendlyMessage(error) || fallback;
      setLastError(buildChatErrorMessage(error, friendly));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const accountName = account?.nombre || account?.name || "Demo Account";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-[#FAF7F2] to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2D1B14]">{accountName}</p>
            <p className="text-[11px] text-stone-400">Assistent · IA</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[460px]">
        {messages.map((msg, index) => (
          <ChatBubble key={`${msg.role}-${index}-${msg.content?.slice(0, 24)}`} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{t.typing || "Escrivint..."}</span>
          </div>
        )}
      </div>

      {lastError && retryBuffer && !loading && (
        <div className="px-3 pb-2">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-medium">{lastError}</p>
              <button type="button" className="underline mt-1" onClick={() => sendMessage(retryBuffer, { isRetry: true })}>
                Reintentar último mensaje
              </button>
            </div>
          </div>
        </div>
      )}

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
