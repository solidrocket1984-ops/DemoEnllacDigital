import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Database, Send } from "lucide-react";

const steps = [
  { icon: MessageCircle, color: "from-[#722F37] to-[#9B4550]", title: "Conversa real", desc: "El visitant escriu i l'assistent respon en temps real" },
  { icon: Sparkles, color: "from-[#C9A962] to-[#B8933A]", title: "Detecta intenció", desc: "El sistema analitza qui és, quants són i quina experiència busquen" },
  { icon: Database, color: "from-[#5C6B4F] to-[#7A8C6A]", title: "Guarda el lead", desc: "El lead es guarda automàticament a la base de dades interna" },
  { icon: Send, color: "from-slate-500 to-slate-600", title: "Exportable", desc: "El lead pot enviar-se a CRM, Google Sheets o qualsevol webhook" },
];

export default function FlowSteps() {
  return (
    <section className="py-10 bg-[#FAF7F2] border-y border-stone-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-stone-300 bg-white flex items-center justify-center text-[10px] font-bold text-stone-400 mb-2">
                  {i + 1}
                </div>
                <p className="text-xs font-semibold text-[#2D1B14] mb-1">{step.title}</p>
                <p className="text-[11px] text-stone-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}