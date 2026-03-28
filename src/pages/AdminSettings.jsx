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
import { Textarea } from "@/components/ui/textarea";
import { accessConfig } from "@/config/accessConfig";
import { brandConfig } from "@/config/brandConfig";
import { supportedSectors } from "@/config/sectorPresets";

const initialForm = {
  agent_endpoint_url: "",
  agent_connection_mode: "remote",
  agent_shared_token: "",
  default_sector: accessConfig.defaultSector,
  default_demo_account_slug: "",
  enable_external_export: false,
  export_destination_type: "none",
  export_webhook_url: "",
  demo_client_rules_json: "",
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const { data: settings = [] } = useQuery({ queryKey: ["settings"], queryFn: () => base44.entities.AppSettings.list() });

  useEffect(() => {
    const get = (key) => settings.find((s) => s.key === key)?.value;
    setForm({
      agent_endpoint_url: get("agent_endpoint_url") || "",
      agent_connection_mode: get("agent_connection_mode") || "remote",
      agent_shared_token: get("agent_shared_token") || "",
      default_sector: get("default_sector") || accessConfig.defaultSector,
      default_demo_account_slug: get("default_demo_account_slug") || "",
      enable_external_export: (get("enable_external_export") || "false") === "true",
      export_destination_type: get("export_destination_type") || "none",
      export_webhook_url: get("export_webhook_url") || "",
      demo_client_rules_json: get("demo_client_rules_json") || JSON.stringify(accessConfig.clientRules, null, 2),
    });
  }, [settings]);

  const isValidEndpoint = !form.agent_endpoint_url || /^https?:\/\//.test(form.agent_endpoint_url);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!isValidEndpoint) throw new Error("L'endpoint ha de començar per http:// o https://");
      const toSave = [
        { key: "agent_endpoint_url", value: form.agent_endpoint_url.trim() },
        { key: "agent_connection_mode", value: form.agent_connection_mode },
        { key: "agent_shared_token", value: form.agent_shared_token.trim() },
        { key: "default_sector", value: form.default_sector },
        { key: "default_demo_account_slug", value: form.default_demo_account_slug.trim() },
        { key: "enable_external_export", value: String(form.enable_external_export) },
        { key: "export_destination_type", value: form.export_destination_type },
        { key: "export_webhook_url", value: form.export_webhook_url.trim() },
        { key: "demo_client_rules_json", value: form.demo_client_rules_json },
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
    onError: (error) => toast.error(error.message || "Error al guardar"),
  });

  const statusItems = useMemo(
    () => [
      { label: "Branding actiu", value: brandConfig.brandName },
      { label: "Sector per defecte", value: form.default_sector },
      { label: "Mode connexió agent", value: form.agent_connection_mode },
      { label: "Endpoint global", value: form.agent_endpoint_url || "(no configurat)" },
      { label: "Compte demo per defecte", value: form.default_demo_account_slug || "(automàtic per sector)" },
      { label: "Regles client", value: "AppSettings + compatibilitat accessConfig" },
    ],
    [form]
  );

  const exportSettings = JSON.stringify(
    {
      export_enabled: form.enable_external_export,
      destination: form.export_destination_type,
      webhook: form.export_webhook_url || null,
    },
    null,
    2
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings generals</h1>
          <p className="text-sm text-slate-500 mt-1">Configuració central de demo multiclient, sectors i connexió amb enllac-agent.</p>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Agent</h2>
          <div>
            <Label>Endpoint global de l'agent</Label>
            <Input value={form.agent_endpoint_url} onChange={(e) => setForm((prev) => ({ ...prev, agent_endpoint_url: e.target.value }))} placeholder="https://agent.example.com" className="mt-2" />
            {!isValidEndpoint && <p className="text-xs text-red-600 mt-1">URL invàlida: ha d'incloure protocol.</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Mode de connexió</Label>
              <Select value={form.agent_connection_mode} onValueChange={(value) => setForm((prev) => ({ ...prev, agent_connection_mode: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote (enllac-agent)</SelectItem>
                  <SelectItem value="mock">Mock / local fallback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Token compartit (opcional)</Label>
              <Input value={form.agent_shared_token} onChange={(e) => setForm((prev) => ({ ...prev, agent_shared_token: e.target.value }))} placeholder="Bearer token opcional" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Sector i compte demo per defecte</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Sector per defecte</Label>
              <Select value={form.default_sector} onValueChange={(value) => setForm((prev) => ({ ...prev, default_sector: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{supportedSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Compte demo per defecte (slug)</Label>
              <Input value={form.default_demo_account_slug} onChange={(e) => setForm((prev) => ({ ...prev, default_demo_account_slug: e.target.value }))} placeholder="demo-company" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Exportació i regles client</h2>
          <div className="flex items-center gap-3"><Switch checked={form.enable_external_export} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, enable_external_export: checked }))} /><span className="text-sm">Activar exportació externa</span></div>
          <Select value={form.export_destination_type} onValueChange={(value) => setForm((prev) => ({ ...prev, export_destination_type: value }))} disabled={!form.enable_external_export}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="none">Sense exportació externa</SelectItem><SelectItem value="database">Base44</SelectItem><SelectItem value="crm">CRM via webhook</SelectItem><SelectItem value="google_sheets">Google Sheets via webhook</SelectItem></SelectContent>
          </Select>
          {form.enable_external_export && form.export_destination_type !== "none" && form.export_destination_type !== "database" && <Input value={form.export_webhook_url} onChange={(e) => setForm((prev) => ({ ...prev, export_webhook_url: e.target.value }))} placeholder="https://hooks..." />}
          <div>
            <Label>Regles client demo (JSON)</Label>
            <Textarea rows={8} value={form.demo_client_rules_json} onChange={(e) => setForm((prev) => ({ ...prev, demo_client_rules_json: e.target.value }))} className="font-mono text-xs" />
          </div>
          <div>
            <Label>Snapshot exportació</Label>
            <pre className="text-xs bg-slate-50 border rounded p-3 overflow-auto">{exportSettings}</pre>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Estat actual del sistema</h2>
          <ul className="space-y-2">{statusItems.map((item) => <li key={item.label} className="text-sm text-slate-700"><span className="font-medium">{item.label}:</span> {item.value}</li>)}</ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isValidEndpoint} className="bg-[#722F37] hover:bg-[#5C252D]">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Guardant..." : "Guardar configuració"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
