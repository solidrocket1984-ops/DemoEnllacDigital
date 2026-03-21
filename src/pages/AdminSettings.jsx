import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "sonner";

const SETTING_KEYS = ["agent_endpoint_url", "export_destination_type", "export_webhook_url", "enable_external_export"];

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const [agentUrl, setAgentUrl] = useState("");
  const [enableExport, setEnableExport] = useState(false);
  const [exportType, setExportType] = useState("none");
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    const get = (key) => settings.find((s) => s.key === key)?.value;
    if (get("agent_endpoint_url")) setAgentUrl(get("agent_endpoint_url"));
    if (get("enable_external_export")) setEnableExport(get("enable_external_export") === "true");
    if (get("export_destination_type")) setExportType(get("export_destination_type"));
    if (get("export_webhook_url")) setWebhookUrl(get("export_webhook_url"));
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const toSave = [
        { key: "agent_endpoint_url", value: agentUrl },
        { key: "enable_external_export", value: String(enableExport) },
        { key: "export_destination_type", value: exportType },
        { key: "export_webhook_url", value: webhookUrl },
      ];

      for (const item of toSave) {
        const existing = settings.find((s) => s.key === item.key);
        if (existing) {
          await base44.entities.AppSettings.update(existing.id, { value: item.value });
        } else {
          await base44.entities.AppSettings.create({ key: item.key, value: item.value });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configuració guardada");
    },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ajustos</h1>
          <p className="text-sm text-slate-500 mt-1">Configura l'endpoint de l'agent i les opcions d'exportació</p>
        </div>

        <div className="space-y-5">
          {/* Agent endpoint */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Agent IA</h2>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                URL de l'endpoint de l'agent
              </Label>
              <Input
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                placeholder="https://enllac-agent.onrender.com/chat"
                className="h-11"
              />
              <p className="text-xs text-slate-400 mt-2">
                URL on es fa la crida POST per obtenir respostes del model. Ha d'acabar en <code>/chat</code>.
              </p>
            </div>
          </div>

          {/* Export settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Exportació de leads</h2>

            <div className="flex items-center gap-3 mb-5 p-3 bg-stone-50 rounded-lg">
              <Switch
                checked={enableExport}
                onCheckedChange={setEnableExport}
                id="enable-export"
              />
              <div>
                <Label htmlFor="enable-export" className="cursor-pointer font-medium text-sm">Activar exportació externa</Label>
                <p className="text-xs text-slate-400">Quan s'activi, els leads es podran enviar a sistemes externs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Destinació</Label>
                <Select value={exportType} onValueChange={setExportType} disabled={!enableExport}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sense exportació externa</SelectItem>
                    <SelectItem value="database">Base de dades interna (Base44)</SelectItem>
                    <SelectItem value="crm">CRM via Webhook</SelectItem>
                    <SelectItem value="google_sheets">Google Sheets via Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {enableExport && exportType !== "none" && exportType !== "database" && (
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">URL del Webhook</Label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..."
                    className="h-11"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    El sistema farà un POST amb el JSON del lead quan es guardi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#722F37] hover:bg-[#5C252D]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Guardant..." : "Guardar configuració"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}