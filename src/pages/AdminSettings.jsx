import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [agentUrl, setAgentUrl] = useState("");

  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    const urlSetting = settings.find((s) => s.key === "agent_endpoint_url");
    if (urlSetting) {
      setAgentUrl(urlSetting.value);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = settings.find((s) => s.key === "agent_endpoint_url");
      if (existing) {
        await base44.entities.AppSettings.update(existing.id, { value: agentUrl });
      } else {
        await base44.entities.AppSettings.create({ key: "agent_endpoint_url", value: agentUrl });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configuració guardada correctament");
    },
    onError: () => {
      toast.error("Error al guardar la configuració");
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ajustos</h1>
          <p className="text-sm text-slate-500 mt-1">Configura els paràmetres globals de l'aplicació</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                URL de l'endpoint de l'agent extern
              </Label>
              <Input
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                placeholder="https://enllac-agent.onrender.com/chat"
                className="h-11"
              />
              <p className="text-xs text-slate-500 mt-2">
                Aquesta és la URL on es farà la crida POST per obtenir les respostes de l'assistent IA.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
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

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> L'URL de l'agent ha d'acceptar peticions POST amb el payload especificat
            a la documentació i retornar un objecte JSON amb els camps reply_text, detected_intent, etc.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}