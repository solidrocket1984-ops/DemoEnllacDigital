import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { brandConfig } from "@/config/brandConfig";

const internalLabels = { ca: "Accés intern", es: "Acceso interno", en: "Internal access" };

export default function DemoFooter({ lang = "ca" }) {
  return (
    <footer className="bg-[#2D1B14] text-stone-300 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <div className="w-7 h-7 rounded-full bg-[#722F37] flex items-center justify-center"><span className="text-white text-[9px] font-bold">AI</span></div>
              <span className="font-semibold text-white text-sm">{brandConfig.brandName}</span>
            </div>
            <p className="text-xs text-stone-400 max-w-xs">{brandConfig.claim}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href={`mailto:${brandConfig.contactEmail}`} className="flex items-center gap-2 text-xs hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5" /> {brandConfig.contactEmail}
            </a>
            <Link to="/admin" className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors">
              <Lock className="w-3 h-3" />
              {internalLabels[lang]}
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <p className="text-[11px] text-stone-500">© {new Date().getFullYear()} {brandConfig.brandName}</p>
        </div>
      </div>
    </footer>
  );
}
