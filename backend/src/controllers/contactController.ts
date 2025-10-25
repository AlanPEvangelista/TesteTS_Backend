import type { Request, Response } from 'express';

export function handleContact(req: Request, res: Response) {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
  const files = (req as any).files as Record<string, Array<Express.Multer.File>> | undefined;

  // Simples validação
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios: name, email, message' });
  }

  const image1 = files?.image1?.[0];
  const image2 = files?.image2?.[0];

  // Aqui poderíamos persistir no banco/prisma ou enviar por email.
  // Por ora, apenas retornamos os metadados dos arquivos.
  return res.json({
    ok: true,
    files: {
      image1: image1 ? { filename: image1.filename, originalname: image1.originalname, size: image1.size } : null,
      image2: image2 ? { filename: image2.filename, originalname: image2.originalname, size: image2.size } : null,
    },
  });
}