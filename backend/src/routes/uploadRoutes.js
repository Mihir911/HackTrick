import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// File upload (authenticated users only)
router.post('/', authenticate, uploadFile);

export default router;