import React from "react";
import AdminLayout from "../components/admin/AdminLayout";

export default function AdminExperiences() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Experiències</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona les experiències de les bodegues</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Gestió d'experiències</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Les experiències es gestionen dins de cada bodega. Ves a la secció de bodegues i edita una bodega
            per afegir o modificar les seves experiències.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}