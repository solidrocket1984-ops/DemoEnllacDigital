import React from "react";
import { Link, Navigate } from "react-router-dom";
import PublicLayout from "@/components/layouts/PublicLayout";
import { useAuth } from "@/lib/AuthContext";
import { canAccessAdmin, canAccessClient } from "@/lib/access-control";

export default function AccessPage() {
  const { isAuthenticated, user, navigateToLogin, logout } = useAuth();

  if (isAuthenticated && canAccessAdmin(user)) return <Navigate to="/admin" replace />;
  if (isAuthenticated && canAccessClient(user)) return <Navigate to="/cliente" replace />;

  return (
    <PublicLayout>
      <section className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Accés segur</h1>
          <p className="text-slate-600 mt-2">Inicia sessió amb Base44 per entrar al portal client o al panell intern.</p>
          <button onClick={() => navigateToLogin()} className="mt-6 w-full rounded-xl bg-slate-900 text-white py-2.5">Entrar amb Base44</button>
          <p className="mt-4 text-sm text-slate-500">Si només vols explorar, pots continuar a la <Link to="/demo" className="underline">demo pública</Link>.</p>
          <button onClick={() => logout(false)} className="mt-3 text-xs text-slate-400">Netejar sessió local</button>
        </div>
      </section>
    </PublicLayout>
  );
}
