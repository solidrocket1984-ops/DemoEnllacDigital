import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, CalendarCheck } from "lucide-react";

export default function FeaturesSection({ t }) {
  const features = [
    { icon: MessageCircle, title: t.feat1Title, desc: t.feat1Desc, color: "from-[#722F37] to-[#9B4550]" },
    { icon: Sparkles, title: t.feat2Title, desc: t.feat2Desc, color: "from-[#C9A962] to-[#B8933A]" },
    { icon: CalendarCheck, title: t.feat3Title, desc: t.feat3Desc, color: "from-[#5C6B4F] to-[#7A8C6A]" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group relative p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200/60 hover:border-[#722F37]/20 transition-all hover:shadow-lg"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-sm`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D1B14] text-base mb-2">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}