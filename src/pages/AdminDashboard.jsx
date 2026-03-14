import React from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { Wine, Sparkles, HelpCircle, Settings, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const sections = [
    { icon: Wine, label: "Bodegues", path: "/admin/wineries", color: "from-purple-500 to-purple-600" },
    { icon: Sparkles, label: "Experiències", path: "/admin/experiences", color: "from-amber-500 to-amber-600" },
    { icon: HelpCircle, label: "FAQs", path: "/admin/faqs", color: "from-blue-500 to-blue-600" },
    { icon: BarChart3, label: "Simulació", path: "/admin/simulation", color: "from-emerald-500 to-emerald-600" },
    { icon: Settings, label: "Ajustos", path: "/admin/settings", color: "from-slate-500 to-slate-600" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Gestiona la configuració dels teus assistents intel·ligents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.path}
                to={section.path}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{section.label}</h3>
                  <p className="text-sm text-slate-500">Gestionar {section.label.toLowerCase()}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-br from-[#722F37] to-[#5C252D] rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-3">Benvingut al panell de gestió</h2>
          <p className="text-white/90 mb-6 leading-relaxed">
            Des d'aquí pots configurar les bodegues, experiències, FAQs i regles d'intel·ligència artificial
            per personalitzar completament el comportament dels assistents.
          </p>
          <Link
            to="/admin/wineries"
            className="inline-block px-6 py-3 bg-white text-[#722F37] rounded-lg font-medium hover:bg-stone-100 transition-colors"
          >
            Començar amb les bodegues
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}