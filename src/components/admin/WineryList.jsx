import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Search, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "./AdminLayout";

export default function WineryList() {
  const [search, setSearch] = useState("");

  const { data: wineries = [], isLoading } = useQuery({
    queryKey: ["wineries"],
    queryFn: () => base44.entities.Winery.list("-updated_date"),
  });

  const filtered = wineries.filter((w) => `${w.nombre || ""} ${w.slug || ""} ${w.sector || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cuentas demo / clientes</h1>
            <p className="text-sm text-slate-500 mt-1">Gestión multicliente y multisección (compatible con entidad Winery).</p>
          </div>
          <Link to="/admin/business/new">
            <Button className="bg-[#722F37] hover:bg-[#5C252D] shadow-md">
              <Plus className="w-4 h-4 mr-2" />Nova cuenta demo
            </Button>
          </Link>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por nombre, slug o sector..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 shadow-sm" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Carregant...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">{search ? "Cap compte trobada" : "Encara no hi ha cap compte configurada"}</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((winery) => (
              <div key={winery.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{winery.nombre}</h3>
                      {winery.demo_publica && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Demo pública</span>}
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">{winery.sector || "neutral"}</span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Prioridad {winery.prioridad_demo ?? 9999}</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                        {winery.activa ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-medium text-emerald-700">Activa</span></> : <><Circle className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-medium text-slate-500">Inactiva</span></>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 leading-relaxed">{winery.claim || winery.descripcion_corta || winery.slug}</p>
                    <p className="text-xs text-slate-500">Slug público: {winery.slug}</p>
                  </div>
                  <Link to={`/admin/business/${winery.id}`}>
                    <Button variant="outline" size="sm" className="gap-2"><Edit className="w-4 h-4" />Editar</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
