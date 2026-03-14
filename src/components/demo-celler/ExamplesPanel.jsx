import React from "react";
import { motion } from "framer-motion";
import { Heart, Users, Gift, Globe } from "lucide-react";

const exampleIcons = [Heart, Users, Gift, Globe];
const exampleKeys = ["example1", "example2", "example3", "example4"];

export default function ExamplesPanel({ t, onExampleClick }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#2D1B14]">{t.examplesTitle}</h3>
      <div className="space-y-2.5">
        {exampleKeys.map((key, i) => {
          const Icon = exampleIcons[i];
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExampleClick(key)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/60 hover:border-[#722F37]/25 hover:bg-[#F5F0E8] transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 group-hover:border-[#722F37]/20 transition-colors">
                <Icon className="w-4 h-4 text-[#722F37]" />
              </div>
              <span className="text-sm font-medium text-[#2D1B14]">{t[key]}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">{t.examplesHint}</p>
    </div>
  );
}