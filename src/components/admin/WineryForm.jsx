import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function WineryForm({ wineryId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    nombre: "",
    slug: "",
    activa: true,
    demo_publica: false,
    telefono: "",
    email: "",
    web: "",
    whatsapp: "",
    instagram: "",
    idioma_defecto: "ca",
    idiomas_disponibles: ["ca", "es", "en"],
    historia_breve: "",
    descripcion_corta: "",
    tono_marca: "",
    estilo_respuesta: "",
    publico_ideal: "",
    tipo_experiencia_principal: "",
    propuesta_valor: "",
    horarios: "",
    politica_reservas: "",
    politica_cancelacion: "",
    parking: "",
    accesibilidad: "",
    politica_ninos: "",
    politica_mascotas: "",
    como_llegar: "",
    temporadas_especiales: "",
    acepta_eventos_privados: false,
    acepta_regalos: false,
    acepta_grupos: false,
    acepta_empresas: false,
    faqs_texto: "",
    reglas_recomendacion: "",
    reglas_objeciones: "",
    cuando_pedir_contacto: "",
    cuando_cerrar_reserva: "",
    que_evitar: "",
    como_sonar: "",
    que_destacar_primero: "",
    que_hacer_sin_info: "",
    historia_ampliada: "",
    detalles_producto: "",
    notas_internas: "",
    argumentos_venta: "",
    objeciones_frecuentes: "",
    info_campanas: "",
    info_maridajes: "",
    info_tienda: "",
  });

  useEffect(() => {
    if (wineryId && wineryId !== "new") {
      base44.entities.Winery.filter({ id: wineryId }).then((res) => {
        if (res[0]) setData(res[0]);
      });
    }
  }, [wineryId]);

  const handleSave = async () => {
    if (!data.nombre || !data.slug) {
      toast.error("Nom i slug són obligatoris");
      return;
    }
    setLoading(true);
    try {
      if (wineryId === "new") {
        await base44.entities.Winery.create(data);
        toast.success("Bodega creada");
      } else {
        await base44.entities.Winery.update(wineryId, data);
        toast.success("Bodega actualitzada");
      }
      navigate("/admin/wineries");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/wineries")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {wineryId === "new" ? "Nova bodega" : "Editar bodega"}
            </h1>
            <p className="text-sm text-slate-500">Configura les dades per personalitzar l'assistent</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-[#722F37] hover:bg-[#5C252D]">
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="marca">Marca</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="experiencies">Experiències</TabsTrigger>
          <TabsTrigger value="regles">Regles IA</TabsTrigger>
          <TabsTrigger value="coneixement">Coneixement</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de la bodega *</Label>
                <Input value={data.nombre} onChange={(e) => update("nombre", e.target.value)} />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={data.slug} onChange={(e) => update("slug", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={data.activa} onCheckedChange={(v) => update("activa", v)} />
                <Label>Activa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.demo_publica} onCheckedChange={(v) => update("demo_publica", v)} />
                <Label>Usar en demo pública</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telèfon</Label>
                <Input value={data.telefono} onChange={(e) => update("telefono", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={data.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <Label>Web</Label>
                <Input value={data.web} onChange={(e) => update("web", e.target.value)} />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marca" className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <Label>Història breu</Label>
              <Textarea rows={3} value={data.historia_breve} onChange={(e) => update("historia_breve", e.target.value)} />
            </div>
            <div>
              <Label>Descripció curta comercial</Label>
              <Textarea rows={2} value={data.descripcion_corta} onChange={(e) => update("descripcion_corta", e.target.value)} />
            </div>
            <div>
              <Label>To de marca</Label>
              <Input value={data.tono_marca} onChange={(e) => update("tono_marca", e.target.value)} />
            </div>
            <div>
              <Label>Estil de resposta de l'assistent</Label>
              <Input value={data.estilo_respuesta} onChange={(e) => update("estilo_respuesta", e.target.value)} />
            </div>
            <div>
              <Label>Públic ideal</Label>
              <Input value={data.publico_ideal} onChange={(e) => update("publico_ideal", e.target.value)} />
            </div>
            <div>
              <Label>Proposta de valor</Label>
              <Textarea rows={2} value={data.propuesta_valor} onChange={(e) => update("propuesta_valor", e.target.value)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comercial" className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <Label>Horaris</Label>
              <Textarea rows={2} value={data.horarios} onChange={(e) => update("horarios", e.target.value)} />
            </div>
            <div>
              <Label>Política de reserves</Label>
              <Textarea rows={2} value={data.politica_reservas} onChange={(e) => update("politica_reservas", e.target.value)} />
            </div>
            <div>
              <Label>Política de cancel·lació</Label>
              <Textarea rows={2} value={data.politica_cancelacion} onChange={(e) => update("politica_cancelacion", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Parking</Label>
                <Input value={data.parking} onChange={(e) => update("parking", e.target.value)} />
              </div>
              <div>
                <Label>Accessibilitat</Label>
                <Input value={data.accesibilidad} onChange={(e) => update("accesibilidad", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={data.acepta_eventos_privados} onCheckedChange={(v) => update("acepta_eventos_privados", v)} />
                <Label>Events privats</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.acepta_regalos} onCheckedChange={(v) => update("acepta_regalos", v)} />
                <Label>Regals</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.acepta_grupos} onCheckedChange={(v) => update("acepta_grupos", v)} />
                <Label>Grups</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.acepta_empresas} onCheckedChange={(v) => update("acepta_empresas", v)} />
                <Label>Empreses</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <div className="bg-white border rounded-xl p-6">
            <Label>FAQs (text lliure)</Label>
            <Textarea rows={12} value={data.faqs_texto} onChange={(e) => update("faqs_texto", e.target.value)} placeholder="Enganxa aquí les FAQs en text lliure..." />
          </div>
        </TabsContent>

        <TabsContent value="experiencies" className="space-y-4">
          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm text-slate-600">Les experiències es gestionen a la secció independent "Experiències"</p>
          </div>
        </TabsContent>

        <TabsContent value="regles" className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <Label>Com recomanar experiències</Label>
              <Textarea rows={3} value={data.reglas_recomendacion} onChange={(e) => update("reglas_recomendacion", e.target.value)} />
            </div>
            <div>
              <Label>Com resoldre objeccions</Label>
              <Textarea rows={3} value={data.reglas_objeciones} onChange={(e) => update("reglas_objeciones", e.target.value)} />
            </div>
            <div>
              <Label>Quan demanar dades de contacte</Label>
              <Textarea rows={2} value={data.cuando_pedir_contacto} onChange={(e) => update("cuando_pedir_contacto", e.target.value)} />
            </div>
            <div>
              <Label>Quan intentar tancar reserva</Label>
              <Textarea rows={2} value={data.cuando_cerrar_reserva} onChange={(e) => update("cuando_cerrar_reserva", e.target.value)} />
            </div>
            <div>
              <Label>Què evitar dir</Label>
              <Textarea rows={2} value={data.que_evitar} onChange={(e) => update("que_evitar", e.target.value)} />
            </div>
            <div>
              <Label>Com ha de sonar l'assistent</Label>
              <Textarea rows={2} value={data.como_sonar} onChange={(e) => update("como_sonar", e.target.value)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coneixement" className="space-y-4">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <Label>Història ampliada</Label>
              <Textarea rows={4} value={data.historia_ampliada} onChange={(e) => update("historia_ampliada", e.target.value)} />
            </div>
            <div>
              <Label>Detalls de producte</Label>
              <Textarea rows={4} value={data.detalles_producto} onChange={(e) => update("detalles_producto", e.target.value)} />
            </div>
            <div>
              <Label>Arguments de venda</Label>
              <Textarea rows={3} value={data.argumentos_venta} onChange={(e) => update("argumentos_venta", e.target.value)} />
            </div>
            <div>
              <Label>Objeccions freqüents i resposta</Label>
              <Textarea rows={3} value={data.objeciones_frecuentes} onChange={(e) => update("objeciones_frecuentes", e.target.value)} />
            </div>
            <div>
              <Label>Informació de maridatges</Label>
              <Textarea rows={3} value={data.info_maridajes} onChange={(e) => update("info_maridajes", e.target.value)} />
            </div>
            <div>
              <Label>Informació de botiga / vins</Label>
              <Textarea rows={3} value={data.info_tienda} onChange={(e) => update("info_tienda", e.target.value)} />
            </div>
            <div>
              <Label>Notes internes</Label>
              <Textarea rows={3} value={data.notas_internas} onChange={(e) => update("notas_internas", e.target.value)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}