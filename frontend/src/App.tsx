import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import ClientsListPage from "./pages/ClientsList";
import ClientNewPage from "./pages/ClientNew";
import ClientEditPage from "./pages/ClientEdit";
import ClientDetailPage from "./pages/ClientDetail";
import ContactPage from "./pages/Contact";

/**
 * Define rotas principais do app.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/clients" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/clients/new" element={<ClientNewPage />} />
          <Route path="/clients/:id/edit" element={<ClientEditPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/contato" element={<ContactPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
