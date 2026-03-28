const DEFAULT_LIMIT = 50;

function normalizeLine(value) {
  return String(value || "")
    .replace(/^\s*[-*•·\d\.)\(]+\s*/, "")
    .replace(/^\s*\[[ xX]?\]\s*/, "")
    .trim();
}

function splitText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[;|]+/g, "\n")
    .split("\n")
    .flatMap((line) => line.split(/\s{2,}/g));
}

export function textToList(value, { limit = DEFAULT_LIMIT } = {}) {
  if (Array.isArray(value)) {
    return value
      .map(normalizeLine)
      .filter(Boolean)
      .slice(0, limit);
  }

  if (typeof value !== "string") return [];

  return splitText(value)
    .map(normalizeLine)
    .filter(Boolean)
    .slice(0, limit);
}
