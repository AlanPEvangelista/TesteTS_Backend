import React, { useState } from "react";
import Layout from "../components/Layout";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";

/** Página de Login (email + senha) */
export default function LoginPage() {
  const { login: doLogin } = useAuth();
  const [email, setEmail] = useState("admin@marcenaria.com");
  const [password, setPassword] = useState("changeme");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      doLogin(res.token);
    } catch (err: any) {
      setError(err?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="card max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Senha</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
      </div>
    </Layout>
  );
}