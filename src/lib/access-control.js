import { accessConfig } from "@/config/accessConfig";

function getEmail(user) {
  return (user?.email || user?.user_email || "").toLowerCase();
}

function getDomain(email) {
  return email.includes("@") ? email.split("@")[1] : "";
}

function getUserRole(user) {
  return (user?.role || user?.app_role || "").toLowerCase();
}

export function resolveClientAccess(user) {
  if (!user) return null;
  const email = getEmail(user);
  const domain = getDomain(email);

  const matchedRule = accessConfig.clientRules.find((rule) => {
    const m = rule.match || {};
    return (m.email && m.email.toLowerCase() === email) || (m.domain && m.domain.toLowerCase() === domain);
  });

  const role = getUserRole(user);
  const isAdmin = accessConfig.roles.admin.includes(role);
  const isClientByRole = accessConfig.roles.client.includes(role);

  if (isAdmin) {
    return {
      role: "admin",
      clientName: user?.name || user?.full_name || "Internal Team",
      sector: accessConfig.defaultSector,
      allowedModules: ["overview", "activity", "documents", "next_steps", "timeline"],
      readOnly: false,
    };
  }

  if (matchedRule) return matchedRule;

  if (isClientByRole) {
    return {
      role: "client",
      clientName: user?.name || "Client",
      sector: accessConfig.defaultSector,
      allowedModules: ["overview", "activity"],
      readOnly: true,
    };
  }

  return null;
}

export function canAccessAdmin(user) {
  return resolveClientAccess(user)?.role === "admin";
}

export function canAccessClient(user) {
  const resolved = resolveClientAccess(user);
  return resolved?.role === "client" || resolved?.role === "admin";
}
