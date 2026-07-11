import Mission from '../models/Mission.js';
import MissionSubmission from '../models/MissionSubmission.js';
import User from '../models/User.js';
import { generateId, nowIso } from '../utils/helpers.js';
import logger from '../utils/logger.js';


//list all mission (hides flags)
export const listMissions = async (req, res) => {
    try {
        const missions = await Mission.find({}, { flag: 0 })
            .sort({ order: 1 })
            .limit(100);

        // Get user's solved missions
        const submissions = await MissionSubmission.find({
            user_id: req.user.id,
            solved: true
        });

        const solvedIds = new Set(submissions.map(s => s.mission_id));

        // Add solved status
        const missionsWithStatus = missions.map(m => ({
            ...m.toJSON(),
            solved: solvedIds.has(m.id)
        }));

        res.json(missionsWithStatus);
    } catch (error) {
        logger.error(`List missions error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list missions' });
    }
};



//get single mission (hides flag)
export const getMission = async (req, res) => {
    try {
        const { mid } = req.params;

        const mission = await Mission.findOne({ id: mid }, { flag: 0 });
        if (!mission) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        // Check if solved
        const submission = await MissionSubmission.findOne({
            mission_id: mid,
            user_id: req.user.id,
            solved: true
        });

        res.json({
            ...mission.toJSON(),
            solved: !!submission
        });
    } catch (error) {
        logger.error(`Get mission error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get mission' });
    }
};

// submit mission flag
export const submitMission = async (req, res) => {
    try {
        const { mission_id, flag } = req.body;
        const userId = req.user.id;

        if (!flag) {
            return res.status(400).json({ error: 'Flag is required' });
        }

        const mission = await Mission.findOne({ id: mission_id }).select('+flag');
        if (!mission) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        // Check flag (case-insensitive)
        const isCorrect = flag.trim().toLowerCase() === mission.flag.trim().toLowerCase();

        // Check if already solved
        const alreadySolved = await MissionSubmission.findOne({
            mission_id,
            user_id: userId,
            solved: true
        });

        // Record submission
        const submission = new MissionSubmission({
            mission_id,
            user_id: userId,
            user_name: req.user.name,
            flag_submitted: flag,
            solved: isCorrect
        });
        await submission.save();

        let xpAwarded = 0;

        // Award XP if correct and not previously solved
        if (isCorrect && !alreadySolved) {
            xpAwarded = mission.xp || 100;

            // Update user XP
            const updatedUser = await User.findOneAndUpdate(
                { id: userId },
                { $inc: { xp: xpAwarded } },
                { new: true }
            );

            // Update rank based on new XP
            updatedUser.updateRank();
            await updatedUser.save();

            logger.info(`User ${userId} solved mission ${mission_id}, earned ${xpAwarded} XP`);
        }

        res.json({
            correct: isCorrect,
            xp_awarded: xpAwarded,
            message: isCorrect ? 'Flag captured!' : 'Incorrect flag. Try again.'
        });
    } catch (error) {
        logger.error(`Submit mission error: ${error.message}`);
        res.status(500).json({ error: 'Failed to submit mission' });
    }
};

//get mission leaderBoard (top 50 by xp)
export const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find(
            { role: { $in: ['student', 'researcher'] } },
            { password_hash: 0, _id: 0 }
        )
            .sort({ xp: -1 })
            .limit(50);

        res.json(users);
    } catch (error) {
        logger.error(`Leaderboard error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};


export default { listMissions, getMission, submitMission, getLeaderboard };