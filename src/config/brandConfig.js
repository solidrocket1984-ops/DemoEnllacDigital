export const brandConfig = {
  brandName: "Demo IA Studio",
  subtitle: "Acompanyament digital personalitzat",
  claim: "Automatitza converses, leads i seguiment amb una experiència clara i elegant.",
  contactEmail: "hola@demoiastudio.com",
  labels: {
    internalPanel: "Panell intern",
    clientPortal: "Portal client",
    publicDemo: "Demo pública",
  },
  cta: {
    primary: "Sol·licitar demo guiada",
    secondary: "Veure demo interactiva",
  },
  colors: {
    accent: "#6B2D3A",
    accentSoft: "#8F4A59",
    gradientFrom: "#F8F5F2",
    gradientTo: "#EEF2F7",
    textStrong: "#1F2937",
  },
  publicCopy: {
    heroKicker: "Agent IA multivertical",
    heroTitle: "Una demo privada preparada per a sectors reals",
    heroSubtitle:
      "Mostra com seria el teu assistent amb un entorn públic professional, un portal client clar i un backoffice escalable.",
    valueBlocks: [
      {
        title: "Part pública usable",
        description: "Landing, sectorials i demo interactiva amb narrativa comercial.",
      },
      {
        title: "Portal client diferenciat",
        description: "Seguiment d'estat, activitat i pròxims passos amb llenguatge no tècnic.",
      },
      {
        title: "Operació interna robusta",
        description: "Mòduls administratius reutilitzables i configuració centralitzada.",
      },
    ],
  },
  emptyState: {
    businesses: "Encara no hi ha cap compte de negoci configurat.",
    services: "No hi ha serveis publicats per aquest perfil.",
  },
  clientAreaCopy: {
    welcomeTitle: "Seguiment del teu projecte",
    welcomeText:
      "Aquí veuràs l'estat actual, els últims avenços i els pròxims passos acordats amb l'equip.",
    faqTitle: "Notes útils",
  },
  demoChat: {
    sectionLabel: "Demo en viu · Conversa real",
    sectionSubtitle:
      "Escull un exemple o escriu en obert. L'agent respon segons el context sectorial seleccionat.",
    leadPanelTitle: "Dades de seguiment detectades",
  },
};

export function getBrandGradient() {
  return `linear-gradient(135deg, ${brandConfig.colors.gradientFrom}, ${brandConfig.colors.gradientTo})`;
}
