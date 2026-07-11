import express from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
    createHackathon,
    listHackathons,
    getHackathon,
    joinHackathon,
    submitChallenge,
    getHackathonLeaderboard
} from '../controllers/hackathonController.js';

const router = express.Router();

// Public routes
router.get('/', listHackathons);
router.get('/:hid', getHackathon);
router.get('/:hid/leaderboard', getHackathonLeaderboard);

// Protected routes
router.post('/', authenticate, requireRoles('instructor', 'admin'), createHackathon);
router.post('/:hid/join', authenticate, joinHackathon);
router.post('/:hid/submit', authenticate, submitChallenge);

export default router;