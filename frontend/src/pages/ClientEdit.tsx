import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ClientForm, { type ClientInput } from "../components/ClientForm";
import { getClient, updateClient } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { Protected } from "../context/AuthContext";

/** Página de edição de cliente */
export default function ClientEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [defaultValues, setDefaultValues] = useState<Partial<ClientInput>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const c = await getClient(id);
        setDefaultValues({
          name: c.name,
          phone: c.phone,
          email: c.email || undefined,
          address: c.address || undefined,
          notes: c.notes || undefined,
        });
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar cliente");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: ClientInput) {
    if (!id) return;
    await updateClient(id, data);
    navigate(`/clients/${id}`);
  }

  return (
    <Protected>
      <Layout>
        <div className="card max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Editar Cliente</h2>
          {loading ? <p>Carregando...</p> : error ? <p className="text-red-600">{error}</p> : (
            <ClientForm defaultValues={defaultValues} onSubmit={handleSubmit} />
          )}
        </div>
      </Layout>
    </Protected>
  );
}