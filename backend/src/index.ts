import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { clientRouter } from './routes/clientRoutes';
import { contactRouter } from './routes/contactRoutes';
import fs from 'fs';
import path from 'path';

/**
 * Servidor Express com rotas de autenticação e CRUD de clientes.
 */
const app = express();
app.use(cors());
app.use(express.json());

// Garantir diretório de uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/clients', clientRouter);
app.use('/contact', contactRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});