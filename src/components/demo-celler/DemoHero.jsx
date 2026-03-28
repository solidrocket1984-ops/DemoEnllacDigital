import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Building2 } from "lucide-react";

export default function DemoHero({ t, onDemoClick, winery, sector }) {
  const businessName = winery?.nombre || winery?.name || "Demo Account";
  const Icon = sector?.icon || Building2;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2D1B14] via-[#3D2418] to-[#2D1B14]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#722F37]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#C9A962]/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium mb-8">
            <Icon className="w-3.5 h-3.5 text-[#C9A962]" />
            <span className="text-[#C9A962] font-semibold">{businessName}</span>
            <span className="text-white/40 mx-1">·</span>
            <span>{sector?.name || "Demo sectorial"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">{t.heroTitle}</h1>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">{t.heroSubtitle}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onDemoClick} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#722F37] text-white font-medium text-sm hover:bg-[#5C252D] transition-all shadow-lg shadow-[#722F37]/40">
              {t.heroBtn1}
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
