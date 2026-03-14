import React from "react";
import { Phone, Mail } from "lucide-react";

const langLabels = { ca: "Català", es: "Castellano", en: "English" };

export default function DemoHeader({ lang, setLang, t }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#722F37] to-[#9B4550] flex items-center justify-center">
            <span className="text-white font-bold text-sm">ED</span>
          </div>
          <span className="font-semibold text-[#2D1B14] text-sm">Enllaç Digital</span>
        </div>

        <div className="flex items-center gap-3">
          <a href="mailto:info@enlacdigital.cat" className="hidden sm:flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#722F37] transition-colors">
            <Mail className="w-3.5 h-3.5" />
            Contacte
          </a>

          <div className="flex items-center gap-1 bg-stone-100 rounded-full p-0.5">
            {Object.entries(langLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLang(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  lang === key ? "bg-[#722F37] text-white shadow-sm" : "text-stone-600 hover:text-[#722F37]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}