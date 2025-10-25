import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { type Client, getClient } from "../api";
import { useParams, Link } from "react-router-dom";
import { Protected } from "../context/AuthContext";

/** Página de detalhes do cliente */
export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const c = await getClient(id);
        setClient(c);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar cliente");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <Protected>
      <Layout>
        <div className="card">
          {loading ? <p>Carregando...</p> : error ? <p className="text-red-600">{error}</p> : client && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">{client.name}</h2>
              <p className="mb-1">Telefone: {client.phone}</p>
              {client.email && <p className="mb-1">Email: {client.email}</p>}
              {client.address && <p className="mb-1">Endereço: {client.address}</p>}
              {client.notes && <p className="mb-1">Observações: {client.notes}</p>}
              <div className="mt-4 flex gap-2">
                <Link to={`/clients/${client.id}/edit`} className="btn-primary">Editar</Link>
                <Link to="/clients" className="underline">Voltar</Link>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </Protected>
  );
}