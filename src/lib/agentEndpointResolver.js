function normalizeBaseUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function createCandidateUrls(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) return [];

  if (normalized.endsWith("/v1/chat")) {
    return [normalized, normalized.replace(/\/v1\/chat$/, "/chat")];
  }

  if (normalized.endsWith("/chat")) {
    return [normalized.replace(/\/chat$/, "/v1/chat"), normalized];
  }

  return [`${normalized}/v1/chat`, `${normalized}/chat`];
}

function getSetting(settings, key) {
  return settings.find((item) => item.key === key)?.value;
}

export function resolveAgentConfig({ settings = [], account }) {
  const mode = getSetting(settings, "agent_connection_mode") || "remote";
  const sharedToken = getSetting(settings, "agent_shared_token") || "";
  const globalEndpoint = getSetting(settings, "agent_endpoint_url") || "";
  const endpointOverride = account?.agent_endpoint_override || "";
  const tokenOverride = account?.agent_token_override || "";

  const preferredEndpoint = endpointOverride || globalEndpoint;
  const urls = createCandidateUrls(preferredEndpoint);

  return {
    mode,
    urls,
    endpointBase: normalizeBaseUrl(preferredEndpoint),
    token: tokenOverride || sharedToken,
  };
}

function timeoutSignal(timeoutMs = 15000) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(timeoutMs);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function parseResponseBody(response) {
  const rawText = await response.text();
  if (!rawText) return { json: null, rawText: "" };
  try {
    return { json: JSON.parse(rawText), rawText };
  } catch {
    return { json: null, rawText };
  }
}

export async function postToAgent({ agentConfig, payload, requestId }) {
  const headers = { "Content-Type": "application/json", "X-Demo-Request-Id": requestId };
  if (agentConfig.token) headers.Authorization = `Bearer ${agentConfig.token}`;

  if (!agentConfig.urls?.length) {
    throw new Error("No hi ha cap endpoint d'agent configurat. Revisa Admin > Settings.");
  }

  const attempts = [];

  for (const url of agentConfig.urls) {
    if (!isAbsoluteHttpUrl(url)) continue;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: timeoutSignal(18000),
      });

      const parsed = await parseResponseBody(response);

      if (!response.ok) {
        attempts.push(`HTTP ${response.status} @ ${url}`);
        if (response.status >= 500) continue;
        const reason = parsed.json?.message || parsed.rawText || `HTTP ${response.status}`;
        throw new Error(`Error de l'agent (${response.status}): ${reason.slice(0, 240)}`);
      }

      if (!parsed.json) {
        throw new Error("L'agent ha respost en format no JSON.");
      }

      return { data: parsed.json, usedUrl: url };
    } catch (error) {
      attempts.push(`${url}: ${error.message}`);
      const isAbort = error.name === "AbortError";
      if (isAbort) continue;
      if (!String(error.message || "").includes("Failed to fetch")) {
        if (!String(error.message || "").includes("HTTP 5")) {
          throw error;
        }
      }
    }
  }

  throw new Error(`No s'ha pogut contactar amb l'agent. Intents: ${attempts.join(" | ")}`);
}
