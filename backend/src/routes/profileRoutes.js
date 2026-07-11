import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getUserProfile,
    updateMe
} from '../controllers/profileController.js';

const router = express.Router();

// Public routes
router.get('/:uid', getUserProfile);

// Protected routes
router.patch('/me', authenticate, updateMe);

export default router;