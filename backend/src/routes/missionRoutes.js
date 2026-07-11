import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    listMissions,
    getMission,
    submitMission,
    getLeaderboard
} from '../controllers/missionController.js';

const router = express.Router();

// All mission routes require authentication
router.use(authenticate);

router.get('/', listMissions);
router.get('/:mid', getMission);
router.post('/submit', submitMission);
router.get('/leaderboard', getLeaderboard);

export default router;