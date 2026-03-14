import React from "react";
import { Phone, Mail, ArrowDown } from "lucide-react";

export default function MobileBar({ t, onDemoClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-2 safe-area-bottom">
      <div className="flex items-center gap-2">
        <a
          href="tel:686373615"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#722F37] text-white text-xs font-medium"
        >
          <Phone className="w-3.5 h-3.5" />
          {t.mobileCall}
        </a>
        <a
          href="mailto:info@enlacdigital.cat"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-medium"
        >
          <Mail className="w-3.5 h-3.5" />
          {t.mobileEmail}
        </a>
        <button
          onClick={onDemoClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#722F37]/20 text-[#722F37] text-xs font-medium"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          {t.mobileDemo}
        </button>
      </div>
    </div>
  );
}