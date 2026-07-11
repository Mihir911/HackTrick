import Hackathon from '../models/Hackathon.js';
import HackathonSubmission from '../models/HackathonSubmission.js';
import User from '../models/User.js';
import { generateId, nowIso } from '../utils/helpers.js';
import { broadcastLeaderboard } from '../websocket/websocket.js';
import logger from '../utils/logger.js';

/**
 * Helper function to get hackathon leaderboard
 * (Internal use only)
 */
const getHackathonLeaderboardHelper = async (hid) => {
    const hackathon = await Hackathon.findOne({ id: hid });
    const participants = hackathon?.participants || [];

    const results = await HackathonSubmission.aggregate([
        { $match: { hackathon_id: hid, solved: true } },
        {
            $group: {
                _id: { user_id: '$user_id', challenge_id: '$challenge_id' },
                user_name: { $first: '$user_name' },
                points: { $max: '$points' }
            }
        },
        {
            $group: {
                _id: '$_id.user_id',
                user_name: { $first: '$user_name' },
                total_points: { $sum: '$points' },
                solves: { $sum: 1 }
            }
        },
        { $sort: { total_points: -1, solves: -1 } },
        { $limit: 100 }
    ]);

    const leaderboard = await Promise.all(results.map(async (r) => {
        const user = await User.findOne({ id: r._id });
        const participant = participants.find(p => p.user_id === r._id);

        return {
            user_id: r._id,
            user_name: r.user_name,
            total_points: r.total_points,
            solves: r.solves,
            mode: participant?.mode || 'online',
            rank_badge: user?.rank || 'Rookie'
        };
    }));

    return leaderboard;
};

/**
 * Create a new hackathon (Instructor/Admin only)
 */
export const createHackathon = async (req, res) => {
    try {
        const {
            title,
            description,
            start_time,
            end_time,
            challenges
        } = req.body;

        const hackathon = new Hackathon({
            creator_id: req.user.id,
            creator_name: req.user.name,
            title,
            description,
            start_time,
            end_time,
            challenges: challenges ? challenges.map(c => ({
                ...c,
                id: generateId()
            })) : [],
            participants: []
        });

        await hackathon.save();

        logger.info(`Hackathon created: ${hackathon.id} by ${req.user.id}`);
        res.status(201).json(hackathon);
    } catch (error) {
        logger.error(`Create hackathon error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create hackathon' });
    }
};

/**
 * List all hackathons
 */
export const listHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find({})
            .sort({ start_time: -1 })
            .limit(100);

        // Format response (hide flags, add participant count)
        const formatted = hackathons.map(h => {
            const obj = h.toJSON();
            obj.participant_count = h.participants.length;
            return obj;
        });

        res.json(formatted);
    } catch (error) {
        logger.error(`List hackathons error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list hackathons' });
    }
};

/**
 * Get single hackathon with leaderboard
 */
export const getHackathon = async (req, res) => {
    try {
        const { hid } = req.params;

        const hackathon = await Hackathon.findOne({ id: hid });
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        // Get leaderboard using helper function
        const leaderboard = await getHackathonLeaderboardHelper(hid);

        res.json({
            ...hackathon.toJSON(),
            leaderboard
        });
    } catch (error) {
        logger.error(`Get hackathon error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get hackathon' });
    }
};

/**
 * Join hackathon
 */
export const joinHackathon = async (req, res) => {
    try {
        const { hid } = req.params;
        const { mode } = req.query;

        const hackathon = await Hackathon.findOne({ id: hid });
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        const alreadyJoined = hackathon.participants.some(
            p => p.user_id === req.user.id
        );

        if (!alreadyJoined) {
            hackathon.participants.push({
                user_id: req.user.id,
                user_name: req.user.name,
                mode: mode || 'online',
                joined_at: new Date()
            });
            await hackathon.save();

            logger.info(`User ${req.user.id} joined hackathon ${hid}`);
        }

        res.json({ joined: true, mode: mode || 'online' });
    } catch (error) {
        logger.error(`Join hackathon error: ${error.message}`);
        res.status(500).json({ error: 'Failed to join hackathon' });
    }
};

/**
 * Submit hackathon challenge
 */
export const submitChallenge = async (req, res) => {
    try {
        const { hid } = req.params;
        const { challenge_id, flag } = req.body;
        const userId = req.user.id;

        if (!flag) {
            return res.status(400).json({ error: 'Flag is required' });
        }

        const hackathon = await Hackathon.findOne({ id: hid });
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        const challenge = hackathon.challenges.find(c => c.id === challenge_id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const isCorrect = flag.trim().toLowerCase() === challenge.flag.trim().toLowerCase();

        const alreadySolved = await HackathonSubmission.findOne({
            hackathon_id: hid,
            challenge_id,
            user_id: userId,
            solved: true
        });

        const points = isCorrect && !alreadySolved ? challenge.points || 100 : 0;

        const submission = new HackathonSubmission({
            hackathon_id: hid,
            challenge_id,
            user_id: userId,
            user_name: req.user.name,
            flag_submitted: flag,
            solved: isCorrect,
            points
        });
        await submission.save();

        // Broadcast leaderboard update if correct
        if (isCorrect && !alreadySolved) {
            const leaderboard = await getHackathonLeaderboardHelper(hid);
            await broadcastLeaderboard(hid, {
                user_name: req.user.name,
                challenge_title: challenge.title,
                points: points
            });

            logger.info(`User ${userId} solved challenge ${challenge_id} in hackathon ${hid}`);
        }

        res.json({
            correct: isCorrect,
            points_awarded: points
        });
    } catch (error) {
        logger.error(`Submit challenge error: ${error.message}`);
        res.status(500).json({ error: 'Failed to submit challenge' });
    }
};

/**
 * Get hackathon leaderboard (API endpoint)
 */
export const getHackathonLeaderboard = async (req, res) => {
    try {
        const { hid } = req.params;
        const leaderboard = await getHackathonLeaderboardHelper(hid);
        res.json(leaderboard);
    } catch (error) {
        logger.error(`Get hackathon leaderboard error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};

// Export all functions as default
export default {
    createHackathon,
    listHackathons,
    getHackathon,
    joinHackathon,
    submitChallenge,
    getHackathonLeaderboard
};