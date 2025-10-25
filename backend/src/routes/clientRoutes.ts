import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import { authMiddleware } from '../middleware/auth';
import { createClient, deleteClient, getClientById, listClients, updateClient } from '../controllers/clientController';

const uploadDir = path.resolve(process.cwd(), 'uploads');
const upload = multer({ dest: uploadDir });

const router = Router();
router.use(authMiddleware);
router.get('/', listClients);
router.get('/:id', getClientById);
router.post('/',
  upload.fields([
    { name: 'project1', maxCount: 1 },
    { name: 'project2', maxCount: 1 },
    { name: 'project3', maxCount: 1 },
  ]),
  createClient,
);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export const clientRouter = router;