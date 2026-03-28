import React from "react";
import { Link, useLocation } from "react-router-dom";
import { brandConfig } from "@/config/brandConfig";
import { clientNavigation } from "@/config/navigationConfig";

export default function ClientLayout({ children, allowedModules = [] }) {
  const location = useLocation();
  const nav = clientNavigation.filter((item) => allowedModules.includes(item.module));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{brandConfig.labels.clientPortal}</p>
            <h1 className="text-lg font-semibold text-slate-900">{brandConfig.brandName}</h1>
          </div>
          <Link className="text-sm text-slate-500 hover:text-slate-900" to="/demo">{brandConfig.labels.publicDemo}</Link>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2 flex-wrap">
          {nav.map((item) => (
            <Link key={item.path} to={item.path} className={`px-3 py-1.5 rounded-full text-sm ${location.pathname===item.path?"bg-slate-900 text-white":"bg-slate-100 text-slate-700"}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
