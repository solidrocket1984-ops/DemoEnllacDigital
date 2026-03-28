import React, { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { accessConfig } from "@/config/accessConfig";
import { brandConfig } from "@/config/brandConfig";
import { supportedSectors } from "@/config/sectorPresets";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [agentUrl, setAgentUrl] = useState("");
  const [enableExport, setEnableExport] = useState(false);
  const [exportType, setExportType] = useState("none");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [defaultSector, setDefaultSector] = useState(accessConfig.defaultSector);

  const { data: settings = [] } = useQuery({ queryKey: ["settings"], queryFn: () => base44.entities.AppSettings.list() });

  useEffect(() => {
    const get = (key) => settings.find((s) => s.key === key)?.value;
    setAgentUrl(get("agent_endpoint_url") || "");
    setEnableExport((get("enable_external_export") || "false") === "true");
    setExportType(get("export_destination_type") || "none");
    setWebhookUrl(get("export_webhook_url") || "");
    setDefaultSector(get("default_sector") || accessConfig.defaultSector);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const toSave = [
        { key: "agent_endpoint_url", value: agentUrl.trim() },
        { key: "enable_external_export", value: String(enableExport) },
        { key: "export_destination_type", value: exportType },
        { key: "export_webhook_url", value: webhookUrl.trim() },
        { key: "default_sector", value: defaultSector },
      ];
      for (const item of toSave) {
        const existing = settings.find((s) => s.key === item.key);
        if (existing) await base44.entities.AppSettings.update(existing.id, { value: item.value });
        else await base44.entities.AppSettings.create({ key: item.key, value: item.value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configuració guardada");
    },
    onError: () => toast.error("Error al guardar"),
  });

  const statusItems = useMemo(() => [
    { label: "Branding actiu", value: brandConfig.brandName },
    { label: "Sector per defecte", value: defaultSector },
    { label: "Mode d'accés", value: accessConfig.demoMode ? "Demo / regles locals" : "Backend" },
    { label: "Regles client", value: String(accessConfig.clientRules.length) },
  ], [defaultSector]);

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 space-y-5">
        <div><h1 className="text-2xl font-bold text-slate-900">Settings generals</h1><p className="text-sm text-slate-500 mt-1">Branding, sector, endpoint i control d'accés demo.</p></div>
        <div className="bg-white border rounded-xl p-6"><h2 className="font-semibold mb-4">Branding i sector</h2><div className="space-y-4"><div><Label>Nom de marca actiu</Label><Input value={brandConfig.brandName} disabled /></div><div><Label>Sector per defecte</Label><Select value={defaultSector} onValueChange={setDefaultSector}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{supportedSectors.map((s)=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div></div></div>
        <div className="bg-white border rounded-xl p-6"><h2 className="font-semibold mb-4">Agent</h2><Label>Endpoint de l'agent</Label><Input value={agentUrl} onChange={(e)=>setAgentUrl(e.target.value)} placeholder="https://agent.example.com/chat" className="mt-2" /></div>
        <div className="bg-white border rounded-xl p-6"><h2 className="font-semibold mb-4">Exportació</h2><div className="flex items-center gap-3 mb-4"><Switch checked={enableExport} onCheckedChange={setEnableExport} /><span className="text-sm">Activar exportació externa</span></div><Select value={exportType} onValueChange={setExportType} disabled={!enableExport}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sense exportació externa</SelectItem><SelectItem value="database">Base44</SelectItem><SelectItem value="crm">CRM via webhook</SelectItem><SelectItem value="google_sheets">Google Sheets via webhook</SelectItem></SelectContent></Select>{enableExport && exportType !== "none" && exportType !== "database" && <Input className="mt-3" value={webhookUrl} onChange={(e)=>setWebhookUrl(e.target.value)} placeholder="https://hooks..." />}</div>
        <div className="bg-white border rounded-xl p-6"><h2 className="font-semibold mb-3">Regles client demo</h2><pre className="text-xs bg-slate-50 border rounded p-3 overflow-auto">{JSON.stringify(accessConfig.clientRules, null, 2)}</pre></div>
        <div className="bg-white border rounded-xl p-6"><h2 className="font-semibold mb-3">Estat actual</h2><ul className="space-y-2">{statusItems.map((item)=><li key={item.label} className="text-sm text-slate-700"><span className="font-medium">{item.label}:</span> {item.value}</li>)}</ul></div>
        <div className="flex justify-end"><Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-[#722F37] hover:bg-[#5C252D]"><Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? "Guardant..." : "Guardar configuració"}</Button></div>
      </div>
    </AdminLayout>
  );
}
