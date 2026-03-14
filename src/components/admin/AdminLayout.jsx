import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Wine, Eye, Settings, LayoutGrid } from "lucide-react";

const navItems = [
  { path: "/admin/wineries", label: "Bodegues", icon: Wine },
  { path: "/demo", label: "Veure demo pública", icon: Eye },
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

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            </nav>
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 shadow-lg z-40">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-[#722F37]" : "text-slate-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}