import { buildAgentHeaders } from "./agentEndpointResolver.js";

function isTimeoutError(error) {
  const text = `${error?.name || ""} ${error?.message || ""}`.toLowerCase();
  return text.includes("aborterror") || text.includes("timeouterror") || text.includes("timed out");
}

async function parseResponse(response) {
  const raw = await response.text();
  if (!raw) {
    return { json: null, raw: "", contentType: response.headers.get("content-type") || "" };
  }

  try {
    return { json: JSON.parse(raw), raw, contentType: response.headers.get("content-type") || "" };
  } catch {
    return { json: null, raw, contentType: response.headers.get("content-type") || "" };
  }
}

function createTimeoutController(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
  return { controller, timeoutId };
}

function mapAgentError({ code, message, detail, status, url }) {
  const error = new Error(message);
  error.code = code;
  error.detail = detail;
  error.status = status;
  error.url = url;
  return error;
}

function toFriendlyMessage(error) {
  if (error.code === "TIMEOUT") return "La consulta ha tardat massa i s'ha cancel·lat. Reintenta en uns segons.";
  if (error.code === "NETWORK") return "No hem pogut contactar amb l'agent (xarxa/CORS). Revisa endpoint i CORS.";
  if (error.code === "BACKEND_4XX") return "La petició no és vàlida per al backend. Revisa la configuració de la demo.";
  if (error.code === "BACKEND_5XX") return "L'agent ha fallat temporalment. Torna-ho a provar.";
  if (error.code === "NON_JSON") return "L'agent ha respost en un format no compatible (no JSON).";
  return "No s'ha pogut completar la consulta a l'agent.";
}

function resolveFinalErrorCode(codes = []) {
  if (!codes.length) return "UNKNOWN";
  if (codes.includes("BACKEND_4XX")) return "BACKEND_4XX";
  if (codes.includes("BACKEND_5XX")) return "BACKEND_5XX";
  if (codes.includes("TIMEOUT")) return "TIMEOUT";
  if (codes.includes("NETWORK")) return "NETWORK";
  if (codes.includes("NON_JSON")) return "NON_JSON";
  return "UNKNOWN";
}

function formatAttempts(attempts = []) {
  return attempts
    .map((attempt) => {
      const parts = [attempt.url || "unknown-url", attempt.code || "UNKNOWN"];
      if (attempt.status) parts.push(`HTTP ${attempt.status}`);
      if (attempt.message) parts.push(attempt.message);
      if (attempt.detail) parts.push(String(attempt.detail));
      return parts.join(" :: ");
    })
    .join(" | ");
}

export async function postToAgent({ agentConfig, payload, requestId }) {
  if (!agentConfig?.urls?.length) {
    throw mapAgentError({
      code: "CONFIG",
      message: "No hi ha cap endpoint d'agent configurat. Revisa Admin > Settings.",
      detail: "Missing agent endpoint configuration",
    });
  }

  const attempts = [];
  const headers = buildAgentHeaders({ requestId, token: agentConfig.token });

  for (const url of agentConfig.urls) {
    const { controller, timeoutId } = createTimeoutController(agentConfig.timeoutMs || 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const parsed = await parseResponse(response);

      if (!response.ok) {
        const detail = parsed.json?.error || parsed.json?.message || parsed.raw || `HTTP ${response.status}`;
        const code = response.status >= 500 ? "BACKEND_5XX" : "BACKEND_4XX";
        const backendError = mapAgentError({
          code,
          status: response.status,
          url,
          detail,
          message: `${code === "BACKEND_5XX" ? "Error intern" : "Error de validació"} (${response.status})`,
        });

        attempts.push({ code: backendError.code, status: backendError.status, url, detail: backendError.detail, message: backendError.message });
        if (response.status >= 500) continue;
        throw backendError;
      }

      if (!parsed.json) {
        const formatError = mapAgentError({
          code: "NON_JSON",
          status: response.status,
          url,
          detail: parsed.raw?.slice(0, 500),
          message: "Resposta no JSON del backend",
        });
        attempts.push({ code: formatError.code, status: formatError.status, url, detail: formatError.detail, message: formatError.message });
        throw formatError;
      }

      return { data: parsed.json, usedUrl: url };
    } catch (rawError) {
      clearTimeout(timeoutId);
      const message = rawError?.message || "";

      if (isTimeoutError(rawError)) {
        const timeoutError = mapAgentError({ code: "TIMEOUT", url, detail: message, message: "Request timed out" });
        attempts.push({ code: timeoutError.code, url, detail: timeoutError.detail, message: timeoutError.message });
        continue;
      }

      if (message.includes("Failed to fetch") || rawError?.name === "TypeError") {
        const networkError = mapAgentError({ code: "NETWORK", url, detail: message, message: "Failed to fetch" });
        attempts.push({ code: networkError.code, url, detail: networkError.detail, message: networkError.message });
        continue;
      }

      if (rawError?.code) throw rawError;
      attempts.push({ code: "UNKNOWN", url, detail: message, message: "Unknown request error" });
    }
  }

  const finalCode = resolveFinalErrorCode(attempts.map((attempt) => attempt.code));
  throw mapAgentError({
    code: finalCode,
    detail: formatAttempts(attempts),
    message: toFriendlyMessage({ code: finalCode }),
  });
}

export { toFriendlyMessage };
