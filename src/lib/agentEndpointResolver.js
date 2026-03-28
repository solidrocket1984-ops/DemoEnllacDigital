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
  const timeoutMs = Number(getSetting(settings, "agent_timeout_ms") || 30000);

  const preferredEndpoint = endpointOverride || globalEndpoint;
  const urls = createCandidateUrls(preferredEndpoint);

  return {
    mode,
    urls: urls.filter(isAbsoluteHttpUrl),
    endpointBase: normalizeBaseUrl(preferredEndpoint),
    token: tokenOverride || sharedToken,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 30000,
  };
}

export function buildAgentHeaders({ requestId, token, includeLegacyRequestHeader = true }) {
  const headers = {
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
  };

  if (includeLegacyRequestHeader) {
    headers["X-Demo-Request-Id"] = requestId; // temporary compatibility
  }

  if (token) {
    headers["X-Agent-Token"] = String(token).trim();
  }

  return headers;
}

export { createCandidateUrls, normalizeBaseUrl };
