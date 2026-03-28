import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportedSectors } from "@/config/sectorPresets";

const defaultData = {
  nombre: "",
  slug: "",
  activa: true,
  demo_publica: false,
  sector: "neutral",
  prioridad_demo: 9999,
  claim: "",
  subtitulo: "",
  tono_marca: "",
  descripcion_corta: "",
  propuesta_valor: "",
  faqs_texto: "",
  reglas_recomendacion: "",
  reglas_objeciones: "",
  cta: "",
  idiomas_disponibles: ["ca", "es", "en"],
  idioma_defecto: "ca",
  prompts_sugeridos: "[]",
  hero_override: "",
  agent_endpoint_override: "",
  agent_token_override: "",
};

export default function WineryForm({ wineryId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    if (wineryId && wineryId !== "new") {
      base44.entities.Winery.filter({ id: wineryId }).then((res) => {
        if (res[0]) {
          const loaded = res[0];
          setData({
            ...defaultData,
            ...loaded,
            prompts_sugeridos: typeof loaded.prompts_sugeridos === "string" ? loaded.prompts_sugeridos : JSON.stringify(loaded.prompts_sugeridos || [], null, 2),
            hero_override: typeof loaded.hero_override === "string" ? loaded.hero_override : JSON.stringify(loaded.hero_override || {}, null, 2),
          });
        }
      });
    }
  }, [wineryId]);

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!data.nombre || !data.slug) {
      toast.error("Nombre y slug son obligatorios");
      return;
    }

    let parsedPrompts = [];
    let parsedHero = null;

    try {
      parsedPrompts = JSON.parse(data.prompts_sugeridos || "[]");
      if (!Array.isArray(parsedPrompts)) throw new Error();
    } catch {
      toast.error("prompts_sugeridos debe ser un JSON array válido");
      return;
    }

    if (data.hero_override?.trim()) {
      try {
        parsedHero = JSON.parse(data.hero_override);
      } catch {
        toast.error("hero_override debe ser JSON válido");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        slug: data.slug.trim().toLowerCase(),
        prompts_sugeridos: JSON.stringify(parsedPrompts),
        hero_override: parsedHero ? JSON.stringify(parsedHero) : "",
      };

      if (wineryId === "new") {
        await base44.entities.Winery.create(payload);
        toast.success("Cuenta demo creada");
      } else {
        await base44.entities.Winery.update(wineryId, payload);
        toast.success("Cuenta demo actualizada");
      }
      navigate("/admin/accounts");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/accounts")}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{wineryId === "new" ? "Nueva cuenta demo" : "Editar cuenta demo"}</h1>
              <p className="text-sm text-slate-500">Configuración de cliente demo multicliente y multisector.</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-[#722F37] hover:bg-[#5C252D]"><Save className="w-4 h-4 mr-2" />Guardar</Button>
        </div>

        <div className="bg-white border rounded-xl p-6 grid sm:grid-cols-2 gap-4">
          <div><Label>Nombre visible *</Label><Input value={data.nombre} onChange={(e) => update("nombre", e.target.value)} /></div>
          <div><Label>Slug público *</Label><Input value={data.slug} onChange={(e) => update("slug", e.target.value)} /></div>
          <div><Label>Sector</Label><Select value={data.sector || "neutral"} onValueChange={(value) => update("sector", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{supportedSectors.map((sectorId) => <SelectItem key={sectorId} value={sectorId}>{sectorId}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prioridad / orden</Label><Input type="number" value={data.prioridad_demo} onChange={(e) => update("prioridad_demo", Number(e.target.value || 9999))} /></div>
          <div className="flex items-center gap-2"><Switch checked={Boolean(data.activa)} onCheckedChange={(v) => update("activa", v)} /><Label>Activa</Label></div>
          <div className="flex items-center gap-2"><Switch checked={Boolean(data.demo_publica)} onCheckedChange={(v) => update("demo_publica", v)} /><Label>Visible en demo pública</Label></div>
        </div>

        <div className="bg-white border rounded-xl p-6 grid sm:grid-cols-2 gap-4">
          <div><Label>Claim</Label><Input value={data.claim || ""} onChange={(e) => update("claim", e.target.value)} /></div>
          <div><Label>Subtítulo</Label><Input value={data.subtitulo || ""} onChange={(e) => update("subtitulo", e.target.value)} /></div>
          <div><Label>CTA</Label><Input value={data.cta || ""} onChange={(e) => update("cta", e.target.value)} /></div>
          <div><Label>Tono de marca</Label><Input value={data.tono_marca || ""} onChange={(e) => update("tono_marca", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Descripción corta</Label><Textarea rows={3} value={data.descripcion_corta || ""} onChange={(e) => update("descripcion_corta", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Propuesta de valor</Label><Textarea rows={3} value={data.propuesta_valor || ""} onChange={(e) => update("propuesta_valor", e.target.value)} /></div>
        </div>

        <div className="bg-white border rounded-xl p-6 grid sm:grid-cols-2 gap-4">
          <div><Label>Idiomas disponibles (csv)</Label><Input value={Array.isArray(data.idiomas_disponibles) ? data.idiomas_disponibles.join(",") : data.idiomas_disponibles || "ca,es,en"} onChange={(e) => update("idiomas_disponibles", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></div>
          <div><Label>Idioma por defecto</Label><Input value={data.idioma_defecto || "ca"} onChange={(e) => update("idioma_defecto", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>FAQs</Label><Textarea rows={6} value={data.faqs_texto || ""} onChange={(e) => update("faqs_texto", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Reglas de recomendación</Label><Textarea rows={4} value={data.reglas_recomendacion || ""} onChange={(e) => update("reglas_recomendacion", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Reglas de objeción</Label><Textarea rows={4} value={data.reglas_objeciones || ""} onChange={(e) => update("reglas_objeciones", e.target.value)} /></div>
        </div>

        <div className="bg-white border rounded-xl p-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Prompts sugeridos (JSON array)</Label><Textarea rows={4} className="font-mono text-xs" value={data.prompts_sugeridos || "[]"} onChange={(e) => update("prompts_sugeridos", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Hero override (JSON opcional)</Label><Textarea rows={4} className="font-mono text-xs" value={data.hero_override || ""} onChange={(e) => update("hero_override", e.target.value)} /></div>
          <div><Label>Endpoint override (opcional)</Label><Input value={data.agent_endpoint_override || ""} onChange={(e) => update("agent_endpoint_override", e.target.value)} placeholder="https://agent..." /></div>
          <div><Label>Token override (opcional)</Label><Input value={data.agent_token_override || ""} onChange={(e) => update("agent_token_override", e.target.value)} placeholder="Bearer token" /></div>
        </div>
      </div>
    </AdminLayout>
  );
}
