import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** Valor do contexto de autenticação */
export interface AuthContextValue {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Provedor de autenticação que persiste token em localStorage */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    login: (t) => {
      setToken(t);
      localStorage.setItem("token", t);
      navigate("/clients");
    },
    logout: () => {
      setToken(null);
      localStorage.removeItem("token");
      navigate("/login");
    },
  }), [token, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para acessar o contexto */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

/** Componente de rota protegida */
export function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return (
      <div className="container py-10">
        <div className="card">
          <p className="mb-4">Você precisa estar autenticado.</p>
          <a href="/login" className="btn-primary inline-block">Ir para Login</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}