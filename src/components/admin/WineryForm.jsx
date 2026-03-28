import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";

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
      navigate("/admin/accounts");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/accounts")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {wineryId === "new" ? "Nova compte" : "Editar compte"}
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
        <TabsList className="w-full mb-6 h-auto flex-wrap gap-2 bg-white border border-stone-200 p-2 rounded-xl shadow-sm">
          <TabsTrigger value="general" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="marca" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">Marca</TabsTrigger>
          <TabsTrigger value="comercial" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">Comercial</TabsTrigger>
          <TabsTrigger value="faqs" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">FAQs</TabsTrigger>
          <TabsTrigger value="experiencies" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">Serveis</TabsTrigger>
          <TabsTrigger value="regles" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">Regles IA</TabsTrigger>
          <TabsTrigger value="coneixement" className="flex-1 min-w-[100px] data-[state=active]:bg-[#722F37] data-[state=active]:text-white">Coneixement</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Nom de la compte *</Label>
                <Input value={data.nombre} onChange={(e) => update("nombre", e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Slug *</Label>
                <Input value={data.slug} onChange={(e) => update("slug", e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex items-center gap-2">
                <Switch checked={data.activa} onCheckedChange={(v) => update("activa", v)} id="activa" />
                <Label htmlFor="activa" className="text-sm font-medium cursor-pointer">Activa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.demo_publica} onCheckedChange={(v) => update("demo_publica", v)} id="demo" />
                <Label htmlFor="demo" className="text-sm font-medium cursor-pointer">Usar en demo pública</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Telèfon</Label>
                <Input value={data.telefono} onChange={(e) => update("telefono", e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Email</Label>
                <Input value={data.email} onChange={(e) => update("email", e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Web</Label>
                <Input value={data.web} onChange={(e) => update("web", e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">WhatsApp</Label>
                <Input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="h-11" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marca" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Història breu</Label>
              <Textarea rows={4} value={data.historia_breve} onChange={(e) => update("historia_breve", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Descripció curta comercial</Label>
              <Textarea rows={3} value={data.descripcion_corta} onChange={(e) => update("descripcion_corta", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">To de marca</Label>
              <Input value={data.tono_marca} onChange={(e) => update("tono_marca", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Estil de resposta de l'assistent</Label>
              <Input value={data.estilo_respuesta} onChange={(e) => update("estilo_respuesta", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Públic ideal</Label>
              <Input value={data.publico_ideal} onChange={(e) => update("publico_ideal", e.target.value)} className="h-11" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Proposta de valor</Label>
              <Textarea rows={3} value={data.propuesta_valor} onChange={(e) => update("propuesta_valor", e.target.value)} className="resize-none" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comercial" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Horaris</Label>
              <Textarea rows={3} value={data.horarios} onChange={(e) => update("horarios", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Política de reserves</Label>
              <Textarea rows={3} value={data.politica_reservas} onChange={(e) => update("politica_reservas", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Política de cancel·lació</Label>
              <Textarea rows={3} value={data.politica_cancelacion} onChange={(e) => update("politica_cancelacion", e.target.value)} className="resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Parking</Label>
                <Input value={data.parking} onChange={(e) => update("parking", e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Accessibilitat</Label>
                <Input value={data.accesibilidad} onChange={(e) => update("accesibilidad", e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Serveis disponibles</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={data.acepta_eventos_privados} onCheckedChange={(v) => update("acepta_eventos_privados", v)} id="eventos" />
                  <Label htmlFor="eventos" className="text-sm font-medium cursor-pointer">Events privats</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={data.acepta_regalos} onCheckedChange={(v) => update("acepta_regalos", v)} id="regalos" />
                  <Label htmlFor="regalos" className="text-sm font-medium cursor-pointer">Regals</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={data.acepta_grupos} onCheckedChange={(v) => update("acepta_grupos", v)} id="grupos" />
                  <Label htmlFor="grupos" className="text-sm font-medium cursor-pointer">Grups</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={data.acepta_empresas} onCheckedChange={(v) => update("acepta_empresas", v)} id="empresas" />
                  <Label htmlFor="empresas" className="text-sm font-medium cursor-pointer">Empreses</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <Label className="text-sm font-semibold text-slate-700 mb-2 block">FAQs (text lliure)</Label>
            <Textarea rows={16} value={data.faqs_texto} onChange={(e) => update("faqs_texto", e.target.value)} placeholder="Enganxa aquí les FAQs en text lliure..." className="resize-none font-mono text-sm" />
            <p className="text-xs text-slate-500 mt-2">Pots enganxar aquí les FAQs de la compte en format text lliure.</p>
          </div>
        </TabsContent>

        <TabsContent value="experiencies" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm text-center py-12">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-7 h-7 text-stone-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">Serveis de la compte</p>
            <p className="text-sm text-slate-500 mb-6">Les experiències es gestionen en una secció independent per a millor organització</p>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/services")}>
              <Eye className="w-4 h-4" />
              Gestionar experiències
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="regles" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Com recomanar experiències</Label>
              <Textarea rows={4} value={data.reglas_recomendacion} onChange={(e) => update("reglas_recomendacion", e.target.value)} className="resize-none" placeholder="Ex: Recomanar primer les experiències premium si detectes interès..." />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Com resoldre objeccions</Label>
              <Textarea rows={4} value={data.reglas_objeciones} onChange={(e) => update("reglas_objeciones", e.target.value)} className="resize-none" placeholder="Ex: Si l'objecció és el preu, destacar el valor de l'experiència..." />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Quan demanar dades de contacte</Label>
              <Textarea rows={3} value={data.cuando_pedir_contacto} onChange={(e) => update("cuando_pedir_contacto", e.target.value)} className="resize-none" placeholder="Ex: Després de mostrar interès en una experiència concreta..." />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Quan intentar tancar reserva</Label>
              <Textarea rows={3} value={data.cuando_cerrar_reserva} onChange={(e) => update("cuando_cerrar_reserva", e.target.value)} className="resize-none" placeholder="Ex: Quan l'usuari pregunta disponibilitat o horaris..." />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Què evitar dir</Label>
              <Textarea rows={3} value={data.que_evitar} onChange={(e) => update("que_evitar", e.target.value)} className="resize-none" placeholder="Ex: No dir 'no sabem', evitar paraules genèriques..." />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Com ha de sonar l'assistent</Label>
              <Textarea rows={3} value={data.como_sonar} onChange={(e) => update("como_sonar", e.target.value)} className="resize-none" placeholder="Ex: Càlid, proper, professional, amb to acollidor..." />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coneixement" className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Història ampliada</Label>
              <Textarea rows={5} value={data.historia_ampliada} onChange={(e) => update("historia_ampliada", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Detalls de producte</Label>
              <Textarea rows={5} value={data.detalles_producto} onChange={(e) => update("detalles_producto", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Arguments de venda</Label>
              <Textarea rows={4} value={data.argumentos_venta} onChange={(e) => update("argumentos_venta", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Objeccions freqüents i resposta</Label>
              <Textarea rows={4} value={data.objeciones_frecuentes} onChange={(e) => update("objeciones_frecuentes", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Informació de maridatges</Label>
              <Textarea rows={4} value={data.info_maridajes} onChange={(e) => update("info_maridajes", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Informació de botiga / vins</Label>
              <Textarea rows={4} value={data.info_tienda} onChange={(e) => update("info_tienda", e.target.value)} className="resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Notes internes</Label>
              <Textarea rows={4} value={data.notas_internas} onChange={(e) => update("notas_internas", e.target.value)} className="resize-none" placeholder="Notes privades d'ús intern..." />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}