import React from "react";
import { Link, useLocation } from "react-router-dom";
import { adminNavigation } from "@/config/navigationConfig";
import { brandConfig } from "@/config/brandConfig";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navItems = adminNavigation.filter((item) => item.visible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center shadow-md"><span className="text-white font-bold text-sm">AI</span></div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{brandConfig.labels.internalPanel}</h1>
                <p className="text-xs text-slate-500">Gestió interna multivertical</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, -1).map((item) => {
                const Icon = item.icon;
                const isActive = item.path === "/admin/dashboard" ? location.pathname === "/admin/dashboard" || location.pathname === "/admin" : location.pathname.startsWith(item.path);
                return (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-[#722F37] text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link to="/demo" className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">Demo pública</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8">{children}</main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1 py-2 px-2">
          {[navItems[0], navItems[1], navItems[4], navItems[7]].map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin/dashboard" ? location.pathname === "/admin/dashboard" || location.pathname === "/admin" : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${isActive ? "text-[#722F37] bg-[#722F37]/5" : "text-slate-600"}`}>
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
