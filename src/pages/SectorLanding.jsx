import React from "react";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "@/components/layouts/PublicLayout";
import { resolveSector } from "@/lib/sector";

export default function SectorLanding() {
  const { sector: routeSector } = useParams();
  const sector = resolveSector({ routeSector });
  const Icon = sector.icon;

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"><Icon className="w-3.5 h-3.5" />{sector.name}</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{sector.heroTitle}</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">{sector.heroSubtitle}</p>
        <div className="mt-6 flex gap-3">
          <Link to={`/demo/${sector.id}`} className="px-4 py-2 rounded-xl bg-slate-900 text-white">{sector.cta}</Link>
          <Link to="/acceso" className="px-4 py-2 rounded-xl border border-slate-300">Accés client</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
