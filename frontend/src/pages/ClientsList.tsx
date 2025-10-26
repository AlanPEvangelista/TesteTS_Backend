import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { type Client, deleteClient, getClients } from "../api";
import { Link } from "react-router-dom";
import { Protected } from "../context/AuthContext";

/** Listagem de clientes */
export default function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Deseja realmente excluir?")) return;
    await deleteClient(id);
    await load();
  }

  return (
    <Protected>
      <Layout>
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <img src="https://images.pexels.com/photos/2766193/pexels-photo-2766193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" alt="Projeto de sala com móveis de madeira" className="w-full h-40 sm:h-48 object-cover rounded-lg shadow" onError={(e) => (e.currentTarget.src = "https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2")} />
             <img src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" alt="Cozinha planejada em marcenaria" className="w-full h-40 sm:h-48 object-cover rounded-lg shadow" onError={(e) => (e.currentTarget.src = "https://images.pexels.com/photos/373538/pexels-photo-373538.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2")} />
             <img src="https://images.pexels.com/photos/2079247/pexels-photo-2079247.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" alt="Detalhe de móvel sob medida" className="w-full h-40 sm:h-48 object-cover rounded-lg shadow" onError={(e) => (e.currentTarget.src = "https://images.pexels.com/photos/279734/pexels-photo-279734.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2")} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Clientes</h2>
          <Link to="/clients/new" className="btn-primary">Novo Cliente</Link>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid gap-4">
          {clients.map((c) => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{c.name}</h3>
                <p className="text-sm text-graphite">{c.phone} {c.email ? `• ${c.email}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/clients/${c.id}`} className="underline">Detalhes</Link>
                <Link to={`/clients/${c.id}/edit`} className="underline">Editar</Link>
                <button onClick={() => onDelete(c.id)} className="btn-danger">Excluir cliente</button>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    </Protected>
  );
}