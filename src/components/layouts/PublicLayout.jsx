import React from "react";
import { Link } from "react-router-dom";
import { publicNavigation } from "@/config/navigationConfig";
import { brandConfig } from "@/config/brandConfig";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-slate-900">{brandConfig.brandName}</Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            {publicNavigation.map((item) => (
              <Link key={item.path} to={item.path} className="hover:text-slate-900">{item.label}</Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
