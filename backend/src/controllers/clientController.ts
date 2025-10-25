import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listClients = async (_req: AuthenticatedRequest, res: Response) => {
  const clients = await prisma.client.findMany({ orderBy: { created_at: 'desc' } });
  return res.json(clients);
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  return res.json(client);
};

export const createClient = async (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, email, address, notes } = req.body as {
    name?: string; phone?: string; email?: string | null; address?: string | null; notes?: string | null;
  };
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

  // Captura arquivos do projeto, se enviados via multer
  const files = (req as any).files as Record<string, Array<Express.Multer.File>> | undefined;
  const project1 = files?.project1?.[0] || null;
  const project2 = files?.project2?.[0] || null;
  const project3 = files?.project3?.[0] || null;

  const client = await prisma.client.create({
    data: { name, phone, email, address, notes, created_by: req.userId! },
  });

  return res.status(201).json({
    ...client,
    files: {
      project1: project1 ? { filename: project1.filename, originalname: project1.originalname, size: project1.size } : null,
      project2: project2 ? { filename: project2.filename, originalname: project2.originalname, size: project2.size } : null,
      project3: project3 ? { filename: project3.filename, originalname: project3.originalname, size: project3.size } : null,
    },
  });
};

export const updateClient = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const { name, phone, email, address, notes } = req.body as {
    name?: string; phone?: string; email?: string | null; address?: string | null; notes?: string | null;
  };
  const client = await prisma.client.update({
    where: { id },
    data: { name, phone, email, address, notes },
  });
  return res.json(client);
};

export const deleteClient = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  await prisma.client.delete({ where: { id } });
  return res.status(204).send();
};