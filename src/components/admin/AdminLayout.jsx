import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Wine, Eye, Settings, LayoutGrid, Sparkles, HelpCircle, BarChart3, Users } from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { path: "/admin/wineries", label: "Bodegues", icon: Wine },
  { path: "/admin/experiences", label: "Experiències", icon: Sparkles },
  { path: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { path: "/admin/leads", label: "Leads", icon: Users },
  { path: "/admin/simulation", label: "Simulació", icon: BarChart3 },
  { path: "/admin/settings", label: "Ajustos", icon: Settings },
  { path: "/demo", label: "Demo pública", icon: Eye },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">ED</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Gestió de cellers</h1>
                <p className="text-xs text-slate-500">Panel intern d'administració</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, -1).map((item) => {
                const Icon = item.icon;
                const isActive = item.path === "/admin/dashboard"
                  ? location.pathname === "/admin/dashboard" || location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#722F37] text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/demo"
                className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
              >
                <Eye className="w-4 h-4" />
                Demo pública
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 py-2 px-2">
          {[navItems[0], navItems[1], navItems[4], navItems[7]].map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin/dashboard"
              ? location.pathname === "/admin/dashboard" || location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-[#722F37] bg-[#722F37]/5" : "text-slate-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}