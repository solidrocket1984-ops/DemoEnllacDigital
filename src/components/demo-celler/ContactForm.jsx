import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ContactForm({ t }) {
  const [form, setForm] = useState({ nom: "", negoci: "", telefon: "", email: "", missatge: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email) return;
    setSending(true);
    await base44.entities.DemoLead.create({ ...form, source: "demo-celler" });
    setSending(false);
    setSent(true);
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D1B14] mb-3">{t.contactTitle}</h2>
          <p className="text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">{t.contactSubtitle}</p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-base font-medium text-[#2D1B14]">{t.contactSuccess}</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">{t.contactNom} *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">{t.contactCeller}</label>
                <input
                  type="text"
                  value={form.negoci}
                  onChange={(e) => handleChange("negoci", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">{t.contactTelefon}</label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(e) => handleChange("telefon", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">{t.contactEmail} *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">{t.contactMissatge}</label>
              <textarea
                value={form.missatge}
                onChange={(e) => handleChange("missatge", e.target.value)}
                rows={4}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 focus:border-[#722F37]/30 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#722F37] text-white font-medium text-sm hover:bg-[#5C252D] transition-all shadow-md disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t.contactBtn}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}