export const accessConfig = {
  defaultSector: "professional_services",
  roles: {
    admin: ["admin", "owner", "internal"],
    client: ["client"],
  },
  demoMode: true,
  clientRules: [
    {
      match: { email: "cliente@empresa.com" },
      role: "client",
      clientName: "Empresa X",
      sector: "professional_services",
      allowedModules: ["overview", "activity", "documents", "next_steps"],
      landing: "/sectores/professional_services",
      readOnly: true,
    },
    {
      match: { domain: "miempresa.com" },
      role: "client",
      clientName: "Mi Empresa",
      sector: "health_wellness",
      allowedModules: ["overview", "timeline"],
      landing: "/sectores/health_wellness",
      readOnly: true,
    },
  ],
};
