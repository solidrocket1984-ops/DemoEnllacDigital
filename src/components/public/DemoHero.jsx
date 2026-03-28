import React from "react";
import { ArrowDown, Mail } from "lucide-react";

export default function DemoHero({ t, onDemoClick }) {
  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#FAF7F2] to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#722F37]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#C9A962]/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#722F37] animate-pulse" />
          Demo en viu · Assistent IA per a negocis
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D1B14] leading-tight mb-6">
          {t.heroTitle}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onDemoClick}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#722F37] text-white font-medium text-sm hover:bg-[#5C252D] transition-all shadow-lg shadow-[#722F37]/20"
          >
            {t.heroBtn1}
            <ArrowDown className="w-4 h-4" />
          </button>
          <a
            href="mailto:info@enlacdigital.cat"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#722F37]/20 text-[#722F37] font-medium text-sm hover:border-[#722F37]/40 hover:bg-[#722F37]/5 transition-all"
          >
            <Mail className="w-4 h-4" />
            {t.heroBtn2}
          </a>
        </div>
      </div>
    </section>
  );
}