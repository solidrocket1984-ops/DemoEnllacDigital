import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2, Circle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminExperiences() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedWineryId, setSelectedWineryId] = useState(null);
  const [editingExp, setEditingExp] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: wineries = [] } = useQuery({
    queryKey: ["wineries"],
    queryFn: () => base44.entities.Winery.list(),
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["experiences", selectedWineryId],
    queryFn: () => selectedWineryId ? base44.entities.Experience.filter({ winery_id: selectedWineryId }) : Promise.resolve([]),
    enabled: !!selectedWineryId,
  });

  React.useEffect(() => {
    if (wineries.length > 0 && !selectedWineryId) {
      const demoWinery = wineries.find((w) => w.demo_publica) || wineries[0];
      setSelectedWineryId(demoWinery?.id);
    }
  }, [wineries, selectedWineryId]);

  const filtered = experiences.filter((e) =>
    e.nombre_ca?.toLowerCase().includes(search.toLowerCase()) ||
    e.nombre_es?.toLowerCase().includes(search.toLowerCase()) ||
    e.nombre_en?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedWinery = wineries.find((w) => w.id === selectedWineryId);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Experience.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setDialogOpen(false);
      setEditingExp(null);
      toast.success("Servei creada");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Experience.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setDialogOpen(false);
      setEditingExp(null);
      toast.success("Servei actualitzada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Experience.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Servei eliminada");
    },
  });

  const handleNew = () => {
    setEditingExp({
      winery_id: selectedWineryId,
      experience_id: `exp_${Date.now()}`,
      activa: true,
      nombre_ca: "",
      nombre_es: "",
      nombre_en: "",
      descripcion_ca: "",
      descripcion_es: "",
      descripcion_en: "",
      precio: 0,
      moneda: "EUR",
      duracion: "",
      minimo_personas: 1,
      maximo_personas: 10,
      ideal_para: "",
      incluye: "",
      idiomas_disponibles: ["ca", "es", "en"],
      apta_regalo: false,
      apta_grupos: false,
      familiar: false,
      prioridad: 0,
    });
    setDialogOpen(true);
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingExp.nombre_ca) {
      toast.error("El nom en català és obligatori");
      return;
    }
    if (editingExp.id) {
      updateMutation.mutate({ id: editingExp.id, data: editingExp });
    } else {
      createMutation.mutate(editingExp);
    }
  };

  const update = (field, value) => setEditingExp((prev) => ({ ...prev, [field]: value }));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Serveis</h1>
            <p className="text-sm text-slate-500 mt-1">Gestiona les serveis de cada compte</p>
          </div>
          <Button onClick={handleNew} disabled={!selectedWineryId} className="bg-[#722F37] hover:bg-[#5C252D] shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Nova experiència
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Compte</Label>
            <Select value={selectedWineryId || ""} onValueChange={setSelectedWineryId}>
              <SelectTrigger className="w-full sm:w-auto min-w-[250px]">
                <SelectValue placeholder="Selecciona un compte" />
              </SelectTrigger>
              <SelectContent>
                {wineries.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar experiència..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 shadow-sm"
            />
          </div>
        </div>

        {!selectedWineryId ? (
          <div className="text-center py-12 text-slate-500">Selecciona un compte per veure les seves serveis</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {search ? "Cap experiència trobada" : "Encara no hi ha serveis. Crea la primera!"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((exp) => (
              <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{exp.nombre_ca || exp.nombre_es || exp.nombre_en}</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                        {exp.activa ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Activa</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">Inactiva</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{exp.descripcion_ca || exp.descripcion_es || exp.descripcion_en}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {exp.precio} {exp.moneda || "EUR"}
                      </span>
                      {exp.duracion && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {exp.duracion}
                        </span>
                      )}
                      {exp.minimo_personas && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {exp.minimo_personas}-{exp.maximo_personas} persones
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(exp)} variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm("Segur que vols eliminar aquesta experiència?")) {
                          deleteMutation.mutate(exp.id);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExp?.id ? "Editar experiència" : "Nova experiència"}</DialogTitle>
            </DialogHeader>

            {editingExp && (
              <div className="space-y-5 mt-4">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                  <Switch checked={editingExp.activa} onCheckedChange={(v) => update("activa", v)} id="activa" />
                  <Label htmlFor="activa" className="cursor-pointer font-medium">Servei activa</Label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Noms</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs mb-1 block">Nom en català *</Label>
                      <Input value={editingExp.nombre_ca} onChange={(e) => update("nombre_ca", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Nom en castellà</Label>
                      <Input value={editingExp.nombre_es} onChange={(e) => update("nombre_es", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Nom en anglès</Label>
                      <Input value={editingExp.nombre_en} onChange={(e) => update("nombre_en", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Descripcions</h4>
                  <div>
                    <Label className="text-xs mb-1 block">Descripció en català</Label>
                    <Textarea rows={3} value={editingExp.descripcion_ca} onChange={(e) => update("descripcion_ca", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Descripció en castellà</Label>
                    <Textarea rows={3} value={editingExp.descripcion_es} onChange={(e) => update("descripcion_es", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Descripció en anglès</Label>
                    <Textarea rows={3} value={editingExp.descripcion_en} onChange={(e) => update("descripcion_en", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block">Preu</Label>
                    <Input type="number" value={editingExp.precio} onChange={(e) => update("precio", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Moneda</Label>
                    <Input value={editingExp.moneda} onChange={(e) => update("moneda", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Durada</Label>
                    <Input value={editingExp.duracion} onChange={(e) => update("duracion", e.target.value)} placeholder="Ex: 2h" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block">Mínim de persones</Label>
                    <Input type="number" value={editingExp.minimo_personas} onChange={(e) => update("minimo_personas", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Màxim de persones</Label>
                    <Input type="number" value={editingExp.maximo_personas} onChange={(e) => update("maximo_personas", parseInt(e.target.value) || 10)} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Ideal per a</Label>
                  <Input value={editingExp.ideal_para} onChange={(e) => update("ideal_para", e.target.value)} placeholder="Ex: Parelles, grups..." />
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Què inclou</Label>
                  <Textarea rows={3} value={editingExp.incluye} onChange={(e) => update("incluye", e.target.value)} placeholder="Detalla què inclou l'experiència" />
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Prioritat comercial (0-100)</Label>
                  <Input type="number" value={editingExp.prioridad} onChange={(e) => update("prioridad", parseInt(e.target.value) || 0)} />
                </div>

                <div className="space-y-3 p-4 bg-stone-50 rounded-lg">
                  <h4 className="font-semibold text-slate-700 text-sm">Característiques</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={editingExp.apta_regalo} onCheckedChange={(v) => update("apta_regalo", v)} id="regalo" />
                      <Label htmlFor="regalo" className="cursor-pointer text-sm">Apta per regal</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editingExp.apta_grupos} onCheckedChange={(v) => update("apta_grupos", v)} id="grupos" />
                      <Label htmlFor="grupos" className="cursor-pointer text-sm">Apta per grups</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editingExp.familiar} onCheckedChange={(v) => update("familiar", v)} id="familiar" />
                      <Label htmlFor="familiar" className="cursor-pointer text-sm">Familiar</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel·lar</Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#722F37] hover:bg-[#5C252D]">
                    {createMutation.isPending || updateMutation.isPending ? "Guardant..." : "Guardar"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}