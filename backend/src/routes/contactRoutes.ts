import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import { handleContact } from '../controllers/contactController';

const uploadDir = path.resolve(process.cwd(), 'uploads');
const upload = multer({ dest: uploadDir });

const router = Router();

router.post('/', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), handleContact);

export const contactRouter = router;