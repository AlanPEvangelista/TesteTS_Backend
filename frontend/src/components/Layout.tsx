import React from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Layout padrão do app com cabeçalho e container.
 * Paleta tema madeira aplicada via Tailwind.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <div>
      <header className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600&h=600&dpr=2"
            alt="Marcenaria artesanal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
        <div className="container relative h-full flex items-end justify-between text-white pb-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Marcenaria Participativa</h1>
            <p className="text-sm md:text-base opacity-90">Sua participação no Projeto é Fundamental para a Conclusão do mesmo.</p>
          </div>
          <nav className="flex gap-3 items-center">
            <a className="hover:underline hover:opacity-80" href="/clients">Clientes</a>
            <a className="hover:underline hover:opacity-80" href="/contato">Contato</a>
            <button className="btn-primary" onClick={logout}>Sair</button>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}