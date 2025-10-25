/**
 * API helper centralizado.
 * Usa `VITE_API_URL` ou `http://localhost:3000` por padrão.
 * Adiciona `Authorization: Bearer <token>` automaticamente se existir em localStorage.
 */
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** Obtém token do localStorage */
export function getToken(): string | null {
  return localStorage.getItem("token");
}

/**
 * Faz requisição à API com headers padrão.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  // Só define JSON se não for FormData
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Tipos
export interface LoginResponse {
  token: string;
  user?: { id: string; email: string; name?: string };
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Endpoints
export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getClients() {
  return apiFetch<Client[]>("/clients");
}

export async function getClient(id: string) {
  return apiFetch<Client>(`/clients/${id}`);
}

export async function createClient(data: Partial<Client>) {
  return apiFetch<Client>("/clients", { method: "POST", body: JSON.stringify(data) });
}

export async function createClientWithFiles(form: FormData) {
  return apiFetch<Client & { files?: any }>("/clients", { method: "POST", body: form });
}

export async function updateClient(id: string, data: Partial<Client>) {
  return apiFetch<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteClient(id: string) {
  return apiFetch<{ ok: boolean }>(`/clients/${id}`, { method: "DELETE" });
}

// Contato
export async function sendContact(form: FormData) {
  return apiFetch<{ ok: boolean; files?: any }>(`/contact`, { method: "POST", body: form });
}