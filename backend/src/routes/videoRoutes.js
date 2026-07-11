import express from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validateVideoCreate, checkValidation } from '../utils/validation.js';
import {
    createVideo,
    listVideos,
    getVideo,
    toggleLike,
    addComment
} from '../controllers/videoController.js';

const router = express.Router();

// Public routes
router.get('/', listVideos);
router.get('/:vid', getVideo);

// Protected routes (authenticated users)
router.post('/', authenticate, validateVideoCreate, checkValidation, createVideo);
router.post('/:vid/like', authenticate, toggleLike);
router.post('/:vid/comment', authenticate, addComment);

export default router;