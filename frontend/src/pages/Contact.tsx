import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function ContactPage() {
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>, which: 1 | 2) {
    const file = e.target.files?.[0] || null;
    const url = file ? URL.createObjectURL(file) : null;
    if (which === 1) setPreview1(url);
    else setPreview2(url);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const { sendContact } = await import("../api");
      const res = await sendContact(form);
      if (!res.ok) throw new Error("Falha no envio");

      setMessage("Mensagem enviada com sucesso!");
      formEl.reset();
      setPreview1(null);
      setPreview2(null);
    } catch (err: any) {
      setError(err?.message || "Falha ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Contato</h2>
          <p className="mb-4 text-graphite">Envie sua mensagem e anexe até duas imagens relacionadas ao projeto.</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Nome</label>
                <input name="name" className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input type="email" name="email" className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
            <div>
              <label className="block mb-1">Mensagem</label>
              <textarea name="message" className="w-full border rounded px-3 py-2" rows={4} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="image1" className="btn-primary inline-block cursor-pointer">Imagem 1</label>
                <input id="image1" type="file" name="image1" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 1)} />
                {preview1 && <img src={preview1} alt="Preview 1" className="mt-2 h-32 object-cover rounded" />}
              </div>
              <div>
                <label htmlFor="image2" className="btn-primary inline-block cursor-pointer">Imagem 2</label>
                <input id="image2" type="file" name="image2" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 2)} />
                {preview2 && <img src={preview2} alt="Preview 2" className="mt-2 h-32 object-cover rounded" />}
              </div>
            </div>

            {message && <p className="text-green-700">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}