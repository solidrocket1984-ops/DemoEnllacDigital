import React from "react";
import AdminLayout from "../components/admin/AdminLayout";

export default function AdminFAQs() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona les preguntes freqüents</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❓</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Gestió de FAQs</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Les FAQs es gestionen dins de cada compte. Ves a la secció de comptes i edita una compte
            per afegir o modificar les seves preguntes freqüents.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}