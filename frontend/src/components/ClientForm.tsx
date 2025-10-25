import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/** Esquema de validação para Cliente */
export const clientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().min(6, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  address: z.string().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientFormFiles = { project1?: File | null; project2?: File | null; project3?: File | null };

/**
 * Formulário de cliente com validação via Zod.
 */
export default function ClientForm({ defaultValues, onSubmit }: {
  defaultValues?: Partial<ClientInput>;
  onSubmit: (data: ClientInput, files?: ClientFormFiles) => void | Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, { project1: file1, project2: file2, project3: file3 }))} className="space-y-4">
      <div>
        <label className="block mb-1">Nome</label>
        <input className="w-full border rounded px-3 py-2" {...register("name")} />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Telefone</label>
        <input className="w-full border rounded px-3 py-2" {...register("phone")} />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2" {...register("email")} />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block mb-1">Endereço</label>
        <input className="w-full border rounded px-3 py-2" {...register("address")} />
      </div>
      <div>
        <label className="block mb-1">Observações</label>
        <textarea className="w-full border rounded px-3 py-2" rows={4} {...register("notes")} />
      </div>

      {/* Imagens do projeto do cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="btn-primary text-center cursor-pointer">
            Imagem 1
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile1(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div>
          <label className="btn-primary text-center cursor-pointer">
            Imagem 2
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile2(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div>
          <label className="btn-primary text-center cursor-pointer">
            Imagem 3
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile3(e.target.files?.[0] || null)} />
          </label>
        </div>
      </div>

      <button className="btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}