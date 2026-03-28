import { BarChart3, Building2, Eye, HelpCircle, LayoutGrid, Settings, Sparkles, Users } from "lucide-react";

export const publicNavigation = [
  { path: "/", label: "Inici" },
  { path: "/demo", label: "Demo" },
  { path: "/sectores/professional_services", label: "Sectors" },
  { path: "/acceso", label: "Accés" },
];

export const adminNavigation = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid, visible: true },
  { path: "/admin/accounts", label: "Comptes", icon: Building2, visible: true },
  { path: "/admin/services", label: "Serveis", icon: Sparkles, visible: true },
  { path: "/admin/faqs", label: "FAQs", icon: HelpCircle, visible: true },
  { path: "/admin/leads", label: "Leads", icon: Users, visible: true },
  { path: "/admin/simulation", label: "Simulació", icon: BarChart3, visible: true },
  { path: "/admin/settings", label: "Settings", icon: Settings, visible: true },
  { path: "/demo", label: "Demo pública", icon: Eye, visible: true },
];

export const clientNavigation = [
  { path: "/cliente", label: "Resum", module: "overview" },
  { path: "/cliente/actividad", label: "Activitat", module: "activity" },
  { path: "/cliente/documentos", label: "Documents", module: "documents" },
  { path: "/cliente/pasos", label: "Pròxims passos", module: "next_steps" },
  { path: "/cliente/timeline", label: "Timeline", module: "timeline" },
];
