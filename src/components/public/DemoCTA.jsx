import React from "react";
import { Mail } from "lucide-react";

export default function DemoCTA({ t }) {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B14] mb-4">{t.ctaTitle}</h2>
        <p className="text-sm text-stone-600 mb-8 max-w-xl mx-auto leading-relaxed">{t.ctaSubtitle}</p>
        <a
          href="mailto:info@enlacdigital.cat"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#722F37] text-white font-medium text-sm hover:bg-[#5C252D] transition-all shadow-lg shadow-[#722F37]/20"
        >
          <Mail className="w-4 h-4" />
          {t.ctaBtn}
        </a>
      </div>
    </section>
  );
}