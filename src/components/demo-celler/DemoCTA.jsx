import React from "react";
import { Mail, Phone } from "lucide-react";

export default function DemoCTA({ t }) {
  return (
    <section className="py-16 bg-gradient-to-br from-[#722F37] to-[#5C252D] text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Vols un assistent així per al teu celler?
        </h2>
        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
          Contacta amb nosaltres i descobreix com podem personalitzar l'assistent per a la teva bodega
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:info@enlacdigital.cat"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#722F37] font-medium hover:bg-stone-100 transition-all shadow-lg"
          >
            <Mail className="w-4 h-4" />
            Escriu-nos
          </a>
          <a
            href="tel:686373615"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-white text-white font-medium hover:bg-white/10 transition-all"
          >
            <Phone className="w-4 h-4" />
            Trucar
          </a>
        </div>
      </div>
    </section>
  );
}