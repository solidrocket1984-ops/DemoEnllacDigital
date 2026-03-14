import React from "react";
import { Phone, Mail } from "lucide-react";

export default function DemoFooter({ t }) {
  return (
    <footer className="bg-[#2D1B14] text-stone-300 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <div className="w-7 h-7 rounded-full bg-[#722F37] flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">ED</span>
              </div>
              <span className="font-semibold text-white text-sm">Enllaç Digital</span>
            </div>
            <p className="text-xs text-stone-400 max-w-xs">Assistents intel·ligents per a cellers</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="tel:686373615" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" /> 686 37 36 15
            </a>
            <a href="mailto:info@enlacdigital.cat" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5" /> info@enlacdigital.cat
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <p className="text-[11px] text-stone-500">© {new Date().getFullYear()} Enllaç Digital</p>
        </div>
      </div>
    </footer>
  );
}