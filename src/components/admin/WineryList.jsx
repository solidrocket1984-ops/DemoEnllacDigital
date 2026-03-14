import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Search, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WineryList() {
  const [search, setSearch] = useState("");
  
  const { data: wineries = [], isLoading } = useQuery({
    queryKey: ["wineries"],
    queryFn: () => base44.entities.Winery.list("-updated_date"),
  });

  const filtered = wineries.filter((w) =>
    w.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestió de cellers</h1>
          <p className="text-sm text-slate-500 mt-1">Configura les dades de cada bodega per personalitzar l'assistent</p>
        </div>
        <Link to="/admin/winery/new">
          <Button className="bg-[#722F37] hover:bg-[#5C252D]">
            <Plus className="w-4 h-4 mr-2" />
            Nova bodega
          </Button>
        </Link>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar bodega..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregant...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? "Cap bodega trobada" : "Encara no hi ha cap bodega configurada"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((winery) => (
            <div
              key={winery.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{winery.nombre}</h3>
                    {winery.demo_publica && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                        Demo pública
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      {winery.activa ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Activa</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Inactiva</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{winery.descripcion_corta || winery.slug}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {winery.email && <span>✉ {winery.email}</span>}
                    {winery.telefono && <span>📞 {winery.telefono}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/admin/winery/${winery.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Link to={`/admin/winery/${winery.id}/test`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Provar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}