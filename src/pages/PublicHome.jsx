import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layouts/PublicLayout";
import { brandConfig } from "@/config/brandConfig";
import { supportedSectors } from "@/config/sectorPresets";

export default function PublicHome() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <p className="text-xs uppercase tracking-wide text-slate-500">{brandConfig.publicCopy.heroKicker}</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 max-w-3xl">{brandConfig.publicCopy.heroTitle}</h1>
        <p className="mt-4 text-slate-600 max-w-2xl">{brandConfig.publicCopy.heroSubtitle}</p>
        <div className="mt-8 flex gap-3">
          <Link to="/demo" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white">{brandConfig.cta.secondary}</Link>
          <Link to="/acceso" className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700">Accedir</Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-4">
        {brandConfig.publicCopy.valueBlocks.map((block) => (
          <article key={block.title} className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-900">{block.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{block.description}</p>
          </article>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold text-slate-900">Sectors disponibles</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {supportedSectors.filter((s) => s !== "neutral").map((sector) => (
            <Link key={sector} to={`/sectores/${sector}`} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700">{sector}</Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
