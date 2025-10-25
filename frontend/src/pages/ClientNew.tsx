import Layout from "../components/Layout";
import ClientForm, { type ClientInput, type ClientFormFiles } from "../components/ClientForm";
import { createClientWithFiles } from "../api";
import { useNavigate } from "react-router-dom";
import { Protected } from "../context/AuthContext";

/** Página de criação de cliente */
export default function ClientNewPage() {
  const navigate = useNavigate();

  async function handleSubmit(data: ClientInput, files?: ClientFormFiles) {
    const form = new FormData();
    form.append("name", data.name);
    form.append("phone", data.phone);
    if (data.email) form.append("email", data.email);
    if (data.address) form.append("address", data.address);
    if (data.notes) form.append("notes", data.notes);
    if (files?.project1) form.append("project1", files.project1);
    if (files?.project2) form.append("project2", files.project2);
    if (files?.project3) form.append("project3", files.project3);

    await createClientWithFiles(form);
    navigate("/clients");
  }

  return (
    <Protected>
      <Layout>
        <div className="card max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Novo Cliente</h2>
          <ClientForm onSubmit={handleSubmit} />
        </div>
      </Layout>
    </Protected>
  );
}