import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ClientLayout from "@/components/layouts/ClientLayout";
import { brandConfig } from "@/config/brandConfig";
import { useAuth } from "@/lib/AuthContext";
import { resolveClientAccess } from "@/lib/access-control";

function Panel({ title, text }) {
  return <div className="bg-white border border-slate-200 rounded-2xl p-5"><h2 className="font-semibold text-slate-900">{title}</h2><p className="text-sm text-slate-600 mt-2">{text}</p></div>;
}

function ClientHome({ access }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Panel title={`${brandConfig.clientAreaCopy.welcomeTitle} · ${access.clientName || "Client"}`} text={brandConfig.clientAreaCopy.welcomeText} />
      <Panel title="Estat actual" text="Fase de desplegament actiu amb revisions setmanals i control de qualitat." />
      <Panel title="Avanços recents" text="Automatització de respostes, captació de leads i configuració sectorial completades." />
      <Panel title="Pròxims passos" text="Validació final de fluxos i publicació del pla d'accions següent." />
    </div>
  );
}

export default function ClientPortal() {
  const { user } = useAuth();
  const access = resolveClientAccess(user);
  const modules = access?.allowedModules || ["overview"];

  return (
    <ClientLayout allowedModules={modules}>
      <Routes>
        <Route index element={<ClientHome access={access || {}} />} />
        <Route path="actividad" element={<Panel title="Activitat recent" text="Resum d'interaccions i seguiment de punts oberts." />} />
        <Route path="documentos" element={<Panel title="Documents i propostes" text="Comparteix materials validats i versions de treball." />} />
        <Route path="pasos" element={<Panel title="Pròxims passos" text="Tasques planificades, responsables i dates orientatives." />} />
        <Route path="timeline" element={<Panel title="Timeline" text="Vista temporal del projecte i milestones principals." />} />
        <Route path="*" element={<Navigate to="/cliente" replace />} />
      </Routes>
    </ClientLayout>
  );
}
